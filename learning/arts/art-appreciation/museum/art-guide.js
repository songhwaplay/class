(function () {
  'use strict';
  const workId = new URLSearchParams(location.search).get('art');
  const rooms = window.MUSEUM_ROOMS || [];
  const room = rooms.find(item => item.works.some(work => work.id === workId));
  const work = room && room.works.find(item => item.id === workId);
  const text = (id, value) => { document.getElementById(id).textContent = value; };
  if (!work) {
    text('guide-title', '찾으려는 작품을 찾지 못했어요');
    return;
  }

  const special = {
    p09: {
      warmup: '세 사람이 왜 허리를 굽혀 이삭을 줍고 있을까요?',
      story: '이삭 줍기는 수확이 끝난 뒤 밭에 남은 곡식을 줍는 일이에요. 그림의 세 여인은 한창 일하고 있고, 멀리에는 큰 수확 더미와 일하는 사람들이 보여요. 같은 들판이지만 서로 아주 다른 하루를 보내고 있다는 것을 느낄 수 있어요.',
      background: '밀레가 이 그림을 그린 19세기 프랑스에는 농사를 지어 살아가는 사람이 아주 많았어요. 당시 미술에서는 왕이나 영웅을 크게 그리는 일이 흔했지만, 밀레는 평범한 농민의 고된 노동도 중요한 이야기라고 생각했어요. 이런 태도를 사실주의라고 해요.',
      clues: '가까이에 있는 세 사람은 크게, 멀리 있는 수확 장면은 작게 그려졌어요. 또 굽은 등의 반복된 곡선은 같은 일을 오래 이어 가는 리듬을 보여 줘요. 밝은 하늘과 묵직한 땅의 색도 눈여겨보세요.',
      talk: '내가 이 들판에 있었다면 세 여인에게 어떤 말을 건네고 싶나요? 그림에서 가장 먼저 눈에 들어온 사람과 그 이유를 친구에게 말해 보세요.'
    }
  };
  const defaults = {
    warmup: `화가가 이 작품에서 가장 먼저 보여 주고 싶었던 것은 무엇일까요?`,
    story: work.docent,
    background: work.styleNote || `${work.year} 무렵, ${work.artist}는 자신만의 눈으로 사람과 세상을 관찰해 이 작품을 만들었어요. 작품이 만들어진 시대와 화가의 생각을 함께 떠올리며 감상해 보세요.`,
    clues: work.point,
    talk: `이 작품의 제목을 내가 새로 붙인다면 무엇이라고 할까요? 그렇게 생각한 그림 속 단서를 한 가지 골라 친구에게 설명해 보세요.`
  };
  const guide = { ...defaults, ...(special[work.id] || {}) };
  document.title = `${work.title} | 작품 자세히 알아보기`;
  text('guide-room', `GALLERY ${room.number} · ${room.title}`);
  text('guide-title', work.title);
  text('guide-artist', `${work.artist} · ${work.year}`);
  const image = document.getElementById('guide-image'); image.src = work.image; image.alt = work.title;
  Object.entries(guide).forEach(([key, value]) => text(`guide-${key}`, value));
}());
