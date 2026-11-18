from pathlib import Path
import json,subprocess,datetime,os,time
root=Path('/srv/bayada'); release_root=root/'releases/full-platform-20261118-d4a6c74'; app=release_root/'app'
state_path=release_root/'rollout-state.json'
if state_path.exists():raise RuntimeError('Rollout state exists; inspect current containers before retrying.')
build=json.loads((release_root/'build-status.json').read_text())
if build['status']!='built':raise RuntimeError('Build incomplete')
compose=['docker','compose','-p','bayada','-f',str(app/'deploy/ec2/docker-compose.yml'),'--env-file',str(root/'app/deploy/ec2/.env')]
config=json.loads(subprocess.check_output(compose+['config','--format','json']))
previous=json.loads((root/'platform-deployment.json').read_text())
if previous['commit']!='bf88d81c5bc277e3028e15eb720e43098c3687a9':raise RuntimeError('Unexpected active release')
state={'commit':build['commit'],'status':'preparing','release':str(app),'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'containers':{},'health':{}}
def save():state_path.write_text(json.dumps(state,indent=2))
state['previousDeployment']=previous
save()
backup=root/'backups'/('bayada-pre-platform-d4a6c74-'+str(int(time.time()))+'.dump')
with backup.open('wb') as f:subprocess.run(['docker','exec','bayada-db-1','pg_dump','-U','postgres','-d','bayada','-Fc'],stdout=f,check=True)
os.chmod(backup,0o600)
with backup.open('rb') as f:subprocess.run(['docker','exec','-i','bayada-db-1','pg_restore','--list'],stdin=f,stdout=subprocess.DEVNULL,check=True)
state['backup']=str(backup);state['backupVerified']=True;save()
def env_file(path,values):
 fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:
  for key,value in values.items():
   value=str(value)
   if '\n' in value or '\r' in value:raise RuntimeError('Multiline runtime environment unsupported')
   f.write(key+'='+value+'\n')
web_env=config['services']['web']['environment']
import_env=release_root/'.import.env';env_file(import_env,{key:web_env[key] for key in ['DATABASE_URL','DIRECT_URL']})
result=subprocess.run(['docker','run','--rm','--network','bayada_default','--env-file',str(import_env),'bayada-build:web-bf88d81','pnpm','--filter','@bayada/db','exec','tsx','scripts/import-web-services.ts'],capture_output=True,text=True)
(release_root/'service-import.log').write_text(result.stdout+result.stderr);os.chmod(release_root/'service-import.log',0o600)
if result.returncode:raise RuntimeError('Service content import failed; inspect AWS-only log')
state['serviceImportCompleted']=True;save()
for name in ['web','academy','admin']:
 container='bayada-live-d4a6c74-'+name
 if subprocess.run(['docker','container','inspect',container],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0:raise RuntimeError('Live candidate already exists; inspect it')
 values=dict(config['services'][name]['environment'])
 if name=='admin':values['WEB_URL']='http://bayada-live-d4a6c74-web:3000'
 path=release_root/('.live-'+name+'.env');env_file(path,values)
 command=['docker','run','-d','--restart','unless-stopped','--name',container,'--network','bayada_default','--env-file',str(path)]
 if name=='admin':command+=['-v','/srv/bayada/legacy-private:/legacy-private:ro']
 command+=['bayada-'+name+':release-d4a6c74']
 subprocess.run(command,stdout=subprocess.DEVNULL,check=True)
 state['containers'][name]=container;save()
 print(name+' live candidate started; old service still active',flush=True)
# Internal HTTP checks do not create any customer or business records.
checks={'web':[('/ko',200),('/ko/shop',404),('/ko/auth/login',404),('/api/auth/session',404)],'academy':[('/ko',200),('/api/v1/orders',401)],'admin':[('/ko/auth/login',200),('/api/project-workspace',401),('/api/project-workspace/document',401)]}
for name,paths in checks.items():
 for path,expected in paths:
  code="fetch('http://127.0.0.1:3000"+path+"',{redirect:'manual'}).then(r=>{console.log(r.status);process.exit(r.status==="+str(expected)+"?0:1)}).catch(()=>process.exit(1))"
  good=False
  for attempt in range(25):
   result=subprocess.run(['docker','exec',state['containers'][name],'node','-e',code],capture_output=True,text=True)
   if result.returncode==0:good=True;break
   time.sleep(1)
  if not good:raise RuntimeError(name+' candidate failed health check '+path)
  state['health'][name+path]=expected;save()
caddy=json.loads(subprocess.check_output(['docker','inspect','bayada-caddy-1']))[0]
caddy_source=Path(next(m['Source'] for m in caddy['Mounts'] if m['Destination']=='/etc/caddy/Caddyfile'))
original=caddy_source.read_text();candidate=original
for name in ['web','academy','admin']:
 old='reverse_proxy '+previous['containers'][name]+':3000';new='reverse_proxy '+state['containers'][name]+':3000'
 if candidate.count(old)!=1:raise RuntimeError('Unexpected active proxy config for '+name)
 candidate=candidate.replace(old,new)
old='forward_auth '+previous['containers']['academy']+':3000'
if candidate.count(old)!=1:raise RuntimeError('Unexpected media auth proxy config')
candidate=candidate.replace(old,'forward_auth '+state['containers']['academy']+':3000')
candidate_path=release_root/'Caddyfile.candidate';candidate_path.write_text(candidate)
subprocess.run(['docker','cp',str(candidate_path),'bayada-caddy-1:/tmp/bayada-d4a6c74.Caddyfile'],check=True)
result=subprocess.run(['docker','exec','bayada-caddy-1','caddy','validate','--config','/tmp/bayada-d4a6c74.Caddyfile'],capture_output=True,text=True)
(release_root/'caddy-validation.log').write_text(result.stdout+result.stderr)
if result.returncode:raise RuntimeError('Candidate Caddy configuration invalid; no switch made')
prior=root/'backups/Caddyfile-pre-d4a6c74'
with prior.open('x') as f:f.write(original)
state.update(status='prepared',caddySource=str(caddy_source),previousCaddy=str(prior),candidateCaddy=str(candidate_path),publicUrls={'web':'https://'+web_env['NEXTAUTH_URL'].split('://',1)[-1].rstrip('/'),'academy':config['services']['academy']['environment']['NEXTAUTH_URL'],'admin':config['services']['admin']['environment']['NEXTAUTH_URL']})
save();print('Candidates and routing validated. Existing public routing is unchanged.',flush=True)
