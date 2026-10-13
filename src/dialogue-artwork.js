import sizes from '../public/assets/png/ui-v2/sizes.json';

// The approved two-line frame is also the minimum for a one-line sentence.
const minimumFrame=sizes['dialogue-four-angular-v1'];
const minimumRatio=minimumFrame.height/minimumFrame.width;
const frames=Object.entries(sizes)
 .filter(([name,{width,height}])=>name.startsWith('dialogue-')&&height/width>=minimumRatio)
 .map(([name,{width,height}])=>({name,width,height}))
 .sort((a,b)=>a.height/a.width-b.height/b.width);
const captions=new Map();
let probe;

// Measure the complete sentence before typing starts. Never measure the changing
// substring: that would make the frame jump whenever another line appears.
export function fitDialogue(line,text){
 if(!line||!text)return;
 const panel=line.closest('.arrival-caption,.vn-dialogue');
 if(!panel||panel.closest('#reservation[data-book-step="2"]'))return;
 captions.set(line,text);
 const root=line.closest('#invitation'),panelStyle=getComputedStyle(panel),style=getComputedStyle(line);
 const width=panelStyle.width.endsWith('px')?parseFloat(panelStyle.width):root.clientWidth*.92;
 const paddingX=parseFloat(panelStyle.paddingLeft)+parseFloat(panelStyle.paddingRight);
 const paddingY=parseFloat(panelStyle.paddingTop)+parseFloat(panelStyle.paddingBottom);
 if(width<=paddingX)return;
 if(!probe){
  probe=document.createElement('div');
  probe.setAttribute('aria-hidden','true');
  probe.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:0;border:0;margin:0;height:auto;min-height:0;max-height:none;';
  root.append(probe);
 }
 function measure(element,content){
  const css=getComputedStyle(element);
  for(const property of ['font','lineHeight','letterSpacing','wordSpacing','whiteSpace','overflowWrap','wordBreak','textTransform'])probe.style[property]=css[property];
  probe.style.width=`${width-paddingX}px`;
  probe.textContent=content;
  return probe.getBoundingClientRect().height+parseFloat(css.marginTop)+parseFloat(css.marginBottom);
 }
 const textHeight=measure(line,text);
 const recipient=panel.querySelector('.recipient');
 const recipientHeight=recipient&&!recipient.hidden&&getComputedStyle(recipient).display!=='none'?measure(recipient,recipient.textContent):0;
 const needed=textHeight+recipientHeight+paddingY;
 const frame=frames.find(frame=>width*frame.height/frame.width>=needed)||frames.at(-1);
 panel.style.setProperty('--panel-image',`url('/assets/png/ui-v2/${frame.name}.png')`);
 panel.style.setProperty('--panel-ratio',`${frame.width}/${frame.height}`);
 panel.dataset.dialogueFrame=frame.name;
 panel.dataset.dialogueLines=String(Math.round(textHeight/parseFloat(style.lineHeight)));
}

export function initDialogueArtwork(root){
 root.querySelectorAll('#arrival-line,#courtyard-line,#welcome-line,#clockroom-line,#maproom-line,.agenda-line,#wardrobe-line,.guestbook-line')
  .forEach(line=>fitDialogue(line,line.textContent));
 const refresh=()=>captions.forEach((text,line)=>fitDialogue(line,text));
 const observer=new ResizeObserver(refresh);
 observer.observe(root);
 document.fonts.ready.then(refresh);
 document.fonts.addEventListener('loadingdone',refresh);
 window.addEventListener('pagehide',()=>{observer.disconnect();document.fonts.removeEventListener('loadingdone',refresh);},{once:true});
}
