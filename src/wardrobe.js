import gsap from 'gsap';
import {sound} from './audio.js';
const lines=[
 ['SYAFIRA','Sebelum beranjak, lihat lemari di sebelah meja ini. Ada satu warna yang kami pilih untuk hari itu.'],
 ['SYAFIRA','Maroon. Kami ingin warna hangat ini menemani kebersamaan kita.'],
 ['BIFARI','Kenakan pakaian maroon yang nyaman untukmu. Kita akan menghabiskan waktu bersama, makan, dan berfoto.'],
 ['SYAFIRA','Nah, sekarang tinggal menyiapkan tempat untukmu. Mari tuliskan namamu di buku tamu.']
];
export function initWardrobe(){
 const root=document.querySelector('#invitation'),scene=document.querySelector('#dresscode'),line=scene.querySelector('#wardrobe-line'),swatch=scene.querySelector('.wardrobe-swatch');let step=0,busy=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function controls(){scene.dataset.wardrobeStep=String(step);root.dataset.wardrobeBusy=String(busy);root.querySelector('#nav-next').disabled=busy;root.querySelector('#nav-back').disabled=busy;root.querySelector('#journey-position').innerHTML=`${String(step+1).padStart(2,'0')} <small>/ 04</small>`;gsap.set('#journey-progress',{scaleX:(step+1)/4});}
 function content(at){scene.querySelector('.vn-speaker').textContent=lines[at][0];scene.querySelector('#wardrobe-description').textContent=lines[at].join(': ');swatch.hidden=at===0||at===3;}
 function show(at=0){step=at;busy=false;content(step);line.textContent=lines[step][1];gsap.set(scene.querySelector('.wardrobe-camera'),{scale:step===1||step===2?1.055:1});gsap.set(swatch,{opacity:1,y:0,rotation:0});controls();}
 function move(at){if(busy||at<0||at>=lines.length)return false;busy=true;controls();const cursor={n:0};return new Promise(resolve=>{const t=gsap.timeline({onComplete:()=>{step=at;busy=false;line.textContent=lines[at][1];controls();resolve(true);}});t.call(()=>{content(at);line.textContent='';sound('paper-lift');}).to(scene.querySelector('.wardrobe-camera'),{scale:at===1||at===2?1.055:1,duration:reduced()?0:.85,ease:'sine.inOut'},0);if(at===1||at===2)t.fromTo(swatch,{opacity:0,y:24,rotation:-4},{opacity:1,y:0,rotation:0,duration:reduced()?0:.7},0);t.to(cursor,{n:lines[at][1].length,duration:reduced()?0:lines[at][1].length*.027,ease:'none',onUpdate:()=>{line.textContent=lines[at][1].slice(0,Math.ceil(cursor.n));}},.15);});}
 return{get step(){return step;},get last(){return lines.length-1;},get busy(){return busy;},show,controls,next:()=>move(step+1),back:()=>move(step-1)};
}
