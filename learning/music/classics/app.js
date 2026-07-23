const pieces = [
  ['01','baroque','바로크','사계 〈봄〉 1악장','비발디','협주곡','바이올린','4박자','빠르게','밝고 생기 있게','새소리와 천둥을 묘사하는 독주 바이올린','표제 음악','봄 풍경을 소리로 그린 음악'],
  ['02','baroque','바로크','G선상의 아리아','바흐','관현악 모음곡','현악 합주','4박자','느리게','평온하고 장중하게','길게 이어지는 선율과 고른 저음','선율','숨을 길게 이어 가는 듯한 노래'],
  ['03','baroque','바로크','브란덴부르크 협주곡 5번 1악장','바흐','합주 협주곡','하프시코드','2박자','빠르게','화려하고 활기차게','독주 악기군과 합주가 주고받는 대화','합주 협주곡','하프시코드의 긴 독주 부분'],
  ['04','baroque','바로크','수상 음악 〈알라 혼파이프〉','헨델','관현악 모음곡','금관악기','3박자','보통 빠르게','당당하고 축제처럼','힘찬 금관과 뚜렷한 3박자','모음곡','왕의 뱃놀이를 위해 만든 야외 음악'],
  ['05','baroque','바로크','캐논 라장조','파헬벨','캐논','현악 합주','4박자','보통 빠르게','차분하고 따뜻하게','같은 선율이 차례로 뒤따라 들어옴','돌림노래 원리','반복되는 저음 위에 선율이 겹침'],
  ['06','classical','고전','교향곡 5번 〈운명〉 1악장','베토벤','교향곡','관현악','2박자','매우 빠르게','긴장되고 힘차게','따따따-따 네 음 동기의 반복과 변형','동기','짧은 음악 재료가 곡 전체를 이끔'],
  ['07','classical','고전','교향곡 9번 〈합창〉 4악장','베토벤','교향곡','합창과 관현악','4박자','빠르게','장엄하고 환희에 차게','환희의 주제가 합창과 함께 커짐','주제','교향곡에 성악을 본격적으로 결합'],
  ['08','classical','고전','아이네 클라이네 나흐트무지크 1악장','모차르트','세레나데','현악 합주','4박자','빠르게','밝고 우아하게','힘찬 첫 주제와 부드러운 둘째 주제','소나타 형식','두 성격의 주제가 대비됨'],
  ['09','classical','고전','작은 별 변주곡','모차르트','변주곡','피아노','4박자','보통 빠르게','재치 있고 다채롭게','익숙한 주제가 리듬과 빠르기를 바꿈','변주','하나의 주제가 여러 모습으로 변화'],
  ['10','classical','고전','놀람 교향곡 2악장','하이든','교향곡','관현악','2박자','느리게','평온하다가 익살스럽게','여린 선율 뒤 갑자기 나오는 큰 소리','셈여림','갑작스러운 강한 소리로 놀라게 함'],
  ['11','classical','고전','트럼펫 협주곡 3악장','하이든','협주곡','트럼펫','2박자','빠르게','명랑하고 경쾌하게','독주 트럼펫과 관현악의 주고받음','협주','독주 악기와 관현악이 대비하고 협력'],
  ['12','classical','고전','윌리엄 텔 서곡 〈피날레〉','로시니','서곡','관현악','2박자','매우 빠르게','용감하고 질주하듯','말발굽을 닮은 빠른 리듬','서곡','오페라가 시작되기 전 연주하는 음악'],
  ['13','romantic','낭만','피아노 5중주 〈송어〉 4악장','슈베르트','변주곡','피아노와 현악기','2박자','보통 빠르게','맑고 경쾌하게','주제가 악기를 바꾸며 다섯 번 변주됨','실내악','소수 연주자가 긴밀하게 호흡'],
  ['14','romantic','낭만','마왕','슈베르트','예술가곡','성악과 피아노','4박자','매우 빠르게','불안하고 긴박하게','말발굽 같은 피아노 반주와 역할별 목소리','예술가곡','시와 음악이 결합한 독창곡'],
  ['15','romantic','낭만','녹턴 작품 9-2','쇼팽','녹턴','피아노','4박자','느리게','고요하고 서정적으로','꾸밈음이 더해진 노래하는 오른손 선율','루바토','박자를 유연하게 밀고 당기는 표현'],
  ['16','romantic','낭만','헝가리 무곡 5번','브람스','무곡','관현악','2박자','빠르기의 변화가 큼','정열적이고 익살스럽게','갑작스러운 빠르기와 셈여림 변화','아고기크','빠르기 변화가 춤의 긴장감을 만듦'],
  ['17','romantic','낭만','호두까기 인형 〈꽃의 왈츠〉','차이콥스키','발레 음악','관현악과 하프','3박자','보통 빠르게','화려하고 우아하게','하프 도입과 빙글도는 왈츠 리듬','왈츠','강-약-약으로 흐르는 3박자 춤'],
  ['18','romantic','낭만','백조의 호수 〈정경〉','차이콥스키','발레 음악','오보에와 관현악','4박자','느리게','신비롭고 애잔하게','오보에가 연주하는 슬픈 백조 주제','발레 음악','춤과 극의 장면을 이끄는 관현악'],
  ['19','romantic','낭만','동물의 사육제 〈백조〉','생상스','모음곡','첼로와 피아노','6/4박자','느리게','우아하고 평화롭게','첼로 선율과 잔물결 같은 피아노 반주','음색','첼로가 물 위의 백조를 표현'],
  ['20','romantic','낭만','전람회의 그림 〈키예프의 대문〉','무소륵스키','모음곡','관현악','4박자','장엄하게','웅장하고 찬란하게','큰 종소리 같은 화음과 힘찬 주제','표제 음악','그림에서 받은 인상을 음악으로 표현'],
  ['21','romantic','낭만','신세계 교향곡 2악장','드보르자크','교향곡','잉글리시 호른','4박자','느리게','그립고 평화롭게','잉글리시 호른의 고향을 그리는 선율','민족주의 음악','민속적 선율과 리듬을 예술 음악에 활용'],
  ['22','modern','근현대','볼레로','라벨','관현악곡','스네어드럼과 관현악','3박자','보통 빠르게','집요하고 점차 고조되게','같은 리듬 위 음색과 셈여림이 변화','크레셴도','긴 시간에 걸쳐 점점 크게 연주'],
  ['23','modern','근현대','목신의 오후에의 전주곡','드뷔시','교향시','플루트','자유로운 박자','매우 느리게','몽환적이고 신비롭게','경계가 흐릿한 화음과 유연한 플루트 선율','인상주의','빛과 분위기처럼 순간의 인상을 표현'],
  ['24','modern','근현대','행성 〈목성〉','홀스트','관현악 모음곡','관현악','3박자','빠르게','웅장하고 즐겁게','힘찬 춤 리듬과 넓게 노래하는 중간 선율','관현악법','다양한 악기 음색을 풍부하게 배치'],
  ['25','modern','근현대','피터와 늑대','프로코피예프','음악 동화','관현악과 해설','4박자','보통 빠르게','재치 있고 이야기하듯','등장인물마다 다른 악기와 주제를 사용','라이트모티프','인물이나 생각을 나타내는 반복 주제'],
  ['26','modern','근현대','청소년을 위한 관현악 입문','브리튼','변주곡과 푸가','관현악','3박자','빠르게','선명하고 교육적으로','악기군별 변주 뒤 모든 악기가 푸가로 합류','푸가','주제가 여러 성부에서 차례로 모방'],
  ['27','modern','근현대','랩소디 인 블루','거슈윈','랩소디','피아노와 관현악','4박자','보통 빠르게','도시적이고 자유롭게','클라리넷 글리산도와 재즈 리듬','글리산도','음을 미끄러지듯 연속해서 연주'],
  ['28','modern','근현대','아리랑 환상곡','최성환','관현악 환상곡','관현악','3박자','느리게 시작해 빨라짐','서정적이고 힘차게','아리랑 선율이 여러 악기와 리듬으로 변주','환상곡','정해진 틀보다 자유롭게 전개'],
  ['29','modern','근현대','한국 환상곡','안익태','교향적 환상곡','관현악과 합창','4박자','장엄하게','민족적이고 웅장하게','한국적 선율과 대규모 합창의 결합','민족주의 음악','민족의 역사와 정서를 큰 규모로 표현'],
  ['30','modern','근현대','사브르 댄스','하차투리안','발레 음악','관현악','2박자','매우 빠르게','격렬하고 긴장되게','빠른 리듬과 강한 악센트가 반복됨','발레 음악','발레 〈가야네〉의 한 장면을 위한 음악']
].map(([no,era,period,title,composer,form,lead,meter,tempo,mood,feature,concept,note])=>({no,era,period,title,composer,form,lead,meter,tempo,mood,feature,concept,note,url:`https://www.youtube.com/results?search_query=${encodeURIComponent(`${composer} ${title}`)}`}));

