/* Shared snap decisions and damped spring samples for Web and WeChat. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LushSheetPhysics=api;})(typeof window==='object'?window:this,function(){
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function choose(y,velocity,state,half,collapsed){
    var points=[0,half,collapsed],names=['expanded','half','collapsed'];
    var projected=clamp(y+velocity*180,0,collapsed),index=0;
    for(var i=1;i<3;i++)if(Math.abs(points[i]-projected)<Math.abs(points[index]-projected))index=i;
    var current=state==='expanded'?0:1;
    if(Math.abs(velocity)>.5){var next=clamp(current+(velocity>0?1:-1),0,2);index=velocity>0?Math.max(index,next):Math.min(index,next);}
    return names[index];
  }
  function samples(from,to,velocity,duration){
    var w=20,z=.84,wd=w*Math.sqrt(1-z*z),distance=from-to,v=clamp(velocity||0,-2.5,2.5)*1000,frames=[];
    for(var i=0;i<=40;i++){var t=i/40*duration/1000,e=Math.exp(-z*w*t);var y=to+e*(distance*Math.cos(wd*t)+(v+z*w*distance)/wd*Math.sin(wd*t));frames.push({offset:i/40,y:i===40?to:y});}
    return frames;
  }
  return {choose:choose,samples:samples,clamp:clamp};
});