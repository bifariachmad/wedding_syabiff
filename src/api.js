import { CONFIG } from './config.js';
export const ID_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
export const normalizeName = value => String(value).trim().replace(/\s+/g,' ').toLowerCase();
export function validate(name, guests) {
  const clean=String(name).trim();
  if(!clean)return 'Nama belum diisi';
  if(clean.length<2)return 'Nama minimal 2 karakter';
  if(clean.length>60)return 'Nama maksimal 60 karakter';
  if(!Number.isInteger(Number(guests))||Number(guests)<1)return 'Jumlah tamu minimal 1';
  if(Number(guests)>CONFIG.MAX_GUESTS)return 'Jumlah tamu maksimal 5';
  return '';
}
export async function request(action,payload={}) {
  if(!CONFIG.APPS_SCRIPT_URL) throw new Error('Gagal mengirim. Periksa koneksi lalu coba lagi.');
  const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),25000);
  try{
    const response=await fetch(CONFIG.APPS_SCRIPT_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload}),signal:controller.signal});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const result=await response.json();
    if(!result.ok)throw new Error(result.error||'Gagal mengirim. Periksa koneksi lalu coba lagi.');
    return result;
  }finally{clearTimeout(timeout);}
}
