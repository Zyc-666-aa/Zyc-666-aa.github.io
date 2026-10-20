(function(root,factory){if(typeof window==='undefined'&&typeof module==='object'&&module.exports)module.exports=factory();else root.LushRenderer=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const vert='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
const background=`precision highp float;varying vec2 uv;uniform vec2 size;uniform float progress;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 q=vec2(uv.x,1.-uv.y)*size;vec2 cell=floor(q/23.);vec2 f=fract(q/23.);vec2 center=vec2(hash(cell+3.),hash(cell+7.));float d=length((f-center)*23.);
float star=exp(-d*d/0.52)*step(.88,hash(cell))*(.1+.38*hash(cell+11.));
float dust=hash(floor(q*1.1))*.008;float floorLight=smoothstep(.65,1.,q.y/size.y)*step(.987,hash(floor(q/2.)))*.032*(1.-smoothstep(.35,.9,progress));
gl_FragColor=vec4(vec3(.001,.002,.004)+vec3(.8,.88,1.)*(star+dust+floorLight),1.);}`;
const spriteVert=`attribute vec2 position;varying vec2 uv;varying vec2 pixel;uniform vec2 size;uniform vec4 rect;uniform float angle;
void main(){uv=position*.5+.5;vec2 p=position*rect.zw*.5;float c=cos(angle),s=sin(angle);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y)+rect.xy;pixel=p;gl_Position=vec4(p.x/size.x*2.-1.,1.-p.y/size.y*2.,0.,1.);}`;
const spriteFrag=`precision mediump float;varying vec2 uv;varying vec2 pixel;uniform vec3 portal;uniform float emerging;uniform sampler2D tex;uniform float opacity;uniform float balloon;uniform float clock;
void main(){vec2 p=uv;p.y+=sin(p.x*6.283+clock*.7)*.008*balloon;vec4 c=texture2D(tex,p);
if(balloon>.5){float mask=smoothstep(.01,.045,max(c.r,max(c.g,c.b)));float sheen=pow(max(0.,1.-abs(p.x-fract(clock*.045))/.16),3.);c.rgb+=c.rgb*sheen*.14;c.a*=mask;}
// The lower part of each sticker is contained by the sphere until it clears the lip.
float containment=1.;
if(emerging>.5){float circle=1.-smoothstep(portal.z-1.,portal.z+1.,length(pixel-portal.xy));float above=1.-smoothstep(portal.y-portal.z*.64,portal.y-portal.z*.64+2.,pixel.y);containment=max(circle,above);}
gl_FragColor=vec4(c.rgb,c.a*opacity*containment);}`;
const lens=`precision highp float;
varying vec2 uv;
uniform sampler2D scene;
uniform vec2 size,center,touch;
uniform float radius,progress,pressed,solid,flow,flowX,releaseAge,releaseEnergy,nativeGlassBoost;
vec3 sampleScene(vec2 p){return texture2D(scene,clamp(p,vec2(.001),vec2(.999))).rgb;}
float sceneCoverage(vec2 p){vec2 edge=2./size;return smoothstep(-edge.x,edge.x,p.x)*smoothstep(-edge.x,edge.x,1.-p.x)*smoothstep(-edge.y,edge.y,p.y)*smoothstep(-edge.y,edge.y,1.-p.y);}
// Trace both interfaces of a spherical dielectric into the actual scene texture.
vec2 lensUV(vec3 entry,vec3 normal,float ior,out float exitReflectance){
  vec3 inside=refract(vec3(0.,0.,-1.),normal,1./ior);
  vec3 exitPoint=entry+inside*max(.001,-2.*dot(entry,inside));
  vec3 exitNormal=-normalize(exitPoint);
  float cosIncident=clamp(-dot(inside,exitNormal),0.,1.);
  float sinTransmitted2=ior*ior*max(0.,1.-cosIncident*cosIncident);
  float cosTransmitted=sqrt(max(0.,1.-sinTransmitted2));
  float rs=pow((ior*cosIncident-cosTransmitted)/max(ior*cosIncident+cosTransmitted,.001),2.);
  float rp=pow((cosIncident-ior*cosTransmitted)/max(cosIncident+ior*cosTransmitted,.001),2.);
  exitReflectance=sinTransmitted2>=1.?1.:.5*(rs+rp);
  vec3 outgoing=refract(inside,exitNormal,ior);
  vec2 projected=exitPoint.xy+outgoing.xy*((-2.20-exitPoint.z)/min(-.08,outgoing.z));
  vec2 pixel=center+projected*radius;
  return vec2(pixel.x/size.x,1.-pixel.y/size.y);
}
void main(){
  vec2 q=vec2(uv.x,1.-uv.y)*size,raw=(q-center)/radius;
  float rawRadius=length(raw);
  vec3 outside=sampleScene(uv),color=outside;
  float compact=smoothstep(.62,1.,progress);
  float nativeLimit=1.008+max(mix(64.,30.,compact),40.)/radius;
  if(nativeGlassBoost>.5&&rawRadius>nativeLimit*1.024){gl_FragColor=vec4(outside,1.);return;}
  // Keep the radial edge light; reserve angular waves for the lens itself.
  float haloDistance=max(rawRadius-.992,0.)*radius;
  float haloWidth=mix(16.,8.,compact);
  float nativeHalo=exp(-pow(haloDistance/haloWidth,2.))*(1.-smoothstep(mix(40.,18.,compact),mix(64.,30.,compact),haloDistance));
  color+=vec3(.06,.17,.28)*nativeHalo*nativeGlassBoost;
  color+=vec3(.10,.11,.12)*exp(-abs(rawRadius-1.)*radius/8.)*compact*.45;
  if(rawRadius>1.024){gl_FragColor=vec4(color,1.);return;}
  float theta=dot(raw,raw)>1e-8?atan(raw.y,raw.x):0.;
  float organic=0.012*sin(theta*2.0+flow*0.12)+0.006*sin(theta*3.0-flowX*0.18)+0.004*sin(theta*5.0+releaseAge*1.3)*exp(-releaseAge*3.0)*releaseEnergy;
  vec2 z=raw/(1.0+organic);
  float r=length(z);
  if(r<1.){
    float depth=sqrt(max(.00001,1.-r*r));
    vec3 entry=vec3(z,depth);
    vec2 touchOnSphere=clamp((touch-center)/radius,vec2(-.85,-.85),vec2(.85,-.70));
    vec2 contact=z-touchOnSphere;
    float local=exp(-dot(contact,contact)*7.);
    float release=sin(length(contact)*15.-releaseAge*19.)*exp(-releaseAge*5.5)*releaseEnergy;
    float envelope=1.-smoothstep(.80,1.,r);
    vec2 stress=contact*local*pressed*.10+vec2(z.x*z.y,-(1.-z.y*z.y))*clamp(flow,-2.,2.)*.028+vec2(-(1.-z.x*z.x),z.x*z.y)*clamp(flowX,-2.,2.)*.035;
    float pressure=pressed+exp(-releaseAge*7.)*releaseEnergy*.28;
    float dent=exp(-dot(contact,contact)/.078)*pressure*(1.-compact*.7);
    vec3 normal=normalize(vec3(z/depth-contact*dent*2.8+stress+z*release*.022,1.));
    float thickness=.03*pressed*local;
    float midExitReflectance,redExitReflectance,blueExitReflectance;
    vec2 mid=lensUV(entry,normal,1.46+thickness,midExitReflectance);
    // Keep subtle wavelength separation on the same full refracted ray.
    float split=.002+.010*pow(r,4.)+compact*.006+.003*min(abs(flow)+abs(flowX),1.);
    vec2 red=lensUV(entry,normal,1.46+thickness-split,redExitReflectance);
    vec2 blue=lensUV(entry,normal,1.46+thickness+split,blueExitReflectance);
    vec3 transmitted=vec3(
      mix(outside.r,sampleScene(red).r,1.-redExitReflectance),
      mix(outside.g,sampleScene(mid).g,1.-midExitReflectance),
      mix(outside.b,sampleScene(blue).b,1.-blueExitReflectance));
    float fresnel=.035+.965*pow(1.-clamp(normal.z,0.,1.),5.);
    float coverage=min(sceneCoverage(mid),min(sceneCoverage(red),sceneCoverage(blue)));
    color=mix(outside,transmitted,coverage*(1.-fresnel));
    color*=vec3(.96,.985,1.0)*(1.-.11*depth);
    color+=vec3(.014,.015,.016)*depth;
    float restTint=(1.-compact)*(.022+.032*depth);
    color+=vec3(.70,.71,.72)*restTint;
    // A localized cool reflection adds blue glass character without tinting the whole lens.
    float coolBounce=exp(-pow((z.y-.56)/.34,2.)-pow(z.x/.78,4.));
    color+=vec3(.012,.028,.045)*coolBounce*(1.-compact*.55);
    color+=vec3(.012,.030,.052)*coolBounce*nativeGlassBoost*(1.-compact*.55);
    // Keep the glass body clear; scene transmission and reflected edges provide its volume.
    vec3 reflected=reflect(vec3(0.,0.,-1.),normal);
    vec2 lightShift=vec2(clamp((touch.x-center.x)/radius,-1.,1.)*.12*pressed+flowX*.05,-flow*.04);
    vec3 key=normalize(vec3(-.4+lightShift.x,-.72+lightShift.y,.58));
    float sheet=pow(max(dot(reflected,key),0.),18.);
    // A broad reflected softbox makes the transmitted surface read as glass, not a flat glow.
    float softbox=exp(-pow((z.x+.34)/.42,2.)-pow((z.y+.48)/.30,2.));
    float narrow=pow(max(dot(reflected,normalize(vec3(.58,-.53,.62))),0.),100.);
    float rim=exp(-pow((r-.989)*radius/mix(5.4,1.8,compact),2.));
    float inner=exp(-pow((r-.964)*radius/mix(7.2,2.8,compact),2.));
    float facing=clamp(.56-.43*z.y-.22*z.x,.03,1.);
    color+=vec3(.70,.82,.94)*sheet*(.28+.14*pressed);
    color+=vec3(.35,.37,.39)*softbox*(1.-compact*.55)*.48;
    float reflectionStreak=exp(-pow((z.x+.54)/.105,2.)-pow((z.y+.48)/.34,2.));
    color+=vec3(.58,.60,.62)*reflectionStreak*(1.-compact*.55)*.18;
    color+=vec3(.86,.94,1.)*narrow*.15;
    color+=vec3(.84,.93,1.)*rim*facing*.82;
    color+=vec3(.53,.64,.73)*inner*facing*(.56+.12*pressed);
    color+=vec3(.22,.23,.24)*fresnel*facing*.40;
    float shoulder=exp(-pow((r-.957)/.030,2.))*pow(max(-z.y*.9-z.x*.22,0.),2.);
    float reflectedStrip=exp(-pow((reflected.y+.70+reflected.x*.10)/.11,2.))*exp(-pow(reflected.x/.85,6.));
    color+=vec3(.48,.65,.78)*shoulder*.44;
    color+=vec3(.65,.76,.84)*reflectedStrip*(.055+.04*pressed)*(1.-compact*.8);
    // A pressure-driven depression carries its spectral rim with the contact point.
    float distanceToTouch=length(contact);
    float blueBand=exp(-pow((distanceToTouch-.35)/.082,2.));
    float cyanBand=exp(-pow((distanceToTouch-.44)/.040,2.));
    float outerLip=exp(-pow((distanceToTouch-.50)/.030,2.));
    float indentation=pressure*(1.-compact*.82)*envelope;
    color*=1.-dent*.30;
    color+=vec3(.05,.19,.54)*blueBand*indentation*.42;
    color+=vec3(.012,.40,.53)*cyanBand*indentation*.42;
    color+=vec3(.52,.52,.45)*outerLip*indentation*.28;
    // A compressed reflected scene provides moving detail along the thick edge.
    vec2 reflectionUV=vec2(.5+reflected.x*.6,.64+reflected.y*.36);
    color+=sampleScene(reflectionUV)*fresnel*.12;
    float caustic=exp(-pow((r-.93)*radius/5.,2.))*pow(max(z.y*.7+z.x*.3,0.),3.);
    color+=vec3(.16,.17,.18)*caustic*.18;
    float basalGlow=exp(-(size.y-q.y)/(size.y*.09))*(1.-compact)*(.8+.2*pressed);
    color+=vec3(.11,.12,.13)*basalGlow*.22;
    if(solid>.5)color=vec3(.095,.12,.15)+vec3(.4,.48,.55)*rim*.6;
    float cross=max((1.-smoothstep(1.3,1.8,abs(q.x-center.x)))*(1.-smoothstep(9.,10.,abs(q.y-center.y))),(1.-smoothstep(1.3,1.8,abs(q.y-center.y)))*(1.-smoothstep(9.,10.,abs(q.x-center.x))));
    float crossOpacity=max(1.-smoothstep(.08,.24,progress),smoothstep(.8,1.,progress));
    color+=vec3(.84,.88,.94)*cross*crossOpacity;
    color=mix(color,outside,smoothstep(1.-1./radius,1.,r));
  }
  gl_FragColor=vec4(color,1.);
}`;
const kinds=['speech0','mac','phoneSticker','star','plane','code','planet','bolt','speech1','star','mac','plane','speech2','phoneSticker','planet'];
const clamp01=value=>Math.max(0,Math.min(1,value));
function drawSpacedText(ctx,text,centerX,centerY,size,spacing,color,font='Arial, sans-serif'){
 const chars=Array.from(text||'');if(!chars.length)return;
 ctx.font=`400 ${size}px ${font}`;ctx.fillStyle=color;ctx.textBaseline='middle';
 const widths=chars.map(char=>ctx.measureText(char).width),total=widths.reduce((sum,width)=>sum+width,0)+spacing*(chars.length-1);
 let x=centerX-total/2;
 chars.forEach((char,index)=>{ctx.fillText(char,x+widths[index]/2,centerY);x+=widths[index]+spacing;});
}

function drawPill(ctx,x,y,w,h){
 const r=h/2;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// A time-staggered stream. Every cycle starts below the centre of the same lens.
// No pre-scattered starting positions: birth -> rolling at the lip -> free flight.
function stickerPose(i,key,age,G,w,h,m){
 const life=3.6,interval=life/kinds.length;
 const elapsed=age-i*interval;if(elapsed<0)return null;
 const a=elapsed%life,t=a/life,exit=.20;
 const inside=Math.min(1,t/exit),flight=Math.max(0,(t-exit)/(1-exit));
 const pop=Math.exp(-Math.pow((t-.225)/.055,2));
 const seed=i*2.39996323,lane=Math.sin(seed);
 const lipX=lane*G.r*.38;
 const travel=Math.min(h*.59,620);
 const rise=travel*flight+G.r*.11*pop;
 const fan=(Math.min(w*.35,195)*Math.pow(flight,.75));
 const x=G.cx+lipX+Math.sin(seed+flight*2.1)*fan+Math.sin(inside*Math.PI)*G.r*.12;
 const y=G.cy+G.r*(.32-1.24*inside)-rise;
 const scale=(w<350?.87:1)*(.46+.54*Math.min(1,inside*1.3))*(1+.09*pop);
 const width=(key.startsWith('speech')?72:key==='phoneSticker'?43:key==='star'?29:54)*scale;
 const height=width*(key==='phoneSticker'?1.47:key.startsWith('speech')?.7:1);
 const roll=(1-Math.min(1,inside))*Math.PI*1.2*(i%2?1:-1);
 const angle=lane*.65+roll+flight*Math.sin(seed)*1.3+Math.sin(seed)*.08*pop+Math.sin(m.clock*.6+i)*.06;
 const opacity=Math.min(1,a/.12)*Math.min(1,(1-t)/.12)*Math.max(0,Math.min(1,(G.p-.60)/.32));
 return {x,y,w:width,h:height,angle,opacity,t,emerging:t<.37?1:0,pop};
}
class Renderer{
 constructor(canvas,options={}){this.canvas=canvas;this.options=options;const g=this.gl=canvas.getContext('webgl',{alpha:false,antialias:false});if(!g)throw Error('WEBGL_UNAVAILABLE');this.resources=[];this.programInfo=new Map();this.textures={};this.bg=this.program(vert,background);this.lens=this.program(vert,lens);this.sprite=this.program(spriteVert,spriteFrag);this.buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,this.buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);this.texture=this.newTexture();this.fbo=g.createFramebuffer();this.readyCount=0;this.loadAssets();}
 program(v,f){
  const g=this.gl,p=g.createProgram();
  for(const [type,src]of[[g.VERTEX_SHADER,v],[g.FRAGMENT_SHADER,f]]){const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));g.attachShader(p,s);g.deleteShader(s);}
  g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error(g.getProgramInfoLog(p));
  const source=v+'\n'+f,uniforms=new Map(),pattern=/\buniform\s+\w+\s+([^;]+);/g;let match;
  while((match=pattern.exec(source))!==null)for(const part of match[1].split(',')){const name=part.trim().split(/\s+/).pop();if(name&&!uniforms.has(name))uniforms.set(name,g.getUniformLocation(p,name));}
  this.programInfo.set(p,{position:g.getAttribLocation(p,'position'),uniforms});this.resources.push(p);return p;
 }
 uniform(p,name){const info=this.programInfo.get(p);if(!info)return null;const location=info.uniforms.get(name);return location===undefined?null:location;}
 newTexture(){const g=this.gl,t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);return t;}
 upload(key,image){if(this.dead)return;const g=this.gl,t=this.newTexture();g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,image);this.textures[key]={texture:t,w:image.width,h:image.height};this.readyCount++;}
 setCanvasTexture(key,canvas){const current=this.textures[key];if(!current){this.upload(key,canvas);return;}const g=this.gl;g.bindTexture(g.TEXTURE_2D,current.texture);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,canvas);current.w=canvas.width;current.h=canvas.height;}
 loadAssets(){const factory=this.options.createImage||(()=>new Image()),base=this.options.assetBase||'LUSH-portfolio-preview_files/assets/native/',keys=[...(this.options.showLogo===false?[]:['logo']),...new Set(kinds.filter(k=>!k.startsWith('speech')))];for(const key of keys){const img=factory();img.onload=()=>{try{this.upload(key,img);}catch(e){this.assetError=String(e);return;}if(key==='logo'&&typeof this.options.onLogoReady==='function')this.options.onLogoReady();};img.onerror=()=>{this.assetError='ASSET_UNAVAILABLE: '+key;};img.src=key==='logo'?base+'lush-wordmark-mobile.png':base+'scene/'+key+'.png';}
 if(this.options.createTextCanvas){['去创造','灵感来了','设计日常','把想法做出来'].forEach((label,i)=>{const c=this.options.createTextCanvas();c.width=256;c.height=180;const x=c.getContext('2d');x.fillStyle='#f3f3ed';x.strokeStyle='#16181b';x.lineWidth=5;x.beginPath();x.moveTo(22,20);x.quadraticCurveTo(126,0,232,22);x.quadraticCurveTo(255,60,229,130);x.lineTo(249,164);x.lineTo(192,146);x.quadraticCurveTo(70,178,20,133);x.quadraticCurveTo(0,75,22,20);x.fill();x.stroke();x.fillStyle='#171a1d';x.textAlign='center';x.textBaseline='middle';x.font=(i===3?'25':'32')+'px sans-serif';x.fillText(label,127,82);this.upload('speech'+i,c);});}}
 use(p){const g=this.gl,info=this.programInfo.get(p),a=info.position;g.useProgram(p);g.bindBuffer(g.ARRAY_BUFFER,this.buffer);g.enableVertexAttribArray(a);g.vertexAttribPointer(a,2,g.FLOAT,false,0,0);g.uniform2f(info.uniforms.get('size'),this.w,this.h);}
 resize(w,h,dpr=1){this.w=w;this.h=h;const g=this.gl;if(typeof g.isContextLost==='function'&&g.isContextLost())throw Error('WEBGL_CONTEXT_LOST stage=resize');const reportedMax=typeof g.getParameter==='function'&&g.MAX_TEXTURE_SIZE?Number(g.getParameter(g.MAX_TEXTURE_SIZE)):0,max=reportedMax>0?reportedMax:1024,s=Math.min(dpr,1.5,max/Math.max(w,h));this.renderScale=s;this.canvas.width=Math.max(1,Math.round(w*s));this.canvas.height=Math.max(1,Math.round(h*s));g.bindTexture(g.TEXTURE_2D,this.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,this.canvas.width,this.canvas.height,0,g.RGBA,g.UNSIGNED_BYTE,null);g.bindFramebuffer(g.FRAMEBUFFER,this.fbo);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,this.texture,0);const status=g.checkFramebufferStatus(g.FRAMEBUFFER);if(status!==g.FRAMEBUFFER_COMPLETE)throw Error('FRAMEBUFFER_INCOMPLETE status=0x'+Number(status).toString(16)+' size='+this.canvas.width+'x'+this.canvas.height+' max='+max);g.bindFramebuffer(g.FRAMEBUFFER,null);this.prepareWelcomeUI();}
 prepareWelcomeUI(){
   const ui=this.options.ui,create=this.options.createTextCanvas;if(this.options.showWelcomeUI===false||!ui||!create)return;
  const scale=this.renderScale||1,w=this.w,h=this.h;
  const makeCanvas=()=>{const canvas=create();canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);return {canvas,ctx};};
  const labels=makeCanvas(),labelContext=labels.ctx;
  if(ui.showPortfolioLabel!==false)drawSpacedText(labelContext,ui.portfolioLabel||'PORTFOLIO',w*.5,ui.portfolioTop+(ui.portfolioFontSize||13)*.5,ui.portfolioFontSize||13,ui.portfolioLetterSpacing||4,'rgba(164,175,186,.9)');
  labelContext.font='400 12px sans-serif';labelContext.fillStyle='rgba(210,222,235,.82)';labelContext.textAlign='center';labelContext.textBaseline='middle';labelContext.fillText(ui.hint||'上滑进入',w*.5,h-(ui.hintBottom||84)-8);
  this.setCanvasTexture('welcome-labels',labels.canvas);
  const copy=makeCanvas(),ctx=copy.ctx,titleSize=ui.titleFontSize||22,buttonWidth=ui.buttonWidth||213,buttonHeight=ui.buttonHeight||54,buttonBottom=h*.9,buttonTop=buttonBottom-buttonHeight;
  ctx.fillStyle='#f2f3f5';ctx.font=`400 ${titleSize}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ui.title||'',w*.5,ui.titleTop+titleSize*.66,w*.88);
  const left=(w-buttonWidth)*.5;drawPill(ctx,left,buttonTop,buttonWidth,buttonHeight);ctx.fillStyle='#f0f3f7';ctx.fill();ctx.strokeStyle='#dbe5ef';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#10151b';ctx.font='400 16px sans-serif';ctx.textBaseline='middle';ctx.fillText(ui.enterLabel||'查看作品',w*.5,buttonTop+buttonHeight*.5,buttonWidth-24);
  this.setCanvasTexture('welcome-copy',copy.canvas);
 }
 image(key,x,y,w,h,angle,opacity,balloon,m,pose=null,G=null){const t=this.textures[key];if(!t||opacity<=0)return;const g=this.gl,p=this.sprite;this.use(p);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,t.texture);g.uniform1i(this.uniform(p,'tex'),0);g.uniform3f(this.uniform(p,'portal'),G?G.cx:0,G?G.cy:0,G?G.r:1);g.uniform1f(this.uniform(p,'emerging'),pose?pose.emerging:0);g.uniform4f(this.uniform(p,'rect'),x,y,w,h);for(const[k,v]of Object.entries({angle,opacity,balloon,clock:m.clock}))g.uniform1f(this.uniform(p,k),v);g.drawArrays(g.TRIANGLES,0,6);}
 draw(m){const g=this.gl,G=m.geometry(this.w,this.h),p=G.p,visualProgress=clamp01(m.p);g.viewport(0,0,this.canvas.width,this.canvas.height);g.bindFramebuffer(g.FRAMEBUFFER,this.fbo);g.disable(g.BLEND);this.use(this.bg);g.uniform1f(this.uniform(this.bg,'progress'),p);g.drawArrays(g.TRIANGLES,0,6);
 g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);
 if(this.options.showLogo!==false){const ui=this.options.ui||{},logoW=(ui.markWidth||Math.min(this.w*.92,490)*.8)*(1+.024*Math.sin(m.clock*1.3))*(1-visualProgress*.13);const logoH=logoW*247/640;this.image('logo',this.w*.5,(ui.markCenterY||this.h*.435)-visualProgress*this.h*.1,logoW,logoH,-.018*Math.sin(m.clock*.9),Math.pow(1-visualProgress,1.5),1,m);}
 if(!m.reduced&&this.options.showStickers!==false){kinds.forEach((key,i)=>{const pose=stickerPose(i,key,m.revealAge,G,this.w,this.h,m);if(pose)this.image(key,pose.x,pose.y,pose.w,pose.h,pose.angle,pose.opacity,0,m,pose,G);});}
  g.disable(g.BLEND);g.bindFramebuffer(g.FRAMEBUFFER,null);const program=this.lens;this.use(program);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,this.texture);g.uniform1i(this.uniform(program,'scene'),0);g.uniform2f(this.uniform(program,'center'),G.cx,G.cy);g.uniform2f(this.uniform(program,'touch'),m.pointer?m.pointer.x:G.cx,m.pointer?m.pointer.y:G.cy);for(const[k,v]of Object.entries({radius:G.r,progress:p,speed:m.v,pressed:m.press,solid:m.reduced?1:0,clock:m.clock,flow:m.flow,flowX:m.flowX,releaseAge:m.releaseAge,releaseEnergy:m.releaseEnergy,nativeGlassBoost:this.options.nativeGlassBoost?1:0}))g.uniform1f(this.uniform(program,k),v);g.drawArrays(g.TRIANGLES,0,6);
  const ui=this.options.ui||{},copyStart=typeof ui.copyRevealStart==='number'?ui.copyRevealStart:.985;
  const copyOpacity=clamp01((visualProgress-copyStart)/(1-copyStart));
  g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);
  this.image('welcome-labels',this.w*.5,this.h*.5,this.w,this.h,0,1-visualProgress,0,m);
  this.image('welcome-copy',this.w*.5,this.h*.5,this.w,this.h,0,copyOpacity,0,m);
  g.disable(g.BLEND);}
  hasVisibleFrame(m){
  const g=this.gl;
  try{
   if(!g||typeof g.readPixels!=='function'||(typeof g.isContextLost==='function'&&g.isContextLost()))return false;
   const G=m.geometry(this.w,this.h),scale=this.canvas.height/this.h;
   const patchSide=Math.max(7,Math.round(scale*9)),half=Math.floor(patchSide/2),samples=[];
   let minX=this.canvas.width,minY=this.canvas.height,maxX=0,maxY=0;
   for(const offset of [-.55,0,.55]){
    const angle=-Math.PI/2+offset;
    const logicalX=G.cx+Math.cos(angle)*G.r*.97;
    const logicalY=G.cy+Math.sin(angle)*G.r*.97;
    if(logicalX<0||logicalX>=this.w||logicalY<0||logicalY>=this.h)continue;
    const centerX=Math.round(logicalX*scale),centerY=Math.round(this.canvas.height-logicalY*scale);
    const x=Math.max(0,Math.min(this.canvas.width-patchSide,centerX-half));
    const y=Math.max(0,Math.min(this.canvas.height-patchSide,centerY-half));
    samples.push({x,y});
    minX=Math.min(minX,x);minY=Math.min(minY,y);
    maxX=Math.max(maxX,x+patchSide);maxY=Math.max(maxY,y+patchSide);
   }
   if(!samples.length)return false;
   const readWidth=maxX-minX,readHeight=maxY-minY,pixels=new Uint8Array(readWidth*readHeight*4);
   g.readPixels(minX,minY,readWidth,readHeight,g.RGBA,g.UNSIGNED_BYTE,pixels);
   let brightPatches=0;
   for(const sample of samples){
    let brightPixels=0,peak=0;
    for(let row=0;row<patchSide;row++)for(let col=0;col<patchSide;col++){
     const i=((sample.y-minY+row)*readWidth+sample.x-minX+col)*4;
     const light=pixels[i]+pixels[i+1]+pixels[i+2];
     if(light>90)brightPixels++;
     if(light>peak)peak=light;
    }
    if(brightPixels>=4&&peak>=180)brightPatches++;
   }
   // A true glass rim occupies multiple spatial patches; isolated background stars cannot pass this gate.
   return brightPatches>=2;
   }catch(e){return false;}
  }
  isContextLost(){const g=this.gl;try{if(!g)return true;return typeof g.isContextLost==='function'?g.isContextLost():null;}catch(e){return true;}}
  destroy(){this.dead=true;const g=this.gl;this.resources.forEach(p=>g.deleteProgram(p));Object.values(this.textures).forEach(t=>g.deleteTexture(t.texture));g.deleteBuffer(this.buffer);g.deleteTexture(this.texture);g.deleteFramebuffer(this.fbo);}
}
return {Renderer,stickerPose,stickerKinds:kinds};
});
