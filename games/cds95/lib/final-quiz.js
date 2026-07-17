'use strict';

const REGION_LIBRARY_SHELF = Object.freeze({
  '이베리아': '이베리아',
  '프랑스': '지중해',
  '이탈리아': '지중해',
  '발칸': '지중해',
  '브리튼': '북유럽',
  '북유럽': '북유럽',
  '네덜란드': '북유럽',
  '독일': '북유럽',
  '동유럽': '중근동·북아프리카',
  '흑해': '중근동·북아프리카',
  '근동': '중근동·북아프리카',
  '중동': '중근동·북아프리카',
  '북아프리카': '중근동·북아프리카',
  '인도': '인도',
  '중앙아시아': '중앙아시아',
  '동북아시아': '중국·조선',
  '동남아시아': '인도',
  '서아프리카': '중근동·북아프리카',
  '동아프리카': '인도',
  '중앙아메리카': '아메리카',
  '서인도제도': '아메리카',
  '남동아메리카': '아메리카',
  '남서아메리카': '아메리카'
});

const REGIONAL_QUESTIONS = Object.freeze({
  '이베리아': {
    passage: '이베리아반도의 항구들은 대서양과 지중해를 잇는 항로 가까이에 자리했다. 큰 강을 따라 농산물과 광물이 해안으로 들어왔고, 바다에서 온 상품은 강과 육로를 통해 여러 도시로 퍼졌다. 항구는 선박의 보급과 수리에도 이용되었다.',
    prompt: '이 글에 나타난 이베리아 항구의 역할을 가장 잘 설명한 것은?',
    choices: ['바닷길과 내륙 유통망을 연결하는 교역 거점', '해상 운송에 필요한 선박을 전문적으로 생산하는 공업 거점', '왕실의 행정 명령을 주변 지역에 전달하는 정치 거점', '농산물의 생산 시기를 조절하여 가격을 안정시키는 관리 거점'],
    answerIndex: 0,
    explanation: '강과 육로를 통해 들어온 물품이 항구에서 해상 교역과 이어졌으므로 두 유통망을 연결하는 기능이 핵심입니다.'
  },
  '프랑스': {
    passage: '프랑스의 여러 도시는 대서양 연안, 지중해 연안, 큰 강 유역에 나뉘어 발달했다. 강을 따라 곡물과 포도주가 이동했고, 연안 항구에서는 다른 지역의 소금과 직물이 거래되었다. 내륙 시장과 항구 시장은 서로 물품을 주고받았다.',
    prompt: '이 글을 바탕으로 당시 프랑스 교역의 특징을 추론한 것은?',
    choices: ['강과 해안을 잇는 여러 경로가 상품 이동을 뒷받침했을 것이다', '한 도시의 시장 가격이 전국의 거래 조건을 결정했을 것이다', '선박의 크기가 상품의 종류보다 거래 지역을 더 크게 좌우했을 것이다', '항구 주변의 농업 생산이 내륙 시장의 형성을 이끌었을 것이다'],
    answerIndex: 0,
    explanation: '글은 강 유역의 내륙 시장과 두 해안의 항구가 서로 연결되었다고 설명합니다.'
  },
  '이탈리아': {
    passage: '이탈리아반도에는 서로 경쟁하는 도시들이 많았고, 지중해의 항로와 알프스를 넘는 육로가 여러 도시에서 만났다. 상인들은 한 항구에서 받은 상품을 다른 도시의 시장으로 옮기며 금융과 운송 정보를 함께 주고받았다.',
    prompt: '이 글에서 도시들이 성장한 까닭으로 가장 타당한 것은?',
    choices: ['서로 다른 교역 경로와 상업 정보가 도시에서 결합했기 때문이다', '도시 사이의 경쟁이 상품별 거래 조건을 조정했기 때문이다', '산악 지형이 도시 사이의 경쟁을 줄여 주었기 때문이다', '항구의 선박 수가 주변 농업 생산을 직접 늘렸기 때문이다'],
    answerIndex: 0,
    explanation: '해상과 육상 경로, 상품과 정보가 도시에서 만났다는 점이 성장의 근거입니다.'
  },
  '발칸': {
    passage: '발칸 지역은 아드리아해와 에게해, 다뉴브강 유역 사이에 놓여 있었다. 산지가 많아 이동 경로가 제한되었지만, 계곡과 강을 따라 형성된 길은 항구와 내륙 도시를 이어 주었다. 여러 정치 세력이 이 길과 항구를 둘러싸고 경쟁했다.',
    prompt: '이 글에 나타난 발칸 지역 교통의 특징을 정리한 것은?',
    choices: ['이동하기 쉬운 통로에 교역과 정치적 관심이 집중되었다', '해안의 항구가 산지의 이동 경로를 대신해 내륙 교역을 줄였다', '강 유역의 도시는 해상 교역보다 농업 관리에 중점을 두었다', '정치 세력이 해안과 강 유역의 길을 비슷한 비중으로 관리했다'],
    answerIndex: 0,
    explanation: '산지가 이동을 제한했기 때문에 계곡과 강 같은 통로의 가치가 커졌습니다.'
  },
  '브리튼': {
    passage: '브리튼섬의 항구들은 대서양과 북해를 향해 열려 있었고, 강 하구에는 시장 도시가 발달했다. 양모와 금속, 곡물은 내륙에서 항구로 이동했고, 항구에 들어온 상품은 다시 강과 도로를 따라 분배되었다. 조수의 변화는 입출항 시간에도 영향을 주었다.',
    prompt: '이 글을 바탕으로 항구 상인이 고려했을 조건으로 가장 알맞은 것은?',
    choices: ['내륙 운송 경로와 바닷물 높이의 변화를 함께 살폈을 것이다', '상품의 생산량보다 선원의 출신 지역을 우선 확인했을 것이다', '강 하구 시장보다 섬 중앙의 산길을 거래의 중심으로 삼았을 것이다', '항구에 도착한 상품을 해상 운송에 다시 싣는 일을 줄였을 것이다'],
    answerIndex: 0,
    explanation: '상품은 강과 도로로 이동했고 조수가 입출항에 영향을 주었으므로 두 조건을 함께 고려해야 합니다.'
  },
  '북유럽': {
    passage: '북해와 발트해 주변에서는 목재, 곡물, 생선, 모직물 같은 상품이 오갔다. 상인들은 해협과 연안 항로를 이용했으며, 겨울의 결빙과 거친 날씨를 피해 항해 시기를 조절했다. 강을 끼고 있는 항구는 내륙 상품을 모으는 데 유리했다.',
    prompt: '이 글에서 설명한 상인의 항해 계획으로 가장 타당한 것은?',
    choices: ['계절 조건과 내륙 물품의 집결 시기를 함께 고려했을 것이다', '거친 날씨를 활용해 항구에 머무는 기간을 늘렸을 것이다', '연안 항로보다 대양 횡단을 이용해 이동 거리를 줄였을 것이다', '상품의 보관 기간을 줄이기 위해 겨울 출항을 우선했을 것이다'],
    answerIndex: 0,
    explanation: '항해 시기는 날씨의 영향을 받고, 강 항구에는 내륙 상품이 모였으므로 두 시기를 함께 판단하는 것이 합리적입니다.'
  },
  '네덜란드': {
    passage: '네덜란드 지역의 도시는 강 하구와 얕은 바다 가까이에 발달했다. 운하와 강은 내륙의 곡물과 공산품을 항구로 옮겼고, 항구에서는 여러 지역에서 온 화물이 다시 분류되었다. 물길을 관리하는 시설은 도시 생활과 교역에 큰 영향을 주었다.',
    prompt: '이 글에서 물길 관리가 중요했던 이유를 가장 잘 설명한 것은?',
    choices: ['도시의 안전과 상품 운송이 같은 수로 체계에 의존했기 때문이다', '항구의 세금이 운하 건설 비용을 정해 주었기 때문이다', '선박의 크기가 도시 인구의 규모를 결정했기 때문이다', '강 하구의 농경지가 해상 무역의 상품 종류를 제한했기 때문이다'],
    answerIndex: 0,
    explanation: '수로는 생활 공간의 안전과 상품 이동에 함께 관련되어 있었습니다.'
  },
  '독일': {
    passage: '독일 지역에는 여러 영주와 자유도시가 있었고, 라인강과 엘베강 같은 물길을 따라 시장이 이어졌다. 육로를 지나는 상인은 지역마다 다른 통행료와 규칙을 확인해야 했으며, 강 항구에서는 먼 지역의 상품을 다시 실어 나를 수 있었다.',
    prompt: '이 글을 바탕으로 상인이 준비했을 일로 가장 타당한 것은?',
    choices: ['이동 경로별 비용과 환적 장소를 미리 비교했을 것이다', '상품의 품질보다 도시의 인구 규모를 먼저 조사했을 것이다', '강을 이용한 뒤 같은 배로 육상 구간을 계속 이동했을 것이다', '지역 규칙의 차이를 줄이기 위해 거래 도시 수를 늘렸을 것이다'],
    answerIndex: 0,
    explanation: '여러 통행료와 규칙, 강 항구의 환적 가능성을 비교해야 효율적인 경로를 정할 수 있습니다.'
  },
  '동유럽': {
    passage: '동유럽의 평원과 큰 강은 흑해, 발트해, 중앙 유럽을 잇는 이동로로 이용되었다. 곡물과 모피, 목재가 강을 따라 이동했고, 강이 얼거나 수위가 달라지는 시기에는 육로와 보관 시설의 중요성이 커졌다.',
    prompt: '이 글에서 계절 변화가 교역에 끼친 영향으로 가장 타당한 것은?',
    choices: ['운송 수단과 저장 계획을 시기에 맞게 바꾸게 했을 것이다', '강 주변 도시의 상품 종류를 서로 비슷하게 만들었을 것이다', '육상 이동의 거리를 줄여 항구의 역할을 약하게 했을 것이다', '평원의 농업 생산을 해안 지역으로 옮기게 했을 것이다'],
    answerIndex: 0,
    explanation: '강의 결빙과 수위 변화 때문에 육로와 보관 시설을 함께 계획해야 했습니다.'
  },
  '흑해': {
    passage: '흑해 연안의 항구들은 강 유역에서 내려온 곡물과 목재를 지중해 방면으로 보냈다. 해협을 지나야 다른 바다로 나갈 수 있었기 때문에 통과 조건과 주변 정세가 항해 일정에 영향을 주었다. 항구는 내륙과 외해를 잇는 중간 지점이었다.',
    prompt: '이 글에 나타난 흑해 교역의 특징을 가장 잘 정리한 것은?',
    choices: ['강 유역의 생산지와 해협 너머 시장이 항구를 통해 연결되었다', '해협 주변의 정치 상황이 내륙 생산량을 직접 결정했다', '지중해 상인이 강 상류까지 같은 선박으로 이동했다', '연안 항구가 외해 교역보다 지역 소비를 중심으로 운영되었다'],
    answerIndex: 0,
    explanation: '내륙 물품이 항구에 모인 뒤 해협을 지나 다른 시장으로 이동하는 구조입니다.'
  },
  '근동': {
    passage: '근동의 도시들은 지중해 연안 항로와 내륙의 대상로가 만나는 곳에 자리했다. 향신료와 직물, 금속 제품은 여러 상인을 거치며 이동했고, 도시의 창고와 시장에서는 상품과 정보가 함께 교환되었다.',
    prompt: '이 글에서 도시 시장이 맡은 기능으로 가장 알맞은 것은?',
    choices: ['서로 다른 운송망에서 온 상품과 정보를 이어 주는 기능', '상품의 생산 지역을 한곳으로 모아 관리하는 기능', '대상 이동을 대신해 해상 운송을 확대하는 기능', '도시 사이의 가격 차이를 없애 거래를 단순화하는 기능'],
    answerIndex: 0,
    explanation: '연안 항로와 대상로가 만나고 여러 상인이 상품과 정보를 교환했다는 점이 핵심입니다.'
  },
  '중동': {
    passage: '중동의 교역로는 지중해, 홍해, 페르시아만과 내륙의 오아시스 도시를 연결했다. 긴 육로에서는 물과 사료를 구할 수 있는 중간 지점이 중요했고, 항구에서는 계절풍과 선박의 출항 시기를 확인해야 했다.',
    prompt: '이 글을 바탕으로 장거리 교역의 성공 조건을 추론한 것은?',
    choices: ['육상 보급 지점과 해상 출항 시기를 연속된 계획으로 세웠을 것이다', '항구의 창고 규모에 맞추어 오아시스의 위치를 정했을 것이다', '대상로의 이동 속도를 높이기 위해 해상 운송을 줄였을 것이다', '계절풍이 바뀌는 시점보다 항구의 거래량을 우선했을 것이다'],
    answerIndex: 0,
    explanation: '육상에서는 보급 지점, 해상에서는 계절풍과 출항 시기가 중요했으므로 전체 여정을 연결해 계획해야 합니다.'
  },
  '북아프리카': {
    passage: '북아프리카의 해안 도시는 지중해 항로와 사하라를 건너는 대상로가 만나는 곳이었다. 소금과 금, 직물과 곡물은 서로 다른 환경을 거쳐 이동했으며, 대상이 도착하는 시기와 선박의 출항 시기가 시장 활동에 영향을 주었다.',
    prompt: '이 글에서 해안 도시의 경제가 활발해진 까닭으로 가장 타당한 것은?',
    choices: ['사막 교역과 해상 교역의 일정이 도시 시장에서 이어졌기 때문이다', '해안의 농업 생산이 사막 지역의 보급 문제를 해결했기 때문이다', '선박이 대상보다 많은 상품을 생산지에서 직접 모았기 때문이다', '시장 상인이 교역 경로의 기후 차이를 줄였기 때문이다'],
    answerIndex: 0,
    explanation: '대상로와 지중해 항로가 해안 도시에서 연결되었다는 점이 경제 활동의 근거입니다.'
  },
  '인도': {
    passage: '인도양에서는 계절에 따라 바람의 방향이 달라졌다. 인도의 항구 상인들은 면직물과 향신료를 준비하면서 출항 시기와 귀항 시기를 계산했고, 바람이 바뀌는 동안에는 항구에서 상품을 보관하거나 다른 시장과 거래했다.',
    prompt: '이 글에 나타난 계절풍의 영향으로 가장 알맞은 것은?',
    choices: ['항해 일정과 항구 체류 계획을 함께 세우게 했다', '상품의 생산량을 바람의 방향에 맞추어 결정하게 했다', '귀항 항로를 출항 항로보다 짧게 선택하게 했다', '항구 사이의 가격 차이를 줄이는 거래 관행을 만들었다'],
    answerIndex: 0,
    explanation: '바람의 방향이 바뀌므로 출항과 귀항, 대기 기간을 함께 계획해야 했습니다.'
  },
  '중앙아시아': {
    passage: '중앙아시아의 교역은 넓은 초원과 사막 사이의 오아시스 도시를 따라 이루어졌다. 대상은 한 번에 전 구간을 지나기보다 중간 시장에서 짐승과 물자를 바꾸고 다음 구간의 정보를 얻었다. 각 도시는 장거리 이동의 연결점이 되었다.',
    prompt: '이 글에서 오아시스 도시의 역할을 가장 잘 설명한 것은?',
    choices: ['장거리 이동을 여러 구간으로 이어 주는 보급과 교환의 거점', '대상의 출발지를 정해 교역 방향을 통제하는 행정 거점', '초원의 생산물을 사막 환경에 맞게 가공하는 공업 거점', '여러 교역로의 거리를 일정하게 조정하는 측량 거점'],
    answerIndex: 0,
    explanation: '대상이 물자와 정보를 바꾸며 다음 구간으로 이동했으므로 오아시스는 구간을 이어 주는 거점이었습니다.'
  },
  '동북아시아': {
    passage: '동북아시아에서는 큰 강과 운하, 연안 항로가 도시와 농업 지역을 연결했다. 곡물과 도자기, 비단은 내륙 수로를 따라 항구로 이동했고, 바다에서 들어온 물품은 다시 지역 시장으로 분배되었다. 계절과 국가의 통제도 교역 방식에 영향을 주었다.',
    prompt: '이 글에 나타난 물류 구조를 가장 잘 정리한 것은?',
    choices: ['내륙 수로와 연안 항로가 서로 이어져 상품의 이동 범위를 넓혔다', '국가의 통제가 내륙 수로보다 연안 항로의 이용을 늘렸다', '바다에서 온 물품이 항구 주변의 시장 형성을 줄였다', '연안 항로가 발달하면서 강과 운하의 운송 기능이 약해졌다'],
    answerIndex: 0,
    explanation: '내륙 수로로 항구에 모인 상품과 바다에서 들어온 상품이 다시 지역으로 이동했습니다.'
  },
  '동남아시아': {
    passage: '동남아시아의 섬과 반도 사이에는 여러 해협이 있었고, 계절풍을 이용하는 선박들이 이 길을 지났다. 항구 도시에서는 중국, 인도, 서아시아에서 온 상품이 옮겨 실렸으며, 선원들은 다음 바람을 기다리며 머물기도 했다.',
    prompt: '이 글에서 해협 주변 항구가 성장한 까닭으로 가장 타당한 것은?',
    choices: ['여러 항로의 화물과 항해 일정이 항구에서 조정되었기 때문이다', '섬 사이의 거리가 짧아 상품 보관이 필요하지 않았기 때문이다', '계절풍이 항구마다 다른 방향으로 불어 거래가 분리되었기 때문이다', '외국 선박이 내륙 시장을 거치지 않고 생산지를 관리했기 때문이다'],
    answerIndex: 0,
    explanation: '여러 지역의 화물이 환적되고 선박이 바람을 기다렸으므로 항구가 항로와 일정을 조정하는 지점이었습니다.'
  },
  '서아프리카': {
    passage: '서아프리카에서는 사헬과 사하라를 잇는 대상로, 큰 강의 수운, 대서양 연안 항로가 서로 다른 지역을 연결했다. 금과 소금, 직물과 농산물은 여러 시장을 거치며 이동했고, 교역로가 만나는 도시에는 상인과 정보가 모였다.',
    prompt: '이 글에서 교역 도시가 성장한 이유를 가장 잘 설명한 것은?',
    choices: ['서로 다른 환경의 운송망과 상품이 도시에서 연결되었기 때문이다', '강을 이용한 운송이 사막 대상의 이동을 대신했기 때문이다', '대서양 항로가 내륙 시장의 상품 가격을 정해 주었기 때문이다', '교역 도시가 주변 생산지를 같은 방식으로 운영했기 때문이다'],
    answerIndex: 0,
    explanation: '대상로, 강 수운, 연안 항로가 만나면서 상품과 정보가 집중되었습니다.'
  },
  '동아프리카': {
    passage: '동아프리카 해안의 항구들은 인도양 계절풍을 이용하는 선박과 내륙 교역망을 연결했다. 금과 상아 같은 물품이 해안으로 이동했고, 직물과 도자기 같은 상품은 항구를 거쳐 다른 지역으로 퍼졌다. 출항 시기는 바람의 변화와 관련되었다.',
    prompt: '이 글에 나타난 항구 상인의 판단으로 가장 타당한 것은?',
    choices: ['내륙 물품의 도착과 계절풍의 전환 시기를 함께 살폈을 것이다', '해안 시장의 규모에 맞추어 계절풍의 방향을 예측했을 것이다', '선박의 출항을 늘리기 위해 내륙 운송 시기를 늦추었을 것이다', '항구의 상품 종류를 줄여 바람 변화에 대응했을 것이다'],
    answerIndex: 0,
    explanation: '내륙에서 상품이 도착해야 하고 계절풍이 맞아야 출항할 수 있으므로 두 시기를 함께 고려해야 합니다.'
  },
  '중앙아메리카': {
    passage: '중앙아메리카는 두 대륙과 두 바다 사이에 놓여 있었고, 산지와 해안 평야를 따라 여러 지역 사회가 교류했다. 유럽 선박이 도착한 뒤 해안 항구와 내륙 길의 연결 방식이 달라졌으며, 기존 시장망 위에 새로운 교역 경로가 더해졌다.',
    prompt: '이 글에서 교역망의 변화를 가장 잘 설명한 것은?',
    choices: ['기존의 지역 교류망에 바다를 통한 새로운 연결이 겹쳐졌다', '해안 항구의 성장으로 산지 시장의 거래 시기가 조정되었다', '유럽 선박의 도착이 두 바다 사이의 지형을 바꾸었다', '새로운 교역 경로가 기존의 상품과 이동 경험을 활용하지 않았다'],
    answerIndex: 0,
    explanation: '기존 시장망이 사라졌다고 하지 않고 그 위에 새로운 해상 경로가 더해졌다고 설명합니다.'
  },
  '서인도제도': {
    passage: '서인도제도의 섬들은 대서양 항로와 카리브해 항로 사이에 놓여 있었다. 선박은 물과 식량을 보급하고 바람과 해류를 확인하기 위해 섬의 항구에 들렀으며, 섬 사이의 짧은 항해와 대양 횡단 항해가 같은 항구에서 이어졌다.',
    prompt: '이 글에서 섬 항구의 역할로 가장 알맞은 것은?',
    choices: ['서로 규모가 다른 항해를 이어 주는 보급과 항로 판단의 거점', '섬 사이의 상품 생산을 조정하여 대양 교역량을 정하는 거점', '대양을 건넌 선박의 항해 방식을 연안 선박에 통일하는 거점', '바람과 해류의 영향을 줄이기 위해 선박을 장기간 보관하는 거점'],
    answerIndex: 0,
    explanation: '항구는 보급과 자연조건 확인을 돕고 섬 항해와 대양 항해를 연결했습니다.'
  },
  '남동아메리카': {
    passage: '남아메리카 남동부의 큰 강 유역은 내륙과 대서양 연안을 연결했다. 가축 생산물과 농산물, 광물은 강과 육로를 따라 항구로 이동했고, 강 하구의 도시는 여러 방향에서 온 화물을 모아 선박에 실었다.',
    prompt: '이 글에서 강 하구 도시가 성장한 이유로 가장 타당한 것은?',
    choices: ['넓은 내륙의 물품을 해상 운송과 연결하기에 유리했기 때문이다', '강의 수위가 상품의 생산량을 일정하게 유지했기 때문이다', '항구 선박이 내륙의 육상 운송을 직접 관리했기 때문이다', '대서양 시장의 수요가 강 유역 도시의 출항 시기를 정했기 때문이다'],
    answerIndex: 0,
    explanation: '강과 육로로 모인 내륙 물품을 대서양 선박에 싣는 연결 기능이 도시 성장의 근거입니다.'
  },
  '남서아메리카': {
    passage: '남아메리카 서부에서는 높은 산지와 태평양 연안 사이의 이동이 쉽지 않았다. 산지의 길과 계곡은 광물과 농산물을 해안으로 옮기는 통로가 되었고, 항구에서는 연안 항해를 통해 다른 지역과 교류했다. 지형에 맞는 중간 거점이 중요했다.',
    prompt: '이 글에서 중간 거점이 필요했던 이유를 가장 잘 설명한 것은?',
    choices: ['고도가 다른 지역의 운송 방식을 이어 주어야 했기 때문이다', '산지의 생산물을 해안 기후에 맞게 재배해야 했기 때문이다', '연안 선박의 항로를 산길의 방향과 같게 정해야 했기 때문이다', '계곡의 도시가 항구의 선박 수를 조절해야 했기 때문이다'],
    answerIndex: 0,
    explanation: '산지 길과 연안 항해는 운송 방식이 다르므로 중간 거점에서 연결할 필요가 있었습니다.'
  }
});