const originalTitles=[
  'Le quattro stagioni: “La primavera”, I','Air from Orchestral Suite No. 3 in D major','Brandenburg Concerto No. 5 in D major, I','Water Music: “Alla Hornpipe”','Canon in D major',
  'Symphony No. 5 in C minor, I','Symphony No. 9 in D minor, IV','Eine kleine Nachtmusik, I','12 Variations on “Ah vous dirai-je, Maman”','Symphony No. 94 “Surprise”, II',
  'Trumpet Concerto in E-flat major, III','Guillaume Tell Overture: Finale','Piano Quintet in A major “Trout”, IV','Erlkönig, D 328','Nocturne in E-flat major, Op. 9 No. 2',
  'Hungarian Dance No. 5','The Nutcracker: “Waltz of the Flowers”','Swan Lake: “Scene”','Le Carnaval des animaux: “Le Cygne”','Pictures at an Exhibition: “The Great Gate of Kyiv”',
  'Symphony No. 9 “From the New World”, II','Boléro','Prélude à l’après-midi d’un faune','The Planets: “Jupiter, the Bringer of Jollity”','Peter and the Wolf, Op. 67',
  'The Young Person’s Guide to the Orchestra','Rhapsody in Blue','Arirang Fantasy','Korea Fantasy','Gayane: “Sabre Dance”'
];
const composerOriginal={
  '비발디':'Antonio Vivaldi','바흐':'Johann Sebastian Bach','헨델':'George Frideric Handel','파헬벨':'Johann Pachelbel','베토벤':'Ludwig van Beethoven','모차르트':'Wolfgang Amadeus Mozart',
  '하이든':'Joseph Haydn','로시니':'Gioachino Rossini','슈베르트':'Franz Schubert','쇼팽':'Frédéric Chopin','브람스':'Johannes Brahms','차이콥스키':'Pyotr Ilyich Tchaikovsky',
  '생상스':'Camille Saint-Saëns','무소륵스키':'Modest Mussorgsky','드보르자크':'Antonín Dvořák','라벨':'Maurice Ravel','드뷔시':'Claude Debussy','홀스트':'Gustav Holst',
  '프로코피예프':'Sergei Prokofiev','브리튼':'Benjamin Britten','거슈윈':'George Gershwin','최성환':'Choi Seong-hwan','안익태':'Ahn Eak-tai','하차투리안':'Aram Khachaturian'
};
const paired=(ko,foreign)=>`${ko} (${foreign})`;
const termMaps={
  period:{'바로크':paired('바로크','Baroque'),'고전':paired('고전','Classical'),'낭만':paired('낭만','Romantic'),'근현대':paired('근현대','Modern & Contemporary')},
  form:{'협주곡':paired('협주곡','concerto'),'관현악 모음곡':paired('관현악 모음곡','orchestral suite'),'합주 협주곡':paired('합주 협주곡','concerto grosso'),'캐논':paired('캐논','canon'),'교향곡':paired('교향곡','symphony'),'세레나데':paired('세레나데','serenade'),'변주곡':paired('변주곡','variations'),'서곡':paired('서곡','overture'),'예술가곡':paired('예술가곡','Lied / art song'),'녹턴':paired('녹턴','nocturne'),'무곡':paired('무곡','dance'),'발레 음악':paired('발레 음악','ballet music'),'모음곡':paired('모음곡','suite'),'교향시':paired('교향시','symphonic poem'),'음악 동화':paired('음악 동화','musical tale'),'변주곡과 푸가':paired('변주곡과 푸가','variations and fugue'),'랩소디':paired('랩소디','rhapsody'),'관현악 환상곡':paired('관현악 환상곡','orchestral fantasia'),'교향적 환상곡':paired('교향적 환상곡','symphonic fantasia'),'영화 음악':paired('영화 음악','film music')},
  tempo:{'매우 빠르게':paired('매우 빠르게','Presto'),'빠르게':paired('빠르게','Allegro'),'보통 빠르게':paired('보통 빠르기로','Moderato'),'느리게':paired('느리게','Adagio'),'매우 느리게':paired('매우 느리게','Lento'),'장엄하게':paired('장엄하게','Maestoso'),'느리게 시작해 빨라짐':'느리게에서 빠르게 (Lento → Allegro)','빠르기의 변화가 큼':paired('빠르기를 유연하게','tempo rubato')},
  meter:{'4박자':paired('4박자','quadruple meter'),'3박자':paired('3박자','triple meter'),'2박자':paired('2박자','duple meter'),'6/4박자':paired('6/4박자','compound duple meter'),'6/8박자':paired('6/8박자','compound duple meter'),'자유로운 박자':paired('자유로운 박자','free meter')},
  concept:{'표제 음악':paired('표제 음악','program music'),'선율':paired('선율','melody'),'합주 협주곡':paired('합주 협주곡','concerto grosso'),'모음곡':paired('모음곡','suite'),'돌림노래 원리':paired('돌림노래 원리','canon'),'동기':paired('동기','motif'),'주제':paired('주제','theme'),'소나타 형식':paired('소나타 형식','sonata form'),'변주':paired('변주','variation'),'셈여림':paired('셈여림','dynamics'),'협주':paired('협주','concerto'),'서곡':paired('서곡','overture'),'실내악':paired('실내악','chamber music'),'예술가곡':paired('예술가곡','Lied / art song'),'루바토':paired('루바토','rubato'),'아고기크':paired('아고기크','agogics'),'왈츠':paired('왈츠','waltz'),'발레 음악':paired('발레 음악','ballet music'),'음색':paired('음색','timbre'),'민족주의 음악':paired('민족주의 음악','musical nationalism'),'크레셴도':paired('크레셴도','crescendo'),'인상주의':paired('인상주의','Impressionism'),'관현악법':paired('관현악법','orchestration'),'라이트모티프':paired('라이트모티프','Leitmotiv'),'푸가':paired('푸가','fugue'),'글리산도':paired('글리산도','glissando'),'환상곡':paired('환상곡','fantasia'),'오스티나토':paired('오스티나토','ostinato')}
};
const instrumentOriginal={'바이올린':'violin','현악 합주':'string ensemble','하프시코드':'harpsichord','금관악기':'brass instruments','관현악':'orchestra','합창과 관현악':'chorus & orchestra','피아노':'piano','트럼펫':'trumpet','피아노와 현악기':'piano & strings','성악과 피아노':'voice & piano','관현악과 하프':'orchestra & harp','오보에와 관현악':'oboe & orchestra','첼로와 피아노':'cello & piano','잉글리시 호른':'English horn','스네어드럼과 관현악':'snare drum & orchestra','플루트':'flute','관현악과 해설':'orchestra & narrator'};
pieces.forEach((p,i)=>{
  p.originalTitle=originalTitles[i];
  p.titleAnswer=paired(p.title,p.originalTitle);
  p.composer=paired(p.composer,composerOriginal[p.composer]);
  ['period','form','tempo','meter','concept'].forEach(key=>{p[key]=termMaps[key][p[key]]||p[key]});
  p.lead=instrumentOriginal[p.lead]?paired(p.lead,instrumentOriginal[p.lead]):p.lead;
});

