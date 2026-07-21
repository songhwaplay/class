import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(
    html,
    /const hubLinks = Array\.from\(hubContent\.querySelectorAll\(['"]a\[href\]['"]\)\);/,
    'Every destination inside the hub must be included in the access gate.',
);
assert.match(
    html,
    /function setHubLocked\(locked\)/,
    'The hub must expose a single lock state for all of its links.',
);
assert.match(
    html,
    /link\.dataset\.lockedHref = link\.getAttribute\(['"]href['"]\);\s*link\.removeAttribute\(['"]href['"]\);/,
    'Locked destinations must lose their href so they cannot be opened in another tab.',
);
assert.match(
    html,
    /link\.setAttribute\(['"]href['"], link\.dataset\.lockedHref\);/,
    'Unlocking the hub must restore each destination.',
);
assert.match(
    html,
    /hubContent\.addEventListener\(['"]click['"][\s\S]*event\.preventDefault\(\);[\s\S]*guestNameInput\.focus\(\);[\s\S]*}, true\);/,
    'Locked hub clicks must be cancelled before navigation and return focus to the name field.',
);
assert.match(
    html,
    /updatePlayerLearningLinks\(playerName\);\s*setHubLocked\(false\);\s*setStatus\(`PLAYER/,
    'Submitting a valid player name must unlock the hub.',
);
assert.match(
    html,
    /updatePlayerLearningLinks\(['"]['"]\);\s*setHubLocked\(true\);/,
    'Open access without a valid saved name must lock the hub.',
);

console.log('Index access gate contract passed.');
