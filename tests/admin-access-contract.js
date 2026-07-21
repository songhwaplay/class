const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const adminPath = path.join(root, "admin", "index.html");
const adminHtml = fs.readFileSync(adminPath, "utf8");
const adminScript = adminHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const indexScript = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes("APP_ORIGIN"));
const platformSource = fs.readFileSync(path.join(root, "game-hub-server", "classroom-platform.js"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "game-hub-server", "server.js"), "utf8");
const renderYaml = fs.readFileSync(path.join(root, "render.yaml"), "utf8");

assert.ok(adminScript, "Admin page script is missing.");
new vm.Script(adminScript, { filename: adminPath });
new vm.Script(indexScript, { filename: path.join(root, "index.html") });

assert.match(adminHtml, /data-mode="open"/);
assert.match(adminHtml, /data-mode="restricted"/);
assert.match(adminScript, /\/api\/admin\/site-access/);
assert.match(adminScript, /\/api\/admin\/schools/);
assert.match(adminScript, /\/api\/admin\/teachers/);
assert.match(adminHtml, /School management/);
for (const id of ["newTeacherYear", "newTeacherGrade", "newTeacherClass", "deleteSchoolButton"]) {
  assert.match(adminHtml, new RegExp(`id=["']${id}["']`), `${id} is missing.`);
}
assert.match(adminScript, /academicYear: Number\(newTeacherYear\.value\)/);
assert.match(adminScript, /method: "DELETE"/,
  "Administrators must be able to delete teachers/classes and empty schools.");
assert.match(adminScript, /schools\[0\]\?\.id \|\| ""/,
  "A saved school should remain visibly selected after refreshing the admin page.");
assert.match(adminScript, /user\?\.role !== "admin"/,
  "The dashboard must reject non-admin sessions.");
assert.match(platformSource, /async function requireAdmin/);
assert.match(platformSource, /user\.role !== "admin"/,
  "Admin API authorization must happen on the server.");
assert.match(platformSource, /VALUES \('site_access_mode', 'open'\)/,
  "New sites should start in open development mode.");
assert.match(platformSource, /school_login_v2_enabled/);
assert.match(platformSource, /SET setting_value = 'restricted'/,
  "The school login upgrade should replace the development guest gate once.");
assert.match(platformSource, /router\.put\("\/admin\/site-access"/);
assert.match(platformSource, /const isAdmin = adminEmails\.has\(email\)/,
  "Only the configured administrator email can bootstrap admin access.");
assert.match(platformSource, /if \(!payload\.hd && !isAdmin\)/,
  "A configured personal admin account should be the only non-school exception.");
assert.match(indexScript, /\/api\/site\/access/);
assert.match(indexScript, /siteAccess\.mode === 'open'/);
assert.match(indexScript, /showOpenAccess\(\)/);
assert.match(serverSource, /\["admin", "assets"/,
  "Render must serve the admin page.");
assert.match(renderYaml, /key: ADMIN_EMAILS/);

console.log("Admin access contract: OK");
