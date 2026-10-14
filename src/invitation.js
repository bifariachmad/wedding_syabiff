
import {updateSummary} from './summary.js';
import { CONFIG, invitationUrl } from './config.js';
import { invitationMarkup } from './markup.js';
import { icon, hydrateArt } from './art.js';
import { validate, request, normalizeName } from './api.js';
import { storage } from './storage.js';
import { renderTicket } from './ticket.js';
import { attendanceOf, validateRSVP, validResponse } from './rsvp.js';
import { startAudio, toggleAudio, isMusicEnabled, sound } from './audio.js';
import { initMotion, stampTicket } from './motion.js';
export async function renderInvitation(app) {
 const e=CONFIG.EVENT,to=new URLSearchParams(location.search).get('to')?.trim().slice(0,60)||'';
 const demoMode=!CONFIG.APPS_SCRIPT_URL,storageKey=demoMode?'djsl-demo-ticket':'djsl-ticket';
 let ticket=storage.get(storageKey);
 if(!validResponse(ticket)||Boolean(ticket.demo)!==demoMode||(to&&normalizeName(ticket.name)!==normalizeName(to)))ticket=null;
 if(!app.querySelector('#invitation'))app.innerHTML=invitationMarkup();
 const $=s=>document.querySelector(s),form=$('#reservation-form'),name=$('#guest-name'),count=$('#guest-count'),submit=$('#submit-reservation'),status=$('#reservation-status'),host=$('#ticket-host');
 const choices=[...form.querySelectorAll('[name="attendance"]')];
 const attendance=()=>choices.find(choice=>choice.checked)?.value||'';
 const guests=()=>attendance()==='declined'?0:Number(count.value);
 if(to){$('#recipient').hidden=false;$('#recipient').textContent='Untuk '+to;name.value=to;}
 const updateMusic=()=>{const playing=isMusicEnabled();$('#music-toggle').innerHTML=icon(playing?'music-on':'music-off');$('#music-toggle').setAttribute('aria-label',playing?'Matikan musik':'Nyalakan musik');};
 $('#music-toggle').onclick=toggleAudio;document.addEventListener('musicchange',updateMusic);
 let touchedName=false,touchedCount=false,busy=false,rsvpOpen=true;
 const hasCurrentResponse=()=>validResponse(ticket)&&normalizeName(ticket.name)===normalizeName(name.value)&&ticket.guests===guests()&&attendanceOf(ticket)===attendance()&&!busy;
 function validity(){
   const attending=attendance()==='attending',g=Number(count.value);
   $('#guest-count-field').hidden=!attending;count.disabled=busy||!attending;count.required=attending;
   name.disabled=busy;choices.forEach(choice=>choice.disabled=busy);
   submit.textContent=busy?(ticket?'Memperbarui…':'Menyimpan…'):ticket?'Update Kehadiran':demoMode?'Coba Simpan Kehadiran':'Simpan Kehadiran';
   $('#recall-ticket').hidden=form.hidden||!hasCurrentResponse();
   $('#recall-ticket').textContent=attendance()==='declined'?'Lihat Konfirmasi':'Lihat Tiket';
   const n=name.value.trim(),error=validateRSVP(n,guests(),attendance()),nameError=validate(n,1),countError=attending?validate('ok',g):'';
   $('#name-error').textContent=touchedName?nameError:'';$('#count-error').textContent=touchedCount?countError:'';
   name.setAttribute('aria-invalid',String(touchedName&&!!nameError));count.setAttribute('aria-invalid',String(touchedCount&&!!countError));
   if(!rsvpOpen){status.textContent='Konfirmasi kehadiran sudah ditutup. Hubungi panitia untuk perubahan.';}submit.disabled=!!error||busy||!rsvpOpen;$('#minus').disabled=busy||!attending||g<=1;$('#plus').disabled=busy||!attending||g>=CONFIG.MAX_GUESTS;
   document.dispatchEvent(new Event('reservation-updated'));
   return !error;
 }
 name.addEventListener('input',()=>{touchedName=true;validity();});name.addEventListener('blur',()=>{touchedName=true;validity();});
 count.addEventListener('input',()=>{touchedCount=true;validity();});
 choices.forEach(choice=>choice.addEventListener('change',()=>{status.textContent='';validity();}));
 for(const [id,delta] of [['minus',-1],['plus',1]])$('#'+id).onclick=()=>{count.value=Math.max(1,Math.min(CONFIG.MAX_GUESTS,(Number(count.value)||1)+delta));touchedCount=true;validity();sound('tick');};
 const fillResponse=()=>{
   name.value=ticket.name;count.value=ticket.guests||1;
   choices.forEach(choice=>choice.checked=choice.value===attendanceOf(ticket));
 };
 const edit=()=>{
   if(busy||!ticket)return;
   $('#reservation-title').hidden=false;$('#reservation').dataset.reservationView='form';$('#reservation-success').hidden=true;host.hidden=true;form.hidden=false;$('.reservation-intro').hidden=false;
   fillResponse();status.textContent='';validity();name.focus();
 };
 const showResponse=async()=>{
   if(!ticket)return;
   const declined=attendanceOf(ticket)==='declined';
   $('#reservation-title').hidden=true;$('#reservation').dataset.reservationView=declined?'declined':'ticket';form.hidden=true;$('.reservation-intro').hidden=true;$('#recall-ticket').hidden=true;
   if(declined){
     host.replaceChildren();host.hidden=false;
     const actions=document.createElement('div');actions.className='ticket-actions';
     const button=document.createElement('button');button.type='button';button.id='edit-reservation';button.className='text-button';button.textContent='Ubah Konfirmasi';button.onclick=edit;actions.append(button);host.append(actions);
   }else await renderTicket(host,ticket,edit);
   await updateSummary(ticket);
   $('#reservation-success').hidden=false;
   $('#reservation-success strong').textContent=demoMode?'Contoh konfirmasi tersimpan':declined?'Terima kasih sudah memberi kabar':'Namamu sudah tercatat';
   $('#reservation-success .success-guest').textContent=ticket.name+' · '+(declined?'Tidak dapat hadir':ticket.guests+' tamu');
   $('#reservation-success .success-detail').textContent=declined
     ? (demoMode?'Ini pratinjau. Jawaban baru tersimpan di perangkat ini. ':'')+'Tidak apa-apa jika kamu berhalangan. Doa baikmu tetap berarti bagi kami. Jika rencanamu berubah, kamu bisa mengubah konfirmasi ini.'
     : demoMode?'Ini pratinjau. Data baru tersimpan di perangkat ini. Tiket contohmu sudah siap.':'Terima kasih. Kami menantikan kehadiranmu. Tiketmu sudah siap untuk disimpan.';
 };
 $('#recall-ticket').onclick=()=>{if(hasCurrentResponse())void showResponse();};
 if(ticket)fillResponse();
 await updateSummary(ticket);if(demoMode)$('#reservation').classList.add('is-demo');
 form.addEventListener('submit',async event=>{
   event.preventDefault();touchedName=touchedCount=true;if(busy||!rsvpOpen||!validity())return;
   const payload={name:name.value.trim(),guests:guests(),attendance:attendance(),website:$('#website').value};
   busy=true;validity();status.textContent='';
   try{
     const result=demoMode?{reservation:{id:ticket?.id||String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000),name:payload.name,guests:payload.guests,attendance:payload.attendance,demo:true}}:await request('reserve',payload);
     if(!validResponse(result.reservation)||attendanceOf(result.reservation)!==payload.attendance||result.reservation.guests!==payload.guests)throw new Error('Invalid response');
     ticket=result.reservation;storage.set(storageKey,ticket);status.textContent='';
     await showResponse();sound('success');stampTicket();
   }catch(error){
     status.textContent=['Tamu sudah check-in. Hubungi panitia untuk mengubah kehadiran.','Konfirmasi kehadiran sudah ditutup. Hubungi panitia untuk perubahan.'].includes(error.message)?error.message:'Gagal mengirim. Periksa koneksi lalu coba lagi.';
   }finally{busy=false;validity();}
 });
 validity();
 function tick(){const delta=Math.max(0,new Date(e.start).getTime()-Date.now());if(delta===0){$('#countdown-digits').hidden=true;$('#countdown-arrived').hidden=false;return;}const s=Math.floor(delta/1000),values=[Math.floor(s/86400),Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60];values.forEach((v,i)=>{const d=$(`[data-digit="${i}"]`),text=String(v).padStart(2,'0');if(d.textContent!==text){d.textContent=text;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&$('#countdown').classList.contains('is-visible'))d.animate([{transform:'translateY(-12px)',opacity:.3},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'ease-out'});}});}
 tick();setInterval(tick,1000);
 await hydrateArt();const journey=initMotion({onRestart:()=>{if(ticket)edit();},canOpenSummary:hasCurrentResponse,onSummaryBlocked:()=>{status.textContent='Silakan isi nama dan pilih kehadiran, lalu tekan Simpan Kehadiran sebelum melanjutkan.';name.focus({preventScroll:true});}});/* journey-ready */
 $('#nav-next').onclick=()=>{void startAudio(true);void journey.next();};
 $('#nav-back').onclick=()=>journey.back();
 if(!demoMode)void request('publicSettings').then(result=>{rsvpOpen=result.rsvpOpen!==false;validity();}).catch(()=>{});
 if(document.modelContext?.registerTool){try{await document.modelContext.registerTool({name:'stage_reservation',title:'Siapkan reservasi',description:'Fill the reservation form for review. Does not submit or reserve a seat.',inputSchema:{type:'object',properties:{name:{type:'string',minLength:2,maxLength:60},guests:{type:'integer',minimum:1,maximum:CONFIG.MAX_GUESTS}},required:['name','guests'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(typeof input?.name!=='string'||typeof input?.guests!=='number'||validate(input.name,input.guests))throw new Error('Invalid reservation');if(ticket)edit();name.value=input.name.trim();count.value=input.guests;choices.forEach(choice=>choice.checked=choice.value==='attending');touchedName=touchedCount=true;validity();await journey.goTo('reservation');while($('#reservation').dataset.bookStep!=='2')await journey.next();return {staged:true,name:name.value,guests:Number(count.value),submitted:false};}});}catch{}}
}
