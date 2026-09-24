import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sound } from './audio.js';
gsap.registerPlugin(ScrollTrigger);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initMotion(){
 const media=gsap.matchMedia();
 media.add('(prefers-reduced-motion: no-preference)',()=>{
   const loops=new Map();
   const loop=(section,selector,vars)=>{const targets=document.querySelectorAll(selector);if(!targets.length)return;const t=gsap.to(targets,{repeat:-1,yoyo:true,ease:'sine.inOut',paused:true,...vars});if(!loops.has(section))loops.set(section,[]);loops.get(section).push(t);};
   loop('gate','.gate-lantern',{rotation:3,transformOrigin:'50% 0%',duration:3.5});
   loop('gate','.gate-raven',{rotation:-5,transformOrigin:'50% 80%',duration:4});
   loop('gate','.fog',{xPercent:12,opacity:.1,duration:7,stagger:1});
   loop('cover','.cover-bat',{x:520,y:-35,rotation:12,duration:3,yoyo:false,repeatDelay:9});
   loop('cover','.cover-petal',{y:65,x:30,rotation:50,opacity:0,duration:8});
   loop('greeting','.greeting-rose',{rotation:2,duration:5,transformOrigin:'50% 100%'});
   loop('countdown','.clock-pendulum',{rotation:12,transformOrigin:'50% 0%',duration:1.3});
   loop('location','.map-pin',{y:-5,scale:1.08,duration:2});
   loop('rundown','.timeline-art',{rotation:2,duration:5,stagger:.5,transformOrigin:'50% 0%'});
   loop('rundown','.timeline-candle',{scaleY:.9,duration:12,transformOrigin:'50% 100%'});
   loop('dresscode','.cloth-art',{rotation:2,scaleX:1.025,duration:4});
   loop('dresscode','.falling-petal',{y:150,x:35,rotation:160,opacity:0,duration:8,yoyo:false});
   loop('reservation','.reservation-lantern',{rotation:-3,opacity:.8,duration:4,transformOrigin:'50% 0%'});
   loop('closing','.closing-raven',{x:580,y:-55,duration:6,repeatDelay:6,yoyo:false});
   loop('closing','.closing-star',{opacity:.4,duration:5,stagger:.7});
   const observer=new IntersectionObserver(entries=>entries.forEach(e=>(loops.get(e.target.id)||[]).forEach(t=>e.isIntersecting&&!document.hidden?t.resume():t.pause())));
   document.querySelectorAll('.scene').forEach(s=>observer.observe(s));
   const handleVisibility=()=>{for(const [id,list]of loops){const r=document.getElementById(id).getBoundingClientRect();list.forEach(t=>!document.hidden&&r.bottom>0&&r.top<innerHeight?t.resume():t.pause());}};
   document.addEventListener('visibilitychange',handleVisibility);
   gsap.from('#cover h1 span',{y:28,opacity:0,stagger:.25,duration:1,scrollTrigger:{trigger:'#cover h1',start:'top 90%',once:true}});
   gsap.from('.cover-seal',{scale:1.9,rotation:-14,opacity:0,duration:.75,scrollTrigger:{trigger:'.cover-seal',start:'top 90%',once:true,onEnter:()=>sound('seal')}});
   gsap.to('.cover-couple',{y:-22,ease:'none',scrollTrigger:{trigger:'#cover',start:'top bottom',end:'bottom top',scrub:1}});
   const text=document.querySelector('.greeting-copy'),original=text.textContent;text.textContent='';const readable=document.createElement('span');readable.className='sr-only';readable.textContent=original;text.append(readable);
   for(const word of original.split(' ')){const wrap=document.createElement('span');wrap.className='ink-word';wrap.setAttribute('aria-hidden','true');for(const char of word){const s=document.createElement('span');s.textContent=char;wrap.append(s);}text.append(wrap,document.createTextNode(' '));}
   gsap.from('.ink-word>span',{opacity:0,duration:.3,stagger:.004,scrollTrigger:{trigger:'#greeting',start:'top 60%',once:true}});
   gsap.from('.route-reveal',{scaleX:0,transformOrigin:'left',duration:1.1,scrollTrigger:{trigger:'.map-stage',start:'top 70%',once:true}});
   document.querySelectorAll('.timeline-row').forEach(row=>{gsap.from(row.querySelector('.timeline-rule'),{scaleY:0,transformOrigin:'top',duration:.9,scrollTrigger:{trigger:row,start:'top 85%',once:true}});gsap.from(row.querySelectorAll('.timeline-copy,.timeline-art'),{y:20,opacity:0,duration:.8,stagger:.12,scrollTrigger:{trigger:row,start:'top 85%',once:true}});});
   gsap.from('.closing-star',{opacity:0,duration:.6,stagger:.1,scrollTrigger:{trigger:'#closing',start:'top 70%',once:true}});
   gsap.from('.closing-moon',{y:80,opacity:0,duration:1.2,scrollTrigger:{trigger:'#closing',start:'top 70%',once:true}});
   gsap.to('.closing-lantern',{opacity:.45,ease:'none',scrollTrigger:{trigger:'#closing',start:'top 50%',end:'bottom bottom',scrub:1}});
   return()=>{observer.disconnect();document.removeEventListener('visibilitychange',handleVisibility);text.textContent=original;};
 });
 let opened=false;
 return()=>{if(opened){document.querySelector('#cover').scrollIntoView({behavior:reduced()?'instant':'smooth'});return;}opened=true;
   if(reduced()){gsap.to('.gate-leaf',{opacity:0,duration:.25});document.querySelector('#cover').scrollIntoView({behavior:'instant'});return;}
   gsap.timeline().to('.gate-chain',{y:180,rotation:35,opacity:0,duration:.65}).to('.gate-left',{rotationY:-76,transformOrigin:'0% 50%',duration:1.2,ease:'power2.inOut'},.2).to('.gate-right',{rotationY:76,transformOrigin:'100% 50%',duration:1.2,ease:'power2.inOut'},.2).to('.light-bloom',{opacity:.4,scale:2,duration:.65},.65).to('.light-bloom',{opacity:0,duration:.65},1.3).call(()=>document.querySelector('#cover').scrollIntoView({behavior:'smooth'}),[],1.6);
 };
}
export function stampTicket(){if(reduced())return;gsap.from('.ticket-card',{y:20,opacity:0,duration:.7});gsap.from('.ticket-seal',{scale:2,rotation:-15,opacity:0,duration:.8});gsap.fromTo('.stamp-petal',{opacity:1,x:0,y:0},{x:i=>(i-1)*90,y:160,rotation:i=>i*75,opacity:0,duration:1.5,stagger:.12});sound('seal');ScrollTrigger.refresh();}
