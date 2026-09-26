import {CONFIG} from './config.js';
import {qrData,ticketPayload,downloadBlob} from './ticket.js';
export async function updateSummary(ticket){
 const host=document.querySelector('#closing-summary');if(!host)return;
 host.querySelector('.summary-name').textContent=ticket?.name||'Belum mengisi buku tamu';
 host.querySelector('.summary-guests').textContent=ticket?`${ticket.guests} tamu`:'Jumlah tamu belum diisi';
 const badge=host.querySelector('.summary-mode');badge.textContent=ticket?.demo?'CONTOH · BELUM TERDAFTAR':ticket?'RESERVASI TERCATAT':'REKAP UNDANGAN';
 const qr=host.querySelector('.summary-qr');qr.hidden=!ticket;host.querySelector('.summary-code').textContent=ticket?ticketPayload(ticket):'Isi reservasi untuk mendapatkan QR tamu.';
 if(ticket)qr.src=await qrData(ticket,360);else qr.removeAttribute('src');
 const save=document.querySelector('#save-summary');save.disabled=!ticket;save.onclick=()=>saveSummary(ticket);
}
export async function saveSummary(ticket){
 if(!ticket)return;await document.fonts.load('40px GALVANIZED');await document.fonts.ready;
 const c=document.createElement('canvas');c.width=1080;c.height=1600;const g=c.getContext('2d');
 g.fillStyle='#210e17';g.fillRect(0,0,1080,1600);g.fillStyle='#eadfc8';g.fillRect(42,42,996,1516);g.strokeStyle='#702239';g.lineWidth=4;g.strokeRect(63,63,954,1474);g.textAlign='center';
 function text(value,y,font,color='#30121d'){g.font=font;g.fillStyle=color;g.fillText(value,540,y);}
 text('Undangan Pernikahan',140,'48px Georgia','#702239');text('Achmad Bifari & Syafira Aulia',265,'42px GALVANIZED');
 text(CONFIG.EVENT.dateLabel,340,'32px "IM Fell English"');text('09:30–13:40 WIB',386,'30px "IM Fell English"');text(CONFIG.EVENT.venue,432,'34px "IM Fell English"');text('Dresscode: maroon atau hitam',477,'27px "IM Fell English"');
 text('UNTUK',555,'22px "Special Elite"');let size=40;g.font=`${size}px "IM Fell English"`;while(g.measureText(ticket.name).width>880&&size>17)g.font=`${--size}px "IM Fell English"`;text(ticket.name,610,g.font);text(`${ticket.guests} tamu`,658,'30px "Special Elite"');
 const qr=new Image();qr.src=await qrData(ticket,560);await qr.decode();g.drawImage(qr,260,710,560,560);text(ticketPayload(ticket),1310,'25px "Special Elite"');text(ticket.demo?'MOCKUP · BUKAN TIKET CHECK-IN':'Tunjukkan QR ini saat registrasi.',1380,'25px "Special Elite"','#702239');text('Sampai bertemu di hari bahagia kami.',1470,'30px "IM Fell English"');
 c.toBlob(blob=>{if(blob)downloadBlob(blob,`rekap-undangan-${ticket.demo?'mockup-':''}${ticket.id}.png`);},'image/png');
}
