// Reveal the approved PNG in its own coordinate system. No independent layout,
// translations or replacement artwork: the finished composition stays identical.
const WIDTH=1891,HEIGHT=831;
const clamp=n=>Math.max(0,Math.min(1,n));
const phase=(p,start,end)=>clamp((p-start)/(end-start));
const smooth=n=>n*n*(3-2*n);
const ROOTS=[
 {start:0,end:.57,width:66,points:[[278,772],[233,714],[224,658],[252,611],[312,601],[391,627],[471,631],[551,612],[627,610],[701,586],[774,613],[851,626],[932,613],[1045,610],[1120,625]]},
 {start:.04,end:.62,width:65,points:[[1747,760],[1790,708],[1800,644],[1759,589],[1708,567],[1623,582],[1552,611],[1468,608],[1397,577],[1356,540],[1284,534],[1192,557],[1106,579]]},
 {start:.12,end:.55,width:63,points:[[239,667],[181,677],[164,638],[202,586],[224,542],[203,501],[150,474],[101,483],[70,517],[87,558],[134,581],[185,572],[187,528],[143,502],[81,480],[55,439],[92,406],[161,403],[185,379],[146,350],[108,344],[101,319]]},
 {start:.2,end:.63,width:68,points:[[309,610],[335,544],[399,513],[416,438],[445,405],[445,349],[502,338],[559,324],[575,294],[548,266],[507,266]]},
 {start:.23,end:.55,width:65,points:[[229,649],[242,581],[263,526],[284,463]]},
 {start:.31,end:.62,width:77,points:[[476,617],[446,576],[477,535],[502,499],[553,478]]},
 {start:.21,end:.65,width:65,points:[[1719,726],[1770,755],[1808,714],[1815,643],[1855,609],[1814,582],[1870,542],[1835,514],[1797,517],[1773,466],[1813,424],[1862,414]]},
 {start:.25,end:.63,width:59,points:[[1390,569],[1423,526],[1472,521],[1476,478],[1441,450],[1419,416]]},
 {start:.3,end:.67,width:60,points:[[985,615],[956,569],[964,515],[1027,476],[1087,469],[1108,442],[1091,422]]},
 {start:.29,end:.65,width:57,points:[[802,625],[777,552],[828,499],[839,455],[821,424]]},
 {start:.34,end:.66,width:66,points:[[1170,558],[1223,521],[1265,499]]},
 {start:.4,end:.7,width:65,points:[[1694,583],[1643,541],[1585,531]]},
];
const ROSES=[[286,463,79,70],[494,541,96,82],[1256,521,86,83],[1631,558,72,63]];
const LETTERS=[[105,522],[521,738],[738,957],[957,1182],[1182,1325],[1325,1551],[1551,1805]];

function surface(width,height){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;return canvas;}
function expandInk(seeds,width,height){
 let expanded=seeds;
 for(let pass=0;pass<3;pass++){
  const next=expanded.slice();for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const i=y*width+x;if(!expanded[i]&&(expanded[i-1]||expanded[i+1]||expanded[i-width]||expanded[i+width]))next[i]=1;}expanded=next;
 }
 return expanded;
}
function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
 const [ax,ay]=points[i],[bx,by]=points[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
}return inside;}
function growPath(ctx,points,progress,width){
 if(progress<=0)return;const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let remaining=lengths.reduce((a,b)=>a+b,0)*progress;ctx.beginPath();ctx.moveTo(...points[0]);
 for(let i=0;i<lengths.length;i++){const a=points[i],b=points[i+1],f=Math.min(1,remaining/lengths[i]);ctx.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);remaining-=lengths[i];if(remaining<=0)break;}
 ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}

