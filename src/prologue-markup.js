const picture=(name,cls,extra='')=>`<img class="${cls}" ${name==='room-open'||name==='door'?'src':'data-src'}="/assets/png/arrival/${name}.png" alt="" decoding="async" ${extra}/>`;
export function prologueMarkup(){return `<section id="arrival" class="arrival" data-step="0" aria-label="Scene 1: Sebuah undangan">
 <header class="arrival-heading"><span class="arrival-chapter">PART I</span><h1>Sebuah undangan</h1><img class="arrival-heading-rule" src="/assets/png/arrival/ui-divider.png" alt=""/></header>
 <div class="arrival-view" aria-hidden="true">
  <div class="arrival-camera">
   <div class="arrival-set">
    ${picture('room-open','arrival-room','fetchpriority="high" width="1024" height="1536"')}
    <div class="arrival-garden">${picture('clouds','arrival-clouds')}${picture('tree','arrival-tree arrival-tree-far')}${picture('tree','arrival-tree arrival-tree-near')}</div>
    <div class="arrival-door">${picture('door','arrival-door-paint','fetchpriority="high"')}${picture('hand-short','arrival-door-hand')}</div>
    ${picture('knock-marks','arrival-knocks')}
    <div class="arrival-floor-envelope">${picture('envelope-floor','arrival-envelope-paint')}</div>
   </div>
  </div>
  <div class="arrival-atmosphere"></div>
  <div class="arrival-dust">${Array.from({length:7},(_,i)=>`<i style="--mote:${i}"></i>`).join('')}</div>
 </div>
 <div class="arrival-held arrival-sealed" aria-hidden="true">${picture('hands-envelope','arrival-hands')}<span class="arrival-address"><small>Untuk</small><span id="arrival-guest">Tamu Undangan</span></span></div>
 <div class="arrival-held arrival-open" aria-hidden="true"><div class="arrival-paper-frame"><div class="arrival-burning-paper">${picture('invitation-card','arrival-paper')}<div class="arrival-card-copy"><span class="arrival-card-small">Sebuah kisah menantimu</span><strong>Anda diundang</strong><span class="arrival-card-rule">✦</span></div></div>${picture('burn-edge','arrival-burn-edge')}</div>${picture('holding-hands','arrival-hands arrival-holding-hands')}</div>
 <div class="arrival-portal" aria-hidden="true"><div class="arrival-portal-window"><img data-src="/assets/png/gate-environment.png" alt=""/><img class="arrival-distant-gate" data-src="/assets/png/gate.png" alt=""/></div>${picture('ink-portal','arrival-ink-ring')}<div class="arrival-portal-shade"></div></div>
 <div class="arrival-vignette" aria-hidden="true"></div>
 <div class="arrival-caption"><span class="arrival-speaker">KAMU</span><p id="arrival-line" aria-hidden="true">Hari ini terasa seperti hari biasa.</p><span class="arrival-dialogue-cue" aria-hidden="true">◆</span></div>
 <span id="arrival-description" class="sr-only" role="status" aria-live="polite">Di dalam rumah, kamu menghadap pintu kayu yang tertutup. Hari ini terasa seperti hari biasa.</span>
 </section>`;}