const levels=['입문','입문','입문','기본','기본','기본','기본','도전','도전','도전'];
const templates=[
  ['제시곡의 제목은 무엇일까요?','titleAnswer'],
  ['제시곡의 작곡가는 누구일까요?','composer'],
  ['제시곡이 속하는 시대는 언제일까요?','period'],
  ['제시곡의 종류 또는 형식은 무엇일까요?','form'],
  ['가장 두드러지게 들리는 악기 편성은 무엇일까요?','lead'],
  ['박자를 느끼며 들었을 때 가장 알맞은 것은 무엇일까요?','meter'],
  ['빠르기를 가장 알맞게 표현한 것은 무엇일까요?','tempo'],
  ['소리로 느껴지는 전체 분위기와 가장 가까운 것은 무엇일까요?','mood'],
  ['실제로 들리는 음악적 특징과 가장 가까운 것은 무엇일까요?','feature'],
  ['감상한 소리와 연결되는 핵심 음악 개념은 무엇일까요?','concept']
];
const pickWrong=(piece,key,seed)=>{
  const ranked=pieces.filter(other=>other!==piece&&other[key]!==piece[key]).sort((a,b)=>{
    const score=item=>(item.era===piece.era?4:0)+(item.form===piece.form?2:0)+(item.lead===piece.lead?1:0);
    return score(b)-score(a);
  });
  const pool=[...new Set(ranked.map(item=>item[key]))],start=seed%pool.length;
  return [...pool.slice(start),...pool.slice(0,start)].slice(0,2);
};
const shuffle=(arr)=>arr.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
const allQuestions=pieces.flatMap((p,pi)=>templates.map(([stem,key],ti)=>{
  const answer=p[key], choices=shuffle([answer,...pickWrong(p,key,pi*11+ti)]);
  return {id:`${p.no}-${ti+1}`,piece:p,level:levels[ti],stem,choices,correct:choices.indexOf(answer),answer,explain:`제시곡은 ${p.title} (${p.originalTitle})입니다. ${answer}. ${p.note}`};
}));

