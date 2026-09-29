import {displayCode} from './api.js';
import {CONFIG} from './config.js';
import {qrData,ticketPayload,downloadBlob} from './ticket.js';
let cachedKey='',cachedCanvas,renderVersion=0;
const loadImage=async src=>{const img=new Image();img.src=src;await img.decode();return img;};
export async function renderSummaryCanvas(ticket){
 const key=JSON.stringify([ticket.id,ticket.name,ticket.guests,!!ticket.demo]);if(cachedKey===key&&cachedCanvas)return cachedCanvas;
 await Promise.all([document.fonts.load('70px GALVANIZED'),document.fonts.load('50px "IM Fell English"')]);
 const [paper,seal,qr]=await Promise.all([loadImage('/assets/png/ticket/stationery.png'),loadImage('/assets/png/wax-seal.png'),qrData(ticket,400).then(loadImage)]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1600;const g=canvas.getContext('2d');g.drawImage(paper,0,0,1080,1600);g.textAlign='center';
 function text(value,y,size=48,font='"IM Fell English"',color='#37131f',max=740){g.fillStyle=color;g.font=size+'px '+font;while(g.measureText(value).width>max&&size>24)g.font=--size+'px '+font;g.fillText(value,540,y);}
 text('UNDANGAN PERNIKAHAN',269,29,'Georgia','#74243c');
 text('Achmad Bifari',351,78,'GALVANIZED');text('&',405,39,'Georgia','#74243c');text('Syafira Aulia',471,78,'GALVANIZED');
 text(CONFIG.EVENT.dateLabel,544,46);text('09:30–13:40 WIB',601,45);text(CONFIG.EVENT.venue,671,57);text('Maroon atau hitam',720,34,'Georgia','#74243c');
 g.strokeStyle='#8e5960';g.lineWidth=1.5;g.beginPath();g.moveTo(250,750);g.lineTo(830,750);g.stroke();
 text('KHUSUS UNTUK',795,26,'Georgia','#74243c');text(ticket.name,860,58);text(ticket.guests+' tamu',916,40);
 g.drawImage(qr,370,952,340,340);g.drawImage(seal,740,1075,195,195);
 text(displayCode(ticket.id),1330,50,'Georgia');
 text(ticket.demo?'PRATINJAU · BELUM TERDAFTAR':'Tunjukkan QR ini saat registrasi',1376,24,'Georgia','#74243c');
 cachedKey=key;cachedCanvas=canvas;return canvas;
}
export async function updateSummary(ticket){
 const version=++renderVersion,host=document.querySelector('#closing-summary');if(!host)return;
 host.querySelector('.summary-name').textContent=ticket?.name||'Belum mengisi buku tamu';host.querySelector('.summary-guests').textContent=ticket?ticket.guests+' tamu':'';host.querySelector('.summary-code').textContent=ticket?ticketPayload(ticket):'';host.querySelector('.summary-mode').textContent=ticket?.demo?'CONTOH · BELUM TERDAFTAR':ticket?'RESERVASI TERCATAT':'';
 const preview=host.querySelector('.ticket-preview'),save=host.querySelector('#save-summary');save.disabled=true;preview.hidden=!ticket;if(!ticket)return;
 const canvas=await renderSummaryCanvas(ticket);if(version!==renderVersion)return;preview.src=canvas.toDataURL('image/png');preview.alt='Undangan pernikahan Achmad Bifari dan Syafira Aulia. '+CONFIG.EVENT.venue+', '+CONFIG.EVENT.dateLabel+', 09:30–13:40 WIB. Untuk '+ticket.name+', '+ticket.guests+' tamu. '+(ticket.demo?'Tiket pratinjau; belum terdaftar.':'Reservasi tercatat.');save.disabled=false;save.onclick=()=>saveSummary(ticket);
}
export async function saveSummary(ticket){if(!ticket)return;const canvas=await renderSummaryCanvas(ticket);canvas.toBlob(blob=>{if(blob)downloadBlob(blob,'tiket-undangan-'+(ticket.demo?'contoh-':'')+ticket.id+'.png');},'image/png');}
