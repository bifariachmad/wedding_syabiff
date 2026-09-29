import {initGuestbook} from './guestbook.js';
import {initWardrobe} from './wardrobe.js';
import {initMaproom} from './maproom.js';
import gsap from 'gsap';
import {initClockroom} from './clockroom.js';
import { hydrateArt } from './art.js';
import { sound } from './audio.js';
import { initPrologue } from './prologue.js';
import { initCourtyard } from './courtyard.js';
import { initWelcome } from './welcome.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initMotion({canOpenSummary=()=>true,onSummaryBlocked=()=>{},onRestart=()=>{}}={}){
 const root=document.querySelector('#invitation'),scenes=[...root.querySelectorAll('.vn-scene')];
 const back=root.querySelector('#nav-back'),next=root.querySelector('#nav-next');
 let index=0,busy=false,ambient=[],prologue;
 const courtyard=initCourtyard();
 const welcome=initWelcome();
 const clockroom=initClockroom();
 const maproom=initMaproom();
 const wardrobe=initWardrobe();
 const guestbook=initGuestbook(canOpenSummary);
 const controls=()=>{next.textContent='Lanjut';next.hidden=!prologue?.active&&index===scenes.length-1;root.dataset.scene=String(index);root.dataset.travelling=String(busy);root.classList.toggle('courtyard-active',!prologue?.active&&index<2);root.classList.toggle('welcome-active',!prologue?.active&&index===2);root.classList.toggle('clockroom-active',!prologue?.active&&index===3);root.classList.toggle('maproom-active',!prologue?.active&&index===4);root.classList.toggle('agenda-active',!prologue?.active&&index===5);root.classList.toggle('finale-active',!prologue?.active&&index>=7);root.classList.toggle('wardrobe-active',!prologue?.active&&index===6);if(prologue?.active){prologue.controls();return;}if(index===7&&!busy){guestbook.controls();return;}if(index===6&&!busy){wardrobe.controls();return;}if(index===0&&!busy){courtyard.controls();return;}if(index===2&&!busy){welcome.controls();return;}if(index===3&&!busy){clockroom.controls();return;}if(index===4&&!busy){maproom.controls();return;}back.disabled=busy;next.disabled=busy;if(index===5){root.querySelector('#journey-position').innerHTML='01 <small>/ 01</small>';gsap.set('#journey-progress',{scaleX:1});}if(index===1){root.querySelector('#journey-position').innerHTML='04 <small>/ 04</small>';gsap.set('#journey-progress',{scaleX:1});}};
 function resetToGate(){
  ambient.forEach(t=>t.kill());ambient=[];
  scenes.forEach((scene,i)=>{scene.classList.remove('is-travelling');scene.classList.toggle('is-active',i===0);scene.classList.toggle('is-visible',i===0);scene.inert=i!==0;if(i===0)scene.removeAttribute('aria-hidden');else scene.setAttribute('aria-hidden','true');});
  index=0;busy=false;
  gsap.set(scenes[0].querySelectorAll('.vn-artwork,.vn-dialogue'),{clearProps:'transform,translate,scale,rotate,opacity,visibility'});
  gsap.set('.vn-landscape',{scale:1,yPercent:0});
  gsap.set('.vn-travel-frame',{clearProps:'transform,opacity'});
  courtyard.show(0);
 }
 async function restart(){
  if(busy||prologue.busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;
  ambient.forEach(t=>t.kill());ambient=[];
  await prologue.show(0);resetToGate();onRestart();controls();return true;
 }
 function atmosphere(){
  ambient.forEach(t=>t.kill());ambient=[];if(reduced()||prologue?.active)return;
  const loop=(selector,vars)=>{const targets=scenes[index].querySelectorAll(selector);if(targets.length)ambient.push(gsap.to(targets,{repeat:-1,yoyo:true,ease:'sine.inOut',...vars}));};
  loop('.hanging-lantern,.final-lantern',{rotation:4,duration:4,transformOrigin:'50% 0%'});
  loop('.flying-raven',{y:-9,rotation:3,duration:3});
  loop('.floating-key,.near-petal',{y:-12,rotation:10,duration:5});
  loop('#closing .welcome-couple',{rotation:.4,duration:3,transformOrigin:'50% 100%'});
  loop('.pendulum-hero',{rotation:12,duration:1.4,transformOrigin:'50% 0%'});
 }
 document.addEventListener('visibilitychange',()=>ambient.forEach(t=>document.hidden?t.pause():t.resume()));
 function finish(from,to,target){
  from.classList.remove('is-active','is-visible','is-travelling');
  from.setAttribute('aria-hidden','true');from.inert=true;
  to.classList.remove('is-travelling');to.classList.add('is-active','is-visible');
  to.removeAttribute('aria-hidden');to.inert=false;
  // Restore percentage-based centering after GSAP resolves it to pixels.
  gsap.set(to.querySelector('.vn-dialogue'),{clearProps:'transform,translate,scale,rotate'});
  index=target;busy=false;if(index===0)courtyard.show(2);
  root.querySelector('#journey-position').innerHTML=`${String(index+1).padStart(2,'0')} <small>/ ${scenes.length}</small>`;
  controls();
  root.querySelector('#journey-announcement').textContent=`${index+1} dari ${scenes.length}. ${to.querySelector('h1,h2').textContent}`;
  atmosphere();
  // Warm only the adjacent pages; distant chapters do not delay the first scene.
  for(const near of [scenes[index-1],scenes[index+1]])if(near)hydrateArt(near);
  if(document.activeElement?.disabled)(index===scenes.length-1?back:next).focus({preventScroll:true});
 }
 async function goTo(target){
  if(typeof target==='string')target=scenes.findIndex(s=>s.id===target);
  if(prologue?.busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;
  if(prologue?.active){prologue.dismiss();controls();}
  if(busy||target<0||target>=scenes.length)return false;
  if(target===8&&!canOpenSummary()){if(index!==7)await goTo(7);guestbook.show(2);onSummaryBlocked();return false;}
  if(target===index){controls();return false;}
  busy=true;controls();
  const from=scenes[index],to=scenes[target],direction=target>index?1:-1;
  ambient.forEach(t=>t.kill());ambient=[];
  await hydrateArt(to);
  if(target===1)await document.fonts.load('40px GALVANIZED');
  from.inert=true;to.inert=true;to.classList.add('is-travelling');
  const oldArt=from.querySelector('.vn-artwork'),newArt=to.querySelector('.vn-artwork');
  const oldText=from.querySelector('.vn-dialogue'),newText=to.querySelector('.vn-dialogue');
  gsap.set([oldArt,newArt,oldText,newText],{clearProps:'transform,opacity,visibility'});
  gsap.set(to.querySelectorAll('[data-depth]'),{z:0});
  if(target===1){gsap.set(to.querySelector('.courtyard-title-shade'),{opacity:1});gsap.set(to.querySelector('.courtyard-rose-frame'),{opacity:1});gsap.set(to.querySelectorAll('.courtyard-vine img'),{clipPath:'inset(0% 0% 0% 0%)'});}
  if(to.id==='gate'){courtyard.show(2);back.disabled=true;next.disabled=true;}
  if(to.id==='greeting'){welcome.show(direction>0?0:welcome.last);back.disabled=true;next.disabled=true;}
  if(to.id==='countdown'){clockroom.show(direction>0?0:clockroom.last);back.disabled=true;next.disabled=true;}
  if(to.id==='reservation'){guestbook.show(direction>0?0:2);back.disabled=true;next.disabled=true;}
  if(to.id==='location'){maproom.show(direction>0?0:maproom.last);back.disabled=true;next.disabled=true;}
  if(to.id==='dresscode'){wardrobe.show(direction>0?0:wardrobe.last);back.disabled=true;next.disabled=true;}
  if(to.classList.contains('vn-agenda')){gsap.set(to.querySelector('.agenda-card'),{opacity:1,rotationY:0,y:0});gsap.set(to.querySelector('.agenda-camera'),{clipPath:'inset(0% 0% 16.4% 0%)'});gsap.set(to.querySelector('.agenda-roll'),{yPercent:0,opacity:1});}
  return new Promise(resolve=>{
   const timeline=gsap.timeline({onComplete:()=>{finish(from,to,target);resolve(true);}});
   if(index===0&&target===1&&!reduced()){
    // Continue the gate camera through the garden before revealing the title.
    gsap.set([newArt,newText],{opacity:0});
    gsap.set(to.querySelector('.courtyard-title-shade'),{opacity:0});
    gsap.set(to.querySelectorAll('.courtyard-vine img'),{clipPath:'inset(100% 0% 0% 0%)'});
    courtyard.pass(timeline);
    timeline.to(oldText,{opacity:0,duration:.15},0)
     .set(newArt,{opacity:1},3.36).set(oldArt,{opacity:0},3.36)
     .to(to.querySelector('.courtyard-title-shade'),{opacity:1,duration:.7,ease:'sine.inOut'},3.36)
     .to(to.querySelector('.vine-left img'),{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'sine.inOut'},3.5)
     .to(to.querySelector('.vine-right img'),{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'sine.inOut'},3.6)
     .to(newText,{opacity:1,duration:.65,ease:'sine.out'},3.8);
   }else{
   const duration=reduced()?0.1:0.25;
   gsap.set([newArt,newText],{opacity:0});
   const veil=document.createElement('div');veil.className='journey-fade';root.append(veil);
   const midway=duration,reveal=duration+.03;
   timeline.to(oldText,{opacity:0,duration},0).to(veil,{opacity:1,duration},0)
    .set(oldArt,{opacity:0},midway).set(newArt,{opacity:1},midway);
   timeline.to(veil,{opacity:0,duration},reveal)
    .to(newText,{opacity:1,duration},reveal)
    .call(()=>veil.remove(),[],reveal+duration);
   if(target===5&&!reduced()){
    const paper=to.querySelector('.agenda-camera'),roll=to.querySelector('.agenda-roll'),card=to.querySelector('.agenda-card');
    gsap.set(paper,{clipPath:'inset(0% 0% 85.3% 0%)'});gsap.set(roll,{yPercent:-68});gsap.set(card,{opacity:0});
    timeline.call(()=>sound('page'),[],reveal).to(paper,{clipPath:'inset(0% 0% 16.4% 0%)',duration:1.1,ease:'sine.inOut'},reveal)
     .to(roll,{yPercent:0,duration:1.1,ease:'sine.inOut'},reveal).to(card,{opacity:1,duration:.3},reveal+1);
   }
   }
   timeline.to('#journey-progress',{scaleX:target===0?.75:target===1?1:(target+1)/scenes.length,duration:.3},0);
  });
 }
 prologue=initPrologue(()=>{resetToGate();controls();hydrateArt(scenes[0]);hydrateArt(scenes[1]);sound('morning');atmosphere();});
 controls();
 document.addEventListener('reservation-updated',()=>{if(index===7&&!busy)guestbook.controls();});
 return {goTo,chapter:async id=>{if(busy||prologue.busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(id==='arrival')return restart();await goTo(id);if(id==='reservation')guestbook.show(2);else if(id==='gate')courtyard.show(0);else if(id==='greeting')welcome.show(0);else if(id==='countdown')clockroom.show(0);else if(id==='location')maproom.show(0);else if(id==='dresscode')wardrobe.show(0);gsap.set(scenes[index].querySelector('.vn-dialogue'),{clearProps:'transform,translate,scale,rotate'});controls();return true;},next:()=>{if(prologue.active)return prologue.next();if(busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(index===scenes.length-1)return false;if(index===0&&courtyard.step<2)return courtyard.next().then(()=>courtyard.step===2?goTo(1):true);if(index===2&&welcome.step<welcome.last)return welcome.next();if(index===3&&clockroom.step<clockroom.last)return clockroom.next();if(index===4&&maproom.step<maproom.last)return maproom.next();if(index===6&&wardrobe.step<wardrobe.last)return wardrobe.next();if(index===7&&guestbook.step<2)return guestbook.next();return goTo(index+1);},back:()=>{if(prologue.active)return prologue.back();if(busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(index===2&&welcome.step>0)return welcome.back();if(index===3&&clockroom.step>0)return clockroom.back();if(index===4&&maproom.step>0)return maproom.back();if(index===0){if(courtyard.step>0)return courtyard.back();ambient.forEach(t=>t.kill());root.classList.remove('courtyard-active');return prologue.show();}if(index===6&&wardrobe.step>0)return wardrobe.back();if(index===7&&guestbook.step>0)return guestbook.back();return goTo(index-1);}};
}
export function stampTicket(){if(reduced())return;gsap.fromTo('.success-seal',{y:-50,scale:1.6,rotation:-18,opacity:0},{y:0,scale:1,rotation:-5,opacity:1,duration:.8,ease:'back.out(1.6)'});sound('seal');}
