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
  const finaleArtwork = document.getElementById('finale-artwork');
  const finaleArtworkImage = document.getElementById('finale-artwork-image');
  const rooms = window.MUSEUM_ROOMS;
  const presenceEl = document.getElementById('class-presence');
  const bgm = document.getElementById('bgm');
  const ROOM_MUSIC = [
    '../assets/sound/museum/gallery-01-portrait.mp3',
    '../assets/sound/museum/gallery-02-nature.mp3',
    '../assets/sound/museum/gallery-03-story.mp3',
    '../assets/sound/museum/gallery-04-line-color-imagination.mp3',
    '../assets/sound/museum/gallery-05-form-space.mp3'
  ];

  function setRoomMusic(index) {
    if (!bgm || !ROOM_MUSIC[index]) return;
    const nextSrc = new URL(ROOM_MUSIC[index], document.baseURI).href;
    if (bgm.src === nextSrc) return;
    const wasPlaying = !bgm.paused;
    bgm.src = ROOM_MUSIC[index];
    bgm.load();
    if (wasPlaying) bgm.play().catch(() => {});
  }

  const ROOM_QUIZZES = {
    portrait:{
      intro:'얼굴과 자세, 빛을 얼마나 세심하게 보았는지 문제은행으로 확인해 보세요.',
      questions:[
        {q:'〈진주 귀걸이를 한 소녀〉의 얼굴을 드러내는 빛은 주로 어느 쪽에서 올까요?',options:['화면 왼쪽 위','화면 오른쪽 아래','인물의 등 뒤'],answer:0,explain:'왼쪽 위에서 들어온 빛이 이마와 뺨, 진주를 차례로 밝혀요.'},
        {q:'윤두서의 〈자화상〉에서 화면의 긴장을 가장 강하게 만드는 부분은 무엇일까요?',options:['화려한 배경','정면을 응시하는 눈','손에 든 책'],answer:1,explain:'몸과 배경을 거의 생략하고 정면의 눈빛에 정신과 기운을 집중했어요.'},
        {q:'〈모나리자〉의 인물이 안정적으로 보이는 데 가장 크게 기여하는 자세는 무엇일까요?',options:['가지런히 포갠 두 손','높이 든 양팔','옆으로 뻗은 다리'],answer:0,explain:'화면 아래 포개진 두 손이 피라미드형 구도를 단단하게 받쳐 줘요.'},
        {q:'뭉크의 〈절규〉에서 인물의 불안과 함께 흔들리는 듯 보이는 것은 무엇일까요?',options:['굽이치는 하늘과 다리','반듯한 창문 격자','고요한 흰 벽'],answer:0,explain:'하늘과 풍경의 물결치는 선이 인물의 벌어진 입과 얼굴을 둘러싸며 불안을 퍼뜨려요.'},
        {q:'베르메르의 〈우유를 따르는 여인〉에서 실내를 밝히는 빛은 어디에서 들어올까요?',options:['왼쪽 창문','바닥 아래','여인의 등 뒤 촛불'],answer:0,explain:'화면 왼쪽 창문에서 들어온 빛이 얼굴과 빵, 우유 항아리의 질감을 드러내요.'},
        {q:'마네의 〈피리 부는 소년〉에서 소년에게 시선을 집중시키는 배경의 특징은?',options:['장식이 가득하다','깊이감이 거의 없이 단순하다','산과 강이 멀리 펼쳐진다'],answer:1,explain:'평평하고 비어 있는 배경 덕분에 제복의 선명한 색과 소년의 윤곽이 또렷해져요.'},
        {q:'신윤복의 〈미인도〉에서 인물의 단아한 분위기를 강조하는 옷차림은?',options:['풍성한 치마와 짧은 저고리','두꺼운 갑옷과 투구','서양식 정장과 모자'],answer:0,explain:'풍성한 치마와 몸에 맞는 짧은 저고리, 정갈한 머리 모양이 인물의 섬세한 자태를 보여 줘요.'},
        {q:'고흐의 〈회색 펠트모자를 쓴 자화상〉에서 얼굴 주변에 에너지를 만드는 것은?',options:['짧고 방향이 다른 붓질','매끈한 단색 면','사진처럼 흐린 초점'],answer:0,explain:'짧은 붓질이 얼굴과 배경에서 여러 방향으로 반복되며 떨리는 듯한 생동감을 만들어요.'},
        {q:'클림트의 〈키스〉에서 두 인물을 하나의 덩어리처럼 묶는 것은 무엇일까요?',options:['금빛 무늬의 옷','넓은 파란 하늘','검은 원근선'],answer:0,explain:'두 사람을 감싼 금빛 옷과 반복 무늬가 몸의 경계를 포개 하나의 빛나는 형태로 만들어요.'},
        {q:'밀레의 〈이삭 줍는 사람들〉에서 세 인물에게 반복되는 동작은?',options:['허리를 굽혀 이삭을 줍기','양팔을 들고 춤추기','말을 타고 달리기'],answer:0,explain:'세 여인의 굽은 등이 화면에 반복되는 곡선을 만들며 고된 노동의 리듬을 보여 줘요.'},
        {q:'드가의 〈흔들리는 무희〉가 사진으로 포착한 순간처럼 느껴지는 까닭은?',options:['인물과 무대가 과감하게 잘려 있어서','모든 인물이 정면에 나란히 있어서','좌우가 완벽하게 대칭이라서'],answer:0,explain:'위에서 비스듬히 내려다본 시점과 화면 가장자리에서 잘린 인물들이 순간적인 장면을 만들어요.'},
        {q:'피카소의 〈우는 여인〉에서 슬픔을 날카롭게 전달하는 조형 요소는?',options:['쪼개진 얼굴과 뾰족한 선','부드러운 원 하나','넓고 고요한 풍경'],answer:0,explain:'여러 방향으로 나뉜 얼굴과 각진 손가락, 눈물의 뾰족한 선이 감정을 강하게 드러내요.'}
      ]
    },
    nature:{
      intro:'빛과 계절, 자연을 표현한 붓질 속에서 발견한 것을 되짚어 보세요.',
      questions:[
        {q:'반 고흐의 〈별이 빛나는 밤〉에서 밤하늘의 움직임을 만드는 핵심은 무엇일까요?',options:['곧고 얇은 격자','소용돌이치는 붓질','완전히 평평한 검정'],answer:1,explain:'굽이치며 반복되는 붓질이 별빛과 하늘 전체를 움직이는 것처럼 보여 줘요.'},
        {q:'모네의 〈수련〉 연작은 주로 어디를 바라본 시점일까요?',options:['하늘 높이 위쪽','멀리 있는 산 정상','가까운 연못 수면'],answer:2,explain:'연못을 내려다보며 물 위 수련과 하늘의 반사를 한 화면에 담았어요.'},
        {q:'정선의 〈인왕제색도〉에서 비 갠 산의 묵직한 기운을 강조한 재료는 무엇일까요?',options:['짙고 옅은 먹','금박과 은박','파스텔 가루'],answer:0,explain:'번지고 겹쳐진 먹의 농담이 젖은 바위와 피어오르는 안개를 표현해요.'},
        {q:'반 고흐의 〈해바라기〉에서 화면 전체를 하나로 묶는 중심 색은 무엇일까요?',options:['노랑','보라','검정'],answer:0,explain:'서로 다른 밝기와 온도의 노랑이 꽃·화병·배경에 반복되어 화면을 하나로 묶어요.'},
        {q:'모네의 〈인상, 해돋이〉에서 푸른 안개 속 가장 강한 색의 대비를 만드는 것은?',options:['주황빛 해와 물결','검은 산봉우리','초록색 들판'],answer:0,explain:'작은 주황빛 해와 반사가 푸른 회색의 항구 안개와 보색에 가까운 대비를 만들어요.'},
        {q:'〈호작도〉에서 좋은 소식을 전하는 존재로 여겨진 동물은 무엇일까요?',options:['호랑이','까치','거북이'],answer:1,explain:'민화에서 까치는 반가운 소식을 알리고, 익살스러운 호랑이와 재미있는 이야기를 만들어요.'},
        {q:'〈초충도〉에서 작은 생태계를 이루는 소재로 알맞은 것은?',options:['풀·열매·벌레와 들쥐','고층 건물과 자동차','바다와 거대한 배'],answer:0,explain:'작은 풀과 열매, 곤충과 들쥐를 세심하게 엮어 가까운 자연 속 생명의 관계를 보여 줘요.'},
        {q:'이중섭의 〈흰 소〉에서 소의 힘을 가장 직접적으로 느끼게 하는 것은?',options:['굵고 거친 윤곽선','얇은 금빛 테두리','정교한 원근 격자'],answer:0,explain:'힘차게 휘어진 굵은 선이 소의 등과 다리를 붙잡아 버티고 나아가려는 에너지를 전해요.'},
        {q:'김홍도의 〈황묘농접도〉에서 고양이의 시선이 향하는 곳은?',options:['날아다니는 나비','화면 밖의 달','물속의 물고기'],answer:0,explain:'고양이의 눈과 몸짓이 나비 쪽으로 이어져 두 동물 사이에 작은 이야기가 생겨요.'},
        {q:'아르침볼도의 〈여름〉에서 사람의 얼굴은 무엇으로 이루어져 있을까요?',options:['여름 과일과 채소','돌과 금속 조각','구름과 빗방울'],answer:0,explain:'복숭아·오이·옥수수 같은 여름의 산물을 조합해 사람의 옆얼굴로 바꾸었어요.'},
        {q:'모네의 〈양산을 든 여인〉에서 바람의 움직임을 보여 주는 것은?',options:['휘날리는 옷자락과 기울어진 풀','반듯하게 멈춘 깃발','각진 실내 벽'],answer:0,explain:'옷자락과 베일, 풀의 기울기가 같은 방향으로 흐르며 햇빛 속 바람을 느끼게 해요.'},
        {q:'루소의 〈꿈〉에서 현실과 상상이 뒤섞인 장면은?',options:['정글 속에 놓인 소파와 인물','교실의 책상과 칠판','항구의 배와 창고'],answer:0,explain:'실내에 있을 법한 소파와 인물을 울창한 정글 한가운데 놓아 꿈처럼 낯선 세계를 만들어요.'}
      ]
    },
    story:{
      intro:'장면 속 인물과 시선, 사건의 앞뒤를 떠올리며 무작위로 뽑힌 이야기 단서를 다시 찾아보세요.',
      questions:[
        {q:'신윤복의 〈단오풍정〉에서 여러 장면을 차례로 살피게 하는 시선의 흐름은 무엇일까요?',options:['한가운데의 완전한 대칭','위아래를 오가는 지그재그','한 점에 멈춘 원'],answer:1,explain:'그네와 냇가의 여러 무리가 지그재그로 이어지며 화면 곳곳을 보게 해요.'},
        {q:'〈아담의 창조〉에서 가장 큰 긴장을 만드는 작은 공간은 어디일까요?',options:['두 손가락 사이','구름 아래의 산','화면 양끝의 벽'],answer:0,explain:'거의 닿을 듯 남겨 둔 손가락 사이의 틈이 생명이 전해질 순간을 강조해요.'},
        {q:'김정희의 〈세한도〉에서 변치 않는 마음을 상징하는 것은 무엇일까요?',options:['활짝 핀 장미','소나무와 잣나무','화려한 궁궐'],answer:1,explain:'추운 겨울에도 푸른 나무에 어려운 때에도 변하지 않는 마음을 담았어요.'},
        {q:'김홍도의 〈서당〉에서 이야기의 중심이 되는 인물은 누구일까요?',options:['웃음을 참는 훈장','울고 있는 어린 학생','문밖의 장사꾼'],answer:1,explain:'꾸중을 들은 듯 눈물을 닦는 아이와 그 모습을 둘러싼 학생들의 표정이 장면의 이야기를 만들어요.'},
        {q:'보티첼리의 〈봄〉 한가운데에서 장면의 중심을 잡는 인물은 누구일까요?',options:['비너스','갑옷 입은 장군','악기를 든 소년'],answer:0,explain:'비너스가 화면 중앙의 열린 공간에 서서 좌우로 펼쳐지는 봄의 인물들을 연결해요.'},
        {q:'밀레의 〈만종〉에서 두 농부가 일을 멈춘 까닭으로 알맞은 것은?',options:['멀리서 들린 기도 종소리','갑자기 내린 폭우','시장으로 달려가기 위해'],answer:0,explain:'해 질 무렵 들려오는 종소리에 두 사람이 들판에서 잠시 고개를 숙인 순간이에요.'},
        {q:'르누아르의 〈물랭 드 라 갈레트의 무도회〉에서 즐거운 분위기를 만드는 빛은?',options:['나뭇잎 사이로 얼룩지는 햇빛','한 줄기의 차가운 번개','무대 뒤의 붉은 불꽃'],answer:0,explain:'나뭇잎 사이의 빛이 사람들의 옷과 얼굴에 작은 색점처럼 흩어져 북적이는 리듬을 만들어요.'},
        {q:'보티첼리의 〈비너스의 탄생〉에서 비너스가 서 있는 것은 무엇 위일까요?',options:['커다란 조개껍데기','대리석 계단','황금 마차'],answer:0,explain:'바다에서 태어난 비너스가 커다란 조개를 타고 바람에 밀려 해안으로 다가와요.'},
        {q:'신윤복의 〈그네〉에서 장면의 움직임을 가장 크게 만드는 인물은?',options:['높이 그네를 타는 여인','바닥에 잠든 선비','배를 젓는 어부'],answer:0,explain:'크게 휘어진 그넷줄과 공중으로 오른 치마가 화면 위아래를 가르는 시원한 움직임을 만들어요.'},
        {q:'안견의 〈몽유도원도〉에서 꿈속 여행의 흐름은 어느 방향으로 이어질까요?',options:['왼쪽 현실에서 오른쪽 도원으로','가운데에서 아래로만','오른쪽에서 왼쪽 바다로'],answer:0,explain:'왼쪽의 비교적 현실적인 풍경에서 시작해 오른쪽의 웅장하고 신비로운 도원으로 시선이 이동해요.'},
        {q:'이중섭의 〈길 떠나는 가족〉에서 인물과 소가 함께 향하는 모습에 담긴 바람은?',options:['가족과 다시 함께 살고 싶은 마음','전쟁터에서 승리하려는 마음','혼자 숨어 지내려는 마음'],answer:0,explain:'같은 방향으로 움직이는 사람과 소의 무리에 헤어진 가족과 재회하고 싶은 작가의 소망이 포개져요.'},
        {q:'박수근의 〈빨래터〉에서 일상의 정겨운 리듬을 만드는 것은?',options:['물가에 모여 앉은 사람들의 반복','하늘을 가르는 비행기','혼자 달리는 말'],answer:0,explain:'물가를 따라 낮게 모여 앉은 사람들의 자세와 동작이 반복되어 소박한 생활의 리듬을 만들어요.'}
      ]
    },
    shape:{
      intro:'선과 색, 반복과 변형이 어떻게 생각으로 바뀌었는지 문제은행으로 확인해 보세요.',
      questions:[
        {q:'몬드리안의 화면을 나누는 두 가지 기본 방향은 무엇일까요?',options:['수직과 수평','나선과 물결','원과 타원'],answer:0,explain:'수직·수평의 검은 선과 기본색 면만으로 비대칭의 균형을 만들었어요.'},
        {q:'쇠라의 〈그랑드 자트 섬의 일요일 오후〉에서 멀리 볼수록 하나의 색처럼 섞이는 것은?',options:['작은 색점','굵은 연필선','금속 조각'],answer:0,explain:'서로 다른 순수한 색점을 나란히 찍어 관람자의 눈에서 색이 섞이게 했어요.'},
        {q:'마그리트의 〈이미지의 배반〉이 “이것은 파이프가 아니다”라고 말하는 이유는?',options:['파이프가 너무 작아서','그림은 실제 물건이 아니어서','화가가 제목을 잊어서'],answer:1,explain:'그림 속 파이프는 실제로 사용할 수 있는 물건이 아니라 파이프의 이미지예요.'},
        {q:'칸딘스키의 〈구성 VIII〉에서 화면의 리듬을 만드는 주된 요소는 무엇일까요?',options:['원·삼각형·직선 같은 기하학 형태','한 사람의 사실적인 얼굴','같은 크기의 글자'],answer:0,explain:'크기와 방향이 다른 원·선·삼각형이 음악의 음처럼 긴장과 리듬을 만들어요.'},
        {q:'말레비치의 〈검은 사각형〉이 전통적인 그림과 가장 다른 점은?',options:['구체적인 대상을 거의 보여 주지 않는다','원근법으로 도시를 세밀하게 그린다','인물을 사진처럼 묘사한다'],answer:0,explain:'익숙한 대상을 지우고 검은 사각형이라는 가장 단순한 형태 자체에 집중했어요.'},
        {q:'달리의 〈기억의 지속〉에서 현실을 낯설게 바꾸는 대표적인 물체는?',options:['녹아내리는 시계','곧게 선 금속 탑','커다란 유리병'],answer:0,explain:'단단해야 할 시계가 천처럼 늘어져 시간에 대한 꿈같고 불안한 상상을 만들어요.'},
        {q:'세잔의 〈사과와 오렌지〉에서 과일과 식탁이 단단하게 느껴지는 까닭은?',options:['형태를 원기둥·구 같은 덩어리로 보아서','윤곽을 모두 지워서','한 점 원근법만 정확히 따라서'],answer:0,explain:'과일과 그릇, 천을 단순하고 묵직한 색면과 덩어리로 쌓아 화면의 구조를 만들어요.'},
        {q:'마티스의 〈춤〉에서 다섯 인물을 하나로 이어 주는 것은?',options:['서로 맞잡은 손과 둥근 대형','각자 다른 방의 벽','수직으로 선 긴 창문'],answer:0,explain:'맞잡은 손과 휘어진 팔·다리가 큰 원을 이루며 화면 전체를 도는 리듬을 만들어요.'},
        {q:'김홍도의 〈씨름〉에서 관람자의 시선이 경기 중심으로 모이는 까닭은?',options:['구경꾼이 둥글게 둘러앉아서','모두 화면 밖을 바라봐서','배경의 산이 소실점으로 모여서'],answer:0,explain:'구경꾼들이 원형으로 둘러앉고 몸과 시선이 가운데 두 선수에게 향해 중심을 강조해요.'},
        {q:'김홍도의 〈무동〉에서 음악과 춤의 흥을 시각적으로 보여 주는 것은?',options:['연주자와 춤꾼의 둥근 흐름','완전히 멈춘 수평선','빈 화면 한가운데의 사각형'],answer:0,explain:'악사들의 둥근 배치와 무동의 휘어진 소매가 이어져 흥겨운 장단을 눈으로 느끼게 해요.'},
        {q:'고흐의 〈아를의 침실〉에서 공간이 조금 기울고 납작하게 보이는 이유는?',options:['원근과 크기를 의도적으로 단순화해서','거울에 비친 방만 그려서','천장을 위에서 정확히 내려다봐서'],answer:0,explain:'기울어진 바닥과 벽, 단순한 형태와 강한 윤곽이 실제 방을 감정이 담긴 색의 공간으로 바꾸어요.'},
        {q:'마그리트의 〈골콩드〉에서 낯선 느낌을 만드는 반복 대상은?',options:['하늘에 떠 있는 중절모 신사들','바닥에 놓인 사과들','물속을 헤엄치는 물고기들'],answer:0,explain:'비슷한 중절모 신사들이 일정한 간격으로 공중에 반복되어 익숙한 도시를 비현실적인 무늬로 만들어요.'}
      ]
    },
    space:{
      intro:'조각의 부피와 거대한 그림 속 깊이를 몸으로 경험했는지 확인해 보세요.',
      questions:[
        {q:'로댕의 〈생각하는 사람〉 원작 대형 주조본의 재료는 무엇일까요?',options:['청동','종이','유리'],answer:0,explain:'거친 표면과 묵직한 근육을 청동으로 주조해 강한 에너지를 만들었어요.'},
        {q:'〈최후의 만찬〉의 원근선이 모이는 중심은 어디일까요?',options:['예수의 머리 뒤','왼쪽 문 끝','식탁 아래'],answer:0,explain:'벽과 천장의 선이 예수의 머리 뒤 소실점으로 모여 중심과 깊이를 함께 만들어요.'},
        {q:'〈밀로의 비너스〉가 부드럽게 움직이는 것처럼 보이는 까닭은?',options:['몸 전체가 완전한 직선이라서','어깨와 골반이 반대로 기울어서','좌우가 완벽히 대칭이라서'],answer:1,explain:'한쪽 다리에 무게를 싣고 어깨와 골반을 반대로 기울인 자세가 S자 흐름을 만들어요.'},
        {q:'미켈란젤로의 〈다비드〉는 이야기의 어느 순간을 표현했을까요?',options:['싸움을 앞두고 긴장한 순간','승리 뒤 잠든 순간','왕관을 쓰는 순간'],answer:0,explain:'집중한 눈과 팽팽한 몸, 커다란 손이 골리앗과 맞서기 직전의 긴장을 보여 줘요.'},
        {q:'렘브란트의 〈야경〉에서 많은 인물 사이의 깊이와 움직임을 만드는 핵심은?',options:['강한 빛과 어둠의 대비','모두 같은 자세와 크기','배경을 완전히 흰색으로 칠하기'],answer:0,explain:'선택적으로 비추는 빛이 앞뒤 인물을 나누고, 어둠 속에서 행렬이 나아오는 느낌을 만들어요.'},
        {q:'벨라스케스의 〈시녀들〉 뒤쪽 거울에 비친 사람들은 누구일까요?',options:['왕과 왕비','화가의 두 제자','광장의 상인들'],answer:0,explain:'뒤쪽 작은 거울 속 왕과 왕비의 모습이 그림 밖 관람자의 자리까지 작품 공간에 연결해요.'},
        {q:'광화문 앞 해치 조각은 전통적으로 어떤 역할을 맡은 상상 동물일까요?',options:['옳고 그름을 가리고 나쁜 기운을 막는 수호자','비를 부르는 바다의 왕','곡식을 나르는 농사 동물'],answer:0,explain:'해치는 시비와 선악을 가리고 화재와 나쁜 기운을 막는 수호 동물로 여겨졌어요.'},
        {q:'미켈란젤로의 〈피에타〉에서 두 인물을 안정적으로 묶는 큰 구도는?',options:['삼각형','가느다란 수직선','완전한 원'],answer:0,explain:'마리아의 머리에서 넓게 퍼진 옷자락까지 이어지는 삼각형이 예수의 몸을 품으며 안정감을 만들어요.'},
        {q:'베로네세의 〈가나의 혼인잔치〉에서 거대한 공간의 깊이를 만드는 것은?',options:['계단·기둥·건축물이 겹쳐지는 원근','배경을 한 가지 색으로 지우기','인물을 모두 같은 크기로 놓기'],answer:0,explain:'앞쪽 음악가에서 식탁, 계단과 높은 건축물까지 여러 층이 겹쳐져 장대한 무대 같은 깊이가 생겨요.'},
        {q:'피카소의 〈아비뇽의 아가씨들〉에서 여러 시점을 한 화면에 담는 방법은?',options:['몸과 얼굴을 각진 면으로 쪼개기','한 인물만 사진처럼 그리기','배경에 정확한 소실점 하나 두기'],answer:0,explain:'인물의 몸과 얼굴을 날카로운 면으로 나누고 서로 다른 방향의 모습을 한 화면에 결합했어요.'},
        {q:'샤갈의 〈나와 마을〉에서 사람과 염소의 관계를 이어 주는 것은?',options:['서로 마주 보는 눈과 시선','두 인물 사이의 벽','바닥의 철로'],answer:0,explain:'사람과 염소가 가까이 마주 보고 눈을 잇는 흐름이 고향의 기억과 교감을 연결해요.'},
        {q:'라파엘로의 〈아테네 학당〉에서 철학자들이 모인 공간의 중심을 강조하는 것은?',options:['중앙으로 모이는 건축의 원근선','화면을 가득 덮은 나무','인물을 숨기는 짙은 안개'],answer:0,explain:'아치와 바닥의 원근선이 중앙의 플라톤과 아리스토텔레스 쪽으로 모여 웅장한 공간의 중심을 만들어요.'}
      ]
    }
  };

  const OBSERVATION_WORK_IDS = {
    portrait:['p03','p01','p02','p05','p08','p12','p04','p06','p07','p09','p10','p11'],
    nature:['n01','n02','n03','n04','n10','n05','n06','n07','n08','c12','n11','n12'],
    story:['s01','s09','s07','s03','d09','s12','c11','s05','c10','s08','s10','s11'],
    shape:['c01','c06','c09','c02','c03','c04','c07','c08','s02','s06','n09','c05'],
    space:['d01','s04','d05','d02','d07','d08','d13','d06','d14','d10','d11','d12']
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
  let finaleQuizCorrect = 0;
  let finaleQuizQuestions = [];
  const finaleLastQuestionSet = {};
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

  const FINALE_PROGRESS_KEY = 'museumFinaleRoomsV2';

  function readFinaleProgress() {
    try{return JSON.parse(localStorage.getItem(FINALE_PROGRESS_KEY)||'{}')||{};}catch(_){return {};}
  }

  function writeFinaleProgress(progress) {
    try{localStorage.setItem(FINALE_PROGRESS_KEY,JSON.stringify(progress));}catch(_){}
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
    g.fillStyle=complete?'#dbc27c':'#d0b577';g.font='700 27px sans-serif';g.fillText(complete?'관찰 미션 완료':'관람을 마무리하는 5가지 도전',700,628);
    g.fillStyle='#8d806d';g.font='24px sans-serif';g.fillText(complete?'클릭하면 다시 도전할 수 있어요':'가까이에서 클릭해 어린이 큐레이터 도전을 시작하세요',700,681);
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData={finaleTexture:true};return t;
  }

  function addFinaleWall(room,shell) {
    // Match the other galleries' substantial final-board proportions, scaled
    // up to fill the spatial gallery's larger end wall. Venus may overlap it.
    const grand=room.id==='space',panelW=grand?10.9:5.8,panelH=grand?6.85:3.65,panelY=grand?4.4:3.25,z=GALLERY_END+.38;
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
    document.querySelector('.curator-stamp').hidden=false;
    document.getElementById('finale-step').textContent='GALLERY COMPLETE';
    document.getElementById('finale-progress').style.width='100%';
    document.getElementById('finale-total').textContent=`${completedFinaleCount()} / ${rooms.length} ROOMS`;
    document.getElementById('finale-stamp-number').textContent=room.number;
    document.getElementById('finale-complete-title').textContent=newlyCompleted?'관찰의 눈을 얻었어요':'이미 획득한 큐레이터 도장이에요';
    document.getElementById('finale-complete-copy').textContent=completedFinaleCount()===rooms.length?'다섯 전시실의 관찰을 모두 마쳤어요. 이제 이 미술관의 어린이 큐레이터입니다.':`${room.title} 전시실의 작품을 세심하게 관찰했다는 표시예요.`;
  }

  function showFinaleRetry(room) {
    const total=finaleQuizQuestions.length;
    finaleQuestionWrap.hidden=true;finaleComplete.hidden=false;
    document.querySelector('.curator-stamp').hidden=true;
    document.getElementById('finale-step').textContent='TRY AGAIN';
    document.getElementById('finale-progress').style.width='100%';
    document.getElementById('finale-total').textContent=`${completedFinaleCount()} / ${rooms.length} ROOMS`;
    document.getElementById('finale-complete-title').textContent=`${finaleQuizCorrect} / ${total}개를 맞혔어요`;
    document.getElementById('finale-complete-copy').textContent='큐레이터 도장은 다섯 문제를 모두 맞혀야 받을 수 있어요. 작품을 다시 살펴보고 재도전해 보세요.';
  }

  function renderFinaleQuestion() {
    const item=finaleQuizQuestions[finaleQuizIndex];
    finaleQuestionWrap.hidden=false;finaleComplete.hidden=true;finaleNext.hidden=true;
    finaleArtwork.hidden=!item.image;
    if(item.image){finaleArtworkImage.src=item.image;}else{finaleArtworkImage.removeAttribute('src');}
    finaleNext.textContent=finaleQuizIndex===finaleQuizQuestions.length-1?'결과 보기':'다음 관찰로';
    finaleFeedback.textContent='정답이라고 생각하는 장면을 골라보세요.';finaleFeedback.className='finale-feedback';
    document.getElementById('finale-step').textContent=`QUESTION ${String(finaleQuizIndex+1).padStart(2,'0')} / ${String(finaleQuizQuestions.length).padStart(2,'0')}`;
    document.getElementById('finale-progress').style.width=`${finaleQuizIndex/finaleQuizQuestions.length*100}%`;
    document.getElementById('finale-total').textContent=`${completedFinaleCount()} / ${rooms.length} ROOMS`;
    document.getElementById('finale-question').textContent=item.q;
    finaleOptions.replaceChildren(...item.options.map((label,index)=>{
      const button=document.createElement('button');button.type='button';button.className='finale-option';button.dataset.letter=String.fromCharCode(65+index);button.textContent=label;
      button.addEventListener('click',()=>{
        [...finaleOptions.children].forEach(option=>option.disabled=true);
        const correctButton=finaleOptions.children[item.answer];
        correctButton.classList.add('correct');
        if(index===item.answer){finaleQuizCorrect++;finaleFeedback.textContent=item.explain;finaleFeedback.classList.add('correct');window.ClassGameSfx?.play('card');}
        else{button.classList.add('wrong');finaleFeedback.textContent=`아쉬워요. 정답은 ‘${item.options[item.answer]}’예요. ${item.explain}`;}
        finaleNext.hidden=false;
      });return button;
    }));
  }

  function shuffledCopy(items) {
    const result=[...items];
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }

  function buildImageQuestion(room,mode,target) {
    const allWorks=rooms.flatMap(item=>item.works);
    const config={
      title:{key:'title',question:'이 작품의 제목은 무엇일까요?'},
      artist:{key:'artist',question:'이 작품을 만든 작가는 누구일까요?'}
    }[mode];
    const correct=target[config.key];
    const source=mode==='artist'?allWorks:room.works;
    const distractors=shuffledCopy([...new Set(source.map(work=>work[config.key]).filter(value=>value&&value!==correct))]).slice(0,3);
    const explanations={
      title:`이 작품은 ${target.artist}의 〈${target.title}〉예요.`,
      artist:`〈${target.title}〉를 만든 작가는 ${target.artist}예요.`
    };
    return {kind:`image-${mode}`,image:target.image,q:config.question,options:[correct,...distractors],answer:0,explain:explanations[mode]};
  }

  function startFinaleQuiz(room) {
    finaleQuizRoom=room;finaleQuizIndex=0;finaleQuizCorrect=0;
    const works=shuffledCopy(room.works);
    const imageWorks=works.slice(0,2);
    const imageWorkIds=new Set(imageWorks.map(work=>work.id));
    const observations=shuffledCopy(ROOM_QUIZZES[room.id].questions.map((question,index)=>({
      ...question,workId:OBSERVATION_WORK_IDS[room.id][index]
    })).filter(question=>!imageWorkIds.has(question.workId)));
    const imageModes=['title','artist'];
    const selected=[
      buildImageQuestion(room,imageModes[0],imageWorks[0]),
      buildImageQuestion(room,imageModes[1],imageWorks[1]),
      observations[0],
      observations[1],
      observations[2]
    ];
    let signature=selected.map(item=>`${item.kind||'observation'}:${item.image||''}:${item.q}`).sort().join('|');
    if(signature===finaleLastQuestionSet[room.id]&&observations[2]){selected[4]=observations[2];signature=selected.map(item=>`${item.kind||'observation'}:${item.image||''}:${item.q}`).sort().join('|');}
    finaleLastQuestionSet[room.id]=signature;
    finaleQuizQuestions=shuffledCopy(selected.map(item=>{
      const choices=item.options.map((label,index)=>({label,correct:index===item.answer}));
      const randomizedChoices=shuffledCopy(choices);
      return {...item,options:randomizedChoices.map(choice=>choice.label),answer:randomizedChoices.findIndex(choice=>choice.correct)};
    }));
    document.getElementById('finale-kicker').textContent=`GALLERY ${room.number} · CURATOR'S FINAL WALL`;
    document.getElementById('finale-title').textContent=`${room.title} · 관람의 마지막 장면`;
    document.getElementById('finale-intro').textContent=`${ROOM_QUIZZES[room.id].intro} 작품 설명에서 찾을 수 있는 핵심 관찰 문제 3개와 제목·화가 확인 문제 2개가 무작위 순서로 출제됩니다.`;
    renderFinaleQuestion();
  }

  function showFinale(room) {
    window.ClassGameSfx?.play('card');keysClear();
    document.getElementById('finale-kicker').textContent=`GALLERY ${room.number} · CURATOR'S FINAL WALL`;
    document.getElementById('finale-title').textContent=`${room.title} · 관람의 마지막 장면`;
    document.getElementById('finale-intro').textContent=`${ROOM_QUIZZES[room.id].intro} 작품 설명에서 찾을 수 있는 핵심 관찰 문제 3개와 제목·화가 확인 문제 2개가 무작위 순서로 출제됩니다.`;
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
    // Measure while the model is still detached. Once parented, Box3 uses
    // world coordinates and the gallery placement would be subtracted again.
    const bounds=new THREE.Box3().setFromObject(model),naturalH=Math.max(.01,bounds.max.y-bounds.min.y),modelScale=artH/naturalH;
    model.scale.setScalar(modelScale);
    if(work.centerModel){
      const center=bounds.getCenter(new THREE.Vector3());
      model.position.x=-center.x*modelScale;
      model.position.z=-center.z*modelScale;
    }
    model.position.y=pedestalTop-bounds.min.y*modelScale;
    if(work.hasBuiltInBase&&group.userData.label){
      // Anchor the label to the scanned base itself instead of estimating its
      // depth from the artwork dimensions. This keeps the Haechi label attached.
      group.userData.label.position.set(0,.55,model.position.z+bounds.max.z*modelScale+.045);
    }
    group.add(model);
    model.updateMatrix();
    model.traverse(part=>{if(part.isMesh){part.userData.work=work;part.userData.room=rooms[activeRoom];part.castShadow=true;part.receiveShadow=true;clickable.push(part);}});
  }

  function addSculpture(work,index,z,version,roomGallery,xOverride=null) {
    const isGrand=rooms[activeRoom].id==='space';
    const placementZ=z, placementX=Number.isFinite(xOverride)?xOverride:index%2===0?-.75:.75;
    const group=new THREE.Group();group.position.set(placementX,0,z);group.userData.placementZ=placementZ;gallery.add(group);
    const dims=getDisplaySize(work),minH=work.id==='d04'?1.25:1.55,maxH=work.id==='d02'?3.15:work.id==='d04'?1.8:2.75;
    const artH=work.actualScale?work.size.h/100:clamp(dims.h*1.05,minH,maxH),artW=artH*(work.size.w/work.size.h);
    const baseW=work.actualScale?clamp(artW*1.05,1.4,3.1):clamp(artW*.82,.92,1.55),baseH=work.hasBuiltInBase ? .1 : .68+(index%2)*.12;
    if(!work.hasBuiltInBase){
      mesh([baseW+.24,.16,baseW+.24],materials.stone,[0,.08,0],group);
      mesh([baseW,baseH,baseW],new THREE.MeshStandardMaterial({color:index%2?0x4d453c:0x71675b,roughness:.58}),[0,.16+baseH/2,0],group);
    }
    const pedestalTop=work.hasBuiltInBase?0:.16+baseH,scanPath=sculptureScans[work.id];
    const labelWidth=clamp(baseW*.9,1.45,2.25);
    const labelFront=baseW/2+.16;
    const label=makeLabel(work.title,work.artist,labelWidth);
    label.position.set(0,work.hasBuiltInBase ? .55 : baseH*.55,labelFront);
    label.rotation.x=-Math.PI*.04;
    group.userData.label=label;group.add(label);
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
    const sculptureLightY=isGrand?7.65:5.7;
    const spot=new THREE.SpotLight(0xffc77a,work.actualScale?105:175,isGrand?13:10,Math.PI*.2,.62,1.4);spot.position.set(-placementX*.35,sculptureLightY,placementZ+1.35);spot.target.position.set(placementX,pedestalTop+artH*.52,placementZ);spot.castShadow=index%2===0;spot.shadow.mapSize.set(512,512);gallery.add(spot,spot.target);
    const rim=new THREE.PointLight(0xffd6a0,work.actualScale?18:38,5.5,2);rim.position.set(-placementX*.45,pedestalTop+artH*.58,placementZ-1.15);gallery.add(rim);
    sculptureObstacles.push({x:placementX,z:placementZ,r:baseW*.72+.42});
  }

  function setRoom(index,instant=false) {
    const version=++roomLoadVersion;
    setRoomMusic(index);
    activeRoom=index;clickable.length=0;sculptureObstacles.length=0;nearest=null;prompt.hidden=true;loadDone=0;loadTotal=rooms[index].works.length;
    loading.classList.remove('done');loadingBar.style.width='0';loadingText.textContent='0%';
    finaleSurface=null;
    if(gallery){scene.remove(gallery);gallery.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!Array.isArray(o.material)){if(o.material.map?.userData?.finaleTexture)o.material.map.dispose();o.material.dispose();}});}
    gallery=new THREE.Group();scene.add(gallery);const roomGallery=gallery,shell=buildShell(rooms[index]);
    addFinaleWall(rooms[index],shell);
    if(rooms[index].id==='space'){
      const sculptures=rooms[index].works.filter(w=>w.type==='sculpture'), wallWorks=rooms[index].works.filter(w=>w.type!=='sculpture');
      const sculptureOrder=['d05','d01','d02','d13','d06'];
      sculptures.sort((a,b)=>sculptureOrder.indexOf(a.id)-sculptureOrder.indexOf(b.id));
      // Venus occupies the previously empty spot where the detached Haechi
      // label was seen. Haechi stays opposite it with its label on its base.
      const sculptureLayout={d05:{x:-3.8,z:-10.7},d13:{x:3.8,z:-15.5}};
      sculptures.forEach((w,i)=>{
        const placement=sculptureLayout[w.id];
        addSculpture(w,i,placement?.z??1-i*4.85,version,roomGallery,placement?.x??null);
      });
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
  const movementGuide={
    '르네상스':{title:'르네상스',description:'사람과 자연을 자세히 관찰하고, 원근법과 균형 잡힌 구도로 현실 같은 공간을 만들려 한 미술이에요.'},
    '초기 르네상스':{title:'초기 르네상스',description:'고대 그리스·로마 문화에 다시 관심을 두며, 자연스러운 인물과 이야기 장면을 새롭게 그리기 시작한 시기예요.'},
    '성기 르네상스':{title:'성기 르네상스',description:'이상적인 인체, 안정된 구도, 정확한 원근법을 조화롭게 발전시킨 르네상스의 전성기예요.'},
    '바로크':{title:'바로크',description:'강한 빛과 어둠, 깊은 공간, 극적인 순간을 사용해 그림이 눈앞에서 벌어지는 듯 보이게 한 미술이에요.'},
    '로코코':{title:'로코코',description:'밝은 색과 우아한 곡선, 놀이와 사랑 같은 사적인 장면으로 가볍고 경쾌한 분위기를 만든 18세기 미술이에요.'},
    '사실주의':{title:'사실주의',description:'영웅이나 신화보다 당대 사람들이 일하고 살아가는 현실을 진지하게 바라본 19세기 미술이에요.'},
    '인상주의':{title:'인상주의',description:'사물의 정확한 윤곽보다 빛·날씨·색이 만들어 내는 순간의 첫인상을 빠른 붓질로 포착한 미술이에요.'},
    '후기 인상주의':{title:'후기 인상주의',description:'인상주의 이후, 화가가 본 빛의 순간을 넘어 자신의 감정·색·붓질·화면 구조를 더 강하게 드러낸 여러 흐름을 말해요.'},
    '신인상주의':{title:'신인상주의',description:'색채 이론을 바탕으로 작은 순수 색점을 나란히 놓아, 멀리서 볼 때 눈에서 색이 섞여 보이도록 한 미술이에요.'},
    '상징주의':{title:'상징주의',description:'눈앞의 현실을 그대로 설명하기보다, 꿈·불안·소망처럼 보이지 않는 생각과 감정을 상징으로 나타낸 미술이에요.'},
    '입체주의':{title:'입체주의',description:'하나의 대상을 여러 방향에서 본 모습으로 나누고 다시 조합해, 한 화면에 시간과 시점을 함께 담으려 한 미술이에요.'},
    '원시 입체주의':{title:'원시 입체주의',description:'입체주의가 막 시작되던 시기로, 인물과 공간을 날카로운 면으로 단순화하며 기존 원근법을 흔들기 시작했어요.'},
    '야수파':{title:'야수파',description:'자연의 실제 색보다 강렬하고 단순한 색면, 대담한 윤곽선으로 감정과 에너지를 표현한 미술이에요.'},
    '초현실주의':{title:'초현실주의',description:'꿈과 무의식에서 떠오르는 낯선 장면을 사실적으로 그려, 우리가 익숙하다고 믿는 현실을 새롭게 보게 한 미술이에요.'},
    '신조형주의':{title:'신조형주의',description:'수직·수평선과 기본색처럼 아주 제한된 요소로, 누구에게나 통하는 균형과 질서를 찾으려 한 추상 미술이에요.'},
    '절대주의':{title:'절대주의',description:'현실의 사물을 재현하지 않고 단순한 도형과 색만으로 순수한 느낌을 표현하려 한 추상 미술이에요.'},
    '빈 분리파':{title:'빈 분리파',description:'19세기 말 빈에서 기존 미술 제도에서 벗어나, 회화·장식·디자인의 경계를 넘는 새 아름다움을 찾은 예술가 모임이에요.'},
    '매너리즘':{title:'매너리즘',description:'르네상스의 안정된 비례에서 벗어나 길어진 인체, 복잡한 구성, 낯선 아름다움으로 긴장감을 만든 16세기 미술이에요.'},
    '헬레니즘':{title:'헬레니즘',description:'고대 그리스 문화가 넓게 퍼진 시대의 미술로, 인체의 움직임·감정·공간감을 더 생생하게 표현했어요.'},
    '조선 후기':{title:'조선 후기 미술',description:'사람들의 일상, 실제 우리 산천, 생활 속 바람을 가까이 관찰하며 다양한 그림으로 펼쳐 낸 시기예요.'},
    '조선 민화':{title:'조선 민화',description:'생활 가까이에서 그려진 그림으로, 복·장수·좋은 소식 같은 바람을 친근한 상징에 담았어요.'},
    '한국 근대미술':{title:'한국 근대미술',description:'전통과 새로운 시대의 표현을 함께 고민하며, 개인의 감정과 삶을 자신만의 선·색·형태로 드러낸 미술이에요.'},
    '근대 회화':{title:'근대 회화',description:'19세기 후반 화가들이 전통적인 역사화와 사실 묘사에서 벗어나, 지금 살아가는 사람과 새로운 화면 방식을 탐색하며 연 미술이에요.'},
    '조선 시대':{title:'조선 시대 회화',description:'먹과 채색, 세밀한 관찰을 바탕으로 자연·사람·생활의 의미를 담아낸 우리 옛 그림의 흐름이에요.'},
    '소박파':{title:'소박파',description:'전문 미술 교육의 규칙보다 자신만의 선명한 형태와 풍부한 상상력을 따라 독특한 세계를 만든 미술이에요.'},
    '조선 전기':{title:'조선 전기 산수화',description:'산과 물을 따라 시선이 이동하도록 화면을 펼쳐, 현실의 경치와 이상적인 세계를 함께 보여 준 그림이에요.'},
    '기하학적 추상':{title:'기하학적 추상',description:'사물을 그대로 그리지 않고 원·선·삼각형 같은 도형과 색의 관계로 화면의 리듬과 균형을 만든 추상 미술이에요.'},
    '근대 조각':{title:'근대 조각',description:'고전 조각의 매끈한 이상미에서 벗어나, 거친 표면과 긴장된 몸을 통해 인물의 에너지와 내면을 드러낸 조각이에요.'},
    '근대 미술':{title:'근대 미술',description:'19세기 말부터 화가들이 현실을 그대로 재현하는 방식에서 벗어나, 개인의 시선과 새로운 형태를 실험한 미술이에요.'}
  };
  function getMovement(work){return (work.tags||[]).map(tag=>[tag,movementGuide[tag]]).find(([,guide])=>guide);}
  function getExtendedGuide(work){
    if(work.id==='p09')return{
      background:'밀레가 이 그림을 그린 19세기 프랑스에는 농사를 지어 살아가는 사람이 아주 많았어요. 당시 미술에서는 왕이나 영웅을 크게 그리는 일이 흔했지만, 밀레는 평범한 농민의 고된 노동도 중요한 이야기라고 생각했어요. 이런 태도를 사실주의라고 해요.'
    };
    return{
      background:work.styleNote||`${work.year} 무렵, ${work.artist}는 자신만의 눈으로 사람과 세상을 관찰해 이 작품을 만들었어요. 작품이 만들어진 시대와 화가의 생각을 함께 떠올리며 감상해 보세요.`
    };
  }
  function showWork(work,room){
    window.ClassGameSfx?.play('card');
    document.getElementById('modal-image').src=work.image;document.getElementById('modal-image').alt=work.title;
    document.getElementById('modal-type').textContent=work.type==='sculpture'?'SCULPTURE':work.type==='mural'?'MURAL':'PAINTING';
    document.getElementById('modal-room').textContent=`GALLERY ${room.number} · ${room.title}`;document.getElementById('modal-title').textContent=work.title;
    const englishTitle=document.getElementById('modal-title-en');englishTitle.textContent=work.englishTitle||'';englishTitle.hidden=!work.englishTitle;
    const tags=document.getElementById('modal-tags');tags.replaceChildren(...(work.tags||[]).map(label=>{const tag=document.createElement('span');tag.textContent=label;return tag;}));tags.hidden=!work.tags?.length;
    document.getElementById('modal-artist').textContent=work.artist;document.getElementById('modal-year').textContent=work.year;document.getElementById('modal-medium').textContent=work.medium;
    const extendedGuide=getExtendedGuide(work);
    document.getElementById('modal-size').textContent=formatSize(work);document.getElementById('modal-docent').textContent=work.docent;document.getElementById('modal-background').textContent=extendedGuide.background;document.getElementById('modal-point').textContent=work.point;
    const movement=getMovement(work),movementCard=document.getElementById('movement-card');
    movementCard.hidden=!movement;
    if(movement){const [tag,guide]=movement;document.getElementById('movement-title').textContent=guide.title;document.getElementById('movement-description').textContent=guide.description;document.getElementById('movement-connection').textContent=`이 작품에서는 ${tag}의 특징을 찾아볼 수 있어요.`;}
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

  addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowRight','ArrowLeft','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='Escape'){if(finaleModal.open){window.ClassGameSfx?.play('click');finaleModal.close();}else if(modal.open){window.ClassGameSfx?.play('click');modal.close();}}if(e.code==='Enter'&&nearest&&!modal.open&&!finaleModal.open){if(nearest.userData.finaleRoom)showFinale(nearest.userData.finaleRoom);else showWork(nearest.userData.work,nearest.userData.room);}});
  addEventListener('keyup',e=>{keys[e.code]=false;});
  canvas.addEventListener('pointerdown',e=>{dragging=true;pointerDown={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now()};canvas.classList.add('dragging');canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging||!pointerDown)return;const dx=e.clientX-pointerDown.lastX,dy=e.clientY-pointerDown.lastY;pointerDown.lastX=e.clientX;pointerDown.lastY=e.clientY;yaw-=dx*.0032;pitch=clamp(pitch-dy*.0025,-1.15,1.15);});
  canvas.addEventListener('pointerup',e=>{dragging=false;canvas.classList.remove('dragging');if(!pointerDown)return;const moved=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y);if(moved<8&&performance.now()-pointerDown.time<550){pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,false).find(x=>x.distance<10);if(hit){if(hit.object.userData.finaleRoom)showFinale(hit.object.userData.finaleRoom);else showWork(hit.object.userData.work,hit.object.userData.room);}}pointerDown=null;});
  canvas.addEventListener('pointercancel',()=>{dragging=false;pointerDown=null;canvas.classList.remove('dragging');});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));});
  document.getElementById('modal-close').addEventListener('click',()=>modal.close());document.getElementById('help-button').addEventListener('click',()=>helpModal.showModal());document.getElementById('help-close').addEventListener('click',()=>helpModal.close());document.getElementById('finale-close').addEventListener('click',()=>finaleModal.close());
  finaleNext.addEventListener('click',()=>{finaleQuizIndex++;const total=finaleQuizQuestions.length;if(finaleQuizIndex>=total){if(finaleQuizCorrect===total)showFinaleCompletion(finaleQuizRoom,true);else showFinaleRetry(finaleQuizRoom);}else renderFinaleQuestion();});
  document.getElementById('finale-again').addEventListener('click',()=>startFinaleQuiz(finaleQuizRoom));
  for(const d of [modal,helpModal,finaleModal])d.addEventListener('click',e=>{if(e.target===d){window.ClassGameSfx?.play('click');d.close();}});
  document.querySelectorAll('.touch-controls button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;});b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointercancel',()=>keys[k]=false);});

  buildTabs();setRoom(0);connectClassPresence();animate();
})();
