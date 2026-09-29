import './style.css';
import './raster.css';
import './novel.css';
import './prologue.css';
import './courtyard.css';
import './welcome.css';
import './clockroom.css';
import './maproom.css';
import './agenda.css';
import './wardrobe.css';
import './finale.css';
import './guestbook.css';
import './guest-friendly.css';
const app=document.querySelector('#app');
const route=location.pathname.replace(/\/$/,'');
if(['/reservasi','/cetak','/kamera','/album-admin'].includes(route)){
  await import('./companion.css');
  if(route==='/kamera'||route==='/album-admin'){
    const {renderCamera}=await import('./camera.js'); await renderCamera(app,route==='/album-admin');
  }else{
    const {renderReservation}=await import('./reservation.js'); await renderReservation(app,route==='/cetak');
  }
}else if(['/admin','/buku-tamu'].includes(route)){
  await import('./admin.css');
  await import('./companion.css');
  document.body.className='companion guest-admin';
  const {renderAdmin}=await import('./admin.js');
  await renderAdmin(app);
  if(route==='/buku-tamu'){
    document.querySelector('.admin h1').textContent='Buku Tamu';
    const nav=document.createElement('nav');nav.className='admin-actions';
    for(const [href,label] of [['/reservasi?mode=panitia','Reservasikan tamu offline'],['/cetak','Cetak undangan A5'],['/album-admin','Kelola album'],['https://docs.google.com/spreadsheets/d/18MMsdmA47e9p3nhbQrhV-P4b8W9F4njlfvXiZEj6jsE/edit#gid=10312026','Buka Google Sheets']]){const a=document.createElement('a');a.href=href;a.className='button';a.textContent=label;nav.append(a);}
    document.querySelector('.admin h1').after(nav);
  }
  const adminTitle=app.querySelector('.admin h1');
  const heading=document.createElement('header');heading.className='companion-heading';
  const kicker=document.createElement('p');kicker.className='kicker';kicker.textContent='DUA JIWA · SATU LENTERA';
  adminTitle.before(heading);heading.append(kicker,adminTitle);
  app.querySelector('#admin-login').classList.add('companion-card');
}else{
  const {preparePortrait}=await import('./device.js');
  await preparePortrait(app,async()=>{
    const {renderInvitation}=await import('./invitation.js');
    await renderInvitation(app);
  });
}
app.dataset.ready='true';

import './scene-refinements.css';
import './portrait.css';
