"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const backend = fs.readFileSync(path.join(root, "game-hub-server", "reading-bank.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "game-hub-server", "migrations", "003-reading-pilots.sql"), "utf8");
const platform = fs.readFileSync(path.join(root, "game-hub-server", "classroom-platform.js"), "utf8");
const roster = fs.readFileSync(path.join(root, "classtools", "roaster.html"), "utf8");
const teacherHtml = fs.readFileSync(path.join(root, "admin", "reading", "pilots.html"), "utf8");
const teacherJsPath = path.join(root, "admin", "reading", "pilots.js");
const teacherJs = fs.readFileSync(teacherJsPath, "utf8");
const studentHtml = fs.readFileSync(path.join(root, "learning", "reading", "index.html"), "utf8");
const studentJsPath = path.join(root, "learning", "reading", "app.js");
const studentJs = fs.readFileSync(studentJsPath, "utf8");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");

new vm.Script(teacherJs, { filename: teacherJsPath });
new vm.Script(studentJs, { filename: studentJsPath });

for (const table of [
  "reading_pilots",
  "reading_pilot_items",
  "reading_pilot_attempts",
  "reading_pilot_responses"
]) {
  assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
assert.match(migration, /UNIQUE \(pilot_id, student_user_id\)/,
  "Each student must have only one attempt per pilot.");
assert.match(migration, /UNIQUE \(attempt_id, version_id\)/,
  "Each answer must be stored only once.");
assert.match(migration, /FOREIGN KEY \(pilot_id, version_id\)/,
  "Responses must reference an item assigned to the same pilot.");

for (const route of [
  "/admin/pilot-options",
  "/admin/pilots",
  "/admin/pilots/:pilotId/results",
  "/student/pilots",
  "/student/pilots/:pilotId/start",
  "/student/pilots/:pilotId/responses",
  "/student/pilots/:pilotId/submit"
]) {
  assert.ok(backend.includes(route), `Missing pilot route: ${route}`);
}
assert.match(backend, /status = 'approved_for_pilot'/,
  "Only approved immutable versions may enter a pilot.");
assert.match(backend, /PERCENTILE_CONT\(0\.5\)/,
  "Calibration results should include median response time.");
assert.match(backend, /selected_index, COUNT\(\*\)/,
  "Calibration results should include choice distributions.");

const startRoute = backend.slice(
  backend.indexOf('router.post("/student/pilots/:pilotId/start"'),
  backend.indexOf('router.post("/student/pilots/:pilotId/responses"')
);
assert.doesNotMatch(startRoute, /correct_index|correctIndex|answer_evidence|answerEvidence|explanation/,
  "Student item payloads must not expose stored answers or explanations.");

assert.match(teacherHtml, /id="approvedItemList"/);
assert.match(teacherHtml, /id="resultsItems"/);
assert.match(teacherJs, /choiceCounts/);
assert.doesNotMatch(teacherJs, /rosterName|studentNumber/,
  "Teacher calibration UI should use aggregate results rather than student identities.");
assert.match(studentHtml, /id="studentPassage"/);
assert.match(studentHtml, /id="studentChoices"/);
assert.match(studentHtml, /accounts\.google\.com\/gsi\/client/);
assert.match(studentJs, /\/api\/auth\/google/);
assert.match(studentJs, /performance\.now\(\)/);
assert.doesNotMatch(studentJs, /localStorage|sessionStorage/,
  "Pilot answers must use server persistence only.");
assert.match(home, /learning\/reading\/index\.html/);

assert.match(platform, /grade BETWEEN 1 AND 12/);
assert.match(platform, /grade > 12/);
assert.match(roster, /value="12">Grade 12/);

console.log("Reading pilot contract: OK");
