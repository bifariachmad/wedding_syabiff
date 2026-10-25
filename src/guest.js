// The invited guest from ?to=Nama+Tamu; empty when the link carries no name.
export const guestName=(new URLSearchParams(typeof location==='undefined'?'':location.search).get('to')||'').trim().replace(/\s+/g,' ').slice(0,60);
// The "KAMU" speaker tag becomes the guest's name, cut to 10 characters so the tag stays one short line.
export const speakerName=label=>{
 if(label!=='KAMU'||!guestName)return label;
 return guestName.length>10?guestName.slice(0,10).trimEnd()+'...':guestName;
};
