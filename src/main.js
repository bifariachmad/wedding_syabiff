import './style.css';
import './raster.css';
import './novel.css';
import './prologue.css';
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
