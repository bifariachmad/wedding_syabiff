import gsap from 'gsap';
import { hydrateArt } from './art.js';
import { sound } from './audio.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initMotion(){
 const root=document.querySelector('#invitation'),scenes=[...root.querySelectorAll('.vn-scene')];
 const back=root.querySelector('#nav-back'),next=root.querySelector('#nav-next');
 let index=0,busy=false,ambient=[];
 const controls=()=>{back.disabled=busy||index===0;next.disabled=busy||index===scenes.length-1;root.dataset.scene=String(index);root.dataset.travelling=String(busy);};
 function atmosphere(){
  ambient.forEach(t=>t.kill());ambient=[];if(reduced())return;
  const loop=(selector,vars)=>{const targets=scenes[index].querySelectorAll(selector);if(targets.length)ambient.push(gsap.to(targets,{repeat:-1,yoyo:true,ease:'sine.inOut',...vars}));};
  loop('.hanging-lantern,.final-lantern',{rotation:4,duration:4,transformOrigin:'50% 0%'});
  loop('.flying-raven',{y:-9,rotation:3,duration:3});
  loop('.floating-key,.near-petal',{y:-12,rotation:10,duration:5});
  loop('.pendulum-hero',{rotation:12,duration:1.4,transformOrigin:'50% 0%'});
 }
 document.addEventListener('visibilitychange',()=>ambient.forEach(t=>document.hidden?t.pause():t.resume()));
 function finish(from,to,target){
  from.classList.remove('is-active','is-visible','is-travelling');
  from.setAttribute('aria-hidden','true');from.inert=true;
  to.classList.remove('is-travelling');to.classList.add('is-active','is-visible');
  to.removeAttribute('aria-hidden');to.inert=false;
  index=target;busy=false;controls();
  root.querySelector('#journey-position').innerHTML=`${String(index+1).padStart(2,'0')} <small>/ ${scenes.length}</small>`;
  root.querySelector('#journey-announcement').textContent=`${index+1} dari ${scenes.length}. ${to.querySelector('h1,h2').textContent}`;
  atmosphere();
  // Warm only the adjacent pages; distant chapters do not delay the first scene.
  for(const near of [scenes[index-1],scenes[index+1]])if(near)hydrateArt(near);
  if(document.activeElement?.disabled)(index===scenes.length-1?back:next).focus({preventScroll:true});
 }
 async function goTo(target){
  if(typeof target==='string')target=scenes.findIndex(s=>s.id===target);
  if(busy||target<0||target>=scenes.length||target===index)return false;
  busy=true;controls();
  const from=scenes[index],to=scenes[target],direction=target>index?1:-1;
  ambient.forEach(t=>t.kill());ambient=[];
  await hydrateArt(to);
  from.inert=true;to.inert=true;to.classList.add('is-travelling');
  const oldArt=from.querySelector('.vn-artwork'),newArt=to.querySelector('.vn-artwork');
  const oldText=from.querySelector('.vn-dialogue'),newText=to.querySelector('.vn-dialogue');
  gsap.set([oldArt,newArt,oldText,newText],{clearProps:'transform,opacity,visibility'});
  gsap.set(to.querySelectorAll('[data-depth]'),{z:0});
  if(to.id==='gate')gsap.set('.gate-leaf,.gate-chain',{clearProps:'all'});
  return new Promise(resolve=>{
   const timeline=gsap.timeline({onComplete:()=>{finish(from,to,target);resolve(true);}});
   if(reduced()){
    timeline.to(oldText,{opacity:0,duration:.1}).set(oldArt,{opacity:0}).from(newArt,{opacity:0,duration:.14}).from(newText,{opacity:0,duration:.15},'<');
   }else{
    sound(index===0?'gate':'page');
    const gate=index===0&&direction===1,travel=gate?.72:0;
    if(gate){
     timeline.to('.gate-chain',{y:120,rotation:-70,opacity:0,duration:.55},0)
      .to('.gate-left',{rotationY:-87,transformOrigin:'0% 50%',duration:1.15,ease:'power2.inOut'},.15)
      .to('.gate-right',{rotationY:87,transformOrigin:'100% 50%',duration:1.15,ease:'power2.inOut'},.15)
      .call(()=>sound('chain'),[],.2);
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
   timeline.to('#journey-progress',{scaleX:(target+1)/scenes.length,duration:.3},0);
  });
 }
 controls();atmosphere();
 return {goTo,next:()=>goTo(index+1),back:()=>goTo(index-1)};
}
export function stampTicket(){if(reduced())return;gsap.from('.ticket-card',{y:10,opacity:0,duration:.5});sound('seal');}
