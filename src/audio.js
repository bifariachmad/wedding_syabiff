import { CONFIG } from './config.js';
import { storage } from './storage.js';
let context, master, ambient, music;
let enabled = storage.get('djsl-music') !== false;
let started = false;
function tone(freq,start,duration,volume=.04,type='sine',endFreq=freq) {
  const osc=context.createOscillator(), gain=context.createGain();
  osc.type=type; osc.frequency.setValueAtTime(freq,start); osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),start+duration);
  gain.gain.setValueAtTime(.00001,start); gain.gain.exponentialRampToValueAtTime(volume,start+.02); gain.gain.exponentialRampToValueAtTime(.00001,start+duration);
  osc.connect(gain).connect(master); osc.start(start); osc.stop(start+duration+.03);
}
function noise(start,duration,frequency,volume) {
  const b=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length)**2;
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=b; filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=2;gain.gain.value=volume;
  source.connect(filter).connect(gain).connect(master);source.start(start);
}
function buildAmbient() {
  const rate=22050,length=60*rate, buffer=context.createBuffer(1,length,rate), data=buffer.getChannelData(0);
  // Integer cycles over sixty seconds and windowed chimes make the loop periodic.
  for(let i=0;i<length;i++) {
    const t=i/rate, tau=2*Math.PI;
    let v=.035*Math.sin(tau*55*t)+.014*Math.sin(tau*82.5*t)+.008*Math.sin(tau*110*t);
    let wind=0;
    for(let j=0;j<6;j++) wind+=Math.sin(tau*(220+j*37+1/60)*t+j)*.0015;
    v+=wind*(.6+.4*Math.cos(tau*t/12));
    for(const [at,f] of [[5,440],[18,330],[33,495],[48,440]]) {const x=t-at;if(x>=0&&x<4)v+=.015*Math.sin(tau*f*x)*Math.sin(Math.PI*x/4)**2*Math.exp(-x);}
    data[i]=v;
  }
  ambient=context.createBufferSource();ambient.buffer=buffer;ambient.loop=true;ambient.connect(master);ambient.start();
}
function notify(){document.dispatchEvent(new CustomEvent('musicchange',{detail:{enabled}}));}
export async function startAudio() {
  if(started) return;
  started=true;
  try {
    context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=enabled?.35:0;master.connect(context.destination);
    await context.resume();
    if(CONFIG.BGM_SRC){music=new Audio(CONFIG.BGM_SRC);music.loop=true;music.volume=.15;music.muted=!enabled;await music.play();}else buildAmbient();
    notify();
  } catch { enabled=false;notify(); }
}
export async function toggleAudio(){const next=!isMusicEnabled();await startAudio();enabled=next&&!!context;storage.set('djsl-music',enabled);if(master)master.gain.setTargetAtTime(enabled?.35:0,context.currentTime,.1);if(music){music.muted=!enabled;if(enabled)music.play().catch(()=>{});}notify();}
export function isMusicEnabled(){return started&&enabled;}
export function sound(name){
  if(!context||!enabled) return;
  const t=context.currentTime;
  if(name==='knock')for(let i=0;i<3;i++){tone(125,t+i*.26,.16,.19,'sine',68);noise(t+i*.26,.075,460,.13);}
  if(name==='door'){noise(t,1.4,420,.035);tone(160,t,1.2,.018,'triangle',86);}
  if(name==='latch'){noise(t,.08,2200,.16);tone(780,t,.13,.07,'triangle',380);noise(t+.11,.1,1100,.07);}
  if(name==='step'){noise(t,.19,190,.14);tone(67,t,.2,.055,'sine',42);noise(t+.42,.18,240,.1);}
  if(name==='morning'){noise(t,3.5,900,.015);for(let i=0;i<3;i++){tone(1600+i*130,t+i*.48,.16,.018,'sine',2400);tone(2150,t+i*.48+.18,.12,.012,'sine',1750);}}
  if(name==='paper-lift'){noise(t,.32,1700,.09);noise(t+.24,.36,900,.06);}
  if(name==='ignite'){noise(t,.25,2400,.17);noise(t+.12,.45,740,.09);tone(180,t,.4,.035,'triangle',70);}
  if(name==='burn'||name==='burn-short'){
   const duration=name==='burn'?3.2:1;
   noise(t,duration,850,.13);noise(t,duration,2600,.075);
   for(let i=0;i<Math.floor(duration*10);i++)noise(t+i*.1+(i%3)*.014,.025+(i%4)*.009,1200+(i%7)*480,.045+(i%3)*.025);
  }
  if(name==='portal'){noise(t,3.8,330,.055);tone(72,t,3.6,.035,'sine',170);tone(220,t+1.8,1.8,.025,'sine',550);}
  if(name==='gate'){tone(83,t,1.5,.025,'sawtooth',32);noise(t,1.5,320,.06);}
  if(name==='chain')for(let i=0;i<6;i++){noise(t+i*.14,.1,1600+i*135,.08);tone(950+i*117,t+i*.14,.11,.018);}
  if(name==='seal')tone(100,t,.4,.15,'sine',30);
  if(name==='page')noise(t,.6,1300,.07);
  if(name==='tick')tone(740,t,.1,.035);
  if(name==='success'){tone(440,t,.7,.055);tone(550,t+.12,.7,.045);tone(660,t+.25,.75,.035);}
}
document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){context.suspend();music?.pause();}else{context.resume();if(music&&enabled)music.play().catch(()=>{});}});
