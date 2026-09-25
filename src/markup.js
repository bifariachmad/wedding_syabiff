import {agendaArtwork,agendaCard,agendaDialogue,agendaSpeaker} from './agenda-markup.js';
import {maproomArtwork,maproomDialogue,maproomVenue} from './maproom-markup.js';
import {clockroomArtwork,clockroomDialogue} from './clockroom-markup.js';
import { CONFIG } from './config.js';
import { art, icon } from './art.js';
import { prologueMarkup } from './prologue-markup.js';
import { courtyardArtwork, courtyardCover } from './courtyard-markup.js';
import { welcomeArtwork, welcomeDialogue } from './welcome-markup.js';

const sprite=(name,cls='hero',depth=0)=>`<div class="vn-layer ${cls}" data-depth="${depth}">${art(name)}</div>`;
const scene=(id,label,visual,content,extra='')=>`<section id="${id}" class="vn-scene ${extra}${id==='gate'?' is-active is-visible':''}" data-label="${label}" aria-labelledby="${id}-title" ${id==='gate'?'':'aria-hidden="true" inert'}><div class="vn-artwork" aria-hidden="true">${visual}</div><div class="vn-dialogue"><span class="vn-speaker">${label}</span>${content}</div>${id==='location'?maproomVenue():''}</section>`;
export function invitationMarkup(){
 const e=CONFIG.EVENT;
 return `<main id="invitation" class="visual-novel intro-active" data-scene="0" data-prologue="active">
 ${prologueMarkup()}
 <div class="vn-world" aria-hidden="true"><img class="vn-landscape" data-src="/assets/png/gate-environment.png" alt="" fetchpriority="high" width="760" height="1140"/><div class="vn-haze"></div><div class="vn-travel-frame frame-left">${art('bare-tree')}</div><div class="vn-travel-frame frame-right">${art('bare-tree')}</div><div class="vn-motes">${Array.from({length:9},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>
 <header class="vn-header"><span>Dua Jiwa, Satu Lentera</span><span class="vn-date">31 . 10 . 2026</span></header>
 <button class="music-toggle" id="music-toggle" aria-label="Nyalakan musik">${icon('music-off')}</button>
 <div class="vn-stage">
 ${scene('gate','KAMU',courtyardArtwork(),`<p id="recipient" class="recipient" hidden></p><p id="courtyard-line" aria-hidden="true">Di mana ini…? Udara pagi terasa hangat.</p><span id="courtyard-description" class="sr-only" role="status" aria-live="polite">Di mana ini…? Udara pagi terasa hangat.</span>`)}
 ${scene('cover','Part II · The Wedding',courtyardCover(),`<span class="courtyard-wedding">The Wedding</span><h1 id="cover-title"><span>Achmad Bifari</span><em>&</em><span>Syafira Aulia</span></h1>`)}
 ${scene('greeting','KAMU',welcomeArtwork(),welcomeDialogue())}
 ${scene('countdown','BIFARI',clockroomArtwork(),clockroomDialogue())}
 ${scene('location','SYAFIRA',maproomArtwork(),maproomDialogue())}
 ${CONFIG.RUNDOWN.map((_,i)=>scene(`rundown-${i}`,agendaSpeaker(i),agendaArtwork(i),agendaDialogue(i),'vn-agenda').replace('</section>',`${agendaCard(i)}</section>`)).join('')}
 ${scene('dresscode','Bab VI · Sehelai maroon',`${sprite('cloth-swatch','cloth-hero',20)}${sprite('rose-wilted','rose-hero',160)}${sprite('petal','near-petal',200)}`,`<h2 id="dresscode-title">Dresscode & Tema</h2><p class="vn-narration">Kenakan warna maroon.</p><p>Dekorasi bernuansa gothic: remang, hangat, sedikit misterius.</p>`)}
 ${scene('reservation','Bab VII · Sebuah kursi untukmu',`${sprite('book-quill','reservation-hero',0)}${sprite('lantern','hanging-lantern',120)}`,`<h2 id="reservation-title">Reservasi</h2><div class="vn-form-content"><p class="reservation-intro">Bantu kami menyiapkan kursimu. Isi nama dan jumlah tamu untuk melanjutkan.</p>
 <form id="reservation-form" novalidate><div class="form-field"><label for="guest-name">Nama tamu</label><input id="guest-name" name="name" type="text" required minlength="2" maxlength="60" autocomplete="name" aria-describedby="name-error"/><p class="field-error" id="name-error" aria-live="polite"></p></div><div class="form-field"><label for="guest-count">Jumlah tamu (termasuk kamu)</label><div class="stepper"><button type="button" id="minus" aria-label="Kurangi jumlah tamu">${icon('minus')}</button><input id="guest-count" name="guests" type="number" min="1" max="${CONFIG.MAX_GUESTS}" step="1" value="1" required inputmode="numeric" aria-describedby="count-error"/><button type="button" id="plus" aria-label="Tambah jumlah tamu">${icon('plus')}</button></div><p class="field-error" id="count-error" aria-live="polite"></p></div><div class="honeypot" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"/></div><button type="submit" class="button primary" id="submit-reservation" disabled>Kirim Reservasi</button></form>
 <p id="reservation-status" role="status" aria-live="polite"></p><button class="vn-action" id="recall-ticket" hidden>Lihat Tiket</button><div id="ticket-host" hidden></div></div>`,'vn-form-scene')}
 ${scene('closing','Epilog · Satu lentera',`${sprite('arch-roses','couple closing-couple',0)}${sprite('lantern','final-lantern',210)}${sprite('raven-flight','flying-raven',120)}`,`<h2 id="closing-title">Sampai bertemu.</h2><p class="vn-narration">Terima kasih sudah menyalakan lentera bersama kami.</p><div class="vn-closing-actions"><button class="vn-action" id="share">Bagikan undangan ↗</button><button class="vn-action" id="closing-music">Nyalakan musik</button></div><p id="share-status" role="status"></p>`)}
 </div><div class="vn-bottom"><div class="vn-progress" aria-hidden="true"><span id="journey-progress"></span></div><div class="vn-navline"><nav class="vn-navigation" aria-label="Navigasi cerita"><button id="nav-back" class="vn-nav" disabled>Kembali</button><span class="vn-position" id="journey-position" aria-hidden="true">01 <small>/ 16</small></span><button id="nav-next" class="vn-nav vn-next">Lanjut</button></nav></div></div><span id="journey-announcement" class="sr-only" role="status" aria-live="polite"></span>
 </main>`;
}