const $=s=>document.querySelector(s);
const playlist=$('#playlist');
const eraInfo={
  all:{title:'전체',period:'바로크~근현대',text:'시대별 감상곡 30개',names:'바흐 · 모차르트 · 베토벤 · 쇼팽 · 라벨'},
  baroque:{title:'바로크',period:'약 1600–1750',text:'규칙적인 리듬, 장식적인 선율, 하프시코드와 대위법이 특징입니다.',names:'바흐 · 헨델 · 비발디'},
  classical:{title:'고전',period:'약 1750–1820',text:'균형 잡힌 형식과 분명한 주제, 교향곡·협주곡이 발달했습니다.',names:'하이든 · 모차르트 · 베토벤'},
  romantic:{title:'낭만',period:'약 1820–1900',text:'개인의 감정, 문학적 이야기, 풍부한 음색과 큰 셈여림 변화를 사용합니다.',names:'슈베르트 · 쇼팽 · 차이콥스키'},
  modern:{title:'근현대',period:'약 1900 이후',text:'새로운 음색과 리듬, 민속 음악·재즈·영화 음악의 영향을 살펴볼 수 있습니다.',names:'드뷔시 · 라벨 · 거슈윈'}
};
function renderEraInfo(era){const info=eraInfo[era];$('#era-info').innerHTML=`<strong>${info.title}</strong><span>${info.period}</span><p>${info.text}</p><small>${info.names}</small>`}
function renderPieces(filter='all'){
  playlist.innerHTML=pieces.filter(p=>filter==='all'||p.era===filter).map(p=>`<article class="piece" data-no="${p.no}">
    <div class="piece-top"><span class="era">${p.period}</span><span>${p.form}</span></div>
    <h3>${p.title}</h3><p class="composer original-title">${p.originalTitle}</p><p class="composer">${p.composer}</p>
    <div class="piece-actions"><a class="listen" href="${p.url}" target="_blank" rel="noopener">▶ 감상곡 찾아 듣기</a><button class="detail-button" type="button" data-detail="${p.no}">＋ 자세한 해설</button></div>
    <dl><div><dt>주요 악기</dt><dd>${p.lead}</dd></div><div><dt>빠르기·박자</dt><dd>${p.tempo} · ${p.meter}</dd></div></dl>
    <p class="listen-point"><b>귀 기울일 곳</b>${p.feature}</p><p class="note"><b>${p.concept}</b> · ${p.note}</p>
  </article>`).join('');
}
renderPieces();
renderEraInfo('all');
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{
  $('.filters .active').classList.remove('active');b.classList.add('active');renderPieces(b.dataset.era);renderEraInfo(b.dataset.era);
}));

