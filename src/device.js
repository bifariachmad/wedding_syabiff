// The stage is always a 9:16 portrait column. Wider screens (desktop, WhatsApp Web,
// tablets in landscape) get it centred over a dark backdrop; only a short landscape
// phone is asked to rotate, because the column would be too small to read there.
export const SHORT_LANDSCAPE=520;
export async function preparePortrait(app, mount) {
 const touchQuery=matchMedia('(any-pointer: coarse)');
 const isMobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
  || (navigator.maxTouchPoints>0&&touchQuery.matches);
 let mounting;
 document.body.classList.add('invitation-device');
 const notice=document.createElement('aside');
 notice.className='device-notice';notice.setAttribute('role','status');
 notice.innerHTML='<img src="/assets/png/wax-seal.png" alt=""/><h1>Putar perangkatmu</h1><p>Pegang HP secara vertikal untuk membuka undangan.</p>';
 document.body.append(notice);
 async function sync(){
  const wide=innerWidth*16>innerHeight*9,blocked=isMobile()&&innerWidth>innerHeight&&innerHeight<SHORT_LANDSCAPE;
  document.body.classList.toggle('invitation-wide',wide&&!blocked);
  if(notice.hidden!==!blocked||app.hidden!==blocked){notice.hidden=!blocked;app.hidden=blocked;document.dispatchEvent(new CustomEvent('devicechange',{detail:{blocked}}));}
  if(!blocked&&!mounting){app.dataset.ready='false';mounting=Promise.resolve().then(mount).then(()=>{app.dataset.ready='true';});}
  if(mounting)await mounting;
 }
 // Keyboard guests (desktop) can page through the story with the arrow keys.
 addEventListener('keydown',e=>{
  if(app.hidden||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable],dialog[open]'))return;
  const id={ArrowRight:'nav-next',PageDown:'nav-next',ArrowLeft:'nav-back',PageUp:'nav-back'}[e.key],button=id&&document.getElementById(id);
  if(!button||button.hidden||button.disabled||!button.getClientRects().length)return;
  e.preventDefault();button.click();
 });
 addEventListener('resize',sync);touchQuery.addEventListener('change',sync);
 await sync();
}
