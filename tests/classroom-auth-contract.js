const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "game-hub-server", "server.js"), "utf8");
const packageJson = require(path.join(root, "game-hub-server", "package.json"));
const platform = require(path.join(root, "game-hub-server", "classroom-platform.js"));
const indexScript = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes("APP_ORIGIN"));

assert.ok(indexScript, "The index authentication script is missing.");
new vm.Script(indexScript, { filename: path.join(root, "index.html") });

assert.match(indexHtml, /accounts\.google\.com\/gsi\/client/,
  "Google Identity Services must be loaded.");
assert.match(indexHtml, /id="googleSignInButton"/,
  "A single Google sign-in area is required.");
assert.match(indexHtml, /id="joinCode"/);
assert.match(indexHtml, /id="studentNumber"/);
assert.match(indexHtml, /id="studentPassword"/);
assert.match(indexScript, /\/api\/auth\/google/);
assert.match(indexScript, /\/api\/student\/join/);
assert.match(indexScript, /password: studentPasswordInput\.value/,
  "The student join request must include the six-digit roster password.");
assert.match(indexScript, /user\?\.role === 'teacher'/,
  "Teacher and student routes must be selected from the server role.");
assert.match(indexScript, /localStorage\.setItem\('classPlayerName'/,
  "Open development access should preserve only the device-local player name.");
assert.doesNotMatch(indexScript, /localStorage\.setItem\([^)]*(auth|token|session)/i,
  "Authentication state must not be stored in browser storage.");

assert.match(serverSource, /app\.use\("\/api", classroomPlatform\.router\)/);
assert.match(serverSource, /res\.sendFile\(path\.join\(SITE_ROOT, "index\.html"\)\)/,
  "Render must serve the web UI from the same origin as its session cookie.");
assert.ok(packageJson.dependencies["google-auth-library"]);
assert.ok(packageJson.dependencies.pg);
assert.match(
  fs.readFileSync(path.join(root, "game-hub-server", "classroom-platform.js"), "utf8"),
  /ADD COLUMN IF NOT EXISTS password_hash TEXT/,
  "The student password hash must be persisted in PostgreSQL."
);

assert.deepEqual(
  [...platform.parseTeacherEmails(" Teacher@School.kr,other@school.kr ")],
  ["teacher@school.kr", "other@school.kr"]
);
assert.equal(platform.normalizePersonName("김 민준"), "김민준");
assert.equal(platform.normalizePersonName("60301 김민준"), "김민준");

const passwordHash = platform.hashStudentPassword("123456");
assert.doesNotMatch(passwordHash, /123456/, "Student passwords must not be stored in plaintext.");
assert.equal(platform.verifyStudentPassword("123456", passwordHash), true);
assert.equal(platform.verifyStudentPassword("654321", passwordHash), false);
assert.notEqual(platform.hashStudentPassword("123456"), passwordHash,
  "Each password hash must use a unique salt.");

console.log("Classroom auth contract: OK");
