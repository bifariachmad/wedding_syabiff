import QRCode from 'qrcode';
import { CONFIG, invitationUrl } from './config.js';
import { ID_PATTERN, displayCode } from './api.js';
import { art, icon, hydrateArt } from './art.js';
export const ticketPayload = ticket => `${ticket.demo?'DEMO-':''}DJSL-${ticket.id}`;
export function validTicket(value){return value&&ID_PATTERN.test(value.id)&&typeof value.name==='string'&&value.name.trim().length>=2&&value.name.length<=60&&Number.isInteger(value.guests)&&value.guests>=1&&value.guests<=CONFIG.MAX_GUESTS;}
export async function qrData(ticket,width=360) {return QRCode.toDataURL(ticketPayload(ticket),{width,margin:4,errorCorrectionLevel:'M',color:{dark:'#15100E',light:'#EADFC8'}});}
const escapeICS=value=>String(value).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const utc=value=>new Date(value).toISOString().replaceAll(/[-:]/g,'').replace('.000','');
export function calendarFile(){
  const e=CONFIG.EVENT;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Pernikahan Bifari Syafira//ID','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:dua-jiwa-satu-lentera-20261031@invitation',`DTSTAMP:${utc(new Date())}`,`DTSTART:${utc(e.start)}`,...(e.end?[`DTEND:${utc(e.end)}`]:[]),`SUMMARY:${escapeICS(`Resepsi ${e.names.join(' & ')}`)}`,`LOCATION:${escapeICS([e.venue,...e.addressLines].join(', '))}`,`GEO:${e.geo.join(';')}`,`URL:${invitationUrl()}`,'END:VEVENT','END:VCALENDAR'];
  // RFC 5545 lines are folded at at most 75 UTF-8 octets, not UTF-16 units.
  return lines.map(line=>{let out='',part='';for(const c of line){if(new TextEncoder().encode(part+c).length>73){out+=part+'\r\n ';part='';}part+=c;}return out+part;}).join('\r\n')+'\r\n';
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
export async function renderTicket(host,ticket,edit) {
  host.hidden=false;
  host.innerHTML=`<div class="ticket-card" id="ticket-card">${art('wax-seal','ticket-seal')}<p class="eyebrow">Tiket Reservasi</p><div class="ticket-top"><span class="ticket-label">Nama</span><h3 class="ticket-name"></h3><span class="ticket-label">Jumlah Tamu</span><strong class="ticket-guests"></strong></div><div class="ticket-perforation"></div><p class="ticket-date">${CONFIG.EVENT.dateLabel} · ${CONFIG.EVENT.timeLabel}</p><p>${CONFIG.EVENT.venue}<br>${CONFIG.EVENT.addressLines.join('<br>')}<br>Dresscode: ${CONFIG.EVENT.dresscode}</p><img class="ticket-qr" width="224" height="224" alt="QR reservasi"/><p class="ticket-code"></p><p class="ticket-instruction">${ticket.demo?'QR mockup — bukan tiket check-in.':'Tunjukkan QR ini saat registrasi.'}</p></div><div class="ticket-actions"><button class="button primary" id="save-ticket">${icon('download')}Simpan Tiket</button><button class="button" id="calendar">${icon('calendar')}Tambahkan ke Kalender</button><button class="text-button" id="edit-reservation">Ubah Konfirmasi</button></div>`;
  host.querySelector('.ticket-name').textContent=ticket.name;
  host.querySelector('.ticket-guests').textContent=ticket.guests;
  host.querySelector('.ticket-code').textContent=displayCode(ticket.id);
  host.querySelector('.ticket-qr').src=await qrData(ticket);
  host.querySelector('#save-ticket').onclick=()=>saveTicket(ticket);
  host.querySelector('#calendar').onclick=()=>downloadBlob(new Blob([calendarFile()],{type:'text/calendar;charset=utf-8'}),'pernikahan-bifari-syafira.ics');
  host.querySelector('#edit-reservation').onclick=edit;
  await hydrateArt(host);
}
export async function saveTicket(ticket) {
  // Direct reservations and the story ending download the same ticket design.
  const {saveSummary}=await import('./summary.js');
  return saveSummary(ticket);
}
