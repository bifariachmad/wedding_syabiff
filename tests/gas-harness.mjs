import vm from 'node:vm';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
export function createBackend(){
 const data=[['id','created_at','updated_at','name','name_key','guests','checked_in','checked_in_at']];
 const properties={SHEET_ID:'test-sheet',ADMIN_PIN:'test-only-pin'};let locked=false,writeCount=0,lockCount=0;
 const requireLock=()=>{if(!locked)throw new Error('Write outside lock');writeCount++;};
 const range=(r,c,n=1,m=1)=>({getValues:()=>data.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+m)),setValues:values=>{requireLock();values.forEach((row,i)=>row.forEach((v,j)=>{data[r-1+i][c-1+j]=v;}));},setNumberFormat:()=>{}});
 const sheet={getLastRow:()=>data.length,getRange:range,appendRow:row=>{requireLock();data.push([...row]);}};
 const context={console,Date,Math,JSON,Number,String,Array,Error,PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties[key],setProperty:(k,v)=>properties[k]=v})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{if(!locked)throw new Error('Flush outside lock');}},LockService:{getScriptLock:()=>({waitLock:()=>{if(locked)throw new Error('Overlapping write');locked=true;lockCount++;},releaseLock:()=>{locked=false;}})},Utilities:{getUuid:randomUUID},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),context);
 return {call:body=>context.doPost({postData:{contents:JSON.stringify(body)}}),data,metrics:()=>({writeCount,lockCount,locked})};
}
