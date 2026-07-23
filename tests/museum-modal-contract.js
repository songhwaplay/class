const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const museumRoot = path.join(root, 'learning', 'art', 'museum');

global.window = {};
require(path.join(museumRoot, 'art-data.js'));

const rooms = global.window.MUSEUM_ROOMS;
const works = rooms.flatMap(room => room.works);
const ids = works.map(work => work.id);

assert.equal(rooms.length, 5, 'museum should keep five galleries');
assert.equal(works.length, 60, 'museum should expose all 60 artworks');
assert.equal(new Set(ids).size, ids.length, 'artwork ids must be unique');

const limits = {
  title: 30,
  englishTitle: 70,
  artist: 24,
  year: 24,
  medium: 36,
  docent: 140,
  point: 120,
  styleNote: 120
};

for (const work of works) {
  for (const key of ['title', 'artist', 'year', 'medium', 'docent', 'point']) {
    assert.equal(typeof work[key], 'string', `${work.id}.${key} must be text`);
    assert.ok(work[key].trim(), `${work.id}.${key} must not be empty`);
  }

  for (const [key, limit] of Object.entries(limits)) {
    if (!work[key]) continue;
    assert.ok(
      work[key].length <= limit,
      `${work.id}.${key} exceeds the modal safety limit (${work[key].length}/${limit})`
    );
  }

  assert.ok(
    fs.existsSync(path.join(museumRoot, work.image)),
    `${work.id} is missing image ${work.image}`
  );

  if (work.tags) {
    assert.ok(Array.isArray(work.tags), `${work.id}.tags must be an array`);
    assert.ok(work.tags.length <= 4, `${work.id} has too many modal tags`);
    for (const tag of work.tags) {
      assert.ok(tag.length <= 24, `${work.id} has an excessively long tag`);
    }
  }
}

const css = fs.readFileSync(path.join(museumRoot, 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(museumRoot, 'index.html'), 'utf8');

assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css, /overflow-wrap:anywhere/);
assert.match(css, /\.art-modal article\{[^}]*min-width:0/);
assert.match(css, /\.art-modal article\{overflow:visible;scrollbar-gutter:auto\}/);
assert.doesNotMatch(
  css,
  /\.modal-tags\{[^}]*margin:[^;}]*-\d/,
  'modal tags must not use a negative margin that can hide text'
);

assert.match(html, /styles\.css\?v=20260723-9/);
assert.match(html, /art-data\.js\?v=20260723-10/);
assert.match(html, /museum\.js\?v=20260723-33/);

console.log('museum-modal-contract: 60 artworks and responsive modal safeguards verified');
