#!/usr/bin/env python3
"""Add Korea and replace admin; retain the live brand/academy and rollback targets.

Run on EC2 from an extracted, committed release with a public-assets.tar.gz bundle.
The existing admin environment is inherited in memory; credentials are never logged.
"""
from korea_review_storage import ensure_review_storage
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import time
import urllib.request
import urllib.error


def run(*args, capture=False):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE if capture else None).stdout


def inspect(name):
    return json.loads(run('docker', 'inspect', name, capture=True))[0]


def atomic(path, value):
    temp = path.with_suffix(path.suffix + '.partial')
    temp.write_text(json.dumps(value, indent=2) + '\n')
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--commit', required=True)
    parser.add_argument('--expected-active', required=True)
    parser.add_argument('--phase', choices=['prepare', 'activate'], required=True)
    parser.add_argument('--skip-content-import', action='store_true', help='Asset/code-only release; verify the earlier import marker instead')
    parser.add_argument('--admin-only', action='store_true', help='Replace only admin and preserve all public-site containers and assets')
    parser.add_argument('--korea-only', action='store_true', help='Replace Korea only, retaining approved assets and enabling isolated reviewer storage')
    args = parser.parse_args()
    if args.korea_only and (args.admin_only or not args.skip_content_import):
        parser.error('--korea-only needs --skip-content-import and excludes --admin-only')
    if args.admin_only and not args.skip_content_import:
        parser.error('--admin-only needs --skip-content-import')
    services = ['admin'] if args.admin_only else ['korea'] if args.korea_only else ['korea', 'admin']
    if not re.fullmatch(r'[a-f0-9]{40}', args.commit):
        raise ValueError('Use a full commit hash')
    app = Path(__file__).resolve().parents[2]
    release = app.parent
    os.chdir(app)
    manifest_path = Path('/srv/bayada/platform-deployment.json')
    previous = json.loads(manifest_path.read_text())
    if previous['commit'] != args.expected_active:
        raise RuntimeError('Active deployment changed; review before continuing')
    short = args.commit[:8]
    names = {a: f'bayada-live-{short}-{a}' for a in services}
    state_path = release / 'korea-deployment.json'
    old_admin = previous['containers']['admin']
    admin = inspect(old_admin)
    environment = dict(entry.split('=', 1) for entry in admin['Config']['Env'])
    if 'DATABASE_URL' not in environment:
        raise RuntimeError('Existing admin database is unavailable')
    host = 'korea.54-116-157-4.sslip.io'
    url = 'https://' + host
    caddy_name = 'bayada-caddy-1'
    caddy = inspect(caddy_name)
    active_config = run('docker', 'exec', caddy_name, 'wget', '-qO-', 'http://127.0.0.1:2019/config/', capture=True)
    if any(name + ':3000' not in active_config for name in previous['containers'].values()):
        raise RuntimeError('Live routing differs from the deployment manifest')
    source = Path(next(m['Source'] for m in caddy['Mounts'] if m['Destination'] == '/etc/caddy/Caddyfile'))
    media = Path('/srv/bayada/korea-media')
    static = Path('/srv/bayada/korea-static').resolve(strict=True) if args.korea_only else release / 'korea-static'
    if args.phase == 'prepare':
        if os.statvfs('/srv/bayada').f_bavail * os.statvfs('/srv/bayada').f_frsize < 7 * 1024**3:
            raise RuntimeError('Less than 7 GiB available for retained build and rollback artifacts')
        if state_path.exists():
            raise RuntimeError('This release was already prepared')
        if any(inspect_name in run('docker', 'ps', '-a', '--format', '{{.Names}}', capture=True).splitlines() for inspect_name in names.values()):
            raise RuntimeError('Candidate container name already exists')
        expected = {}
        if not args.admin_only and not args.korea_only:
            static.mkdir()
            bundle = release / 'public-assets.tar.gz'
            approved = json.loads((app / 'packages/korea/content/assets-manifest.json').read_text())
            entries = approved if isinstance(approved, list) else approved['assets']
            # Only manifest-listed public frontend assets, never SQL or private submissions.
            expected = {x['path'].lstrip('/'): x for x in entries}
            with tarfile.open(bundle) as archive:
                for member in archive.getmembers():
                    if not member.isfile() or member.name not in expected or '..' in Path(member.name).parts:
                        raise RuntimeError('Unexpected static asset in bundle: ' + member.name)
                    data = archive.extractfile(member).read()
                    if hashlib.sha256(data).hexdigest() != expected[member.name]['sha256']:
                        raise RuntimeError('Static checksum mismatch: ' + member.name)
                    target = static / member.name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(data)
            for name in expected:
                if not (static / name).is_file():
                    raise RuntimeError('Missing static asset: ' + name)
        media.mkdir(mode=0o750, exist_ok=True)
        os.chown(media, 1000, 1000)
        for service in services:
            run('docker', 'build', '--build-arg', 'APP=' + service, '--build-arg', 'NEXT_PUBLIC_SITE_URL=' + previous['publicUrls']['academy'], '-t', f'bayada-{service}:release-{short}', '.')
        if not args.skip_content_import:
            run('docker', 'build', '--target', 'build', '--build-arg', 'APP=korea', '-t', 'bayada-korea-import:' + short, '.')
        backup = Path('/srv/bayada/backups') / ('bayada-pre-korea-' + short + '.dump')
        with backup.open('xb') as handle:
            os.chmod(backup, 0o600)
            subprocess.run(['docker', 'exec', 'bayada-db-1', 'pg_dump', '-U', 'postgres', '-Fc', 'bayada'], stdout=handle, check=True)
        subprocess.run(['docker', 'exec', '-i', 'bayada-db-1', 'pg_restore', '--list'], stdin=backup.open('rb'), stdout=subprocess.DEVNULL, check=True)
        # Use environment inheritance instead of placing credentials in arguments/files.
        if args.skip_content_import:
            marker = run('docker', 'exec', 'bayada-db-1', 'psql', '-U', 'postgres', '-d', 'bayada', '-Atc', 'SELECT EXISTS (SELECT 1 FROM "SiteSetting" WHERE key=\'korea.wordpress.public-content.v1\')', capture=True)
            if marker.strip() != 't': raise RuntimeError('Public content was not previously imported')
        else:
            import_env = dict(os.environ, DATABASE_URL=environment['DATABASE_URL'], DIRECT_URL=environment['DATABASE_URL'])
            subprocess.run(['docker', 'run', '--rm', '--network', 'bayada_default', '-e', 'DATABASE_URL', '-e', 'DIRECT_URL', 'bayada-korea-import:' + short, 'pnpm', '--filter', '@bayada/korea', 'exec', 'tsx', 'src/import.ts'], env=import_env, check=True)
        review_env = ensure_review_storage('bayada_korea_reviews', Path('/srv/bayada/review/korea'), previous) if args.korea_only else {}
        for service in services:
            env = dict(environment) if service == 'admin' else {k: environment[k] for k in ['DATABASE_URL', 'SMTP_URL', 'MAIL_FROM', 'ADMIN_PUBLIC_URL'] if k in environment}
            env.update(DIRECT_URL=environment['DATABASE_URL'], KOREA_MEDIA_DIR='/korea-media', HOSTNAME='0.0.0.0', PORT='3000')
            if service == 'admin':
                env.update(KOREA_PUBLIC_URL=url, WEB_URL='http://' + previous['containers']['web'] + ':3000')
            else:
                env.update(review_env)
                env['ADMIN_PUBLIC_URL'] = previous['publicUrls']['admin']
            command = ['docker', 'run', '-d', '--name', names[service], '--restart', 'unless-stopped', '--network', 'bayada_default', '-v', str(media) + ':/korea-media' + (':ro' if service == 'korea' else '')]
            if service == 'admin':
                command += ['-v', '/srv/bayada/legacy-private:/legacy-private:ro']
            else:
                for directory in ['assets']:
                    command += ['-v', str(static / directory) + ':/app/apps/korea/public/' + directory + ':ro']
            for key in env:
                command += ['-e', key]
            command += [f'bayada-{service}:release-{short}']
            subprocess.run(command, env=dict(os.environ, **env), check=True, stdout=subprocess.DEVNULL)
        for service, path in [(s, '/' if s == 'korea' else '/ko/auth/login') for s in services]:
            for attempt in range(30):
                test = subprocess.run(['docker', 'exec', names[service], 'node', '-e', f'fetch("http://127.0.0.1:3000{path}").then(r=>process.exit(r.status===200?0:1))'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                if test.returncode == 0:
                    break
                time.sleep(2)
            else:
                raise RuntimeError(service + ' candidate is unhealthy')
        before = source.read_text()
        needle = 'reverse_proxy ' + old_admin + ':3000'
        if before.count(needle) != 1:
            raise RuntimeError('Unexpected existing admin route')
        candidate = before if args.korea_only else before.replace(needle, 'reverse_proxy ' + names['admin'] + ':3000')
        if args.admin_only:
            pass
        elif previous['containers'].get('korea'):
            old_route = 'reverse_proxy ' + previous['containers']['korea'] + ':3000'
            if candidate.count(old_route) != 1: raise RuntimeError('Unexpected Korea route')
            candidate = candidate.replace(old_route, 'reverse_proxy ' + names['korea'] + ':3000')
        else:
            candidate += '\n' + host + ' {\n encode zstd gzip\n header X-Robots-Tag "noindex, nofollow"\n reverse_proxy ' + names['korea'] + ':3000\n}\n'
        (release / 'Caddyfile.previous').write_text(before)
        (release / 'Caddyfile.candidate').write_text(candidate)
        for kind in ['previous', 'candidate']:
            run('docker', 'cp', str(release / ('Caddyfile.' + kind)), caddy_name + ':/tmp/korea-' + short + '-' + kind)
        run('docker', 'exec', caddy_name, 'caddy', 'validate', '--config', '/tmp/korea-' + short + '-candidate', '--adapter', 'caddyfile')
        atomic(state_path, dict(commit=args.commit, preparedAt=time.time(), containers=names, adminOnly=args.admin_only, koreaOnly=args.korea_only, backup=str(backup), backupVerified=True, staticAssets=len(expected), publicUrl=url, previousCommit=previous['commit'], status='prepared'))
        print(json.dumps({'status': 'prepared', 'containers': names, 'staticAssets': len(expected)}))
        return
    state = json.loads(state_path.read_text())
    if state['status'] != 'prepared' or state['commit'] != args.commit or state.get('adminOnly', False) != args.admin_only or state.get('koreaOnly', False) != args.korea_only:
        raise RuntimeError('Candidate was not prepared')
    try:
        run('docker', 'exec', caddy_name, 'caddy', 'reload', '--config', '/tmp/korea-' + short + '-candidate', '--adapter', 'caddyfile')
        health = {}
        targets = [(url + '/', 200), (url + '/wp-admin/', 404), (url + '/api/inquiries', 405), (previous['publicUrls']['admin'] + '/ko/auth/login', 200), (previous['publicUrls']['admin'] + '/api/project-workspace', 401), (previous['publicUrls']['web'] + '/ko', 200), (previous['publicUrls']['academy'] + '/ko', 200)]
        for address, expected_status in targets:
            for attempt in range(20):
                try:
                    request = urllib.request.Request(address, headers={'User-Agent': 'BAYADA-deployment-check'})
                    with urllib.request.urlopen(request, timeout=15) as response:
                        status = response.status
                except urllib.error.HTTPError as error:
                    status = error.code
                except (OSError, TimeoutError):
                    status = 0
                if status == expected_status:
                    break
                time.sleep(3)
            if status != expected_status:
                raise RuntimeError(f'Public health failed {address}: {status}')
            health[address] = status
        source.write_text((release / 'Caddyfile.candidate').read_text())
        current = Path('/srv/bayada/current')
        temp_link = Path('/srv/bayada/current-korea-next')
        temp_link.symlink_to(app)
        temp_link.replace(current)
        result = dict(previous, commit=args.commit, release=str(app), previousDeployment=previous, containers=dict(previous['containers'], **names), publicUrls=dict(previous['publicUrls'], korea=url), status='active', switchedAt=time.time(), publicHealth=health, backup=state['backup'], backupVerified=True, appCommits={'web': previous.get('appCommits', {}).get('web', previous['commit']), 'academy': previous.get('appCommits', {}).get('academy', previous['commit']), 'korea': previous.get('appCommits', {}).get('korea', previous['commit']) if args.admin_only else args.commit, 'admin': previous.get('appCommits', {}).get('admin', previous['commit']) if args.korea_only else args.commit}, caddySource=str(source), previousCaddy=str(release / 'Caddyfile.previous'), candidateCaddy=str(release / 'Caddyfile.candidate'))
        atomic(manifest_path, result)
        state.update(status='active', publicHealth=health, activatedAt=time.time())
        atomic(state_path, state)
        print(json.dumps({'status': 'active', 'publicHealth': health}))
    except Exception:
        run('docker', 'exec', caddy_name, 'caddy', 'reload', '--config', '/tmp/korea-' + short + '-previous', '--adapter', 'caddyfile')
        source.write_text((release / 'Caddyfile.previous').read_text())
        raise


if __name__ == '__main__':
    main()
