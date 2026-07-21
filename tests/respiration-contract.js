"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "respiration.html"),
    data: path.join(dir, "respiration-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "respiration.css"),
    teacherHtml: path.join(dir, "respiration-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    circulationHtml: path.join(dir, "index.html"),
    digestionHtml: path.join(dir, "digestion.html"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = [
    path.join(root, "assets", "images", "body-explorer", "respiration-hero.webp"),
    path.join(root, "assets", "images", "body-explorer", "respiration-airway.webp"),
    path.join(root, "assets", "images", "body-explorer", "respiration-alveoli.webp"),
    path.join(root, "assets", "images", "body-explorer", "oxygen-explorer.png")
];

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing respiration explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Respiration explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;
assert.equal(config.gameId, "respiration");
assert.equal(config.messagePrefix, "RESPIRATION");
assert.ok(Array.isArray(stages), "Respiration stages must be an array.");
assert.equal(stages.length, 10, "The respiration journey must contain exactly 10 learning gates.");
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
    "코나 입",
    "가슴이 넓어지고 공기가 들어온다",
    "기관",
    "기관지",
    "폐포",
    "주변 혈액",
    "온몸의 세포",
    "혈액",
    "혈액에서 폐포로",
    "폐 → 기관지 → 기관 → 코나 입"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation}`).join(" ");
assert.doesNotMatch(learningText, /헤모글로빈|혈색소|세기관지|늑간근|분압|확산계수/, "Advanced medical terms should stay out of the elementary journey.");
for (const coreIdea of ["공기가 코나 입", "기관은 목에서 가슴", "두 갈래의 기관지", "작은 공기주머니인 폐포", "산소는 얇은 벽", "혈액에서 폐포", "몸 밖으로 내보냅니다"]) {
    assert.ok(learningText.includes(coreIdea), `Missing elementary respiration idea: ${coreIdea}`);
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
assert.ok(html.includes('src="respiration-data.js"'), "Respiration data is not linked.");
assert.ok(html.includes("nhlbi.nih.gov/health/lungs/breathing-benefits"), "The official breathing source should be visible.");
for (const asset of ["respiration-hero.webp", "respiration-airway.webp", "respiration-alveoli.webp", "oxygen-explorer.png"]) {
    assert.ok(html.includes(asset) || fs.readFileSync(files.styles, "utf8").includes(asset), `Generated visual is not wired: ${asset}`);
}

for (const episodeHtml of [files.circulationHtml, files.digestionHtml]) {
    assert.ok(fs.readFileSync(episodeHtml, "utf8").includes('href="respiration.html"'), `${path.basename(episodeHtml)} must offer episode 03.`);
}
assert.ok(html.includes('href="index.html"') && html.includes('href="digestion.html"'), "Episode 03 must offer episodes 01 and 02.");

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="respiration"'), "Teacher page must create a respiration classroom.");
assert.ok(teacherHtml.includes('data-message-prefix="RESPIRATION"'), "Teacher page must use respiration messages.");
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

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("RESPIRATION_ACTION"), "Server is missing respiration actions.");
assert.ok(server.includes("RESPIRATION_STATE"), "Server is missing respiration broadcasts.");
assert.ok(server.includes("respiration: 61"), "Respiration classroom capacity is missing.");

console.log("respiration-contract: elementary 10-stage content, modes, review notebook, art and three-episode navigation ok");
