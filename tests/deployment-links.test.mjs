import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const renderConfig = fs.readFileSync(new URL("../render.yaml", import.meta.url), "utf8");

test("production learning links do not leave the Render deployment", () => {
  assert.doesNotMatch(html, /chatgpt\.site/);
  assert.match(html, /https:\/\/fraction-lab-20260720\.onrender\.com\/arithmetic/);
  assert.match(html, /https:\/\/hanguksa-hanip\.onrender\.com\//);
});

test("Render blueprint contains both standalone learning services", () => {
  assert.match(renderConfig, /name: fraction-lab-20260720/);
  assert.match(renderConfig, /rootDir: learning\/basics\/arithmetics/);
  assert.match(renderConfig, /name: hanguksa-hanip/);
  assert.match(renderConfig, /rootDir: learning\/basics\/hanguksa-basic/);
});
