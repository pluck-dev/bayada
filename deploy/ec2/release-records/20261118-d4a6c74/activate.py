from pathlib import Path
import subprocess,json,time,urllib.request,urllib.error,datetime
root=Path('/srv/bayada'); release_root=root/'releases/full-platform-20261118-d4a6c74'; state_path=release_root/'rollout-state.json'
state=json.loads(state_path.read_text())
if state['status'] not in ['prepared','rolled_back']:raise RuntimeError('Release is not prepared; inspect current routing before retrying')
active=Path(state['caddySource']); before=Path(state['previousCaddy']).read_text(); candidate=Path(state['candidateCaddy']).read_text()
if active.read_text()!=before:raise RuntimeError('Active proxy configuration changed; no switch performed')
# Drop DB-free build cache before switching any public request to the new web app.
code="fetch('http://127.0.0.1:3000/api/revalidate',{method:'POST',headers:{'x-revalidate-secret':process.env.WEB_REVALIDATE_SECRET}}).then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"
subprocess.run(['docker','exec',state['containers']['web'],'node','-e',code],check=True)
def reload_proxy(config_file):
 result=subprocess.run(['docker','exec','bayada-caddy-1','caddy','reload','--config',config_file],capture_output=True,text=True)
 (release_root/'caddy-reload.log').write_text(result.stdout+result.stderr)
 if result.returncode:raise RuntimeError('Caddy reload failed')
def status(url):
 try:
  with urllib.request.urlopen(url,timeout=8) as response:return response.status
 except urllib.error.HTTPError as error:return error.code
checks={'web':[('/ko',200),('/ko/what-we-do',200),('/ko/shop',404),('/ko/auth/login',404),('/ko/membership',404),('/api/auth/session',404)],'academy':[('/ko',200),('/api/v1/orders',401),('/api/media/verify',403)],'admin':[('/ko/auth/login',200),('/api/project-workspace',401),('/api/project-workspace/document',401),('/api/v1/organizations',401)]}
switched=False
try:
 active.write_text(candidate);reload_proxy('/tmp/bayada-d4a6c74.Caddyfile');switched=True
 verified={}
 for app,paths in checks.items():
  for path,expected in paths:
   actual=status(state['publicUrls'][app]+path)
   if actual!=expected:raise RuntimeError('Public health mismatch '+app+path+' '+str(actual))
   verified[app+path]=actual
 # Finalize only after all public probes pass. Old containers remain available for immediate rollback.
 for app in ['web','academy','admin']:
  subprocess.run(['docker','tag','bayada-'+app+':release-d4a6c74','bayada-'+app+':prod'],check=True)
 current=root/'current'
 if current.is_symlink():current.unlink()
 elif current.exists():raise RuntimeError('Unexpected current release path')
 current.symlink_to(Path(state['release']))
 state.update(status='active',switchedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),publicHealth=verified,oldContainersRetained=True)
 state_path.write_text(json.dumps(state,indent=2));(root/'platform-deployment.json').write_text(json.dumps(state,indent=2))
 print(json.dumps({'status':'active','commit':state['commit'],'publicChecksPassed':len(verified),'oldContainersRetained':True,'backupVerified':state['backupVerified'],'publicUrls':state['publicUrls']}),flush=True)
except Exception:
 active.write_text(before)
 subprocess.run(['docker','cp',state['previousCaddy'],'bayada-caddy-1:/tmp/bayada-d4a6c74.rollback.Caddyfile'],check=True)
 reload_proxy('/tmp/bayada-d4a6c74.rollback.Caddyfile')
 state['status']='rolled_back';state_path.write_text(json.dumps(state,indent=2))
 print('Previous public routing restored; old apps and all data retained.',flush=True)
 raise
