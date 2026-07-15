# CDS95 v23 폴더 구조

```text
cds95/
├─ data/
│  ├─ catalog/places.json       도시·지형 이름과 좌표
│  └─ world/WORLD.CDS           서버용 원본 지도
├─ lib/                          서버 공통 모듈
├─ public/
│  ├─ assets/
│  │  ├─ cities/
│  │  ├─ currents/              해류용 원본 구름 스프라이트
│  │  ├─ maps/
│  │  └─ ships/
│  ├─ js/terrain.js
│  ├─ js/ocean-current.js
│  ├─ index.html                학생 화면
│  └─ teacher.html              교사 미션·순위판
├─ tests/
├─ server.js
├─ package.json
└─ README.md
```

교사 화면은 도착지 1곳과 출발 도시 4곳을 지정하는 기능, 실시간 순위판만 제공합니다.
