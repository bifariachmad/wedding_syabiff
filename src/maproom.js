import gsap from 'gsap';
import {sound} from './audio.js';
import {CONFIG} from './config.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=[['SYAFIRA','Di meja ini, kami sudah menyiapkan petunjuk untukmu.'],['BIFARI',`Kami akan merayakannya di ${CONFIG.EVENT.venue}. Ini lokasi yang bisa kamu simpan.`],['SYAFIRA','Kamu bisa membuka Google Maps untuk melihat rutenya. Kami menunggumu mulai pukul 09:30 WIB.'],['BIFARI','Setelah tahu tempatnya, yuk, lihat rangkaian acara yang sudah kami siapkan.']];
export function initMaproom(){
 const root=document.querySelector('#invitation'),scene=document.querySelector('#location'),$=s=>scene.querySelector(s);let step=0,busy=false;
 function controls(){scene.dataset.mapStep=String(step);root.dataset.mapBusy=String(busy);root.querySelector('#nav-next').disabled=busy;root.querySelector('#nav-back').disabled=busy;root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ 04</small>`;gsap.set('#journey-progress',{scaleX:(step+1)/4});}
 function speaker(at){const[name,line]=lines[at];$('.vn-speaker').textContent=name;scene.dataset.speaker=name;scene.querySelectorAll('.welcome-character').forEach(el=>el.classList.toggle('is-speaking',el.dataset.character===name));$('#maproom-description').textContent=`${name}: ${line}`;return line;}
 function show(at=0){step=at;busy=false;scene.dataset.speaking='false';gsap.set($('.maproom-camera'),{scale:step?1.08:1,x:0,y:0});gsap.set($('.vn-dialogue'),{opacity:1,y:0});$('.maproom-venue').hidden=step===0;$('#maproom-line').textContent=speaker(step);controls();}
 function move(target){if(busy||target<0||target>=lines.length)return false;busy=true;controls();return new Promise(resolve=>{
  const t=gsap.timeline({onComplete:()=>{step=target;busy=false;scene.dataset.speaking='false';$('#maproom-line').textContent=speaker(step);controls();resolve(true);}});
  t.to($('.vn-dialogue'),{opacity:0,duration:.15});
  if(target===1&&step===0){t.call(()=>sound('paper-lift')).to($('.maproom-camera'),{scale:1.08,y:reduced()?0:-5,duration:reduced()?0:.65,ease:'sine.inOut'}).to($('.maproom-camera'),{y:0,duration:reduced()?0:.25});}
  if(target===0)t.to($('.maproom-camera'),{scale:1,duration:reduced()?0:.6});
  const text=lines[target][1],cursor={n:0};
  t.call(()=>{$('.maproom-venue').hidden=target===0;speaker(target);scene.dataset.speaking='true';$('#maproom-line').textContent='';}).to($('.vn-dialogue'),{opacity:1,duration:.2}).to(cursor,{n:text.length,duration:reduced()?0:text.length*.028,ease:'none',onUpdate:()=>{$('#maproom-line').textContent=text.slice(0,Math.ceil(cursor.n));}});
 });}
 return {get step(){return step;},get last(){return lines.length-1;},get busy(){return busy;},show,controls,next:()=>move(step+1),back:()=>move(step-1)};
}
