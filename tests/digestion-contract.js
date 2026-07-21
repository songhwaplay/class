"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "digestion.html"),
    data: path.join(dir, "digestion-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "digestion.css"),
    teacherHtml: path.join(dir, "digestion-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    seriesHtml: path.join(dir, "index.html"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = [
    path.join(root, "assets", "images", "body-explorer", "digestion-hero.webp"),
    path.join(root, "assets", "images", "body-explorer", "digestion-stomach.webp"),
    path.join(root, "assets", "images", "body-explorer", "digestion-villi.webp"),
    path.join(root, "assets", "images", "body-explorer", "food-explorer.png")
];

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing digestion explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Digestion explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;
assert.equal(config.gameId, "digestion");
assert.equal(config.messagePrefix, "DIGESTION");
assert.ok(Array.isArray(stages), "Digestion stages must be an array.");
assert.equal(stages.length, 10, "The digestion journey must contain exactly 10 learning gates.");
assert.equal(new Set(stages.map((stage) => stage.id)).size, 10, "Stage ids must be unique.");

for (const stage of stages) {
    for (const key of ["id", "shortLabel", "location", "scene", "oxygen", "chapter", "mission", "fact", "question", "answer", "hint", "explanation"]) {
        assert.ok(typeof stage[key] === "string" && stage[key].trim(), `${stage.id}: missing ${key}`);
    }
    assert.equal(stage.choices.length, 3, `${stage.id}: every gate needs three choices`);
    assert.equal(new Set(stage.choices).size, 3, `${stage.id}: choices must be unique`);
    assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1, `${stage.id}: answer must appear exactly once`);
}

assert.deepEqual(Array.from(stages, (stage) => stage.answer), [
    "음식을 잘게 씹는다",
    "삼키기 쉬워지고 소화가 시작된다",
    "식도",
    "식도 벽의 근육이 음식을 밀기 때문에",
    "음식과 소화액을 섞는다",
    "간과 이자",
    "작은창자",
    "작은창자",
    "남은 찌꺼기에서 물을 흡수한다",
    "항문"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation}`).join(" ");
assert.doesNotMatch(learningText, /아밀레이스|펩신|트립신|공장|회장|십이지장|융털/, "Advanced medical terms should stay out of the elementary journey.");
for (const coreIdea of ["이는 음식을 잘게", "식도를 지나 위", "음식과 소화액을 섞", "작은창자에서 흡수", "큰창자는", "항문으로 배출"]) {
    assert.ok(learningText.includes(coreIdea), `Missing elementary digestion idea: ${coreIdea}`);
}

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
assert.ok(html.includes("나의 오답노트"), "Personal wrong-answer notebook is missing.");
assert.ok(html.includes('src="digestion-data.js"'), "Digestion data is not linked.");
assert.ok(html.includes('src="app.js"'), "Shared explorer app is not linked.");
assert.ok(html.includes("niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works"), "The official digestion source should be visible.");
for (const asset of ["digestion-hero.webp", "digestion-stomach.webp", "digestion-villi.webp", "food-explorer.png"]) {
    assert.ok(html.includes(asset) || fs.readFileSync(files.styles, "utf8").includes(asset), `Generated visual is not wired: ${asset}`);
}

const seriesHtml = fs.readFileSync(files.seriesHtml, "utf8");
assert.ok(seriesHtml.includes('href="digestion.html"'), "Episode 01 page must offer episode 02.");
assert.ok(html.includes('href="index.html"'), "Episode 02 page must offer episode 01.");

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="digestion"'), "Teacher page must create a digestion classroom.");
assert.ok(teacherHtml.includes('data-message-prefix="DIGESTION"'), "Teacher page must use digestion messages.");
for (const id of ["roomCode", "copyBtn", "lobbyPlayers", "teacherStartButton", "teacherRacePanel", "teacherRankingList", "resetRaceButton"]) {
    assert.ok(teacherHtml.includes(`id="${id}"`), `Teacher page is missing #${id}`);
}

for (const file of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes("config.gameId"), "Shared student app must read the episode game id.");
assert.ok(app.includes('action: "SUBMIT"'), "Student results must be submitted to the server.");
assert.ok(app.includes("state.missed.push"), "Wrong answers must be collected for review.");

const teacherApp = fs.readFileSync(files.teacherApp, "utf8");
assert.ok(teacherApp.includes("document.body.dataset.gameId"), "Shared teacher app must read the episode game id.");
assert.ok(teacherApp.includes('action: "START"'), "The teacher must be able to start all students together.");
assert.ok(teacherApp.includes('action: "RESET"'), "The teacher must be able to prepare a new expedition.");

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("DIGESTION_ACTION"), "Server is missing digestion actions.");
assert.ok(server.includes("DIGESTION_STATE"), "Server is missing digestion broadcasts.");
assert.ok(server.includes("digestion: 61"), "Digestion classroom capacity is missing.");

console.log("digestion-contract: elementary 10-stage content, two modes, review notebook, art and episode navigation ok");
