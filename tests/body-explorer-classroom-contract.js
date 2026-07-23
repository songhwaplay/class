"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const explorerRoot = path.join(root, "learning", "simulations", "body-explorer");
const serverSource = fs.readFileSync(path.join(root, "game-hub-server", "server.js"), "utf8");
const teacherSource = fs.readFileSync(path.join(explorerRoot, "teacher.js"), "utf8");

const episodes = [
    ["index.html", "journey-data.js", "teacher.html", "circulation", "CIRCULATION"],
    ["digestion.html", "digestion-data.js", "digestion-teacher.html", "digestion", "DIGESTION"],
    ["respiration.html", "respiration-data.js", "respiration-teacher.html", "respiration", "RESPIRATION"],
    ["nervous.html", "nervous-data.js", "nervous-teacher.html", "nervous", "NERVOUS"],
    ["immune.html", "immune-data.js", "immune-teacher.html", "immune", "IMMUNE"],
    ["movement.html", "movement-data.js", "movement-teacher.html", "movement", "MOVEMENT"],
    ["excretion.html", "excretion-data.js", "excretion-teacher.html", "excretion", "EXCRETION"],
    ["temperature.html", "temperature-data.js", "temperature-teacher.html", "temperature", "TEMPERATURE"]
];

for (const [studentPage, dataFile, teacherPage, gameId, prefix] of episodes) {
    const studentHtml = fs.readFileSync(path.join(explorerRoot, studentPage), "utf8");
    const teacherHtml = fs.readFileSync(path.join(explorerRoot, teacherPage), "utf8");
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(explorerRoot, dataFile), "utf8"), context);

    assert.equal(context.window.BODY_EXPLORER_CONFIG.gameId, gameId, `${studentPage} gameId`);
    assert.equal(context.window.BODY_EXPLORER_CONFIG.messagePrefix, prefix, `${studentPage} message prefix`);
    assert.match(studentHtml, new RegExp(`href=["']${teacherPage.replace(".", "\\.")}["']`), `${studentPage} teacher link`);
    assert.match(studentHtml, new RegExp(`src=["']${dataFile.replace(".", "\\.")}`), `${studentPage} data script`);
    assert.match(studentHtml, /src=["']app\.js/, `${studentPage} shared student controller`);

    assert.match(teacherHtml, new RegExp(`data-game-id=["']${gameId}["']`), `${teacherPage} gameId`);
    assert.match(teacherHtml, new RegExp(`data-message-prefix=["']${prefix}["']`), `${teacherPage} message prefix`);
    assert.match(teacherHtml, /src=["']teacher\.js["']/, `${teacherPage} shared teacher controller`);

    assert.match(serverSource, new RegExp(`type: ["']${prefix}_STATE["']`), `${prefix} state broadcast`);
    assert.match(serverSource, new RegExp(`type === ["']${prefix}_ACTION["']`), `${prefix} action handler`);
}

assert.match(teacherSource, /type: `\$\{MESSAGE_PREFIX\}_ACTION`/);
assert.match(teacherSource, /message\.type !== `\$\{MESSAGE_PREFIX\}_STATE`/);
assert.match(teacherSource, /action: "RESET"/);
assert.match(teacherSource, /state\.phase === "ended" \? "최종 순위" : "탐험 중"/);

console.log("body-explorer-classroom-contract: eight student/teacher/server classroom routes agree");
