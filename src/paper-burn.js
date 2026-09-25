// Reveal a ragged edge through the generated paper PNG and its HTML lettering.
// The hands are a separate layer and leave before this effect starts.
export function burnPaper(paper,edge,progress){
 const y=progress*124-12;
 const points=Array.from({length:25},(_,i)=>`${i/24*100}% ${y+Math.sin(i*2.3)*2.2+Math.cos(i*1.8)*1.4}%`);
 paper.style.clipPath=`polygon(${points.join(',')},100% 100%,0 100%)`;
 edge.style.top=`${y}%`;
 edge.style.opacity=String(Math.min(1,progress*12,(1-progress)*14));
}
