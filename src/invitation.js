import { CONFIG, invitationUrl } from './config.js';
import { invitationMarkup } from './markup.js';
import { icon, hydrateArt } from './art.js';
import { validate, request } from './api.js';
import { storage } from './storage.js';
import { renderTicket, validTicket } from './ticket.js';
import { startAudio, toggleAudio, isMusicEnabled, sound } from './audio.js';
import { initMotion, stampTicket } from './motion.js';
export async function renderInvitation(app) {
 const e=CONFIG.EVENT,to=new URLSearchParams(location.search).get('to')?.trim().slice(0,60)||'';
 let ticket=storage.get('djsl-ticket');if(!validTicket(ticket))ticket=null;
 if(!app.querySelector('#invitation'))app.innerHTML=invitationMarkup();
 const $=s=>document.querySelector(s),form=$('#reservation-form'),name=$('#guest-name'),count=$('#guest-count'),submit=$('#submit-reservation'),status=$('#reservation-status'),host=$('#ticket-host');
 if(to){$('#recipient').hidden=false;$('#recipient').textContent=`Untuk ${to}`;$('#arrival-guest').textContent=to;name.value=to;}
 const updateMusic=()=>{const playing=isMusicEnabled();$('#music-toggle').innerHTML=icon(playing?'music-on':'music-off');$('#music-toggle').setAttribute('aria-label',playing?'Matikan musik':'Nyalakan musik');$('#closing-music').textContent=playing?'Matikan musik':'Nyalakan musik';};
 $('#music-toggle').onclick=toggleAudio;$('#closing-music').onclick=toggleAudio;document.addEventListener('musicchange',updateMusic);
 let touchedName=false,touchedCount=false,busy=false;
 function validity(){
   const n=name.value.trim(),g=Number(count.value),error=validate(n,g),nameError=validate(n,1),countError=validate('ok',g);
   $('#name-error').textContent=touchedName?nameError:'';$('#count-error').textContent=touchedCount?countError:'';
   name.setAttribute('aria-invalid',String(touchedName&&!!nameError));count.setAttribute('aria-invalid',String(touchedCount&&!!countError));
   submit.disabled=!!error||busy;$('#minus').disabled=g<=1;$('#plus').disabled=g>=CONFIG.MAX_GUESTS;return !error;
 }
 name.addEventListener('input',()=>{touchedName=true;validity();});name.addEventListener('blur',()=>{touchedName=true;validity();});
 count.addEventListener('input',()=>{touchedCount=true;validity();});
 for(const [id,delta] of [['minus',-1],['plus',1]])$('#'+id).onclick=()=>{count.value=Math.max(1,Math.min(CONFIG.MAX_GUESTS,(Number(count.value)||1)+delta));touchedCount=true;validity();sound('tick');};
 const edit=()=>{host.hidden=true;form.hidden=false;$('.reservation-intro').hidden=false;name.value=ticket.name;count.value=ticket.guests;$('#recall-ticket').hidden=false;status.textContent='';validity();name.focus();};
 const showTicket=async()=>{if(!ticket)return;form.hidden=true;$('.reservation-intro').hidden=true;$('#recall-ticket').hidden=true;await renderTicket(host,ticket,edit);};
 $('#recall-ticket').onclick=showTicket;
 if(ticket){name.value=ticket.name;count.value=ticket.guests;$('#recall-ticket').hidden=false;}
 form.addEventListener('submit',async event=>{
   event.preventDefault();touchedName=touchedCount=true;if(busy||!validity())return;
   busy=true;validity();submit.textContent='Mengirim…';status.textContent='';
   try{const result=await request('reserve',{name:name.value.trim(),guests:Number(count.value),website:$('#website').value});if(!validTicket(result.reservation))throw new Error('Invalid ticket');ticket=result.reservation;storage.set('djsl-ticket',ticket);status.textContent=result.updated?'Reservasi diperbarui.':'Kursimu sudah dicatat.';await showTicket();sound('success');stampTicket();}
   catch{status.textContent='Gagal mengirim. Periksa koneksi lalu coba lagi.';}
   finally{busy=false;submit.textContent='Kirim Reservasi';validity();}
 });
 validity();
 function tick(){const delta=Math.max(0,new Date(e.start).getTime()-Date.now());if(delta===0){$('#countdown-digits').hidden=true;$('#countdown-arrived').hidden=false;return;}const s=Math.floor(delta/1000),values=[Math.floor(s/86400),Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60];values.forEach((v,i)=>{const d=$(`[data-digit="${i}"]`),text=String(v).padStart(2,'0');if(d.textContent!==text){d.textContent=text;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&$('#countdown').classList.contains('is-visible'))d.animate([{transform:'translateY(-12px)',opacity:.3},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'ease-out'});}});}
 tick();setInterval(tick,1000);
 $('#share').onclick=async()=>{const data={title:e.title,text:'Undangan pernikahan Achmad Bifari & Syafira Aulia · Sabtu, 31 Oktober 2026',url:invitationUrl()};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text}\n${data.url}`);$('#share-status').textContent='Tautan disalin.';}}catch(error){if(error.name!=='AbortError')$('#share-status').textContent='Gagal membagikan. Coba lagi.';}};
 await hydrateArt();const journey=initMotion();
 $('#nav-next').onclick=()=>{void startAudio();void journey.next();};
 $('#nav-back').onclick=()=>journey.back();
 if(document.modelContext?.registerTool){try{await document.modelContext.registerTool({name:'stage_reservation',title:'Siapkan reservasi',description:'Fill the reservation form for review. Does not submit or reserve a seat.',inputSchema:{type:'object',properties:{name:{type:'string',minLength:2,maxLength:60},guests:{type:'integer',minimum:1,maximum:CONFIG.MAX_GUESTS}},required:['name','guests'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(typeof input?.name!=='string'||typeof input?.guests!=='number'||validate(input.name,input.guests))throw new Error('Invalid reservation');if(ticket)edit();name.value=input.name.trim();count.value=input.guests;touchedName=touchedCount=true;validity();await journey.goTo('reservation');return {staged:true,name:name.value,guests:Number(count.value),submitted:false};}});}catch{}}
}
