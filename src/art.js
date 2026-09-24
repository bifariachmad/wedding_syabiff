export function art(name, cls = '', layer = '') {
  const immediate=/gate-|ticket-|stamp-/.test(cls);
  return `<span class="art ${cls}" ${layer ? `data-layer="${layer}"` : ''} aria-hidden="true"><img ${immediate?'src':'data-src'}="/assets/png/${name}.png" alt="" width="400" height="500" ${immediate?'':'loading="lazy"'} decoding="async"/></span>`;
}
export function icon(name) { return `<img class="icon" src="/assets/png/icon-${name}.png" alt="" width="24" height="24"/>`; }
export async function hydrateArt(root=document) {
  const deferred=[...root.querySelectorAll('img[data-src]')];
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const img=e.target;img.src=img.dataset.src;delete img.dataset.src;observer.unobserve(img);}},{rootMargin:'350px'});
  deferred.forEach(img=>observer.observe(img));
  const top=[...root.querySelectorAll('#gate img')];
  top.forEach(img=>img.loading='eager');
  await Promise.all(top.map(img=>img.decode().catch(()=>{})));
}
