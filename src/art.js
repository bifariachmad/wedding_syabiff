export function art(name, cls = '', layer = '') {
  const immediate=/gate-|ticket-|stamp-/.test(cls);
  return `<span class="art ${cls}" ${layer ? `data-layer="${layer}"` : ''} aria-hidden="true"><img ${immediate?'src':'data-src'}="/assets/png/${name}.png" alt="" width="400" height="500" ${immediate?'':'loading="lazy"'} decoding="async"/></span>`;
}
export function icon(name) { const path=name==='music-on'||name==='music-off'?`arrival/ui-sound-${name==='music-on'?'on':'off'}`:`icon-${name}`;return `<img class="icon" src="/assets/png/${path}.png" alt="" width="24" height="24"/>`; }
export async function hydrateArt(root=document) {
  if(document.querySelector('.visual-novel')){
    const images=[...root.querySelectorAll(root===document?'#arrival .arrival-room, #arrival .arrival-door-paint':'img')];
    for(const img of images){if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';}
    await Promise.all(images.filter(img=>img.getAttribute('src')).map(img=>img.decode().catch(()=>{})));
    return;
  }
  const deferred=[...root.querySelectorAll('img[data-src]')];
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const img=e.target;if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}observer.unobserve(img);}},{rootMargin:'350px'});
  deferred.forEach(img=>observer.observe(img));
  const top=[...root.querySelectorAll('#gate img')];
  top.forEach(img=>img.loading='eager');
  await Promise.all(top.map(img=>img.decode().catch(()=>{})));
}
