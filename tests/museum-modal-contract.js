const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const museumRoot = path.join(root, 'learning', 'arts', 'art-appreciation', 'museum');

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
  assert.equal(typeof work.englishTitle, 'string', `${work.id}.englishTitle must support the restored image quiz`);
  assert.ok(work.englishTitle.trim(), `${work.id}.englishTitle must not be empty`);

  for (const [key, limit] of Object.entries(limits)) {
    if (!work[key]) continue;
    assert.ok(
      work[key].length <= limit,
      `${work.id}.${key} exceeds the modal safety limit (${work[key].length}/${limit})`
    );
  }

  assert.ok(
    fs.existsSync(path.join(museumRoot, work.image.split('?')[0])),
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
const museumJs = fs.readFileSync(path.join(museumRoot, 'museum.js'), 'utf8');

assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css, /overflow-wrap:anywhere/);
assert.match(css, /\.art-modal article\{[^}]*min-width:0/);
assert.match(css, /\.art-modal article\{overflow:visible;scrollbar-gutter:auto\}/);
assert.doesNotMatch(
  css,
  /\.modal-tags\{[^}]*margin:[^;}]*-\d/,
  'modal tags must not use a negative margin that can hide text'
);

assert.match(html, /styles\.css\?v=20260724-5/);
assert.match(html, /art-data\.js\?v=20260724-12/);
assert.match(html, /museum\.js\?v=20260725-14/);
assert.match(html, /id="finale-modal"/);
assert.match(html, /id="finale-options"/);
assert.match(html, /id="finale-artwork-image"/);
assert.match(html, /QUESTION 01 \/ 05/);
assert.match(css, /\.finale-modal/);
assert.match(css, /\.finale-artwork img/);
assert.match(museumJs, /museumFinaleRoomsV2/);
assert.match(museumJs, /addFinaleWall\(rooms\[index\],shell\)/);
assert.doesNotMatch(museumJs, /userData\.finaleTexture=true/, 'generated textures must initialize userData for the bundled Three.js version');
assert.equal((museumJs.match(/\{q:'/g)||[]).length, 60, 'every displayed artwork should contribute one finale-bank question');
const finaleEntries = [...museumJs.matchAll(/\{q:'([^']+)',options:\[([^\]]+)\],answer:(\d),explain:'([^']+)'\}/g)];
assert.equal(finaleEntries.length, 60, 'all finale questions must follow the validated question schema');
assert.equal(finaleEntries.length + works.length * 2, 180, 'observation plus title and artist modes should provide 180 question variants');
assert.equal(new Set(finaleEntries.map(match => match[1])).size, 60, 'finale question text must not be duplicated');
for (const [, question, rawOptions, rawAnswer, explanation] of finaleEntries) {
  const options = [...rawOptions.matchAll(/'([^']+)'/g)].map(match => match[1]);
  const answer = Number(rawAnswer);
  assert.equal(options.length, 3, `${question} must have exactly three choices`);
  assert.ok(answer >= 0 && answer < options.length, `${question} has an invalid answer index`);
  assert.ok(explanation.length >= 20, `${question} needs a useful answer explanation`);
}
for (const room of rooms) {
  assert.equal(new Set(room.works.map(work => work.title)).size, room.works.length, `${room.id} title choices must be unique`);
}
assert.match(museumJs, /finaleQuizCorrect===total/, 'a stamp must require every finale answer to be correct');
assert.match(museumJs, /showFinaleRetry\(finaleQuizRoom\)/, 'an imperfect finale attempt must end in retry instead of a stamp');
assert.match(museumJs, /buildImageQuestion\(room,imageModes\[0\],imageWorks\[0\]\)/, 'each finale attempt must include a visible artwork question');
assert.match(museumJs, /buildImageQuestion\(room,imageModes\[1\],imageWorks\[1\]\)/, 'each finale attempt must include two visible artwork questions');
assert.doesNotMatch(museumJs, /buildImageQuestion\(room,imageModes\[2\],imageWorks\[2\]\)/, 'finale must not include an English-title image question');
assert.match(museumJs, /const imageModes=\['title','artist'\]/, 'every finale must include title and artist image-question modes');
assert.match(museumJs, /question:'이 작품의 제목은 무엇일까요\?'/, 'Korean title prompt should be natural and concise');
assert.doesNotMatch(museumJs, /What is the title of this artwork\?/, 'finale must not ask for English titles');
assert.doesNotMatch(museumJs, /question:'[^']*(한글 제목|영어 제목)/, 'quiz prompts should not explain their language mode');
assert.match(museumJs, /observations\[0\],\s*observations\[1\],\s*observations\[2\]/, 'every finale must include three observation questions');
assert.match(museumJs, /imageWorkIds\.has\(question\.workId\)/, 'observation questions must exclude the image-question artworks');
assert.match(museumJs, /options:\[correct,\.\.\.distractors\]/, 'image questions must restore four-choice answer construction');
assert.match(museumJs, /핵심 관찰 문제 3개/, 'the finale instructions must explain the three description-based questions');
assert.match(museumJs, /다섯 문제를 모두 맞혀야/, 'the retry message must explain the perfect-score stamp rule');

const observationMapSource = museumJs.match(/const OBSERVATION_WORK_IDS = \{([\s\S]*?)\n  \};/);
assert.ok(observationMapSource, 'observation questions must map explicitly to artwork ids');
const observationRows = [...observationMapSource[1].matchAll(/(\w+):\[([^\]]+)\]/g)];
assert.equal(observationRows.length, rooms.length, 'every gallery must map its observation questions to artworks');
for (const [, roomId, rawIds] of observationRows) {
  const mappedIds = [...rawIds.matchAll(/'([^']+)'/g)].map(match => match[1]);
  const room = rooms.find(item => item.id === roomId);
  assert.ok(room, `unknown observation mapping room ${roomId}`);
  assert.deepEqual(new Set(mappedIds), new Set(room.works.map(work => work.id)), `${roomId} observation mapping must cover each artwork exactly once`);
}
assert.match(museumJs, /Math\.random\(\)\*\(i\+1\)/, 'the finale question bank must be shuffled for each attempt');
assert.match(museumJs, /signature===finaleLastQuestionSet\[room\.id\]/, 'an immediate retry must not repeat the same question set');
assert.match(museumJs, /randomizedChoices\.findIndex\(choice=>choice\.correct\)/, 'answer positions must be shuffled without losing the correct choice');

console.log('museum-modal-contract: 60 artworks, finale missions, and responsive modal safeguards verified');
