import {hostsMarkup} from './hosts-markup.js';
export function welcomeArtwork(){return `<div class="welcome-camera">
 <img class="welcome-room" data-src="/assets/png/welcome/welcome-hall.png" alt=""/>
 ${hostsMarkup()}
 <div class="welcome-candle candle-left"><img data-src="/assets/png/candle.png" alt=""/></div><div class="welcome-candle candle-right"><img data-src="/assets/png/candle.png" alt=""/></div>
 </div><div class="welcome-exterior"><div class="welcome-entrance"><img class="welcome-facade" data-src="/assets/png/welcome/facade.png" alt=""/><img class="welcome-door welcome-door-left" data-src="/assets/png/welcome/door-left.png" alt=""/><img class="welcome-door welcome-door-right" data-src="/assets/png/welcome/door-right.png" alt=""/></div></div><div class="welcome-shade"></div><header class="welcome-heading"><span>BAB III</span><h2 id="greeting-title">Sebuah sambutan</h2><img src="/assets/png/arrival/ui-divider.png" alt=""/></header>`;}
export function welcomeDialogue(){return `<p id="welcome-line" aria-hidden="true">Kita sudah tiba. Bifari dan Syafira menyambut kedatangan Anda.</p><span id="welcome-description" class="sr-only" role="status" aria-live="polite">Kita sudah tiba. Bifari dan Syafira menyambut kedatangan Anda.</span>`;}
