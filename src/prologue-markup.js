const picture=(name,cls,extra='')=>`<img class="${cls}" ${name==='room-open'||name==='door'?'src':'data-src'}="/assets/png/arrival/${name}.png" alt="" decoding="async" ${extra}/>`;
export function prologueMarkup(){return `<section id="arrival" class="arrival" data-step="0" aria-label="Scene 1: Sebuah undangan">
 <h1 class="sr-only">Sebuah undangan</h1>
 <div class="arrival-view" aria-hidden="true">
  <div class="arrival-camera">
   <div class="arrival-set">
    ${picture('room-open','arrival-room','fetchpriority="high" width="1536" height="1024"')}
    <div class="arrival-door">${picture('door','arrival-door-paint','fetchpriority="high"')}${picture('hand-door','arrival-door-hand')}</div>
    <div class="arrival-knocks"><i></i><i></i><i></i></div>
    <div class="arrival-floor-envelope">${picture('envelope-floor','arrival-envelope-paint')}</div>
   </div>
  </div>
  <div class="arrival-atmosphere"></div>
  <div class="arrival-dust">${Array.from({length:7},(_,i)=>`<i style="--mote:${i}"></i>`).join('')}</div>
 </div>
 <div class="arrival-held arrival-sealed" aria-hidden="true">${picture('hands-envelope','arrival-hands')}<span class="arrival-address"><small>Untuk</small><span id="arrival-guest">Tamu Undangan</span></span></div>
 <div class="arrival-held arrival-open" aria-hidden="true">${picture('hands-card','arrival-hands')}<div class="arrival-card-copy"><span class="arrival-card-small">Sebuah kisah menantimu</span><strong>Anda<br>diundang</strong><span class="arrival-card-rule">✦</span></div></div>
 <div class="arrival-portal" aria-hidden="true"><div class="arrival-portal-window"><img data-src="/assets/png/gate-environment.png" alt=""/><img class="arrival-distant-gate" data-src="/assets/png/gate.png" alt=""/></div>${picture('ink-portal','arrival-ink-ring')}<div class="arrival-portal-shade"></div></div>
 <div class="arrival-vignette" aria-hidden="true"></div>
 <div class="arrival-caption"><span class="arrival-chapter">I · Sebuah undangan</span><p id="arrival-line">Ada ketukan di pintu.</p></div>
 <span id="arrival-description" class="sr-only" role="status" aria-live="polite">Dari dalam rumah, kamu menghadap pintu kayu yang tertutup. Terdengar tiga ketukan.</span>
 </section>`;}
