# Railway 배포

1. 이 프로젝트를 GitHub 저장소에 올립니다.
2. Railway에서 **New Project → Deploy from GitHub repo**를 선택합니다.
3. 이 저장소를 선택합니다.
4. 서비스 Variables에 다음을 추가합니다.

```text
TEACHER_PIN=교사만_아는_PIN
NODE_ENV=production
DATA_DIR=/data
```

5. 학생 기록을 재배포 뒤에도 보존하려면 서비스에 Volume을 추가하고 마운트 경로를 `/data`로 설정합니다.
6. Settings의 Networking에서 **Generate Domain**을 누릅니다.
7. `railway.json`의 시작 명령과 `/health` 검사가 사용됩니다.

학생 접속:

```text
https://발급된도메인/
```

교사 접속:

```text
https://발급된도메인/teacher.html
```

## 현재 GitHub 폴더 위치

이 프로젝트가 전체 `class` 저장소 안에 있다면 서비스의 **Root Directory / Root Path**를 다음으로 설정합니다.

```text
games/cds95
```
