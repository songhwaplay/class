import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter((script) => script.trim());

for (const script of inlineScripts) {
    new Function(script);
}

assert.doesNotMatch(
    html,
    /guestNameInput\.addEventListener\(['"]input['"]/,
    'Do not rewrite the name field during input; that breaks Korean IME composition.',
);
assert.match(
    html,
    /const playerName = guestNameInput\.value\.trim\(\);/,
    'The completed name should be read when the form is submitted.',
);
assert.match(
    html,
    /if \(!isValidPlayerName\(playerName\)\)/,
    'The submitted name must still be validated.',
);

console.log('Index Korean name input contract passed.');
