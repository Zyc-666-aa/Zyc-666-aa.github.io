/* The bevel normal drives Snell transmission, Schlick reflection and path absorption. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LushSheetOptics=api;})(typeof window==='object'?window:this,function(){
  const IOR=1.48,THICKNESS=18,MAP_SCALE=16;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
  function sample(x,y,w,h){
    const radius=Math.min(32,w/2,h/2),rim=Math.min(THICKNESS,w/2,h/2);
    let nx=0,ny=0,depth,corner=0;
    if(y<radius&&(x<radius||x>w-radius)){
      const cx=x<radius?radius:w-radius,dx=x-cx,dy=y-radius,length=Math.hypot(dx,dy);
      depth=radius-length;nx=dx/Math.max(length,.001);ny=dy/Math.max(length,.001);
      corner=Math.min(1,2*Math.abs(nx*ny));
    }else{
      depth=Math.min(x,w-x,y,h-y);
      nx=depth===x?-1:depth===w-x?1:0;ny=nx?0:depth===y?-1:1;
    }
    if(depth<=0||depth>=rim)return {dx:0,dy:0,reflection:0,absorption:0,diffusion:depth>=rim?1:0};
    const u=depth/rim,sinI=1-smooth(u),cosI=Math.sqrt(1-sinI*sinI);
    const sinT=sinI/IOR,cosT=Math.sqrt(1-sinT*sinT);
    const path=THICKNESS/cosT,raw=path*(sinI*cosT-cosI*sinT);
    const limit=4.2*(1+.5*corner),bend=limit*Math.tanh(raw/limit)*smooth(depth/.8);
    const r0=Math.pow((IOR-1)/(IOR+1),2),fresnel=r0+(1-r0)*Math.pow(1-cosI,5);
    const environment=.55+.45*clamp(-ny*.85-nx*.35,0,1),edge=1-smooth(u);
    return {dx:nx*bend,dy:ny*bend,
      reflection:(fresnel*.62+.025*Math.sin(Math.PI*u))*environment*edge,
      absorption:(1-Math.exp(-.024*(path-THICKNESS+THICKNESS*edge)))*edge,diffusion:smooth(u)};
  }
  function response(y,hidden,movement,velocity){
    const progress=clamp(y/Math.max(1,hidden),0,1);
    const lift=clamp(-movement/160,-1,1),speed=clamp(-velocity,-1.5,1.5);
    const thickness=THICKNESS*(1+.045*lift+.025*speed);
    return {progress,thickness,
      refraction:clamp(MAP_SCALE*(1+.09*lift+.075*speed+.025*(1-progress))*thickness/THICKNESS,13,20),
      parallax:clamp(movement*.03,-3,3),transmission:.94+progress*.06,
      edgeLight:clamp(1+.1*lift+.08*speed+.04*(1-progress),.78,1.28)};
  }
  function spring(value,velocity,target,dt){
    const w=18,z=.9,wd=w*Math.sqrt(1-z*z),t=clamp(dt,0,.064),e=Math.exp(-z*w*t),c=Math.cos(wd*t),s=Math.sin(wd*t),d=value-target;
    return [target+e*(d*c+(velocity+z*w*d)/wd*s),e*(velocity*c-(z*w*velocity+w*w*d)/wd*s)];
  }
  return {sample,response,spring,IOR,THICKNESS,MAP_SCALE};
});
