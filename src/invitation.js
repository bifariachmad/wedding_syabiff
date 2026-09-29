
import {updateSummary} from './summary.js';
import { CONFIG, invitationUrl } from './config.js';
import { invitationMarkup } from './markup.js';
import { icon, hydrateArt } from './art.js';
import { validate, request, normalizeName } from './api.js';
import { storage } from './storage.js';
import { renderTicket, validTicket } from './ticket.js';
import { startAudio, toggleAudio, isMusicEnabled, sound } from './audio.js';
import { initMotion, stampTicket } from './motion.js';
export async function renderInvitation(app) {
 const e=CONFIG.EVENT,to=new URLSearchParams(location.search).get('to')?.trim().slice(0,60)||'';
 const demoMode=!CONFIG.APPS_SCRIPT_URL;let ticket=storage.get(demoMode?'djsl-demo-ticket':'djsl-ticket');if(!validTicket(ticket)||Boolean(ticket.demo)!==demoMode||(to&&normalizeName(ticket.name)!==normalizeName(to)))ticket=null;
 if(!app.querySelector('#invitation'))app.innerHTML=invitationMarkup();
 const $=s=>document.querySelector(s),form=$('#reservation-form'),name=$('#guest-name'),count=$('#guest-count'),submit=$('#submit-reservation'),status=$('#reservation-status'),host=$('#ticket-host');
 if(to){$('#recipient').hidden=false;$('#recipient').textContent=`Untuk ${to}`;$('#arrival-guest').textContent=to;name.value=to;}
 const updateMusic=()=>{const playing=isMusicEnabled();$('#music-toggle').innerHTML=icon(playing?'music-on':'music-off');$('#music-toggle').setAttribute('aria-label',playing?'Matikan musik':'Nyalakan musik');};
 $('#music-toggle').onclick=toggleAudio;document.addEventListener('musicchange',updateMusic);
 let touchedName=false,touchedCount=false,busy=false;
 const hasCurrentTicket=()=>!!validTicket(ticket)&&normalizeName(ticket.name)===normalizeName(name.value)&&ticket.guests===Number(count.value)&&!busy;
 function validity(){
   $('#recall-ticket').hidden=form.hidden||!hasCurrentTicket();
   document.dispatchEvent(new Event('reservation-updated'));
   const n=name.value.trim(),g=Number(count.value),error=validate(n,g),nameError=validate(n,1),countError=validate('ok',g);
   $('#name-error').textContent=touchedName?nameError:'';$('#count-error').textContent=touchedCount?countError:'';
   name.setAttribute('aria-invalid',String(touchedName&&!!nameError));count.setAttribute('aria-invalid',String(touchedCount&&!!countError));
   submit.disabled=!!error||busy;$('#minus').disabled=g<=1;$('#plus').disabled=g>=CONFIG.MAX_GUESTS;return !error;
 }
 name.addEventListener('input',()=>{touchedName=true;validity();});name.addEventListener('blur',()=>{touchedName=true;validity();});
 count.addEventListener('input',()=>{touchedCount=true;validity();});
 for(const [id,delta] of [['minus',-1],['plus',1]])$('#'+id).onclick=()=>{count.value=Math.max(1,Math.min(CONFIG.MAX_GUESTS,(Number(count.value)||1)+delta));touchedCount=true;validity();sound('tick');};
 const edit=()=>{$('#reservation-success').hidden=true;host.hidden=true;form.hidden=false;$('.reservation-intro').hidden=false;name.value=ticket.name;count.value=ticket.guests;$('#recall-ticket').hidden=false;status.textContent='';validity();name.focus();};
 const showTicket=async()=>{if(!ticket)return;form.hidden=true;$('.reservation-intro').hidden=true;$('#recall-ticket').hidden=true;await renderTicket(host,ticket,edit);await updateSummary(ticket);$('#reservation-success').hidden=false;$('#reservation-success strong').textContent=demoMode?'Contoh reservasi tersimpan':'Namamu sudah tercatat';$('#reservation-success .success-guest').textContent=ticket.name+' · '+ticket.guests+' tamu';$('#reservation-success .success-detail').textContent=demoMode?'Ini pratinjau. Data baru tersimpan di perangkat ini. Tiket contohmu sudah siap.':'Terima kasih. Kami menantikan kehadiranmu. Tiketmu sudah siap untuk disimpan.';};
 $('#recall-ticket').onclick=()=>{if(hasCurrentTicket())void showTicket();};
 if(ticket){name.value=ticket.name;count.value=ticket.guests;$('#recall-ticket').hidden=false;}await updateSummary(ticket);if(demoMode){submit.textContent='Coba Simpan Kehadiran';$('#reservation').classList.add('is-demo');}
 form.addEventListener('submit',async event=>{
   event.preventDefault();touchedName=touchedCount=true;if(busy||!validity())return;
   busy=true;validity();submit.textContent='Mengirim…';status.textContent='';
   try{const result=demoMode?{reservation:{id:ticket?.id||String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000),name:name.value.trim(),guests:Number(count.value),demo:true}}:await request('reserve',{name:name.value.trim(),guests:Number(count.value),website:$('#website').value});if(!validTicket(result.reservation))throw new Error('Invalid ticket');ticket=result.reservation;storage.set(demoMode?'djsl-demo-ticket':'djsl-ticket',ticket);status.textContent='';await showTicket();sound('success');stampTicket();}
   catch{status.textContent='Gagal mengirim. Periksa koneksi lalu coba lagi.';}
   finally{busy=false;submit.textContent=demoMode?'Coba Simpan Kehadiran':'Simpan Kehadiran';validity();}
 });
 validity();
 function tick(){const delta=Math.max(0,new Date(e.start).getTime()-Date.now());if(delta===0){$('#countdown-digits').hidden=true;$('#countdown-arrived').hidden=false;return;}const s=Math.floor(delta/1000),values=[Math.floor(s/86400),Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60];values.forEach((v,i)=>{const d=$(`[data-digit="${i}"]`),text=String(v).padStart(2,'0');if(d.textContent!==text){d.textContent=text;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&$('#countdown').classList.contains('is-visible'))d.animate([{transform:'translateY(-12px)',opacity:.3},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'ease-out'});}});}
 tick();setInterval(tick,1000);
 await hydrateArt();const journey=initMotion({onRestart:()=>{if(ticket)edit();},canOpenSummary:hasCurrentTicket,onSummaryBlocked:()=>{status.textContent='Silakan isi nama dan jumlah tamu, lalu tekan Simpan Kehadiran sebelum membuka tiket.';name.focus({preventScroll:true});}});/* journey-ready */
 $('#nav-next').onclick=()=>{void startAudio(true);void journey.next();};
 $('#nav-back').onclick=()=>journey.back();
 if(document.modelContext?.registerTool){try{await document.modelContext.registerTool({name:'stage_reservation',title:'Siapkan reservasi',description:'Fill the reservation form for review. Does not submit or reserve a seat.',inputSchema:{type:'object',properties:{name:{type:'string',minLength:2,maxLength:60},guests:{type:'integer',minimum:1,maximum:CONFIG.MAX_GUESTS}},required:['name','guests'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(typeof input?.name!=='string'||typeof input?.guests!=='number'||validate(input.name,input.guests))throw new Error('Invalid reservation');if(ticket)edit();name.value=input.name.trim();count.value=input.guests;touchedName=touchedCount=true;validity();await journey.goTo('reservation');while($('#reservation').dataset.bookStep!=='2')await journey.next();return {staged:true,name:name.value,guests:Number(count.value),submitted:false};}});}catch{}}
}
