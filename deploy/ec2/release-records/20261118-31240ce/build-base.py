from pathlib import Path
import subprocess,tarfile,hashlib,json,time,datetime,os
root=Path('/srv/bayada')
release_root=root/'releases/full-platform-20261118-d742828'
app=release_root/'app'
archive=root/'bayada-release-d742828.tar.gz'
expected='a8f7f44ee3d4775ca00f31269c8391e514daf668db5ad5246e6012fe9a5740c5'
commit='d74282813acc4a32096ee8c774cd6689b28c468d'
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
try:
 for name in ['web','academy','admin']:
  old=json.loads(subprocess.check_output(['docker','inspect','bayada-'+name+'-1']))[0]['Image']
  tag=json.loads(subprocess.check_output(['docker','image','inspect','bayada-'+name+':prod']))[0]['Id']
  if old!=tag:raise RuntimeError('Running image changed; abort before building')
  rollback='bayada-'+name+':before-full-d742828'
  subprocess.run(['docker','tag','bayada-'+name+':prod',rollback],check=True)
  state['apps'][name]={'previousImage':old,'rollbackTag':rollback,'status':'building'};save()
  host=values['WEB_HOST' if name=='web' else 'ACADEMY_HOST']
  common=['docker','build','--build-arg','APP='+name,'--build-arg','NEXT_PUBLIC_SITE_URL=https://'+host]
  with (release_root/('build-'+name+'.log')).open('w') as log:
   os.chmod(log.name,0o600)
   if name=='web':
    subprocess.run(common+['--target','build','-t','bayada-build:web-d742828','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
   subprocess.run(common+['--target','runner','-t','bayada-'+name+':release-d742828','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
  image=json.loads(subprocess.check_output(['docker','image','inspect','bayada-'+name+':release-d742828']))[0]['Id']
  state['apps'][name].update(status='built',image=image);save()
  print(name+' image built',flush=True)
 state['status']='built';state['finishedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
 print('All release images built. Existing services unchanged.',flush=True)
except Exception:
 state['status']='failed';save();print('Build failed; existing services unchanged. Inspect release build logs on AWS.',flush=True);raise
