# 새 멀티플레이 게임 시작하기

이 폴더는 공통 로비를 사용하는 복사 전용 템플릿입니다. `multiplayer-game.html` 자체는 메인 화면에 노출되는 게임이 아닙니다.

## 추가 순서

1. `games/_multiplayer-template`을 `games/새게임ID`로 복사합니다.
2. `multiplayer-game.html`을 `새게임ID.html`로 이름을 바꿉니다.
3. HTML의 `GAME_ID`, 제목, 규칙, 게임 상태와 행동 처리 코드를 교체합니다.
4. `index.html`에 새 게임 링크를 추가합니다.
5. `tests/multiplayer-lobby-adoption.js`의 멀티플레이 목록에 새 ID를 추가합니다.

`GAME_ID`는 다른 게임과 겹치지 않는 영문 소문자 ID를 사용하세요. 최대 인원이 4명을 넘으면 `game-hub-server/server.js`의 `MAX_ROOM_PLAYERS`에도 같은 ID와 최대 인원을 등록해야 합니다.

## 지켜야 할 구조

- 이름은 `index.html`에서만 저장하고 게임에서는 읽기만 합니다.
- 방 생성, 입장, 복사, 참가자 목록과 연결 종료는 `ClassroomMultiplayerLobby`에 맡깁니다.
- 일반 게임은 방장 브라우저가 행동을 검증하고 확정 상태만 `broadcast()`합니다.
- 비밀 역할, 동시 투표처럼 조작 방지가 중요한 게임은 아발론처럼 서버가 상태를 관리하고 `sendServer()`와 `onServerMessage`를 사용합니다.
- 게임별 코드에서 `new WebSocket()`이나 `ClassroomNetwork.createSocket()`을 직접 호출하지 않습니다.

## 필수 검사

```powershell
node tests/multiplayer-lobby-adoption.js
node tests/multiplayer-lobby-unit.js
node tests/html-inline-syntax.js games/새게임ID/새게임ID.html
```

브라우저에서는 최소한 방장 1명과 참가자 1명으로 생성, 입장, 시작, 한 차례 행동, 재시작, 이탈을 확인하세요.