const GENERAL_QUESTIONS = Object.freeze([
  {
    passage: '한 상인은 출항 전 지도에 표시된 직선 항로가 가장 짧다고 판단했다. 그러나 현지 항해사는 그 길에 얕은 모래톱과 계절성 역풍이 있어, 섬의 남쪽을 돌아가는 항로가 실제로는 더 빠를 수 있다고 설명했다.',
    prompt: '두 사람의 판단이 달라진 까닭을 가장 잘 설명한 것은?',
    choices: ['지도상의 거리와 실제 이동 조건을 서로 다르게 고려했기 때문이다', '상인이 선박의 적재량을 항해사보다 적게 계산했기 때문이다', '항해사가 섬의 시장 가격을 항로 선택에 반영했기 때문이다', '상인이 계절에 따라 지도의 축척이 달라진다고 보았기 때문이다'],
    answerIndex: 0,
    explanation: '상인은 직선거리, 항해사는 수심과 바람을 포함한 실제 이동 조건을 판단했습니다.'
  },
  {
    passage: '같은 항구를 다녀온 두 기록자는 도시를 다르게 묘사했다. 왕실 관리의 보고서는 세금 수입과 성벽을 자세히 적었고, 상인의 편지는 시장의 물가와 창고 사정을 길게 다루었다.',
    prompt: '두 기록의 차이를 해석한 것으로 가장 타당한 것은?',
    choices: ['기록자의 목적과 관심이 선택한 정보에 영향을 주었다', '기록 시점의 차이가 두 사람이 살핀 장소를 달리하게 했다', '두 기록자가 이용한 정보원의 범위가 서술 분량을 정했다', '도시 안에서 맡은 업무가 관찰 순서에 차이를 만들었다'],
    answerIndex: 0,
    explanation: '같은 도시를 보아도 기록 목적이 다르면 강조하는 정보가 달라질 수 있습니다.'
  },
  {
    passage: '어느 선단은 빠른 배에 값비싼 상품을 싣고 먼저 출발시켰다. 무거운 보급품은 큰 배에 나누어 실었고, 두 배는 폭풍이 잦은 해역을 지난 뒤 정해 둔 항구에서 다시 만나기로 했다.',
    prompt: '이 선단이 사용한 전략을 가장 잘 정리한 것은?',
    choices: ['화물의 성격에 따라 운송 방식과 합류 지점을 나누었다', '빠른 배의 안전을 위해 보급품 사용을 줄였다', '폭풍 해역에서 두 배의 이동 속도를 같게 맞추었다', '큰 배의 적재 공간을 확보하기 위해 상품 가격을 조정했다'],
    answerIndex: 0,
    explanation: '상품과 보급품을 서로 다른 배에 배치하고 합류 장소를 정했습니다.'
  },
  {
    passage: '한 도시의 곡물 가격이 올랐다는 소식이 전해졌다. 상인은 곧바로 출항하지 않고, 소식이 언제 작성되었는지와 항구까지 걸리는 시간을 확인했다. 도착할 때에는 다른 선박도 곡물을 들여와 가격이 달라질 수 있었기 때문이다.',
    prompt: '상인이 확인하려 한 핵심은 무엇인가?',
    choices: ['정보가 실제 거래 시점에도 유효할 가능성', '곡물의 생산지가 항구와 같은 행정구역인지 여부', '다른 선박의 선원이 같은 소식을 들었는지 여부', '가격 소식을 작성한 사람의 항해 경험'],
    answerIndex: 0,
    explanation: '정보의 작성 시점과 이동 시간을 따져 도착 시점에도 가격 정보가 쓸모 있는지 판단했습니다.'
  },
  {
    passage: '강을 따라 내려오던 배가 수위가 낮아진 구간에서 멈추었다. 선원들은 화물을 작은 배로 나누어 옮긴 뒤 하류의 깊은 물에서 다시 큰 배에 실었다. 시간이 더 들었지만 상품을 목적지까지 보낼 수 있었다.',
    prompt: '이 사례에서 문제를 해결한 방법을 가장 잘 설명한 것은?',
    choices: ['환경 조건에 맞추어 운송 수단을 구간별로 바꾸었다', '화물의 양을 줄여 강의 수위를 높였다', '하류의 항구를 이용해 목적지를 변경했다', '큰 배의 속도를 낮춰 얕은 구간을 통과했다'],
    answerIndex: 0,
    explanation: '얕은 구간에서는 작은 배, 깊은 구간에서는 큰 배를 사용해 구간별로 운송 방식을 바꾸었습니다.'
  },
  {
    passage: '두 항구 사이의 항로에는 바람을 정면으로 받는 짧은 길과, 바람을 비스듬히 받으며 이동하는 긴 길이 있었다. 선장은 선박의 돛 성능과 식량의 양을 확인한 뒤 항로를 결정했다.',
    prompt: '선장이 비교한 내용을 가장 잘 정리한 것은?',
    choices: ['항로 거리와 실제 항해 효율 사이의 관계', '식량의 가격과 돛의 제작 비용 사이의 관계', '두 항구의 인구와 선박 크기 사이의 관계', '바람의 세기와 상품 품질 사이의 관계'],
    answerIndex: 0,
    explanation: '짧은 거리라도 역풍이면 느릴 수 있으므로 거리와 실제 이동 효율을 비교했습니다.'
  }
]);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffledQuestion(source) {
  const indexed = source.choices.map((text, index) => ({ text, correct: index === source.answerIndex }));
  for (let i = indexed.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    ...source,
    choices: indexed.map((item) => item.text),
    answerIndex: indexed.findIndex((item) => item.correct)
  };
}

