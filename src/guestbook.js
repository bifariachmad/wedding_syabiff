import gsap from 'gsap';
import {sound} from './audio.js';
const captions=['Ini buku tamu kami. Mari dibuka, ada satu halaman untukmu.','','Silakan tuliskan nama dan jumlah tamu yang akan hadir.'];
export function initGuestbook(canContinue=()=>true){
 const root=document.querySelector('#invitation'),scene=document.querySelector('#reservation'),book=scene.querySelector('.guestbook-spread'),leaf=scene.querySelector('.book-leaf'),dialogue=scene.querySelector('.vn-dialogue');let step=0,busy=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function controls(){scene.dataset.bookStep=String(step);root.dataset.bookBusy=String(busy);root.querySelector('#nav-next').disabled=busy||(step===2&&!canContinue());root.querySelector('#nav-next').textContent=['Buka Buku','Isi Buku Tamu',canContinue()?'Lihat Tiket':'Lanjut'][step];root.querySelector('#nav-back').disabled=busy;root.querySelector('#journey-position').innerHTML=String(step===0?1:2).padStart(2,'0')+' <small>/ 02</small>';gsap.set('#journey-progress',{scaleX:(step===0?1:2)/2});}
 const right=scene.querySelector('.book-right');
 function zoomPose(){
  const saved=scene.dataset.bookStep;scene.dataset.bookStep='2';
  gsap.set(book,{x:0,y:0,xPercent:0,scaleX:1,scaleY:1});
  const base=book.getBoundingClientRect(),page=right.getBoundingClientRect(),target=dialogue.getBoundingClientRect();
  scene.dataset.bookStep=saved;
  const scaleX=target.width/page.width,scaleY=target.height/page.height;
  return {x:target.left-base.left-(page.left-base.left)*scaleX,y:target.top-base.top,scaleX,scaleY,xPercent:0};
 }
 function pose(){controls();gsap.set(leaf,{rotationY:step?-180:0});gsap.set(right,{opacity:step?1:0,clipPath:'inset(0% 0% 0% 0%)'});gsap.set(book,{opacity:1,x:0,y:0,scale:1,xPercent:step===0?-25:0});if(step===2)gsap.set(book,zoomPose());gsap.set(dialogue,{opacity:1,clearProps:'transform,translate,scale,rotate'});scene.querySelector('.guestbook-line').textContent=captions[step];}
 function show(at=0){step=at;busy=false;pose();}
 function move(at){if(busy||at<0||at>2)return false;busy=true;controls();const duration=n=>reduced()?0:n;
 return new Promise(resolve=>{const t=gsap.timeline({onComplete:()=>{step=at;busy=false;if(at===1){move(2).then(resolve);return;}pose();resolve(true);}});t.to(dialogue,{opacity:0,duration:duration(.2)},0).call(()=>sound('page'),[],0);
 if(at===2){const target=zoomPose();gsap.set(book,{x:0,y:0,xPercent:0,scaleX:1,scaleY:1});t.to(book,{...target,duration:duration(1.65),ease:'power2.inOut'},duration(.2));}
 else{t.to(book,{x:0,y:0,scaleX:1,scaleY:1,xPercent:at===0?-25:0,opacity:1,duration:duration(1.4),ease:'sine.inOut'},duration(.2)).to(leaf,{rotationY:at===0?0:-180,duration:duration(1.6),ease:'sine.inOut'},duration(.2));if(at===1)t.set(right,{opacity:1},duration(.24));if(at===0)t.set(right,{opacity:0},duration(1.75));}
 });}
 new ResizeObserver(()=>{if(!busy&&scene.classList.contains('is-active'))pose();}).observe(root);
 return{get step(){return step;},get last(){return 2;},get busy(){return busy;},show,controls,next:()=>move(step===0?1:2),back:()=>move(0)};
}
