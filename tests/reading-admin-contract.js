"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "admin", "reading", "index.html");
const appPath = path.join(root, "admin", "reading", "app.js");
const cssPath = path.join(root, "admin", "reading", "style.css");
const migrationPath = path.join(root, "game-hub-server", "migrations", "001-reading-bank.sql");
const reviewMigrationPath = path.join(root, "game-hub-server", "migrations", "002-reading-reviews.sql");
const platformPath = path.join(root, "game-hub-server", "classroom-platform.js");
const backendPath = path.join(root, "game-hub-server", "reading-bank.js");
const mainAdminPath = path.join(root, "admin", "index.html");

const html = fs.readFileSync(htmlPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const migration = fs.readFileSync(migrationPath, "utf8");
const reviewMigration = fs.readFileSync(reviewMigrationPath, "utf8");
const platform = fs.readFileSync(platformPath, "utf8");
const backend = fs.readFileSync(backendPath, "utf8");
const mainAdmin = fs.readFileSync(mainAdminPath, "utf8");

new vm.Script(app, { filename: appPath });

assert.match(html, /lang="ko"/);
assert.match(html, /id="topicEditor"/);
assert.match(html, /id="itemEditor"/);
assert.match(html, /id="previewPassage"/);
assert.match(html, /id="checkResults"/);
assert.match(html, /id="importSampleButton"/);
assert.match(html, /id="submitForReviewButton"/);
assert.match(html, /id="reviewPanel"/);
assert.match(html, /id="reviewerDialog"/);
assert.match(html, /href="\/admin\/"/,
  "The reading admin must return to the existing administrator sign-in page.");
assert.match(mainAdmin, /href="\/admin\/reading\/"/,
  "The existing administrator page should link to the reading workspace.");
assert.match(css, /grid-template-columns:\s*250px 320px/,
  "The desktop workspace should provide filter, record, and editor columns.");
assert.match(css, /@media \(max-width: 680px\)/,
  "The editor needs a narrow-screen layout.");

assert.match(app, /\/api\/auth\/me/);
assert.match(app, /\/api\/reading\/access/);
assert.match(app, /if \(!access\.allowed\)/,
  "The UI should require explicit reading-bank access.");
assert.match(app, /\/api\/reading\/admin\/topics/);
assert.match(app, /\/api\/reading\/admin\/items/);
assert.match(app, /\/api\/reading\/admin\/sample-import/);
assert.match(app, /\/check`/);
assert.match(app, /\/submit`/);
assert.match(app, /\/reviews`/);
assert.match(app, /\/admin\/reviewers/);
assert.doesNotMatch(app, /localStorage|sessionStorage/,
  "Persistent content must stay in PostgreSQL rather than browser storage.");

assert.match(platform, /createReadingBank/);
assert.match(platform, /await readingBank\.initialize\(\)/);
assert.match(platform, /router\.use\("\/reading", readingBank\.router\)/);
assert.match(backend, /await admin\(req\)/,
  "Reading administration routes must enforce authorization on the server.");
assert.match(backend, /status !== "draft"/,
  "Non-draft versions must be immutable.");
assert.match(backend, /current_published_version_id/);
assert.match(backend, /router\.post\("\/admin\/sample-import"/);
assert.match(backend, /router\.get\("\/access"/);
assert.match(backend, /router\.post\("\/admin\/versions\/:versionId\/submit"/);
assert.match(backend, /router\.post\("\/admin\/versions\/:versionId\/reviews"/);
assert.match(backend, /SELF_REVIEW_NOT_ALLOWED/,
  "The version creator must not review their own work.");
assert.match(backend, /INDEPENDENT_REVIEW_REQUIRED/,
  "An account that can see stored answers must not cast a blind review vote.");
assert.match(backend, /SEPARATE_REVIEW_ROLE_REQUIRED/,
  "Editor and reviewer permissions must remain separate.");
assert.match(backend, /COUNT\(DISTINCT reviewer_user_id\)/,
  "Two approvals must come from distinct reviewer accounts.");
assert.match(backend, /redactAnswers: !access\.canEdit/,
  "Review-only users must not receive stored answers or explanations.");
assert.match(backend, /pg_advisory_xact_lock/,
  "Migration initialization must be safe against concurrent starts.");

for (const table of [
  "reading_topics",
  "reading_sources",
  "reading_items",
  "reading_item_versions",
  "reading_auto_checks",
  "reading_audit_events"
]) {
  assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
assert.match(migration, /UNIQUE \(item_id, version_no\)/,
  "Every item version number must be unique within its item.");
assert.match(migration, /FOREIGN KEY \(current_published_version_id, id\)/,
  "A published version must belong to the same logical item.");

for (const table of ["reading_reviewer_permissions", "reading_reviews"]) {
  assert.match(reviewMigration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}
assert.match(reviewMigration, /UNIQUE \(version_id, reviewer_user_id\)/,
  "A reviewer must only submit once per immutable version.");

console.log("Reading admin contract: OK");
