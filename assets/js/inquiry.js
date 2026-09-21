import {API_BASE, TURNSTILE_SITE_KEY} from './backend-config.js';
const form=document.querySelector('#inquiry-form');
const status=document.querySelector('#inquiry-status');
const fields=form.querySelector('fieldset');
const button=form.querySelector('button[type="submit"]');
let widget,token='',requestId=crypto.randomUUID(),lastPayload='';
const api=API_BASE.replace(/\/$/,'');
const configured=/^https:\/\/[^/]+(?:\/[^?#]*)?$/.test(api)&&TURNSTILE_SITE_KEY;
async function request(url,options={}){const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000),credentials:'omit'});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to send right now.');return data;}
function message(value){status.textContent=value;}
function resetChallenge(){token='';button.disabled=true;if(widget!==undefined&&window.turnstile)window.turnstile.reset(widget);}
async function initialize(){
 if(!configured)return;
 try{
  message('Checking availability…');const health=await request(api+'/api/health');if(!health.ready)throw Error();
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Verification took too long to load. Please reload or use email.')),20000);
   window.onInquiryVerificationReady=()=>{clearTimeout(timeout);resolve();};
   const script=document.createElement('script');script.async=true;script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onInquiryVerificationReady';
   script.onerror=()=>{clearTimeout(timeout);reject(Error('Verification could not load. Please reload or use email.'));};document.head.append(script);
  });
   widget=window.turnstile.render('#inquiry-verification',{sitekey:TURNSTILE_SITE_KEY,action:'inquiry',theme:'light',size:'flexible',callback:value=>{token=value;button.disabled=false;},'expired-callback':resetChallenge,'error-callback':()=>{token='';button.disabled=true;message('Verification could not load. Please use email or reload.');}});
   fields.disabled=false;message('Tell me about your project. All fields marked * are required.');
 }catch(error){console.error('Inquiry initialization failed:',error);message(error.message||'The inquiry form is unavailable. Please use the email or WhatsApp link above.');}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!configured||!token||!form.reportValidity())return;
 const values=new FormData(form);const payload={name:values.get('name'),email:values.get('email'),budget:values.get('budget'),message:values.get('message'),website:values.get('website'),consent:values.get('consent')==='on'};
 const signature=JSON.stringify(payload);if(lastPayload&&lastPayload!==signature)requestId=crypto.randomUUID();lastPayload=signature;
 fields.disabled=true;button.disabled=true;message('Sending your inquiry…');
 try{const result=await request(api+'/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId,turnstileToken:token})});if(result.saved!==true)throw Error('The inquiry was not confirmed. Please try again.');form.reset();requestId=crypto.randomUUID();lastPayload='';message('Your inquiry was saved. Thank you — I can reply using the email you provided.');}
 catch(error){message(error.name==='TimeoutError'?'No confirmation received. Please retry; the same inquiry will not be duplicated.':error.message||'Unable to send. Please use email.');}
 finally{fields.disabled=false;resetChallenge();}
});
initialize();
