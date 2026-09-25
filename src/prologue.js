import gsap from 'gsap';
import { hydrateArt } from './art.js';
import { sound, startAudio } from './audio.js';
import { burnPaper } from './paper-burn.js';

const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const lines=['Hari ini terasa seperti hari biasa.','Ada ketukan di pintu.','Tak ada siapa-siapa…','Hah, ada undangan.','Dari siapa ya…','Untukku?','Anda diundang.'];
const last=lines.length-1;
const descriptions=[
 'Di dalam rumah, kamu menghadap pintu kayu yang tertutup.',
 'Tiga ketukan terdengar dari pintu.',
 'Tanganmu menggenggam handle dan membuka pintu. Teras kosong. Awan bergerak dan pohon bergoyang di luar.',
 'Kamu menunduk. Sebuah amplop bersegel maroon tergeletak di ambang pintu.',
 'Kamu memperhatikan undangan itu, penasaran siapa pengirimnya.',
 'Kamu mengambil undangan dan membaca nama di amplop.',
 'Kamu membuka segel. Pada kartu tertulis: Anda diundang. Lanjut untuk melihat kartu terbakar menjadi abu sebelum portal terbuka.'
];

export function initPrologue(onExit){
 const root=document.querySelector('#invitation'),section=document.querySelector('#arrival'),stage=root.querySelector('.vn-stage');
 const back=root.querySelector('#nav-back'),next=root.querySelector('#nav-next');
 let step=0,active=true,busy=false,timeline;
 const $=selector=>section.querySelector(selector);
 async function prepare(target){
  const selectors={1:'.arrival-knocks',2:'.arrival-envelope-paint,.arrival-door-hand,.arrival-garden img',5:'.arrival-sealed img',6:'.arrival-open img',7:'.arrival-floating img,.arrival-portal img'};
  const images=selectors[target]?[...section.querySelectorAll(selectors[target])]:[];
  for(const img of images){if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';}
  await Promise.all(images.map(img=>img.decode().catch(()=>{})));
  if(target===7)await Promise.all([hydrateArt(document.querySelector('#gate')),hydrateArt(document.querySelector('.vn-world'))]);
 }
 function controls(){
  root.dataset.prologue=active?'active':'complete';root.dataset.prologueBusy=String(busy);section.dataset.step=String(step);
  if(!active)return;
  back.disabled=busy||step===0;next.disabled=busy;
  root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ ${String(lines.length).padStart(2,'0')}</small>`;
  gsap.set('#journey-progress',{scaleX:(step+1)/lines.length});
 }
 function lineFor(target){return target===5?`Untuk… ${$('#arrival-guest').textContent}.` :lines[target];}
 function describe(){
  $('#arrival-line').textContent=lineFor(step);$('#arrival-description').textContent=`${descriptions[step]} ${lineFor(step)}`;
  $('.arrival-sealed').setAttribute('aria-hidden',String(step!==5));
  $('.arrival-open').setAttribute('aria-hidden',String(step!==6));
 }
 function cameraPose(target){return {scale:target<2?1:target===3||target===4?1.65:1.12,xPercent:0,yPercent:target<2?0:target===3||target===4?-24:3,rotationX:target===3||target===4?5:0};}
 function pose(target){
  gsap.set($('.arrival-camera'),cameraPose(target));
  gsap.set($('.arrival-door'),{rotationY:target<2?0:-102,x:0});
  gsap.set($('.arrival-door-hand'),{opacity:0,x:0,y:0,rotation:0});
  gsap.set($('.arrival-garden'),{opacity:target<2?0:1});
  gsap.set($('.arrival-floor-envelope'),{opacity:target>=2&&target<=4?1:0,scale:1,y:0});
  gsap.set($('.arrival-sealed'),{autoAlpha:target===5?1:0,y:0,scale:1,rotation:0,rotationX:0});
  gsap.set($('.arrival-open'),{autoAlpha:target===6?1:0,y:0,scale:1,rotation:0});
  gsap.set($('.arrival-card-copy'),{opacity:1});
  gsap.set($('.arrival-floating'),{autoAlpha:0,y:0,scale:1,rotation:0});
  burnPaper($('.arrival-burning-paper'),$('.arrival-burn-edge'),0);
  section.dataset.burn='idle';
  gsap.set($('.arrival-portal'),{autoAlpha:0,scale:.15});
  gsap.set($('.arrival-ink-ring'),{rotation:0});
  gsap.set($('.arrival-portal-shade'),{opacity:0});
  gsap.set($('.arrival-caption'),{opacity:target===6?0:1});
  gsap.set($('.arrival-knocks'),{opacity:0});
 }
 // Announce the complete line once; only the decorative visual copy is typed.
 function dialogue(t,target){
  if(target===6)return;
  const text=lineFor(target),cursor={letters:0};
  t.call(()=>{$('#arrival-line').textContent='';$('#arrival-description').textContent=`${descriptions[target]} ${text}`;section.dataset.speaking='true';})
   .to($('.arrival-caption'),{opacity:1,duration:.18})
   .to(cursor,{letters:text.length,duration:reduced()?0:Math.max(.6,text.length*.035),ease:'none',onUpdate:()=>{$('#arrival-line').textContent=text.slice(0,Math.ceil(cursor.letters));}})
   .call(()=>{section.dataset.speaking='false';});
 }
 function complete(target){step=target;busy=false;describe();controls();void prepare(Math.min(target+1,last+1));if(back.disabled&&document.activeElement===back)next.focus({preventScroll:true});}
 function run(build,done){return new Promise(resolve=>{timeline=gsap.timeline({onComplete:()=>{done();resolve(true);}});build(timeline);});}
 function knocks(t){
  t.call(()=>{section.dataset.knock='playing';sound('knock');},[],.12);
  for(let i=0;i<3;i++){
   const at=.12+i*.26;
   t.fromTo($('.arrival-knocks'),{opacity:0,scale:.92},{opacity:1,scale:1.04,duration:.07},at)
    .to($('.arrival-knocks'),{opacity:0,scale:1,duration:.16},at+.07);
   if(!reduced())t.to($('.arrival-door'),{x:2,duration:.05,repeat:1,yoyo:true},at);
  }
  // Last audio impulse ends at 0.80 s. Dialogue starts after the tail.
  t.call(()=>{section.dataset.knock='complete';},[],1.02);
 }
 async function move(target){
  if(!active||busy||target<0||target>last+1)return false;
  busy=true;controls();await prepare(target);
  if(target===last+1)return enterPortal();
  if(target===1&&target>step)await startAudio();
  const backwards=target<step;
  return run(t=>{
   t.to($('.arrival-caption'),{opacity:0,duration:.15},0);
   if(backwards||reduced()){
    if(target===1&&!backwards)knocks(t);
    else t.to($('.arrival-view'),{opacity:.55,duration:.12});
    t.call(()=>pose(target)).to($('.arrival-view'),{opacity:1,duration:.18});
   }else if(target===1){
    knocks(t);
   }else if(target===2){
    t.to($('.arrival-camera'),{scale:1.12,yPercent:3,duration:1.1,ease:'power2.inOut'},0)
     .fromTo($('.arrival-door-hand'),{opacity:0,x:-65,y:85,rotation:-8},{opacity:1,x:0,y:0,rotation:0,duration:.7,ease:'power2.out'},.25)
     .to($('.arrival-door-hand'),{rotation:0,duration:.2},1)
     .call(()=>sound('latch'),[],1.05)
     .call(()=>sound('door'),[],1.22)
     .set($('.arrival-garden'),{opacity:1},1.22)
     .to($('.arrival-door'),{rotationY:-102,x:0,duration:2,ease:'power2.inOut'},1.22)
     .to($('.arrival-door-hand'),{rotation:0,duration:.25},1.5)
     .to($('.arrival-door-hand'),{opacity:0,x:-35,y:65,duration:.45},1.85)
     .to($('.arrival-floor-envelope'),{opacity:1,duration:.5},1.7)
     .to($('.arrival-camera'),{xPercent:-1.8,duration:.6,ease:'sine.inOut'},3.2)
     .to($('.arrival-camera'),{xPercent:0,duration:.6,ease:'sine.inOut'},3.8);
   }else if(target===3){
    t.call(()=>sound('step'),[],.1).to($('.arrival-camera'),{...cameraPose(3),duration:1.6,ease:'power2.inOut'},0);
   }else if(target===4){
    t.to($('.arrival-floor-envelope'),{scale:1.035,duration:.45,ease:'sine.inOut'},0);
   }else if(target===5){
    t.call(()=>sound('paper-lift'),[],.25)
     .to($('.arrival-floor-envelope'),{opacity:0,y:-60,duration:.55},.25)
     .fromTo($('.arrival-sealed'),{autoAlpha:0,y:window.innerHeight*.45,scale:.68,rotation:-9},{autoAlpha:1,y:0,scale:1,rotation:0,duration:1.4,ease:'power2.out'},.5)
     .to($('.arrival-camera'),{...cameraPose(5),duration:1.4,ease:'power2.inOut'},.45);
   }else if(target===6){
    t.call(()=>sound('seal'),[],.2)
     .to($('.arrival-sealed'),{rotation:-4,scale:1.03,duration:.35,ease:'power2.inOut'},0)
     .call(()=>sound('page'),[],.35)
     .to($('.arrival-sealed'),{rotationX:-24,y:70,autoAlpha:0,duration:.7,ease:'power2.in'},.35)
     .fromTo($('.arrival-open'),{autoAlpha:0,y:120,scale:.82,rotation:5},{autoAlpha:1,y:0,scale:1,rotation:0,duration:1,ease:'power2.out'},.55)
     .fromTo($('.arrival-card-copy'),{opacity:0},{opacity:1,duration:.8},1.2);
   }
   dialogue(t,target);
  },()=>complete(target));
 }
 function enterPortal(){
  const held=$('.arrival-open').getBoundingClientRect(),bounds=section.getBoundingClientRect();
  const floating=$('.arrival-floating'),paper=$('.arrival-burning-paper'),edge=$('.arrival-burn-edge');
  const width=held.width*.7,height=held.height*.56,left=held.x+held.width*.15-bounds.x,top=held.y+held.height*.1-bounds.y;
  gsap.set(floating,{left,top,width,height,autoAlpha:0,y:0,scale:1,rotation:-2});
  gsap.set($('.arrival-portal'),{left:left+width/2,top:top+height/2-25,autoAlpha:0,scale:.06});
  burnPaper(paper,edge,0);
  const burn={progress:0},burnStart=reduced()?.45:1.1,burnDuration=reduced()?1:3.2,portalStart=burnStart+burnDuration+.4;
  return run(t=>{
   t.to($('.arrival-heading'),{opacity:0,duration:.35},0);
   t.to($('.arrival-card-copy'),{opacity:0,duration:.2},0)
    .to(floating,{autoAlpha:1,y:reduced()?0:-25,duration:.35},0)
    .to($('.arrival-open'),{autoAlpha:0,y:reduced()?0:innerHeight*.55,duration:reduced()?.3:.8,ease:'power2.in'},.05)
    .call(()=>{section.dataset.burn='burning';$('#arrival-description').textContent='Kartu terangkat. Api menjalar di kertas, menyisakan abu.';sound('ignite');sound(reduced()?'burn-short':'burn');},[],burnStart)
    .to(burn,{progress:1,duration:burnDuration,ease:'none',onUpdate:()=>burnPaper(paper,edge,burn.progress)},burnStart)
    .set(floating,{autoAlpha:0},burnStart+burnDuration)
    .call(()=>{section.dataset.burn='complete';$('#arrival-description').textContent='Kertas habis menjadi abu.';},[],burnStart+burnDuration)
    .call(()=>{section.dataset.burn='portal';$('#arrival-description').textContent='Setelah kertas habis, sebuah portal terbuka di hadapanmu.';sound('portal');},[],portalStart);
   if(reduced()){
    t.to($('.arrival-portal'),{autoAlpha:1,scale:1,duration:.25},portalStart).to(section,{opacity:0,duration:.35},portalStart+.45);
   }else{
    t.to($('.arrival-portal'),{autoAlpha:1,scale:1,duration:1.4,ease:'power2.in'},portalStart)
     .to($('.arrival-ink-ring'),{rotation:210,duration:3.8,ease:'power1.in'},portalStart)
     .to($('.arrival-camera'),{scale:1.3,duration:3},portalStart)
     .to($('.arrival-portal'),{scale:8,duration:2.1,ease:'power3.in'},portalStart+1.4)
     .to(section,{opacity:0,duration:.7},portalStart+3.2);
   }
  },()=>{active=false;busy=false;section.hidden=true;section.inert=true;section.setAttribute('aria-hidden','true');root.classList.remove('intro-active');stage.inert=false;controls();onExit();});
 }
 async function show(){
  if(busy)return false;active=true;busy=true;step=last;section.hidden=false;section.inert=false;section.removeAttribute('aria-hidden');root.classList.add('intro-active');stage.inert=true;gsap.set([section,$('.arrival-heading')],{opacity:1});controls();await prepare(last);pose(last);complete(last);return true;
 }
 function dismiss(){timeline?.kill();active=false;busy=false;section.hidden=true;section.inert=true;section.setAttribute('aria-hidden','true');root.classList.remove('intro-active');stage.inert=false;controls();}
 stage.inert=true;pose(0);describe();controls();void prepare(1);
 return {get active(){return active;},get busy(){return busy;},next:()=>move(step+1),back:()=>move(step-1),controls,show,dismiss};
}