export function createTitleReveal(host){
 const image=host.querySelector('.logo-original'),canvas=host.querySelector('canvas');
 let ready=false,preparing,layers,scratch,mask,scale,ctx;
 async function prepare(){
  if(ready)return;if(preparing)return preparing;
  preparing=(async()=>{
   await image.decode();
   // Small enough for phones, with a full-resolution PNG restored after playback.
   const width=Math.min(1120,Math.max(760,Math.ceil(host.clientWidth*Math.min(devicePixelRatio,2))));
   const height=Math.round(width*HEIGHT/WIDTH);scale=width/WIDTH;
   canvas.width=width;canvas.height=height;ctx=canvas.getContext('2d');
   if(!ctx)return;
   const source=surface(width,height),sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(image,0,0,width,height);
   const pixels=sourceCtx.getImageData(0,0,width,height),count=width*height,tags=new Uint8Array(count),letterSeeds=new Uint8Array(count),roseSeeds=new Uint8Array(count);
   const thePolygon=[[545,32],[874,32],[874,283],[589,282],[564,249],[545,240]];
   const namesPolygon=[[466,658],[543,650],[581,638],[864,649],[987,638],[1394,638],[1394,831],[466,831]];
   for(let i=0;i<count;i++){
    const a=pixels.data[i*4+3];if(!a)continue;const x=(i%width)/scale,y=Math.floor(i/width)/scale;
    if(pointInPolygon(x,y,thePolygon)){tags[i]=3;continue;}
    if(pointInPolygon(x,y,namesPolygon)){tags[i]=4;continue;}
    const r=pixels.data[i*4],g=pixels.data[i*4+1],b=pixels.data[i*4+2];
    // Cut around the red petals and ink, never an ellipse through nearby letters.
    if(r>40&&r>g*1.75&&b>g*.65&&ROSES.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<1))roseSeeds[i]=1;
    if(r>148&&g>133&&b>105&&b/g>.69)letterSeeds[i]=1;
    tags[i]=1;
   }
   // Include the original dark ink outline and paper texture with each letter.
   const expanded=expandInk(letterSeeds,width,height),petals=expandInk(roseSeeds,width,height);
   for(let i=0;i<count;i++)if(tags[i]===1){if(expanded[i])tags[i]=2;else if(petals[i])tags[i]=5;}
   layers=Array.from({length:6},()=>surface(width,height));
   for(let group=1;group<=5;group++){
    const texture=new ImageData(new Uint8ClampedArray(pixels.data),width,height);
    for(let i=0;i<count;i++)if(tags[i]!==group)texture.data[i*4+3]=0;
    layers[group].getContext('2d').putImageData(texture,0,0);
   }
   scratch=surface(width,height);mask=surface(width,height);ready=true;host.dataset.logoReady='true';
  })().catch(()=>{host.dataset.logoReady='fallback';});
  return preparing;
 }
 function drawLayer(layer,paint){
  const m=mask.getContext('2d'),s=scratch.getContext('2d');
  m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,mask.width,mask.height);m.save();m.scale(scale,scale);m.fillStyle=m.strokeStyle='#fff';paint(m);m.restore();
  s.clearRect(0,0,scratch.width,scratch.height);s.globalCompositeOperation='source-over';s.drawImage(layers[layer],0,0);s.globalCompositeOperation='destination-in';s.drawImage(mask,0,0);s.globalCompositeOperation='source-over';ctx.drawImage(scratch,0,0);
 }
 function finish(){host.dataset.logoState='complete';host.dataset.logoProgress='1';canvas.hidden=true;image.style.visibility='visible';}
 function draw(progress){
  if(!ready){finish();return;}
  const p=clamp(progress);host.dataset.logoProgress=p.toFixed(3);host.dataset.logoState='growing';canvas.hidden=false;image.style.visibility='hidden';ctx.clearRect(0,0,canvas.width,canvas.height);
  drawLayer(1,m=>{
   for(const root of ROOTS)growPath(m,root.points,smooth(phase(p,root.start,root.end)),root.width);
   // Fine branches and leaf tips finish after their main stems have reached them.
   m.globalAlpha=smooth(phase(p,.63,.87));m.fillRect(0,0,WIDTH,HEIGHT);
  });
  drawLayer(2,m=>{
   LETTERS.forEach(([left,right],i)=>{const f=smooth(phase(p,.025+i*.02,.34+i*.02));if(!f)return;
    const edge=735-f*600;m.beginPath();m.moveTo(left,HEIGHT);m.lineTo(left,edge);
    for(let x=left;x<=right;x+=12)m.lineTo(x,edge+Math.sin(x*.067)*8+Math.sin(x*.13)*3);
    m.lineTo(right,HEIGHT);m.closePath();m.fill();
   });
  });
  drawLayer(3,m=>{const f=smooth(phase(p,.46,.74));m.fillRect(540,26,340,270*f);});
  drawLayer(5,m=>ROSES.forEach(([x,y,rx,ry],i)=>{m.globalAlpha=smooth(phase(p,.24+i*.035,.42+i*.035));m.beginPath();m.ellipse(x,y,rx+9,ry+9,0,0,Math.PI*2);m.fill();}));
  drawLayer(4,m=>{const f=smooth(phase(p,.67,.98));m.fillRect(460,635,945*f,HEIGHT-635);});
  // Resolve tiny antialiased intersections onto the exact original without a jump.
  ctx.globalAlpha=smooth(phase(p,.88,1));ctx.drawImage(image,0,0,canvas.width,canvas.height);ctx.globalAlpha=1;
  if(p===1)finish();
 }
 function reveal(timeline,at){
  if(!ready){finish();return;}
  const state={progress:0};draw(0);
  timeline.to(state,{progress:1,duration:1.85,ease:'none',onUpdate:()=>draw(state.progress),onComplete:finish},at);
 }
 return {prepare,reveal,finish};
}
