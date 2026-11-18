from pathlib import Path
import subprocess,tarfile,hashlib,json,time,datetime,os
root=Path('/srv/bayada')
release_root=root/'releases/full-platform-20261118-31240ce'
app=release_root/'app'
archive=root/'bayada-release-31240ce.tar.gz'
expected='675f13a5b868ec8da5b9cf4758558a410b49a3f7208f27385b4048bf3b22b244'
commit='31240cec3a03a592ce79838911fc55ecd7ce660b'
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
  rollback='bayada-'+name+':before-full-31240ce'
  subprocess.run(['docker','tag','bayada-'+name+':prod',rollback],check=True)
  state['apps'][name]={'previousImage':old,'rollbackTag':rollback,'status':'building'};save()
  if name!='academy':
   original=json.loads((root/'releases/full-platform-20261118-d742828/build-status.json').read_text())
   prior=original['apps'][name]
   if original['status']!='built' or prior['status']!='built':raise RuntimeError('Prior image build not complete')
   old_tag='bayada-'+name+':release-d742828'
   image=json.loads(subprocess.check_output(['docker','image','inspect',old_tag]))[0]['Id']
   if image!=prior['image']:raise RuntimeError('Prior image digest changed')
   subprocess.run(['docker','tag',old_tag,'bayada-'+name+':release-31240ce'],check=True)
   state['apps'][name].update(status='built',image=image,buildCommit=original['commit'],reusedUnchangedApp=True);save()
   print(name+' verified unchanged image reused',flush=True)
   continue
  host=values['WEB_HOST' if name=='web' else 'ACADEMY_HOST']
  common=['docker','build','--build-arg','APP='+name,'--build-arg','NEXT_PUBLIC_SITE_URL=https://'+host]
  with (release_root/('build-'+name+'.log')).open('w') as log:
   os.chmod(log.name,0o600)
   if name=='web':
    subprocess.run(common+['--target','build','-t','bayada-build:web-31240ce','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
   subprocess.run(common+['--target','runner','-t','bayada-'+name+':release-31240ce','.'],cwd=app,stdout=log,stderr=subprocess.STDOUT,check=True)
  image=json.loads(subprocess.check_output(['docker','image','inspect','bayada-'+name+':release-31240ce']))[0]['Id']
  state['apps'][name].update(status='built',image=image,buildCommit=commit);save()
  print(name+' image built',flush=True)
 state['status']='built';state['finishedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
 print('All release images built. Existing services unchanged.',flush=True)
except Exception:
 state['status']='failed';save();print('Build failed; existing services unchanged. Inspect release build logs on AWS.',flush=True);raise
