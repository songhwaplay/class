(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.UW3BGM=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  const TRACKS=Object.freeze({
    voyage_preparation:{file:'Track23.mp3',label:'출항 준비'},
    sailing_near_europe:{file:'Track15.mp3',label:'유럽 근해 항해'},
    sailing_atlantic:{file:'Track25.mp3',label:'남대서양 항해'},
    sailing_indian_ocean:{file:'Track13.mp3',label:'신대륙·동방 원양 항해'},
    sailing_pacific:{file:'Track24.mp3',label:'남방·카리브 항해'},
    sailing_polar:{file:'Track19.mp3',label:'극지 항해'},
    city_iberia:{file:'Track10.mp3',label:'이베리아 도시'},
    city_mediterranean:{file:'Track05.mp3',label:'지중해 도시'},
    city_scandinavia:{file:'Track09.mp3',label:'북유럽 도시'},
    city_middle_east:{file:'Track07.mp3',label:'중동·이슬람권 도시'},
    city_africa:{file:'Track02.mp3',label:'아프리카 도시'},
    city_india:{file:'Track12.mp3',label:'인도권 도시'},
    city_southeast_asia:{file:'Track27.mp3',label:'동남아시아·중앙아시아 도시'},
    city_china:{file:'Track06.mp3',label:'중국·조선 도시'},
    city_japan:{file:'Track18.mp3',label:'일본 도시'},
    city_america:{file:'Track04.mp3',label:'아메리카 도시'},
    land_expedition:{file:'Track26.mp3',label:'육상 탐험'}
  });

  const AFRICA_REGIONS=new Set(['동아프리카','서아프리카']);
  const MIDDLE_EAST_REGIONS=new Set(['북아프리카','근동','중동']);
  const SOUTHEAST_ASIA_REGIONS=new Set(['동남아시아','중앙아시아']);
  const NORTH_EUROPE_REGIONS=new Set(['네덜란드','브리튼','독일','동유럽','북유럽','흑해']);
  const IBERIA_REGIONS=new Set(['이베리아']);
  const MEDITERRANEAN_REGIONS=new Set(['프랑스','이탈리아','발칸']);
  const AMERICA_REGIONS=new Set(['서인도제도','중앙아메리카','남동아메리카','남서아메리카']);

  function normalizeLongitude(value){
    let lon=Number(value)||0;
    while(lon>180)lon-=360;
    while(lon<-180)lon+=360;
    return lon;
  }

  function cityTrack(city){
    const region=String(city?.region||city?.currentCityRegion||'');
    const country=String(city?.countryCode||'').toUpperCase();
    if(country==='JP')return 'city_japan';
    if(country==='CN'||country==='MO'||country==='KR')return 'city_china';
    if(AMERICA_REGIONS.has(region))return 'city_america';
    if(SOUTHEAST_ASIA_REGIONS.has(region))return 'city_southeast_asia';
    if(region==='인도')return 'city_india';
    if(AFRICA_REGIONS.has(region))return 'city_africa';
    if(MIDDLE_EAST_REGIONS.has(region))return 'city_middle_east';
    if(region==='흑해'&&country==='TR')return 'city_middle_east';
    if(NORTH_EUROPE_REGIONS.has(region))return 'city_scandinavia';
    if(IBERIA_REGIONS.has(region))return 'city_iberia';
    if(MEDITERRANEAN_REGIONS.has(region))return 'city_mediterranean';
    return 'city_mediterranean';
  }

  function seaTrack(position){
    const lat=Number(position?.lat)||0,lon=normalizeLongitude(position?.lon);
    // V72: 현대식 대양 이름으로 사각 분할하지 않고, 원작 곡의 실제 사용 감각을 따른다.
    // Track19: 북극·남극 인근.
    if(lat>=66||lat<=-60)return 'sailing_polar';

    // Track15 Near Europe: 지중해·흑해·북해·발트해와 유럽 서안 근해.
    if(lat>=29&&lat<66&&lon>=-30&&lon<=45)return 'sailing_near_europe';

    // Track24 Pacific Ocean: 원작 설명의 카리브해 남쪽과 남방대륙(호주) 주변.
    const caribbeanSouth=lat>=-5&&lat<14&&lon>=-90&&lon<=-55;
    const southernContinent=lat>-60&&lat<10&&lon>=110;
    const southEastPacific=lat>-60&&lat<-10&&lon<=-70;
    if(caribbeanSouth||southernContinent||southEastPacific)return 'sailing_pacific';

    // Track25 Atlantic Ocean: 원작에서 주로 남대서양에 사용된다.
    const southAtlantic=lat>-60&&lat<12&&lon>-70&&lon<25;
    if(southAtlantic)return 'sailing_atlantic';

    // Track13 Indian Ocean: 인도양뿐 아니라 서태평양, 카리브해 북쪽,
    // 북대서양의 신대륙 항로 등 넓은 원양 구간을 담당한다.
    return 'sailing_indian_ocean';
  }

  function resolveTrack(state){
    if(!state?.joined||state?.waitingForStart)return 'voyage_preparation';
    if(state.mode==='city')return cityTrack(state.city);
    if(state.mode==='land')return 'land_expedition';
    if(state.mode==='sea')return seaTrack(state.position);
    return 'voyage_preparation';
  }

  function safeStorage(storage){
    return storage&&typeof storage.getItem==='function'&&typeof storage.setItem==='function'?storage:null;
  }

  function createController(options={}){
    const AudioCtor=options.AudioCtor||(root&&root.Audio);
    const storage=safeStorage(options.storage||(root&&root.localStorage));
    const basePath=String(options.basePath||'/assets/bgm').replace(/\/$/,'');
    const fadeMs=Math.max(0,Number(options.fadeMs)||850);
    const onStateChange=typeof options.onStateChange==='function'?options.onStateChange:()=>{};
    const raf=(root&&root.requestAnimationFrame)||((fn)=>setTimeout(()=>fn(Date.now()),16));
    const caf=(root&&root.cancelAnimationFrame)||clearTimeout;
    let volume=Math.max(0,Math.min(1,Number(storage?.getItem('uw3-bgm-volume')??.55)));
    if(!Number.isFinite(volume))volume=.55;
    let muted=storage?.getItem('uw3-bgm-muted')==='1';
    let unlocked=false,desiredKey='',currentKey='',loadingKey='',activeIndex=0,fadeHandle=0,transitionToken=0;
    const unavailable=new Set();
    const channels=AudioCtor?[new AudioCtor(),new AudioCtor()]:[];
    for(const audio of channels){audio.loop=true;audio.preload='auto';audio.volume=0;audio.addEventListener?.('error',()=>{if(loadingKey)unavailable.add(loadingKey)});}

    function targetVolume(){return muted?0:volume}
    function snapshot(){return {volume,muted,unlocked,desiredKey,currentKey,label:TRACKS[currentKey||desiredKey]?.label||'배경음악',unavailable:[...unavailable]}}
    function notify(){onStateChange(snapshot())}
    function store(){try{storage?.setItem('uw3-bgm-volume',String(volume));storage?.setItem('uw3-bgm-muted',muted?'1':'0')}catch{}}
    function stopFade(){if(fadeHandle){caf(fadeHandle);fadeHandle=0}}
    function setChannelVolumes(){const target=targetVolume();channels.forEach((audio,index)=>{audio.volume=index===activeIndex?target:0})}

    async function transitionTo(key){
      if(!unlocked||!TRACKS[key]||!channels.length||unavailable.has(key))return;
      if(currentKey===key&&!channels[activeIndex].paused){setChannelVolumes();notify();return;}
      if(loadingKey===key)return;
      const token=++transitionToken;loadingKey=key;stopFade();
      const fromIndex=currentKey?activeIndex:-1,toIndex=currentKey?1-activeIndex:activeIndex;
      const from=fromIndex>=0?channels[fromIndex]:null,to=channels[toIndex],track=TRACKS[key];
      try{
        to.pause();to.currentTime=0;to.src=`${basePath}/${track.file}`;to.loop=true;to.volume=0;to.load?.();
        await Promise.resolve(to.play());
      }catch{
        if(token===transitionToken){unavailable.add(key);loadingKey='';notify();}
        return;
      }
      if(token!==transitionToken){to.pause();return;}
      const started=(root&&root.performance?.now?.())||Date.now();
      const step=(now)=>{
        if(token!==transitionToken)return;
        const elapsed=Math.max(0,now-started),ratio=fadeMs?Math.min(1,elapsed/fadeMs):1,target=targetVolume();
        to.volume=target*ratio;if(from)from.volume=target*(1-ratio);
        if(ratio<1){fadeHandle=raf(step);return;}
        fadeHandle=0;if(from){from.pause();from.currentTime=0;from.removeAttribute?.('src');from.load?.();}
        activeIndex=toIndex;currentKey=key;loadingKey='';notify();
      };
      fadeHandle=raf(step);
    }

    function request(key){
      if(!TRACKS[key])return false;
      desiredKey=key;notify();
      if(unlocked)transitionTo(key);
      return true;
    }
    function unlock(){
      if(unlocked)return;
      unlocked=true;notify();
      if(desiredKey)transitionTo(desiredKey);
    }
    function setVolume(next){
      volume=Math.max(0,Math.min(1,Number(next)||0));store();setChannelVolumes();notify();
    }
    function setMuted(next){muted=!!next;store();setChannelVolumes();notify()}
    function toggleMuted(){setMuted(!muted)}
    function retryUnavailable(){unavailable.clear();if(desiredKey&&unlocked)transitionTo(desiredKey)}
    function destroy(){transitionToken++;stopFade();for(const audio of channels){audio.pause();audio.removeAttribute?.('src');audio.load?.()}currentKey='';desiredKey='';}

    notify();
    return {request,unlock,setVolume,setMuted,toggleMuted,retryUnavailable,destroy,getState:snapshot};
  }

  return Object.freeze({TRACKS,cityTrack,seaTrack,resolveTrack,createController});
});
