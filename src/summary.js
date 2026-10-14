import { attendanceOf } from './rsvp.js';
import {displayCode} from './api.js';
import {CONFIG} from './config.js';
import {qrData,ticketPayload,downloadBlob,calendarFile} from './ticket.js';
let cachedKey='',cachedCanvas,renderVersion=0;
const loadImage=async src=>{const img=new Image();img.src=src;await img.decode();return img;};
export async function renderSummaryCanvas(ticket){
 const key=JSON.stringify([ticket.id,ticket.name,ticket.guests,!!ticket.demo]);if(cachedKey===key&&cachedCanvas)return cachedCanvas;
 await document.fonts.load('82px "IM Fell English"');
 const [paper,qr,logo]=await Promise.all([loadImage('/assets/png/ticket/stationery-no-lantern.png').catch(()=>null),qrData(ticket,360).then(loadImage),loadImage('/assets/png/title/wedding-logo-stamp-v1.png').catch(()=>null)]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1600;const g=canvas.getContext('2d');if(paper)g.drawImage(paper,0,0,1080,1600);else{g.fillStyle='#eadfc8';g.fillRect(0,0,1080,1600);g.strokeStyle='#6b1420';g.lineWidth=5;g.strokeRect(55,55,970,1490);}g.textAlign='center';
 const ink='#37131f',muted='#795144',maroon='#74243c';
 function text(value,x,y,size=40,font='"IM Fell English"',color=ink,max=800){
  g.fillStyle=color;g.font=size+'px '+font;
  while(g.measureText(value).width>max&&size>24)g.font=--size+'px '+font;
  g.fillText(value,x,y);return g.measureText(value);
 }
 // Wrap long names and address words without clipping even an unbroken surname.
 function wrap(value,width){
  const lines=[];let line='';
  for(const word of value.trim().split(/\s+/)){
   if(line&&g.measureText(line+' '+word).width>width){lines.push(line);line='';}
   for(const char of (line?' ':'')+word){
    if(g.measureText(line+char).width>width&&line){lines.push(line);line='';}
    line+=char;
   }
  }
  if(line)lines.push(line);return lines;
 }
 if(logo)g.drawImage(logo,355,185,370,370*logo.height/logo.width);else text('Bifari & Syafira',540,260,68);
 text('Teruntuk',540,421,34,'"IM Fell English"',muted);
 let nameSize=112,nameLines;
 do{g.font=nameSize+'px "IM Fell English"';nameLines=wrap(ticket.name,760);if(nameLines.length*nameSize*1.12<=208)break;nameSize-=2;}while(nameSize>38);
 const nameHeight=nameLines.length*nameSize*1.12;
 let nameBottom=0;
 nameLines.forEach((line,i)=>{const y=545-nameHeight/2+nameSize*.76+i*nameSize*1.12;const m=text(line,540,y,nameSize);nameBottom=Math.max(nameBottom,y+m.actualBoundingBoxDescent);});
 text(ticket.guests+' tamu',540,nameBottom+43,37,'"IM Fell English"',muted);
 g.strokeStyle='#8e596066';g.lineWidth=1.5;g.beginPath();g.moveTo(155,735);g.lineTo(925,735);g.stroke();

 // Date and address define a shared top/bottom for both columns.
 g.textAlign='left';
 const [day,...date]=CONFIG.EVENT.dateLabel.split(',');
 const dayMetrics=text(day+',',535,792,36,'"IM Fell English"',muted,390);
 text(date.join(',').trim(),535,845,42,'"IM Fell English"',ink,390);
 text('Mulai '+CONFIG.EVENT.arrival,535,895,36,'"IM Fell English"',maroon,390);
 text(CONFIG.EVENT.venue,535,979,44,'"IM Fell English"',ink,390);
 g.font='32px "IM Fell English"';
 const address=CONFIG.EVENT.addressLines.flatMap(line=>wrap(line,390));
 let columnBottom=0;
 address.forEach((line,i)=>{const y=1026+i*37;const m=text(line,535,y,32,'"IM Fell English"',muted,390);columnBottom=y+m.actualBoundingBoxDescent;});
 const columnTop=792-dayMetrics.actualBoundingBoxAscent,qrSize=330;
 g.imageSmoothingEnabled=false;g.drawImage(qr,155,columnTop,qrSize,qrSize);g.imageSmoothingEnabled=true;
 g.textAlign='center';
 g.font='22px Georgia';
 const labelBaseline=columnBottom-g.measureText('KODE UNDANGAN').actualBoundingBoxDescent;
 text(displayCode(ticket.id),320,labelBaseline-39,42,'Georgia',ink,330);
 text('KODE UNDANGAN',320,labelBaseline,22,'Georgia',muted,330);
 text('Dresscode:',540,1250,31,'"IM Fell English"',muted);
 text(CONFIG.EVENT.dresscode,540,1296,37,'"IM Fell English"',maroon);
 text(ticket.demo?'PRATINJAU · BELUM TERDAFTAR':'Tunjukkan tiket ini saat registrasi.',540,1361,30,'"IM Fell English"',muted);
 cachedKey=key;cachedCanvas=canvas;return canvas;
}
export async function updateSummary(ticket){
 const version=++renderVersion,host=document.querySelector('#closing-summary');if(!host)return;
 const declined=attendanceOf(ticket)==='declined';
 const calendar=host.querySelector('#summary-calendar');calendar.hidden=!ticket||declined;calendar.onclick=()=>downloadBlob(new Blob([calendarFile()],{type:'text/calendar;charset=utf-8'}),'resepsi-bifari-syafira.ics');
 const message=host.querySelector('#declined-summary');
 message.hidden=!declined;message.querySelector('.declined-name').textContent=declined?ticket.name+' · Tidak dapat hadir':'';
 document.querySelector('#closing-title').textContent=declined?'Terima Kasih':'Tiket Undangan';
 host.dataset.attendance=declined?'declined':'attending';
 host.querySelector('.summary-name').textContent=ticket?.name||'Belum mengisi buku tamu';host.querySelector('.summary-guests').textContent=declined?'Tidak dapat hadir':ticket?ticket.guests+' tamu':'';host.querySelector('.summary-code').textContent=ticket&&!declined?ticketPayload(ticket):'';host.querySelector('.summary-mode').textContent=ticket?.demo?'CONTOH · BELUM TERDAFTAR':declined?'KONFIRMASI TERCATAT':ticket?'RESERVASI TERCATAT':'';
 const preview=host.querySelector('.ticket-preview'),save=host.querySelector('#save-summary');save.disabled=true;save.hidden=declined;save.onclick=null;preview.hidden=!ticket||declined;if(!ticket||declined){preview.removeAttribute('src');preview.alt='';return;}
 let canvas;try{canvas=await renderSummaryCanvas(ticket);}catch{if(version!==renderVersion)return;preview.hidden=true;host.querySelector('.summary-accessible').classList.add('summary-fallback');save.disabled=false;save.textContent='Muat ulang tiket';save.onclick=()=>updateSummary(ticket);return;}if(version!==renderVersion)return;host.querySelector('.summary-accessible').classList.remove('summary-fallback');save.textContent='Simpan Tiket sebagai Foto';preview.src=canvas.toDataURL('image/png');preview.alt='Tiket resepsi untuk '+ticket.name+', '+ticket.guests+' tamu. Pernikahan Achmad Bifari dan Syafira Aulia. '+CONFIG.EVENT.dateLabel+', mulai '+CONFIG.EVENT.arrival+'. '+CONFIG.EVENT.venue+', '+CONFIG.EVENT.addressLines.join(', ')+'. Kode '+displayCode(ticket.id)+'. '+(ticket.demo?'Tiket pratinjau; belum terdaftar.':'Reservasi tercatat.');save.disabled=false;save.onclick=()=>saveSummary(ticket);
}
export async function saveSummary(ticket){if(!ticket||attendanceOf(ticket)==='declined')return;const canvas=await renderSummaryCanvas(ticket);canvas.toBlob(blob=>{if(blob)downloadBlob(blob,'tiket-undangan-'+(ticket.demo?'contoh-':'')+ticket.id+'.png');},'image/png');}
