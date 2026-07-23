import assert from "node:assert/strict";
import fs from "node:fs";

const server = fs.readFileSync(new URL("./server.js", import.meta.url), "utf8");

assert.match(
  server,
  /app\.get\("\/index\.html", \(req, res\) => \{\s*res\.redirect\(308, "\/"\);\s*\}\);/,
  "The legacy root index URL must redirect to the canonical home URL.",
);

console.log("Home route redirect contract passed.");
