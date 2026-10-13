import gsap from 'gsap';
import {fitDialogue} from './dialogue-artwork.js';
import { sound } from './audio.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=['Di mana ini…? Rasanya tidak asing.','Aku penasaran...',''];
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
 function caption(){ fitDialogue($('#courtyard-line'),lines[step]);$('#courtyard-line').textContent=lines[step];$('#courtyard-description').textContent=lines[step]; }
 function pose(){
  gsap.set($('.courtyard-camera'),{scale:step?1.09:1,x:0,y:0,rotation:0,opacity:1});
  gsap.set($('.courtyard-heading'),{opacity:1});
  gsap.set($('.courtyard-left'),{rotationY:step===2?-82:0});
  gsap.set($('.courtyard-right'),{rotationY:step===2?82:0});
  $('.vn-dialogue').hidden=step===2;
  gsap.set($('.vn-dialogue'),{opacity:step===2?0:1,y:0});caption();controls();
 }
 function show(at=0){step=at;busy=false;pose();}
 async function move(target){
  if(busy||target<0||target>2)return false;
  busy=true;controls();
  return new Promise(resolve=>{
   timeline=gsap.timeline({onComplete:()=>{step=target;busy=false;caption();controls();resolve(true);}});
   timeline.to($('.vn-dialogue'),{opacity:0,duration:.15})
    .call(()=>{$('.vn-dialogue').hidden=true;});
   if(reduced()){
    timeline.set($('.courtyard-left'),{rotationY:target===2?-82:0}).set($('.courtyard-right'),{rotationY:target===2?82:0});
   }else if(target===2||step===2){
    const at=timeline.duration();
    timeline.call(()=>{sound('latch');sound('gate');},[],at)
     .to($('.courtyard-left'),{rotationY:target===2?-82:0,duration:2.1,ease:'sine.inOut'},at+.1)
     .to($('.courtyard-right'),{rotationY:target===2?82:0,duration:2.2,ease:'sine.inOut'},at+.16);
   }else{
    const at=timeline.duration();
    walk(timeline,target?[1.045,1.09]:[1.045,1],0,at);
   }
   const cursor={letters:0},text=lines[target];
   timeline.call(()=>{step=target;fitDialogue($('#courtyard-line'),text);$('#courtyard-description').textContent=text;$('#courtyard-line').textContent='';$('.vn-dialogue').hidden=!text;})
    .to($('.vn-dialogue'),{opacity:target===2?0:1,duration:target===2?0:.25})
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
  // Remove the frame from layout for the entire walk, independently of fades.
  $('.vn-dialogue').hidden=true;
  gate.dataset.walk='walking';
  gsap.set($('.courtyard-crow'),{x:-root.clientWidth*.35,y:0,opacity:0});
  t.set($('.courtyard-crow'),{opacity:1},.25)
   .to($('.courtyard-crow'),{x:root.clientWidth*1.15,y:-root.clientHeight*.12,duration:1.35,ease:'none'},.1)
   .call(()=>sound('crow'),[],.3).set($('.courtyard-crow'),{opacity:0},1.5);
  walk(t,[1.4,1.95,2.65],36);
  t.to($('.courtyard-heading'),{opacity:0,duration:.3},0)
   .to($('.courtyard-tree-left'),{xPercent:-85,duration:1.6,ease:'sine.inOut'},0)
   .to($('.courtyard-tree-right'),{xPercent:85,duration:1.6,ease:'sine.inOut'},0)
   .call(()=>{gate.dataset.walk='complete';sound('morning');},[],1.65);
 }
 function resetTrees(){gsap.set(gate.querySelectorAll('.courtyard-tree'),{xPercent:0});gsap.set($('.courtyard-crow'),{opacity:0});gate.dataset.walk='idle';}
 return {get step(){return step;},get busy(){return busy;},controls,show:(at)=>{resetTrees();show(at);},next:()=>move(step+1),back:()=>move(step-1),pass};
}


