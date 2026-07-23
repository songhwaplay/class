# Songhwa Play classroom portal

이 저장소는 하나의 수업 포털입니다. 루트의 `index.html`이 메인 화면이고,
Node 서버가 정적 수업 자료와 두 개의 학습 앱을 한 주소에서 제공합니다.

## 주요 구조

```text
class/
├─ index.html                  메인 수업 포털
├─ admin/                      관리자 화면
├─ classtools/                 교사용 학급 도구
├─ assets/                     공통 이미지·음원·네트워크 코드
├─ learning/
│  ├─ basics/
│  │  ├─ arithmetics/          산수·수학 앱
│  │  └─ hanguksa-basic/       한국사 앱
│  ├─ reading/                 읽기 학습
│  ├─ games/                   교실 게임
│  ├─ art/                     미술 학습
│  ├─ music/                   음악 학습
│  ├─ simulations/             체험형 학습
│  └─ training/                훈련 활동
├─ game-hub-server/            인증·학급·게임·학습 앱 통합 서버
├─ scripts/                    운영 데이터 생성 스크립트
├─ tests/                      포털 계약 테스트
├─ tools/                      배포와 무관한 분석 도구
└─ render.yaml                 운영 서버 배포 설정
```

`/arithmetic`와 `/hanguksa`는 별도 프로젝트가 아니라 포털의 하위 기능입니다.
통합 서버가 각 앱을 실행하고 같은 사이트 경로로 연결합니다.

## 로컬 실행

```powershell
npm.cmd --prefix game-hub-server install
npm.cmd --prefix game-hub-server start
```

서버 설치 과정에서 산수 앱과 한국사 앱도 함께 빌드됩니다.
