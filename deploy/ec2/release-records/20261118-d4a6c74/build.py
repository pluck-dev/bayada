from pathlib import Path
import subprocess,tarfile,hashlib,json,time,datetime,os
root=Path('/srv/bayada')
release_root=root/'releases/full-platform-20261118-d4a6c74'
app=release_root/'app'
archive=root/'bayada-release-d4a6c74.tar.gz'
expected='78be057afe725d4805eda15c37f07f1ba780b76c7683d543b4bfda32b31f0ecf'
commit='d4a6c746c79d2ec741681158236ce12a6a9c64dc'
if hashlib.sha256(archive.read_bytes()).hexdigest()!=expected:raise RuntimeError('Source archive hash mismatch')
if app.exists():raise RuntimeError('Release already exists; inspect active build before retrying')
app.mkdir(parents=True)
with tarfile.open(archive,'r:gz') as bundle:
 for member in bundle.getmembers():
  target=(app/member.name).resolve()
  if not target.is_relative_to(app.resolve()) or member.issym() or member.islnk():raise RuntimeError('Unsafe archive entry')
 bundle.extractall(app,filter='data')
(app/'DEPLOYED_COMMIT').write_text(commit+'\n')
values={}
for line in (root/'app/deploy/ec2/.env').read_text().splitlines():
 if line and not line.startswith('#') and '=' in line:
  key,value=line.split('=',1);values[key]=value.strip().strip('"').strip("'")
state={'commit':commit,'archiveSha256':expected,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'building','apps':{}}
def save():
 (release_root/'build-status.json').write_text(json.dumps(state,indent=2))
save()
previous_app=root/'releases/full-platform-20261118-bf88d81/app'
def scope_files(base,scope):
 target=base/scope
 if target.is_file():return {scope:hashlib.sha256(target.read_bytes()).hexdigest()}
 return {str(f.relative_to(base)):hashlib.sha256(f.read_bytes()).hexdigest() for f in target.rglob('*') if f.is_file() and 'tests' not in f.relative_to(target).parts}
unchanged=['apps/web','apps/admin','packages','Dockerfile','.dockerignore','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','turbo.json']
for scope in unchanged:
 if scope_files(previous_app,scope)!=scope_files(app,scope):raise RuntimeError('Cannot reuse image: runtime input differs '+scope)
state['reuseVerifiedScopes']=unchanged;save()
try:
 for name in ['web','academy','admin']:
  active=json.loads((root/'platform-deployment.json').read_text())
  if active['status']!='active' or active['commit']!='bf88d81c5bc277e3028e15eb720e43098c3687a9':raise RuntimeError('Active release changed; inspect before building')
  old=json.loads(subprocess.check_output(['docker','inspect',active['containers'][name]]))[0]['Image']
  tag=json.loads(subprocess.check_output(['docker','image','inspect','bayada-'+name+':prod']))[0]['Id']
  if old!=tag:raise RuntimeError('Running image changed; abort before building')
  rollback='bayada-'+name+':before-full-d4a6c74'
  subprocess.run(['docker','tag','bayada-'+name+':prod',rollback],check=True)
  state['apps'][name]={'previousImage':old,'rollbackTag':rollback,'status':'building'};save()
  if name!='academy':
   subprocess.run(['docker','tag','bayada-'+name+':prod','bayada-'+name+':release-d4a6c74'],check=True)
   state['apps'][name].update(status='built',image=old,reusedFromCommit='bf88d81c5bc277e3028e15eb720e43098c3687a9');save()
   print(name+' verified unchanged runtime image reused',flush=True)
   continue
  host=values['WEB_HOST' if name=='web' else 'ACADEMY_HOST']
  common=['docker','build','--build-arg','APP='+name,'--build-arg','NEXT_PUBLIC_SITE_URL=https://'+host]
  with (release_root/('build-'+name+'.log')).open('w') as log:
   os.chmod(log.name,0o600)
   if name in ['web','academy']:
    subprocess.run(common+['--target','build','-t','bayada-build:'+name+'-d4a6c74','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
   subprocess.run(common+['--target','runner','-t','bayada-'+name+':release-d4a6c74','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
  image=json.loads(subprocess.check_output(['docker','image','inspect','bayada-'+name+':release-d4a6c74']))[0]['Id']
  state['apps'][name].update(status='built',image=image);save()
  print(name+' image built',flush=True)
 state['status']='built';state['finishedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
 print('All release images built. Existing services unchanged.',flush=True)
except Exception:
 state['status']='failed';save();print('Build failed; existing services unchanged. Inspect release build logs on AWS.',flush=True);raise
