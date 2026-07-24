import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("learning menus use the four top-level domains", () => {
  assert.deepEqual(
    fs.readdirSync(path.join(root, "learning"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
    ["academics", "arts", "basics", "games"],
  );

  const menu = read("index.html");
  for (const href of [
    "learning/basics/reading/index.html",
    "learning/academics/classical-chinese-idioms/index.html",
    "learning/academics/body-explorer/index.html",
    "learning/arts/music-studio/index.html",
    "learning/arts/art-appreciation/museum/",
    "learning/arts/classical-music/",
    "learning/arts/korean-music/",
  ]) {
    assert.match(menu, new RegExp(`href="${href.replaceAll(".", "\\.")}"`));
    assert.equal(fs.existsSync(path.join(root, href)), true, href);
  }
});

test("menu-specific asset groups live with their menu", () => {
  const expected = [
    "learning/basics/vocabulary/assets/data/english-vocabulary-3000-v2.json",
    "learning/basics/vocabulary/assets/images/apple-v2.webp",
    "learning/academics/body-explorer/assets/images/circulation-hero.webp",
    "learning/arts/art-appreciation/assets/sound/museum/gallery-01-portrait.mp3",
    "learning/arts/art-appreciation/assets/sound/museum/gallery-02-nature.mp3",
    "learning/arts/art-appreciation/assets/sound/museum/gallery-03-story.mp3",
    "learning/arts/art-appreciation/assets/sound/museum/gallery-04-line-color-imagination.mp3",
    "learning/arts/art-appreciation/assets/sound/museum/gallery-05-form-space.mp3",
    "learning/arts/classical-music/assets/images/background.webp",
    "learning/arts/korean-music/assets/images/background.webp",
    "learning/games/omok/assets/images/background.webp",
    "learning/games/omok/assets/sound/bgm.mp3",
    "learning/games/connect6/assets/images/background.webp",
    "learning/games/connect6/assets/sound/bgm.mp3",
  ];

  for (const relativePath of expected) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, relativePath);
  }
});

test("music appreciation pages use owned backgrounds without promotional copy", () => {
  const classicalIndex = read("learning/arts/classical-music/index.html");
  const classicalBackground = read("learning/arts/classical-music/background.css");
  const koreanIndex = read("learning/arts/korean-music/index.html");
  const koreanBackground = read("learning/arts/korean-music/background.css");

  assert.match(classicalIndex, /href="background\.css"/);
  assert.match(koreanIndex, /href="background\.css"/);
  assert.match(classicalBackground, /assets\/images\/background\.webp/);
  assert.match(koreanBackground, /assets\/images\/background\.webp/);
  assert.doesNotMatch(classicalIndex, /문제은행|300문|3<\/b>\s*난이도|QUESTION BANK/);
});

test("museum galleries switch to their matching background music", () => {
  const index = read("learning/arts/art-appreciation/museum/index.html");
  const script = read("learning/arts/art-appreciation/museum/museum.js");

  assert.match(index, /museum\/gallery-01-portrait\.mp3/);
  for (const name of [
    "gallery-01-portrait.mp3",
    "gallery-02-nature.mp3",
    "gallery-03-story.mp3",
    "gallery-04-line-color-imagination.mp3",
    "gallery-05-form-space.mp3",
  ]) {
    assert.match(script, new RegExp(name.replaceAll(".", "\\.")));
  }
  assert.match(script, /setRoomMusic\(index\)/);
});

test("moved menu assets have no references to their former root locations", () => {
  const sources = [
    read("learning/basics/vocabulary/app.js"),
    read("learning/arts/art-appreciation/museum/index.html"),
    read("learning/games/omok/omok.html"),
    read("learning/games/connect6/connect6.html"),
    ...fs
      .readdirSync(path.join(root, "learning/academics/body-explorer"))
      .filter((name) => /\.(?:css|html|js)$/.test(name))
      .map((name) => read(`learning/academics/body-explorer/${name}`)),
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
    /\/learning\/(?:games|basics|academics|arts)\/[^"'()\s]+?\.(?:mp3|webp)/g;
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
