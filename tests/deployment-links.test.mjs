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
  assert.match(serverPackage, /learning\/academics\/korean-history run build/);
  assert.equal((serverPackage.match(/ci --include=dev/g) || []).length, 2);
  assert.match(serverSource, /app\.use\("\/arithmetic", proxyToLearningApp\(ARITHMETIC_PORT\)\)/);
  assert.match(serverSource, /app\.use\("\/hanguksa", proxyToLearningApp\(HANGUKSA_PORT\)\)/);
});

test("legacy learning paths redirect to the reorganized domains", () => {
  for (const legacyPath of [
    "/learning/reading",
    "/learning/basics/idioms",
    "/learning/simulations/body-explorer",
    "/learning/training/music-studio",
    "/learning/art",
    "/learning/music/classics",
    "/learning/music/korean",
  ]) {
    assert.match(serverSource, new RegExp(legacyPath.replaceAll("/", "\\/")));
  }
  assert.match(serverSource, /res\.redirect\(308,/);
});
