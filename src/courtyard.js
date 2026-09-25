import gsap from 'gsap';
import { sound } from './audio.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=['Di mana ini…? Udara pagi terasa hangat.','Ada jalan di balik gerbang itu.','Gerbangnya terbuka. Aku akan masuk.'];
export function initCourtyard(){
 const root=document.querySelector('#invitation'),gate=document.querySelector('#gate');
 let step=0,busy=false,timeline;
 const $=s=>gate.querySelector(s);
 function controls(){
  gate.dataset.courtyardStep=String(step);root.dataset.courtyardBusy=String(busy);
  root.querySelector('#nav-back').disabled=busy;root.querySelector('#nav-next').disabled=busy;
  root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ 04</small>`;
  gsap.set('#journey-progress',{scaleX:(step+1)/4});
 }
 function caption(){ $('#courtyard-line').textContent=lines[step];$('#courtyard-description').textContent=lines[step]; }
 function pose(){
  gsap.set($('.courtyard-camera'),{scale:step?1.09:1,x:0,y:0,rotation:0,opacity:1});
  gsap.set($('.courtyard-heading'),{opacity:1});
  gsap.set($('.courtyard-left'),{rotationY:step===2?-102:0});
  gsap.set($('.courtyard-right'),{rotationY:step===2?102:0});
  gsap.set($('.vn-dialogue'),{opacity:1,y:0});caption();controls();
 }
 function show(at=0){step=at;busy=false;pose();}
 async function move(target){
  if(busy||target<0||target>2)return false;
  busy=true;controls();
  return new Promise(resolve=>{
   timeline=gsap.timeline({onComplete:()=>{step=target;busy=false;caption();controls();resolve(true);}});
   timeline.to($('.vn-dialogue'),{opacity:0,duration:.15});
   if(reduced()){
    timeline.set($('.courtyard-left'),{rotationY:target===2?-102:0}).set($('.courtyard-right'),{rotationY:target===2?102:0});
   }else if(target===2||step===2){
    timeline.call(()=>{sound('latch');sound('gate');})
     .to($('.courtyard-left'),{rotationY:target===2?-102:0,duration:1.9,ease:'power2.inOut'})
     .to($('.courtyard-right'),{rotationY:target===2?102:0,duration:2.1,ease:'power2.inOut'},'<.1');
   }else{
    const at=timeline.duration();
    walk(timeline,target?[1.045,1.09]:[1.045,1],0,at);
   }
   const cursor={letters:0},text=lines[target];
   timeline.call(()=>{step=target;$('#courtyard-description').textContent=text;$('#courtyard-line').textContent='';})
    .to($('.vn-dialogue'),{opacity:1,duration:.25})
    .to(cursor,{letters:text.length,duration:reduced()?0:text.length*.027,ease:'none',onUpdate:()=>{$('#courtyard-line').textContent=text.slice(0,Math.ceil(cursor.letters));}});
  });
 }
 function walk(t,scales,endY,at=0){
  const camera=$('.courtyard-camera');
  scales.forEach((scale,i)=>{
   const start=at+i*.56,landing=endY*(i+1)/scales.length,side=i%2?1:-1;
   t.to(camera,{scale,duration:.52,ease:'sine.inOut'},start)
    .to(camera,{y:landing-10,x:side*2,rotation:side*.12,duration:.25,ease:'sine.out'},start)
    .to(camera,{y:landing,x:0,rotation:0,duration:.27,ease:'sine.inOut'},start+.25)
    .call(()=>sound('footstep'),[],start+.4);
  });
 }
 function pass(t){
  gate.dataset.walk='walking';
  walk(t,[1.22,1.41,1.65,1.94,2.27,2.65],36);
  t.to($('.courtyard-heading'),{opacity:0,duration:.3},0)
   .to($('.courtyard-tree-left'),{xPercent:-85,duration:3.3,ease:'sine.inOut'},0)
   .to($('.courtyard-tree-right'),{xPercent:85,duration:3.3,ease:'sine.inOut'},0)
   .call(()=>{gate.dataset.walk='complete';sound('morning');},[],3.36);
 }
 function resetTrees(){gsap.set(gate.querySelectorAll('.courtyard-tree'),{xPercent:0});}
 return {get step(){return step;},get busy(){return busy;},controls,show:(at)=>{resetTrees();show(at);},next:()=>move(step+1),back:()=>move(step-1),pass};
}

