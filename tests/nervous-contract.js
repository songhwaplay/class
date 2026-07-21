"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "nervous.html"),
    data: path.join(dir, "nervous-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "nervous.css"),
    teacherHtml: path.join(dir, "nervous-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    circulationHtml: path.join(dir, "index.html"),
    digestionHtml: path.join(dir, "digestion.html"),
    respirationHtml: path.join(dir, "respiration.html"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = [
    path.join(root, "assets", "images", "body-explorer", "nervous-hero.webp"),
    path.join(root, "assets", "images", "body-explorer", "nervous-sensory.webp"),
    path.join(root, "assets", "images", "body-explorer", "nervous-response.webp"),
    path.join(root, "assets", "images", "body-explorer", "signal-explorer.png")
];

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing nervous explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Nervous explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;
assert.equal(config.gameId, "nervous");
assert.equal(config.messagePrefix, "NERVOUS");
assert.ok(Array.isArray(stages), "Nervous stages must be an array.");
assert.equal(stages.length, 10, "The nervous journey must contain exactly 10 learning gates.");
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
    "피부", "신경에 정보를 보낸다", "감각 신경", "척수", "뇌",
    "알맞은 반응을 판단한다", "척수", "운동 신경", "근육",
    "감각기관 → 감각 신경 → 뇌·척수 → 운동 신경 → 근육"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
assert.doesNotMatch(learningText, /뉴런|축삭|수상돌기|시냅스|신경전달물질|활동전위|대뇌피질|교감신경|부교감신경/, "Advanced medical terms should stay out of the elementary journey.");
for (const coreIdea of ["감각기관은 빛, 소리", "감각 신경은", "척수는 등뼈 안쪽", "뇌는 감각기관", "운동 신경은", "명령을 받은 근육", "감각기관 → 감각 신경 → 뇌·척수 → 운동 신경 → 근육"]) {
    assert.ok(learningText.includes(coreIdea), `Missing elementary nervous-system idea: ${coreIdea}`);
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
assert.ok(html.includes('src="nervous-data.js"'), "Nervous data is not linked.");
assert.ok(html.includes("nichd.nih.gov/health/topics/neuro"), "The official nervous-system source should be visible.");
for (const asset of ["nervous-hero.webp", "nervous-sensory.webp", "nervous-response.webp", "signal-explorer.png"]) {
    assert.ok(html.includes(asset) || fs.readFileSync(files.styles, "utf8").includes(asset), `Generated visual is not wired: ${asset}`);
}

for (const episodeHtml of [files.circulationHtml, files.digestionHtml, files.respirationHtml]) {
    assert.ok(fs.readFileSync(episodeHtml, "utf8").includes('href="nervous.html"'), `${path.basename(episodeHtml)} must offer episode 04.`);
}
assert.ok(html.includes('href="index.html"') && html.includes('href="digestion.html"') && html.includes('href="respiration.html"'), "Episode 04 must offer episodes 01–03.");

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="nervous"'), "Teacher page must create a nervous classroom.");
assert.ok(teacherHtml.includes('data-message-prefix="NERVOUS"'), "Teacher page must use nervous messages.");
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
assert.ok(server.includes("NERVOUS_ACTION"), "Server is missing nervous actions.");
assert.ok(server.includes("NERVOUS_STATE"), "Server is missing nervous broadcasts.");
assert.ok(server.includes("nervous: 61"), "Nervous classroom capacity is missing.");

console.log("nervous-contract: elementary 10-stage content, modes, review notebook, art and four-episode navigation ok");
