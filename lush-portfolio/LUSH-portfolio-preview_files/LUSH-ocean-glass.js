/* Three detents; native scrolling and view-layer dragging have separate ownership. */
(() => {
  'use strict';
  const P=window.LushSheetPhysics;
  window.LushOceanGlass={mount({sheet,overlay,onDismiss}){
    if(!sheet||!overlay||!P)return null;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),listeners=new AbortController();
    let state='collapsed',targetState='collapsed',phase='closed',height=0,half=0,y=0,motion=null,visual=[],revision=0;
    let content=null,head=null,layers=[],drag=null,dragFrame=0,lightFrame=0,energy=.1,desiredEnergy=.1,lightTime=0,finishClose=null,suppressClickUntil=0,releaseVelocity=0;
    const html=document.documentElement;
    function setQuality(value){
      const automatic=navigator.connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=4)?'low':matchMedia('(pointer:coarse)').matches?'medium':'high';
      html.dataset.glassQuality=['high','medium','low'].includes(value)?value:automatic;
    }
    setQuality(html.dataset.glassQuality);
    function structure(){
      if(!sheet.querySelector(':scope > .glass-sheet-content')){
        const existing=[...sheet.childNodes];head=document.createElement('div');head.className='glass-sheet-head';
        content=document.createElement('div');content.className='glass-sheet-content';content.tabIndex=-1;
        for(const node of existing){if(node.nodeType===1&&node.matches('.sheet-handle,.sheet-title'))head.append(node);else content.append(node);}
        layers=['blur','material','edge','lighting'].map(name=>{const el=document.createElement('div');el.className='glass-sheet-'+name;el.setAttribute('aria-hidden','true');return el;});
        sheet.replaceChildren(...layers,head,content);
      }else {head=sheet.querySelector('.glass-sheet-head');content=sheet.querySelector('.glass-sheet-content');layers=['blur','material','edge','lighting'].map(n=>sheet.querySelector('.glass-sheet-'+n));}
      const handle=head.querySelector('.sheet-handle');
      handle.removeAttribute('aria-hidden');handle.setAttribute('role','button');handle.tabIndex=0;handle.setAttribute('aria-label','展开或收起面板');
      sheet.dataset.oceanGlass='sheet';syncState();
    }
    function fitContent(name){if(content&&head)content.style.height=Math.max(0,height-position(name)-head.offsetHeight)+'px';}
    function syncState(){
      sheet.dataset.sheetState=state;sheet.dataset.sheetTarget=targetState;
      head?.querySelector('.sheet-handle')?.setAttribute('aria-expanded',String(targetState==='expanded'));
    }
    function layout(){
      const available=Math.min(innerHeight,window.visualViewport?.height||innerHeight,overlay.parentElement.clientHeight||innerHeight);
      overlay.style.height=available+'px';
      const gap=parseFloat(getComputedStyle(overlay).paddingTop)||20;
      height=Math.max(160,available-gap);sheet.style.height=height+'px';
      content.style.height='auto';
      const natural=head.scrollHeight+content.scrollHeight;
      const halfHeight=Math.min(natural,Math.max(available*.52,Math.min(natural,460)),height-Math.max(96,available*.20));
      half=Math.max(80,height-Math.max(160,halfHeight));
    }
    function position(name){return name==='expanded'?0:name==='half'?half:height+12;}
    function readY(){const t=getComputedStyle(sheet).transform;return t==='none'?y:new DOMMatrixReadOnly(t).m42;}
    function paint(value){y=value;sheet.style.transform='translate3d(0,'+value.toFixed(3)+'px,0)';}
    function stopMotion(){if(motion){motion.cancel();motion=null;}}
    function stopVisual(){
      const nodes=[...layers,head,content].filter(Boolean),values=nodes.map(el=>getComputedStyle(el).opacity);
      visual.forEach(a=>a.cancel());visual=[];
      nodes.forEach((el,i)=>el.style.opacity=values[i]);
    }
    function buildMaterial(show,fresh=false){
      stopVisual();
      const nodes=[layers[0],layers[1],layers[2],head,content],delays=show?[0,35,65,90,100]:[70,45,20,0,0];
      nodes.forEach((el,i)=>{
        const to=show?1:0,from=fresh?0:parseFloat(el.style.opacity||1);
        if(reduced.matches||!el.animate){el.style.opacity=String(to);return;}
        const a=el.animate([{opacity:from},{opacity:to}],{duration:show?300:180,delay:delays[i],fill:'both',easing:'cubic-bezier(.2,.7,.2,1)'});
        visual.push(a);a.onfinish=()=>{el.style.opacity=String(to);a.cancel();visual=visual.filter(x=>x!==a);};
      });
    }
    function animateTo(name,velocity=0,done){
      const from=readY();++revision;stopMotion();targetState=name;phase=name==='collapsed'?'closing':'settling';syncState();
      const to=position(name),own=revision;
      const finish=()=>{if(own!==revision)return;paint(to);motion=null;state=name;phase=name==='collapsed'?'closed':'open';syncState();if(name!=='collapsed')fitContent(name);done?.();};
      if(reduced.matches||!sheet.animate){finish();return;}
      motion=sheet.animate(P.samples(from,to,velocity,540).map(f=>({transform:'translate3d(0,'+f.y+'px,0)',offset:f.offset})),{duration:540,easing:'linear'});
      motion.onfinish=finish;
    }
    function stopLight(){cancelAnimationFrame(lightFrame);lightFrame=0;energy=desiredEnergy=.1;layers[3]?.style.removeProperty('opacity');}
    function lighting(now){
      lightFrame=0;const dt=Math.max(0,now-(lightTime||now-16));lightTime=now;
      energy+=(desiredEnergy-energy)*(1-Math.exp(-dt/100));
      if(layers[3])layers[3].style.opacity=String(energy);
      if(Math.abs(desiredEnergy-energy)>.002)lightFrame=requestAnimationFrame(lighting);else lightTime=0;
    }
    function respond(v){
      if(reduced.matches||html.dataset.glassQuality==='low')return;
      desiredEnergy=drag?P.clamp(.1-v*.10,.025,.25):.1;
      if(!lightFrame)lightFrame=requestAnimationFrame(lighting);
    }
    function cancelDrag(){
      delete sheet.dataset.sheetDragging;
      if(!drag)return;const old=drag;drag=null;cancelAnimationFrame(dragFrame);dragFrame=0;
      if(sheet.hasPointerCapture?.(old.id))sheet.releasePointerCapture(old.id);
      respond(0);
    }
    function open(){
      const visible=!overlay.hidden,from=visible?readY():null;
      ++revision;stopMotion();cancelDrag();finishClose=null;
      overlay.hidden=false;overlay.removeAttribute('data-glass-closing');sheet.inert=false;
      structure();layout();state=visible&&state==='expanded'?'expanded':'half';targetState=state;
      overlay.scrollTop=0;content.scrollTop=0;fitContent(state);paint(from===null?position('collapsed'):from);
      buildMaterial(true,!visible);animateTo(state);syncCovered();
    }
    function close(done){
      if(phase==='closing')return;
      if(overlay.hidden){done?.();return;}
      cancelDrag();finishClose=done;overlay.setAttribute('data-glass-closing','');sheet.inert=true;
      buildMaterial(false);desiredEnergy=0;if(!lightFrame)lightFrame=requestAnimationFrame(lighting);
      const velocity=releaseVelocity;releaseVelocity=0;animateTo('collapsed',velocity,()=>{
        overlay.hidden=true;overlay.removeAttribute('data-glass-closing');sheet.inert=false;stopLight();
        const callback=finishClose;finishClose=null;callback?.();syncCovered();
      });
    }
    function snap(name,velocity=0){
      if(name==='collapsed'){releaseVelocity=velocity;onDismiss();return;}
      buildMaterial(true);animateTo(name,velocity);
    }
    function begin(point,event,id,kind){
      if(overlay.hidden||phase==='closing'||drag||coveredRoot()!==overlay)return;
      const el=event.target;
      if(el.closest('button,a,input,textarea,select,video,[data-no-sheet-drag]'))return;
      const fromHead=!!el.closest('.glass-sheet-head');
      const scrolling=!fromHead&&state==='expanded'&&content.scrollTop>1;
      if(scrolling)return;
      drag={id,kind,startX:point.clientX,startY:point.clientY,lastY:point.clientY,at:performance.now(),velocity:0,from:readY(),origin:targetState,head:fromHead,active:false,native:false,paused:!!motion};
      if(drag.paused){++revision;stopMotion();paint(drag.from);}
    }
    function move(point,event){
      if(!drag||drag.native)return;
      const dx=point.clientX-drag.startX,dy=point.clientY-drag.startY;
      if(!drag.active){
        if(Math.max(Math.abs(dx),Math.abs(dy))<5)return;
        if(Math.abs(dx)>Math.abs(dy)){drag.native=true;return;}
        if(!drag.head&&drag.origin==='expanded'&&dy<0){drag.native=true;return;}
        ++revision;stopMotion();buildMaterial(true);drag.active=true;sheet.dataset.sheetDragging='true';
        if(drag.kind==='pointer')sheet.setPointerCapture?.(drag.id);
      }
      if(event.cancelable)event.preventDefault();
      const now=performance.now(),dt=Math.max(8,now-drag.at);
      drag.velocity=.35*drag.velocity+.65*(point.clientY-drag.lastY)/dt;drag.lastY=point.clientY;drag.at=now;
      const raw=drag.from+dy,limit=position('collapsed');
      drag.next=raw<0?-Math.min(16,Math.sqrt(-raw)*1.5):raw>limit?limit+Math.sqrt(raw-limit):raw;
      if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;if(drag?.active){paint(drag.next);respond(drag.velocity);}});
    }
    function end(cancelled=false){
      if(!drag)return;
      const d=drag;if(d.active&&d.next!==undefined)paint(d.next);
      const velocity=performance.now()-d.at<100?d.velocity:0;
      cancelDrag();delete sheet.dataset.sheetDragging;
      if(!d.active){if(d.paused)animateTo(d.origin);return;}
      suppressClickUntil=performance.now()+350;
      snap(cancelled?d.origin:P.choose(y,velocity,d.origin,half,position('collapsed')),cancelled?0:velocity);
    }
    const hasTouch='ontouchstart' in window;
    sheet.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&hasTouch)return;if(e.button===0&&e.isPrimary)begin(e,e,e.pointerId,'pointer');},{signal:listeners.signal});
    window.addEventListener('pointermove',e=>{if(drag?.kind==='pointer'&&drag.id===e.pointerId)move(e,e);},{passive:false,signal:listeners.signal});
    window.addEventListener('pointerup',e=>{if(drag?.kind==='pointer'&&drag.id===e.pointerId)end();},{signal:listeners.signal});
    window.addEventListener('pointercancel',e=>{if(drag?.kind==='pointer')end(true);},{signal:listeners.signal});
    sheet.addEventListener('lostpointercapture',()=>{if(drag?.kind==='pointer')end(true);},{signal:listeners.signal});
    sheet.addEventListener('touchstart',e=>{if(e.touches.length!==1){end(true);return;}begin(e.touches[0],e,e.touches[0].identifier,'touch');},{passive:true,signal:listeners.signal});
    sheet.addEventListener('touchmove',e=>{if(drag?.kind!=='touch')return;if(e.touches.length!==1){end(true);return;}move(e.touches[0],e);},{passive:false,signal:listeners.signal});
    sheet.addEventListener('touchend',()=>{if(drag?.kind==='touch')end();},{signal:listeners.signal});
    sheet.addEventListener('touchcancel',()=>end(true),{signal:listeners.signal});
    sheet.addEventListener('click',e=>{
      if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}
      if(e.target.closest('.sheet-handle'))snap(targetState==='expanded'?'half':'expanded');
    },{capture:true,signal:listeners.signal});
    sheet.addEventListener('keydown',e=>{
      if(!e.target.closest('.sheet-handle'))return;
      if(['ArrowUp','ArrowDown','Enter',' '].includes(e.key)){
        e.preventDefault();snap(e.key==='ArrowUp'?'expanded':e.key==='ArrowDown'?'half':targetState==='expanded'?'half':'expanded');
      }
    },{signal:listeners.signal});
    const roots=['#sheetOverlay','#detailLayer','#knowledgeLayer','#documentViewer','#imageLightbox'].map(s=>document.querySelector(s)).filter(Boolean);
    const chrome=[...document.querySelectorAll('.detail-header,.knowledge-header,.document-viewer-header')];
    chrome.forEach(el=>el.dataset.oceanGlass='chrome');
    function coveredRoot(){return roots.filter(el=>!el.hidden&&!el.classList.contains('is-closing')).sort((a,b)=>(parseInt(getComputedStyle(a).zIndex)||0)-(parseInt(getComputedStyle(b).zIndex)||0)).pop();}
    function syncCovered(){
      const top=coveredRoot();[sheet,...chrome].forEach(el=>{const root=el===sheet?overlay:el.closest('.detail-layer,.knowledge-layer,.document-viewer');el.toggleAttribute('data-glass-covered',!root.hidden&&root!==top);});
      if(top!==overlay){stopLight();if(drag)end(true);}
    }
    const observer=new MutationObserver(syncCovered);roots.forEach(root=>observer.observe(root,{attributes:true,attributeFilter:['hidden','class']}));
    function resize(){if(overlay.hidden)return;const goal=targetState,scroll=content.scrollTop;++revision;stopMotion();cancelDrag();delete sheet.dataset.sheetDragging;layout();if(goal==='collapsed'){suspend();return;}state=targetState=goal;paint(position(goal));fitContent(goal);content.scrollTop=scroll;syncState();}
    window.addEventListener('resize',resize,{passive:true,signal:listeners.signal});
    window.visualViewport?.addEventListener('resize',resize,{passive:true,signal:listeners.signal});
    function suspend(){
      ++revision;stopMotion();cancelDrag();stopLight();stopVisual();delete sheet.dataset.sheetDragging;
      if(phase==='closing'){overlay.hidden=true;overlay.removeAttribute('data-glass-closing');sheet.inert=false;state=targetState='collapsed';phase='closed';const fn=finishClose;finishClose=null;fn?.();}
      else if(!overlay.hidden){state=targetState;paint(position(state));phase='open';[...layers.slice(0,3),head,content].filter(Boolean).forEach(el=>el.style.opacity='1');layers[3].style.opacity='.1';fitContent(state);}
      syncState();
    }
    document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();},{signal:listeners.signal});
    window.addEventListener('pagehide',suspend,{signal:listeners.signal});
    reduced.addEventListener('change',suspend,{signal:listeners.signal});
    return {open,close,isClosing:()=>phase==='closing',setQuality,getState:()=>({state,target:targetState,y:readY(),half,height,phase}),destroy(){suspend();observer.disconnect();listeners.abort();}};
  }};
})();