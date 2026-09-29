import {CONFIG} from './config.js';
const dialogue=[
 ['BIFARI','Gulungan ini berisi rangkaian hari kami. Saat tiba, tunjukkan QR reservasi kepada penerima tamu, lalu nikmati minuman sambutan.'],
 ['SYAFIRA','Setelah semua bersiap, pembawa acara akan menyambutmu dan menjelaskan cara memakai aplikasi foto.'],
 ['BIFARI','Lalu tibalah momen yang paling kami nantikan: prosesi akad dan ijab kabul.'],
 ['SYAFIRA','Sesudah akad, kita akan berdoa bersama untuk awal perjalanan kami.'],
 ['BIFARI','Keluarga juga akan menyampaikan pesan dan harapan untuk kami berdua.'],
 ['SYAFIRA','Jangan buru-buru beranjak. Setelah itu ada sesi foto bersama keluarga dan saksi.'],
 ['BIFARI','Lalu waktunya makan dan berbincang. Kami akan menyapa tiap meja, ditemani alunan biola.'],
 ['SYAFIRA','Acara ditutup dengan ucapan terima kasih dari kami. Sebelum melanjutkan, ada warna yang ingin kami ajak kamu kenakan.']
];
export function agendaArtwork(i){return `<img class="agenda-desk" data-src="/assets/png/rooms/overhead-desk.png" alt=""/><div class="scroll-stage"><div class="agenda-camera"><img data-src="/assets/png/finale/scroll-paper.png" alt=""/></div><img class="scroll-top" data-src="/assets/png/finale/scroll-top.png" alt=""/><img class="agenda-roll" data-src="/assets/png/finale/scroll-bottom.png" alt=""/></div><div class="agenda-shade"></div><header class="welcome-heading"><span>PART VI</span><h2 id="rundown-${i}-title">Selembar rencana</h2><img src="/assets/png/arrival/ui-divider.png" alt=""/></header>`;}
export function agendaCard(i){return `<article class="agenda-card" aria-label="Rundown tahap ${i+1}"><div class="agenda-list" style="--offset:0">${CONFIG.RUNDOWN.map(([time,title],j)=>`<div class="agenda-entry" ><time>${time} WIB</time><h3>${title}</h3></div>`).join('')}</div></article>`;}
export function agendaDialogue(i){return `<p class="agenda-line">Dari akad hingga makan bersama, inilah rangkaian hari bahagia kami.</p>`;}
export function agendaSpeaker(i){return dialogue[i][0];}
