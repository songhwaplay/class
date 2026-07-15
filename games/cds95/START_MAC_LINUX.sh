#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
printf '%s\n' '학생: http://localhost:3000/' '교사: http://localhost:3000/teacher.html'
npm start
