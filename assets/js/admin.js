import {API_BASE} from './backend-config.js';
const api=API_BASE.replace(/\/$/,'');
const login=document.querySelector('#admin-login'),keyInput=document.querySelector('#access-key'),desk=document.querySelector('#admin-desk'),status=document.querySelector('#admin-status'),list=document.querySelector('#inquiry-list'),filter=document.querySelector('#status-filter'),more=document.querySelector('#load-more');
let key='',cursor=null,timer,epoch=0,loading=false;const pending=new Set();
const configured=/^https:\/\/[^/]+(?:\/[^?#]*)?$/.test(api);
function announce(message){status.textContent=message;}
function logout(message='Signed out. Your access key and inquiry data have been cleared from this page.'){
 epoch++;key='';clearTimeout(timer);pending.forEach(c=>c.abort());pending.clear();list.replaceChildren();keyInput.value='';desk.hidden=true;login.hidden=false;cursor=null;more.hidden=true;loading=false;announce(message);
}
function activity(){clearTimeout(timer);timer=setTimeout(()=>logout('Signed out after 15 minutes without an admin action.'),15*60*1000);}
async function call(path,options={}){
 const current=epoch;const controller=new AbortController();pending.add(controller);const timeout=setTimeout(()=>controller.abort(),15000);activity();
 try{const response=await fetch(api+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},credentials:'omit',signal:controller.signal});const result=await response.json();if(current!==epoch)throw Error('Session ended.');if(response.status===401){logout('Access key was not accepted. Please sign in again.');throw Error('Access key was not accepted.');}if(!response.ok)throw Error(result.error||'Unable to complete the request.');return result;}
 finally{clearTimeout(timeout);pending.delete(controller);}
}
function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function render(item){
 const card=element('article',undefined,'inquiry-card');const header=element('header');header.append(element('h2',item.name),element('span',new Date(item.created_at).toLocaleString(),'inquiry-meta'));card.append(header);
 const email=element('a',item.email);email.href='mailto:'+encodeURIComponent(item.email)+'?subject='+encodeURIComponent('Your project inquiry');card.append(email,element('p','Budget: '+item.budget,'inquiry-meta'),element('p',item.message));
 const actions=element('div',undefined,'inquiry-actions');const label=element('label','Status '),select=element('select');select.setAttribute('aria-label','Status for '+item.name);
 for(const value of ['new','contacted','completed']){const option=element('option',value[0].toUpperCase()+value.slice(1));option.value=value;select.append(option);}select.value=item.status;label.append(select);
 const save=element('button','Save status','admin-button');save.type='button';const remove=element('button','Delete inquiry','admin-button danger');remove.type='button';
 save.addEventListener('click',async()=>{save.disabled=true;remove.disabled=true;try{await call('/api/admin/inquiries/'+item.id,{method:'PATCH',body:JSON.stringify({status:select.value})});item.status=select.value;announce('Status saved.');if(filter.value&&filter.value!==item.status)card.remove();}catch(error){announce(error.name==='AbortError'?'Request interrupted. Refresh to check the saved status.':error.message);select.value=item.status;}finally{save.disabled=false;remove.disabled=false;}});
 remove.addEventListener('click',async()=>{if(!window.confirm('Permanently delete the inquiry from '+item.name+'? This cannot be undone.'))return;save.disabled=true;remove.disabled=true;try{await call('/api/admin/inquiries/'+item.id,{method:'DELETE'});card.remove();announce('Inquiry deleted.');}catch(error){announce(error.name==='AbortError'?'Request interrupted. Refresh to check whether deletion completed.':error.message);}finally{save.disabled=false;remove.disabled=false;}});
 actions.append(label,save,remove);card.append(actions);return card;
}
async function load(append=false){
 if(loading)return;loading=true;more.disabled=true;filter.disabled=true;document.querySelector('#refresh').disabled=true;
 try{const params=new URLSearchParams();if(filter.value)params.set('status',filter.value);if(append&&cursor)params.set('after',cursor);const data=await call('/api/admin/inquiries?'+params);if(!append)list.replaceChildren();data.inquiries.forEach(item=>list.append(render(item)));cursor=data.next;more.hidden=!cursor;announce(list.children.length?list.children.length+' inquiries shown.':'No inquiries in this view yet.');}
 finally{loading=false;more.disabled=false;filter.disabled=false;document.querySelector('#refresh').disabled=false;}
}
login.addEventListener('submit',async event=>{event.preventDefault();key=keyInput.value.trim();if(key.length<32)return;login.querySelector('button').disabled=true;announce('Opening your inquiry desk…');try{await load();login.hidden=true;desk.hidden=false;keyInput.value='';}catch(error){logout(error.name==='AbortError'?'Connection timed out. Please try again.':error.message);}finally{login.querySelector('button').disabled=false;}});
document.querySelector('#logout').addEventListener('click',()=>logout());
document.querySelector('#refresh').addEventListener('click',()=>load().catch(e=>announce(e.message)));
filter.addEventListener('change',()=>load().catch(e=>announce(e.message)));
more.addEventListener('click',()=>load(true).catch(e=>announce(e.message)));
window.addEventListener('pagehide',()=>logout());
if(configured){keyInput.disabled=false;login.querySelector('button').disabled=false;announce('Sign in with your private access key.');}else announce('The backend is not connected yet. Follow BACKEND-SETUP.md in your repository before signing in.');