const eraGuide={
  baroque:'바로크 시대에는 규칙적인 박자, 화려한 꾸밈, 여러 선율이 겹치는 짜임이 발달했습니다.',
  classical:'고전 시대에는 균형 잡힌 형식과 분명한 주제, 대비가 중요한 표현 원리가 되었습니다.',
  romantic:'낭만 시대에는 개인의 감정과 문학적 이야기, 풍부한 음색과 큰 셈여림 변화가 강조되었습니다.',
  modern:'근현대 음악에서는 새로운 음색과 리듬을 탐구하고 민속 음악·재즈·영화 등 다양한 재료를 받아들였습니다.'
};
const detailDialog=$('#detail-dialog'),detailContent=$('#detail-content');
function openDetail(piece){
  detailContent.innerHTML=`<p class="dialog-era">${piece.period} · ${piece.form}</p>
    <h2 id="detail-title">${piece.title}</h2><p class="dialog-original">${piece.originalTitle}</p><p class="dialog-composer">${piece.composer}</p>
    <section><h3>곡을 만나기 전에</h3><p>${eraGuide[piece.era]} 이 곡은 ${piece.note}라는 점에 주목하면 성격을 쉽게 이해할 수 있습니다.</p></section>
    <section><h3>음악 속 핵심 장면</h3><p>${piece.feature}. ${piece.lead}의 음색이 이 장면을 어떻게 표현하는지 귀 기울여 보세요. 전체적인 분위기는 ‘${piece.mood}’에 가깝습니다.</p></section>
    <section><h3>이렇게 세 번 들어 보세요</h3><ol><li>첫 번째에는 제목만 보고 자유롭게 장면과 느낌을 떠올립니다.</li><li>두 번째에는 ${piece.lead}와 ${piece.meter}를 중심으로 듣습니다.</li><li>세 번째에는 ${piece.concept}이 음악에서 어떻게 나타나는지 찾아 말로 설명합니다.</li></ol></section>
    <section class="detail-summary"><h3>한 줄 정리</h3><p><b>${piece.title}</b>은(는) ${piece.feature}을(를) 중심으로, ${piece.mood} 들려주는 ${piece.form}입니다.</p></section>
    <div class="dialog-actions"><a href="${piece.url}" target="_blank" rel="noopener">▶ 해설을 떠올리며 감상하기</a><button type="button" data-close-detail>닫기</button></div>`;
  detailDialog.showModal();
}
playlist.addEventListener('click',event=>{
  const button=event.target.closest('[data-detail]');if(!button)return;
  openDetail(pieces.find(piece=>piece.no===button.dataset.detail));
});
detailDialog.addEventListener('click',event=>{
  if(event.target===detailDialog||event.target.closest('.dialog-close')||event.target.closest('[data-close-detail]'))detailDialog.close();
});