function uniqueChoices(values, correct) {
  const result = [];
  for (const value of values) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || result.includes(n)) continue;
    result.push(n);
  }
  let step = 10;
  while (result.length < 4) {
    const candidate = correct + step;
    if (!result.includes(candidate)) result.push(candidate);
    step += 10;
  }
  return result.slice(0, 4);
}

function calculationQuestion() {
  const kind = randomInt(0, 2);
  if (kind === 0) {
    const quantity = randomInt(6, 12);
    const buyPrice = randomInt(4, 9) * 10;
    const margin = randomInt(2, 5) * 10;
    const sellPrice = buyPrice + margin;
    const transportCost = randomInt(2, 8) * 10;
    const answer = quantity * margin - transportCost;
    const choices = uniqueChoices([
      answer,
      quantity * margin,
      quantity * sellPrice - transportCost,
      answer + buyPrice
    ], answer).map((n) => `${n}닢`);
    return shuffledQuestion({
      passage: `향신료 ${quantity}상자를 상자당 ${buyPrice}닢에 샀다. 모두 상자당 ${sellPrice}닢에 팔았고 운송비로 ${transportCost}닢을 지불했다.`,
      prompt: '이 거래에서 얻은 이익은 얼마인가?',
      choices,
      answerIndex: 0,
      explanation: `판매 이익은 (${sellPrice}-${buyPrice})×${quantity}-${transportCost}=${answer}닢입니다.`
    });
  }
  if (kind === 1) {
    const sailors = randomInt(6, 12);
    const days = randomInt(4, 9);
    const dailyWater = randomInt(2, 4);
    const reserve = randomInt(2, 5) * 10;
    const answer = sailors * days * dailyWater + reserve;
    const choices = uniqueChoices([
      answer,
      sailors * days * dailyWater,
      (sailors + dailyWater) * days + reserve,
      sailors * (days + dailyWater) + reserve
    ], answer).map((n) => `${n}통`);
    return shuffledQuestion({
      passage: `선원 ${sailors}명이 ${days}일 동안 항해한다. 한 사람은 하루에 식수 ${dailyWater}통을 사용하며, 비상용 식수 ${reserve}통도 싣기로 했다.`,
      prompt: '준비해야 할 식수는 모두 몇 통인가?',
      choices,
      answerIndex: 0,
      explanation: `${sailors}×${days}×${dailyWater}+${reserve}=${answer}통입니다.`
    });
  }
  const food = randomInt(2, 4) * 10;
  const water = randomInt(1, 3) * 10;
  const tool = randomInt(1, 2) * 10;
  const answer = randomInt(2, 6) * 10;
  const capacity = food + water + tool + answer;
  const choices = uniqueChoices([
    answer,
    capacity - food - water,
    capacity - food - tool,
    capacity - water - tool
  ], answer).map((n) => `${n}상자`);
  return shuffledQuestion({
    passage: `배의 적재 한도는 ${capacity}상자이다. 식량 ${food}상자, 식수 ${water}상자, 수리 도구 ${tool}상자를 먼저 실었다.`,
    prompt: '추가로 실을 수 있는 상품은 몇 상자인가?',
    choices,
    answerIndex: 0,
    explanation: `${capacity}-${food}-${water}-${tool}=${answer}상자입니다.`
  });
}

