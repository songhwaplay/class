const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const htmlPath = path.join(__dirname, "..", "classtools", "roaster.html");
const html = fs.readFileSync(htmlPath, "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, "Inline roster script is missing.");
new vm.Script(script, { filename: htmlPath });

for (const id of [
  "school-name",
  "school-year",
  "grade",
  "class-number",
  "teacher-name",
  "numbers",
  "names",
  "join-code",
  "sign-out-button"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `${id} is missing.`);
}

assert.match(html, /const allowedYears = \[currentYear - 1, currentYear, currentYear \+ 1\]/,
  "School year should offer only last, current, and next year.");
assert.match(html, /method: "PUT"[\s\S]*\/api\/teacher\/class/,
  "The roster must save through the teacher API.");
assert.match(html, /\/api\/auth\/me/, "The page must check the signed-in teacher.");
assert.match(html, /session\.user\?\.role !== "teacher"/,
  "Non-teacher accounts must be rejected.");
assert.doesNotMatch(html, /localStorage|sessionStorage/,
  "The roster must not use browser storage as its source of truth.");
assert.match(html, /SAVE ROSTER/, "Teacher controls should use the compact English UI.");
assert.match(html, /Student names must be 2 to 6 Korean characters|Each student name must be 2 to 6 Korean characters/,
  "Student roster names should be validated.");
assert.match(html, /const DEFAULT_STUDENT_PASSWORD = "123456"/,
  "New students should receive the requested initial password.");
assert.match(html, /passwordInput\.type = "password"/,
  "Each roster row must include a protected password field.");
assert.match(html, /password: getStudentPassword\(number\)/,
  "Each saved roster entry must carry its password draft.");
assert.match(html, /Each new or changed password must contain exactly 6 digits/,
  "Student passwords must be validated as exactly six digits.");
assert.match(html, /Leave a saved student's password blank to keep it unchanged/,
  "The teacher must be told how saved passwords are preserved.");

console.log("Class roster contract: OK");
