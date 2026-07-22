"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const simulationDir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(simulationDir, "index.html"),
    data: path.join(simulationDir, "journey-data.js"),
    app: path.join(simulationDir, "app.js"),
    styles: path.join(simulationDir, "styles.css"),
    teacherHtml: path.join(simulationDir, "teacher.html"),
    teacherApp: path.join(simulationDir, "teacher.js"),
    teacherStyles: path.join(simulationDir, "teacher.css"),
    hub: path.join(root, "index.html"),
    server: path.join(root, "game-hub-server", "server.js")
};
const imageFiles = [
    path.join(root, "assets", "images", "body-explorer", "circulation-hero.webp"),
    path.join(root, "assets", "images", "body-explorer", "heart-interior.webp"),
    path.join(root, "assets", "images", "body-explorer", "alveoli.webp"),
    path.join(root, "assets", "images", "body-explorer", "red-cell-explorer.webp")
];

for (const file of [...Object.values(files), ...imageFiles]) {
    assert.ok(fs.existsSync(file), `Missing circulation explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Circulation explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.CIRCULATION_STAGES;
const circulationConfig = context.window.BODY_EXPLORER_CONFIG;
assert.ok(Array.isArray(stages), "Circulation stages must be an array.");
assert.equal(circulationConfig.gameId, "circulation", "Circulation needs a unique classroom game id.");
assert.equal(circulationConfig.messagePrefix, "CIRCULATION", "Circulation needs its own message prefix.");
assert.equal(stages.length, 10, "The circulation journey must contain exactly 10 learning gates.");
assert.equal(new Set(stages.map((stage) => stage.id)).size, stages.length, "Stage ids must be unique.");

for (const stage of stages) {
    for (const key of ["id", "shortLabel", "location", "scene", "oxygen", "chapter", "mission", "fact", "question", "answer", "hint", "explanation"]) {
        assert.ok(typeof stage[key] === "string" && stage[key].trim(), `${stage.id}: missing ${key}`);
    }
    assert.ok(["body", "heart", "lung"].includes(stage.scene), `${stage.id}: invalid scene`);
    assert.ok(["low", "exchange", "rich"].includes(stage.oxygen), `${stage.id}: invalid oxygen state`);
    assert.equal(stage.choices.length, 3, `${stage.id}: every gate needs three routes`);
    assert.equal(new Set(stage.choices).size, 3, `${stage.id}: routes must be unique`);
    assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1, `${stage.id}: answer must appear exactly once`);
}

assert.deepEqual(Array.from(stages, (stage) => stage.answer), [
    "대정맥",
    "우심방",
    "삼첨판",
    "폐동맥",
    "산소는 혈액으로, 이산화탄소는 폐포로",
    "폐정맥",
    "이첨판(승모판)",
    "좌심실",
    "대동맥",
    "모세혈관"
]);
assert.match(stages[0].fact, /파란색이 아니라 짙은 붉은색/, "The blue-blood misconception should be corrected.");

const html = fs.readFileSync(files.html, "utf8");
for (const id of [
    "modeScreen", "personalModeButton", "classModeButton", "personalScreen", "lobbyScreen",
    "journeyScreen", "routeMap", "scenePanel", "choiceList", "feedback", "resultScreen",
    "classRankingList", "perfectReview", "missedList"
]) {
    assert.ok(html.includes(`id="${id}"`), `Student page is missing #${id}`);
}
assert.ok(html.includes("개인 탐험"), "Personal mode is missing.");
assert.ok(html.includes("학급 순위 탐험"), "Class ranking mode is missing.");
assert.ok(html.includes("나의 오답노트"), "Personal wrong-route review is missing.");
assert.ok(html.includes("nhlbi.nih.gov/health/heart/blood-flow"), "The NHLBI blood-flow source should be visible.");
assert.ok(html.includes("openstax.org/books/anatomy-and-physiology-2e/pages/20-5-circulatory-pathways"), "The OpenStax circulation source should be visible.");
for (const asset of ["circulation-hero.webp", "heart-interior.webp", "alveoli.webp", "red-cell-explorer.webp"]) {
    assert.ok(html.includes(asset) || fs.readFileSync(files.styles, "utf8").includes(asset), `Generated visual is not wired: ${asset}`);
}

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
for (const id of ["roomCode", "copyBtn", "lobbyPlayers", "teacherStartButton", "teacherRacePanel", "teacherRankingList", "resetRaceButton"]) {
    assert.ok(teacherHtml.includes(`id="${id}"`), `Teacher page is missing #${id}`);
}

for (const scriptPath of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(scriptPath, "utf8"), { filename: scriptPath });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes("config.gameId"), "Student app must read the episode classroom game id.");
assert.ok(app.includes('action: "SUBMIT"'), "Student results must be submitted to the server.");
assert.ok(app.includes("state.missed.push"), "Wrong routes must be collected for review.");
assert.ok(app.includes('button.classList.add("is-wrong")'), "A wrong route should provide immediate feedback.");

const teacherApp = fs.readFileSync(files.teacherApp, "utf8");
assert.ok(teacherApp.includes('action: "START"'), "The teacher must be able to start all students together.");
assert.ok(teacherApp.includes('action: "RESET"'), "The teacher must be able to prepare a new expedition.");

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("CIRCULATION_ACTION"), "Server is missing circulation actions.");
assert.ok(server.includes("CIRCULATION_STATE"), "Server is missing circulation broadcasts.");
assert.ok(server.includes("elapsedMs: Math.max(0, Date.now() - game.startedAt)"), "Completion time must be server-authoritative.");

const hub = fs.readFileSync(files.hub, "utf8");
assert.ok(hub.includes('href="learning/simulations/body-explorer/index.html"'), "Hub is missing the body explorer link.");
assert.ok(hub.includes("인체 탐험"), "Hub is missing the Korean title.");
assert.ok(hub.includes("(Human Body Explorer)"), "Hub is missing the English subtitle.");

console.log("circulation-contract: 10 stages, modes, review notebook, generated art and classroom wiring ok");
