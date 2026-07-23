import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const serverSource = fs.readFileSync(new URL("../game-hub-server/server.js", import.meta.url), "utf8");
const serverPackage = fs.readFileSync(new URL("../game-hub-server/package.json", import.meta.url), "utf8");

test("learning links stay on the main Render service", () => {
  assert.doesNotMatch(html, /chatgpt\.site/);
  assert.match(html, /href="\/arithmetic"/);
  assert.match(html, /href="\/hanguksa"/);
});

test("the main service builds and proxies both learning apps", () => {
  assert.match(serverPackage, /learning\/basics\/arithmetics run build/);
  assert.match(serverPackage, /learning\/basics\/hanguksa-basic run build/);
  assert.match(serverSource, /app\.use\("\/arithmetic", proxyToLearningApp\(ARITHMETIC_PORT\)\)/);
  assert.match(serverSource, /app\.use\("\/hanguksa", proxyToLearningApp\(HANGUKSA_PORT\)\)/);
});
