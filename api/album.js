import {handleUpload} from '@vercel/blob/client';
import {list} from '@vercel/blob';
import {PHOTO,PHOTO_ID,session,setSession,requireSession,sameOrigin,eventKey,equal,settings,readJson,writeJson,finishPhoto,verifyPin,getPhotos,canReadPhoto} from '../server/album-core.js';
export const config={maxDuration:60};
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(req.method==='GET'){const s=session(req);return res.status(200).json({ok:true,session:s?{role:s.role,name:s.name,owner:s.owner}:null});}
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Metode tidak didukung.'});
  const b=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!b||JSON.stringify(b).length>12000)throw new Error('Permintaan tidak valid.');
  if(b.type==='blob.generate-client-token'||b.type==='blob.upload-completed'){
   const response=await handleUpload({body:b,request:req,onBeforeGenerateToken:async(path)=>{
    sameOrigin(req);const s=requireSession(req);if(!(await settings()).uploadsOpen)throw new Error('Unggahan sudah ditutup.');const match=PHOTO.exec(path);if(!match||match[1]!==s.owner)throw new Error('Foto tidak valid.');
    const files=await list({prefix:`photos/${s.owner}/`,limit:81});if(files.blobs.length>=80)throw new Error('Batas 80 foto per perangkat tercapai.');
    return {allowedContentTypes:['image/jpeg'],maximumSizeInBytes:8*1024*1024,addRandomSuffix:false,allowOverwrite:false,validUntil:Date.now()+300000,tokenPayload:JSON.stringify({name:s.name,path})};
   },onUploadCompleted:async({blob,tokenPayload})=>{const payload=JSON.parse(tokenPayload);if(blob.pathname!==payload.path)throw new Error('Foto tidak valid.');await finishPhoto(blob.pathname,payload.name);}});
   return res.status(200).json(response);
  }
  sameOrigin(req);
  if(b.action==='join'){
   if(!equal(b.key,eventKey()))throw Object.assign(new Error('Kode album tidak valid. Pindai QR kamera dari panitia.'),{status:401});
   const name=String(b.name||'').trim();if(name.length<2||name.length>60)throw new Error('Isi nama 2–60 karakter.');const previous=session(req);const s=setSession(res,{role:'guest',name,...(previous?.role==='guest'?{owner:previous.owner}:{})});return res.status(200).json({ok:true,session:{role:s.role,name:s.name,owner:s.owner}});
  }
  if(b.action==='login'){await verifyPin(b.pin);const previous=session(req);const s=setSession(res,{role:'admin',name:'Panitia',...(previous?{owner:previous.owner}:{})});return res.status(200).json({ok:true,session:{role:s.role,name:s.name,owner:s.owner}});}
  if(b.action==='logout'){res.setHeader('Set-Cookie','wedding_album=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');return res.status(200).json({ok:true});}
  const s=requireSession(req);
  if(b.action==='list'){const state=await settings();const photos=await getPhotos(typeof b.cursor==='string'?b.cursor:undefined);return res.status(200).json({ok:true,...state,photos:photos.records.filter(m=>canReadPhoto(s,m,state)).map(m=>({id:m.id,name:m.name,status:m.status,createdAt:m.createdAt,own:m.owner===s.owner,url:`/api/media?id=${m.id}`})),cursor:photos.cursor,...(s.role==='admin'?{eventKey:eventKey()}:{})});}
  if(b.action==='complete'){const match=PHOTO.exec(b.path||'');if(!match||match[1]!==s.owner)throw new Error('Foto tidak valid.');return res.status(200).json(await finishPhoto(b.path,s.name));}
  requireSession(req,true);
  if(b.action==='settings'){const current=await settings();const value={revealed:typeof b.revealed==='boolean'?b.revealed:current.revealed,uploadsOpen:typeof b.uploadsOpen==='boolean'?b.uploadsOpen:current.uploadsOpen};await writeJson('album/settings.json',value);return res.status(200).json({ok:true,...value});}
  if(b.action==='moderate'){if(!PHOTO_ID.test(b.id)||!['approved','hidden','pending'].includes(b.status))throw new Error('Pilihan tidak valid.');const photo=await readJson(`meta/${b.id}.json`);if(!photo)throw new Error('Foto tidak ditemukan.');await writeJson(`meta/${b.id}.json`,{...photo,status:b.status});return res.status(200).json({ok:true});}
  throw new Error('Permintaan tidak valid.');
 }catch(e){console.error('Album request failed:',e.name);res.status(e.status||400).json({ok:false,error:e.status===401||/^(Isi nama|Kode album|Unggahan|Batas |Silakan|PIN )/.test(e.message)?e.message:'Permintaan belum berhasil. Periksa koneksi, lalu coba lagi.'});}
}
