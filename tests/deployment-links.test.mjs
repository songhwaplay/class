import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const renderConfig = fs.readFileSync(new URL("../render-learning.yaml", import.meta.url), "utf8");

test("production learning links remain available until Render services are live", () => {
  assert.match(html, /https:\/\/fraction-lab-20260720\.stimpack486443\.chatgpt\.site\/arithmetic/);
  assert.match(html, /https:\/\/hanguksa-hanip\.stimpack486443\.chatgpt\.site\//);
});

test("Render blueprint contains both standalone learning services", () => {
  assert.match(renderConfig, /name: fraction-lab-20260720/);
  assert.match(renderConfig, /rootDir: learning\/basics\/arithmetics/);
  assert.match(renderConfig, /name: hanguksa-hanip/);
  assert.match(renderConfig, /rootDir: learning\/basics\/hanguksa-basic/);
});
