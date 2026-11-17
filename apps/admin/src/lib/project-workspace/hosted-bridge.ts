export const HOSTED_BRIDGE = String.raw`
const workspaceServer=JSON.parse(document.getElementById('workspace-server').textContent);
let savingToServer=false,serverConflict=false,pendingRemote=null,pollBusy=false;
const serverUser=workspaceServer.user;
function stableStringify(value){
 if(Array.isArray(value))return '['+value.map(stableStringify).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b,'en')).map(([key,item])=>JSON.stringify(key)+':'+stableStringify(item)).join(',')+'}';
 return JSON.stringify(value);
}
function snapshotToken(){return stableStringify(payload());}
function load(){state=validateState(embedded);locked=false;}
function assertWritable(){
 if(locked)throw Error('서버 연결과 로그인 상태를 확인하세요.');
 if(savingToServer)throw Error('이전 변경을 저장하고 있습니다.');
 if(serverConflict)throw Error('최신 변경을 확인한 뒤 항목을 다시 열어 주세요.');
}
function connectionLabel(message){
 const el=document.getElementById('connectionStatus');if(el)el.textContent=message;
}
async function getServerState(){
 const response=await fetch('/api/project-workspace',{cache:'no-store',credentials:'same-origin'});
 const data=await response.json();
 if(!response.ok)throw Error(data.error||'서버에 연결할 수 없습니다.');
 return validateState(data.state);
}
async function postServerState(body){
 const serialized=JSON.stringify(body);
 for(let attempt=0;attempt<2;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch('/api/project-workspace',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:serialized,signal:controller.signal});
   const data=await response.json();
   if(!response.ok){const error=Error(data.error||'저장에 실패했습니다.');error.status=response.status;throw error;}
   return validateState(data.state);
  }catch(error){if(error.status||attempt===1)throw error;}
  finally{clearTimeout(timer);}
 }
}
async function mutate(kind,target,before,after,actor,reason,apply){
 assertWritable();
 const next=clone(state),baseRevision=state.revision;
 apply(next);next.revision++;
 next.events.push({id:uid(),at:new Date().toISOString(),actor:serverUser.name,reason,kind,target,before:clone(before),after:clone(after)});
 validateState(next);savingToServer=true;
 document.body.classList.add('server-saving');connectionLabel('저장 중');
 try{
  state=await postServerState({operation:'save',baseRevision,state:next});
  selected.clear();pendingRemote=null;locked=false;render();connectionLabel('공동 저장 r'+state.revision);toast('서버에 저장했습니다.');
 }catch(error){
  if(error.status===409){
   try{state=await getServerState();}catch{}
   serverConflict=dialog.open;render();
   document.getElementById('saveDialog').disabled=serverConflict;
   connectionLabel('다른 참여자 변경');
   throw Error('다른 참여자가 먼저 저장했습니다. 입력 내용을 확인·복사한 뒤 창을 닫고 항목을 다시 열어 주세요.');
  }
  connectionLabel('저장 확인 필요');
  throw error;
 }finally{savingToServer=false;document.body.classList.remove('server-saving');}
}
function showDialog(title,body,context){
 serverConflict=false;document.getElementById('saveDialog').disabled=false;
 localShowDialog(title,body,context);
 const author=form.elements.namedItem('actor');if(author){author.value=serverUser.name;author.readOnly=true;}
 if(context.type==='approval'){
  const party=form.elements.namedItem('party');party.innerHTML=options([serverUser.party],serverUser.party);
 }
}
async function exportHtml(){
 try{
  const response=await fetch('/api/project-workspace/document?download=1',{cache:'no-store'});
  if(!response.ok)throw Error('저장본을 내려받을 수 없습니다.');
  const filename=response.headers.get('x-workspace-filename')||'BAYADA-project-workspace.html';
  download(filename,await response.text(),'text/html;charset=utf-8');
 }catch(error){toast(error.message);}
}
async function importFile(file){
 try{
  if(!serverUser.isAdmin)throw Error('이전 문서 가져오기는 최고 관리자만 할 수 있습니다.');
  if(!file)return;
  const envelope=JSON.parse(await file.text()),{sha256,...payload}=envelope;
  if(payload.format!=='BAYADA-CONTRACT-REVIEW'||payload.schema!==1||payload.projectId!==projectId)throw Error('이 프로젝트의 JSON 백업이 아닙니다.');
  const data=payload.state;
  if(sha256!==await hash(JSON.stringify(payload)))throw Error('백업 체크섬이 일치하지 않습니다.');
  validateState(data);savingToServer=true;document.body.classList.add('server-saving');
  state=await postServerState({operation:'import',baseRevision:state.revision,state:data});
  selected.clear();render();toast('이전 로컬 기록을 서버 문서로 가져왔습니다.');
 }catch(error){toast(error.message);}
 finally{savingToServer=false;document.body.classList.remove('server-saving');document.getElementById('importFile').value='';}
}
function startWorkspaceSync(){
 connectionLabel('공동 저장 r'+state.revision);
 if(!serverUser.isAdmin)document.getElementById('importJson').hidden=true;
 document.getElementById('tabs').addEventListener('click',()=>parent.postMessage({type:'project-workspace-tab',tab:active},location.origin));
 dialog.addEventListener('close',()=>{
  serverConflict=false;document.getElementById('saveDialog').disabled=false;
  if(pendingRemote&&pendingRemote.revision>state.revision){state=pendingRemote;selected.clear();render();}
  pendingRemote=null;
 });
 const poll=async()=>{
  if(pollBusy||savingToServer||document.hidden)return;
  pollBusy=true;
  try{
   const response=await fetch('/api/project-workspace',{cache:'no-store',headers:{'If-None-Match':'"workspace-'+state.revision+'"'}});
   if(response.status===304){locked=false;connectionLabel('공동 저장 r'+state.revision);return;}
   if(!response.ok){if(response.status===401||response.status===403){locked=true;connectionLabel('로그인 확인 필요');}else connectionLabel('연결 확인 필요');return;}
   const data=await response.json(),next=validateState(data.state);
   if(next.revision>state.revision){
    if(dialog.open){pendingRemote=next;connectionLabel('다른 참여자 변경 · 창을 닫으면 반영');}
    else{state=next;selected.clear();locked=false;render();connectionLabel('공동 저장 r'+state.revision);}
   }
  }catch{connectionLabel('연결 확인 필요');}
  finally{pollBusy=false;}
 };
 setInterval(poll,4000);window.addEventListener('focus',poll);
}
`;
