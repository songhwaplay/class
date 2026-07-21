# 지명 카탈로그 확장 안내

미션을 하나씩 코딩할 필요는 없습니다. 새로운 지형이나 도시를 처음 추가할 때만 `lib/mission-catalog.js`의 `PLACES` 목록에 지명 항목 하나를 등록합니다. 등록 뒤에는 교사 화면에서 기존 물품·도시·지형과 자유롭게 조합해 여러 미션을 만들 수 있습니다.

## 항구 도시 항목 예시

```js
{
  id: 'busan',
  name: '부산',
  nameEn: 'Busan',
  category: '항구 도시',
  continent: '아시아',
  region: '대한민국',
  lat: 35.1796,
  lon: 129.0756,
  access: 'port',
  atlasHint: '한반도 남동부, 대한해협 북쪽',
  facilities: ['항구 창고', '시장', '연구소']
}
```

## 육상 지형 항목 예시

```js
{
  id: 'niagara_falls',
  name: '나이아가라 폭포',
  nameEn: 'Niagara Falls',
  category: '폭포',
  continent: '북아메리카',
  region: '미국·캐나다 국경',
  lat: 43.0799,
  lon: -79.0747,
  access: 'land',
  landingPortId: 'new_york',
  atlasHint: '오대호의 이리호와 온타리오호 사이'
}
```

서버가 위도·경도를 원작 세계지도 좌표로 변환하고, 실제 바다 또는 통행 가능한 육지 타일로 자동 보정합니다.

## 새 물품 추가

`ITEMS` 목록에 이름과 설명을 한 번 등록하면 모든 운송·보급 미션에서 선택할 수 있습니다.

## 기본 미션팩 추가

자주 사용하는 조합만 `READY_MISSIONS`에 저장합니다. 저장하지 않아도 교사 화면에서 출발지·목적지·물품을 선택해 즉시 미션을 만들 수 있습니다.
