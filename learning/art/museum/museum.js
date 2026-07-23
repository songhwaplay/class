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
  const progressEl = document.getElementById('room-progress');
  const modal = document.getElementById('art-modal');
  const helpModal = document.getElementById('help-modal');
  const rooms = window.MUSEUM_ROOMS;
  const presenceEl = document.getElementById('class-presence');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090806);
  scene.fog = new THREE.FogExp2(0x0b0907, 0.018);

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
  let loadTotal = 12;
  let loadDone = 0;

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

  function makeWoodTexture() {
    const c = document.createElement('canvas'); c.width=1024; c.height=1024;
    const g = c.getContext('2d');
    g.fillStyle='#26170f'; g.fillRect(0,0,c.width,c.height);
    const boardW=128, boardH=440;
    for(let row=0;row<3;row++) for(let col=-1;col<9;col++){
      const x=col*boardW+(row%2?64:0), y=row*boardH;
      const grad=g.createLinearGradient(x,y,x+boardW,y);
      const light=20+((col*13+row*7)%12);
      grad.addColorStop(0,`hsl(25 38% ${light-6}%)`);grad.addColorStop(.5,`hsl(26 45% ${light+3}%)`);grad.addColorStop(1,`hsl(22 38% ${light-5}%)`);
      g.fillStyle=grad;g.fillRect(x+2,y+2,boardW-4,boardH-4);
      g.strokeStyle='rgba(8,3,1,.7)';g.strokeRect(x,y,boardW,boardH);
      for(let k=0;k<12;k++){
        const yy=y+18+k*34+Math.sin((col+k)*2)*8;
        g.strokeStyle=`rgba(255,185,105,${.02+(k%3)*.008})`;g.beginPath();g.moveTo(x+6,yy);g.bezierCurveTo(x+40,yy+8,x+82,yy-7,x+boardW-5,yy+3);g.stroke();
      }
    }
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.5,5.5);t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.encoding=THREE.sRGBEncoding;return t;
  }

  const woodTexture = makeWoodTexture();
  const materials = {
    wall:new THREE.MeshStandardMaterial({color:0x1a1816,roughness:.92,metalness:.02}),
    wallInset:new THREE.MeshStandardMaterial({color:0x151310,roughness:.86,metalness:.03}),
    walnut:new THREE.MeshStandardMaterial({map:woodTexture,color:0x8d6042,roughness:.28,metalness:.08}),
    ceiling:new THREE.MeshStandardMaterial({color:0x4a4035,roughness:.8}),
    brass:new THREE.MeshStandardMaterial({color:0xa7803d,roughness:.26,metalness:.78}),
    darkBrass:new THREE.MeshStandardMaterial({color:0x4d351b,roughness:.42,metalness:.65}),
    black:new THREE.MeshStandardMaterial({color:0x080706,roughness:.7}),
    stone:new THREE.MeshStandardMaterial({color:0x655b50,roughness:.67,metalness:.04})
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

  function loadArtTexture(work,material,plane,aspect,transparent=false) {
    const cached=textureCache.get(work.image);
    if(cached){fitArtworkPlane(cached,plane,aspect);material.map=cached;material.needsUpdate=true;markLoaded();return;}
    textureLoader.load(work.image,(t)=>{fitArtworkPlane(t,plane,aspect);textureCache.set(work.image,t);material.map=t;material.needsUpdate=true;markLoaded();},undefined,()=>{material.map=placeholderTexture(work.title);material.needsUpdate=true;markLoaded();});
    material.transparent=transparent;
  }

  function markLoaded(){loadDone++;const pct=Math.round(loadDone/loadTotal*100);loadingBar.style.width=pct+'%';loadingText.textContent=pct+'%';if(loadDone>=loadTotal)setTimeout(()=>loading.classList.add('done'),420);}

  function buildShell(room) {
    const width=room.id==='space'?14:11.6,length=GALLERY_START-GALLERY_END,height=6.4,centerZ=(GALLERY_START+GALLERY_END)/2;
    mesh([width,.18,length],materials.walnut,[0,-.09,centerZ]);
    mesh([width,.25,length],materials.ceiling,[0,height,centerZ]);
    mesh([.28,height,length],materials.wall,[-width/2,3.1,centerZ]);
    mesh([.28,height,length],materials.wall,[width/2,3.1,centerZ]);
    mesh([width,height,.3],materials.wall,[0,3.1,GALLERY_END]);
    mesh([width,height,.22],materials.wallInset,[0,3.1,7]);
    for(const side of [-1,1]){
      const x=side*(width/2-.13);
      mesh([.12,.18,length],materials.brass,[x,.38,centerZ]);
      for(let z=4;z>GALLERY_END;z-=5.15){
        mesh([.16,4.9,.09],materials.darkBrass,[x-side*.08,3,z]);
        mesh([.11,.11,5.5],materials.brass,[x-side*.12,5.52,z-3.1]);
      }
    }
    for(let z=4;z>GALLERY_END;z-=6.2){
      mesh([width-1.1,.12,.28],materials.darkBrass,[0,6.05,z]);
      const strip=mesh([4.2,.05,.42],new THREE.MeshBasicMaterial({color:0xe5b870}),[0,5.88,z]);strip.castShadow=false;
      const light=new THREE.PointLight(0xffd8a1,26,9,2);light.position.set(0,5.66,z);gallery.add(light);
    }
    const ambient=new THREE.HemisphereLight(0xb6a58b,0x1b1009,.72);gallery.add(ambient);
    const entrance=new THREE.Group();gallery.add(entrance);
    mesh([2.2,5,.5],materials.wallInset,[-(width/2-1.1),2.5,5.7],entrance);mesh([2.2,5,.5],materials.wallInset,[(width/2-1.1),2.5,5.7],entrance);mesh([width-4.4,1.15,.5],materials.wallInset,[0,5.42,5.7],entrance);
    const sign=makeLabel(room.subtitle,`${room.works.length}점의 작품 · 원작 비율 전시`,4.2);sign.position.set(0,4.55,5.4);gallery.add(sign);
    return {width,length,height};
  }

  function frameMaterials(index,type) {
    const palettes=[0x6b421f,0x8a5b28,0x3b2718,0x75502d];
    if(type==='mural')return new THREE.MeshStandardMaterial({color:0x4d4032,roughness:.75,metalness:.08});
    return new THREE.MeshStandardMaterial({color:palettes[index%palettes.length],roughness:.32,metalness:.28});
  }

  function addSpotlight(x,y,z,side,index,target) {
    const spot=new THREE.SpotLight(0xffc77e,105,8.5,Math.PI*.19,.5,1.7);spot.position.set(x-side*.85,Math.min(5.7,y+1.7),z+.05);spot.target=target;spot.castShadow=index%3===0;spot.shadow.mapSize.set(512,512);spot.shadow.bias=-.00015;gallery.add(spot,spot.target);
    const stem=mesh([.08,.08,.8],materials.brass,[x-side*.42,Math.min(5.78,y+1.82),z]);stem.rotation.z=side*Math.PI/2;
    const head=mesh([.24,.18,.34],materials.darkBrass,[x-side*.82,Math.min(5.68,y+1.75),z]);head.rotation.z=side*Math.PI/2;
  }

  function addFramedWork(work,index,side,z,width) {
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
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(display.w,display.h),artMat);plane.position.z=.255;plane.userData.work=work;plane.userData.room=rooms[activeRoom];plane.castShadow=true;group.add(plane);clickable.push(plane);loadArtTexture(work,artMat,plane,display.w/display.h);
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
    d06:'assets/models/pieta.glb'
  };

  function installSculptureModel(model,group,work,artH,pedestalTop,isScan=false) {
    if(isScan){
      const material=sculptureMaterial(work);
      model.rotation.y=work.id==='d01'?.16:work.id==='d02'?-1.48:work.id==='d05'?Math.PI:.08;
      model.traverse(part=>{if(part.isMesh){part.geometry.computeVertexNormals();part.material=material;}});
    }
    group.add(model);
    const bounds=new THREE.Box3().setFromObject(model),naturalH=Math.max(.01,bounds.max.y-bounds.min.y),modelScale=artH/naturalH;
    model.scale.setScalar(modelScale);model.position.y=pedestalTop-bounds.min.y*modelScale;
    model.traverse(part=>{if(part.isMesh){part.userData.work=work;part.userData.room=rooms[activeRoom];part.castShadow=true;part.receiveShadow=true;clickable.push(part);}});
  }

  function addSculpture(work,index,z) {
    const group=new THREE.Group();group.position.set(index%2===0?-.75:.75,0,z);gallery.add(group);
    const dims=getDisplaySize(work),minH=work.id==='d04'?1.25:1.55,maxH=work.id==='d02'?3.15:work.id==='d04'?1.8:2.75;
    const artH=clamp(dims.h*1.05,minH,maxH),artW=artH*(work.size.w/work.size.h);
    const baseW=clamp(artW*.82,.92,1.55),baseH=.68+(index%2)*.12;
    mesh([baseW+.24,.16,baseW+.24],materials.stone,[0,.08,0],group);mesh([baseW,baseH,baseW],new THREE.MeshStandardMaterial({color:index%2?0x4d453c:0x71675b,roughness:.58}),[0,.16+baseH/2,0],group);
    const pedestalTop=.16+baseH,scanPath=sculptureScans[work.id];
    if(scanPath){
      gltfLoader.load(scanPath,gltf=>{installSculptureModel(gltf.scene,group,work,artH,pedestalTop,true);markLoaded();},undefined,()=>{installSculptureModel(buildSculptureModel(work),group,work,artH,pedestalTop);markLoaded();});
    }else{
      installSculptureModel(buildSculptureModel(work),group,work,artH,pedestalTop);markLoaded();
    }
    const label=makeLabel(work.title,work.artist,1.7);label.position.set(0,baseH*.55,.516);label.rotation.x=-Math.PI*.04;group.add(label);
    const spot=new THREE.SpotLight(0xffc77a,175,10,Math.PI*.2,.62,1.4);spot.position.set(-group.position.x*.35,5.7,z+1.35);spot.target.position.set(group.position.x,pedestalTop+artH*.52,z);spot.castShadow=index%2===0;spot.shadow.mapSize.set(512,512);gallery.add(spot,spot.target);
    const rim=new THREE.PointLight(0xffd6a0,38,5.5,2);rim.position.set(-group.position.x*.45,pedestalTop+artH*.58,z-1.15);gallery.add(rim);
    sculptureObstacles.push({x:group.position.x,z,r:baseW*.72+.42});
  }

  function setRoom(index,instant=false) {
    activeRoom=index;clickable.length=0;sculptureObstacles.length=0;nearest=null;prompt.hidden=true;loadDone=0;loadTotal=rooms[index].works.length;
    loading.classList.remove('done');loadingBar.style.width='0';loadingText.textContent='0%';
    if(gallery){scene.remove(gallery);gallery.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!Array.isArray(o.material)&&!o.material.map)o.material.dispose();});}
    gallery=new THREE.Group();scene.add(gallery);const shell=buildShell(rooms[index]);
    if(rooms[index].id==='space'){
      const sculptures=rooms[index].works.filter(w=>w.type==='sculpture'), wallWorks=rooms[index].works.filter(w=>w.type!=='sculpture');
      sculptures.forEach((w,i)=>addSculpture(w,i,1-i*4.85));
      wallWorks.forEach((w,i)=>addFramedWork(w,i+sculptures.length,i%2===0?-1:1,-2-Math.floor(i/2)*8.8,shell.width));
    }else{
      rooms[index].works.forEach((w,i)=>addFramedWork(w,i,i%2===0?-1:1,1-Math.floor(i/2)*5.15,shell.width));
    }
    camera.position.set(0,1.68,6.35);yaw=0;pitch=-.015;velocity.set(0,0,0);camera.rotation.set(pitch,yaw,0);
    document.getElementById('room-kicker').textContent='GALLERY '+rooms[index].number;
    document.getElementById('room-title').textContent=rooms[index].title;
    document.getElementById('room-count').textContent=rooms[index].works.length+' WORKS';
    for(const entry of remotePeople.values())entry.group.visible=entry.room===rooms[index].id;
    [...roomTabs.children].forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'page':'false');});
    if(instant)loading.classList.add('done');
  }

  function buildTabs(){rooms.forEach((room,i)=>{const b=document.createElement('button');b.type='button';b.className='room-tab';b.innerHTML=`<b>${room.number}. ${room.title}</b><small>${room.subtitle}</small>`;b.addEventListener('click',()=>{if(i!==activeRoom)setRoom(i);});roomTabs.appendChild(b);});}

  function formatSize(work){if(work.size.label)return work.size.label;const parts=[];if(work.size.h)parts.push(`높이 ${work.size.h}cm`);if(work.size.w)parts.push(`너비 ${work.size.w}cm`);if(work.size.d)parts.push(`깊이 ${work.size.d}cm`);return parts.join(' × ');}
  function showWork(work,room){
    document.getElementById('modal-image').src=work.image;document.getElementById('modal-image').alt=work.title;
    document.getElementById('modal-type').textContent=work.type==='sculpture'?'SCULPTURE':work.type==='mural'?'MURAL':'PAINTING';
    document.getElementById('modal-room').textContent=`GALLERY ${room.number} · ${room.title}`;document.getElementById('modal-title').textContent=work.title;
    document.getElementById('modal-artist').textContent=work.artist;document.getElementById('modal-year').textContent=work.year;document.getElementById('modal-medium').textContent=work.medium;
    document.getElementById('modal-size').textContent=formatSize(work);document.getElementById('modal-docent').textContent=work.docent;document.getElementById('modal-point').textContent=work.point;
    document.getElementById('modal-rights').textContent=work.rights;document.getElementById('modal-source').href=work.source;modal.showModal();keysClear();
  }

  function keysClear(){Object.keys(keys).forEach(k=>keys[k]=false);velocity.set(0,0,0);}

  function updateMovement(dt){
    if(modal.open||helpModal.open)return;
    let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    tmpDirection.set(-Math.sin(yaw),0,-Math.cos(yaw));tmpRight.set(Math.cos(yaw),0,-Math.sin(yaw));
    const wish=new THREE.Vector3().addScaledVector(tmpDirection,f).addScaledVector(tmpRight,s);if(wish.lengthSq()>0)wish.normalize();
    const accel=28,maxSpeed=(keys.ShiftLeft||keys.ShiftRight)?7.5:4.8;velocity.addScaledVector(wish,accel*dt);velocity.multiplyScalar(Math.pow(.03,dt));if(velocity.length()>maxSpeed)velocity.setLength(maxSpeed);
    const oldX=camera.position.x,oldZ=camera.position.z;camera.position.addScaledVector(velocity,dt);const half=rooms[activeRoom].id==='space'?6.05:4.85;
    camera.position.x=clamp(camera.position.x,-half,half);camera.position.z=clamp(camera.position.z,GALLERY_END+1.4,6.5);
    for(const o of sculptureObstacles){const dx=camera.position.x-o.x,dz=camera.position.z-o.z,dist=Math.hypot(dx,dz);if(dist<o.r){if(dist<.001){camera.position.x=oldX;camera.position.z=oldZ;}else{camera.position.x=o.x+dx/dist*o.r;camera.position.z=o.z+dz/dist*o.r;}}}
    camera.position.y=1.68+Math.sin(performance.now()*.009)*Math.min(velocity.length()*.012,.025);camera.rotation.set(pitch,yaw,0);
    progressEl.style.width=clamp((6.5-camera.position.z)/(6.5-(GALLERY_END+1.4))*100,0,100)+'%';
  }

  function updateFocus(){
    raycaster.setFromCamera(centerPointer,camera);const hits=raycaster.intersectObjects(clickable,false);const hit=hits.find(h=>h.distance<8.5);
    nearest=hit?hit.object:null;prompt.hidden=!nearest;if(nearest)promptTitle.textContent=nearest.userData.work.title;
    for(const entry of remotePeople.values())entry.group.visible=entry.room===rooms[activeRoom].id&&!nearest;
  }

  function updateSelfAvatar(){
    const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);
    selfAvatar.position.set(camera.position.x+forwardX*1.05,-.12,camera.position.z+forwardZ*1.05);
    selfAvatar.rotation.y=yaw;
    selfAvatar.visible=!nearest&&!modal.open&&!helpModal.open;
  }

  function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);updateMovement(dt);updateFocus();updateSelfAvatar();sendPresence();renderer.render(scene,camera);}

  addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Escape'&&modal.open)modal.close();if(e.code==='Enter'&&nearest&&!modal.open)showWork(nearest.userData.work,nearest.userData.room);});
  addEventListener('keyup',e=>{keys[e.code]=false;});
  canvas.addEventListener('pointerdown',e=>{dragging=true;pointerDown={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now()};canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging||!pointerDown)return;const dx=e.clientX-pointerDown.lastX,dy=e.clientY-pointerDown.lastY;pointerDown.lastX=e.clientX;pointerDown.lastY=e.clientY;yaw-=dx*.0032;pitch=clamp(pitch-dy*.0025,-1.15,1.15);});
  canvas.addEventListener('pointerup',e=>{dragging=false;canvas.classList.remove('dragging');if(!pointerDown)return;const moved=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);if(moved<8&&performance.now()-pointerDown.time<550){pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,false).find(x=>x.distance<10);if(hit)showWork(hit.object.userData.work,hit.object.userData.room);}pointerDown=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;pointerDown=null;canvas.classList.remove('dragging');});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));});
  document.getElementById('modal-close').addEventListener('click',()=>modal.close());document.getElementById('help-button').addEventListener('click',()=>helpModal.showModal());document.getElementById('help-close').addEventListener('click',()=>helpModal.close());
  for(const d of [modal,helpModal])d.addEventListener('click',e=>{if(e.target===d)d.close();});
  document.querySelectorAll('.touch-controls button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointercancel',()=>keys[k]=false);});

  buildTabs();setRoom(0);connectClassPresence();animate();
})();
