#!/usr/bin/env python3
"""Publish a committed Korea branch at its own host; never replace live app containers.

Run from an extracted commit on EC2. Preview DBs contain public source fixtures only.
This is an explicit deployment command, not a GitHub push listener.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import time
import urllib.error
import urllib.request
import urllib.parse


def run(*args, input=None, capture=False, env=None):
    return subprocess.run(args, input=input, text=True, check=True, env=env,
                          stdout=subprocess.PIPE if capture else None).stdout


def sql(database, statement):
    return run('docker', 'exec', '-i', 'bayada-db-1', 'psql', '-X', '-v', 'ON_ERROR_STOP=1',
               '-U', 'postgres', '-d', database, '-At', input=statement, capture=True).strip()


def literal(value):
    if '\x00' in value:
        raise ValueError('Null bytes are not SQL text')
    return "'" + value.replace("'", "''") + "'"


def identity(branch, commit, host):
    if not branch or len(branch) > 120 or any(ord(c) < 32 for c in branch):
        raise ValueError('Invalid branch label')
    if not re.fullmatch('[a-f0-9]{40}', commit):
        raise ValueError('A full commit hash is needed')
    if not re.fullmatch(r'[a-z0-9](?:[a-z0-9-]{0,45}[a-z0-9])?\.korea\.54-116-157-4\.sslip\.io', host):
        raise ValueError('Use a named preview host under the existing Korea preview domain')
    key = hashlib.sha256(branch.encode()).hexdigest()[:12]
    return key, 'bayada_preview_' + key, 'bayada_pr_' + key


def atomic(path, value, private=False):
    temp = path.with_suffix('.partial')
    temp.write_text(json.dumps(value, indent=2) + '\n')
    if private:
        temp.chmod(0o600)
    temp.replace(path)


def fixture_sql(app):
    posts = json.loads((app / 'packages/korea/content/boards.json').read_text())
    statements = []
    for post in posts:
        if not re.fullmatch(r'bayadab_0[1235]', post['board']) or not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', post['id']):
            raise ValueError('Unexpected public fixture namespace')
        slug = 'korea/post/' + post['board'] + '/' + post['id']
        values = [hashlib.sha256(slug.encode()).hexdigest(), slug, post['title'], json.dumps(post)]
        statements.append('INSERT INTO "Page" (id,slug,title,content,"updatedAt") VALUES (' +
                          ','.join(literal(x) for x in values) + ',CURRENT_TIMESTAMP) ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,"updatedAt"=CURRENT_TIMESTAMP;')
    return '\n'.join(statements), len(posts)


def public_status(url, expected):
    for attempt in range(12):
        try:
            with urllib.request.urlopen(url, timeout=15) as response:
                status = response.status
        except urllib.error.HTTPError as error:
            status = error.code
        except (TimeoutError, OSError):
            status = 0
        if status == expected:
            return status
        time.sleep(2)
    raise RuntimeError(f'Health failed {url}: {status}')


def main():
    parser = argparse.ArgumentParser()
    for name in ['branch', 'commit', 'host', 'expected-active']:
        parser.add_argument('--' + name, required=True)
    parser.add_argument('--phase', required=True, choices=['prepare', 'activate'])
    args = parser.parse_args()
    key, database, role = identity(args.branch, args.commit, args.host)
    app = Path(__file__).resolve().parents[2]
    release = app.parent
    live = json.loads(Path('/srv/bayada/platform-deployment.json').read_text())
    if live['commit'] != args.expected_active:
        raise RuntimeError('Production changed; review its current routing first')
    caddy = 'bayada-caddy-1'
    info = json.loads(run('docker', 'inspect', caddy, capture=True))[0]
    source = Path(next(m['Source'] for m in info['Mounts'] if m['Destination'] == '/etc/caddy/Caddyfile'))
    active = run('docker', 'exec', caddy, 'wget', '-qO-', 'http://127.0.0.1:2019/config/', capture=True)
    if any(name + ':3000' not in active for name in live['containers'].values()):
        raise RuntimeError('Production routing differs from its manifest')
    root = Path('/srv/bayada/previews') / key
    root.mkdir(parents=True, mode=0o700, exist_ok=True)
    state_file = root / 'state.json'
    previous = json.loads(state_file.read_text()) if state_file.exists() else None
    if previous and (previous['branch'] != args.branch or previous['host'] != args.host):
        raise RuntimeError('Preview identity differs from earlier deployment')
    for other in root.parent.glob('*/state.json'):
        record = json.loads(other.read_text())
        if record['host'] == args.host and record['branch'] != args.branch:
            raise RuntimeError('Host already belongs to another branch')
    short = args.commit[:8]
    name = f'bayada-preview-{key}-{short}'
    tag = f'bayada-korea:preview-{key}-{short}'
    candidate_file = release / 'preview-deployment.json'
    remote_config = '/tmp/preview-' + key + '-' + short
    os.chdir(app)
    if args.phase == 'prepare':
        stat = os.statvfs('/srv/bayada')
        if stat.f_bavail * stat.f_frsize < 6 * 1024**3:
            raise RuntimeError('Less than 6 GiB free; retain rollback artifacts and review storage')
        if candidate_file.exists():
            raise RuntimeError('Candidate is already prepared')
        private_file = root / 'runtime.json'
        if not private_file.exists():
            exists = sql('postgres', f'SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname={literal(role)}) OR EXISTS(SELECT 1 FROM pg_database WHERE datname={literal(database)});')
            if exists != 'f':
                raise RuntimeError('Unowned preview role/database already exists')
            password = secrets.token_hex(32)
            sql('postgres', f'CREATE ROLE {role} LOGIN NOINHERIT PASSWORD {literal(password)}; CREATE DATABASE {database}; ALTER ROLE {role} SET default_transaction_read_only=on;')
            atomic(private_file, {'databaseUrl': f'postgresql://{role}:{password}@bayada-db-1:5432/{database}'}, private=True)
        runtime = json.loads(private_file.read_text())
        sql(database, '''CREATE TABLE IF NOT EXISTS "Page" (id text PRIMARY KEY,slug text UNIQUE NOT NULL,title text NOT NULL,content text NOT NULL,"updatedAt" timestamp(3) NOT NULL);
CREATE TABLE IF NOT EXISTS "SiteSetting" (key text PRIMARY KEY,value jsonb NOT NULL,"updatedAt" timestamp(3) NOT NULL);''')
        fixtures, count = fixture_sql(app)
        sql(database, fixtures)
        sql(database, '''INSERT INTO "SiteSetting" (key,value,"updatedAt") VALUES ('korea.inquiry.settings','{"enabled":false,"consultationRecipients":[],"careersRecipients":[]}',CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO ''' + role + '; GRANT SELECT ON "Page","SiteSetting" TO ' + role + ';')
        permission = sql(database, f"SELECT has_table_privilege('{role}','public.\"Page\"','SELECT') AND NOT has_table_privilege('{role}','public.\"Page\"','INSERT,UPDATE,DELETE') AND NOT has_table_privilege('{role}','public.\"SiteSetting\"','INSERT,UPDATE,DELETE');")
        if permission != 't' or sql('bayada', f"SELECT has_table_privilege('{role}','public.\"Page\"','SELECT');") != 'f':
            raise RuntimeError('Preview role is not isolated and read-only')
        run('docker', 'build', '--build-arg', 'APP=korea', '-t', tag, '.')
        assets = Path('/srv/bayada/korea-static/assets').resolve(strict=True)
        if '/srv/bayada/releases/' not in str(assets):
            raise RuntimeError('Approved public asset mount was not found')
        env = {'DATABASE_URL': runtime['databaseUrl'], 'DIRECT_URL': runtime['databaseUrl'],
               'KOREA_PREVIEW_BRANCH': args.branch, 'PORT': '3000', 'HOSTNAME': '0.0.0.0'}
        command = ['docker','run','-d','--name',name,'--restart','unless-stopped','--network','bayada_default',
                   '--memory','384m','--cpus','0.75','--pids-limit','128','-v',str(assets)+':/app/apps/korea/public/assets:ro']
        for k in env:
            command += ['-e', k]
        run(*command, tag, env=dict(os.environ, **env), capture=True)
        probe = 'Promise.all([fetch("http://127.0.0.1:3000/"),fetch("http://127.0.0.1:3000/api/inquiries",{method:"POST"})]).then(async r=>{if(r[0].status!==200||r[1].status!==409||!(await r[0].text()).includes("korea-preview-notice"))process.exit(1)}).catch(()=>process.exit(1))'
        for attempt in range(20):
            ready = subprocess.run(['docker','exec',name,'node','-e',probe],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            if ready.returncode == 0:
                break
            time.sleep(2)
        else:
            raise RuntimeError('Preview startup or write-block check failed')
        before = source.read_text()
        marker = '# BEGIN KOREA PREVIEW ' + key
        pattern = re.escape(marker) + r'\n[\s\S]*?# END KOREA PREVIEW ' + key + r'\n?'
        candidate = re.sub(pattern, '', before).rstrip() + '\n\n'
        candidate += f'''{marker}
{args.host} {{
 encode zstd gzip
 header X-Robots-Tag "noindex, nofollow, noarchive"
 header Cache-Control "no-store"
 @intake path /api/inquiries
 handle @intake {{
  header Content-Type application/json
  respond `{{"message":"브랜치 미리보기에서는 실제 상담을 접수하지 않습니다."}}` 409
 }}
 handle {{
  reverse_proxy {name}:3000
 }}
}}
# END KOREA PREVIEW {key}
'''
        for kind, text in [('previous', before), ('candidate', candidate)]:
            file = release / ('Caddyfile.preview.' + kind)
            file.write_text(text)
            run('docker','cp',str(file),caddy+':'+remote_config+'-'+kind)
        run('docker','exec',caddy,'caddy','validate','--config',remote_config+'-candidate','--adapter','caddyfile')
        atomic(candidate_file, dict(branch=args.branch,commit=args.commit,host=args.host,container=name,
                                   database=database,role=role,publicPosts=count,status='prepared',preparedAt=time.time(),
                                   priorConfigSha256=hashlib.sha256(before.encode()).hexdigest(),previous=previous))
        print(json.dumps({'status':'prepared','host':args.host,'publicPosts':count,'readOnlyVerified':True}))
        return
    state = json.loads(candidate_file.read_text())
    if any(state[k] != value for k,value in [('status','prepared'),('branch',args.branch),('commit',args.commit),('host',args.host)]):
        raise RuntimeError('Candidate identity differs')
    if hashlib.sha256(source.read_bytes()).hexdigest() != state['priorConfigSha256']:
        raise RuntimeError('Routing changed since preparation; do not overwrite it')
    try:
        run('docker','exec',caddy,'caddy','reload','--config',remote_config+'-candidate','--adapter','caddyfile')
        checks = {}
        for key_name in ['korea','admin','web','academy']:
            path = '/ko/auth/login' if key_name == 'admin' else '/ko' if key_name in ['web','academy'] else '/'
            url = live['publicUrls'][key_name] + path
            checks[url] = public_status(url,200)
        for path in ['/','/aboutus/','/서비스상담/','/공지사항2/','/renewal.css','/fonts/FigtreeVariable.woff2','/api/inquiries']:
            address = 'https://' + args.host + urllib.parse.quote(path)
            checks[address] = public_status(address,409 if path == '/api/inquiries' else 200)
        source.write_text((release/'Caddyfile.preview.candidate').read_text())
        state.update(status='active',activatedAt=time.time(),health=checks,release=str(app),url='https://'+args.host)
        atomic(candidate_file,state)
        atomic(state_file,state)
        print(json.dumps({'status':'active','url':state['url'],'health':checks}))
    except Exception:
        run('docker','exec',caddy,'caddy','reload','--config',remote_config+'-previous','--adapter','caddyfile')
        source.write_text((release/'Caddyfile.preview.previous').read_text())
        raise


if __name__ == '__main__':
    main()
