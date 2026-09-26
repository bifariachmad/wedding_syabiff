import {CONFIG} from './config.js';
const dialogue=[
 ['BIFARI','Saat tiba, tunjukkan tiket kepada penerima tamu. Setelah itu, silakan menikmati minuman yang tersedia.'],
 ['SYAFIRA','Pembawa acara akan menyambut para tamu dan menjelaskan cara menggunakan layanan foto.'],
 ['BIFARI','Prosesi akad nikah dilanjutkan dengan ijab kabul.'],
 ['SYAFIRA','Setelah akad, kita akan berdoa bersama untuk pernikahan kami.'],
 ['BIFARI','Perwakilan keluarga menyampaikan pesan dan doa untuk kedua mempelai.'],
 ['SYAFIRA','Acara dilanjutkan dengan foto bersama keluarga dan saksi.'],
 ['BIFARI','Silakan menikmati hidangan dan berbincang. Kami akan menyapa para tamu di setiap meja.'],
 ['SYAFIRA','Acara ditutup dengan ucapan terima kasih. Berikutnya adalah pilihan warna pakaian untuk para tamu.']
];
export function agendaArtwork(i){return `<div class="agenda-camera"><img class="agenda-background" data-src="/assets/png/finale/scroll-desk.png" alt=""/></div><div class="agenda-shade"></div><header class="welcome-heading"><span>BAB VI</span><h2 id="rundown-${i}-title">Jadwal Acara</h2><img src="/assets/png/arrival/ui-divider.png" alt=""/></header>`;}
export function agendaCard(i){return `<article class="agenda-card" aria-label="Rundown tahap ${i+1}"><div class="agenda-list" style="--offset:0">${CONFIG.RUNDOWN.map(([time,title],j)=>`<div class="agenda-entry" ${j>i?'hidden':''} ${j===i?'aria-current="step"':''}><time>${time} WIB</time><h3>${title}</h3></div>`).join('')}</div></article>`;}
export function agendaDialogue(i){return `<span class="agenda-current">${CONFIG.RUNDOWN[i][0]} WIB · ${CONFIG.RUNDOWN[i][1]}</span><p class="agenda-line">${dialogue[i][1]}</p>`;}
export function agendaSpeaker(i){return dialogue[i][0];}
