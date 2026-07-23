import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("menu-specific asset groups live with their menu", () => {
  const expected = [
    "learning/basics/vocabulary/assets/data/english-vocabulary-3000-v2.json",
    "learning/basics/vocabulary/assets/images/apple-v2.webp",
    "learning/simulations/body-explorer/assets/images/circulation-hero.webp",
    "learning/art/assets/images/k1.jpg",
    "learning/art/assets/sound/art-appreciation.mp3",
    "learning/art/assets/sound/art-museum.mp3",
    "learning/games/omok/assets/images/background.webp",
    "learning/games/omok/assets/sound/bgm.mp3",
    "learning/games/connect6/assets/images/background.webp",
    "learning/games/connect6/assets/sound/bgm.mp3",
  ];

  for (const relativePath of expected) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, relativePath);
  }
});

test("moved menu assets have no references to their former root locations", () => {
  const sources = [
    read("learning/basics/vocabulary/app.js"),
    read("learning/art/index.html"),
    read("learning/art/museum/index.html"),
    read("learning/games/omok/omok.html"),
    read("learning/games/connect6/connect6.html"),
    ...fs
      .readdirSync(path.join(root, "learning/simulations/body-explorer"))
      .filter((name) => /\.(?:css|html|js)$/.test(name))
      .map((name) => read(`learning/simulations/body-explorer/${name}`)),
  ].join("\n");

  assert.doesNotMatch(sources, /(?:\.\.\/){3}assets\/data\//);
  assert.doesNotMatch(sources, /(?:\.\.\/){3}assets\/images\/vocabulary\//);
  assert.doesNotMatch(sources, /(?:\.\.\/){3}assets\/images\/body-explorer\//);
  assert.doesNotMatch(sources, /(?:\.\.\/){2}assets\/images\/art\//);
  assert.doesNotMatch(sources, /(?:\.\.\/){2,3}assets\/sound\/art-(?:appreciation|museum)\.mp3/);
  assert.doesNotMatch(sources, /\/assets\/(?:images|sound)\/stone-board/);
});

test("relocated static asset URLs resolve to files in the repository", () => {
  const sourceRoots = [
    path.join(root, "index.html"),
    path.join(root, "learning/games"),
    path.join(root, "learning/basics/spelling"),
  ];
  const sourceFiles = [];

  function collect(currentPath) {
    const stat = fs.statSync(currentPath);
    if (stat.isFile()) {
      if (/\.(?:css|html|js)$/.test(currentPath)) sourceFiles.push(currentPath);
      return;
    }
    for (const name of fs.readdirSync(currentPath)) collect(path.join(currentPath, name));
  }

  for (const sourcePath of sourceRoots) collect(sourcePath);

  const staticUrlPattern =
    /\/learning\/(?:games|basics|simulations)\/[^"'()\s]+?\.(?:mp3|webp)/g;
  for (const sourceFile of sourceFiles) {
    const source = fs.readFileSync(sourceFile, "utf8");
    for (const url of source.match(staticUrlPattern) || []) {
      assert.equal(
        fs.existsSync(path.join(root, url.slice(1))),
        true,
        `${path.relative(root, sourceFile)} -> ${url}`,
      );
    }
  }
});
