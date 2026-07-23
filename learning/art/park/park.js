(function () {
  'use strict';

  if (!window.THREE) {
    document.body.innerHTML = '<p style="padding:30px">3D 엔진을 불러오지 못했습니다.</p>';
    return;
  }

  const ZONES = [
    {
      id:'sphinx', order:'01', title:'카프라 왕의 스핑크스', short:'기자의 대스핑크스',
      subtitle:'고대 이집트 · 석회암 조각', position:[-145,0,-18], arrival:[-145,1.62,-76], lookAt:[-145,8,-48],
      facts:[['길이','73.5m'],['너비','19m'],['높이','20m']],
      size:'길이 73.5m × 너비 19m × 높이 20m',
      scale:'모형의 전체 경계가 실제 치수와 일치합니다.',
      note:'하버드 Digital Giza의 실측값을 1:1로 적용',
      docent:'사자의 몸과 왕의 머리를 합친 거대한 수호상이에요. 몸통이 운동장 절반보다 길다는 것을 걸어서 느껴 보세요.',
      caution:'흔히 “카프라 왕의 스핑크스”라고 부르지만, 누구의 얼굴인지에 대해서는 학계의 논의가 이어지고 있어요.',
      look:'발에서 꼬리까지 직접 걸어 보고, 1.45m 어린이와 머리 높이를 비교해 보세요.',
      source:'https://giza.fas.harvard.edu/faq/', rights:'원작: 고대 유물 · 3D 형상: 자체 제작'
    },
    {
      id:'liberty', order:'02', title:'자유의 여신상', short:'자유의 여신상',
      subtitle:'프레데리크 오귀스트 바르톨디 · 1886', position:[137,0,-28], arrival:[137,1.62,45], lookAt:[137,36,-28],
      facts:[['지면→횃불','92.99m'],['조각상','46.05m'],['받침대','46.94m']],
      size:'지면에서 횃불까지 92.99m (조각상 46.05m + 받침 구조 46.94m)',
      scale:'전체 높이와 조각상·받침 구조의 높이를 실제 값으로 분리해 적용했습니다.',
      note:'미국 국립공원관리청(NPS) 공식 치수',
      docent:'발밑에서 횃불까지 약 93m예요. 조각상만 높은 것이 아니라 받침 구조도 거의 같은 높이라는 점을 살펴보세요.',
      caution:'화면 성능을 위해 옷 주름과 얼굴은 단순화했지만 높이 비율은 줄이지 않았어요.',
      look:'아래에서 올려다본 뒤 멀리 이동해 전체가 한눈에 들어오는 거리를 찾아보세요.',
      source:'https://www.nps.gov/stli/learn/statue-of-liberty-facts.htm', rights:'원작: Public Domain · 3D 형상: 자체 제작'
    },
    {
      id:'guell', order:'03', title:'구엘 공원의 도마뱀', short:'엘 드락',
      subtitle:'안토니 가우디 · 1900–1914', position:[-72,0,-142], arrival:[-72,1.62,-146], lookAt:[-72,1,-142],
      facts:[['실제 길이','약 2.4m'],['기법','트렌카디스'],['장소','용의 계단']],
      size:'길이 약 2.4m',
      scale:'공식 안내가 확인해 주는 대상과 공개 자료의 길이를 적용했습니다. 너비·높이는 공식 실측이 공개되지 않아 실제 사진 비례를 참고했습니다.',
      note:'“구엘 공원 조형물” 대신 대상이 분명한 엘 드락을 전시',
      docent:'깨진 타일 조각을 곡면에 붙인 트렌카디스 기법을 가까이에서 살펴보세요. 버려진 재료가 반짝이는 표면으로 바뀌었어요.',
      caution:'구엘 공원 전체나 계단 전체의 축소 모형이 아니라, 용의 계단 위 도마뱀 조형물 한 점을 재현했어요.',
      look:'몸 표면의 색 조각이 규칙적인 무늬인지 자유롭게 이어지는지 찾아보세요.',
      source:'https://parkguell.barcelona/index.php/en/park-guell/emblematic-features/dragon-stairway', rights:'원작: Public Domain · 교육용 절차적 재현'
    },
    {
      id:'haetae', order:'04', title:'광화문 해치상', short:'광화문 해치',
      subtitle:'조선 · 1860년대 · 석조', position:[72,0,-142], arrival:[72,1.62,-148], lookAt:[72,1.8,-142],
      facts:[['길이','2.756m'],['너비','1.862m'],['높이','3.507m']],
      size:'길이 275.6cm × 너비 186.2cm × 높이 350.7cm',
      scale:'국립문화유산연구원 3D 기록의 실측 치수와 일치합니다.',
      note:'국가유산 3D 기록정보의 정확한 실측값',
      docent:'해치는 옳고 그름을 가린다고 여긴 상상의 동물이에요. 광화문 앞에서 불과 나쁜 기운을 막는 상징 역할을 했어요.',
      caution:'사자와 비슷해 보여도 실제 동물이 아니라 상상의 동물이며, 머리의 뿔과 몸의 갈기 표현이 특징이에요.',
      look:'정면과 옆면을 번갈아 보고, 몸통 길이와 머리 높이가 어떻게 균형을 이루는지 살펴보세요.',
      source:'https://portal.nrich.go.kr/kor/designUsrView.do?idx=1091&menuIdx=589', rights:'원작: 국가유산 · 치수 출처 공공누리 제1유형'
    },
    {
      id:'dol', order:'05', title:'제주 돌하르방', short:'제주목 계열',
      subtitle:'제주 민속 석조 조형물', position:[-142,0,112], arrival:[-142,1.62,107], lookAt:[-142,1,112],
      facts:[['대표 높이','1.87m'],['성읍 평균','1.41m'],['대정 평균','1.34m']],
      size:'제주목 계열 평균 높이 1.87m',
      scale:'돌하르방은 개체마다 다릅니다. 이 전시는 국가유산 설명의 제주 지역 평균 높이를 사용했습니다.',
      note:'모든 돌하르방이 같은 크기라는 오개념을 막기 위해 지역별 평균 병기',
      docent:'큰 눈, 넓은 코, 꼭 다문 입과 배 위에 올린 두 손을 찾아보세요. 현무암 표면의 작은 구멍도 중요한 특징이에요.',
      caution:'“돌하르방의 실제 크기는 1.87m”가 아니라 제주목 계열의 평균이 1.87m예요. 성읍·대정 계열은 더 작습니다.',
      look:'내 눈높이와 돌하르방의 눈높이를 비교하고, 양손 중 어느 손이 위에 있는지 확인해 보세요.',
      source:'https://digital.khs.go.kr/heri/heriDetail.do?ctptNo=2443900024400&ctptUid=13898859739438806244', rights:'원작: 국가유산 · 3D 형상: 자체 제작'
    },
    {
      id:'parthenon', order:'06', title:'파르테논 신전', short:'기둥과 수평보',
      subtitle:'고대 그리스 · 기원전 447–432년', position:[132,0,118], arrival:[132,1.62,157], lookAt:[132,8,118],
      facts:[['기단','69.50×30.88m'],['기둥 높이','10.43m'],['배열','8×17열']],
      size:'기단 69.50m × 30.88m · 외부 기둥 높이 10.43m · 아래 지름 1.91m',
      scale:'기단, 외부 기둥, 엔타블러처 치수를 실제 값으로 적용했습니다.',
      note:'아치가 아닌 기둥 위에 수평보를 얹는 가구식 구조',
      docent:'앞뒤에는 8개, 양옆에는 17개의 도리스식 기둥이 서요. 모서리 기둥을 중복하지 않으면 바깥 기둥은 모두 46개예요.',
      caution:'파르테논의 핵심 구조는 아치가 아닙니다. 기둥이 수평 엔타블러처를 받치는 가구식 구조예요. 이곳은 원형을 이해하기 위한 교육용 복원 표현입니다.',
      look:'기둥 사이를 걸으며 완전히 곧아 보이는 기둥 몸통이 실제로는 가운데가 아주 살짝 부푼 엔타시스인지 살펴보세요.',
      source:'https://www.perseus.tufts.edu/hopper/artifact?name=Athens%2C+Parthenon&object=Building&redirect=true', rights:'원작: 고대 건축 · 교육용 복원 형상'
    }
  ];

  const canvas = document.getElementById('park-canvas');
  const loading = document.getElementById('loading');
  const hero = document.getElementById('hero-panel');
  const measurePanel = document.getElementById('measure-panel');
  const measureKicker = document.getElementById('measure-kicker');
  const measureTitle = document.getElementById('measure-title');
  const measureFacts = document.getElementById('measure-facts');
  const measureNote = document.getElementById('measure-note');
  const currentZone = document.getElementById('current-zone');
  const compassArrow = document.getElementById('compass-arrow');
  const detailModal = document.getElementById('detail-modal');
  const helpModal = document.getElementById('help-modal');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc8d9);
  scene.fog = new THREE.Fog(0xaccbd0, 185, 470);

  const camera = new THREE.PerspectiveCamera(61, innerWidth/innerHeight, .08, 650);
  camera.rotation.order = 'YXZ';
  camera.position.set(0,1.62,28);

  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .82;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const clock = new THREE.Clock();
  const keys = Object.create(null);
  const raycaster = new THREE.Raycaster();
  const centerPointer = new THREE.Vector2(0,0);
  const zoneObjects = [];
  const park = new THREE.Group();
  scene.add(park);
  let yaw = 0, pitch = -.06, dragging = false, dragStart = null, activeZone = null;

  const MAT = {
    grass:new THREE.MeshStandardMaterial({color:0x315b36,roughness:.98}),
    path:new THREE.MeshStandardMaterial({color:0xa29378,roughness:.92}),
    pathEdge:new THREE.MeshStandardMaterial({color:0x8a806d,roughness:.86}),
    limestone:new THREE.MeshStandardMaterial({color:0xb89a61,roughness:.93}),
    sandstone:new THREE.MeshStandardMaterial({color:0xc8ad78,roughness:.9}),
    marble:new THREE.MeshStandardMaterial({color:0xd9d0b7,roughness:.84}),
    darkStone:new THREE.MeshStandardMaterial({color:0x4a4943,roughness:.97}),
    basalt:new THREE.MeshStandardMaterial({color:0x353a39,roughness:1}),
    patina:new THREE.MeshStandardMaterial({color:0x5c9582,roughness:.72,metalness:.24}),
    copper:new THREE.MeshStandardMaterial({color:0xb9793d,roughness:.48,metalness:.3}),
    white:new THREE.MeshStandardMaterial({color:0xf0eadc,roughness:.84}),
    water:new THREE.MeshStandardMaterial({color:0x236f80,roughness:.28,metalness:.08,transparent:true,opacity:.88}),
    wood:new THREE.MeshStandardMaterial({color:0x68452f,roughness:.9}),
    leaf:new THREE.MeshStandardMaterial({color:0x2e6740,roughness:.94}),
    leaf2:new THREE.MeshStandardMaterial({color:0x6c8d45,roughness:.94})
  };

  function addMesh(geometry, material, parent, position, shadow=true) {
    const m = new THREE.Mesh(geometry,material);
    if(position)m.position.set(position[0],position[1],position[2]);
    m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;
  }
  function box(size,mat,parent,pos){return addMesh(new THREE.BoxGeometry(size[0],size[1],size[2]),mat,parent,pos);}
  function cylinder(rt,rb,h,segments,mat,parent,pos){return addMesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat,parent,pos);}
  function sphere(radius,mat,parent,pos,ws=24,hs=16){return addMesh(new THREE.SphereGeometry(radius,ws,hs),mat,parent,pos);}
  function fitExact(group,target) {
    group.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(group), s=new THREE.Vector3();b.getSize(s);
    group.scale.set(target.x/s.x,target.y/s.y,target.z/s.z);
    group.updateMatrixWorld(true);
    const after=new THREE.Box3().setFromObject(group);
    group.position.y-=after.min.y;
    group.userData.targetBounds=target;
    return group;
  }
  function fitHeight(group,height) {
    group.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(group),s=new THREE.Vector3();b.getSize(s);
    group.scale.setScalar(height/s.y);group.updateMatrixWorld(true);
    const after=new THREE.Box3().setFromObject(group);group.position.y-=after.min.y;return group;
  }
  function orientCylinder(mesh,a,b) {
    const mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
    const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
    mesh.position.copy(mid);mesh.scale.y=len;mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
  }
  function makeLine(a,b,color=0xf0efc4) {
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color,transparent:true,opacity:.88}));
  }
  function canvasTexture(draw,w=1024,h=256) {
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
  }
  function makeLabel(title,subtitle,width=8) {
    const t=canvasTexture((g,w,h)=>{
      g.fillStyle='rgba(14,35,28,.92)';g.fillRect(0,0,w,h);g.strokeStyle='#dceab0';g.lineWidth=4;g.strokeRect(6,6,w-12,h-12);
      g.fillStyle='#eef2df';g.font='800 54px sans-serif';g.fillText(title,42,99);
      g.fillStyle='#b8caaf';g.font='30px sans-serif';g.fillText(subtitle,42,164);
      g.fillStyle='#dce9a6';g.fillRect(42,203,120,5);
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(width,width*.25),new THREE.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,side:THREE.DoubleSide}));
  }
  function makeScaleMarker(height,label) {
    const g=new THREE.Group();
    const human=new THREE.Group();
    cylinder(.14,.17,.62,12,new THREE.MeshStandardMaterial({color:0xe26f4f,roughness:.78}),human,[0,.75,0]);
    sphere(.15,new THREE.MeshStandardMaterial({color:0xc58d68,roughness:.82}),human,[0,1.19,0],16,12);
    cylinder(.055,.06,.55,8,new THREE.MeshStandardMaterial({color:0x273b48,roughness:.85}),human,[-.09,.29,0]);
    const leg=human.children[2].clone();leg.position.x=.09;human.add(leg);human.scale.setScalar(height/1.45);g.add(human);
    const line=makeLine(new THREE.Vector3(.42,0,0),new THREE.Vector3(.42,height,0));g.add(line);
    for(const y of [0,height])g.add(makeLine(new THREE.Vector3(.32,y,0),new THREE.Vector3(.52,y,0)));
    const tag=makeLabel(label,'크기 비교 기준',1.9);tag.position.set(.42,height+.3,0);g.add(tag);
    return g;
  }
  function makeMosaicMaterial() {
    const t=canvasTexture((g,w,h)=>{
      g.fillStyle='#e6d4a9';g.fillRect(0,0,w,h);
      const colors=['#387d78','#e2a536','#d86745','#4e6fa2','#eee6c8','#7f9b55'];
      for(let i=0;i<520;i++){const x=(i*83)%w,y=(i*137)%h,r=9+(i%19);g.fillStyle=colors[i%colors.length];g.beginPath();g.moveTo(x,y);g.lineTo(x+r,y-5);g.lineTo(x+r+4,y+r);g.lineTo(x-4,y+r+5);g.closePath();g.fill();g.strokeStyle='rgba(245,239,218,.72)';g.lineWidth=3;g.stroke();}
    },1024,512);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.5,1.2);
    return new THREE.MeshStandardMaterial({map:t,roughness:.72});
  }

  function buildSphinx() {
    const g=new THREE.Group();
    const body=sphere(1,MAT.limestone,g,[0,1.25,0],38,22);body.scale.set(1.12,1,3.75);
    const chest=sphere(.82,MAT.limestone,g,[0,1.15,-3.15],30,18);chest.scale.set(1.05,1.2,1.15);
    for(const x of [-.58,.58]){
      const paw=addMesh(new THREE.CylinderGeometry(.3,.3,2.25,16),MAT.limestone,g,[x,.34,-4.35]);paw.rotation.x=Math.PI/2;
      const pawTip=sphere(.3,MAT.limestone,g,[x,.34,-5.48],16,10);pawTip.scale.z=.75;
    }
    const neck=cylinder(.52,.68,1.05,24,MAT.limestone,g,[0,2.2,-3.28]);
    const head=sphere(.7,MAT.limestone,g,[0,3.07,-3.3],32,22);head.scale.set(.9,1.18,.84);
    const nemes=addMesh(new THREE.ConeGeometry(1.03,1.8,4),MAT.sandstone,g,[0,2.75,-3.08]);nemes.rotation.y=Math.PI/4;nemes.scale.z=.72;
    const face=sphere(.5,MAT.sandstone,g,[0,3.08,-3.83],24,18);face.scale.set(.72,1,.38);
    const nose=addMesh(new THREE.ConeGeometry(.11,.55,12),MAT.sandstone,g,[0,3.15,-4.18]);nose.rotation.x=Math.PI/2;
    const beard=addMesh(new THREE.ConeGeometry(.13,.95,8),MAT.limestone,g,[0,2.45,-3.92]);beard.rotation.z=Math.PI;
    fitExact(g,{x:19,y:20,z:73.5});return g;
  }
  function buildLiberty() {
    const root=new THREE.Group(), pedestal=new THREE.Group(), statue=new THREE.Group();
    box([23,5,23],MAT.darkStone,pedestal,[0,2.5,0]);box([19,5,19],MAT.sandstone,pedestal,[0,7.5,0]);
    box([15,18,15],MAT.sandstone,pedestal,[0,19,0]);box([18,4,18],MAT.sandstone,pedestal,[0,30,0]);
    box([12,12,12],MAT.sandstone,pedestal,[0,38,0]);box([15,3,15],MAT.sandstone,pedestal,[0,45.5,0]);
    fitHeight(pedestal,46.94);root.add(pedestal);
    const skirt=addMesh(new THREE.ConeGeometry(5.1,15,28),MAT.patina,statue,[0,8,0]);skirt.scale.z=.74;
    const torso=cylinder(2.6,3.9,10,24,MAT.patina,statue,[0,19,0]);torso.rotation.z=-.05;
    sphere(2.05,MAT.patina,statue,[0,27.4,0],28,18);
    const crown=cylinder(2.2,2.15,.8,24,MAT.patina,statue,[0,29.0,0]);
    for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2;const ray=addMesh(new THREE.ConeGeometry(.25,4.1,10),MAT.patina,statue);ray.position.set(Math.cos(a)*1.65,31.0,Math.sin(a)*1.65);ray.rotation.z=Math.cos(a)*.65;ray.rotation.x=-Math.sin(a)*.65;}
    const arm=addMesh(new THREE.CylinderGeometry(.72,.95,1,16),MAT.patina,statue);
    orientCylinder(arm,new THREE.Vector3(2,22,.2),new THREE.Vector3(4.7,38,.2));
    sphere(.85,MAT.patina,statue,[4.8,38.2,.2],18,12);
    cylinder(.82,.58,3.8,16,MAT.copper,statue,[4.8,40.8,.2]);
    const flame=addMesh(new THREE.ConeGeometry(1.2,4.5,18),new THREE.MeshStandardMaterial({color:0xe9b24b,emissive:0xff932c,emissiveIntensity:.75,roughness:.4}),statue,[4.8,45,.2]);
    const leftArm=addMesh(new THREE.CylinderGeometry(.75,1,1,16),MAT.patina,statue);orientCylinder(leftArm,new THREE.Vector3(-2,22,0),new THREE.Vector3(-3.8,17,-1));
    const tablet=box([4.14,7.19,.61],MAT.patina,statue,[-3.7,18,-1.25]);tablet.rotation.z=-.12;
    fitHeight(statue,46.05);
    statue.updateMatrixWorld(true);
    const statueBounds=new THREE.Box3().setFromObject(statue);
    statue.position.y+=46.94-statueBounds.min.y;
    root.add(statue);return root;
  }
  function buildGuell() {
    const g=new THREE.Group(), mosaic=makeMosaicMaterial();
    const body=sphere(1,mosaic,g,[0,.58,0],36,22);body.scale.set(.6,.48,1.35);
    const head=sphere(.66,mosaic,g,[0,.58,-1.08],28,18);head.scale.set(.76,.58,.95);
    const tail=addMesh(new THREE.ConeGeometry(.38,1.65,18),mosaic,g,[0,.54,1.55]);tail.rotation.x=-Math.PI/2;
    for(const sx of [-1,1])for(const z of [-.55,.65]){const limb=addMesh(new THREE.CylinderGeometry(.13,.18,1.1,12),mosaic,g,[sx*.58,.45,z]);limb.rotation.z=sx*.88;const foot=sphere(.19,mosaic,g,[sx*.94,.26,z-.08],14,10);foot.scale.set(1.3,.48,.8);}
    sphere(.11,new THREE.MeshStandardMaterial({color:0x101b17,roughness:.6}),g,[-.27,.78,-1.63],12,8);
    sphere(.11,new THREE.MeshStandardMaterial({color:0x101b17,roughness:.6}),g,[.27,.78,-1.63],12,8);
    g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),s=new THREE.Vector3();b.getSize(s);g.scale.setScalar(2.4/s.z);
    g.updateMatrixWorld(true);const a=new THREE.Box3().setFromObject(g);g.position.y-=a.min.y;return g;
  }
  function buildHaetae() {
    const g=new THREE.Group();
    const stone=new THREE.MeshStandardMaterial({color:0x8c887c,roughness:.98});
    const body=sphere(1,stone,g,[0,1,0],30,18);body.scale.set(.78,.72,1.28);
    const head=sphere(.75,stone,g,[0,1.62,-1.03],28,18);head.scale.set(.92,1.05,.85);
    const snout=sphere(.42,stone,g,[0,1.48,-1.62],20,14);snout.scale.set(1,.65,.75);
    for(const x of [-.52,.52]){const leg=cylinder(.24,.32,.9,12,stone,g,[x,.45,-.45]);sphere(.34,stone,g,[x,.14,-.65],14,10);}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const curl=addMesh(new THREE.TorusGeometry(.19,.075,8,16,Math.PI*1.6),stone,g,[Math.cos(a)*.62,1.82+Math.sin(a)*.36,-1.02]);curl.rotation.z=a;}
    const horn=addMesh(new THREE.ConeGeometry(.12,.78,12),stone,g,[0,2.54,-1.02]);horn.rotation.z=-.16;
    const tail=addMesh(new THREE.TorusGeometry(.55,.16,12,24,Math.PI*1.55),stone,g,[.58,1.22,1.05]);tail.rotation.y=Math.PI/2;
    fitExact(g,{x:1.862,y:3.507,z:2.756});return g;
  }
  function buildDolhareubang() {
    const pts=[
      new THREE.Vector2(.34,0),new THREE.Vector2(.42,.08),new THREE.Vector2(.44,.44),
      new THREE.Vector2(.38,.92),new THREE.Vector2(.34,1.18),new THREE.Vector2(.42,1.31),
      new THREE.Vector2(.48,1.38),new THREE.Vector2(.39,1.49),new THREE.Vector2(.24,1.57),
      new THREE.Vector2(.18,1.67),new THREE.Vector2(.37,1.74),new THREE.Vector2(.44,1.83),new THREE.Vector2(.28,1.87)
    ];
    const g=new THREE.Group(), body=addMesh(new THREE.LatheGeometry(pts,40),MAT.basalt,g);
    for(const x of [-.16,.16]){const eye=sphere(.07,MAT.darkStone,g,[x,1.56,-.34],16,10);eye.scale.z=.45;}
    const nose=addMesh(new THREE.ConeGeometry(.08,.24,12),MAT.basalt,g,[0,1.42,-.48]);nose.rotation.x=Math.PI/2;
    const mouth=box([.25,.035,.04],MAT.darkStone,g,[0,1.27,-.39]);
    for(const side of [-1,1]){const hand=sphere(.11,MAT.basalt,g,[side*.16,.72,-.37],16,10);hand.scale.set(1.1,.75,.6);}
    for(let i=0;i<80;i++){const p=sphere(.009+(i%4)*.005,new THREE.MeshBasicMaterial({color:0x171c1a}),g,[Math.sin(i*4.7)*(.3+(i%5)*.015),.12+(i*29%160)/100,Math.cos(i*3.1)*.35],8,6);p.castShadow=false;}
    fitHeight(g,1.87);return g;
  }
  function doricColumn(height=10.43,diameter=1.91) {
    const g=new THREE.Group();
    cylinder(diameter*.55,diameter*.62,.28,24,MAT.marble,g,[0,.14,0]);
    const shaft=addMesh(new THREE.CylinderGeometry(diameter*.43,diameter*.5,height-.95,20,1,false),MAT.marble,g,[0,height/2-.1,0]);
    cylinder(diameter*.58,diameter*.44,.34,20,MAT.marble,g,[0,height-.48,0]);
    box([diameter*1.2,.32,diameter*1.2],MAT.marble,g,[0,height-.16,0]);return g;
  }
  function buildParthenon() {
    const g=new THREE.Group(), W=30.88,L=69.5,colH=10.43;
    box([W+.9,.42,L+.9],MAT.marble,g,[0,.21,0]);box([W+.45,.42,L+.45],MAT.marble,g,[0,.63,0]);box([W,.42,L],MAT.marble,g,[0,1.05,0]);
    const x0=W/2-1.5,z0=L/2-1.5;
    const coords=[];
    for(let i=0;i<8;i++){const x=-x0+i*(2*x0/7);coords.push([x,-z0],[x,z0]);}
    for(let i=1;i<16;i++){const z=-z0+i*(2*z0/16);coords.push([-x0,z],[x0,z]);}
    coords.forEach(([x,z])=>{const c=doricColumn();c.position.set(x,1.26,z);g.add(c);});
    box([W,3.30,2.15],MAT.marble,g,[0,13.34,-z0]);box([W,3.30,2.15],MAT.marble,g,[0,13.34,z0]);
    box([2.15,3.30,L-3],MAT.marble,g,[-x0,13.34,0]);box([2.15,3.30,L-3],MAT.marble,g,[x0,13.34,0]);
    const cella=box([15,7.6,40],new THREE.MeshStandardMaterial({color:0xc5b99d,roughness:.95}),g,[0,5.05,0]);
    const roof=addMesh(new THREE.ConeGeometry(22,6,4),MAT.marble,g,[0,17.9,0]);roof.rotation.y=Math.PI/4;roof.scale.set(.82,1,1.85);
    g.userData.targetBounds={x:30.88,y:20.9,z:69.5};return g;
  }

  function addPlinthAndMarker(zone,model) {
    const [x,,z]=zone.position;
    const plinthMat=new THREE.MeshStandardMaterial({color:0xb6aa90,roughness:.94});
    let groundY=0;
    if(['guell','haetae','dol'].includes(zone.id)){
      const bounds=new THREE.Box3().setFromObject(model),size=new THREE.Vector3();bounds.getSize(size);
      const p=box([Math.max(3,size.x+1),.24,Math.max(3,size.z+1)],plinthMat,park,[x,.12,z]);p.receiveShadow=true;
      groundY=.24;
    }
    model.updateMatrixWorld(true);
    const modelBounds=new THREE.Box3().setFromObject(model);
    model.position.y+=groundY-modelBounds.min.y;
    const marker=makeScaleMarker(1.45,'어린이 1.45m');marker.position.set(x+4.5,0,z+4);park.add(marker);
    const labelSide=zone.id==='liberty'||zone.id==='parthenon'?1:-1;
    const label=makeLabel(zone.title,zone.size,9);label.position.set(x,3.8,z+labelSide*6);label.lookAt(camera.position.x,3.8,camera.position.z);label.userData.faceCamera=true;park.add(label);
    model.userData.zone=zone;zoneObjects.push(model);
  }

  function makePark() {
    const ground=addMesh(new THREE.CircleGeometry(300,96),MAT.grass,park,[0,-.08,0]);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
    const plaza=addMesh(new THREE.CircleGeometry(31,64),MAT.path,park,[0,.01,0]);plaza.rotation.x=-Math.PI/2;
    const ring=addMesh(new THREE.RingGeometry(25,31,64),MAT.pathEdge,park,[0,.025,0]);ring.rotation.x=-Math.PI/2;
    ZONES.forEach(zone=>{
      const curve=new THREE.LineCurve3(new THREE.Vector3(0,.02,0),new THREE.Vector3(zone.position[0],.02,zone.position[2]));
      const path=addMesh(new THREE.TubeGeometry(curve,1,3.2,8,false),MAT.path,park);path.receiveShadow=true;
      const pad=addMesh(new THREE.CircleGeometry(zone.id==='parthenon'||zone.id==='liberty'||zone.id==='sphinx'?48:16,48),MAT.path,park,[zone.position[0],.012,zone.position[2]]);pad.rotation.x=-Math.PI/2;
    });
    const water=addMesh(new THREE.RingGeometry(15,23,64),MAT.water,park,[0,.04,0]);water.rotation.x=-Math.PI/2;water.castShadow=false;
    const hub=cylinder(4.2,4.8,1.1,32,MAT.sandstone,park,[0,.55,0]);
    const globe=sphere(2.7,new THREE.MeshStandardMaterial({color:0x7a9f63,roughness:.62,metalness:.08}),park,[0,4.1,0],32,20);
    const hubLabel=makeLabel('실물 크기 세계 미술','작품마다 1m = 3D 1단위',8);hubLabel.position.set(0,7.5,0);hubLabel.userData.faceCamera=true;park.add(hubLabel);

    const builders={sphinx:buildSphinx,liberty:buildLiberty,guell:buildGuell,haetae:buildHaetae,dol:buildDolhareubang,parthenon:buildParthenon};
    ZONES.forEach(zone=>{const model=builders[zone.id]();model.position.set(zone.position[0],0,zone.position[2]);park.add(model);addPlinthAndMarker(zone,model);});

    for(let i=0;i<115;i++){
      const a=i*2.399,r=50+(i*37%220),x=Math.cos(a)*r,z=Math.sin(a)*r;
      if(ZONES.some(q=>Math.hypot(x-q.position[0],z-q.position[2])<42))continue;
      const tree=new THREE.Group(),h=3.5+(i%7)*.45;
      cylinder(.18,.28,h,8,MAT.wood,tree,[0,h/2,0]);
      const crown=sphere(1.4+(i%4)*.18,i%3?MAT.leaf:MAT.leaf2,tree,[0,h+.8,0],12,9);crown.scale.y=1.25;
      tree.position.set(x,0,z);tree.rotation.y=a;tree.traverse(o=>{if(o.isMesh){o.castShadow=i%4===0;o.receiveShadow=true;}});park.add(tree);
    }
    for(let i=0;i<26;i++){const a=i/26*Math.PI*2;const lamp=cylinder(.06,.09,3.4,10,MAT.darkStone,park,[Math.cos(a)*28,1.7,Math.sin(a)*28]);sphere(.16,new THREE.MeshStandardMaterial({color:0xffe1a5,emissive:0xffba55,emissiveIntensity:1.2}),park,[Math.cos(a)*28,3.5,Math.sin(a)*28],12,8);}
  }

  function setupLights() {
    scene.add(new THREE.HemisphereLight(0xd9efff,0x354b2d,.64));
    const sun=new THREE.DirectionalLight(0xffeed0,1.35);sun.position.set(-90,160,70);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-190;sun.shadow.camera.right=190;sun.shadow.camera.top=190;sun.shadow.camera.bottom=-190;sun.shadow.camera.far=420;sun.shadow.bias=-.0002;scene.add(sun);
  }

  function buildTabs() {
    const nav=document.getElementById('zone-tabs');
    ZONES.forEach(zone=>{
      const b=document.createElement('button');b.className='zone-tab';b.type='button';b.innerHTML=`<i></i><b>${zone.order}. ${zone.short}</b><small>${zone.subtitle}</small>`;
      b.addEventListener('click',()=>teleport(zone));zone.tab=b;nav.appendChild(b);
    });
  }
  function teleport(zone) {
    hero.classList.add('hidden');camera.position.set(zone.arrival[0],zone.arrival[1],zone.arrival[2]);
    const target=new THREE.Vector3(zone.lookAt[0],zone.lookAt[1],zone.lookAt[2]);
    const d=target.sub(camera.position);yaw=Math.atan2(-d.x,-d.z);pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));updateCamera();
    setActiveZone(zone);
  }
  function setActiveZone(zone) {
    if(activeZone===zone)return;activeZone=zone;
    ZONES.forEach(z=>z.tab.classList.toggle('active',z===zone));
    currentZone.textContent=zone?zone.short:'중앙 광장';
    if(!zone){measurePanel.hidden=true;return;}
    measurePanel.hidden=false;measureKicker.textContent=`ZONE ${zone.order} · ACTUAL SCALE`;measureTitle.textContent=zone.title;
    measureFacts.innerHTML=zone.facts.map(f=>`<div><dt>${f[0]}</dt><dd>${f[1]}</dd></div>`).join('');
    measureNote.textContent=zone.note;
  }
  function openDetail(zone) {
    if(!zone)return;
    document.getElementById('modal-kicker').textContent=`ZONE ${zone.order} · 1:1 SCALE`;
    document.getElementById('modal-title').textContent=zone.title;
    document.getElementById('modal-subtitle').textContent=zone.subtitle;
    document.getElementById('modal-size').textContent=zone.size;
    document.getElementById('modal-scale').textContent=zone.scale;
    document.getElementById('modal-docent').textContent=zone.docent;
    document.getElementById('modal-caution').textContent=zone.caution;
    document.getElementById('modal-look').textContent=zone.look;
    document.getElementById('modal-rights').textContent=zone.rights;
    document.getElementById('modal-source').href=zone.source;
    detailModal.showModal();
  }
  function nearestZone() {
    let best=null,dist=Infinity;
    ZONES.forEach(z=>{const d=Math.hypot(camera.position.x-z.position[0],camera.position.z-z.position[2]);if(d<dist){dist=d;best=z;}});
    return dist<62?best:null;
  }
  function updateCamera(){camera.rotation.y=yaw;camera.rotation.x=pitch;}
  function updateMovement(dt) {
    const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
    const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    if(forward||strafe){
      const speed=(keys.ShiftLeft||keys.ShiftRight?31:13)*dt, len=Math.hypot(forward,strafe)||1;
      camera.position.x+=(-Math.sin(yaw)*forward+Math.cos(yaw)*strafe)/len*speed;
      camera.position.z+=(-Math.cos(yaw)*forward-Math.sin(yaw)*strafe)/len*speed;
      const radius=Math.hypot(camera.position.x,camera.position.z);if(radius>285){camera.position.x*=285/radius;camera.position.z*=285/radius;}
    }
    camera.position.y=1.62;
    setActiveZone(nearestZone());
  }
  function validateScale() {
    zoneObjects.forEach(model=>{
      const target=model.userData.targetBounds;if(!target)return;
      const size=new THREE.Vector3();new THREE.Box3().setFromObject(model).getSize(size);
      const ok=['x','y','z'].every(k=>Math.abs(size[k]-target[k])<.025);
      if(!ok)console.warn('실물 크기 검증 실패:',model.userData.zone.title,size,target);
    });
  }
  function animate() {
    requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);updateMovement(dt);
    park.children.forEach(o=>{if(o.userData.faceCamera)o.lookAt(camera.position.x,o.position.y,camera.position.z);});
    compassArrow.style.transform=`rotate(${-yaw}rad)`;renderer.render(scene,camera);
  }

  setupLights();makePark();buildTabs();updateCamera();validateScale();animate();
  setTimeout(()=>loading.classList.add('done'),650);

  addEventListener('keydown',e=>{keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();});
  addEventListener('keyup',e=>{keys[e.code]=false;});
  canvas.addEventListener('pointerdown',e=>{dragging=true;dragStart={x:e.clientX,y:e.clientY,moved:false};canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.movementX||0,dy=e.movementY||0;if(Math.abs(dx)+Math.abs(dy)>2)dragStart.moved=true;yaw-=dx*.0032;pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*.0028));updateCamera();});
  canvas.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;canvas.classList.remove('dragging');if(dragStart&&!dragStart.moved){raycaster.setFromCamera(centerPointer,camera);const hit=raycaster.intersectObjects(zoneObjects,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.zone)o=o.parent;if(o)openDetail(o.userData.zone);}}dragStart=null;});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});

  document.getElementById('start-button').addEventListener('click',()=>teleport(ZONES[0]));
  document.getElementById('detail-button').addEventListener('click',()=>openDetail(activeZone));
  document.getElementById('modal-close').addEventListener('click',()=>detailModal.close());
  document.getElementById('help-button').addEventListener('click',()=>helpModal.showModal());
  document.getElementById('help-close').addEventListener('click',()=>helpModal.close());
  document.querySelectorAll('.touch-controls button').forEach(btn=>{
    const code=btn.dataset.key;
    const on=e=>{e.preventDefault();keys[code]=true;},off=e=>{e.preventDefault();keys[code]=false;};
    btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off);
  });
})();
