import {get} from '@vercel/blob';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {PHOTO_ID,requireSession,readJson,settings,canReadPhoto} from '../server/album-core.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(req.method!=='GET')return res.status(405).end();const s=requireSession(req);const id=req.query.id;if(typeof id!=='string'||!PHOTO_ID.test(id))return res.status(404).end();
  const photo=await readJson(`meta/${id}.json`);if(!canReadPhoto(s,photo,await settings()))return res.status(404).end();const blob=await get(photo.path,{access:'private'});if(!blob)return res.status(404).end();
  res.setHeader('Content-Type','image/jpeg');res.setHeader('Content-Disposition',`${req.query.download==='1'?'attachment':'inline'}; filename="kenangan-${id}.jpg"`);await pipeline(Readable.fromWeb(blob.stream),res);
 }catch(e){if(!res.headersSent)res.status(e.status||500).json({ok:false,error:'Foto belum dapat dibuka.'});else res.end();}
}
