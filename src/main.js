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
const app=document.querySelector('#app');
if(location.pathname.replace(/\/$/,'')==='/admin'){
  await import('./admin.css');
  const {renderAdmin}=await import('./admin.js');
  await renderAdmin(app);
}else{
  const {renderInvitation}=await import('./invitation.js');
  await renderInvitation(app);
}
app.dataset.ready='true';