function destinationRegionalQuestion(targetPlace) {
  const category = String(targetPlace?.category || '');
  if (category === '해협') {
    return {
      passage: '해협은 두 육지 사이의 좁은 물길로, 서로 다른 바다를 잇는 항로가 집중되기 쉽다. 선박이 한정된 통로를 함께 이용하므로 바람과 해류, 수심, 통과 순서를 살피는 일이 중요하다.',
      prompt: '이 자료를 바탕으로 해협을 지나는 선장이 우선 비교할 조건은?',
      choices: ['통로의 자연조건과 선박이 몰리는 시간대', '주변 도시의 농산물 가격과 선원의 식사량', '출발 항구의 인구와 목적지의 건축 양식', '선박의 국적과 항구 창고의 지붕 재료'],
      answerIndex: 0,
      explanation: '좁은 통로에서는 바람·해류·수심과 선박 통행 상황이 안전한 항해에 직접 영향을 줍니다.'
    };
  }
  if (['반도', '제도', '열도', '곶'].includes(category)) {
    return {
      passage: '바다와 맞닿은 육지나 여러 섬으로 이루어진 지역에서는 연안 항로와 내륙 이동로가 항구에서 이어진다. 바람과 해류에 따라 접근하기 좋은 해안이 달라지고, 항구 사이의 짧은 항해가 장거리 항로와 연결되기도 한다.',
      prompt: '이 자료에 나타난 해안 지역의 교통 특징을 가장 잘 정리한 것은?',
      choices: ['연안의 자연조건과 육상 연결을 함께 고려해야 한다', '내륙 도로의 폭이 먼바다 항로의 방향을 정한다', '섬의 수가 항구에서 거래되는 상품 가격을 결정한다', '장거리 선박의 크기가 해안 지형의 형태를 바꾼다'],
      answerIndex: 0,
      explanation: '해안 접근 조건과 항구에서 이어지는 육상·연안 교통을 함께 살펴야 합니다.'
    };
  }
  if (['강 하구', '삼각주', '폭포'].includes(category)) {
    return {
      passage: '강의 하류에서는 내륙에서 내려온 물품이 모이고, 수심이나 물살이 달라지는 지점에서 배와 운송 방식이 바뀌기도 한다. 바다와 만나는 곳의 항구는 강 수운과 해상 운송을 연결한다.',
      prompt: '이 자료에서 강 하류의 거점이 맡은 역할로 가장 알맞은 것은?',
      choices: ['물길의 조건이 달라지는 구간에서 운송을 이어 주는 역할', '강 상류의 생산량을 정해 항구의 거래량을 조절하는 역할', '해상 선박의 항로를 내륙 도로와 같은 방향으로 맞추는 역할', '강 주변 도시의 시장 시간을 한 일정으로 정리하는 역할'],
      answerIndex: 0,
      explanation: '강과 바다 또는 서로 다른 수심 구간 사이에서 화물과 운송 수단을 연결하는 기능이 핵심입니다.'
    };
  }
  if (['산맥', '사막', '지구대', '지협'].includes(category)) {
    return {
      passage: '이동이 어려운 지형에서는 물과 식량을 구할 수 있는 곳, 경사가 완만한 길, 통과 가능한 좁은 구간이 중요한 경로가 된다. 상인은 거리와 함께 보급 가능성과 지형의 위험을 비교해 이동 계획을 세웠다.',
      prompt: '이 자료를 바탕으로 이동 경로를 선택할 때 가장 중요한 판단은?',
      choices: ['거리와 보급·지형 조건을 함께 비교하는 것', '상품의 판매 가격으로 지형의 높이를 계산하는 것', '이동 인원에 따라 산지와 평야의 위치를 바꾸는 것', '출발지의 시장 규모로 중간 거점의 기후를 예측하는 것'],
      answerIndex: 0,
      explanation: '험한 지형에서는 짧은 거리보다 통과 가능성과 보급 조건이 실제 이동에 더 중요할 수 있습니다.'
    };
  }
  return {
    passage: '한 지역의 교역은 해안과 강, 육로의 위치뿐 아니라 계절별 날씨와 보급 가능한 거점의 영향을 받는다. 상인은 지도에 표시된 거리와 실제 이동에 필요한 시간·비용을 함께 비교했다.',
    prompt: '이 자료가 강조하는 지역 이해 방법으로 가장 알맞은 것은?',
    choices: ['지도상의 위치와 실제 이동 조건을 함께 살피는 것', '도시의 이름으로 거래 상품의 양을 예상하는 것', '항구의 크기로 주변 지역의 기후를 판단하는 것', '육로의 길이로 선박의 적재량을 계산하는 것'],
    answerIndex: 0,
    explanation: '위치 정보에 날씨, 보급, 시간과 비용을 더해 실제 이동 가능성을 판단해야 합니다.'
  };
}

