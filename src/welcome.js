import gsap from 'gsap';
import {sound} from './audio.js';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialogue=[
 ['KAMU','Ini rumahnya. Sepertinya mereka sudah menunggu.'],
 ['BIFARI','Hai, selamat datang! Aku Bifari. Yuk, masuk dulu.'],
 ['SYAFIRA','Aku Syafira. Senang sekali bisa menyambutmu di sini.'],
 ['BIFARI','Kami ingin mengundangmu menjadi bagian dari hari bahagia kami.'],
 ['SYAFIRA','Yuk, ikut kami ke jam besar di dalam. Ada tanggal yang ingin kami tunjukkan.']
];
export function initWelcome(){
 const root=document.querySelector('#invitation'),scene=document.querySelector('#greeting');
 const $=s=>scene.querySelector(s);
 let step=0,busy=false;
 function controls(){
  scene.dataset.welcomeStep=String(step);root.dataset.welcomeBusy=String(busy);
  root.querySelector('#nav-back').disabled=busy;root.querySelector('#nav-next').disabled=busy;
  root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ 05</small>`;
  gsap.set('#journey-progress',{scaleX:(step+1)/dialogue.length});
 }
 function highlight(speaker){scene.dataset.speaker=speaker;scene.querySelectorAll('.welcome-character').forEach(el=>el.classList.toggle('is-speaking',el.dataset.character===speaker));}
 function copy(){const [speaker,line]=dialogue[step];highlight(speaker);$('.vn-speaker').textContent=speaker;$('#welcome-line').textContent=line;$('#welcome-description').textContent=`${speaker}: ${line}`;}
 function pose(){
  gsap.set(scene.querySelectorAll('.welcome-character'),{xPercent:0,y:0,scale:1});scene.dataset.speaking='false';
  gsap.set($('.welcome-camera'),{scale:step>=2?1.18:1,x:0,y:0,rotation:0});
  gsap.set($('.welcome-couple'),{autoAlpha:step?1:0});
  gsap.set($('.welcome-exterior'),{autoAlpha:step===0?1:0,scale:1});
  gsap.set($('.welcome-door-left'),{rotationY:step?102:0});gsap.set($('.welcome-door-right'),{rotationY:step?-102:0});
  gsap.set($('.vn-dialogue'),{opacity:1,y:0});copy();controls();
 }
 function show(at=0){step=at;busy=false;pose();}
 function move(target){
  if(busy||target<0||target>=dialogue.length)return false;
  busy=true;controls();
  return new Promise(resolve=>{
   const t=gsap.timeline({onComplete:()=>{step=target;busy=false;scene.dataset.speaking='false';copy();controls();resolve(true);}});
   t.to($('.vn-dialogue'),{opacity:0,duration:.15});
   if(reduced()){t.call(()=>{step=target;pose();busy=true;controls();});}
   else if(target===0||step===0){
    if(!target)t.set($('.welcome-exterior'),{scale:1.9,autoAlpha:1}).set($('.welcome-couple'),{autoAlpha:0});
    const at=t.duration();
    t.call(()=>{sound('latch');sound('door');},[],at)
     .to($('.welcome-door-left'),{rotationY:target?102:0,duration:1.8,ease:'power2.inOut'},at)
     .to($('.welcome-door-right'),{rotationY:target?-102:0,duration:2,ease:'power2.inOut'},at+.12)
     .to($('.welcome-exterior'),{scale:target?1.9:1,duration:2.8,ease:'sine.inOut'},at)
     .call(()=>sound('footstep'),[],at+.65).call(()=>sound('footstep'),[],at+1.45);
    if(target){t.to($('.welcome-exterior'),{autoAlpha:0,duration:.6},at+2.2)
     .call(()=>{scene.dataset.arrival='empty';$('#welcome-description').textContent='Ruangan masih kosong. Kamu melangkah masuk.';},[],at+2.8)
     .fromTo(scene.querySelectorAll('.welcome-character'),{xPercent:i=>i?-18:18},{xPercent:0,duration:.8,ease:'sine.out'},at+3.8)
     .to($('.welcome-couple'),{autoAlpha:1,duration:.65},at+3.8)
     .call(()=>{scene.dataset.arrival='hosts';},[],at+4.6);}
   }else if(target===2&&step===1||target===1&&step===2){
    const at=t.duration(),toward=target===2;
    for(let i=0;i<2;i++){
     const when=at+i*.58;
     t.to($('.welcome-camera'),{scale:toward?1.09+i*.09:1.09-i*.09,duration:.54,ease:'sine.inOut'},when)
      .to($('.welcome-camera'),{y:-6,x:i%2?2:-2,duration:.25,ease:'sine.out'},when)
      .to($('.welcome-camera'),{y:0,x:0,duration:.29,ease:'sine.inOut'},when+.25)
      .call(()=>sound('footstep'),[],when+.4);
    }
   }
   const [speaker,line]=dialogue[target],cursor={letters:0};
   t.call(()=>{highlight(speaker);scene.dataset.speaking='true';$('.vn-speaker').textContent=speaker;$('#welcome-description').textContent=`${speaker}: ${line}`;$('#welcome-line').textContent='';})
    .to($('.vn-dialogue'),{opacity:1,duration:.22})
    .to(cursor,{letters:line.length,duration:reduced()?0:line.length*.026,ease:'none',onUpdate:()=>{$('#welcome-line').textContent=line.slice(0,Math.ceil(cursor.letters));}});
  });
 }
 return {get step(){return step;},get last(){return dialogue.length-1;},get busy(){return busy;},show,controls,next:()=>move(step+1),back:()=>move(step-1)};
}
