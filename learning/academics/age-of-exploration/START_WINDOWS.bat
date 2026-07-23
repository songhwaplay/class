@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo [1/2] 필요한 서버 모듈을 확인합니다.
if not exist node_modules call npm install
if errorlevel 1 goto error
echo [2/2] V61 Natural Earth 좁은 해협 항로 보정 서버를 시작합니다.
echo 학생: http://localhost:3000/
echo 교사: http://localhost:3000/teacher.html
call npm start
goto end
:error
echo 실행에 실패했습니다. Node.js 22 이상이 설치되어 있는지 확인하세요.
pause
:end
