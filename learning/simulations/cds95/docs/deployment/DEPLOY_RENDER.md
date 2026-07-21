# Render 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Render에서 **New → Blueprint**를 선택합니다.
3. GitHub 저장소를 연결합니다.
4. 저장소 루트의 `render.yaml`을 감지시킵니다.
5. `TEACHER_PIN` 값을 안전한 문자열로 입력합니다.
6. 배포가 끝나면 Render가 HTTPS 주소를 제공합니다.

학생 접속:

```text
https://발급주소.onrender.com/
```

교사 접속:

```text
https://발급주소.onrender.com/teacher.html
```

상태 확인:

```text
https://발급주소.onrender.com/health
```

## 기록을 계속 보존하려면

일반 인스턴스 파일시스템은 재배포 때 초기화될 수 있습니다. Persistent Disk를 사용할 수 있는 플랜에서 디스크를 연결하고, 예를 들어 마운트 경로를 `/var/data`로 설정한 뒤 환경변수에 다음을 추가합니다.

```text
DATA_DIR=/var/data
```

무료 인스턴스는 기능 시험용으로 사용하고, 실제 수업 전에는 여러 크롬북으로 동시접속과 서버 기동 시간을 점검하세요.

## 현재 GitHub 폴더 위치

이 프로젝트가 전체 `class` 저장소 안에 있다면 서비스의 **Root Directory / Root Path**를 다음으로 설정합니다.

```text
learning/simulations/cds95
```
