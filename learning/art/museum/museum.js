(function () {
  'use strict';
  if (!window.THREE || !window.MUSEUM_ROOMS) {
    document.body.innerHTML = '<p style="padding:30px;color:white">미술관 파일을 불러오지 못했습니다.</p>';
    return;
  }

  const canvas = document.getElementById('museum-canvas');
  const roomTabs = document.getElementById('room-tabs');
  const loading = document.getElementById('loading');
  const loadingBar = document.getElementById('loading-bar');
  const loadingText = document.getElementById('loading-text');
  const prompt = document.getElementById('art-prompt');
  const promptTitle = document.getElementById('prompt-title');
  const promptKicker = document.getElementById('prompt-kicker');
  const promptAction = document.getElementById('prompt-action');
  const progressEl = document.getElementById('room-progress');
  const modal = document.getElementById('art-modal');
  const helpModal = document.getElementById('help-modal');
  const finaleModal = document.getElementById('finale-modal');
  const finaleQuestionWrap = document.getElementById('finale-question-wrap');
  const finaleComplete = document.getElementById('finale-complete');
  const finaleOptions = document.getElementById('finale-options');
  const finaleFeedback = document.getElementById('finale-feedback');
  const finaleNext = document.getElementById('finale-next');
  const rooms = window.MUSEUM_ROOMS;
  const presenceEl = document.getElementById('class-presence');

  const ROOM_QUIZZES = {
    portrait:{
      intro:'얼굴과 자세, 빛을 얼마나 세심하게 보았는지 마지막 세 장면으로 확인해 보세요.',
      questions:[
        {q:'〈진주 귀걸이를 한 소녀〉의 얼굴을 드러내는 빛은 주로 어느 쪽에서 올까요?',options:['화면 왼쪽 위','화면 오른쪽 아래','인물의 등 뒤'],answer:0,explain:'왼쪽 위에서 들어온 빛이 이마와 뺨, 진주를 차례로 밝혀요.'},
        {q:'윤두서의 〈자화상〉에서 화면의 긴장을 가장 강하게 만드는 부분은 무엇일까요?',options:['화려한 배경','정면을 응시하는 눈','손에 든 책'],answer:1,explain:'몸과 배경을 거의 생략하고 정면의 눈빛에 정신과 기운을 집중했어요.'},
        {q:'〈모나리자〉의 인물이 안정적으로 보이는 데 가장 크게 기여하는 자세는 무엇일까요?',options:['가지런히 포갠 두 손','높이 든 양팔','옆으로 뻗은 다리'],answer:0,explain:'화면 아래 포개진 두 손이 피라미드형 구도를 단단하게 받쳐 줘요.'}
      ]
    },
    nature:{
      intro:'빛과 계절, 자연을 표현한 붓질 속에서 발견한 것을 세 가지 관찰로 되짚어 보세요.',
      questions:[
        {q:'반 고흐의 〈별이 빛나는 밤〉에서 밤하늘의 움직임을 만드는 핵심은 무엇일까요?',options:['곧고 얇은 격자','소용돌이치는 붓질','완전히 평평한 검정'],answer:1,explain:'굽이치며 반복되는 붓질이 별빛과 하늘 전체를 움직이는 것처럼 보여 줘요.'},
        {q:'모네의 〈수련〉 연작은 주로 어디를 바라본 시점일까요?',options:['하늘 높이 위쪽','멀리 있는 산 정상','가까운 연못 수면'],answer:2,explain:'연못을 내려다보며 물 위 수련과 하늘의 반사를 한 화면에 담았어요.'},
        {q:'정선의 〈인왕제색도〉에서 비 갠 산의 묵직한 기운을 강조한 재료는 무엇일까요?',options:['짙고 옅은 먹','금박과 은박','파스텔 가루'],answer:0,explain:'번지고 겹쳐진 먹의 농담이 젖은 바위와 피어오르는 안개를 표현해요.'}
      ]
    },
    story:{
      intro:'장면 속 인물과 시선, 사건의 앞뒤를 떠올리며 이야기의 단서를 다시 찾아보세요.',
      questions:[
        {q:'신윤복의 〈단오풍정〉에서 여러 장면을 차례로 살피게 하는 시선의 흐름은 무엇일까요?',options:['한가운데의 완전한 대칭','위아래를 오가는 지그재그','한 점에 멈춘 원'],answer:1,explain:'그네와 냇가의 여러 무리가 지그재그로 이어지며 화면 곳곳을 보게 해요.'},
        {q:'〈아담의 창조〉에서 가장 큰 긴장을 만드는 작은 공간은 어디일까요?',options:['두 손가락 사이','구름 아래의 산','화면 양끝의 벽'],answer:0,explain:'거의 닿을 듯 남겨 둔 손가락 사이의 틈이 생명이 전해질 순간을 강조해요.'},
        {q:'김정희의 〈세한도〉에서 변치 않는 마음을 상징하는 것은 무엇일까요?',options:['활짝 핀 장미','소나무와 잣나무','화려한 궁궐'],answer:1,explain:'추운 겨울에도 푸른 나무에 어려운 때에도 변하지 않는 마음을 담았어요.'}
      ]
    },
    shape:{
      intro:'선과 색, 반복과 변형이 어떻게 생각으로 바뀌었는지 세 가지 조형 단서로 확인해 보세요.',
      questions:[
        {q:'몬드리안의 화면을 나누는 두 가지 기본 방향은 무엇일까요?',options:['수직과 수평','나선과 물결','원과 타원'],answer:0,explain:'수직·수평의 검은 선과 기본색 면만으로 비대칭의 균형을 만들었어요.'},
        {q:'쇠라의 〈그랑드 자트 섬의 일요일 오후〉에서 멀리 볼수록 하나의 색처럼 섞이는 것은?',options:['작은 색점','굵은 연필선','금속 조각'],answer:0,explain:'서로 다른 순수한 색점을 나란히 찍어 관람자의 눈에서 색이 섞이게 했어요.'},
        {q:'마그리트의 〈이미지의 배반〉이 “이것은 파이프가 아니다”라고 말하는 이유는?',options:['파이프가 너무 작아서','그림은 실제 물건이 아니어서','화가가 제목을 잊어서'],answer:1,explain:'그림 속 파이프는 실제로 사용할 수 있는 물건이 아니라 파이프의 이미지예요.'}
      ]
    },
    space:{
      intro:'조각의 부피와 거대한 그림 속 깊이를 몸으로 경험했는지 마지막 공간 단서를 찾아보세요.',
      questions:[
        {q:'로댕의 〈생각하는 사람〉 원작 대형 주조본의 재료는 무엇일까요?',options:['청동','종이','유리'],answer:0,explain:'거친 표면과 묵직한 근육을 청동으로 주조해 강한 에너지를 만들었어요.'},
        {q:'〈최후의 만찬〉의 원근선이 모이는 중심은 어디일까요?',options:['예수의 머리 뒤','왼쪽 문 끝','식탁 아래'],answer:0,explain:'벽과 천장의 선이 예수의 머리 뒤 소실점으로 모여 중심과 깊이를 함께 만들어요.'},
        {q:'〈밀로의 비너스〉가 부드럽게 움직이는 것처럼 보이는 까닭은?',options:['몸 전체가 완전한 직선이라서','어깨와 골반이 반대로 기울어서','좌우가 완벽히 대칭이라서'],answer:1,explain:'한쪽 다리에 무게를 싣고 어깨와 골반을 반대로 기울인 자세가 S자 흐름을 만들어요.'}
      ]
    }
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x191613);
  scene.fog = new THREE.FogExp2(0x211d19, 0.014);

  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.08, 130);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.68, 6.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new THREE.GLTFLoader();
  const textureCache = new Map();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const centerPointer = new THREE.Vector2(0,0);
  const clock = new THREE.Clock();
  const keys = Object.create(null);
  const clickable = [];
  const sculptureObstacles = [];
  const remotePeople = new Map();
  const remoteLayer = new THREE.Group(); scene.add(remoteLayer);
  const selfAvatar = makeSelfAvatar(); scene.add(selfAvatar);
  let presenceSocket = null, presenceTimer = 0, localPresenceId = null, presenceScope = 'class';
  const tmpDirection = new THREE.Vector3();
  const tmpRight = new THREE.Vector3();
  const velocity = new THREE.Vector3();
  let gallery = null;
  let activeRoom = 0;
  let yaw = 0;
  let pitch = -0.015;
  let dragging = false;
  let pointerDown = null;
  let nearest = null;
  let finaleSurface = null;
  let finaleQuizRoom = null;
  let finaleQuizIndex = 0;
  let loadTotal = 12;
  let loadDone = 0;
  let roomLoadVersion = 0;

  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const GALLERY_START = 8;
  const GALLERY_END = -30;
  const avatarColors=[0x547da6,0x9d5b4c,0x5a896a,0x886ca5];
  function avatarColor(value){const text=String(value||'');let hash=0;for(let i=0;i<text.length;i++)hash=(hash*31+text.charCodeAt(i))>>>0;return avatarColors[hash%avatarColors.length];}

  function personLabel(name){const c=document.createElement('canvas');c.width=300;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(9,7,5,.82)';g.fillRect(0,4,300,52);g.strokeStyle='#d6b66b';g.strokeRect(1,5,298,50);g.fillStyle='#fff0ca';g.textAlign='center';g.font='bold 25px sans-serif';g.fillText(name,150,39);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));}
  function makeSelfAvatar(){
    const group=new THREE.Group();
    const cloth=new THREE.MeshStandardMaterial({color:0x547da6,roughness:.72});
    const skin=new THREE.MeshStandardMaterial({color:0xe2ad88,roughness:.82});
    const hair=new THREE.MeshStandardMaterial({color:0x241a15,roughness:.92});
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(.2,.27,.58,14),cloth);torso.position.y=.94;
    const shoulders=new THREE.Mesh(new THREE.BoxGeometry(.58,.16,.22),cloth);shoulders.position.set(0,1.17,0);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.13,12),skin);neck.position.y=1.3;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.19,18,14),skin);head.position.y=1.47;
    const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.198,18,10,0,Math.PI*2,0,Math.PI*.58),hair);hairCap.position.set(0,1.5,.005);
    const leftArm=new THREE.Mesh(new THREE.CylinderGeometry(.065,.075,.48,10),cloth);leftArm.position.set(-.28,.92,0);leftArm.rotation.z=-.08;
    const rightArm=leftArm.clone();rightArm.position.x=.28;rightArm.rotation.z=.08;
    group.add(torso,shoulders,neck,head,hairCap,leftArm,rightArm);
    group.userData.cloth=cloth;
    group.scale.setScalar(.72);
    group.traverse(part=>{if(part.isMesh){part.castShadow=false;part.receiveShadow=false;part.renderOrder=3;}});
    return group;
  }
  function makePerson(visitor){const g=new THREE.Group(), cloth=new THREE.MeshStandardMaterial({color:avatarColor(visitor.userId),roughness:.7,transparent:true,opacity:.86});const skin=new THREE.MeshStandardMaterial({color:0xe4b18d,roughness:.8,transparent:true,opacity:.86});const head=new THREE.Mesh(new THREE.SphereGeometry(.17,16,12),skin);head.position.y=1.38;const body=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,.54,12),cloth);body.position.y=.93;const leg=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,.42,10),new THREE.MeshStandardMaterial({color:0x23252c,transparent:true,opacity:.86}));leg.position.set(-.09,.42,0);const leg2=leg.clone();leg2.position.x=.09;g.add(head,body,leg,leg2);const label=personLabel(visitor.name);label.position.y=1.78;label.scale.set(.9,.19,1);g.add(label);remoteLayer.add(g);return g;}
  function updatePeople(visitors){const visible=visitors.filter(v=>v.userId!==localPresenceId);const ids=new Set(visible.map(v=>v.userId));for(const [id,entry] of remotePeople){if(!ids.has(id)){remoteLayer.remove(entry.group);remotePeople.delete(id);}}for(const v of visible){let entry=remotePeople.get(v.userId);if(!entry){entry={group:makePerson(v)};remotePeople.set(v.userId,entry);}entry.room=v.room;entry.x=v.x;entry.z=v.z;entry.yaw=v.yaw;entry.group.position.set(v.x,0,v.z);entry.group.rotation.y=v.yaw;entry.group.visible=v.room===rooms[activeRoom].id;}}
  async function connectClassPresence(){try{const name=String(localStorage.getItem('classPlayerName')||'').trim();let clientId=localStorage.getItem('museumPresenceClientId');if(!clientId){clientId=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem('museumPresenceClientId',clientId);}const query=new URLSearchParams({name,clientId});const response=await fetch(`/api/museum/presence-ticket?${query}`);if(!response.ok)return;const payload=await response.json();presenceScope=payload.scope||'class';const proto=location.protocol==='https:'?'wss':'ws';presenceSocket=new WebSocket(`${proto}://${location.host}`);presenceSocket.addEventListener('open',()=>presenceSocket.send(JSON.stringify({type:'MUSEUM_JOIN',ticket:payload.ticket})));presenceSocket.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.type==='MUSEUM_JOINED'){localPresenceId=msg.userId;selfAvatar.userData.cloth.color.setHex(avatarColor(msg.userId));}if(msg.type==='MUSEUM_STATE'){updatePeople(msg.visitors);const here=msg.visitors.filter(v=>v.room===rooms[activeRoom].id).length;presenceEl.textContent=presenceScope==='open'?`함께 관람 중 ${here}명`:`우리 반 함께 관람 중 ${here}명`;presenceEl.hidden=false;}});}catch(_) {}}
  function sendPresence(){if(!presenceSocket||presenceSocket.readyState!==WebSocket.OPEN)return;const now=performance.now();if(now-presenceTimer<100)return;presenceTimer=now;presenceSocket.send(JSON.stringify({type:'MUSEUM_MOVE',room:rooms[activeRoom].id,x:camera.position.x,z:camera.position.z,yaw}));}

  function surfaceTexture(path,repeatX,repeatY,color=true) {
    const texture=textureLoader.load(path);
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(repeatX,repeatY);
    texture.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
    if(color)texture.encoding=THREE.sRGBEncoding;
    return texture;
  }

  const floorAlbedo=surfaceTexture('assets/textures/walnut-floor-albedo.webp?v=2',4,12.5);
  const floorBump=surfaceTexture('assets/textures/walnut-floor-bump.webp?v=2',4,12.5,false);
  const wallAlbedo=surfaceTexture('assets/textures/charcoal-fabric-albedo.webp?v=2',12,6);
  const wallBump=surfaceTexture('assets/textures/charcoal-fabric-bump.webp?v=2',12,6,false);
  const plasterAlbedo=surfaceTexture('assets/textures/warm-plaster-albedo.webp?v=2',2.4,7.2);
  const plasterBump=surfaceTexture('assets/textures/warm-plaster-bump.webp?v=2',2.4,7.2,false);
  const materials = {
    wall:new THREE.MeshStandardMaterial({map:wallAlbedo,bumpMap:wallBump,bumpScale:.004,color:0xf0ece8,roughness:.94,metalness:0}),
    wallInset:new THREE.MeshStandardMaterial({map:wallAlbedo,bumpMap:wallBump,bumpScale:.003,color:0xa19b95,roughness:.96,metalness:0}),
    walnut:new THREE.MeshStandardMaterial({map:floorAlbedo,bumpMap:floorBump,bumpScale:.022,color:0xf0e5d8,roughness:.59,metalness:.01,emissive:0x100a06,emissiveIntensity:.1}),
    ceiling:new THREE.MeshStandardMaterial({map:plasterAlbedo,bumpMap:plasterBump,bumpScale:.0025,color:0xa99b8c,roughness:.94,metalness:0,emissive:0x6f5d4a,emissiveMap:plasterAlbedo,emissiveIntensity:.48}),
    brass:new THREE.MeshStandardMaterial({color:0xa77b3e,roughness:.34,metalness:.68}),
    darkBrass:new THREE.MeshStandardMaterial({color:0x4b3928,roughness:.52,metalness:.42}),
    black:new THREE.MeshStandardMaterial({color:0x181512,roughness:.76}),
    stone:new THREE.MeshStandardMaterial({color:0x8a8176,roughness:.72,metalness:.025})
  };

  function mesh(box, mat, position, parent=gallery) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(...box),mat);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }

  function makeLabel(title, artist, width=2.4) {
    const c=document.createElement('canvas');c.width=768;c.height=168;const g=c.getContext('2d');
    g.fillStyle='#12100e';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#9f7c3d';g.lineWidth=3;g.strokeRect(4,4,c.width-8,c.height-8);
    g.fillStyle='#f2e5c9';g.font='700 35px sans-serif';g.fillText(title.length>18?title.slice(0,17)+'…':title,34,65);
    g.fillStyle='#ad9871';g.font='24px sans-serif';g.fillText(artist,34,112);g.fillStyle='#c9a65a';g.fillRect(34,135,76,3);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width*168/768),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));
    return m;
  }

  function readFinaleProgress() {
    try{return JSON.parse(localStorage.getItem('museumFinaleRooms')||'{}')||{};}catch(_){return {};}
  }

  function writeFinaleProgress(progress) {
    try{localStorage.setItem('museumFinaleRooms',JSON.stringify(progress));}catch(_){}
  }

  function finaleTexture(room) {
    const c=document.createElement('canvas');c.width=1400;c.height=860;const g=c.getContext('2d');
    const complete=Boolean(readFinaleProgress()[room.id]);
    const grad=g.createRadialGradient(700,300,20,700,390,760);grad.addColorStop(0,complete?'#382b17':'#282017');grad.addColorStop(1,'#0c0b09');
    g.fillStyle=grad;g.fillRect(0,0,c.width,c.height);
    g.strokeStyle=complete?'#d5b565':'#806735';g.lineWidth=3;g.strokeRect(28,28,c.width-56,c.height-56);
    g.strokeStyle='rgba(211,177,101,.23)';g.lineWidth=1;g.strokeRect(48,48,c.width-96,c.height-96);
    g.textAlign='center';g.fillStyle='#b89954';g.font='700 22px Georgia';g.letterSpacing='8px';g.fillText("CURATOR'S FINAL WALL",700,142);
    g.fillStyle='#eadcbf';g.font='700 82px serif';g.fillText(`${room.number}. ${room.title}`,700,282);
    g.fillStyle='#9f917e';g.font='32px sans-serif';g.fillText(room.subtitle,700,346);
    g.beginPath();g.arc(700,486,72,0,Math.PI*2);g.strokeStyle=complete?'#e1c778':'#9a7a3b';g.lineWidth=3;g.stroke();
    g.beginPath();g.arc(700,486,59,0,Math.PI*2);g.strokeStyle='rgba(211,177,101,.3)';g.lineWidth=2;g.stroke();
    g.fillStyle=complete?'#f0d88d':'#c6a55c';g.font='700 56px Georgia';g.fillText(complete?'✓':'M',700,505);
    g.fillStyle=complete?'#dbc27c':'#d0b577';g.font='700 27px sans-serif';g.fillText(complete?'관찰 미션 완료':'관람을 마무리하는 3가지 관찰',700,628);
    g.fillStyle='#8d806d';g.font='24px sans-serif';g.fillText(complete?'클릭하면 다시 도전할 수 있어요':'가까이에서 클릭해 어린이 큐레이터 도전을 시작하세요',700,681);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData={finaleTexture:true};return t;
  }

  function addFinaleWall(room,shell) {
    const grand=room.id==='space',panelW=grand?7.1:5.8,panelH=grand?2.45:3.65,panelY=grand?6.42:3.25,z=GALLERY_END+.38;
    const group=new THREE.Group();gallery.add(group);
    mesh([panelW+.62,panelH+.62,.18],materials.black,[0,panelY,z-.08],group);
    mesh([panelW+.76,.11,.24],materials.brass,[0,panelY+(panelH+.7)/2,z],group);
    mesh([panelW+.76,.11,.24],materials.brass,[0,panelY-(panelH+.7)/2,z],group);
    mesh([.11,panelH+.58,.24],materials.brass,[-(panelW+.64)/2,panelY,z],group);
    mesh([.11,panelH+.58,.24],materials.brass,[(panelW+.64)/2,panelY,z],group);
    const mat=new THREE.MeshBasicMaterial({map:finaleTexture(room),toneMapped:false});
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(panelW,panelH),mat);panel.position.set(0,panelY,z+.13);panel.userData.finaleRoom=room;group.add(panel);clickable.push(panel);finaleSurface=panel;
    for(const side of [-1,1]){
      const lamp=mesh([.18,.28,.18],materials.darkBrass,[side*(panelW/2+.72),panelY+.45,z+.2],group);
      lamp.rotation.z=side*.12;
      const glow=new THREE.PointLight(0xffc56f,grand?26:18,4.2,2);glow.position.set(side*(panelW/2+.58),panelY+.15,z+1);gallery.add(glow);
    }
    const wash=new THREE.SpotLight(0xffce84,grand?62:42,8,Math.PI*.25,.75,1.5);wash.position.set(0,Math.min(shell.height-.35,panelY+2.1),z+2.5);wash.target.position.set(0,panelY,z);gallery.add(wash,wash.target);
  }

  function refreshFinaleWall() {
    if(!finaleSurface)return;
    const old=finaleSurface.material.map;
    finaleSurface.material.map=finaleTexture(finaleSurface.userData.finaleRoom);
    finaleSurface.material.needsUpdate=true;
    if(old?.userData?.finaleTexture)old.dispose();
  }

  function completedFinaleCount() {
    const progress=readFinaleProgress();return rooms.filter(room=>progress[room.id]).length;
  }

  function showFinaleCompletion(room,newlyCompleted=false) {
    const progress=readFinaleProgress();progress[room.id]=true;writeFinaleProgress(progress);refreshFinaleWall();
    finaleQuestionWrap.hidden=true;finaleComplete.hidden=false;
    document.getElementById('finale-step').textContent='GALLERY COMPLETE';
    document.getElementById('finale-progress').style.width='100%';
    document.getElementById('finale-total').textContent=`${completedFinaleCount()} / ${rooms.length} ROOMS`;
    document.getElementById('finale-stamp-number').textContent=room.number;
    document.getElementById('finale-complete-title').textContent=newlyCompleted?'관찰의 눈을 얻었어요':'이미 획득한 큐레이터 도장이에요';
    document.getElementById('finale-complete-copy').textContent=completedFinaleCount()===rooms.length?'다섯 전시실의 관찰을 모두 마쳤어요. 이제 이 미술관의 어린이 큐레이터입니다.':`${room.title} 전시실의 작품을 세심하게 관찰했다는 표시예요.`;
  }

  function renderFinaleQuestion() {
    const set=ROOM_QUIZZES[finaleQuizRoom.id],item=set.questions[finaleQuizIndex];
    finaleQuestionWrap.hidden=false;finaleComplete.hidden=true;finaleNext.hidden=true;
    finaleFeedback.textContent='정답이라고 생각하는 장면을 골라보세요.';finaleFeedback.className='finale-feedback';
    document.getElementById('finale-step').textContent=`QUESTION ${String(finaleQuizIndex+1).padStart(2,'0')} / ${String(set.questions.length).padStart(2,'0')}`;
    document.getElementById('finale-progress').style.width=`${finaleQuizIndex/set.questions.length*100}%`;
    document.getElementById('finale-total').textContent=`${completedFinaleCount()} / ${rooms.length} ROOMS`;
    document.getElementById('finale-question').textContent=item.q;
    finaleOptions.replaceChildren(...item.options.map((label,index)=>{
      const button=document.createElement('button');button.type='button';button.className='finale-option';button.dataset.letter=String.fromCharCode(65+index);button.textContent=label;
      button.addEventListener('click',()=>{
        if(index!==item.answer){button.disabled=true;button.classList.add('wrong');finaleFeedback.textContent='조금 다르게 보였어요. 작품의 빛·선·자세를 다시 떠올려 보세요.';return;}
        [...finaleOptions.children].forEach(option=>option.disabled=true);button.classList.add('correct');finaleFeedback.textContent=item.explain;finaleFeedback.classList.add('correct');finaleNext.hidden=false;window.ClassGameSfx?.play('card');
      });return button;
    }));
  }

  function startFinaleQuiz(room) {
    finaleQuizRoom=room;finaleQuizIndex=0;
    document.getElementById('finale-kicker').textContent=`GALLERY ${room.number} · CURATOR'S FINAL WALL`;
    document.getElementById('finale-title').textContent=`${room.title} · 관람의 마지막 장면`;
    document.getElementById('finale-intro').textContent=ROOM_QUIZZES[room.id].intro;
    renderFinaleQuestion();
  }

  function showFinale(room) {
    window.ClassGameSfx?.play('card');keysClear();
    document.getElementById('finale-kicker').textContent=`GALLERY ${room.number} · CURATOR'S FINAL WALL`;
    document.getElementById('finale-title').textContent=`${room.title} · 관람의 마지막 장면`;
    document.getElementById('finale-intro').textContent=ROOM_QUIZZES[room.id].intro;
    finaleQuizRoom=room;
    if(readFinaleProgress()[room.id])showFinaleCompletion(room);
    else startFinaleQuiz(room);
    finaleModal.showModal();
  }

  function getDisplaySize(work) {
    const w=work.size.w||60,h=work.size.h||90,aspect=w/h;
    // 원작 비율과 작품 간 크기 차이는 유지하되, 높은 전시 벽에서 너무 작아 보이지 않도록
    // 관람용 축척과 최소 전시 크기를 적용한다.
    let dw=w*.0215, dh=h*.0215;
    const minLong=1.35;
    if(Math.max(dw,dh)<minLong){const grow=minLong/Math.max(dw,dh);dw*=grow;dh*=grow;}
    const maxW=work.type==='mural'?4.7:4.35, maxH=3.65;
    const shrink=Math.min(1,maxW/dw,maxH/dh);dw*=shrink;dh*=shrink;
    return {w:Math.max(.32,dw),h:Math.max(.32,dh),aspect};
  }

  function placeholderTexture(title) {
    const c=document.createElement('canvas');c.width=512;c.height=640;const g=c.getContext('2d');
    const grad=g.createLinearGradient(0,0,512,640);grad.addColorStop(0,'#3b3023');grad.addColorStop(1,'#17130f');g.fillStyle=grad;g.fillRect(0,0,512,640);
    g.strokeStyle='#a58140';g.lineWidth=3;g.strokeRect(28,28,456,584);g.fillStyle='#d4bc83';g.textAlign='center';g.font='700 28px serif';
    const words=title.split(' ');words.forEach((x,i)=>g.fillText(x,256,286+i*40));g.font='18px sans-serif';g.fillStyle='#8c795a';g.fillText('이미지를 준비하고 있어요',256,520);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
  }

  function fitArtworkPlane(texture,plane,targetAspect) {
    const img=texture.image;if(!img)return;const imageAspect=img.width/img.height;
    texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.repeat.set(1,1);texture.offset.set(0,0);
    plane.scale.set(1,1,1);
    if(imageAspect>targetAspect)plane.scale.y=targetAspect/imageAspect;
    else plane.scale.x=imageAspect/targetAspect;
    texture.encoding=THREE.sRGBEncoding;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
  }

  function isCurrentRoomLoad(version,roomGallery) {
    return version===roomLoadVersion&&gallery===roomGallery;
  }

  function loadArtTexture(work,material,plane,aspect,version,roomGallery,transparent=false) {
    const cached=textureCache.get(work.image);
    if(cached){if(isCurrentRoomLoad(version,roomGallery)){fitArtworkPlane(cached,plane,aspect);material.map=cached;material.needsUpdate=true;markLoaded(version,roomGallery);}return;}
    textureLoader.load(work.image,(t)=>{
      textureCache.set(work.image,t);
      if(!isCurrentRoomLoad(version,roomGallery))return;
      fitArtworkPlane(t,plane,aspect);material.map=t;material.needsUpdate=true;markLoaded(version,roomGallery);
    },undefined,()=>{
      if(!isCurrentRoomLoad(version,roomGallery))return;
      material.map=placeholderTexture(work.title);material.needsUpdate=true;markLoaded(version,roomGallery);
    });
    material.transparent=transparent;
  }

  function markLoaded(version,roomGallery){
    if(!isCurrentRoomLoad(version,roomGallery))return;
    loadDone++;const pct=Math.round(loadDone/loadTotal*100);loadingBar.style.width=pct+'%';loadingText.textContent=pct+'%';
    if(loadDone>=loadTotal)setTimeout(()=>{if(isCurrentRoomLoad(version,roomGallery))loading.classList.add('done');},420);
  }

  function buildShell(room) {
    const isGrand=room.id==='space';
    const width=isGrand?17.2:11.6,length=GALLERY_START-GALLERY_END,height=isGrand?8.4:6.4,centerZ=(GALLERY_START+GALLERY_END)/2;
    const wallCenterY=height/2-.1,wallSurfaceY=height/2+.05;
    mesh([width,.18,length],materials.walnut,[0,-.09,centerZ]);
    mesh([width,.18,length],materials.ceiling,[0,height+.1,centerZ]);
    mesh([.28,height,length],materials.wallInset,[-width/2,wallCenterY,centerZ]);
    mesh([.28,height,length],materials.wallInset,[width/2,wallCenterY,centerZ]);
    mesh([width,height,.3],materials.wallInset,[0,wallCenterY,GALLERY_END]);
    mesh([width,height,.22],materials.wallInset,[0,wallCenterY,7]);

    const leftFabric=new THREE.Mesh(new THREE.PlaneGeometry(length,height-1.05),materials.wall);
    leftFabric.position.set(-width/2+.145,wallSurfaceY,centerZ);leftFabric.rotation.y=Math.PI/2;leftFabric.receiveShadow=true;gallery.add(leftFabric);
    const rightFabric=leftFabric.clone();rightFabric.position.x=width/2-.145;rightFabric.rotation.y=-Math.PI/2;gallery.add(rightFabric);
    const endFabric=new THREE.Mesh(new THREE.PlaneGeometry(width-.55,height-1.05),materials.wall);
    endFabric.position.set(0,wallSurfaceY,GALLERY_END+.16);endFabric.receiveShadow=true;gallery.add(endFabric);

    for(const side of [-1,1]){
      const x=side*(width/2-.13);
      mesh([.1,.2,length],materials.darkBrass,[x,.34,centerZ]);
      mesh([.08,.08,length],materials.brass,[x-side*.025,.47,centerZ]);
      for(let z=4.9;z>GALLERY_END;z-=3.35){
        mesh([.035,height-.95,.055],materials.black,[x-side*.17,wallSurfaceY,z]);
      }
    }

    const coveDepth=isGrand?2.25:1.15;
    const centerCeiling=mesh([width-coveDepth*2,.18,length],materials.ceiling,[0,height-.17,centerZ]);centerCeiling.castShadow=false;
    for(const side of [-1,1]){
      const soffitX=side*(width/2-(isGrand?.78:.52));
      const soffit=mesh([isGrand?1.55:1.04,.34,length],materials.ceiling,[soffitX,height-.49,centerZ]);soffit.castShadow=false;
      const bevelWidth=isGrand?2.05:.82;
      const bevel=mesh([bevelWidth,.16,length],materials.ceiling,[side*(width/2-(isGrand?1.72:1.27)),height-.32,centerZ]);bevel.rotation.z=side*(isGrand?.27:.38);bevel.castShadow=false;
      const coveX=side*(width/2-(isGrand?2.55:1.48));
      const coveY=height-(isGrand?.55:.46);
      const cove=mesh([.075,.055,length],new THREE.MeshBasicMaterial({color:0xffd49b,toneMapped:false}),[coveX,coveY,centerZ]);cove.castShadow=false;
      for(let z=5;z>GALLERY_END;z-=4.8){
        const wash=new THREE.SpotLight(0xffd4a0,isGrand?25:18,isGrand?7:5.2,Math.PI*.34,.8,1.55);
        wash.position.set(coveX,coveY-.16,z);
        wash.target.position.set(side*(width/2-.16),height-.95,z);
        gallery.add(wash,wash.target);
      }
    }

    const downlightMat=new THREE.MeshStandardMaterial({color:0x24211e,roughness:.62,metalness:.3});
    const lampMat=new THREE.MeshBasicMaterial({color:0xfff1d7,toneMapped:false});
    for(let z=3.8;z>GALLERY_END;z-=4.5){
      for(const x of isGrand?[-2.2,2.2]:[-1.45,1.45]){
        const ring=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.035,24),downlightMat);ring.position.set(x,height-.295,z);gallery.add(ring);
        const lens=new THREE.Mesh(new THREE.CircleGeometry(.072,20),lampMat);lens.position.set(x,height-.316,z);lens.rotation.x=Math.PI/2;gallery.add(lens);
        const light=new THREE.SpotLight(0xffe4bf,isGrand?27:21,isGrand?10:8,Math.PI*.23,.8,1.65);
        light.position.set(x,height-.45,z);light.target.position.set(x,0,z);gallery.add(light,light.target);
      }
    }
    const ambient=new THREE.HemisphereLight(0xe9dece,0x3a2a20,isGrand?.72:.82);gallery.add(ambient);
    const entrance=new THREE.Group();gallery.add(entrance);
    const entryHeight=isGrand?6.55:5;
    mesh([2.2,entryHeight,.5],materials.wallInset,[-(width/2-1.1),entryHeight/2,5.7],entrance);mesh([2.2,entryHeight,.5],materials.wallInset,[(width/2-1.1),entryHeight/2,5.7],entrance);mesh([width-4.4,1.15,.5],materials.wallInset,[0,entryHeight+.42,5.7],entrance);
    const sign=makeLabel(room.subtitle,`${room.works.length}점의 작품 · 원작 비율 전시`,4.2);sign.position.set(0,isGrand?6.05:4.55,5.4);gallery.add(sign);
    return {width,length,height};
  }

  function frameMaterials(index,type) {
    const palettes=[0x6b421f,0x8a5b28,0x3b2718,0x75502d];
    if(type==='mural')return new THREE.MeshStandardMaterial({color:0x4d4032,roughness:.75,metalness:.08});
    return new THREE.MeshStandardMaterial({color:palettes[index%palettes.length],roughness:.32,metalness:.28});
  }

  function addSpotlight(x,y,z,side,index,target) {
    const spot=new THREE.SpotLight(0xffd29a,62,8.2,Math.PI*.18,.48,1.8);spot.position.set(x-side*.85,Math.min(5.7,y+1.7),z+.05);spot.target=target;spot.castShadow=index%3===0;spot.shadow.mapSize.set(512,512);spot.shadow.bias=-.00015;gallery.add(spot,spot.target);
    const stem=mesh([.08,.08,.8],materials.brass,[x-side*.42,Math.min(5.78,y+1.82),z]);stem.rotation.z=side*Math.PI/2;
    const head=mesh([.24,.18,.34],materials.darkBrass,[x-side*.82,Math.min(5.68,y+1.75),z]);head.rotation.z=side*Math.PI/2;
  }

  function addFramedWork(work,index,side,z,width,version,roomGallery) {
    const display=getDisplaySize(work), group=new THREE.Group();
    const x=side*(width/2-.31);group.position.set(x,3.12,z);group.rotation.y=side<0?Math.PI/2:-Math.PI/2;gallery.add(group);
    const border=work.type==='mural'?.11:clamp(Math.min(display.w,display.h)*.09,.1,.2),depth=work.type==='mural'?.08:.2,mat=frameMaterials(index,work.type);
    const back=mesh([display.w+border*2,display.h+border*2,.09],materials.black,[0,0,-.04],group);back.castShadow=true;
    mesh([display.w+border*2,border,depth],mat,[0,(display.h+border)/2,.08],group);mesh([display.w+border*2,border,depth],mat,[0,-(display.h+border)/2,.08],group);
    mesh([border,display.h,depth],mat,[-(display.w+border)/2,0,.08],group);mesh([border,display.h,depth],mat,[(display.w+border)/2,0,.08],group);
    if(work.type!=='mural'){
      const inner=new THREE.MeshStandardMaterial({color:0xc3a875,roughness:.35,metalness:.35});
      const b=border*.23;mesh([display.w+b*2,b,.08],inner,[0,(display.h+b)/2,.2],group);mesh([display.w+b*2,b,.08],inner,[0,-(display.h+b)/2,.2],group);mesh([b,display.h,.08],inner,[-(display.w+b)/2,0,.2],group);mesh([b,display.h,.08],inner,[(display.w+b)/2,0,.2],group);
    }
    // 작품 이미지는 조명의 입사각 때문에 어두워지지 않도록 자체 색으로 표시한다.
    // 액자와 벽, 바닥에는 기존 스포트라이트가 그대로 반응한다.
    const artMat=new THREE.MeshBasicMaterial({color:0xffffff,map:placeholderTexture(work.title),side:THREE.DoubleSide,toneMapped:false});
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(display.w,display.h),artMat);plane.position.z=.255;plane.userData.work=work;plane.userData.room=rooms[activeRoom];plane.castShadow=true;group.add(plane);clickable.push(plane);loadArtTexture(work,artMat,plane,display.w/display.h,version,roomGallery);
    const label=makeLabel(work.title,work.artist,Math.min(2.3,display.w+border*2));label.position.set(0,-display.h/2-.42,.24);group.add(label);
    const target=new THREE.Object3D();target.position.set(x,3.05,z);addSpotlight(x,3.12+display.h/2,z,side,index,target);
  }

  function sculptureMesh(parent,geometry,material,position,scale=[1,1,1],rotation=[0,0,0]) {
    const part=new THREE.Mesh(geometry,material);part.position.set(...position);part.scale.set(...scale);part.rotation.set(...rotation);part.castShadow=true;part.receiveShadow=true;parent.add(part);return part;
  }

  function ellipsoid(parent,material,position,scale,rotation=[0,0,0]) {
    return sculptureMesh(parent,new THREE.SphereGeometry(1,24,18),material,position,scale,rotation);
  }

  function limb(parent,material,from,to,radius) {
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),length=delta.length();
    const part=sculptureMesh(parent,new THREE.CylinderGeometry(radius*.82,radius,length,16),material,a.clone().add(b).multiplyScalar(.5).toArray());
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return part;
  }

  function buildSculptureModel(work) {
    const model=new THREE.Group();
    const mat=sculptureMaterial(work);

    if(work.id==='d04'){
      const outline=[
        {y:.03,x:.31},{y:.1,x:.34},{y:.24,x:.35},{y:.5,x:.4},
        {y:.9,x:.5},{y:1.3,x:.59},{y:1.55,x:.58},{y:1.72,x:.48},
        {y:1.84,x:.28},{y:1.92,x:.18},{y:2.04,x:.18},{y:2.08,x:.25},
        {y:2.13,x:.25},{y:2.16,x:.18}
      ];
      const delta=outline.slice(0,-1).map((p,i)=>(outline[i+1].x-p.x)/(outline[i+1].y-p.y));
      const slope=outline.map((p,i)=>{
        if(i===0)return delta[0];if(i===outline.length-1)return delta[delta.length-1];
        const before=delta[i-1],after=delta[i];if(before*after<=0)return 0;
        const h0=p.y-outline[i-1].y,h1=outline[i+1].y-p.y;return (h0+h1)/(h0/before+h1/after);
      });
      const profile=[new THREE.Vector2(0,0),new THREE.Vector2(.31,0)];
      for(let i=0;i<outline.length-1;i++){
        const a=outline[i],b=outline[i+1],h=b.y-a.y;
        for(let step=0;step<12;step++){
          const t=step/12,t2=t*t,t3=t2*t;
          const x=(2*t3-3*t2+1)*a.x+(t3-2*t2+t)*h*slope[i]+(-2*t3+3*t2)*b.x+(t3-t2)*h*slope[i+1];
          profile.push(new THREE.Vector2(x,THREE.MathUtils.lerp(a.y,b.y,t)));
        }
      }
      const last=outline[outline.length-1];profile.push(new THREE.Vector2(last.x,last.y));
      const vase=sculptureMesh(model,new THREE.LatheGeometry(profile,160),mat,[0,0,0]);vase.geometry.computeVertexNormals();
    }else if(work.id==='d01'){
      ellipsoid(model,mat,[0,1.34,0],[.42,.56,.32],[.18,0,-.08]);ellipsoid(model,mat,[0,1.98,.22],[.2,.24,.2],[.2,0,0]);
      ellipsoid(model,mat,[0,.72,-.03],[.43,.27,.34]);
      limb(model,mat,[-.28,.83,.04],[-.51,.28,.22],.135);limb(model,mat,[.28,.83,.04],[.52,.28,.21],.135);
      limb(model,mat,[-.51,.28,.22],[-.46,.02,-.23],.11);limb(model,mat,[.52,.28,.21],[.44,.02,-.25],.11);
      limb(model,mat,[-.31,1.58,.04],[-.5,1.03,.25],.105);limb(model,mat,[-.5,1.03,.25],[-.1,.74,.32],.09);
      limb(model,mat,[.31,1.58,.05],[.5,1.15,.29],.105);limb(model,mat,[.5,1.15,.29],[.1,1.81,.37],.082);
    }else if(work.id==='d03'){
      ellipsoid(model,mat,[0,1.28,0],[.38,.7,.27]);ellipsoid(model,mat,[0,2.05,0],[.24,.3,.23]);
      sculptureMesh(model,new THREE.TorusGeometry(.28,.055,10,32),mat,[0,2.3,0],[1,1,1],[Math.PI/2,0,0]);
      limb(model,mat,[-.25,1.55,0],[-.48,.92,.18],.105);limb(model,mat,[-.48,.92,.18],[-.06,.72,.32],.095);
      limb(model,mat,[.25,1.58,0],[.43,1.55,.25],.1);limb(model,mat,[.43,1.55,.25],[.18,2.02,.25],.085);
      limb(model,mat,[-.22,.8,0],[-.5,.38,.16],.16);limb(model,mat,[.24,.82,0],[.58,.78,.22],.15);limb(model,mat,[.58,.78,.22],[.08,.46,.34],.13);
      ellipsoid(model,mat,[0,.28,0],[.66,.24,.48]);
    }else if(work.id==='d06'){
      ellipsoid(model,mat,[-.2,1.28,-.05],[.58,.78,.42],[-.12,0,.08]);ellipsoid(model,mat,[-.24,2.02,0],[.23,.29,.22]);
      sculptureMesh(model,new THREE.ConeGeometry(.95,1.35,32),mat,[0,.68,0],[1,1,.72]);
      ellipsoid(model,mat,[.18,1.25,.25],[.95,.22,.22],[0,0,-.18]);ellipsoid(model,mat,[.92,1.08,.27],[.24,.25,.22]);
      limb(model,mat,[-.42,1.45,.18],[.38,1.28,.35],.12);limb(model,mat,[.35,1.2,.27],[.82,.78,.22],.13);
      limb(model,mat,[.62,1.18,.22],[1.15,.72,.1],.14);limb(model,mat,[-.45,1.17,.2],[-1.02,.72,.08],.14);
    }else{
      const venus=work.id==='d05';
      limb(model,mat,[-.2,0,0],[-.17,.92,0],.17);limb(model,mat,[.2,0,0],[.18,.92,.02],.17);
      if(venus)sculptureMesh(model,new THREE.ConeGeometry(.52,1.15,28),mat,[0,.7,0],[1,1,.7]);
      ellipsoid(model,mat,[0,1.48,0],[.36,.59,.24],venus?[0,0,.08]:[0,0,-.04]);ellipsoid(model,mat,[0,2.14,0],[.18,.22,.18]);
      if(!venus){limb(model,mat,[-.3,1.72,0],[-.5,1.08,.04],.12);limb(model,mat,[.3,1.74,0],[.53,1.25,.12],.12);limb(model,mat,[.53,1.25,.12],[.34,.88,.22],.1);}
    }
    model.rotation.y=(parseInt(work.id.slice(1),10)%2?-.28:.3);return model;
  }

  function sculptureMaterial(work) {
    if(work.id==='d01')return new THREE.MeshStandardMaterial({color:0x38271d,roughness:.3,metalness:.78});
    if(work.id==='d03')return new THREE.MeshStandardMaterial({color:0xa77a2e,roughness:.34,metalness:.72});
    if(work.id==='d04')return new THREE.MeshStandardMaterial({color:0x416f63,roughness:.3,metalness:.03});
    return new THREE.MeshStandardMaterial({color:0xbab2a5,roughness:.58,metalness:.02});
  }

  const sculptureScans={
    d01:'assets/models/thinker.glb',
    d02:'assets/models/david.glb',
    d05:'assets/models/venus-de-milo.glb',
    d06:'assets/models/pieta.glb',
    d13:'assets/models/gwanghwamun-haetae.glb'
  };

  function disposeDetachedModel(model) {
    model.traverse(part=>{
      if(part.geometry)part.geometry.dispose();
      const modelMaterials=Array.isArray(part.material)?part.material:[part.material];
      modelMaterials.filter(Boolean).forEach(material=>{
        Object.values(material).forEach(value=>{if(value&&value.isTexture)value.dispose();});
        material.dispose();
      });
    });
  }

  function installSculptureModel(model,group,work,artH,pedestalTop,isScan=false) {
    if(isScan){
      model.matrixAutoUpdate=true;
      model.rotation.y=Number.isFinite(work.modelRotationY)?work.modelRotationY:work.id==='d01'?.16:work.id==='d02'?-1.48:work.id==='d05'?Math.PI:.08;
      const material=work.preserveMaterials?null:sculptureMaterial(work);
      model.traverse(part=>{
        if(!part.isMesh)return;
        part.geometry.computeVertexNormals();
        if(material)part.material=material;
        else if(work.materialTint&&part.material){
          part.material=part.material.clone();
          part.material.color.multiply(new THREE.Color(work.materialTint));
          part.material.roughness=Math.max(.7,part.material.roughness||0);
          part.material.metalness=0;
        }
      });
    }
    group.add(model);
    const bounds=new THREE.Box3().setFromObject(model),naturalH=Math.max(.01,bounds.max.y-bounds.min.y),modelScale=artH/naturalH;
    model.scale.setScalar(modelScale);
    if(work.centerModel){
      const center=bounds.getCenter(new THREE.Vector3());
      model.position.x=-center.x*modelScale;
      model.position.z=-center.z*modelScale;
    }
    model.position.y=pedestalTop-bounds.min.y*modelScale;
    if(work.applyRoomOffset)model.position.z+=group.userData.placementZ;
    model.updateMatrix();
    model.traverse(part=>{if(part.isMesh){part.userData.work=work;part.userData.room=rooms[activeRoom];part.castShadow=true;part.receiveShadow=true;clickable.push(part);}});
  }

  function addSculpture(work,index,z,version,roomGallery) {
    const isGrand=rooms[activeRoom].id==='space';
    const placementZ=z, placementX=work.applyRoomOffset?0:index%2===0?-.75:.75;
    const group=new THREE.Group();group.position.set(placementX,0,work.applyRoomOffset?0:z);group.userData.placementZ=placementZ;gallery.add(group);
    const dims=getDisplaySize(work),minH=work.id==='d04'?1.25:1.55,maxH=work.id==='d02'?3.15:work.id==='d04'?1.8:2.75;
    const artH=work.actualScale?work.size.h/100:clamp(dims.h*1.05,minH,maxH),artW=artH*(work.size.w/work.size.h);
    const baseW=work.actualScale?clamp(artW*1.05,1.4,3.1):clamp(artW*.82,.92,1.55),baseH=work.hasBuiltInBase ? .1 : .68+(index%2)*.12;
    if(!work.hasBuiltInBase){
      mesh([baseW+.24,.16,baseW+.24],materials.stone,[0,.08,0],group);
      mesh([baseW,baseH,baseW],new THREE.MeshStandardMaterial({color:index%2?0x4d453c:0x71675b,roughness:.58}),[0,.16+baseH/2,0],group);
    }
    const pedestalTop=work.hasBuiltInBase?0:.16+baseH,scanPath=sculptureScans[work.id];
    if(scanPath){
      gltfLoader.load(scanPath,gltf=>{
        if(!isCurrentRoomLoad(version,roomGallery)){disposeDetachedModel(gltf.scene);return;}
        installSculptureModel(gltf.scene,group,work,artH,pedestalTop,true);markLoaded(version,roomGallery);
      },undefined,()=>{
        if(!isCurrentRoomLoad(version,roomGallery))return;
        installSculptureModel(buildSculptureModel(work),group,work,artH,pedestalTop);markLoaded(version,roomGallery);
      });
    }else{
      installSculptureModel(buildSculptureModel(work),group,work,artH,pedestalTop);markLoaded(version,roomGallery);
    }
    const labelWidth=clamp(baseW*.9,1.45,2.25);
    const labelFront=baseW/2+.16;
    const label=makeLabel(work.title,work.artist,labelWidth);
    label.position.set(0,work.hasBuiltInBase ? .32 : baseH*.55,work.applyRoomOffset?placementZ+labelFront:labelFront);
    label.rotation.x=-Math.PI*.04;
    group.add(label);
    const sculptureLightY=isGrand?7.65:5.7;
    const spot=new THREE.SpotLight(0xffc77a,work.actualScale?105:175,isGrand?13:10,Math.PI*.2,.62,1.4);spot.position.set(-placementX*.35,sculptureLightY,placementZ+1.35);spot.target.position.set(placementX,pedestalTop+artH*.52,placementZ);spot.castShadow=index%2===0;spot.shadow.mapSize.set(512,512);gallery.add(spot,spot.target);
    const rim=new THREE.PointLight(0xffd6a0,work.actualScale?18:38,5.5,2);rim.position.set(-placementX*.45,pedestalTop+artH*.58,placementZ-1.15);gallery.add(rim);
    sculptureObstacles.push({x:placementX,z:placementZ,r:baseW*.72+.42});
  }

  function setRoom(index,instant=false) {
    const version=++roomLoadVersion;
    activeRoom=index;clickable.length=0;sculptureObstacles.length=0;nearest=null;prompt.hidden=true;loadDone=0;loadTotal=rooms[index].works.length;
    loading.classList.remove('done');loadingBar.style.width='0';loadingText.textContent='0%';
    finaleSurface=null;
    if(gallery){scene.remove(gallery);gallery.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!Array.isArray(o.material)){if(o.material.map?.userData?.finaleTexture)o.material.map.dispose();o.material.dispose();}});}
    gallery=new THREE.Group();scene.add(gallery);const roomGallery=gallery,shell=buildShell(rooms[index]);
    addFinaleWall(rooms[index],shell);
    if(rooms[index].id==='space'){
      const sculptures=rooms[index].works.filter(w=>w.type==='sculpture'), wallWorks=rooms[index].works.filter(w=>w.type!=='sculpture');
      // 광화문 해치는 실제 크기가 큰 독립 석조물이므로, 입구가 아닌
      // 전시실 맨뒤의 넓은 중앙 공간에 둔다.
      sculptures.forEach((w,i)=>addSculpture(w,i,w.id==='d13'?GALLERY_END+4.6:1-i*4.85,version,roomGallery));
      wallWorks.forEach((w,i)=>addFramedWork(w,i+sculptures.length,i%2===0?-1:1,-2-Math.floor(i/2)*7.1,shell.width,version,roomGallery));
    }else{
      rooms[index].works.forEach((w,i)=>addFramedWork(w,i,i%2===0?-1:1,1-Math.floor(i/2)*5.15,shell.width,version,roomGallery));
    }
    camera.position.set(0,1.68,6.35);yaw=0;pitch=-.015;velocity.set(0,0,0);camera.rotation.set(pitch,yaw,0);
    document.getElementById('room-kicker').textContent='GALLERY '+rooms[index].number;
    document.getElementById('room-title').textContent=rooms[index].title;
    document.getElementById('room-count').textContent=rooms[index].works.length+' WORKS';
    for(const entry of remotePeople.values())entry.group.visible=entry.room===rooms[index].id;
    [...roomTabs.children].forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'page':'false');});
    if(instant)loading.classList.add('done');
  }

  function buildTabs(){rooms.forEach((room,i)=>{const b=document.createElement('button');b.type='button';b.className='room-tab';b.dataset.sfx='click';b.innerHTML=`<b>${room.number}. ${room.title}</b><small>${room.subtitle}</small>`;b.addEventListener('click',()=>{if(i!==activeRoom)setRoom(i);});roomTabs.appendChild(b);});}

  function formatSize(work){if(work.size.label)return work.size.label;const parts=[];if(work.size.h)parts.push(`높이 ${work.size.h}cm`);if(work.size.w)parts.push(`너비 ${work.size.w}cm`);if(work.size.d)parts.push(`깊이 ${work.size.d}cm`);return parts.join(' × ');}
  function showWork(work,room){
    window.ClassGameSfx?.play('card');
    document.getElementById('modal-image').src=work.image;document.getElementById('modal-image').alt=work.title;
    document.getElementById('modal-type').textContent=work.type==='sculpture'?'SCULPTURE':work.type==='mural'?'MURAL':'PAINTING';
    document.getElementById('modal-room').textContent=`GALLERY ${room.number} · ${room.title}`;document.getElementById('modal-title').textContent=work.title;
    const englishTitle=document.getElementById('modal-title-en');englishTitle.textContent=work.englishTitle||'';englishTitle.hidden=!work.englishTitle;
    const tags=document.getElementById('modal-tags');tags.replaceChildren(...(work.tags||[]).map(label=>{const tag=document.createElement('span');tag.textContent=label;return tag;}));tags.hidden=!work.tags?.length;
    document.getElementById('modal-artist').textContent=work.artist;document.getElementById('modal-year').textContent=work.year;document.getElementById('modal-medium').textContent=work.medium;
    document.getElementById('modal-size').textContent=formatSize(work);document.getElementById('modal-docent').textContent=work.docent;document.getElementById('modal-point').textContent=work.point;
    const context=document.getElementById('modal-context');context.textContent=work.styleNote||'';context.hidden=!work.styleNote;
    const legal=document.getElementById('modal-legal'),rights=String(work.rights||''),needsCredit=/©|CC BY|공공누리|저작권자|출처 표시/.test(rights);
    legal.hidden=!needsCredit;legal.open=false;document.getElementById('modal-rights').textContent=needsCredit?rights:'';document.getElementById('modal-source').href=work.source;modal.showModal();keysClear();
  }

  function keysClear(){Object.keys(keys).forEach(k=>keys[k]=false);velocity.set(0,0,0);}

  function updateMovement(dt){
    if(modal.open||helpModal.open||finaleModal.open)return;
    let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    tmpDirection.set(-Math.sin(yaw),0,-Math.cos(yaw));tmpRight.set(Math.cos(yaw),0,-Math.sin(yaw));
    const wish=new THREE.Vector3().addScaledVector(tmpDirection,f).addScaledVector(tmpRight,s);if(wish.lengthSq()>0)wish.normalize();
    const accel=28,maxSpeed=(keys.ShiftLeft||keys.ShiftRight)?7.5:4.8;velocity.addScaledVector(wish,accel*dt);velocity.multiplyScalar(Math.pow(.03,dt));if(velocity.length()>maxSpeed)velocity.setLength(maxSpeed);
    const oldX=camera.position.x,oldZ=camera.position.z;camera.position.addScaledVector(velocity,dt);const half=rooms[activeRoom].id==='space'?7.55:4.85;
    camera.position.x=clamp(camera.position.x,-half,half);camera.position.z=clamp(camera.position.z,GALLERY_END+1.4,6.5);
    for(const o of sculptureObstacles){const dx=camera.position.x-o.x,dz=camera.position.z-o.z,dist=Math.hypot(dx,dz);if(dist<o.r){if(dist<.001){camera.position.x=oldX;camera.position.z=oldZ;}else{camera.position.x=o.x+dx/dist*o.r;camera.position.z=o.z+dz/dist*o.r;}}}
    camera.position.y=1.68+Math.sin(performance.now()*.009)*Math.min(velocity.length()*.012,.025);camera.rotation.set(pitch,yaw,0);
    progressEl.style.width=clamp((6.5-camera.position.z)/(6.5-(GALLERY_END+1.4))*100,0,100)+'%';
  }

  function updateFocus(){
    raycaster.setFromCamera(centerPointer,camera);const hits=raycaster.intersectObjects(clickable,false);const hit=hits.find(h=>h.distance<8.5);
    nearest=hit?hit.object:null;prompt.hidden=!nearest;
    if(nearest){
      const finaleRoom=nearest.userData.finaleRoom;
      promptKicker.textContent=finaleRoom?'전시실 피날레':'작품 가까이';
      promptTitle.textContent=finaleRoom?`${finaleRoom.title} · 관찰 미션`:nearest.userData.work.title;
      promptAction.textContent=finaleRoom?'클릭해서 큐레이터 도전하기':'클릭해서 감상하기';
    }
    for(const entry of remotePeople.values())entry.group.visible=entry.room===rooms[activeRoom].id&&!nearest;
  }

  function updateSelfAvatar(){
    const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);
    selfAvatar.position.set(camera.position.x+forwardX*1.05,-.12,camera.position.z+forwardZ*1.05);
    selfAvatar.rotation.y=yaw;
    selfAvatar.visible=!nearest&&!modal.open&&!helpModal.open&&!finaleModal.open;
  }

  function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);updateMovement(dt);updateFocus();updateSelfAvatar();sendPresence();renderer.render(scene,camera);}

  addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Escape'){if(finaleModal.open){window.ClassGameSfx?.play('click');finaleModal.close();}else if(modal.open){window.ClassGameSfx?.play('click');modal.close();}}if(e.code==='Enter'&&nearest&&!modal.open&&!finaleModal.open){if(nearest.userData.finaleRoom)showFinale(nearest.userData.finaleRoom);else showWork(nearest.userData.work,nearest.userData.room);}});
  addEventListener('keyup',e=>{keys[e.code]=false;});
  canvas.addEventListener('pointerdown',e=>{dragging=true;pointerDown={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now()};canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging||!pointerDown)return;const dx=e.clientX-pointerDown.lastX,dy=e.clientY-pointerDown.lastY;pointerDown.lastX=e.clientX;pointerDown.lastY=e.clientY;yaw-=dx*.0032;pitch=clamp(pitch-dy*.0025,-1.15,1.15);});
  canvas.addEventListener('pointerup',e=>{dragging=false;canvas.classList.remove('dragging');if(!pointerDown)return;const moved=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);if(moved<8&&performance.now()-pointerDown.time<550){pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,false).find(x=>x.distance<10);if(hit){if(hit.object.userData.finaleRoom)showFinale(hit.object.userData.finaleRoom);else showWork(hit.object.userData.work,hit.object.userData.room);}}pointerDown=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;pointerDown=null;canvas.classList.remove('dragging');});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));});
  document.getElementById('modal-close').addEventListener('click',()=>modal.close());document.getElementById('help-button').addEventListener('click',()=>helpModal.showModal());document.getElementById('help-close').addEventListener('click',()=>helpModal.close());document.getElementById('finale-close').addEventListener('click',()=>finaleModal.close());
  finaleNext.addEventListener('click',()=>{finaleQuizIndex++;if(finaleQuizIndex>=ROOM_QUIZZES[finaleQuizRoom.id].questions.length)showFinaleCompletion(finaleQuizRoom,true);else renderFinaleQuestion();});
  document.getElementById('finale-again').addEventListener('click',()=>startFinaleQuiz(finaleQuizRoom));
  for(const d of [modal,helpModal,finaleModal])d.addEventListener('click',e=>{if(e.target===d){window.ClassGameSfx?.play('click');d.close();}});
  document.querySelectorAll('.touch-controls button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointercancel',()=>keys[k]=false);});

  buildTabs();setRoom(0);connectClassPresence();animate();
})();
