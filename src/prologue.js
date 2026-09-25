import gsap from 'gsap';
import { hydrateArt } from './art.js';
import { sound } from './audio.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=['Ada ketukan di pintu.','Tak ada siapa-siapa.','Sebuah undangan. Untukmu.','Anda diundang.'];
const descriptions=[
 'Di dalam rumah, kamu menghadap pintu kayu yang tertutup. Ada tiga ketukan.',
 'Pintu terbuka. Cahaya pagi menerangi teras, tetapi tidak ada siapa-siapa.',
 'Kamu menunduk, mengambil amplop bersegel maroon, lalu mengangkatnya. Amplop itu ditujukan untukmu.',
 'Segel terbuka. Pada kartu tertulis: Anda diundang. Tekan Lanjut untuk masuk ke dalam undangan.'
];

export function initPrologue(onExit){
 const root=document.querySelector('#invitation'),section=document.querySelector('#arrival'),stage=root.querySelector('.vn-stage');
 const back=root.querySelector('#nav-back'),next=root.querySelector('#nav-next');
 let step=0,active=true,busy=false,timeline;
 const $=selector=>section.querySelector(selector);
 async function prepare(target){
  const selectors={1:'.arrival-envelope-paint,.arrival-door-hand',2:'.arrival-sealed img',3:'.arrival-open img',4:'.arrival-portal img'};
  const images=[...section.querySelectorAll(selectors[target]||'img')];
  for(const img of images){if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';}
  await Promise.all(images.map(img=>img.decode().catch(()=>{})));
  if(target===4)await Promise.all([hydrateArt(document.querySelector('#gate')),hydrateArt(document.querySelector('.vn-world'))]);
 }
 function controls(){
  root.dataset.prologue=active?'active':'complete';root.dataset.prologueBusy=String(busy);section.dataset.step=String(step);
  if(!active)return;
  back.disabled=busy||step===0;next.disabled=busy;
  root.querySelector('#journey-position').innerHTML=`I <small>· ${step+1} / 4</small>`;
  gsap.set('#journey-progress',{scaleX:(step+1)/4});
 }
 function describe(){
  $('#arrival-line').textContent=lines[step];$('#arrival-description').textContent=descriptions[step];
  $('.arrival-sealed').setAttribute('aria-hidden',String(step!==2));
  $('.arrival-open').setAttribute('aria-hidden',String(step!==3));
 }
 function pose(target){
  gsap.set($('.arrival-camera'),{scale:target===0?1:1.12,xPercent:0,yPercent:target===0?0:3,rotationX:0});
  gsap.set($('.arrival-door'),{rotationY:target===0?0:-102,x:0});
  gsap.set($('.arrival-door-hand'),{opacity:0,x:0,y:0,rotation:0});
  gsap.set($('.arrival-floor-envelope'),{opacity:target===1?1:0,scale:1,y:0});
  gsap.set($('.arrival-sealed'),{autoAlpha:target===2?1:0,y:0,scale:1,rotation:0,rotationX:0});
  gsap.set($('.arrival-open'),{autoAlpha:target===3?1:0,y:0,scale:1,rotation:0});
  gsap.set($('.arrival-card-copy'),{opacity:1});
  gsap.set($('.arrival-portal'),{autoAlpha:0,scale:.15});
  gsap.set($('.arrival-ink-ring'),{rotation:0});
  gsap.set($('.arrival-portal-shade'),{opacity:0});
  gsap.set($('.arrival-caption'),{opacity:target===3?0:1});
  gsap.set($('.arrival-knocks'),{opacity:0});
 }
 function complete(target){step=target;busy=false;describe();controls();void prepare(Math.min(target+1,4));if(back.disabled&&document.activeElement===back)next.focus({preventScroll:true});}
 function run(build,done){return new Promise(resolve=>{timeline=gsap.timeline({onComplete:()=>{done();resolve(true);}});build(timeline);});}
 async function move(target){
  if(!active||busy||target<0||target>4)return false;
  busy=true;controls();
  // Decode the artwork before moving; no empty hands or portal during a slow fetch.
  await prepare(target);
  if(target===4)return enterPortal();
  if(reduced())return run(t=>t.to($('.arrival-view'),{opacity:.45,duration:.1}).call(()=>pose(target)).to($('.arrival-view'),{opacity:1,duration:.15}),()=>complete(target));
  if(target<step){
   return run(t=>{
    t.to([$('.arrival-sealed'),$('.arrival-open')],{autoAlpha:0,y:100,rotation:-4,duration:.35});
    t.to($('.arrival-camera'),{scale:target===0?1:1.12,xPercent:0,yPercent:target===0?0:3,rotationX:0,duration:.7,ease:'power2.inOut'},0);
    t.to($('.arrival-door'),{rotationY:target===0?0:-102,duration:.9,ease:'power2.inOut'},.2);
    t.to($('.arrival-floor-envelope'),{opacity:target===1?1:0,duration:.2},.5);
    t.call(()=>pose(target),[],1.1);
   },()=>complete(target));
  }
  return run(t=>{
   t.to($('.arrival-caption'),{opacity:0,duration:.2},0);
   if(target===1){
    t.call(()=>sound('knock'),[],.05)
     .to($('.arrival-door'),{x:2,duration:.065,repeat:5,yoyo:true},.05)
     .fromTo($('.arrival-knocks'),{opacity:0,scale:.85},{opacity:.8,scale:1.15,duration:.12,repeat:5,yoyo:true},.05)
     .to($('.arrival-camera'),{scale:1.12,yPercent:3,duration:1.4,ease:'power2.inOut'},.75)
     .fromTo($('.arrival-door-hand'),{opacity:0,x:80,y:140,rotation:12},{opacity:1,x:0,y:0,rotation:0,duration:.65,ease:'power2.out'},1)
     .call(()=>sound('door'),[],1.4)
     .to($('.arrival-door'),{rotationY:-102,x:0,duration:1.8,ease:'power2.inOut'},1.4)
     .to($('.arrival-door-hand'),{opacity:0,duration:.5},2.1)
     .to($('.arrival-floor-envelope'),{opacity:1,duration:.7},2)
     .to($('.arrival-camera'),{xPercent:-2,duration:.6,ease:'sine.inOut'},3.2)
     .to($('.arrival-camera'),{xPercent:0,duration:.7,ease:'sine.inOut'},3.8);
   }
   if(target===2){
    t.to($('.arrival-camera'),{scale:1.62,yPercent:-24,rotationX:5,duration:1.15,ease:'power2.inOut'},0)
     .to($('.arrival-floor-envelope'),{scale:1.18,y:-12,duration:.5},1.15)
     .call(()=>sound('page'),[],1.35)
     .to($('.arrival-floor-envelope'),{opacity:0,y:-70,duration:.4},1.55)
     .fromTo($('.arrival-sealed'),{autoAlpha:0,y:window.innerHeight*.45,scale:.68,rotation:-9},{autoAlpha:1,y:0,scale:1,rotation:0,duration:1.25,ease:'power2.out'},1.65)
     .to($('.arrival-camera'),{scale:1.12,yPercent:3,rotationX:0,duration:1.2,ease:'power2.inOut'},1.8);
   }
   if(target===3){
    t.call(()=>sound('seal'),[],.2)
     .to($('.arrival-sealed'),{rotation:-4,scale:1.03,duration:.35,ease:'power2.inOut'},0)
     .call(()=>sound('page'),[],.35)
     .to($('.arrival-sealed'),{rotationX:-24,y:70,autoAlpha:0,duration:.7,ease:'power2.in'},.35)
     .fromTo($('.arrival-open'),{autoAlpha:0,y:120,scale:.82,rotation:5},{autoAlpha:1,y:0,scale:1,rotation:0,duration:1,ease:'power2.out'},.55)
     .fromTo($('.arrival-card-copy'),{opacity:0},{opacity:1,duration:.8},1.2);
   }
   t.call(()=>{$('#arrival-line').textContent=lines[target];})
    .to($('.arrival-caption'),{opacity:target===3?0:1,duration:.3});
  },()=>complete(target));
 }
 function enterPortal(){
  const card=$('.arrival-card-copy').getBoundingClientRect(),bounds=section.getBoundingClientRect();
  gsap.set($('.arrival-portal'),{left:card.x+card.width/2-bounds.x,top:card.y+card.height/2-bounds.y});
  return run(t=>{
   if(reduced()){
    t.to(section,{opacity:0,duration:.35});
   }else{
    t.call(()=>sound('portal'),[],.1)
     .to($('.arrival-card-copy'),{opacity:0,duration:.6},0)
     .fromTo($('.arrival-portal'),{autoAlpha:0,scale:.06},{autoAlpha:1,scale:1,duration:1.6,ease:'power2.in'},.25)
     .to($('.arrival-ink-ring'),{rotation:210,duration:4,ease:'power1.in'},.25)
     .to($('.arrival-open'),{scale:1.18,rotation:-3,duration:1.7,ease:'power2.in'},.4)
     .to($('.arrival-camera'),{scale:1.3,duration:3},.3)
     .to($('.arrival-portal'),{scale:8,duration:2.1,ease:'power3.in'},1.65)
     .to($('.arrival-open'),{scale:1.9,autoAlpha:0,duration:1.5,ease:'power2.in'},1.8)
     .to(section,{opacity:0,duration:.7},3.35);
   }
  },()=>{active=false;busy=false;section.hidden=true;section.inert=true;section.setAttribute('aria-hidden','true');root.classList.remove('intro-active');stage.inert=false;controls();onExit();});
 }
 async function show(){
  if(busy)return false;active=true;busy=true;step=3;section.hidden=false;section.inert=false;section.removeAttribute('aria-hidden');root.classList.add('intro-active');stage.inert=true;gsap.set(section,{opacity:1});controls();await prepare(3);pose(3);complete(3);return true;
 }
 function dismiss(){timeline?.kill();active=false;busy=false;section.hidden=true;section.inert=true;section.setAttribute('aria-hidden','true');root.classList.remove('intro-active');stage.inert=false;controls();}
 stage.inert=true;pose(0);describe();controls();void prepare(1);
 return {get active(){return active;},get busy(){return busy;},next:()=>move(step+1),back:()=>move(step-1),controls,show,dismiss};
}
