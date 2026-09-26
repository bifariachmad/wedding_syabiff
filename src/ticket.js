import QRCode from 'qrcode';
import { CONFIG, invitationUrl } from './config.js';
import { ID_PATTERN } from './api.js';
import { art, icon, hydrateArt } from './art.js';
export const ticketPayload = ticket => `${ticket.demo?'DEMO-':''}DJSL-${ticket.id}`;
export function validTicket(value){return value&&ID_PATTERN.test(value.id)&&typeof value.name==='string'&&value.name.trim().length>=2&&value.name.length<=60&&Number.isInteger(value.guests)&&value.guests>=1&&value.guests<=CONFIG.MAX_GUESTS;}
export async function qrData(ticket,width=360) {return QRCode.toDataURL(ticketPayload(ticket),{width,margin:4,errorCorrectionLevel:'M',color:{dark:'#15100E',light:'#EADFC8'}});}
const escapeICS=value=>String(value).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const utc=value=>new Date(value).toISOString().replaceAll(/[-:]/g,'').replace('.000','');
export function calendarFile(){
  const e=CONFIG.EVENT;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Dua Jiwa Satu Lentera//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:dua-jiwa-satu-lentera-20261031@invitation',`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(e.start)}`,`DTEND:${utc(e.end)}`,`SUMMARY:${escapeICS(`Pernikahan ${e.names.join(' & ')}`)}`,`LOCATION:${escapeICS(e.venue)}`,`GEO:${e.geo.join(';')}`,`URL:${invitationUrl()}`,'END:VEVENT','END:VCALENDAR'];
  // RFC 5545 lines are folded at at most 75 UTF-8 octets, not UTF-16 units.
  return lines.map(line=>{let out='',part='';for(const c of line){if(new TextEncoder().encode(part+c).length>73){out+=part+'\r\n ';part='';}part+=c;}return out+part;}).join('\r\n')+'\r\n';
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
export async function renderTicket(host,ticket,edit) {
  host.hidden=false;
  host.innerHTML=`<div class="ticket-card" id="ticket-card">${art('wax-seal','ticket-seal')}<p class="eyebrow">Tiket Reservasi</p><div class="ticket-top"><span class="ticket-label">Nama</span><h3 class="ticket-name"></h3><span class="ticket-label">Jumlah Tamu</span><strong class="ticket-guests"></strong></div><div class="ticket-perforation"></div><p class="ticket-date">${CONFIG.EVENT.dateLabel} · ${CONFIG.EVENT.arrival}</p><p>${CONFIG.EVENT.venue}<br>Dresscode: ${CONFIG.EVENT.dresscode}</p><img class="ticket-qr" width="224" height="224" alt="QR reservasi"/><p class="ticket-code"></p><p class="ticket-instruction">${ticket.demo?'QR mockup — bukan tiket check-in.':'Tunjukkan QR ini saat registrasi.'}</p></div><div class="ticket-actions"><button class="button primary" id="save-ticket">${icon('download')}Simpan Tiket</button><button class="button" id="calendar">${icon('calendar')}Tambahkan ke Kalender</button><button class="text-button" id="edit-reservation">Ubah Reservasi</button></div>`;
  host.querySelector('.ticket-name').textContent=ticket.name;
  host.querySelector('.ticket-guests').textContent=ticket.guests;
  host.querySelector('.ticket-code').textContent=ticketPayload(ticket);
  host.querySelector('.ticket-qr').src=await qrData(ticket);
  host.querySelector('#save-ticket').onclick=()=>saveTicket(ticket);
  host.querySelector('#calendar').onclick=()=>downloadBlob(new Blob([calendarFile()],{type:'text/calendar;charset=utf-8'}),'dua-jiwa-satu-lentera.ics');
  host.querySelector('#edit-reservation').onclick=edit;
  await hydrateArt(host);
}
export async function saveTicket(ticket) {
  await document.fonts.ready;
  const c=document.createElement('canvas');c.width=900;c.height=1430;const g=c.getContext('2d');
  g.fillStyle='#EADFC8';g.fillRect(0,0,c.width,c.height);
  g.strokeStyle='#15100E';g.lineWidth=3;g.strokeRect(25,25,850,1380);g.lineWidth=1;g.strokeRect(36,36,828,1358);
  g.textAlign='center';g.fillStyle='#6B1420';g.font='64px GALVANIZED';g.fillText('Tiket Reservasi',450,128);
  g.fillStyle='#15100E';g.font='24px "Special Elite"';g.fillText('Nama',450,205);
  g.font='43px "IM Fell English"';
  const words=ticket.name.split(/\s+/),lines=[];let line='';
  for(const word of words){if(g.measureText(line+' '+word).width>740&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}
  if(line)lines.push(line);
  lines.forEach((l,i)=>{let size=43;while(g.measureText(l).width>740&&size>18)g.font=`${--size}px "IM Fell English"`;g.fillText(l,450,263+i*48);g.font='43px "IM Fell English"';});
  const shift=Math.max(0,lines.length-1)*48;
  g.font='25px "Special Elite"';g.fillText(`Jumlah Tamu: ${ticket.guests}`,450,345+shift);
  g.setLineDash([4,12]);g.beginPath();g.moveTo(30,397+shift);g.lineTo(870,397+shift);g.stroke();g.setLineDash([]);
  g.font='30px "IM Fell English"';g.fillText(`${CONFIG.EVENT.dateLabel} · ${CONFIG.EVENT.arrival}`,450,463+shift);g.fillText(CONFIG.EVENT.venue,450,511+shift);g.fillText(`Dresscode: ${CONFIG.EVENT.dresscode}`,450,553+shift);
  const qr=new Image();qr.src=await qrData(ticket,500);await qr.decode();g.drawImage(qr,200,600+shift,500,500);
  g.font='30px "Special Elite"';g.fillText(ticketPayload(ticket),450,1145+shift);g.font='28px "IM Fell English"';g.fillText(ticket.demo?'MOCKUP - BUKAN TIKET CHECK-IN':'Tunjukkan QR ini saat registrasi.',450,1215+shift);
  g.font='24px "IM Fell English"';g.fillStyle='#6B1420';g.fillText('Dua Jiwa, Satu Lentera',450,1353);
  c.toBlob(blob=>{if(blob)downloadBlob(blob,`tiket-${ticket.id}.png`);},'image/png');
}
