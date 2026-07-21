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
assert.equal(config.experienceType, "nervous-simulation");
assert.ok(Array.isArray(stages), "Nervous stages must be an array.");
assert.equal(stages.length, 10, "The nervous journey must contain exactly 10 learning gates.");
assert.equal(new Set(stages.map((stage) => stage.id)).size, 10, "Stage ids must be unique.");
assert.equal(stages.filter((stage) => stage.kind === "experiment").length, 5, "The journey needs five direct-manipulation experiments.");
assert.equal(stages.filter((stage) => stage.kind === "check").length, 5, "Each experiment needs one follow-up check.");

stages.forEach((stage, index) => {
    assert.equal(stage.kind, index % 2 === 0 ? "experiment" : "check", `${stage.id}: experiments and checks must alternate`);
    for (const key of ["id", "shortLabel", "location", "scene", "oxygen", "chapter", "mission", "fact", "question", "answer", "explanation"]) {
        assert.ok(typeof stage[key] === "string" && stage[key].trim(), `${stage.id}: missing ${key}`);
    }

    if (stage.kind === "experiment") {
        const scenario = stage.scenario;
        assert.ok(scenario && typeof scenario === "object", `${stage.id}: missing simulation scenario`);
        for (const key of ["stimulus", "icon", "intensityLabel", "response", "lowMessage"]) {
            assert.ok(typeof scenario[key] === "string" && scenario[key].trim(), `${stage.id}: missing scenario ${key}`);
        }
        assert.ok(Number.isInteger(scenario.threshold) && scenario.threshold > 0 && scenario.threshold < 100, `${stage.id}: invalid detection threshold`);
        assert.equal(scenario.correctPath.length, 5, `${stage.id}: the signal route must have five positions`);
        assert.equal(new Set(scenario.correctPath).size, 5, `${stage.id}: route components must be unique`);
        assert.equal(stage.answer, scenario.correctPath.join(" → "), `${stage.id}: review answer must match the simulated route`);
        assert.equal(scenario.components.length, 9, `${stage.id}: component bank must mix nine plausible parts`);
        assert.equal(new Set(scenario.components).size, scenario.components.length, `${stage.id}: component bank must be unique`);
        scenario.correctPath.forEach((component) => assert.ok(scenario.components.includes(component), `${stage.id}: missing route component ${component}`));
        assert.equal(scenario.hints.length, scenario.correctPath.length, `${stage.id}: each route position needs a hint`);
    } else {
        assert.ok(typeof stage.hint === "string" && stage.hint.trim(), `${stage.id}: missing check hint`);
        assert.equal(stage.choices.length, 3, `${stage.id}: every check needs three choices`);
        assert.equal(new Set(stage.choices).size, 3, `${stage.id}: choices must be unique`);
        assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1, `${stage.id}: answer must appear exactly once`);
    }
});

assert.deepEqual(Array.from(stages, (stage) => stage.answer), [
    "눈 → 감각 신경 → 뇌 → 운동 신경 → 눈꺼풀 근육",
    "눈은 빛을 받아들이고 뇌는 전달된 정보를 판단한다",
    "귀 → 감각 신경 → 뇌 → 운동 신경 → 목 근육",
    "귀 → 감각 신경 → 뇌 → 운동 신경 → 목 근육",
    "피부 → 감각 신경 → 뇌·척수 → 운동 신경 → 팔 근육",
    "감각기관이 받아들일 수 있을 만큼의 자극이 있어야 정보 전달이 시작된다",
    "눈 → 감각 신경 → 뇌 → 운동 신경 → 팔·손 근육",
    "공의 위치와 움직임을 판단해 팔과 손을 움직일 명령을 정한다",
    "피부 → 감각 신경 → 뇌 → 운동 신경 → 목·몸통 근육",
    "감각 신경은 몸에서 안쪽으로, 운동 신경은 안쪽에서 근육으로 전달한다"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
const choiceText = stages.filter((stage) => stage.kind === "check").flatMap((stage) => stage.choices).join(" ");
assert.doesNotMatch(choiceText, /피를 만든다|음식을 소화한다|심장|콩팥|식도|기관지|피부의 땀/, "Distractors should use plausible nervous-system misconceptions rather than unrelated organs.");
assert.doesNotMatch(learningText, /뉴런|축삭|수상돌기|시냅스|신경전달물질|활동전위|대뇌피질|교감신경|부교감신경/, "Advanced medical terms should stay out of the elementary journey.");
for (const coreIdea of ["감각기관은 자극을 받아들이고", "감각 신경은 몸의 정보를", "뇌는 눈에서 온 정보를", "운동 신경은 뇌와 척수의 명령", "감각기관이 자극을 뚜렷하게", "감각 정보는 감각 신경을 따라"]) {
    assert.ok(learningText.includes(coreIdea), `Missing elementary nervous-system idea: ${coreIdea}`);
}

const html = fs.readFileSync(files.html, "utf8");
for (const id of [
    "modeScreen", "personalModeButton", "classModeButton", "personalScreen", "lobbyScreen",
    "journeyScreen", "routeMap", "scenePanel", "choiceList", "feedback", "resultScreen",
    "simulationCard", "stimulusIntensity", "signalPath", "componentBank", "runSimulationButton", "simulationFeedback", "simulationNextButton",
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
assert.ok(app.includes("function runNervousExperiment()"), "The nervous episode must execute learner-built experiments.");
assert.ok(app.includes("intensity < scenario.threshold"), "Experiments must respond differently below the detection threshold.");
assert.ok(app.includes("state.experimentPath.findIndex"), "Experiments must evaluate the learner-built signal route.");
assert.ok(app.includes('state.experimentPath.join(" → ")'), "An incorrect experiment route must be recorded for review.");
assert.ok(app.includes('setSimulationFeedback("success"'), "A completed route must show the observed body response.");

const nervousStyles = fs.readFileSync(files.styles, "utf8");
for (const selector of [".stimulus-console", ".signal-path", ".component-bank", ".simulation-feedback", ".scene-panel.simulation-reacting"]) {
    assert.ok(nervousStyles.includes(selector), `Nervous simulator is missing styles for ${selector}`);
}
assert.ok(nervousStyles.includes("@keyframes nerve-pulse"), "The signal route needs a visible propagation animation.");
assert.match(nervousStyles, /@media \(min-width: 740px\)[\s\S]*?\.simulation-card[\s\S]*?grid-column:\s*2/, "The simulator must share one viewport with the scene on tablets and PCs.");

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("NERVOUS_ACTION"), "Server is missing nervous actions.");
assert.ok(server.includes("NERVOUS_STATE"), "Server is missing nervous broadcasts.");
assert.ok(server.includes("nervous: 61"), "Nervous classroom capacity is missing.");

console.log("nervous-contract: five manipulation experiments, five checks, review, ranking and responsive simulation UI ok");
