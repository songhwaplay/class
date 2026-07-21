const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "game-hub-server", "classroom-platform.js"), "utf8");

assert.match(source, /CREATE TABLE IF NOT EXISTS classroom_teachers/);
assert.match(source, /ADD COLUMN IF NOT EXISTS academic_year INTEGER/);
assert.match(source, /classroom_teachers_class_assignment_idx/);
assert.match(source, /ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE/);
assert.match(source, /router\.get\("\/schools"/);
assert.match(source, /router\.get\("\/admin\/schools"/);
assert.match(source, /router\.post\("\/admin\/schools"/);
assert.match(source, /router\.post\("\/admin\/schools\/:schoolId\/teachers"/);
assert.match(source, /router\.patch\("\/admin\/teachers\/:teacherId"/);
assert.match(source, /router\.delete\("\/admin\/teachers\/:teacherId"/);
assert.match(source, /router\.delete\("\/admin\/schools\/:schoolId"/);
assert.match(source, /router\.post\("\/teacher\/claim"/);
assert.match(source, /verifyStudentPassword\(password, teacher\.password_hash\)/);
assert.match(source, /const academicYear = Number\(assignment\.academic_year\)/,
  "Roster saves must use the administrator-assigned class identity.");
assert.match(source, /WHERE sc\.id = \$1 AND sc\.enabled = TRUE/,
  "Student lookup must use an administrator-enabled school ID.");
assert.doesNotMatch(source, /password_hash\s*=\s*\$\d[^\n]*password[^H]/,
  "Teacher passwords must not be stored directly.");

console.log("School directory contract: OK");
