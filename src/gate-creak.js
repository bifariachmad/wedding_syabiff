// Uneven stick-slip friction: three hinge creaks over one slow gate swing.
// Render once into a buffer so timing and texture do not depend on frame rate.
export function createGateCreak(context){
 const rate=context.sampleRate,duration=4.65;
 const buffer=context.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);
 const strokes=[[.12,.94,465,290,.7],[1.06,2.48,310,570,1],[2.63,4.48,520,245,.85]];
 let phase=0,woodPhase=0,friction=0,seed=173;
 for(let i=0;i<data.length;i++){
  const t=i/rate;
  seed=(1664525*seed+1013904223)>>>0;
  const random=seed/2147483648-1;
  friction=.88*friction+.12*random;
  let sample=0;
  for(const [start,end,low,high,gain] of strokes){
   if(t<start||t>end)continue;
   const u=(t-start)/(end-start),envelope=Math.sin(Math.PI*u)**.65;
   const slip=.72+.18*Math.sin(2*Math.PI*(13*t+1.7*Math.sin(2.3*t)))+.1*Math.sin(2*Math.PI*39*t);
   const frequency=low+(high-low)*u+14*Math.sin(t*23)+7*Math.sin(t*61);
   phase+=2*Math.PI*frequency/rate;woodPhase+=2*Math.PI*(112+20*Math.sin(t*3))/rate;
   const metal=Math.sin(phase)+.34*Math.sin(phase*2)+.14*Math.sin(phase*3);
   sample=gain*envelope*(.09*metal*slip+.11*friction+.023*Math.sin(woodPhase));
  }
  // Small dry clicks where the rusty hinge catches and finally settles.
  for(const at of [.13,.98,2.51,4.49]){
   const x=t-at;if(x>=0&&x<.07)sample+=.07*random*Math.exp(-x*75)*Math.min(1,x*1000);
  }
  data[i]=sample;
 }
 return buffer;
}
