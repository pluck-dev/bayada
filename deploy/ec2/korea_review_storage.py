"""Provision review-only storage. Never grant writes to CMS/operational tables."""
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess


def sql(database, text):
    return subprocess.check_output(['docker','exec','-i','bayada-db-1','psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d',database,'-At'],input=text,text=True).strip()


def ensure_review_storage(database, root, live):
    if database != 'bayada_korea_reviews' and not re.fullmatch(r'bayada_preview_[a-f0-9]{12}', database):
        raise ValueError('Review storage cannot be provisioned in an operational database')
    root=Path(root);root.mkdir(parents=True,mode=0o700,exist_ok=True)
    file=root/'runtime.json';config=json.loads(file.read_text()) if file.exists() else {}
    exists=sql('postgres',f"SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname='{database}');")=='t'
    if not exists:
        if database!='bayada_korea_reviews':raise RuntimeError('Preview database must already exist')
        sql('postgres',f'CREATE DATABASE {database};')
    elif database=='bayada_korea_reviews' and not config:
        raise RuntimeError('Existing review database has no owned runtime configuration')
    role='bayada_rv_'+hashlib.sha256(database.encode()).hexdigest()[:12]
    if not config.get('reviewDatabaseUrl'):
        if sql('postgres',f"SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='{role}');")!='f':
            raise RuntimeError('Unowned reviewer role already exists')
        password=secrets.token_hex(32)
        sql('postgres',f"CREATE ROLE {role} LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 5 PASSWORD '{password}';")
        config['reviewDatabaseUrl']=f'postgresql://{role}:{password}@bayada-db-1:5432/{database}?connection_limit=3'
    if not config.get('reviewAccessPassword'):
        info=json.loads(subprocess.check_output(['docker','inspect',live['containers']['web']],text=True))[0]
        env=dict(x.split('=',1) for x in info['Config']['Env'])
        if not env.get('REVIEW_ACCESS_PASSWORD'):raise RuntimeError('The existing review access password is not configured')
        config['reviewAccessPassword']=env['REVIEW_ACCESS_PASSWORD']
    config.setdefault('reviewAccessSecret',secrets.token_hex(32))
    sql(database,Path(__file__).with_name('review-schema.sql').read_text(encoding='utf-8-sig'))
    sql(database,f'''REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO {role};
GRANT SELECT,INSERT,UPDATE ON "ReviewFeedback","ReviewFeedbackReply" TO {role};
GRANT USAGE,SELECT ON SEQUENCE "ReviewFeedback_id_seq","ReviewFeedbackReply_id_seq" TO {role};''')
    safe=sql(database,f'''SELECT has_table_privilege('{role}','public."ReviewFeedback"','SELECT') AND has_table_privilege('{role}','public."ReviewFeedback"','INSERT') AND NOT has_table_privilege('{role}','public."ReviewFeedback"','DELETE');''')
    if safe!='t' or sql('bayada',f'''SELECT has_table_privilege('{role}','public."Page"','SELECT,INSERT,UPDATE,DELETE') OR has_table_privilege('{role}','public."ReviewFeedback"','SELECT,INSERT,UPDATE,DELETE');''')!='f':
        raise RuntimeError('Review role permissions are not isolated')
    if sql(database,'''SELECT to_regclass('public."Page"') IS NOT NULL;''')=='t' and sql(database,f'''SELECT has_table_privilege('{role}','public."Page"','SELECT,INSERT,UPDATE,DELETE');''')!='f':
        raise RuntimeError('Reviewer role must not access CMS pages')
    temp=file.with_suffix('.partial');temp.write_text(json.dumps(config)+'\n');os.chmod(temp,0o600);temp.replace(file)
    operations=Path('/srv/bayada/operations');operations.mkdir(mode=0o700,exist_ok=True)
    backup=operations/'backup-korea-reviews.py';shutil.copyfile(Path(__file__).with_name('backup-korea-reviews.py'),backup);backup.chmod(0o700)
    logs=Path('/srv/bayada/backups/reviews');logs.mkdir(mode=0o700,parents=True,exist_ok=True)
    previous=subprocess.run(['crontab','-l'],text=True,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
    if previous.returncode not in [0,1]:raise RuntimeError('Could not read existing backup schedule')
    lines=[line for line in previous.stdout.splitlines() if not line.endswith('# bayada-korea-review-backup')]
    lines.append('25 5 * * * /usr/bin/python3 /srv/bayada/operations/backup-korea-reviews.py >> /srv/bayada/backups/reviews/backup.log 2>&1 # bayada-korea-review-backup')
    subprocess.run(['crontab','-'],input='\n'.join(lines)+'\n',text=True,check=True)
    subprocess.run(['/usr/bin/python3',str(backup)],check=True)
    return dict(REVIEW_DATABASE_URL=config['reviewDatabaseUrl'],REVIEW_ACCESS_PASSWORD=config['reviewAccessPassword'],REVIEW_ACCESS_SECRET=config['reviewAccessSecret'])
