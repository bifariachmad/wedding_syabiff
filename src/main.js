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
  await import('./reception.css');
  document.body.className='companion guest-admin';
  const {renderAdmin}=await import('./admin.js');
  await renderAdmin(app);
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
