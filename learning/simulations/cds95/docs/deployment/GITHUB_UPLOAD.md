# GitHub에 올리는 방법

## GitHub 웹사이트

1. GitHub에서 새 저장소를 만듭니다.
2. 학생 수업 자료가 들어갈 예정이면 우선 Private 저장소를 권장합니다.
3. **Add file → Upload files**를 누릅니다.
4. 이 프로젝트 폴더 안의 파일과 폴더를 모두 올립니다.
   - `.github`, `data`, `lib`, `public`, `tests`를 포함합니다.
   - `node_modules`, `.env`, `runtime/classroom-state.json`은 올리지 않습니다.
5. Commit changes를 누릅니다.

## GitHub Desktop

1. ZIP을 압축 해제합니다.
2. GitHub Desktop에서 기존 폴더를 추가합니다.
3. 저장소가 아니라고 나오면 그 위치에 저장소를 생성합니다.
4. 첫 커밋 후 **Publish repository**를 누릅니다.

## 수정 후 배포

GitHub에 push하면 연결된 Render 또는 Railway가 새 버전을 자동 배포합니다. 교사 PIN과 저장 경로는 GitHub 코드가 아니라 호스팅 서비스의 환경변수로 설정합니다.

## 현재 GitHub 폴더 위치

이 프로젝트가 전체 `class` 저장소 안에 있다면 서비스의 **Root Directory / Root Path**를 다음으로 설정합니다.

```text
learning/simulations/cds95
```
