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
export function initMotion({canOpenSummary=()=>true,onSummaryBlocked=()=>{}}={}){
 const root=document.querySelector('#invitation'),scenes=[...root.querySelectorAll('.vn-scene')];
 const back=root.querySelector('#nav-back'),next=root.querySelector('#nav-next');
 let index=0,busy=false,ambient=[],prologue;
 const courtyard=initCourtyard();
 const welcome=initWelcome();
 const clockroom=initClockroom();
 const maproom=initMaproom();
 const wardrobe=initWardrobe();
 const guestbook=initGuestbook(canOpenSummary);
 const controls=()=>{next.textContent='Lanjut';root.dataset.scene=String(index);root.dataset.travelling=String(busy);root.classList.toggle('courtyard-active',!prologue?.active&&index<2);root.classList.toggle('welcome-active',!prologue?.active&&index===2);root.classList.toggle('clockroom-active',!prologue?.active&&index===3);root.classList.toggle('maproom-active',!prologue?.active&&index===4);root.classList.toggle('agenda-active',!prologue?.active&&index>=5&&index<=12);root.classList.toggle('finale-active',!prologue?.active&&index>=14);root.classList.toggle('wardrobe-active',!prologue?.active&&index===13);if(prologue?.active){prologue.controls();return;}if(index===14&&!busy){guestbook.controls();return;}if(index===13&&!busy){wardrobe.controls();return;}if(index===0&&!busy){courtyard.controls();return;}if(index===2&&!busy){welcome.controls();return;}if(index===3&&!busy){clockroom.controls();return;}if(index===4&&!busy){maproom.controls();return;}back.disabled=busy;next.disabled=busy||index===scenes.length-1;if(index>=5&&index<=12){root.querySelector('#journey-position').innerHTML=`${String(index-4).padStart(2,'0')} <small>/ 08</small>`;gsap.set('#journey-progress',{scaleX:(index-4)/8});}if(index===1){root.querySelector('#journey-position').innerHTML='04 <small>/ 04</small>';gsap.set('#journey-progress',{scaleX:1});}};
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
  if(target===15&&!canOpenSummary()){if(index!==14)await goTo(14);guestbook.show(2);onSummaryBlocked();return false;}
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
  if(to.classList.contains('vn-agenda'))gsap.set(to.querySelector('.agenda-card'),{opacity:1,rotationY:0,y:0});
  return new Promise(resolve=>{
   const timeline=gsap.timeline({onComplete:()=>{finish(from,to,target);resolve(true);}});
   if(!reduced()&&index===0&&target===1){
    // Keep the final garden framing exactly; reveal only the title after landing.
    gsap.set([newArt,newText],{opacity:0});
    gsap.set(to.querySelector('.courtyard-title-shade'),{opacity:0});
    gsap.set(to.querySelectorAll('.courtyard-vine img'),{clipPath:'inset(100% 0% 0% 0%)'});
    courtyard.pass(timeline);
    timeline.to(oldText,{opacity:0,duration:.2},0)
     .set(newArt,{opacity:1},3.36).set(oldArt,{opacity:0},3.36)
     .to(to.querySelector('.courtyard-title-shade'),{opacity:1,duration:1.15,ease:'sine.inOut'},3.36)
     .to(to.querySelector('.vine-left img'),{clipPath:'inset(0% 0% 0% 0%)',duration:2.5,ease:'sine.inOut'},3.65)
     .to(to.querySelector('.vine-right img'),{clipPath:'inset(0% 0% 0% 0%)',duration:2.6,ease:'sine.inOut'},3.85)
     .fromTo(newText,{opacity:0,y:8},{opacity:1,y:0,duration:1.1,ease:'sine.out'},3.9);
   }else if(!reduced()&&index===1&&target===2){
    gsap.set([newArt,newText],{opacity:0});
    timeline.to(oldText,{opacity:0,duration:.45},0)
     .to(from.querySelector('.courtyard-rose-frame'),{opacity:0,duration:.5},0)
     .to(from.querySelector('.courtyard-title-shade'),{opacity:.35,duration:.6},0)
     .to(oldArt,{scale:1.16,duration:1.7,ease:'sine.inOut'},.25)
     .call(()=>sound('footstep'),[],.6).call(()=>sound('footstep'),[],1.2)
     .to(oldArt,{opacity:0,duration:.5},1.25)
     .fromTo(newArt,{scale:.94,opacity:0},{scale:1,opacity:1,duration:.85,ease:'sine.out'},1.45)
     .fromTo(newText,{opacity:0,y:8},{opacity:1,y:0,duration:.45},2.15);
   }else if(!reduced()&&index===2&&target===3){
    gsap.set([newArt,newText],{opacity:0});
    timeline.to(oldText,{opacity:0,duration:.3},0)
     .to(from.querySelector('.character-bifari'),{xPercent:28,scale:.76,y:-15,duration:1.4},0)
     .to(from.querySelector('.character-syafira'),{xPercent:35,scale:.76,y:-15,duration:1.4},.1)
     .to(oldArt,{scale:1.16,duration:1.6,ease:'sine.inOut'},.15)
     .call(()=>sound('footstep'),[],.45).call(()=>sound('footstep'),[],1.05)
     .to(oldArt,{opacity:0,duration:.5},1.1)
     .fromTo(newArt,{scale:.96,opacity:0},{scale:1,opacity:1,duration:.9},1.2)
     .fromTo(newText,{opacity:0,y:8},{opacity:1,y:0,duration:.4},1.9);
   }else if(!reduced()&&index===3&&target===4){
    gsap.set([newArt,newText],{opacity:0});
    timeline.to(oldText,{opacity:0,duration:.25},0)
     .to(from.querySelector('.clockroom-countdown'),{opacity:0,duration:.3},0)
     .to(oldArt,{xPercent:-12,scale:1.06,duration:1.6,ease:'sine.inOut'},0)
     .call(()=>sound('footstep'),[],.4).call(()=>sound('footstep'),[],1)
     .to(oldArt,{opacity:0,duration:.55},.85)
     .fromTo(newArt,{xPercent:8,opacity:0},{xPercent:0,opacity:1,duration:1.1,ease:'sine.inOut'},.8)
     .fromTo(newText,{opacity:0,y:8},{opacity:1,y:0,duration:.4},1.7);
   }else if(!reduced()&&target>=5&&target<=12&&(index===4||index>=5&&index<=12)){
    const entering=index===4,card=to.querySelector('.agenda-card');
    gsap.set([newArt,newText,card],{opacity:0});
    timeline.call(()=>sound('page'),[],0).to(oldText,{opacity:0,duration:.25},0);
    if(entering){timeline.to(from.querySelector('.maproom-venue'),{opacity:0,duration:.3},0).to(oldArt,{scale:1.2,yPercent:-7,duration:1.5,ease:'sine.inOut'},0);}
    else{timeline.to(from.querySelector('.agenda-card'),{y:-direction*18,opacity:0,duration:.55,ease:'sine.in'},0);}
    timeline.to(oldArt,{opacity:0,duration:entering?.65:.35},entering?.65:.25)
     .fromTo(newArt,{opacity:0,scale:entering?.95:1},{opacity:1,scale:1,duration:entering?.9:.4},entering?.6:.25)
     .fromTo(card,{y:direction*28,opacity:0},{y:0,rotationY:0,opacity:1,duration:.8,ease:'sine.out'},entering?1.1:.35)
     .fromTo(newText,{opacity:0,y:6},{opacity:1,y:0,duration:.4},entering?1.6:.9);
    }else if(!reduced()&&index===12&&target===13){
    gsap.set([newArt,newText],{opacity:0});
    timeline.to(oldText,{opacity:0,duration:.25},0)
     .to(from.querySelector('.agenda-card'),{opacity:0,duration:.4},0)
     .to(oldArt,{scale:.93,yPercent:7,duration:1.1,ease:'sine.inOut'},0)
     .call(()=>sound('page'),[],0)
     .call(()=>sound('footstep'),[],.65).call(()=>sound('footstep'),[],1.2)
     .to(oldArt,{opacity:0,duration:.55},.7)
     .fromTo(newArt,{xPercent:9,scale:1.04,opacity:0},{xPercent:0,scale:1,opacity:1,duration:1.25,ease:'sine.inOut'},.65)
     .fromTo(newText,{opacity:0,y:7},{opacity:1,y:0,duration:.45},1.85);
   }else if(!reduced()&&target>=14&&index>=13){
    gsap.set([newArt,newText],{opacity:0});timeline.to(oldText,{opacity:0,duration:.3},0).to(oldArt,{scale:1.07,xPercent:-5,duration:1.3,ease:'sine.inOut'},0).call(()=>sound('footstep'),[],.4).call(()=>sound('footstep'),[],.95).to(oldArt,{opacity:0,duration:.6},.7).fromTo(newArt,{scale:.96,opacity:0},{scale:1,opacity:1,duration:1.1},.8).fromTo(newText,{opacity:0,y:8},{opacity:1,y:0,duration:.5},1.7);
   }else if(reduced()){
    timeline.to(oldText,{opacity:0,duration:.1}).set(oldArt,{opacity:0}).from(newArt,{opacity:0,duration:.14}).from(newText,{opacity:0,duration:.15},'<');
   }else{
    sound(index===0?'step':'page');
    const gate=index===0&&direction===1,travel=gate?1.15:0;
    if(gate){
     courtyard.pass(timeline);
    }
    timeline.to(oldText,{opacity:0,y:12,duration:.22},0)
     .to(from.querySelectorAll('[data-depth]'),{z:(_i,el)=>direction*(680+Number(el.dataset.depth)*.65),duration:1.2,ease:'power2.inOut'},travel)
     .to(oldArt,{opacity:0,duration:.5},travel+.55)
     .fromTo(to.querySelectorAll('[data-depth]'),{z:(_i,el)=>-direction*(1000+Number(el.dataset.depth)*1.5)},{z:0,duration:1.45,ease:'power3.out'},travel+.4)
     .from(newArt,{opacity:0,duration:.65},travel+.4)
     .fromTo('.vn-travel-frame',{z:-direction*200,opacity:.28},{z:direction*430,opacity:.55,duration:1.35,ease:'power2.inOut'},travel)
     .to('.vn-landscape',{scale:1+target*.018,yPercent:-target*.35,duration:1.6,ease:'power2.inOut'},travel)
     .fromTo('.vn-haze',{opacity:1},{opacity:.45,duration:1.3},travel+.1)
     .from(newText,{opacity:0,y:12,duration:.42},travel+1.2);
   }
   timeline.to('#journey-progress',{scaleX:target===0?.75:target===1?1:(target+1)/scenes.length,duration:.3},0);
  });
 }
 prologue=initPrologue(()=>{courtyard.show(0);controls();hydrateArt(scenes[0]);hydrateArt(scenes[1]);sound('morning');atmosphere();});
 controls();
 document.addEventListener('reservation-updated',()=>{if(index===14&&!busy)guestbook.controls();});
 return {goTo,chapter:async id=>{if(busy||prologue.busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(id==='arrival'){await prologue.show(0);controls();return true;}await goTo(id);if(id==='reservation')guestbook.show(2);else if(id==='gate')courtyard.show(0);else if(id==='greeting')welcome.show(0);else if(id==='countdown')clockroom.show(1);else if(id==='location')maproom.show(1);else if(id==='dresscode')wardrobe.show(1);gsap.set(scenes[index].querySelector('.vn-dialogue'),{clearProps:'transform,translate,scale,rotate'});controls();return true;},next:()=>{if(prologue.active)return prologue.next();if(busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(index===0&&courtyard.step<2)return courtyard.next();if(index===2&&welcome.step<welcome.last)return welcome.next();if(index===3&&clockroom.step<clockroom.last)return clockroom.next();if(index===4&&maproom.step<maproom.last)return maproom.next();if(index===13&&wardrobe.step<wardrobe.last)return wardrobe.next();if(index===14&&guestbook.step<2)return guestbook.next();return goTo(index+1);},back:()=>{if(prologue.active)return prologue.back();if(busy||courtyard.busy||welcome.busy||clockroom.busy||maproom.busy||wardrobe.busy||guestbook.busy)return false;if(index===2&&welcome.step>0)return welcome.back();if(index===3&&clockroom.step>0)return clockroom.back();if(index===4&&maproom.step>0)return maproom.back();if(index===0){if(courtyard.step>0)return courtyard.back();ambient.forEach(t=>t.kill());root.classList.remove('courtyard-active');return prologue.show();}if(index===13&&wardrobe.step>0)return wardrobe.back();if(index===14&&guestbook.step>0)return guestbook.back();return goTo(index-1);}};
}
export function stampTicket(){if(reduced())return;gsap.from('.ticket-card',{y:10,opacity:0,duration:.5});sound('seal');}
