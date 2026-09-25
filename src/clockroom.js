import gsap from 'gsap';
import {sound} from './audio.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=[
 ['BIFARI','Nah, ini jam yang tadi kami ceritakan. Mari mendekat.'],
 ['SYAFIRA','Kami akan menikah hari Sabtu, 31 Oktober 2026. Acara dimulai pukul 09:30 WIB.'],
 ['BIFARI','Tinggal menghitung hari. Rasanya makin tidak sabar bisa bertemu kamu di sana.'],
 ['SYAFIRA','Simpan tanggalnya, ya. Yuk, ke meja peta di sebelah. Kami tunjukkan tempat acaranya.']
];
export function initClockroom(){
 const root=document.querySelector('#invitation'),scene=document.querySelector('#countdown'),$=s=>scene.querySelector(s);
 let step=0,busy=false;
 function controls(){scene.dataset.clockStep=String(step);root.dataset.clockBusy=String(busy);root.querySelector('#nav-back').disabled=busy;root.querySelector('#nav-next').disabled=busy;root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ 04</small>`;gsap.set('#journey-progress',{scaleX:(step+1)/4});}
 function speaker(at){const [name,line]=lines[at];scene.dataset.speaker=name;scene.querySelectorAll('.welcome-character').forEach(el=>el.classList.toggle('is-speaking',el.dataset.character===name));$('.vn-speaker').textContent=name;$('#clockroom-description').textContent=`${name}: ${line}`;return line;}
 function pose(){gsap.set($('.clockroom-camera'),{scale:step?1.13:1,y:0,x:0});gsap.set($('.character-bifari'),{xPercent:step?6:0});gsap.set($('.character-syafira'),{xPercent:step?-6:0});gsap.set($('.clockroom-countdown'),{autoAlpha:step>=2?1:0,y:0});$('#clockroom-line').textContent=speaker(step);scene.dataset.speaking='false';controls();}
 function show(at=0){step=at;busy=false;pose();}
 function move(target){if(busy||target<0||target>=lines.length)return false;busy=true;controls();return new Promise(resolve=>{
  const t=gsap.timeline({onComplete:()=>{step=target;busy=false;scene.dataset.speaking='false';$('#clockroom-line').textContent=speaker(step);controls();resolve(true);}});
  t.to($('.vn-dialogue'),{opacity:0,duration:.15});
  if(!reduced()&&(step===0||target===0)){
   const forward=target>0,at=t.duration();
   [0,1].forEach(i=>{const a=at+i*.58;t.to($('.clockroom-camera'),{scale:forward?1.065+i*.065:1.065-i*.065,y:-7,duration:.27,ease:'sine.out'},a).to($('.clockroom-camera'),{y:0,duration:.29,ease:'sine.inOut'},a+.27).call(()=>sound('footstep'),[],a+.39);});
   t.to($('.character-bifari'),{xPercent:forward?6:0,duration:1.1},at).to($('.character-syafira'),{xPercent:forward?-6:0,duration:1.1},at);
  }else if(reduced()){t.set($('.clockroom-camera'),{scale:target?1.13:1}).set($('.character-bifari'),{xPercent:target?6:0}).set($('.character-syafira'),{xPercent:target?-6:0});}
  t.to($('.clockroom-countdown'),{autoAlpha:target>=2?1:0,y:0,duration:reduced()?0:.7});
  if(target===2)t.call(()=>sound('chime'));
  const cursor={n:0},line=lines[target][1];
  t.call(()=>{speaker(target);scene.dataset.speaking='true';$('#clockroom-line').textContent='';}).to($('.vn-dialogue'),{opacity:1,duration:.2}).to(cursor,{n:line.length,duration:reduced()?0:line.length*.029,ease:'none',onUpdate:()=>{$('#clockroom-line').textContent=line.slice(0,Math.ceil(cursor.n));}});
 });}
 // Audible clock ticks are scoped to the visible room and respect the common mute setting.
 const timer=setInterval(()=>{if(scene.classList.contains('is-active')&&!document.hidden)sound('clock');},1000);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 return {get step(){return step;},get last(){return lines.length-1;},get busy(){return busy;},show,controls,next:()=>move(step+1),back:()=>move(step-1)};
}

