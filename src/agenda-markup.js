import {CONFIG} from './config.js';
const dialogue=[
 ['BIFARI','Buku ini berisi rangkaian hari kami. Saat tiba, tunjukkan QR reservasi kepada penerima tamu, lalu nikmati minuman sambutan.'],
 ['SYAFIRA','Setelah semua bersiap, pembawa acara akan menyambutmu dan menjelaskan cara memakai aplikasi foto.'],
 ['BIFARI','Lalu tibalah momen yang paling kami nantikan: prosesi akad dan ijab kabul.'],
 ['SYAFIRA','Sesudah akad, kita akan berdoa bersama untuk awal perjalanan kami.'],
 ['BIFARI','Keluarga juga akan menyampaikan pesan dan harapan untuk kami berdua.'],
 ['SYAFIRA','Jangan buru-buru beranjak. Setelah itu ada sesi foto bersama keluarga dan saksi.'],
 ['BIFARI','Lalu waktunya makan dan berbincang. Kami akan menyapa tiap meja, ditemani alunan biola.'],
 ['SYAFIRA','Acara ditutup dengan ucapan terima kasih dari kami. Sebelum melanjutkan, ada warna yang ingin kami ajak kamu kenakan.']
];
export function agendaArtwork(i){return `<div class="agenda-camera"><img class="agenda-background" data-src="/assets/png/agenda/agenda-desk.png" alt=""/></div><div class="agenda-shade"></div><header class="welcome-heading"><span>PART VI</span><h2 id="rundown-${i}-title">Selembar rencana</h2><img src="/assets/png/arrival/ui-divider.png" alt=""/></header>`;}
export function agendaCard(i){const[time,title]=CONFIG.RUNDOWN[i];return `<article class="agenda-card" aria-label="Agenda ${i+1}"><span class="agenda-number">${String(i+1).padStart(2,'0')} / 08</span><time>${time} WIB</time><h3>${title}</h3></article>`;}
export function agendaDialogue(i){return `<p class="agenda-line">${dialogue[i][1]}</p>`;}
export function agendaSpeaker(i){return dialogue[i][0];}
