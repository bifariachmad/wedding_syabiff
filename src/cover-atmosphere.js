const PETALS=[
 [7,16,18,-3,18,-22],[22,11,22,-12,-13,42],[39,21,17,-8,22,-36],
 [58,12,24,-18,-16,25],[76,24,19,-5,19,64],[92,14,21,-15,-23,-12],
 [14,9,25,-20,14,86],[67,17,23,-11,-20,-54],[85,10,26,-23,12,34],
];

function roots(position,asset){
 const mask=`cover-roots-${position}-mask`;
 return `<div class="cover-edge-roots cover-edge-roots--${position}">
  <img class="cover-root-source" data-src="/assets/png/title/${asset}.png" hidden alt=""/>
  <svg viewBox="0 0 2172 724" focusable="false">
   <defs><mask id="${mask}" maskUnits="userSpaceOnUse" x="-300" y="0" width="2772" height="724">
    <g fill="none" stroke="white" stroke-width="500" stroke-linecap="round">
     <path class="cover-root-growth" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M-310 420 C-60 470 190 300 410 380 S760 470 1125 398"/>
     <path class="cover-root-growth" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M2482 395 C2220 320 2030 480 1760 372 S1370 475 1045 398"/>
    </g>
   </mask></defs>
   <image class="cover-root-art" width="2172" height="724" mask="url(#${mask})"/>
  </svg>
 </div>`;
}

export function coverAtmosphereMarkup(){
 return `<div class="cover-atmosphere" aria-hidden="true">
  ${roots('top','edge-roots-roses-doodle-v2')}${roots('bottom','edge-roots-light-doodle-v2')}
  <div class="cover-petals">${PETALS.map(([x,size,duration,delay,drift,angle],i)=>`<span class="cover-petal" style="--petal-x:${x}%;--petal-size:${size};--fall-duration:${duration}s;--fall-delay:${delay}s;--petal-drift:${drift}cqw;--petal-angle:${angle}deg;--sway-duration:${4+i*.31}s">
   <span class="cover-petal-sway"><span class="cover-petal-face"><img data-src="/assets/png/petal.png" alt="" width="440" height="440"/></span></span>
  </span>`).join('')}</div>
 </div>`;
}

export function createCoverAtmosphere(scene){
 const host=scene.querySelector('.cover-atmosphere'),paths=[...host.querySelectorAll('.cover-root-growth')];
 function prepare(){
  for(const root of host.querySelectorAll('.cover-edge-roots')){
   const source=root.querySelector('img');
   if(source.currentSrc||source.src)root.querySelector('image').setAttribute('href',source.currentSrc||source.src);
  }
 }
 function finish(){paths.forEach(path=>path.style.strokeDashoffset='0');host.dataset.growth='complete';}
 function reveal(timeline,at){
  host.dataset.growth='growing';paths.forEach(path=>path.style.strokeDashoffset='1');
  paths.forEach((path,i)=>timeline.to(path,{strokeDashoffset:0,duration:1.5,ease:'sine.inOut'},at+i*.07));
  timeline.call(finish,[],at+1.72);
 }
 const visibility=()=>{host.dataset.paused=String(document.hidden);};
 document.addEventListener('visibilitychange',visibility);visibility();
 return {prepare,reveal,finish};
}
