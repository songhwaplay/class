(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CDS95Weather=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const WORLD_W=2500;
  const WORLD_H=1250;
  const TILE=16;
  const WEATHER_SLOT_MINUTES=6*60;

  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function hash32(a,b,c,d){
    let x=(Math.imul((a|0)^0x9e3779b9,0x85ebca6b)+Math.imul((b|0)^0xc2b2ae35,0x27d4eb2f)+(c|0)+(d|0))|0;
    x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
    return (x>>>0)/4294967296;
  }
  function monthFromGameMinutes(gameMinutes){
    const d=new Date(Date.UTC(1492,0,1)+Math.max(0,Number(gameMinutes)||0)*60000);
    return d.getUTCMonth()+1;
  }
  function lonLatFromPixel(x,y){
    const px=((Number(x)||0)%(WORLD_W*TILE)+(WORLD_W*TILE))%(WORLD_W*TILE);
    const py=clamp(Number(y)||0,0,WORLD_H*TILE);
    return {lon:px/(WORLD_W*TILE)*360-180,lat:90-py/(WORLD_H*TILE)*180};
  }
  function estimatedTemperatureC(lat,month,terrain){
    const absLat=Math.abs(lat);
    const hemisphere=lat>=0?1:-1;
    const seasonalPhase=Math.cos((month-7)/12*Math.PI*2)*hemisphere;
    const annualMean=28-absLat*.43;
    const seasonalAmplitude=Math.min(22,absLat*.31);
    let temp=annualMean+seasonalAmplitude*seasonalPhase;
    if(terrain==='mountain')temp-=7;
    if(terrain==='highMountain')temp-=13;
    return temp;
  }
  function precipitationChance(lat,terrain){
    const absLat=Math.abs(lat);
    let chance=absLat<15?.48:absLat<30?.20:absLat<55?.34:absLat<70?.28:.20;
    if(terrain==='desert')chance*=.10;
    else if(terrain==='jungle')chance*=1.45;
    else if(terrain==='forest')chance*=1.28;
    else if(terrain==='mountain'||terrain==='highMountain')chance*=1.15;
    return clamp(chance,.015,.68);
  }
  function weatherAtPixel(x,y,gameMinutes,terrain='sea'){
    const {lon,lat}=lonLatFromPixel(x,y);
    const month=monthFromGameMinutes(gameMinutes);
    const slot=Math.floor((Math.max(0,Number(gameMinutes)||0))/WEATHER_SLOT_MINUTES);
    const regionLon=Math.floor((lon+180)/9);
    const regionLat=Math.floor((lat+90)/7);
    const chance=precipitationChance(lat,terrain);
    const roll=hash32(regionLon,regionLat,slot,1492);
    if(roll>=chance)return {type:'clear',intensity:0,temperatureC:estimatedTemperatureC(lat,month,terrain),slot,lat,lon};
    const temperatureC=estimatedTemperatureC(lat,month,terrain);
    const intensity=.35+hash32(regionLat,slot,regionLon,7331)*.60;
    const type=temperatureC<=1.5?'snow':'rain';
    const wind=hash32(slot,regionLon,regionLat,9029)*2-1;
    return {type,intensity,temperatureC,slot,lat,lon,wind};
  }
  return {WORLD_W,WORLD_H,TILE,WEATHER_SLOT_MINUTES,lonLatFromPixel,estimatedTemperatureC,weatherAtPixel};
});
