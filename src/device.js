export async function preparePortrait(app, mount) {
 const touchQuery=matchMedia('(any-pointer: coarse)');
 const localPreview=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const isMobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
  || (navigator.maxTouchPoints>0&&touchQuery.matches)
  || (localPreview&&innerWidth<=600&&innerWidth<innerHeight);
 let mounting;
 document.body.classList.add('invitation-device');
 const notice=document.createElement('aside');
 notice.className='device-notice';notice.setAttribute('role','status');
 notice.innerHTML='<img src="/assets/png/wax-seal.png" alt=""/><h1></h1><p></p>';
 document.body.append(notice);if(!isMobile())app.replaceChildren();
 async function sync(){
  const mobile=isMobile(),blocked=!mobile||innerWidth>innerHeight;
  notice.querySelector('h1').textContent=mobile?'Putar perangkatmu':'Buka undangan di HP atau tablet';
  notice.querySelector('p').textContent=mobile?'Pegang HP atau tablet secara vertikal untuk melanjutkan kisahnya.':'Undangan ini dirancang untuk layar vertikal. Silakan buka tautan yang sama melalui HP atau tablet.';
  notice.hidden=!blocked;app.hidden=blocked;
  document.dispatchEvent(new CustomEvent('devicechange',{detail:{blocked}}));
  if(!blocked&&!mounting){app.dataset.ready='false';mounting=Promise.resolve().then(mount).then(()=>{app.dataset.ready='true';});}
  if(mounting)await mounting;
 }
 addEventListener('resize',sync);touchQuery.addEventListener('change',sync);
 await sync();
}
