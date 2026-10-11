import {displayCode} from './api.js';
import {CONFIG} from './config.js';
import {qrData,ticketPayload,downloadBlob} from './ticket.js';
let cachedKey='',cachedCanvas,renderVersion=0;
const loadImage=async src=>{const img=new Image();img.src=src;await img.decode();return img;};
export async function renderSummaryCanvas(ticket){
 const key=JSON.stringify([ticket.id,ticket.name,ticket.guests,!!ticket.demo]);if(cachedKey===key&&cachedCanvas)return cachedCanvas;
 await Promise.all([document.fonts.load('70px GALVANIZED'),document.fonts.load('82px "IM Fell English"'),document.fonts.load('italic 32px "IM Fell English"')]);
 const [paper,qr]=await Promise.all([loadImage('/assets/png/ticket/stationery.png'),qrData(ticket,360).then(loadImage)]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1600;const g=canvas.getContext('2d');g.drawImage(paper,0,0,1080,1600);g.textAlign='center';
 const ink='#37131f',muted='#795144',maroon='#74243c';
 function text(value,x,y,size=40,font='"IM Fell English"',color=ink,max=800){
  g.fillStyle=color;g.font=size+'px '+font;
  while(g.measureText(value).width>max&&size>24)g.font=--size+'px '+font;
  g.fillText(value,x,y);
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
 text('TIKET RESEPSI',540,289,29,'Georgia',maroon);
 text('KHUSUS UNTUK',540,348,25,'Georgia',muted);
 let nameSize=86,nameLines;
 do{g.font=nameSize+'px "IM Fell English"';nameLines=wrap(ticket.name,780);if(nameLines.length*nameSize*1.1<=202)break;nameSize-=2;}while(nameSize>42);
 const nameHeight=nameLines.length*nameSize*1.1;
 nameLines.forEach((line,i)=>text(line,540,454-nameHeight/2+nameSize*.8+i*nameSize*1.1,nameSize));
 text(ticket.guests+' tamu',540,583,39,'"IM Fell English"',muted);
 text(CONFIG.EVENT.names.join(' & '),540,665,47,'GALVANIZED',maroon);
 g.strokeStyle='#8e596066';g.lineWidth=1.5;g.beginPath();g.moveTo(150,708);g.lineTo(930,708);g.stroke();

 g.imageSmoothingEnabled=false;g.drawImage(qr,145,794,340,340);g.imageSmoothingEnabled=true;
 text(displayCode(ticket.id),315,1185,43,'Georgia',ink,340);
 text('KODE UNDANGAN',315,1223,22,'Georgia',muted,340);

 g.textAlign='left';
 const [day,...date]=CONFIG.EVENT.dateLabel.split(',');
 text(day+',',530,786,38,'"IM Fell English"',muted,400);
 text(date.join(',').trim(),530,839,44,'"IM Fell English"',ink,400);
 text('Mulai '+CONFIG.EVENT.arrival,530,889,38,'"IM Fell English"',maroon,400);
 text(CONFIG.EVENT.venue,530,973,46,'"IM Fell English"',ink,400);
 g.font='32px "IM Fell English"';
 const address=CONFIG.EVENT.addressLines.flatMap(line=>wrap(line,400));
 address.forEach((line,i)=>text(line,530,1023+i*39,32,'"IM Fell English"',muted,400));

 g.textAlign='center';
 text('Dresscode: '+CONFIG.EVENT.dresscode.toLowerCase(),540,1311,33,'"IM Fell English"',maroon);
 text(ticket.demo?'PRATINJAU · BELUM TERDAFTAR':'Tunjukkan QR ini saat registrasi.',540,1362,29,'"IM Fell English"',muted);
 cachedKey=key;cachedCanvas=canvas;return canvas;
}
export async function updateSummary(ticket){
 const version=++renderVersion,host=document.querySelector('#closing-summary');if(!host)return;
 host.querySelector('.summary-name').textContent=ticket?.name||'Belum mengisi buku tamu';host.querySelector('.summary-guests').textContent=ticket?ticket.guests+' tamu':'';host.querySelector('.summary-code').textContent=ticket?ticketPayload(ticket):'';host.querySelector('.summary-mode').textContent=ticket?.demo?'CONTOH · BELUM TERDAFTAR':ticket?'RESERVASI TERCATAT':'';
 const preview=host.querySelector('.ticket-preview'),save=host.querySelector('#save-summary');save.disabled=true;preview.hidden=!ticket;if(!ticket)return;
 const canvas=await renderSummaryCanvas(ticket);if(version!==renderVersion)return;preview.src=canvas.toDataURL('image/png');preview.alt='Tiket resepsi untuk '+ticket.name+', '+ticket.guests+' tamu. Pernikahan Achmad Bifari dan Syafira Aulia. '+CONFIG.EVENT.dateLabel+', mulai '+CONFIG.EVENT.arrival+'. '+CONFIG.EVENT.venue+', '+CONFIG.EVENT.addressLines.join(', ')+'. Kode '+displayCode(ticket.id)+'. '+(ticket.demo?'Tiket pratinjau; belum terdaftar.':'Reservasi tercatat.');save.disabled=false;save.onclick=()=>saveSummary(ticket);
}
export async function saveSummary(ticket){if(!ticket)return;const canvas=await renderSummaryCanvas(ticket);canvas.toBlob(blob=>{if(blob)downloadBlob(blob,'tiket-undangan-'+(ticket.demo?'contoh-':'')+ticket.id+'.png');},'image/png');}