function createFinalQuiz(targetPlace) {
  const region = String(targetPlace?.region || '');
  const regional = REGIONAL_QUESTIONS[region] || destinationRegionalQuestion(targetPlace);
  const general = GENERAL_QUESTIONS[randomInt(0, GENERAL_QUESTIONS.length - 1)];
  const targetName = String(targetPlace?.name || '목적지');
  const localQuestion = shuffledQuestion({
    ...regional,
    passage: `목적지 ‘${targetName}’ 주변의 ${region || '해당'} 지역에 관한 자료이다.\n\n${regional.passage}`
  });
  return {
    version: 1,
    questionCount: 3,
    targetPlaceId: targetPlace?.id || null,
    targetPlaceName: targetName,
    targetRegion: region,
    questions: [
      { id: 'regional', type: 'regional-reading', label: '지역 역사·지리', ...localQuestion },
      { id: 'reading', type: 'general-reading', label: '자료 해석', ...shuffledQuestion(general) },
      { id: 'calculation', type: 'calculation', label: '계산', ...calculationQuestion() }
    ]
  };
}

function publicQuiz(quiz, includeResults = false) {
  if (!quiz) return null;
  return {
    version: quiz.version,
    questionCount: quiz.questionCount,
    targetPlaceId: quiz.targetPlaceId,
    targetPlaceName: quiz.targetPlaceName,
    targetRegion: quiz.targetRegion,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      type: question.type,
      label: question.label,
      passage: question.passage,
      prompt: question.prompt,
      choices: [...question.choices],
      ...(includeResults ? { answerIndex: question.answerIndex, explanation: question.explanation } : {})
    }))
  };
}

function grade(quiz, answers) {
  if (!quiz || !Array.isArray(answers) || answers.length !== quiz.questions.length) {
    throw new Error('세 문제에 모두 답해야 합니다.');
  }
  const normalized = answers.map((value, index) => {
    const choice = Number(value);
    if (!Number.isInteger(choice) || choice < 0 || choice >= quiz.questions[index].choices.length) {
      throw new Error(`${index + 1}번 문제의 답을 선택하세요.`);
    }
    return choice;
  });
  const correct = normalized.map((choice, index) => choice === quiz.questions[index].answerIndex);
  return { answers: normalized, correct, correctCount: correct.filter(Boolean).length };
}

function libraryShelfForCity(city) {
  if (city?.countryCode === 'JP') return '일본';
  return REGION_LIBRARY_SHELF[String(city?.region || '')] || '공통';
}

module.exports = {
  createFinalQuiz,
  publicQuiz,
  grade,
  libraryShelfForCity,
  REGION_LIBRARY_SHELF,
  REGIONAL_QUESTIONS,
  GENERAL_QUESTIONS,
  destinationRegionalQuestion
};
