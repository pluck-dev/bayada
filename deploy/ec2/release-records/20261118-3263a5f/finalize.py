from pathlib import Path
import json,subprocess,re,datetime
root=Path('/srv/bayada');state=json.loads((root/'platform-deployment.json').read_text())
if state['status']!='active' or state['commit']!='3263a5f6ad0953b9e275a5e2a450fcc856f1edad':raise RuntimeError('Unexpected active release')
config=json.loads(subprocess.check_output(['docker','exec','bayada-caddy-1','wget','-qO-','http://127.0.0.1:2019/config/']))
def dials(value):
 if isinstance(value,dict):
  for k,v in value.items():
   if k=='dial' and isinstance(v,str):yield v.split(':')[0]
   else:yield from dials(v)
 elif isinstance(value,list):
  for v in value:yield from dials(v)
upstreams=set(dials(config));active=set(state['containers'].values())
if not active.issubset(upstreams) or upstreams.intersection({'web','academy','admin'}):raise RuntimeError('Live Caddy routing does not match deployment')
previous=set(state.get('previousDeployment',{}).get('containers',{}).values());keep=active|previous
names=subprocess.check_output(['docker','ps','--format','{{.Names}}'],text=True).splitlines();stopped=[]
for name in names:
 obsolete=re.fullmatch(r'bayada-live-(31240ce|70c18c0|58f7591|bf88d81)-(web|academy|admin)',name) or name in ['bayada-web-1','bayada-academy-1','bayada-admin-1']
 if not obsolete or name in keep or name in upstreams:continue
 info=json.loads(subprocess.check_output(['docker','inspect',name]))[0]
 if any(v for v in (info['NetworkSettings'].get('Ports') or {}).values()):raise RuntimeError('Unexpected published ports on obsolete container')
 subprocess.run(['docker','stop',name],check=True,stdout=subprocess.DEVNULL);stopped.append(name)
qa=[]
for name in ['bayada-release-qa-web','bayada-release-qa-academy','bayada-release-qa-admin','bayada-functional-qa-db']:
 info=json.loads(subprocess.check_output(['docker','inspect',name]))[0]
 env=dict(x.split('=',1) for x in info['Config']['Env'] if '=' in x)
 if name.endswith('-db'):
  if env.get('POSTGRES_DB')!='bayada_functional_qa':raise RuntimeError('QA database name mismatch')
 elif '/bayada_functional_qa' not in env.get('DATABASE_URL',''):raise RuntimeError('QA app database mismatch')
 if info['State']['Running']:subprocess.run(['docker','stop',name],check=True,stdout=subprocess.DEVNULL)
 qa.append(name)
report={k:state[k] for k in ['commit','status','publicUrls','publicHealth','backupVerified','containers']}
report.update(finalizedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),runtimeUpstreamsVerified=True,previousContainersRetained=sorted(previous),stoppedObsoleteApps=stopped,stoppedQa=qa,imagesAndBackupsRetained=True,productionDbChanged=False)
(root/'releases/full-platform-20261118-3263a5f/finalization-state.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report),flush=True)