const storeKey='classics-bank-progress-v1';
let progress=JSON.parse(localStorage.getItem(storeKey)||'{"solved":0,"correct":0,"wrong":[]}');
let current=[];
function save(){localStorage.setItem(storeKey,JSON.stringify(progress));renderStats()}
function renderStats(){
  $('#solved-count').textContent=progress.solved;
  $('#accuracy').textContent=progress.solved?`${Math.round(progress.correct/progress.solved*100)}%`:'—';
  $('#wrong-count').textContent=progress.wrong.length;
}
renderStats();
function makeQuiz(source){
  current=source;$('#quiz-empty').hidden=true;$('.quiz-actions').hidden=false;$('#result').innerHTML='';
  $('#quiz-box').innerHTML=current.map((q,i)=>`<fieldset class="question" data-id="${q.id}"><legend><span>${q.level}</span>${i+1}. ${q.stem}</legend><a class="quiz-listen" href="${q.piece.url}" target="_blank" rel="noopener">▶ 제시곡 먼저 듣기 <small>제목을 보지 말고 귀로 도전!</small></a>${q.choices.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}"><i>${j+1}</i>${a}</label>`).join('')}<p class="feedback"></p></fieldset>`).join('');
}
function startRandom(){
  const era=$('#quiz-era').value,level=$('#quiz-level').value,count=+$('#quiz-count').value;
  const pool=allQuestions.filter(q=>(era==='all'||q.piece.era===era)&&(level==='all'||q.level===level));
  makeQuiz(shuffle(pool).slice(0,Math.min(count,pool.length)));
}
$('#new-quiz').addEventListener('click',startRandom);
$('#next-quiz').addEventListener('click',startRandom);
$('#retry-wrong').addEventListener('click',()=>{
  const pool=allQuestions.filter(q=>progress.wrong.includes(q.id));
  if(!pool.length){$('#result').innerHTML='<p class="result-card">아직 복습할 오답이 없어요. 먼저 새 문제를 풀어 보세요.</p>';return}
  makeQuiz(shuffle(pool).slice(0,20));
});
$('#check-answer').addEventListener('click',()=>{
  let score=0,answered=0;
  current.forEach((q,i)=>{
    const field=$(`fieldset[data-id="${q.id}"]`),checked=field.querySelector(`input[name="q${i}"]:checked`);
    field.querySelectorAll('label').forEach((label,j)=>{label.classList.toggle('answer-correct',j===q.correct);label.classList.toggle('answer-wrong',checked&&+checked.value===j&&j!==q.correct)});
    const ok=checked&&+checked.value===q.correct;if(checked)answered++;if(ok)score++;
    field.querySelector('.feedback').textContent=checked?(ok?`정답! ${q.explain}`:`정답은 ‘${q.answer}’입니다. ${q.explain}`):`답을 고르지 않았어요. 정답은 ‘${q.answer}’입니다.`;
    if(checked){progress.solved++;if(ok){progress.correct++;progress.wrong=progress.wrong.filter(id=>id!==q.id)}else if(!progress.wrong.includes(q.id))progress.wrong.push(q.id)}
  });
  save();
  $('#result').innerHTML=`<div class="result-card"><b>${score} / ${current.length}</b><span>${answered<current.length?`${current.length-answered}문제는 답하지 않았어요. `:''}${score===current.length?'완벽해요! 이번에는 다른 시대에 도전해 보세요.':'틀린 문제는 오답 다시 풀기에 저장했어요.'}</span></div>`;
  $('#result').scrollIntoView({behavior:'smooth',block:'center'});
});
