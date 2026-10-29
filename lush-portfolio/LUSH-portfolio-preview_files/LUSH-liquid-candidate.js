(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const ASSET = 'LUSH-portfolio-preview_files/assets/portfolio/';
  const ROOT_ASSET = 'LUSH-portfolio-preview_files/assets/root/';
  const data = window.LUSH_CURRENT_DATA;
  const imageVariants=(()=>{try{return JSON.parse($('#lush-image-variants')?.textContent||'{}');}catch(_){return {};}})();
  const webpSupported=(()=>{try{return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp')===0;}catch(_){return false;}})();
  const lowEndDevice=(Number(navigator.deviceMemory)>0&&Number(navigator.deviceMemory)<=2)||(Number(navigator.hardwareConcurrency)>0&&Number(navigator.hardwareConcurrency)<=2);
  const cardImageSizes='(max-width: 640px) 90vw, (max-width: 1100px) 34vw, 420px';
  const detailImageSizes='(max-width: 640px) 88vw, (max-width: 1200px) 76vw, 1024px';
  const setImageAttribute=(tag,name,value)=>{const pattern=new RegExp('\\s'+name+'\\s*=\\s*(?:"[^"]*"|\'[^\']*\')','i');return pattern.test(tag)?tag.replace(pattern,' '+name+'="'+value+'"'):tag.replace(/\s*\/?>$/,' '+name+'="'+value+'"$&');};
  function responsiveMarkup(markup,mode='lazy'){
    const sourceMarkup=String(markup),projectStart=mode==='work'?sourceMarkup.indexOf('<div class="mobile-project-image">'):-1,hasDetailCover=mode==='detail'&&/\bdetail-cover\b/.test(sourceMarkup);
    let projectPriorityUsed=false,detailCoverPriorityUsed=false,detailFirstPriorityUsed=false;
    return sourceMarkup.replace(/<img\b[^>]*>/gi,(tag,offset)=>{
      const source=tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);if(!source)return tag;
      const original=source[2],key=original.split(/[?#]/,1)[0],entry=imageVariants[key],imageClass=(tag.match(/\bclass\s*=\s*(["'])(.*?)\1/i)||[])[2]||'',isLogo=key===ROOT_ASSET+'lush-wordmark-mobile.png',isWorkGlassImage=mode==='work'&&/\b(?:glass-plate|glass-track-plate|glass-lens-body)\b/.test(imageClass),evidenceGridStart=mode==='detail'?sourceMarkup.lastIndexOf('<div class="premiere-case-evidence-grid">',offset):-1,evidenceGridEnd=evidenceGridStart>=0?sourceMarkup.lastIndexOf('</div>',offset):-1,isTwoColumnEvidenceImage=evidenceGridStart>=0&&evidenceGridEnd<evidenceGridStart,isWorkCard=mode==='work'&&projectStart>=0&&offset>projectStart;
      let image=tag;
      if(entry){
        const evidenceImageSizes='(max-width: 640px) 42vw, (max-width: 1100px) 44vw, 420px',sizes=isLogo?'83px':isWorkCard?cardImageSizes:isTwoColumnEvidenceImage?evidenceImageSizes:detailImageSizes,viewport=window.innerWidth||document.documentElement.clientWidth||entry.width,card=isWorkCard,slot=isLogo?83:card?(viewport<=640?viewport*.9:viewport<=1100?viewport*.34:420):isTwoColumnEvidenceImage?(viewport<=640?viewport*.42:viewport<=1100?viewport*.44:420):(viewport<=640?viewport*.88:viewport<=1200?viewport*.76:1024),dpr=window.devicePixelRatio||1,required=Math.ceil(Math.min(Number(entry.width)||slot,slot*dpr)),maxWidth=Math.max(...String(entry.srcset||'').split(',').map(candidate=>Number(candidate.trim().split(/\s+/).pop()?.replace(/w$/,'')||0)));
        if(!/\bwidth\s*=/.test(image))image=setImageAttribute(image,'width',Number(entry.width));
        if(!/\bheight\s*=/.test(image))image=setImageAttribute(image,'height',Number(entry.height));
        if(entry.srcset&&(entry.type==='image/jpeg'||webpSupported)&&maxWidth>=required){image=setImageAttribute(image,'srcset',entry.srcset);image=setImageAttribute(image,'sizes',sizes);image=setImageAttribute(image,'data-original-src',original);}
      }
      if(!/\bdecoding\s*=/.test(image))image=setImageAttribute(image,'decoding','async');
      if(isLogo||isWorkGlassImage){image=setImageAttribute(image,'loading','eager');image=setImageAttribute(image,'fetchpriority','low');}
      else if(mode==='work'&&projectStart>=0&&offset>projectStart&&!projectPriorityUsed){image=setImageAttribute(image,'loading','eager');image=setImageAttribute(image,'fetchpriority','high');image=setImageAttribute(image,'data-lush-priority','high');projectPriorityUsed=true;}
      else if(mode==='detail'&&/\bdetail-cover\b/.test(imageClass)){image=setImageAttribute(image,'loading','eager');image=setImageAttribute(image,'fetchpriority',detailCoverPriorityUsed?'auto':'high');if(!detailCoverPriorityUsed)image=setImageAttribute(image,'data-lush-priority','high');detailCoverPriorityUsed=true;}
      else if(mode==='detail'&&!hasDetailCover&&!detailFirstPriorityUsed&&!isLogo){image=setImageAttribute(image,'loading','eager');image=setImageAttribute(image,'fetchpriority','high');image=setImageAttribute(image,'data-lush-priority','high');detailFirstPriorityUsed=true;}
      else image=setImageAttribute(image,'loading','lazy');
      return image;
    });
  }

  const contactText=()=>{const rows=[data.contact.phone&&('电话：'+data.contact.phone),data.contact.wechat&&('微信：'+data.contact.wechat),data.contact.email&&('邮箱：'+data.contact.email),data.contact.github&&('GitHub：https://github.com/'+data.contact.github)].filter(Boolean);return rows.length?rows.join('\n'):'联系信息尚未配置。';};
  const contactValue=()=>[data.contact.phone,data.contact.wechat,data.contact.email,data.contact.github&&('https://github.com/'+data.contact.github)].filter(Boolean).join('\n');
  const escapeMarkup=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function contactMarkup(){
    const c=data.contact,rows=[];
    const row=(label,value,actions)=>'<div class="contact-method"><div class="contact-method-main"><span class="contact-method-label">'+label+'</span><span class="contact-method-value">'+escapeMarkup(value)+'</span></div><div class="contact-method-actions">'+actions+'</div></div>';
    if(c.phone){const tel=String(c.phone).replace(/[^\d+]/g,'');rows.push(row('电话',c.phone,'<a class="contact-control" href="tel:'+escapeMarkup(tel)+'" aria-label="拨打电话">拨打</a><button class="contact-control" type="button" data-copy="phone"><span>复制</span></button>'));}
    if(c.wechat)rows.push(row('微信号',c.wechat,'<button class="contact-control" type="button" data-copy="wechat"><span>复制</span></button>'));
    if(c.email)rows.push(row('邮箱',c.email,'<a class="contact-control" href="mailto:'+escapeMarkup(c.email)+'" aria-label="发送邮件">邮件</a><button class="contact-control" type="button" data-copy="email"><span>复制</span></button>'));
    const github=String(c.github||'');
    if(/^[A-Za-z0-9-]+$/.test(github)){const url='https://github.com/'+github;rows.push(row('GitHub',github,'<a class="contact-control" href="'+url+'" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 主页">主页</a><button class="contact-control" type="button" data-copy="github"><span>复制链接</span></button>'));}
    return '<p class="contact-hint">选择一种方便的方式联系我</p><div class="contact-method-list">'+rows.join('')+'</div>';
  }
  const resumeText=(includeTools=true)=>[
    [data.resume.name+' / '+data.resume.english,data.resume.role,data.resume.summary].filter(Boolean).join('\n'),
    ['联系方式',['电话：'+data.contact.phone,'邮箱：'+data.contact.email,'GitHub：https://github.com/'+data.contact.github].filter(Boolean).join(' / ')].join('\n'),
    ['教育背景',data.resume.education].filter(Boolean).join('\n'),
    ['代表项目',...data.resume.selectedWork.map(item=>[item.title+'｜'+item.status,item.body].join('\n'))].join('\n'),
    ['工作与校园经历',...data.resume.experience.map(item=>[item.org+'｜'+item.role+'｜'+item.period,item.body].join('\n'))].join('\n'),
    ['设计实践',data.resume.strengths.join(' / ')].join('\n'),
    includeTools?['工具',data.resume.tools.join(' / ')].join('\n'):'',
    data.resume.methods?.length?['协作方式',data.resume.methods.join(' / ')].join('\n'):''
  ].filter(Boolean).join('\n\n');
  const resumeToolGroups=data.resume.toolGroups||[];
  function resumePreviewMarkup(){
    const r=data.resume,esc=value=>escapeMarkup(value||'');
    const points=items=>'<ul class="resume-preview-points">'+(items||[]).map(point=>'<li>'+esc(point)+'</li>').join('')+'</ul>';
    const contacts=[['电话',data.contact.phone],['邮箱',data.contact.email],['GitHub','https://github.com/'+data.contact.github]].filter(item=>item[1]);
    return '<div class="resume-preview"><header class="resume-preview-profile"><div class="resume-preview-profile-copy"><p class="resume-preview-name">'+esc(r.name)+' / '+esc(r.english)+'</p><p class="resume-preview-role">'+esc(r.role)+'</p><p class="resume-preview-summary">'+esc(r.summary)+'</p></div><img class="resume-preview-portrait" src="/lush-portfolio/LUSH-portfolio-preview_files/assets/portfolio/resume/albert-portrait-320.jpg" alt="张誉聪个人形象照" width="68" height="85" loading="lazy" decoding="async"></header>'+
      '<section class="resume-preview-section"><h3>联系方式</h3><div class="resume-preview-contacts">'+contacts.map(item=>'<p><span>'+esc(item[0])+'</span><span>'+esc(item[1])+'</span></p>').join('')+'</div></section>'+
      '<section class="resume-preview-section"><h3>教育背景</h3><p class="resume-preview-body">'+esc(r.education)+'</p></section>'+
      '<section class="resume-preview-section"><h3>项目经历</h3>'+r.selectedWork.map(item=>'<article class="resume-preview-entry"><div class="resume-preview-entry-head"><h4>'+esc(item.title)+'</h4><span>'+esc(item.status)+'</span></div><p class="resume-preview-meta">'+[item.role,item.period].filter(Boolean).map(esc).join('｜')+'</p>'+points(item.points||[item.body])+(item.result?'<p class="resume-preview-result"><strong>成果</strong> '+esc(item.result)+'</p>':'')+'<button class="resume-preview-case" type="button" data-resume-project="'+esc(item.id)+'" aria-label="查看案例：'+esc(item.title)+'">查看项目案例 <span aria-hidden="true">›</span></button></article>').join('')+'</section>'+
      '<section class="resume-preview-section"><h3>工作与校园经历</h3>'+r.experience.map(item=>'<article class="resume-preview-entry"><h4>'+esc(item.org)+'</h4><p class="resume-preview-meta">'+[item.role,item.period].filter(Boolean).map(esc).join('｜')+'</p>'+points(item.points||[item.body])+'</article>').join('')+'</section>'+
      '<section class="resume-preview-section"><h3>设计实践</h3>'+points(r.strengths)+'</section>'+
      (r.methods&&r.methods.length?'<section class="resume-preview-section"><h3>协作方式</h3>'+points(r.methods)+'</section>':'')+'</div>';
  }
  function renderResumeToolsMarkup(){
    const available=new Set(data.resume.tools||[]);
    return '<section class="resume-tools-visual" aria-label="工具与技术能力"><div class="resume-tools-heading"><span>TOOLS</span><span>工具能力</span></div>'+resumeToolGroups.map(group=>{const tools=group.items.filter(tool=>available.has(tool.name));if(!tools.length)return '';return '<div class="resume-tool-group resume-tool-group--'+group.id+'"><div class="resume-tool-group-head"><span>'+group.label+'</span><span>'+String(tools.length).padStart(2,'0')+'</span></div><div class="resume-tool-grid">'+tools.map(tool=>'<div class="resume-tool-card">'+(tool.logo?'<span class="resume-tool-logo-frame"><img class="resume-tool-logo'+(tool.logoSquare?' resume-tool-logo--square':'')+'" src="'+escapeMarkup(tool.logo)+'" alt="" aria-hidden="true"></span>':'')+'<span class="resume-tool-name">'+escapeMarkup(tool.name)+'</span></div>').join('')+'</div></div>';}).join('')+'</section>';
  }
  const state = {section:'work', category:'项目经历', labIndex:0, menu:false, sheet:null, detail:null, knowledgeId:null, reduced:false, positions:{work:0,lab:0,archive:0,about:0}};
  const oceanSheet=window.LushOceanGlass?.mount({sheet:$('#menuSheet'),overlay:$('#sheetOverlay'),onDismiss:()=>state.sheet==='info'?closeInfo():closeMenu()});
  const welcomeLayer = $('#welcomeLayer'), portfolioLayer = $('#portfolioLayer');
  const dockOrbButton = $('#menuButton');
  let voiceOrbPointerId=null;
  const resetVoiceOrb=()=>{voiceOrbPointerId=null;dockOrbButton?.classList.remove('voice-orb-pressed');dockOrbButton?.style.setProperty('--voice-x','0%');dockOrbButton?.style.setProperty('--voice-y','0%');};
  dockOrbButton?.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;voiceOrbPointerId=e.pointerId;dockOrbButton.classList.add('voice-orb-pressed');try{dockOrbButton.setPointerCapture(e.pointerId);}catch(_){}});
  dockOrbButton?.addEventListener('pointermove',e=>{if(voiceOrbPointerId!==e.pointerId)return;const r=dockOrbButton.getBoundingClientRect();if(!r.width||!r.height)return;const x=Math.max(-9,Math.min(9,(e.clientX-(r.left+r.width/2))/(r.width/2)*9));const y=Math.max(-9,Math.min(9,(e.clientY-(r.top+r.height/2))/(r.height/2)*9));dockOrbButton.style.setProperty('--voice-x',x.toFixed(2)+'%');dockOrbButton.style.setProperty('--voice-y',y.toFixed(2)+'%');});
  dockOrbButton?.addEventListener('pointerup',resetVoiceOrb); dockOrbButton?.addEventListener('pointercancel',resetVoiceOrb); dockOrbButton?.addEventListener('lostpointercapture',()=>{if(voiceOrbPointerId!==null)resetVoiceOrb();});
  // Shared source files are also required directly by the WeChat adapter.
  const welcomeConfig=LushLiquid.welcome;
  const desktopShowcase=window.matchMedia('(min-width:768px)');
  const motion=new LushLiquid.Motion(false);
  motion.geometry=(w,h)=>welcomeConfig.geometry(w,h,motion.p,motion.side);
  const renderMotion=Object.create(motion);
  renderMotion.geometry=(w,h)=>{const g=motion.geometry(w,h);return {...g,p:Math.max(welcomeConfig.renderProgressFloor,g.p)};};
  Object.defineProperty(renderMotion,'revealAge',{get:()=>motion.revealAge*welcomeConfig.stickerTimeScale});
  const welcomeDome=$('#welcomeDome'),enterButton=$('#enterButton'),welcomeCopy=$('#welcomeCopy'),welcomeStickers=$('#welcomeStickers');
  const forceCssFallback=new URLSearchParams(window.location.search).get('qaRenderer')==='css';
  const qaNativeGlass=new URLSearchParams(window.location.search).get('qaNativeGlass')!=='0';
  const fallbackStickerNodes=[];
  $('.welcome-portfolio-label').textContent=welcomeConfig.label;
  const updateWelcomeHint=()=>{$('.welcome-idle-hint').textContent=desktopShowcase.matches?'拖动或点击玻璃球，展开作品集入口':welcomeConfig.hint;};
  updateWelcomeHint();if(desktopShowcase.addEventListener)desktopShowcase.addEventListener('change',updateWelcomeHint);else desktopShowcase.addListener?.(updateWelcomeHint);
  $('#welcomeCopy h1').textContent=welcomeConfig.title;enterButton.textContent=welcomeConfig.enterLabel;
  const canvas=document.createElement('canvas');canvas.className='liquid-canvas';canvas.setAttribute('aria-hidden','true');welcomeLayer.prepend(canvas);
  let renderer=null,raf=0,last=0,failed=false,viewport={width:0,height:0};
  window.__lushLiquid={motion,get renderer(){return renderer;},samples:[]};
  function initFallbackStickers(){
    if(fallbackStickerNodes.length||!welcomeStickers)return;
    const speechLabels=['去创造','灵感来了','设计日常','把想法做出来'];
    LushRenderer.stickerKinds.forEach((key,index)=>{let node;if(key.startsWith('speech')){node=document.createElement('div');node.classList.add('welcome-fallback-speech');node.textContent=speechLabels[Number(key.slice(6))]||'';}else{node=document.createElement('img');node.src='LUSH-portfolio-preview_files/assets/native/scene/'+key+'.png';node.alt='';node.draggable=false;}node.classList.add('welcome-fallback-sticker');node.dataset.stickerIndex=String(index);welcomeStickers.appendChild(node);fallbackStickerNodes.push(node);});
  }
  function updateFallbackStickers(geometry){
    if(!failed||!fallbackStickerNodes.length)return;
    const age=renderMotion.revealAge;
    LushRenderer.stickerKinds.forEach((key,index)=>{const node=fallbackStickerNodes[index];if(!node)return;const pose=LushRenderer.stickerPose(index,key,age,geometry,viewport.width,viewport.height,renderMotion);if(!pose){node.style.opacity='0';node.classList.remove('is-emerging');return;}node.classList.toggle('is-emerging',pose.pop>.36);Object.assign(node.style,{left:pose.x+'px',top:pose.y+'px',width:pose.w+'px',height:pose.h+'px',transform:'translate(-50%,-50%) rotate('+pose.angle+'rad)',opacity:String(pose.opacity)});});
  }
  function failLiquid(){failed=true;canvas.hidden=true;welcomeLayer.classList.add('liquid-fallback');initFallbackStickers();}
  function resizeLiquid(){const b=welcomeLayer.getBoundingClientRect();if(!b.width)return;viewport={width:b.width,height:b.height};if(forceCssFallback){window.__lushLiquid.failure='FORCED_CSS_FALLBACK';failLiquid();return;}try{if(!renderer)renderer=new LushRenderer.Renderer(canvas,{createTextCanvas:()=>document.createElement('canvas'),showLogo:false,nativeGlassBoost:qaNativeGlass});const renderDpr=Math.min(window.devicePixelRatio||1,lowEndDevice?1:window.innerWidth<768?1.5:2);renderer.resize(b.width,b.height,renderDpr);}catch(e){window.__lushLiquid.failure=e.message;failLiquid();}}
  function liquidFrame(now){raf=0;if(welcomeLayer.hidden||document.hidden)return;motion.step(last?Math.min((now-last)/1000,.05):1/60);last=now;
    const g=motion.geometry(viewport.width,viewport.height);
    if(renderer&&!failed)try{renderer.draw(renderMotion);}catch(e){failLiquid();}
    welcomeLayer.dataset.state=motion.state;welcomeLayer.style.setProperty('--liquid-p',g.p);
    Object.assign(welcomeDome.style,{left:g.cx+'px',top:g.cy+'px',width:g.r*2+'px',height:g.r*2+'px'});
    updateFallbackStickers(g);
    const ready=motion.state==='revealed'||(motion.target===1&&g.p>.985),copyOpacity=Math.max(0,Math.min(1,(g.p-welcomeConfig.copyRevealStart)/(1-welcomeConfig.copyRevealStart)));welcomeCopy.style.opacity=String(copyOpacity);welcomeCopy.classList.toggle('liquid-visible',copyOpacity>0);welcomeCopy.classList.toggle('liquid-ready',ready);welcomeCopy.inert=!ready;enterButton.disabled=!ready;welcomeDome.setAttribute('aria-label',ready?'收起作品集入口':desktopShowcase.matches?'拖动或点击玻璃球，展开作品集入口':'上滑展开作品集入口');
    const samples=window.__lushLiquid.samples;samples.push({t:now,p:motion.p,state:motion.state});if(samples.length>900)samples.shift();
    raf=requestAnimationFrame(liquidFrame);
  }
  function startLiquid(){last=0;if(!raf&&!document.hidden)raf=requestAnimationFrame(liquidFrame);}
  function point(e){const b=welcomeLayer.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top,h:b.height};}
  let welcomePointerReleased=false;
  welcomeDome.addEventListener('pointerdown',e=>{if(e.button!==0||motion.drag)return;const p=point(e),g=motion.geometry(viewport.width,viewport.height);if(Math.hypot(p.x-g.cx,p.y-g.cy)>g.r)return;motion.down(p.x,p.y,performance.now(),e.pointerId,p.h,viewport.width);welcomeDome.setPointerCapture(e.pointerId);});
  welcomeDome.addEventListener('pointermove',e=>{const p=point(e);motion.move(p.x,p.y,performance.now(),e.pointerId);});
  welcomeDome.addEventListener('pointerup',()=>{welcomePointerReleased=!!motion.drag;motion.release(performance.now());});
  welcomeDome.addEventListener('pointercancel',()=>{welcomePointerReleased=false;motion.release(performance.now(),true);});
  welcomeDome.addEventListener('lostpointercapture',()=>{if(motion.drag)motion.release(performance.now(),true);});
  welcomeDome.addEventListener('click',e=>{const pointerHandled=welcomePointerReleased;welcomePointerReleased=false;if(e.detail===0||pointerHandled)return;if(['idle','revealed','reduced'].includes(motion.state))motion.setTarget(motion.target?0:1);});
  welcomeDome.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();motion.setTarget(motion.target?0:1);}});
  enterButton.addEventListener('click',e=>{e.stopPropagation();if(enterButton.disabled||!(motion.state==='revealed'||(motion.target===1&&motion.p>.985)))return;motion.enter();welcomeLayer.classList.add('liquid-exit');setTimeout(()=>{portfolioLayer.hidden=false;welcomeLayer.hidden=true;$('#previewFrame').classList.remove('liquid-welcome-active');welcomeLayer.classList.remove('liquid-exit');cancelAnimationFrame(raf);raf=0;render();$('#worksButton').focus();},180);});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failLiquid();});
  canvas.addEventListener('webglcontextrestored',()=>{renderer=null;failed=false;canvas.hidden=false;welcomeLayer.classList.remove('liquid-fallback');motion.reset();resizeLiquid();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){motion.release(performance.now(),true);cancelAnimationFrame(raf);raf=0;}else startLiquid();});
  new ResizeObserver(()=>{if(!failed)resizeLiquid();else{const b=welcomeLayer.getBoundingClientRect();if(b.width&&b.height)viewport={width:b.width,height:b.height};}startLiquid();}).observe(welcomeLayer);
  resizeLiquid();startLiquid();

  function header(){ const works=$('#worksButton'),about=$('#aboutButton'); works.classList.toggle('current',state.section==='work');about.classList.toggle('current',state.section==='about');works.setAttribute('aria-current',state.section==='work'?'page':'false');about.setAttribute('aria-current',state.section==='about'?'page':'false'); }
  const premiereItem = data.items.find(item=>item.id==='dear-you-premiere');
  if(premiereItem){premiereItem.title='《给阿嫲的情书》昆士兰首映礼视觉设计';premiereItem.subtitle='昆士兰首映礼主视觉';}
  if(data.modelFramework){data.modelFramework.eyebrow='AI / COLLABORATION';data.modelFramework.model='AI 协作工具';data.modelFramework.partners='Figma / 微信开发者工具 / HTML / CSS / JavaScript';data.modelFramework.boundary='AI 参与结构梳理、视觉探索和重复实现；最终文字、素材、路径、版权和视觉取舍由我确认，不包含模型 API、密钥或自动调用服务。';}
  const aiOrb=data.archive?.find(entry=>entry[0]==='gpt6-orb');
  if(aiOrb)aiOrb[1]='AI 协作球体';
  function contentWordmark(){return '<div class="content-wordmark"><img src="'+ROOT_ASSET+'lush-wordmark-mobile.png" alt="LUSH"></div>';}
  function sectionHead(eyebrow,title,intro){return contentWordmark()+'<div class="section-head">'+(eyebrow?'<p class="eyebrow">'+eyebrow+'</p>':'')+'<h1 class="page-title">'+title+'</h1>'+(intro?'<p class="intro-line">'+intro+'</p>':'')+'</div>';}
  function rememberScroll(section=state.section){const scroll=$('#pageScroll');if(scroll)state.positions[section]=scroll.scrollTop;}
  function bindAboutOrb(){
    const orb=$('.about-orb');
    if(!orb)return;
    let pointerId=null,startX=0,startY=0;
    const setDrag=(x,y)=>{orb.style.setProperty('--orb-drag-x',x.toFixed(1)+'px');orb.style.setProperty('--orb-drag-y',y.toFixed(1)+'px');orb.style.setProperty('--orb-shift-x',(x*.18).toFixed(1)+'px');orb.style.setProperty('--orb-shift-y',(y*.18).toFixed(1)+'px');orb.style.setProperty('--orb-tilt',(x*.18).toFixed(1)+'deg');};
    const release=()=>{if(pointerId===null)return;pointerId=null;orb.classList.remove('is-dragging');setDrag(0,0);};
    orb.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;pointerId=e.pointerId;startX=e.clientX;startY=e.clientY;orb.classList.add('is-dragging');try{orb.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
    orb.addEventListener('pointermove',e=>{if(pointerId!==e.pointerId)return;const x=Math.max(-16,Math.min(16,e.clientX-startX)),y=Math.max(-16,Math.min(16,e.clientY-startY));setDrag(x,y);});
    orb.addEventListener('pointerup',release);orb.addEventListener('pointercancel',release);orb.addEventListener('lostpointercapture',release);
    orb.addEventListener('keydown',e=>{const amount=6;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const x=e.key==='ArrowLeft'?-amount:e.key==='ArrowRight'?amount:0,y=e.key==='ArrowUp'?-amount:e.key==='ArrowDown'?amount:0;orb.classList.add('is-dragging');setDrag(x,y);});
    orb.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))setDrag(0,0);});
  }
  function render(previousSection){ const switching=!!state.switching; if(!switching)rememberScroll(previousSection||state.section); header(); const content=$('#pageContent'),scroll=$('#pageScroll'); content.className='page-content section-'+state.section; const previousFilter=state.section==='work'?content.querySelector('.mobile-project-filters'):null;const previousFilterIndex=previousFilter?Number(previousFilter.dataset.active):-1;if(state.section==='work'){content.innerHTML=responsiveMarkup(workView(),'work');if(previousFilterIndex>=0)animateGlassLens(previousFilterIndex);} if(state.section==='lab')content.innerHTML=responsiveMarkup(labView()); if(state.section==='archive')content.innerHTML=responsiveMarkup(archiveView()); if(state.section==='about')content.innerHTML=responsiveMarkup(aboutView()); if(state.section==='about')bindAboutOrb(); const target=state.positions[state.section]||0; scroll.scrollTop=target; if(switching)requestAnimationFrame(()=>{if(!state.menu&&content.isConnected){scroll.scrollTop=target;setTimeout(()=>{if(content.isConnected)scroll.scrollTop=target;},40);}}); }
  function switchSection(next){const previous=state.section;rememberScroll(previous);state.switching=true;state.section=next;render(previous);state.switching=false;}
  function vibeMethodMarkup(){return '<section class="vibe-method" aria-label="VIBE CODING 方法链路"><div class="vibe-method-head"><p class="eyebrow">METHOD / 3D PROTOTYPE</p><h2 class="vibe-method-title">从参考图到可交互 3D</h2><p class="vibe-method-lead">先冻结输入，再审资产、锁坐标，最后用真实资料收口。</p></div><div class="vibe-method-list">'+(data.vibeMethod||[]).map(step=>'<article class="vibe-method-step"><span class="vibe-method-number">'+step.step+'</span><h3 class="vibe-method-step-title">'+step.title+'</h3><p class="vibe-method-step-body">'+step.body+'</p></article>').join('')+'</div></section>'; }
   function valueIntroMarkup(){return '<section class="portfolio-value" aria-label="个人定位与入口"><div class="portfolio-value-copy"><span class="portfolio-value-name">张誉聪</span><strong class="portfolio-value-role">'+data.resume.role+'</strong></div><div class="portfolio-value-actions"><button class="value-action value-action-primary" data-id="lush" aria-label="查看精选案例">精选案例 <span>&gt;</span></button><button class="value-action" data-info="简历预览" aria-label="查看简历预览">简历预览 <span>&gt;</span></button></div></section>';}
  function premiereCoverMarkup(item){const snapshot=item.snapshot||{};const value=snapshot.value?'<p class="project-value-line"><span>设计价值</span>'+snapshot.value+'</p>':'';return '<button class="project project-premiere" data-id="'+item.id+'" aria-label="'+item.title+'，'+item.subtitle+'"><div class="project-picture project-picture-landscape"><img src="'+(item.cardCover||item.cover)+'" alt=""><span class="project-type">项目</span></div><div class="project-title-line"><span class="project-name">'+item.title+'</span><span class="project-category">'+projectCategoryLabel(item)+'</span></div><p class="project-subtitle">'+item.subtitle+'</p>'+value+'<div class="project-foot"><span>'+item.cardMeta+'</span><span class="project-explore">查看案例  &gt;</span></div></button>';}
   function focusProjectList(){const scroll=$('#pageScroll'),target=$('#project-list-start');if(!scroll||!target)return;const top=scroll.scrollTop+target.getBoundingClientRect().top-scroll.getBoundingClientRect().top;scroll.scrollTo({top,behavior:'smooth'});}function animateGlassLens(fromIndex){const lens=$('.mobile-project-filters .glass-lens');if(!lens)return;lens.style.transition='none';lens.style.transform='translate3d(calc('+((fromIndex)*100)+'% + '+((fromIndex)*2)+'px),0,0)';requestAnimationFrame(()=>{lens.style.transition='';lens.style.transform='';});}
  function workView(){ const cats=['项目经历','设计作品','VIBE CODING']; const shown=data.items.filter(item=>state.category==='项目经历'||item.category===state.category||item.filterCategory===state.category); return sectionHead('','作品','')+valueIntroMarkup()+'<div class="filters">'+cats.map(c=>'<button class="filter '+(c===state.category?'selected':'')+'" data-category="'+c+'" aria-pressed="'+(c===state.category)+'">'+c+'</button>').join('')+'</div><div class="work-list">'+shown.map(item=>{if(item.id==='dear-you-premiere')return premiereCoverMarkup(item);const snapshot=item.snapshot||{};const featured=item.id==='lush'?'<span class="project-featured">重点案例</span>':'';const value=snapshot.value?'<p class="project-value-line"><span>设计价值</span>'+snapshot.value+'</p>':'';return '<button class="project '+(item.id==='lush'?'project-featured-card':'')+'" data-id="'+item.id+'" aria-label="'+item.title+'，'+item.subtitle+'"><div class="project-picture"><img class="'+(item.coverMode==='aspectFit'?'project-cover-contain':'')+'" src="'+(item.cardCover||item.cover)+'" alt=""><span class="project-type">'+item.status+'</span>'+featured+'</div><div class="project-title-line"><span class="project-name">'+item.title+'</span><span class="project-category">'+projectCategoryLabel(item)+'</span></div><p class="project-subtitle">'+item.subtitle+'</p>'+value+'<div class="project-foot"><span>'+item.cardMeta+'</span><span class="project-explore">查看案例  &gt;</span></div></button>';}).join('')+'</div>'+'<div class="page-end"><span></span>保持好奇，持续创作。<span></span></div>'; }
   function modelFrameworkMarkup(){const m=data.modelFramework||{};return '<section class="model-framework" aria-label="AI 协作框架"><div class="model-framework-head"><span class="eyebrow">'+m.eyebrow+'</span><h2>'+m.title+'</h2><p>'+m.intro+'</p></div><div class="model-framework-meta"><div><span>AI 工具</span><strong>'+m.model+'</strong></div><div><span>负责工作</span><strong>'+m.role+'</strong></div><div><span>实现环境</span><strong>'+m.partners+'</strong></div></div><div class="model-framework-loop">'+(m.loop||[]).map(step=>'<article class="model-framework-step"><span>'+step.step+'</span><h3>'+step.title+'</h3><p>'+step.body+'</p></article>').join('')+'</div><p class="model-framework-note"><strong>边界</strong>'+m.boundary+'</p><p class="model-framework-note"><strong>复用</strong>'+m.reuse+'</p></section>';}
  function labView(){const flow=data.designFlow;return sectionHead('DESIGN PROCESS','设计工作流','')+'<div class="design-flow" aria-label="设计工作流树"><div class="design-flow-root"><span class="design-flow-index">'+flow.root.index+'</span><div><span class="flow-label">起点</span><h2>'+flow.root.title+'</h2><p>'+flow.root.body+'</p><p class="flow-thinking"><span class="flow-label">思考</span>'+flow.root.thinking+'</p></div></div>'+modelFrameworkMarkup()+'<div class="design-flow-branches">'+flow.branches.map(branch=>'<section class="design-flow-branch" aria-labelledby="flow-branch-'+branch.id+'"><div class="design-flow-branch-head"><span class="design-flow-branch-kicker">BRANCH / '+branch.id.toUpperCase()+'</span><h3 id="flow-branch-'+branch.id+'">'+branch.label+'</h3><p>'+branch.note+'</p></div><div class="design-flow-nodes">'+branch.nodes.map(node=>'<article class="design-flow-node"><div class="design-flow-node-head"><span class="design-flow-index">'+node.index+'</span><h4>'+node.title+'</h4></div><p class="flow-process"><span class="flow-label">过程</span>'+node.process+'</p><p class="flow-thinking"><span class="flow-label">思考</span>'+node.thinking+'</p></article>').join('')+'</div></section>').join('')+'</div></div><button class="text-link" data-go="work"><span>在作品中查看结果</span><span>></span></button>';}
  function archiveView(){return sectionHead('A COLLECTION OF IDEAS','素材档案','记录过程，也保留下一次的起点。')+'<div class="archive-grid">'+data.archive.map(x=>'<button class="archive-item" data-archive="'+x[0]+'"><div class="archive-image"><img src="'+x[3]+'" alt="'+x[1]+'"></div><span class="archive-title">'+x[1]+'</span><span class="archive-kind">'+x[2]+'</span></button>').join('')+'</div><span class="archive-note">每一份素材，都属于一段具体的创作。</span>';}
  function aboutAstralMarkup(){const items=['star','planet','plane','code'];return '<div class="about-astral" aria-hidden="true">'+items.map((x,i)=>'<img class="about-astral-item about-astral-'+i+'" src="'+ROOT_ASSET+'scene/'+x+'.png" alt="">').join('')+'</div>';}
  function aboutView(){return contentWordmark()+'<div class="about-sky">'+aboutAstralMarkup()+'</div><div class="about-heading"><p class="about-eyebrow">个人介绍</p><div class="about-identity"><div class="about-name">'+escapeMarkup(data.resume.name)+'</div><p class="about-name-en">'+escapeMarkup(data.resume.english)+'</p><p class="about-role">'+data.resume.role+'</p></div><div class="about-facts" aria-label="设计师信息"><div class="about-fact"><span>教育背景</span><p>'+data.resume.education+'</p></div><div class="about-fact"><span>擅长类目</span><p>AI全栈设计、交互网站制作与服装设计</p></div><div class="about-fact"><span>工作方式</span><p>AI 协同探索 → 设计判断 → 视觉交互落地 → 多端体验打磨。</p></div></div></div><section class="about-actions" aria-label="下一步入口"><p class="about-actions-label">下一步 / 查看作品</p><div class="about-links"><button class="link-row link-row-primary" data-info="简历预览"><span class="line-icon resume-icon"></span><span>简历预览</span><span class="chevron">›</span></button><button class="link-row link-row-secondary" data-info="联系入口"><span class="line-icon mail-icon"></span><span>联系入口</span><span class="chevron">›</span></button><button class="link-row link-row-tertiary knowledge-row" data-knowledge="true"><span class="line-icon knowledge-icon"></span><span>方法与复盘</span><span class="chevron">›</span></button></div></section>';}
  function ensureMenuShell(){if($('#menuRows'))return;$('#menuSheet').innerHTML='<div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2>探索</h2><button class="sheet-close" id="sheetClose" type="button" aria-label="关闭目录">×</button></div><div id="menuRows"></div>';}
  function renderMenu(){ensureMenuShell();$('#menuSheet').dataset.sheetView='menu';$('#menuSheet').setAttribute('aria-label','页面目录');$('#menuRows').innerHTML=data.sections.map(x=>'<button class="menu-row" data-section="'+x[0]+'" aria-current="'+(state.section===x[0]?'page':'false')+'"><span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></span><em>></em></button>').join('');}
  let lastFocus=null, detailFocus=null, lightboxFocus=null, documentViewerFocus=null, documentViewerDoc=null, knowledgeFocus=null, knowledgeTrail=[], sheetDrag=null;
  const focusableSelector='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])';
  function focusables(root){return [...root.querySelectorAll(focusableSelector)].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;});}
  function focusFirst(root){const first=focusables(root)[0];if(first)first.focus({preventScroll:true});}
  function trapFocus(e,root){if(e.key!=='Tab')return;const list=focusables(root);if(!list.length)return;e.preventDefault();const current=document.activeElement,index=list.indexOf(current);const next=e.shiftKey?(index<=0?list.length-1:index-1):(index<0||index===list.length-1?0:index+1);list[next].focus();}
  const nodeById=id=>data.knowledge.nodes.find(node=>node.id===id);
  const knowledgeLinkMarkup=ids=>(ids||[]).map(id=>{const node=nodeById(id);return node?'<button class="knowledge-link" type="button" data-knowledge-id="'+node.id+'"><span>[[ '+node.title+' ]]</span><em>›</em></button>':'';}).join('');
  function knowledgeRootMarkup(){const k=data.knowledge;const uri=(k.obsidianUri||'').replace(/&/g,'&amp;');return '<section class="knowledge-intro"><span class="eyebrow">OBSIDIAN / REUSABLE INDEX</span><h1>'+k.title+'</h1><p>'+k.intro+'</p><div class="knowledge-principles"><article><span>参考库</span><p>'+k.reference+'</p></article><article><span>蒸馏方法</span><p>'+k.distillation+'</p></article></div><div class="knowledge-obsidian"><span>OBSIDIAN LINK</span><p>'+k.linkNote+'</p><a class="knowledge-vault-link" href="'+uri+'" aria-label="在 Obsidian 中打开知识库索引">在 Obsidian 中打开索引 <span>open</span></a><button class="knowledge-copy-link" type="button" data-copy-knowledge-link>复制 Obsidian 索引链接 <span>›</span></button></div><div class="knowledge-meta"><span>更新 '+k.updated+'</span><span>'+k.structure+'</span><span>'+k.status+'</span></div></section><section class="knowledge-node-list">'+k.nodes.map(node=>'<article class="knowledge-node-card"><div class="knowledge-node-top"><span>'+node.kind+'</span><b>'+node.id.toUpperCase()+'</b></div><h2>'+node.title+'</h2><p>'+node.summary+'</p><code>'+node.source+'</code><button class="knowledge-open" type="button" data-knowledge-id="'+node.id+'">打开节点 <span>›</span></button></article>').join('')+'</section>';}
  function knowledgeNodeMarkup(node){return '<section class="knowledge-node-detail"><span class="eyebrow">'+node.kind+' / '+node.id.toUpperCase()+'</span><h1>'+node.title+'</h1><p>'+node.summary+'</p><div class="knowledge-source"><span>Obsidian 双链</span><code>'+node.source+'</code></div><div class="knowledge-next"><span>继续沿链路</span>'+knowledgeLinkMarkup(node.links)+'</div></section>';}
  function renderKnowledge(id){const content=$('#knowledgeContent');if(!content)return;const node=id?nodeById(id):null;content.innerHTML=node?knowledgeNodeMarkup(node):knowledgeRootMarkup();content.scrollTop=0;setTimeout(()=>focusFirst($('#knowledgeLayer')),0);}
  function openKnowledge(){knowledgeFocus=document.activeElement;knowledgeTrail=[];state.knowledgeId=null;const layer=$('#knowledgeLayer');layer.hidden=false;layer.classList.remove('is-closing');layer.classList.add('is-visible');renderKnowledge();}
  function navigateKnowledge(id){const node=nodeById(id);if(!node)return;if(state.knowledgeId)knowledgeTrail.push(state.knowledgeId);state.knowledgeId=id;renderKnowledge(id);}
  function backKnowledge(){if(state.knowledgeId){if(knowledgeTrail.length){state.knowledgeId=knowledgeTrail.pop();renderKnowledge(state.knowledgeId);}else{state.knowledgeId=null;renderKnowledge();}}else closeKnowledge();}
  function closeKnowledge(){const layer=$('#knowledgeLayer');if(layer.hidden)return;const restore=knowledgeFocus;knowledgeFocus=null;knowledgeTrail=[];state.knowledgeId=null;layer.classList.remove('is-visible');layer.classList.add('is-closing');setTimeout(()=>{if(!layer.classList.contains('is-visible')){layer.hidden=true;layer.classList.remove('is-closing');if(restore&&typeof restore.focus==='function')restore.focus();}},180);}
  function openMenu(){$('#menuSheet').classList.remove('contact-sheet-open');$('#menuButton').setAttribute('aria-expanded','true');const orb=$('#menuButton');orb?.classList.add('voice-orb-activating');setTimeout(()=>orb?.classList.remove('voice-orb-activating'),240);lastFocus=document.activeElement;state.menu=true;state.sheet='menu';renderMenu();if(oceanSheet)oceanSheet.open();else $('#sheetOverlay').hidden=false;setTimeout(()=>focusFirst($('#menuSheet')),0);}
  function closeMenu(afterClose){
    if(oceanSheet?.isClosing()||$('#sheetOverlay').hidden)return;
    $('#menuButton').setAttribute('aria-expanded','false');state.menu=false;state.sheet=null;
    const restore=lastFocus;lastFocus=null;
    const finish=()=>{
      $('#menuSheet').classList.remove('contact-sheet-open');
      const covered=['#detailLayer','#knowledgeLayer','#documentViewer','#imageLightbox'].some(id=>!$(id).hidden);
      if(!covered&&restore?.isConnected&&typeof restore.focus==='function')restore.focus();
      if(typeof afterClose==='function')afterClose();
    };
    if(oceanSheet)oceanSheet.close(finish);else{$('#sheetOverlay').hidden=true;finish();}
  }
  function documentMarkup(item){if(!item.documents?.length)return '';const intro=item.documents.length+' 页项目资料合并为一个设计作品，点击缩略图查看完整页面与对应设计说明。';return '<section class="detail-section project-documents"><h2>项目资料</h2><p>'+intro+'</p><div class="document-grid">'+item.documents.map((doc,i)=>'<button class="document-card" type="button" data-document-id="'+doc.id+'" aria-label="查看'+doc.title+' 页面与设计说明"><span class="document-thumb"><img src="'+doc.preview+'" alt="'+doc.title+'" loading="lazy" decoding="async"><span class="document-index">'+String(i+1).padStart(2,'0')+' / '+String(item.documents.length).padStart(2,'0')+'</span></span><span class="document-name">'+doc.title+'</span><small>点击查看图片与说明</small></button>').join('')+'</div></section>'; }
  function snapshotMarkup(item){const s=item.snapshot;if(!s)return '';const rows=[['项目价值',s.value],['项目目标',s.goal],['核心用户',s.user],['我的范围',s.scope],['核心挑战',s.challenge],['阶段结果',s.result]];return '<section class="detail-snapshot"><div class="snapshot-head"><span>PROJECT SNAPSHOT</span><h2>项目摘要</h2></div><div class="snapshot-grid">'+rows.map(row=>'<div class="snapshot-row"><span>'+row[0]+'</span><p>'+row[1]+'</p></div>').join('')+'</div></section>'; }
  function toolingMarkup(item){
    if(!item.tools&&!item.references)return '';
    return '<section class="detail-tooling"><div class="tooling-head"><span>MAKING NOTES</span><h2>制作与参考</h2></div><div class="tooling-grid">'+(item.tools?'<div class="tooling-row"><span>制作工具</span><p>'+item.tools+'</p></div>':'')+(item.references?'<div class="tooling-row"><span>参考来源</span><p>'+item.references+'</p></div>':'')+'</div></section>';
  }
  function playgroundHref(item){
    if(!item.playgroundUrl)return '';
    return location.protocol==='file:' ? 'http://127.0.0.1:8769/outputs/'+item.playgroundUrl : item.playgroundUrl;
  }
  function playgroundMarkup(item){
    const url=playgroundHref(item);
    if(!url)return '';
    return '<section class="detail-playground" aria-label="'+item.title+'真实网页交互"><div class="detail-playground-head"><span>LIVE INTERACTION / THREE.JS</span><h2>直接进入网页交互</h2><p>悬停或触摸秋千、滑梯和木马，观察它们在真实 GLB 节点上的局部反馈。</p></div><div class="detail-playground-frame"><iframe title="'+item.title+'" src="'+url+'" loading="eager"></iframe></div><a class="detail-playground-open" href="'+url+'" target="_blank" rel="noopener">单独打开 HTML 交互 <span>open</span></a></section>';
  }
  function processBoardMarkup(j){
    const board=j&&j.process;
    if(!board||!board.length)return '';
    return '<section class="process-board"><div class="process-board-head"><span>PROCESS BOARD</span><h3>过程图</h3><p>把实际展板、原型截图和当时的判断放在同一条线上。</p></div><div class="process-board-grid">'+board.map((step,index)=>{const source=step.source.replace(/图[四五] \/ 竖版主海报/g,'竖版主海报');return '<figure class="process-card"><div class="process-card-image"><img loading="lazy" src="'+step.image+'" alt="'+step.title+'：'+source+'"><span>'+step.step+'</span></div><figcaption><strong>'+step.title+'</strong><small>'+source+'</small><p>'+step.note+'</p></figcaption></figure>';}).join('')+'</div></section>';
  }
  function nativeEvidenceMarkup(j){
    const evidence=j&&j.nativeEvidence;
    if(!evidence||!evidence.images?.length)return '';
    return '<section class="native-evidence" aria-label="'+evidence.title+'"><div class="native-evidence-head"><span>NATIVE PREVIEW / RENDER</span><h3>'+evidence.title+'</h3><p>'+evidence.intro+'</p></div><div class="native-evidence-grid">'+evidence.images.map((entry,index)=>'<figure class="native-evidence-card"><div class="native-evidence-image"><img loading="lazy" src="'+entry.src+'" alt="'+entry.title+'：'+entry.source+'"><span>'+String(index+1).padStart(2,'0')+'</span></div><figcaption><strong>'+entry.title+'</strong><small>'+entry.source+'</small><p>'+entry.note+'</p></figcaption></figure>').join('')+'</div><p class="evidence-boundary">'+evidence.boundary+'</p></section>';
  }
  function frameworkMarkup(j){
    const framework=j&&j.framework;
    if(!framework||!framework.nodes?.length)return '';
    return '<section class="detail-framework" aria-label="'+framework.title+'"><div class="framework-head"><span>PRODUCT FRAMEWORK</span><h3>'+framework.title+'</h3><p>'+framework.intro+'</p></div><div class="framework-flow">'+framework.nodes.map((node,index)=>'<div class="framework-node"><span class="framework-index">'+String(index+1).padStart(2,'0')+'</span><strong>'+node.label+'</strong><small>'+node.detail+'</small></div>').join('<span class="framework-arrow" aria-hidden="true">→</span>')+'</div><p class="framework-footer">'+framework.footer+'</p></section>';
  }
  function figmaMarkup(j){
    const figma=j&&j.figma;
    if(!figma||!figma.frames?.length)return '';
    return '<section class="figma-structure" aria-label="'+figma.title+'"><div class="figma-head"><span>FIGMA / STRUCTURE</span><h3>'+figma.title+'</h3><p>'+figma.intro+'</p></div><div class="figma-frame"><div class="figma-toolbar"><i></i><i></i><i></i><span>页面与状态</span></div><div class="figma-frame-grid">'+figma.frames.map((frame,index)=>'<div class="figma-frame-card"><span>'+String(index+1).padStart(2,'0')+'</span><strong>'+frame.label+'</strong><small>'+frame.detail+'</small></div>').join('')+'</div></div><p class="figma-note">'+figma.note+'</p></section>';
  }
  function journeyMarkup(item){
    const j=item.journey;
    if(!j)return '';
    const visualMarkup=j.visual?'<figure class="journey-visual"><img loading="lazy" src="'+j.visual.src+'" alt="'+j.visual.alt+'"><figcaption>'+j.visual.caption+'</figcaption></figure>':'';
    const reviewMarkup=j.reviews?.length?'<div class="journey-review"><div class="review-head"><span>PROJECT RETROSPECT</span><h3>'+((j.reviewTitle)||'犯过的错与复盘')+'</h3></div><p class="review-intro">'+(j.reviewIntro||'把偏差写出来，才能知道下一次要改变哪一步。')+'</p><div class="review-list">'+j.reviews.map((review,index)=>'<article class="review-item"><span class="review-index">'+String(index+1).padStart(2,'0')+'</span><div class="review-field"><span class="review-label">当时的偏差</span><p>'+review.mistake+'</p></div><div class="review-field"><span class="review-label">带来的影响</span><p>'+review.impact+'</p></div><div class="review-field"><span class="review-label">现在会怎么改</span><p>'+review.change+'</p></div></article>').join('')+'</div></div>':'';
    const intro=(j.intro||'').replace(/图[四五]的竖版海报/g,'竖版主海报');
    return '<section class="detail-journey"><div class="journey-head"><h2>设计历程与 AI 使用</h2><span>DESIGN PROCESS</span></div><p class="journey-intro">'+intro+'</p>'+visualMarkup+nativeEvidenceMarkup(j)+frameworkMarkup(j)+figmaMarkup(j)+processBoardMarkup(j)+'<div class="journey-steps">'+j.steps.map(step=>'<div class="journey-step"><span>'+step.title+'</span><p>'+step.body+'</p></div>').join('')+'</div>'+reviewMarkup+'<div class="journey-ai"><span>'+((j.aiTitle)||'AI 使用边界')+'</span><p>'+j.ai+'</p></div></section>';
  }
  function sectionMarkup(s){
    const title=Array.isArray(s)?s[0]:s.title;
    const body=Array.isArray(s)?s[1]:s.body;
    const chain=Array.isArray(s)?s[2]:s.chain;
    const decision=Array.isArray(s)?s[3]:s.decision;
    const visual=Array.isArray(s)?s[4]:s.visual;
    const visualMarkup=visual?'<figure class="section-visual"><img loading="lazy" src="'+visual.src+'" alt="'+visual.alt+'"><figcaption>'+visual.caption+'</figcaption></figure>':'';
    return '<section class="detail-section"><h2>'+title+'</h2>'+visualMarkup+'<p>'+body+'</p>'+(chain||decision?'<div class="section-analysis">'+(chain?'<div class="analysis-row"><span class="analysis-label">链路</span><p class="analysis-copy">'+chain+'</p></div>':'')+(decision?'<div class="analysis-row"><span class="analysis-label">我的决策</span><p class="analysis-copy">'+decision+'</p></div>':'')+'</div>':'')+'</section>';
  }
  function quickCaseMarkup(item){const s=item.snapshot;if(!s)return '';const rows=[['设计价值',s.value],['我的范围',s.scope||item.role],['阶段结果',s.result]],images=s.onSiteImages||[];const proof=images.length?'<div class="snapshot-on-site"><div class="snapshot-on-site-head"><span>现场应用</span><span>ON SITE</span></div><div class="snapshot-on-site-grid">'+images.map(image=>'<figure class="snapshot-on-site-card"><img loading="lazy" src="'+image.src+'" alt="'+image.caption+'"><figcaption>'+image.caption+'</figcaption></figure>').join('')+'</div></div>':'';return '<section class="detail-quick-read" aria-label="案例快速阅读"><div class="quick-read-head"><span>30 SECOND READ</span><h2>先看价值</h2></div><div class="quick-read-grid">'+rows.map(row=>'<div class="quick-read-row"><span>'+row[0]+'</span><p>'+row[1]+'</p></div>').join('')+'</div>'+proof+'</section>';}
  function premiereCaseMarkup(item){
    const story=item.caseNarrative||{},steps=story.steps||[],result=story.result||item.snapshot?.result||item.detailDelivery||'';
    const images=item.snapshot?.onSiteImages||[];
    const evidence=images.length?'<div class="premiere-case-evidence" aria-label="首映礼现场应用"><div class="premiere-case-evidence-heading"><span>现场应用</span><span>首映礼现场照片</span></div><div class="premiere-case-evidence-grid">'+images.slice(0,2).map(image=>'<figure><button type="button" data-media-src="'+escapeMarkup(image.src)+'" aria-label="查看'+escapeMarkup(image.caption||'现场照片')+'"><img loading="lazy" src="'+escapeMarkup(image.src)+'" alt="'+escapeMarkup(image.caption||'现场照片')+'"></button><figcaption>'+escapeMarkup(image.caption||'')+'</figcaption></figure>').join('')+'</div></div>':'';
    return '<section class="premiere-case" aria-label="首映礼设计逻辑"><div class="premiere-case-heading"><span class="eyebrow">CASE LOGIC</span><h2>'+escapeMarkup(story.title||'从影片情绪到首映现场')+'</h2><p>'+escapeMarkup(story.intro||item.intro||'')+'</p></div><ol class="premiere-case-steps">'+steps.map((step,index)=>'<li class="premiere-case-step"><span class="premiere-case-step-index">'+String(index+1).padStart(2,'0')+'</span><div><h3>'+escapeMarkup(step.title||'')+'</h3><p>'+escapeMarkup(step.body||'')+'</p></div></li>').join('')+'</ol><div class="premiere-case-result"><span>交付结果</span><p>'+escapeMarkup(result)+'</p></div>'+evidence+'<p class="premiere-case-credit"><span>我的职责</span><strong>'+escapeMarkup(item.role||'')+'</strong><span>制作工具</span><strong>'+escapeMarkup(item.tools||'')+'</strong></p></section>';
  }
  function pauseDetailMedia(){const video=$('#detailContent video');if(video)video.pause();}
  function closeDetail(after){const layer=$('#detailLayer');if(layer.hidden){if(after)after();return;}pauseDetailMedia();const restore=detailFocus;detailFocus=null;layer.classList.remove('is-visible');layer.classList.add('is-closing');setTimeout(()=>{if(layer.classList.contains('is-visible'))return;layer.hidden=true;layer.classList.remove('is-closing');state.detail=null;if(after)after();else if(restore&&typeof restore.focus==='function')restore.focus();},220);}
  function resetWelcome(){portfolioLayer.hidden=true;welcomeLayer.hidden=false;$("#previewFrame").classList.add("liquid-welcome-active");motion.reset();if(failed)motion.fail();startLiquid();}
  function openLightbox(src,label){if(!src)return;lightboxFocus=document.activeElement;const box=$('#imageLightbox');$('#lightboxImage').src=src;$('#lightboxImage').alt=label||documentViewerDoc?.title||state.detail?.title||'素材图片';box.hidden=false;box.classList.add('is-visible');document.body.classList.add('lightbox-open');setTimeout(()=>focusFirst(box),0);}
  function closeLightbox(){const box=$('#imageLightbox');if(box.hidden)return;const restore=lightboxFocus;lightboxFocus=null;box.classList.remove('is-visible');setTimeout(()=>{if(!box.classList.contains('is-visible')){box.hidden=true;if(restore&&typeof restore.focus==='function')restore.focus();}},180);document.body.classList.remove('lightbox-open');}
  function renderDocumentNotes(doc){const copy=$('#documentViewerCopy');if(!copy)return;const notes=doc&&doc.notes;if(!notes){copy.hidden=true;return;}copy.hidden=false;$('#documentViewerIndex').textContent=doc.title;$('#documentViewerIdea').textContent=notes.idea||'';$('#documentViewerProcess').textContent=notes.process||'';$('#documentViewerThinking').textContent=notes.thinking||'';$('#documentViewerProblems').textContent=notes.problems||'';$('#documentViewerLimitations').textContent=notes.limitations||'';}
  function openDocumentViewer(doc){if(!doc?.preview&&!doc?.file)return;documentViewerFocus=document.activeElement;documentViewerDoc=doc;const viewer=$('#documentViewer'),image=$('#documentViewerImage'),hint=$('#documentViewerHint'),pdf=$('#documentViewerPdf');$('#documentViewerTitle').textContent=doc.title+' / 预览';renderDocumentNotes(doc);viewer.querySelector('.document-viewer-panel').scrollTop=0;image.hidden=!doc.preview;image.alt=doc.title+' 页面预览';hint.hidden=!!doc.preview;hint.classList.toggle('btn-shine',!!doc.preview);hint.textContent=doc.preview?'正在加载页面预览':'预览图暂时不可用，请打开 PDF';image.onload=()=>{image.hidden=false;hint.hidden=true;hint.classList.remove('btn-shine');};image.onerror=()=>{image.hidden=true;hint.hidden=false;hint.classList.remove('btn-shine');hint.textContent='预览图暂时无法加载，请打开 PDF';};image.src=doc.preview||'';pdf.disabled=!doc.file;pdf.dataset.file=doc.file||'';viewer.hidden=false;viewer.classList.add('is-visible');document.body.classList.add('document-viewer-open');setTimeout(()=>focusFirst(viewer),0);}
  function openDocumentPdf(){const url=$('#documentViewerPdf').dataset.file;if(!url)return;const opened=window.open(url,'_blank','noopener');if(!opened){const hint=$('#documentViewerHint');hint.hidden=false;hint.classList.remove('btn-shine');hint.textContent='新窗口被拦截，请在浏览器中打开 PDF';}}
  function closeDocumentViewer(){const viewer=$('#documentViewer');if(viewer.hidden)return;const restore=documentViewerFocus;documentViewerFocus=null;viewer.classList.remove('is-visible');setTimeout(()=>{if(!viewer.classList.contains('is-visible')){viewer.hidden=true;const image=$('#documentViewerImage');image.onload=null;image.onerror=null;image.removeAttribute('src');image.alt='';$('#documentViewerPdf').dataset.file='';$('#documentViewerHint').hidden=false;$('#documentViewerHint').classList.remove('btn-shine');$('#documentViewerCopy').hidden=true;['Idea','Process','Thinking','Problems','Limitations'].forEach(name=>$('#documentViewer'+name).textContent='');documentViewerDoc=null;if(restore&&typeof restore.focus==='function')restore.focus();}},180);document.body.classList.remove('document-viewer-open');}

  /* 2026-09-21 process-led redesign candidate. The previous data and viewers remain available,
     but the primary reading path now starts with value, contribution, process and evidence. */
  function processValue(item){
    const s=item&&item.snapshot||{};
    return {
      user:s.user||'项目目标用户以当前资料为准。',
      challenge:s.challenge||s.value||'把一个具体问题转成可被阅读和验证的方案。',
      value:s.value||item.subtitle||'把一个具体问题转成可被阅读和验证的方案。',
      scope:s.scope||item.role||'从方向、结构到原型表达。',
      result:s.result||'阶段结果以当前项目资料和运行资料为准。'
    };
  }
  function compactCaseSignals(item){
    const s=processValue(item);
    const proof=item.proof||{};
    const isPremiere=item.id==='dear-you-premiere';
    const images=item.snapshot?.onSiteImages||[];
    const evidence=images.length?'<div class="case-onsite-evidence" aria-label="首映礼现场应用图片">'+images.map(image=>'<figure><img loading="lazy" src="'+image.src+'" alt="'+image.caption+'"><figcaption>'+image.caption+'</figcaption></figure>').join('')+'</div>':'';
   const rows=[['目标用户',s.user],['原始困难',s.challenge],['我的贡献',proof.contribution||s.scope]];
   if(!isPremiere)rows.push(['结果边界',proof.result||s.result]);
    const result=isPremiere?'<div class="case-result"><span>落地结果</span><p>'+((proof.result)||s.result)+'</p></div>':'';
   const heading=isPremiere?'':'<div class="case-signals-head"><span>CASE READ</span><h2>先看用户和问题</h2></div>';
   return '<section class="case-signals" aria-label="案例快速阅读">'+heading+result+evidence+'<div class="case-signals-grid">'+rows.map(row=>'<div><span>'+row[0]+'</span><p>'+row[1]+'</p></div>').join('')+'</div></section>';
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
  function interactionVideoMarkup(item){
    const video=item?.journey?.interactionVideo;
    if(!video)return '';
    return '<figure class="mobile-interaction-video"><video controls playsinline preload="none"'+(video.poster?' poster="'+escapeMarkup(video.poster)+'"':'')+' src="'+escapeMarkup(video.src)+'"></video><figcaption><strong>'+escapeMarkup(video.title||'')+'</strong><span>'+escapeMarkup(video.caption||'')+'</span></figcaption></figure>';
  }
  function compactProcess(item){
    const j=item&&item.journey;
    if(!j)return '';
    const isLushFashion=item?.id==='lush-fashion';
    const steps=(j.steps||[]).slice(0,4);
    const process=(j.process||[]).filter(step=>step&&step.image);
    const processMarkup=item?.id==='lush-fashion'&&process.length
      ?'<div class="mobile-process-evidence"><figure class="mobile-process-generation"><img loading="lazy" src="LUSH-portfolio-preview_files/assets/portfolio/lush-orla/orla-gemini-video-generation-process.png" alt="Google Gemini 视频生成界面和服装造型视频预览"><figcaption><strong>生成过程</strong><span>用 Google Gemini 生成服装展示视频。</span></figcaption></figure><figure class="mobile-process-contact-sheet"><img loading="lazy" src="LUSH-portfolio-preview_files/assets/portfolio/lush-orla/orla-interaction-contact-sheet-12-frames.png" alt="LUSH 服装网站视频关键画面总览，展示斜坐造型、手部靠近镜头、站立正面、侧面与背面造型"><figcaption><strong>视频关键画面</strong><span>从开场动作到整体造型，再到单品展示。</span></figcaption></figure></div>'
      :process.length?'<div class="mobile-process-media">'+process.map((step,index)=>'<figure><img loading="lazy" src="'+escapeMarkup(step.image)+'" alt="'+escapeMarkup([step.title,step.source].filter(Boolean).join('\uff1a'))+'"><figcaption><strong>'+escapeMarkup(step.title||'')+'</strong><span>'+escapeMarkup(step.note||step.source||'')+'</span></figcaption></figure>').join('')+'</div>':'';
    const intro=(j.intro||'\u5148\u786e\u8ba4\u95ee\u9898\uff0c\u518d\u51b3\u5b9a\u7ed3\u6784\uff0c\u6700\u540e\u56de\u5230\u771f\u5b9e\u5c4f\u5e55\u9a8c\u8bc1\u3002').replace(/\u56fe[\u56db\u4e94]\u7684\u7ad6\u7248\u6d77\u62a5/g,'\u7ad6\u7248\u4e3b\u6d77\u62a5');
    const heading=isLushFashion?'页面浏览顺序':'\u6211\u5982\u4f55\u628a\u95ee\u9898\u505a\u6210\u65b9\u6848';
    const eyebrow=isLushFashion?'设计过程':'DESIGN PROCESS';
    return '<section class="detail-journey compact-journey" id="case-process"><div class="journey-head"><h2>'+heading+'</h2><span>'+eyebrow+'</span></div><p class="journey-intro">'+escapeMarkup(intro)+'</p>'+(steps.length?'<div class="compact-process-list">'+steps.map((step,index)=>'<article class="compact-process-item"><span>'+String(index+1).padStart(2,'0')+'</span><div><h3>'+escapeMarkup(step.title||'')+'</h3><p>'+escapeMarkup(step.body||'')+'</p></div></article>').join('')+'</div>':'')+processMarkup+'<div class="compact-boundary"><span>'+escapeMarkup(j.aiTitle||'AI \u4f7f\u7528\u8fb9\u754c')+'</span><p>'+escapeMarkup(j.ai||'\u5de5\u5177\u53ea\u53c2\u4e0e\u63a2\u7d22\u548c\u5b9e\u73b0\uff0c\u9879\u76ee\u4e8b\u5b9e\u4ee5\u771f\u5b9e\u7d20\u6750\u4e3a\u51c6\u3002')+'</p></div></section>';
  }function compactOutcome(item){
    const result=item?.snapshot?.result;
    if(item?.id==='dear-you-premiere')return '';
    const media=(item?.fieldMedia||[]).slice(0,3);
    if(!result&&!media.length)return '';
    const label='落地结果';
    const eyebrow='DELIVERY / ON SITE';
    return '<section class="delivery-proof" aria-label="'+label+(media.length?'与现场图':'')+'"><div class="delivery-proof-head"><span>'+eyebrow+'</span><h2>'+label+'</h2><p>'+(result||'阶段结果以当前项目资料为准。')+'</p></div>'+(media.length?'<div class="delivery-proof-grid">'+media.map((entry,index)=>'<figure class="delivery-proof-card"><button type="button" data-media-src="'+entry.src+'" aria-label="查看'+entry.alt+'"><img loading="lazy" src="'+entry.src+'" alt="'+entry.alt+'"></button><figcaption><span>0'+(index+1)+'</span>'+entry.caption+'</figcaption></figure>').join('')+'</div>':'')+'</section>';
  }
  function compactStory(item){
    const wanted=['\u4e1a\u52a1\u80cc\u666f','\u95ee\u9898','\u7b56\u7565','\u8bbe\u8ba1\u65b9\u6848','\u7ed3\u679c','\u4e0b\u4e00\u6b65'];
    const rows=wanted.map(title=>{
      const source=(item.sections||[]).find(section=>(Array.isArray(section)?section[0]:section.title)===title);
      if(!source)return '';
      const body=Array.isArray(source)?source[1]:source.body;
      const visual=Array.isArray(source)?source[4]:source.visual;
      const visualMarkup=visual?'<figure class="case-story-visual"><img loading="lazy" src="'+escapeMarkup(visual.src)+'" alt="'+escapeMarkup(visual.alt||title)+'"></figure>':'';
      return '<article class="case-story-item">'+visualMarkup+'<div class="case-story-copy"><span>'+escapeMarkup(title)+'</span><p>'+escapeMarkup(body||'')+'</p></div></article>';
    }).filter(Boolean).join('');
    return rows?'<section class="case-story" id="case-judgement"><div class="case-story-head"><span>DESIGN JUDGEMENT</span><h2>\u5173\u952e\u5224\u65ad</h2></div><div class="case-story-grid">'+rows+'</div></section>':'';
  }function decisionTreeMarkup(item){
    const tree=item?.decisionTree;
    if(!tree?.branches?.length)return '';
   const branches=tree.branches.map(branch=>'<article class="logic-tree-branch"><div class="logic-tree-branch-card"><h3 class="logic-tree-branch-title">'+branch.title+'</h3><p class="logic-tree-row">'+branch.decision+'</p></div></article>').join('');
   return '<section class="design-logic-tree" aria-label="设计逻辑"><div class="logic-tree-head"><span>DESIGN LOGIC</span><h2>'+tree.title+'</h2></div><div class="logic-tree-branches">'+branches+'</div></section>';
  }
  function sponsorMarkup(item){
    if(!item?.sponsorLogos?.length)return '';
    return '<section class="sponsor-section" id="case-sponsors" aria-label="赞助商"><div class="case-story-head"><span>SPONSORS</span><h2>赞助商</h2></div><div class="sponsor-logo-grid">'+item.sponsorLogos.map((logo,index)=>'<div class="sponsor-logo-card"><img loading="lazy" src="'+logo.src+'" alt="'+logo.alt+'"><span>0'+(index+1)+'</span></div>').join('')+'</div></section>';
  }
  function compactEvidence(item){
    const sponsors=sponsorMarkup(item);
    if(!item.documents?.length)return sponsors;
    return sponsors+'<section class="project-documents compact-evidence" id="case-evidence"><div class="case-story-head"><span>PROJECT MATERIALS</span><h2>项目资料</h2><p>'+item.documents.length+' 份项目资料，点击查看页面与设计说明。</p></div><div class="document-grid">'+item.documents.map((doc,i)=>'<button class="document-card" type="button" data-document-id="'+doc.id+'" aria-label="查看'+doc.title+' 页面与设计说明"><span class="document-thumb"><img loading="lazy" src="'+doc.preview+'" alt="'+doc.title+'"><span class="document-index">'+String(i+1).padStart(2,'0')+' / '+String(item.documents.length).padStart(2,'0')+'</span></span><span class="document-name">'+doc.title+'</span><small>查看资料</small></button>').join('')+'</div></section>';
  }
  function projectCategoryLabel(item){const labels={'lush':'产品与交互','dear-you-premiere':'活动视觉','beyao':'数字服装','lush-fashion':'交互原型'};return labels[item.id]||item.category;}
function workCard(item,featured){
    const signal=processValue(item);
    const proof=item.proof||{};
    const premiere=item.id==='dear-you-premiere';
    const caseYear=premiere?'2026':String(item.year||'').replace(/[^0-9]/g,'').slice(0,4);
    const cardCopy=premiere?{title:'《给阿嫲的情书》首映礼',subtitle:'昆士兰州电影首映礼',contribution:'主海报、多尺寸延展与远程交付协调。',meta:'已进入现场应用'}:{title:item.title,subtitle:item.subtitle,contribution:proof.contribution||signal.scope,meta:item.cardMeta};
    const cover=item.id==='dear-you-premiere'?ASSET+'dear-you-premiere/poster.jpg':item.cover;
    const visual=item.id==='dear-you-premiere'?'<div class="project-picture project-picture-landscape"><div class="premiere-landscape" aria-hidden="true"><img class="premiere-landscape__image" src="'+cover+'" alt=""><span class="premiere-landscape__veil"></span><span class="premiere-landscape__copy"><span class="premiere-landscape__kicker">QUEENSLAND PREMIERE / 2026</span><strong>给阿嫲<br>的情书</strong><span class="premiere-landscape__english">DEAR YOU</span><span class="premiere-landscape__location">昆士兰州首映礼</span></span><span class="premiere-landscape__mark">主视觉 / 01</span></div><span class="project-type">精选案例</span></div>':'<div class="project-picture"><img class="'+(item.coverMode==='aspectFit'?'project-cover-contain':'')+'" src="'+cover+'" alt="'+item.title+'"><span class="project-type">'+(featured?'精选案例':item.status)+'</span></div>';
    return '<button class="project process-project '+(premiere?'process-project-premiere ':'')+(featured?'process-project-featured':'')+'" data-id="'+item.id+'" aria-label="打开'+cardCopy.title+'案例"><div class="process-project-top"><span>CASE '+caseYear+'</span></div>'+visual+'<div class="project-title-line"><span class="project-name">'+cardCopy.title+'</span><span class="project-category">'+projectCategoryLabel(item)+'</span></div><p class="project-subtitle">'+cardCopy.subtitle+'</p><div class="project-proof-strip"><div><span>我负责</span><p>'+cardCopy.contribution+'</p></div></div><div class="project-foot"><span>'+cardCopy.meta+'</span><span class="project-explore">打开案例 <b>→</b></span></div></button>';
  }
  function workView(){
    const cats=['项目经历','设计作品','VIBE CODING'];
    const all=data.items;
    const shown=state.category===cats[0]?all:all.filter(item=>item.category===state.category||item.filterCategory===state.category);
    const activeIndex=Math.max(0,cats.indexOf(state.category));
    const cards=shown.map((item,index)=>{
      const id=escapeMarkup(item.id);
      const title=escapeMarkup(item.title||'');
      const subtitle=escapeMarkup(item.subtitle||'');
      const cover=escapeMarkup(item.cover||'');
      const alt=escapeMarkup(item.alt||item.title||'');
      const role=escapeMarkup(item.role||'');
      const delivery=escapeMarkup(item.delivery||'');
      const summary=escapeMarkup(item.summary===''?'':(item.summary||item.description||''));const summaryMarkup=summary?'<p class="mobile-project-summary">'+summary+'</p>':'';
      const imageMode=item.coverLayout==='horizontal-recomposition'?'mobile-project-cover-fill':'';
      const longTitle=(item.id==='dear-you-premiere')?' long':'';
      return '<button class="project mobile-project-card" data-id="'+id+'" aria-label="查看'+title+'，'+subtitle+'"><div class="mobile-project-image"><img class="'+imageMode+'" src="'+cover+'" alt="'+alt+'" loading="'+(index===0?'eager':'lazy')+'"></div><div class="mobile-project-copy"><div class="mobile-project-title-line"><h2 class="project-name'+longTitle+'">'+title+'</h2><span class="project-category">'+escapeMarkup(item.category||'')+'</span></div><p class="mobile-project-subtitle">'+subtitle+'</p>'+summaryMarkup+'<div class="mobile-project-facts"><div class="mobile-project-meta"><span>负责</span><strong>'+role+'</strong></div><div class="mobile-project-meta"><span>交付</span><strong>'+delivery+'</strong></div></div><div class="case-button"><span>查看案例</span><span class="case-chevron" aria-hidden="true">›</span></div></div></button>';
    }).join('');
    const filters=cats.map(category=>'<button class="filter '+(category===state.category?'selected':'')+'" data-category="'+escapeMarkup(category)+'" aria-pressed="'+(category===state.category)+'">'+escapeMarkup(category)+'</button>').join('');
    return contentWordmark()+'<div class="mobile-applicant-summary"><span class="mobile-applicant-name">'+escapeMarkup(data.resume.name)+' / '+escapeMarkup(data.resume.english)+'</span><span class="mobile-applicant-role">'+escapeMarkup(data.resume.role)+'</span></div><div class="section-head mobile-project-heading"><h1 class="page-title">精选项目</h1></div><div class="mobile-quick-links" aria-label="快捷入口"><button class="mobile-quick-link glass-ready" type="button" data-focus-projects="true"><img class="glass-plate" src="LUSH-portfolio-preview_files/assets/portfolio/glass/button-v3.webp" alt="" aria-hidden="true"><span class="mobile-quick-link-label">项目经历</span><span class="quick-link-chevron" aria-hidden="true">›</span></button><button class="mobile-quick-link glass-ready" type="button" data-info="简历预览"><img class="glass-plate" src="LUSH-portfolio-preview_files/assets/portfolio/glass/button-v3.webp" alt="" aria-hidden="true"><span class="mobile-quick-link-label">个人简历</span><span class="quick-link-chevron" aria-hidden="true">›</span></button></div><div class="filters mobile-project-filters glass-ready" data-active="'+activeIndex+'" aria-label="项目分类"><img class="glass-track-plate" src="LUSH-portfolio-preview_files/assets/portfolio/glass/track-v3.webp" alt="" aria-hidden="true"><span class="glass-lens" aria-hidden="true"><img class="glass-lens-body" src="LUSH-portfolio-preview_files/assets/portfolio/glass/lens-v3.webp" alt=""></span>'+filters+'</div><div class="work-list mobile-work-list" id="project-list-start">'+(cards||'<p class="mobile-empty">当前分类暂无项目</p>')+'</div>';
  }
  window.addEventListener('error',event=>{const image=event.target;if(!(image instanceof HTMLImageElement))return;const host=image.closest('.mobile-quick-link,.mobile-project-filters');if(!host||!image.matches('.glass-plate,.glass-track-plate,.glass-lens-body'))return;host.classList.remove('glass-ready');host.classList.add('glass-fallback');},true);
  function labView(){
    const flow=data.designFlow||{};
    const root=flow.root||{};
    const branches=(flow.branches||[]).map(branch=>{
      const nodes=(branch.nodes||[]).map(node=>'<article class="design-flow-node"><div class="design-flow-node-head"><span class="design-flow-index">'+escapeMarkup(node.index)+'</span><h4 class="design-flow-node-title">'+escapeMarkup(node.title)+'</h4></div><p class="flow-process"><span class="flow-label">过程</span>'+escapeMarkup(node.process)+'</p><p class="flow-thinking"><span class="flow-label">思考</span>'+escapeMarkup(node.thinking)+'</p></article>').join('');
      return '<section class="design-flow-branch" aria-labelledby="flow-branch-'+escapeMarkup(branch.id)+'"><div class="design-flow-branch-head"><span class="design-flow-branch-kicker">BRANCH / '+escapeMarkup(String(branch.id||'').toUpperCase())+'</span><h3 id="flow-branch-'+escapeMarkup(branch.id)+'">'+escapeMarkup(branch.label)+'</h3><p>'+escapeMarkup(branch.note)+'</p></div><div class="design-flow-nodes">'+nodes+'</div></section>';
    }).join('');
    return sectionHead('DESIGN PROCESS','设计工作流','')+'<div class="design-flow" aria-label="设计工作流树"><div class="design-flow-root"><span class="design-flow-index">'+escapeMarkup(root.index||'00')+'</span><div><span class="flow-label">起点</span><h2 class="design-flow-root-title">'+escapeMarkup(root.title)+'</h2><p class="design-flow-root-body">'+escapeMarkup(root.body)+'</p><p class="flow-thinking"><span class="flow-label">思考</span>'+escapeMarkup(root.thinking)+'</p></div></div>'+modelFrameworkMarkup()+'<div class="design-flow-branches">'+branches+'</div></div><button class="text-link" data-go="work"><span>在作品中查看结果</span><span>&gt;</span></button>';
  }
  function archiveView(){return sectionHead('REFERENCE / ARCHIVE','参考素材','只保留能解释项目判断的素材。')+'<div class="archive-grid">'+data.archive.map(x=>'<button class="archive-item" data-archive="'+x[0]+'"><div class="archive-image"><img src="'+x[3]+'" alt="'+x[1]+'"></div><span class="archive-title">'+x[1]+'</span><span class="archive-kind">'+x[2]+'</span></button>').join('')+'</div>'+'<span class="archive-note">素材不是结果，只有放回具体项目里才有意义。</span>';}
  function aboutView(){return contentWordmark()+'<div class="about-heading"><p class="about-eyebrow">个人介绍</p><div class="about-identity"><div class="about-name">'+escapeMarkup(data.resume.name)+'</div><p class="about-name-en">'+escapeMarkup(data.resume.english)+'</p><p class="about-role">'+data.resume.role+'</p></div><div class="about-facts" aria-label="设计师信息"><div class="about-fact"><span>教育背景</span><p>'+data.resume.education+'</p></div><div class="about-fact"><span>擅长类目</span><p>AI全栈设计、交互网站制作与服装设计</p></div><div class="about-fact"><span>工作方式</span><p>AI 协同探索 → 设计判断 → 视觉交互落地 → 多端体验打磨。</p></div></div></div><section class="about-actions" aria-label="联系与简历"><p class="about-actions-label">下一步 / 继续了解</p><div class="about-links"><button class="link-row link-row-primary" data-info="简历预览"><span class="line-icon resume-icon"></span><span>简历预览</span><span class="chevron">›</span></button><button class="link-row link-row-secondary" data-info="联系入口"><span class="line-icon mail-icon"></span><span>联系入口</span><span class="chevron">›</span></button></div></section>';}
  function renderMenu(){ensureMenuShell();$('#menuSheet').dataset.sheetView='menu';$('#menuSheet').setAttribute('aria-label','页面目录');const allowed=new Set(['work','lab','archive','about']);const chatEntry='<button class="menu-row" type="button" data-open-albert-chat aria-label="打开 Albert AI 对话"><span><strong>AI 对话</strong><small>和 Albert 聊一会儿</small></span><em>></em></button>';$('#menuRows').innerHTML=chatEntry+data.sections.filter(x=>allowed.has(x[0])).map(x=>'<button class="menu-row" data-section="'+x[0]+'" aria-current="'+(state.section===x[0]?'page':'false')+'"><span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></span><em>></em></button>').join('');}
  function mountDetailNavigation(item){
    const content=$('#detailContent'), header=$('#detailLayer .detail-header');
    header.querySelector('.detail-index')?.remove();
    const targets=[];
    if(item.id==='dear-you-premiere'){
      targets.push(['summary','摘要',content.querySelector('#detailTitle')]);
      targets.push(['process','过程',content.querySelector('.premiere-case-steps')]);
    }else{
      const quickRead=content.querySelector('.detail-quick-read'), snapshot=content.querySelector('.detail-snapshot');
      if(quickRead)targets.push(['result','结果',quickRead]);
      if(snapshot)targets.push(['summary','摘要',snapshot]);
      else if(!quickRead)targets.push(['summary','摘要',content.querySelector('#detailTitle')]);
      targets.push(['process','过程',content.querySelector('.detail-journey')||content.querySelector('.detail-section')]);
      targets.push(['review','复盘',content.querySelector('.journey-review')]);
      targets.push(['documents','资料',content.querySelector('.project-documents')]);
    }
    const visibleTargets=targets.filter(x=>x[2]);
    const nav=document.createElement('nav');nav.className='detail-index';nav.setAttribute('aria-label','项目区块');
    for(const [id,label,target] of visibleTargets){target.id='case-'+id;target.tabIndex=-1;const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.jump=id;button.setAttribute('aria-controls',target.id);button.addEventListener('click',()=>{content.scrollTop+=target.getBoundingClientRect().top-content.getBoundingClientRect().top-18;target.focus({preventScroll:true});update();});nav.append(button);}
    header.append(nav);
    let frame=0;
    function update(){frame=0;const edge=content.getBoundingClientRect().top+80;let active=visibleTargets[0]?.[0];for(const [id,,target]of visibleTargets){if(target.getBoundingClientRect().top<=edge)active=id;}if(content.scrollTop+content.clientHeight>=content.scrollHeight-8)active=visibleTargets.at(-1)?.[0];nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.jump===active?'location':'false'));}
    content.onscroll=()=>{if(!frame)frame=requestAnimationFrame(update);};update();
    const docs=item.documents||[];
    if(docs.length){const quick=document.createElement('button');quick.className='detail-evidence-link';quick.type='button';quick.textContent='查看 '+docs.length+' 页项目资料';const targetId='documents';quick.addEventListener('click',()=>nav.querySelector('[data-jump="'+targetId+'"]').click());const detailMetaAnchor=content.querySelector('.detail-subtitle')||content.querySelector('#detailTitle');if(detailMetaAnchor)detailMetaAnchor.after(quick);}
  }

  function visualCaseMarkup(item){
    const v=item.visualCase,e=escapeMarkup;
    const picture=(src,alt,cls,lazy=true)=>'<button type="button" class="pv-picture '+cls+'" data-media-src="'+e(src)+'" aria-label="放大'+e(alt)+'"><img src="'+e(src)+'" alt="'+e(alt)+'" loading="'+(lazy?'lazy':'eager')+'" decoding="async"></button>';
    const overview=v.screens.map(s=>'<figure>'+picture(s.src,s.alt,'pv-screen',false)+'<figcaption>'+e(s.title)+'</figcaption></figure>').join('');
    const routes=v.routes.map(r=>'<div class="pv-route"><h3>'+e(r.title)+'</h3>'+r.steps.map(s=>'<div class="pv-route-step"><span aria-hidden="true">↓</span><span>'+e(s)+'</span></div>').join('')+'</div>').join('');
    const decisions=v.decisions.map((d,i)=>'<section class="pv-section"><p class="pv-kicker">0'+(i+2)+' / 界面与取舍</p><h2>'+e(d.title)+'</h2><p class="pv-copy">'+e(d.body)+'</p>'+picture(v.screens[d.image].src,v.screens[d.image].alt,'pv-proof-screen')+'<p class="pv-source">实际界面 · 点击放大</p></section>').join('');
    const process=v.process.map((s,i)=>'<li><span class="pv-step-no">0'+(i+1)+'</span><div><h3>'+e(s.title)+'</h3><p class="pv-copy">'+e(s.body)+'</p></div></li>').join('');
    const wireframesMarkup=(v.wireframes||[]).length?['mobile','desktop'].map(device=>{const frames=v.wireframes.filter(frame=>frame.device===device);if(!frames.length)return '';const label=device==='mobile'?String.fromCharCode(0x79fb,0x52a8,0x7aef):String.fromCharCode(0x7f51,0x9875,0x7aef);return '<section class="pv-wireframe-section" aria-label="'+label+'"><p class="pv-kicker">'+label+'</p><div class="pv-wireframe-grid pv-wireframe-grid--'+device+'">'+frames.map(frame=>'<figure class="pv-wireframe">'+picture(frame.src,frame.alt,'pv-wireframe-image')+'<figcaption>'+e(frame.number)+'</figcaption></figure>').join('')+'</div></section>';}).join(''):'';
    return '<article class="pv-case"><h1 id="detailTitle">郁葱空间</h1><p class="pv-intro">'+e(v.summary)+'</p><div class="pv-overview">'+overview+'</div><p class="pv-source">当前小程序实际预览</p><dl class="pv-meta"><dt>设计与实现</dt><dd>'+e(v.role)+'</dd><dt>交付</dt><dd>'+e(v.delivery)+'</dd></dl><section class="pv-section"><p class="pv-kicker">01 / 两条使用路径</p><h2>看作品，也认识我</h2><div class="pv-routes">'+routes+'</div></section>'+decisions+'<section class="pv-section detail-journey"><p class="pv-kicker">04 / 制作过程</p><h2>从内容到可用页面</h2><ol class="pv-process">'+process+'</ol>'+picture(v.workbench.src,v.workbench.alt,'pv-workbench')+'<p class="pv-source">'+e(v.workbench.caption)+'</p></section>'+wireframesMarkup+'<p class="pv-footnote">'+e(v.sourceNote)+'</p><button class="detail-end" id="detailEnd" type="button">返回作品</button></article>';
  }
  function openDetail(item){
    detailFocus=document.activeElement;
    state.detail=item;
    const layer=$('#detailLayer');
    layer.hidden=false;
    layer.classList.remove('is-closing');
    layer.classList.add('is-visible');
    const c=$('#detailContent');
    c.dataset.projectId=item.id;
    if(item.id==='lush'&&item.visualCase){c.innerHTML=responsiveMarkup(visualCaseMarkup(item),'detail');}else{
      const cover=item.detailCover||item.cover;
      const coverMarkup='<button class="detail-cover-button" id="detailCoverButton" type="button" aria-label="全屏查看'+item.title+'主视觉"><img class="detail-cover" src="'+cover+'" alt="'+item.title+'"><span class="detail-cover-hint" aria-hidden="true">点击全屏查看</span></button>';
      const secondaryPosterMarkup=item.secondaryPoster?'<button type="button" class="detail-cover-button detail-secondary-poster" data-media-src="'+escapeMarkup(item.secondaryPoster.src)+'" aria-label="全屏查看第二张海报"><img class="detail-cover" src="'+escapeMarkup(item.secondaryPoster.src)+'" alt="'+escapeMarkup(item.secondaryPoster.alt||item.title)+'" loading="lazy" decoding="async"><span class="detail-cover-hint" aria-hidden="true">'+escapeMarkup(item.secondaryPoster.label||'海报 02')+' · 点击全屏查看</span></button>':'';
      const experienceLink=item.id==='lush-fashion'?'<a class="detail-end detail-experience-link" href="https://albertlush-d1gq6ex78779a34a3-1443272999.tcloudbaseapp.com/orla-video-site-20260926/" target="_blank" rel="noopener noreferrer" aria-label="打开 LUSH 服装网站原型，新窗口">打开网站原型 <span aria-hidden="true">›</span></a>':'';
      const isPremiere=item.id==='dear-you-premiere';
      const detailSections=isPremiere?coverMarkup+secondaryPosterMarkup+premiereCaseMarkup(item):interactionVideoMarkup(item)+coverMarkup+secondaryPosterMarkup+compactCaseSignals(item)+compactOutcome(item)+'<div class="detail-meta"><div><span>角色</span><strong>'+item.role+'</strong></div><div><span>时间</span><strong>'+item.year+'</strong></div></div>'+compactProcess(item)+decisionTreeMarkup(item)+compactStory(item)+compactEvidence(item);
      const detailMarkup='<div class="detail-scroll-wordmark"><img src="'+ROOT_ASSET+'lush-wordmark-mobile.png" alt="LUSH"></div><span class="eyebrow">'+item.status+' / '+item.category+'</span><h1 id="detailTitle">'+item.title+'</h1>'+(isPremiere?'' : '<p class="detail-subtitle">'+item.subtitle+'</p>')+experienceLink+detailSections+'<button class="detail-end" id="detailEnd" type="button">返回作品</button>';
      c.innerHTML=responsiveMarkup(detailMarkup,'detail');
    }
    const detailCover=c.querySelector('.detail-cover');if(detailCover){detailCover.loading='eager';detailCover.decoding='async';detailCover.fetchPriority='high';}
    if(item.id==='dear-you-premiere'){
      const journey=c.querySelector('.detail-journey'),tree=c.querySelector('.design-logic-tree'),story=c.querySelector('.case-story'),sponsor=c.querySelector('.sponsor-section');
      if(tree&&journey)c.insertBefore(tree,journey);
      if(sponsor&&journey)c.insertBefore(sponsor,journey);
      if(journey&&story){const more=document.createElement('details'),summary=document.createElement('summary');more.className='case-more';summary.textContent='展开项目过程与补充判断';c.insertBefore(more,journey);more.append(summary,journey,story);}
    }
    mountDetailNavigation(item);
    if(item.id==='dear-you-premiere')$('#detailLayer .detail-index').addEventListener('click',event=>{const button=event.target.closest('button[data-jump]');if(!button)return;const target=c.querySelector('#case-'+button.dataset.jump),more=target&&target.closest('details.case-more');if(!more)return;more.open=true;requestAnimationFrame(()=>{c.scrollTop+=target.getBoundingClientRect().top-c.getBoundingClientRect().top-18;target.focus({preventScroll:true});});});
    c.scrollTop=0;
    setTimeout(()=>focusFirst(layer),0);
  }
  $('#menuButton').addEventListener('click',openMenu); $('#sheetClose').addEventListener('click',closeMenu); $('#sheetOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeMenu();const close=e.target.closest('.sheet-close');if(close){if(close.id==='infoClose')closeInfo();else closeMenu();}if(e.target.closest('#infoCloseLink'))closeInfo();if(e.target.closest('#showIntroLink'))showIntroProject();}); $('#worksButton').addEventListener('click',()=>switchSection('work')); $('#aboutButton').addEventListener('click',()=>switchSection('about')); $('#detailBack').addEventListener('click',()=>closeDetail());
  $('#pageScroll').addEventListener('scroll',()=>{if(!state.switching)state.positions[state.section]=$('#pageScroll').scrollTop;});
  if(!oceanSheet){$('#menuSheet').addEventListener('pointerdown',e=>{sheetDrag={y:e.clientY};}); $('#menuSheet').addEventListener('pointerup',e=>{if(!sheetDrag)return;const d=e.clientY-sheetDrag.y;sheetDrag=null;if(d>70)state.menu?closeMenu():closeInfo();}); $('#menuSheet').addEventListener('pointercancel',()=>{sheetDrag=null;});}
  document.addEventListener('keydown',e=>{if(!$('#knowledgeLayer').hidden){if(e.key==='Escape'){closeKnowledge();return;}trapFocus(e,$('#knowledgeLayer'));return;}if(!$('#documentViewer').hidden){if(e.key==='Escape')closeDocumentViewer();else trapFocus(e,$('#documentViewer'));return;}if(!$('#imageLightbox').hidden){if(e.key==='Escape')closeLightbox();else trapFocus(e,$('#imageLightbox'));return;}if(!$('#sheetOverlay').hidden){if(e.key==='Escape'){state.sheet==='info'?closeInfo():closeMenu();return;}trapFocus(e,$('#menuSheet'));return;}if(!$('#detailLayer').hidden){if(e.key==='Escape'){closeDetail();return;}trapFocus(e,$('#detailLayer'));}});
  $('#lightboxClose').addEventListener('click',closeLightbox); $('#imageLightbox').addEventListener('click',e=>{if(e.target===e.currentTarget)closeLightbox();});
  $('#documentViewerClose').addEventListener('click',closeDocumentViewer); $('#documentViewerPdf').addEventListener('click',openDocumentPdf); $('#documentViewer').addEventListener('click',e=>{if(e.target===e.currentTarget)closeDocumentViewer();});
  $('#knowledgeBack').addEventListener('click',backKnowledge); $('#knowledgeClose').addEventListener('click',closeKnowledge); $('#knowledgeLayer').addEventListener('click',e=>{if(e.target===e.currentTarget){closeKnowledge();return;}if(e.target.closest('[data-copy-knowledge-link]')){copyKnowledgeLink();return;}const link=e.target.closest('[data-knowledge-id]');if(link)navigateKnowledge(link.dataset.knowledgeId);});
  $('#documentViewerImage').addEventListener('click',()=>{const image=$('#documentViewerImage');if(!image.hidden&&documentViewerDoc?.preview){image.focus();openLightbox(documentViewerDoc.preview);}});
  $('#documentViewerImage').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.currentTarget.hidden){e.preventDefault();e.currentTarget.focus();openLightbox(documentViewerDoc?.preview||e.currentTarget.src);}});
  $('#pageContent').addEventListener('click',e=>{if(e.target.closest('[data-knowledge]')){openKnowledge();return;}if(e.target.closest('[data-focus-projects]')){focusProjectList();return;}const cat=e.target.closest('[data-category]');if(cat){state.category=cat.dataset.category;render();return;}const step=e.target.closest('[data-lab]');if(step){state.labIndex=Number(step.dataset.lab);render();return;}const go=e.target.closest('[data-go]');if(go){switchSection(go.dataset.go);return;}const project=e.target.closest('[data-id]');if(project){const item=data.items.find(x=>x.id===project.dataset.id);if(item)openDetail(item);return;}const archive=e.target.closest('[data-archive]');if(archive){const item=data.archive.find(x=>x[0]===archive.dataset.archive);if(item)openInfo(item[1],item[4],item[3],item[0]);return;}const info=e.target.closest('[data-info]');if(info){const isResume=info.dataset.info==='简历预览';openInfo(info.dataset.info,isResume?resumeText():contactText(),null,isResume?'resume':'contact');return;}});
  $('#menuSheet').addEventListener('click',e=>{const copy=e.target.closest('[data-copy]');if(copy){copyContactPart(copy.dataset.copy);return;}if(e.target.closest('[data-download-resume]')){downloadResume();return;}if(e.target.closest('[data-copy-resume]')){copyText(resumeText(),e.target.closest('[data-copy-resume]'),'复制简历摘要');return;}if(e.target.closest('[data-open-albert-chat]')){closeMenu(()=>document.dispatchEvent(new CustomEvent('albertvoice:open')));return;}const row=e.target.closest('[data-section]');if(!row)return;const next=row.dataset.section;closeMenu();switchSection(next);});
  function showIntroProject(){const item=data.items.find(x=>x.id==='lush');closeInfo(()=>{if(item)openDetail(item);});}
  function setActionLabel(el,label){if(!el)return;const text=el.querySelector('span');if(text){const initial=el.dataset.defaultLabel||label;text.textContent=label;setTimeout(()=>{if(text.isConnected)text.textContent=initial;},1400);}}
  function writeClipboard(value){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(value);return new Promise((resolve,reject)=>{const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy')?resolve():reject(new Error('copy failed'));}catch(e){reject(e);}area.remove();});}
  function copyText(value,el,label){if(!value||!el)return;el.dataset.defaultLabel=label;writeClipboard(value).then(()=>setActionLabel(el,'已复制')).catch(()=>setActionLabel(el,'复制失败'));}
  function copyKnowledgeLink(){const el=document.querySelector('[data-copy-knowledge-link]');copyText(data.knowledge.obsidianUri,el,'复制 Obsidian 索引链接');}
  function copyContactPart(kind){const el=document.querySelector('[data-copy="'+kind+'"]');const value=kind==='github'?'https://github.com/'+data.contact.github:data.contact[kind];const labels={phone:'复制',wechat:'复制',email:'复制',github:'复制链接'};copyText(value,el,labels[kind]||'复制');}
  function downloadResume(){const blob=new Blob([resumeText()],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zhang-yucong-resume.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function openInfo(title,body,image,archiveId){
    const isContact=archiveId==='contact';
    $('#menuSheet').dataset.sheetView='info';$('#menuSheet').setAttribute('aria-label',title);$('#menuSheet').classList.toggle('contact-sheet-open',isContact);lastFocus=document.activeElement;state.sheet='info';const overlay=$('#sheetOverlay');
    const actions=archiveId==='intro'?'<button class="text-link" id="showIntroLink" type="button"><span>查看开场片段</span><span>></span></button>':archiveId==='resume'?'<button class="text-link" id="downloadResume" type="button" data-download-resume="true"><span>获取文本简历</span><span>></span></button><button class="text-link" id="copyResumeLink" type="button" data-copy-resume="true"><span>复制简历摘要</span><span>></span></button>':'';
    const imageMarkup=image?'<button class="info-image-button" id="infoImageButton" type="button" aria-label="查看素材大图"><img class="archive-image" src="'+image+'" alt=""></button>':'';
    const resumeTools=archiveId==='resume'?renderResumeToolsMarkup():'';
    const displayBody=archiveId==='resume'?'':body;
    const infoBody=isContact?'<div class="contact-sheet">'+contactMarkup()+'</div>':(archiveId==='resume'?resumePreviewMarkup():(displayBody?'<p class="detail-subtitle" style="white-space:pre-line">'+escapeMarkup(displayBody)+'</p>':''))+resumeTools+actions+'<button class="text-link" id="infoCloseLink" type="button"><span>关闭</span><span>></span></button>';
    $('#menuSheet').innerHTML='<div class="sheet-handle" aria-hidden="true"></div><div class="sheet-title"><h2>'+title+'</h2><button class="sheet-close" id="infoClose" type="button" aria-label="关闭信息">×</button></div>'+imageMarkup+infoBody;
    $('#infoClose').addEventListener('click',closeInfo);$('#infoCloseLink')?.addEventListener('click',closeInfo);$('#infoImageButton')?.addEventListener('click',()=>openLightbox(image,title));$('#showIntroLink')?.addEventListener('click',showIntroProject);$('#downloadResume')?.addEventListener('click',downloadResume);$('#copyResumeLink')?.addEventListener('click',()=>copyText(resumeText(),$('#copyResumeLink'),'复制简历摘要'));$('#menuSheet').querySelectorAll('[data-resume-project]').forEach(button=>button.addEventListener('click',()=>{const item=data.items.find(item=>item.id===button.dataset.resumeProject);if(!item)return;closeInfo(()=>openDetail(item));}));if(oceanSheet)oceanSheet.open();else overlay.hidden=false;setTimeout(()=>focusFirst($('#menuSheet')),0);
  }
  function closeInfo(afterClose){closeMenu(()=>{renderMenu();if(typeof afterClose==='function')afterClose();});}
  $('#detailContent').addEventListener('click',e=>{const documentCard=e.target.closest('[data-document-id]');if(documentCard){const doc=state.detail?.documents?.find(x=>x.id===documentCard.dataset.documentId);if(doc)openDocumentViewer(doc);return;}const mediaCard=e.target.closest('[data-media-src]');if(mediaCard){openLightbox(mediaCard.dataset.mediaSrc,mediaCard.getAttribute('aria-label')||state.detail?.title);return;}if(e.target.closest('#detailEnd')){closeDetail();return;}if(e.target.closest('#detailCoverButton')){openLightbox(state.detail?.detailCover||state.detail?.cover);return;}if(e.target.closest('#detailReplay')){closeDetail(resetWelcome);}});
  const lazyRoots=[$('#pageContent'),$('#detailContent')].filter(Boolean);
  lazyRoots.forEach(lazyRoot=>{const markLazyImages=()=>lazyRoot.querySelectorAll('.project:not(.project-premiere) .project-picture img,.archive-image img,.document-thumb img,.extra-media img,.section-visual img,.journey-visual img,.native-evidence-image img').forEach(img=>{if(img.dataset.lushPriority==='high')return;img.loading='lazy';img.decoding='async';});new MutationObserver(markLazyImages).observe(lazyRoot,{childList:true,subtree:true});});
  document.addEventListener('error',e=>{const img=e.target;if(!(img instanceof HTMLImageElement))return;if(img.dataset.originalSrc&&img.currentSrc&&img.currentSrc!==new URL(img.dataset.originalSrc,document.baseURI).href&&!img.dataset.optimizedFallback){img.dataset.optimizedFallback='true';img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=img.dataset.originalSrc;return;}const host=img.closest('.project-picture,.lab-image,.archive-image,.info-image-button,.detail-cover-button,.extra-media,.section-visual,.journey-visual');if(!host)return;const target=host instanceof HTMLImageElement?(host.parentElement||host):host;target.classList.add('media-missing');img.setAttribute('alt','图片暂时无法加载');},{capture:true});
  function syncDocumentCoverStack(){const host=$('#detailContent');const item=state.detail;const coverButton=host?.querySelector('#detailCoverButton');if(!host||!item?.documents?.length||!coverButton||host.querySelector('.detail-cover-stack'))return;const total=String(item.documents.length).padStart(2,'0');const stack=document.createElement('section');stack.className='detail-cover-stack project-documents';stack.setAttribute('aria-label','项目资料连续预览');stack.innerHTML=item.documents.map((doc,index)=>'<button class="detail-stack-page" type="button" data-document-id="'+doc.id+'" aria-label="查看'+doc.title+'页面"><span class="detail-stack-image"><img src="'+doc.preview+'" alt="'+doc.title+'" loading="lazy" decoding="async"><span class="detail-stack-index">'+String(index+1).padStart(2,'0')+' / '+total+'</span></span></button>').join('');coverButton.replaceWith(stack);host.querySelectorAll('.compact-evidence').forEach(section=>section.remove());mountDetailNavigation(item);}
  new MutationObserver(syncDocumentCoverStack).observe($('#detailContent'),{childList:true,subtree:true});
  if(location.protocol==='http:'||location.protocol==='https:'){try{const live=new EventSource('/__live');live.onmessage=e=>{if(e.data==='reload')location.reload();};}catch(e){}}
})();
