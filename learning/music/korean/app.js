const works=[
 ['court','궁중·정악','종묘제례악','왕실 제례 음악','보태평과 정대업을 중심으로 연주되는 왕실 제례 음악입니다.','편경·편종·대금·피리 등 여러 악기의 질서 있는 합주를 들어 보세요.'],
 ['court','궁중·정악','수제천','관악 합주','느린 장단 위에서 피리가 긴 선율을 이끄는 대표 정악입니다.','피리의 긴 호흡과 장구 장단의 여백을 들어 보세요.'],
 ['court','궁중·정악','여민락','궁중 음악','세종 때의 노래와 음악에서 유래한 궁중 음악입니다.','느린 흐름 속에서 악기들이 선율을 함께 이어 가는 방식을 들어 보세요.'],
 ['folk','민속악','산조','기악 독주와 장단','독주 악기가 느린 장단에서 빠른 장단으로 전개하는 민속 기악입니다.','가야금·거문고·대금 등 독주 악기와 장구의 주고받음을 들어 보세요.'],
 ['folk','민속악','판소리 〈춘향가〉 사랑가','소리와 고수','소리꾼 한 명과 고수가 이야기를 풀어 가는 판소리 대목입니다.','소리꾼의 아니리·창과 고수의 추임새를 구별해 보세요.'],
 ['folk','민속악','농악','농촌 공동체 음악','꽹과리·징·장구·북을 중심으로 연주와 춤, 놀이가 함께 이루어집니다.','꽹과리의 신호와 사물악기의 리듬 변화를 들어 보세요.'],
 ['song','민요·놀이','아리랑','민요','지역마다 서로 다른 가사와 선율로 전해지는 대표 민요입니다.','후렴 “아리랑 아리랑 아라리요”와 지역별 선율 차이를 들어 보세요.'],
 ['song','민요·놀이','강강술래','노래와 원무','보름달 아래 원을 이루어 노래하고 춤추는 전통 놀이입니다.','앞소리와 뒷소리의 주고받음, 점차 빨라지는 움직임을 찾아보세요.'],
 ['creative','창작 국악','아리랑 환상곡','최성환','아리랑 선율을 관현악적으로 변주한 창작 음악입니다.','익숙한 아리랑 선율이 악기와 리듬에 따라 어떻게 바뀌는지 들어 보세요.'],
 ['creative','창작 국악','한국 환상곡','안익태','한국적 선율과 서양 관현악·합창을 결합한 창작 음악입니다.','관현악과 합창이 만드는 규모감, 한국적 선율의 등장을 들어 보세요.']
].map(([group,category,title,form,about,point])=>({group,category,title,form,about,point,url:`https://www.youtube.com/results?search_query=${encodeURIComponent(title+' 국악')}`}));
const info={all:['전체','한국 전통 음악과 창작 국악 10개'],court:['궁중·정악','궁중에서 연주된 정악과 제례 음악'],folk:['민속악','민간에서 전해진 기악·성악·놀이 음악'],song:['민요·놀이','지역의 생활과 공동체 놀이에서 이어진 노래'],creative:['창작 국악','전통 선율과 현대적 편성으로 만든 음악']};
const playlist=document.querySelector('#playlist'),groupInfo=document.querySelector('#group-info');
function render(group='all'){const data=works.filter(w=>group==='all'||w.group===group);const [name,text]=info[group];groupInfo.innerHTML=`<b>${name}</b><span>${text} · ${data.length}곡</span>`;playlist.innerHTML=data.map(w=>`<article><p class="category">${w.category}</p><h3>${w.title}</h3><p class="form">${w.form}</p><a href="${w.url}" target="_blank" rel="noopener">▶ 감상곡 찾아 듣기</a><dl><dt>설명</dt><dd>${w.about}</dd><dt>감상 포인트</dt><dd>${w.point}</dd></dl></article>`).join('')}
render();document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filters .active').classList.remove('active');button.classList.add('active');render(button.dataset.group)}));
