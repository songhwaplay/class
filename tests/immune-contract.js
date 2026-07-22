"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "immune.html"),
    data: path.join(dir, "immune-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "immune.css"),
    simulatorStyles: path.join(dir, "nervous.css"),
    teacherHtml: path.join(dir, "immune-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = [
    path.join(root, "assets", "images", "body-explorer", "immune-hero.webp"),
    path.join(root, "assets", "images", "body-explorer", "immune-barrier.webp"),
    path.join(root, "assets", "images", "body-explorer", "immune-defense.webp"),
    path.join(root, "assets", "images", "body-explorer", "immune-explorer.webp")
];

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing immune explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Immune explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;

assert.equal(config.gameId, "immune");
assert.equal(config.messagePrefix, "IMMUNE");
assert.equal(config.experienceType, "immune-simulation");
assert.ok(config.simulationCopy && config.simulationCopy.runLabel === "방어 실행");
assert.ok(Array.isArray(stages), "Immune stages must be an array.");
assert.equal(stages.length, 10, "The immune journey must contain exactly 10 learning gates.");
assert.equal(new Set(stages.map((stage) => stage.id)).size, 10, "Stage ids must be unique.");
assert.equal(stages.filter((stage) => stage.kind === "experiment").length, 5, "The journey needs five manipulation experiments.");
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
        assert.ok(Number.isInteger(scenario.threshold) && scenario.threshold > 0 && scenario.threshold < 100, `${stage.id}: invalid operation threshold`);
        assert.equal(scenario.correctPath.length, 5, `${stage.id}: the defense process must have five positions`);
        assert.equal(new Set(scenario.correctPath).size, 5, `${stage.id}: defense steps must be unique`);
        assert.equal(stage.answer, scenario.correctPath.join(" → "), `${stage.id}: review answer must match the simulated process`);
        assert.equal(scenario.components.length, 9, `${stage.id}: component bank must mix nine plausible steps`);
        assert.equal(new Set(scenario.components).size, 9, `${stage.id}: component bank must be unique`);
        scenario.correctPath.forEach((component) => assert.ok(scenario.components.includes(component), `${stage.id}: missing defense step ${component}`));
        assert.equal(scenario.hints.length, 5, `${stage.id}: each defense position needs a hint`);
    } else {
        assert.ok(typeof stage.hint === "string" && stage.hint.trim(), `${stage.id}: missing check hint`);
        assert.equal(stage.choices.length, 3, `${stage.id}: every check needs three choices`);
        assert.equal(new Set(stage.choices).size, 3, `${stage.id}: choices must be unique`);
        assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1, `${stage.id}: answer must appear exactly once`);
    }
});

assert.deepEqual(Array.from(stages, (stage) => stage.answer), [
    "공기 속 병원체 → 코의 점액 → 병원체 붙잡기 → 섬모의 움직임 → 몸 밖으로 배출",
    "병원체가 몸 안으로 들어오기 전에 막는 경계가 되기 때문에",
    "병원체 침입 → 조직의 경보 신호 → 백혈구 이동 → 병원체 둘러싸기 → 삼켜서 처리",
    "혈액과 방어 세포가 상처 주변으로 더 모이는 과정과 관련 있다",
    "병원체의 표면 특징 → 알맞은 면역 세포 반응 → 항체 만들기 → 병원체에 결합 → 활동 억제·처리 표시",
    "두 병원체의 표면 특징이 달라 항체와 맞는 모양도 다르기 때문에",
    "같은 병원체 재침입 → 기억 세포의 인식 → 빠른 면역 세포 증식 → 항체와 방어 반응 증가 → 더 빠른 제거",
    "기억 세포가 병원체의 특징을 알아보고 맞춤 방어를 빠르게 늘리기 때문에",
    "안전한 병원체 특징 제시 → 면역 세포가 특징 인식 → 항체 만들기 연습 → 기억 세포 남기기 → 실제 침입 때 빠른 방어",
    "병원체의 특징을 미리 익혀 기억 세포와 맞춤 방어를 준비하게 한다"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
const choiceText = stages.filter((stage) => stage.kind === "check").flatMap((stage) => stage.choices).join(" ");
for (const coreIdea of ["피부와 점막", "백혈구", "특정한 표면 특징", "기억 세포", "백신"]) {
    assert.ok(learningText.includes(coreIdea), `Missing elementary immune-system idea: ${coreIdea}`);
}
assert.doesNotMatch(learningText, /B세포|T세포|사이토카인|보체|면역글로불린|클론 선택|주조직적합성|인터루킨|호중구|대식세포/, "Medical-school vocabulary should stay out of the elementary journey.");
assert.doesNotMatch(choiceText, /무조건|완전히 치료|평생 절대|모든 병원체를 없/, "Distractors must avoid absolute medical claims.");

const html = fs.readFileSync(files.html, "utf8");
for (const id of [
    "modeScreen", "personalModeButton", "classModeButton", "personalScreen", "lobbyScreen",
    "journeyScreen", "routeMap", "scenePanel", "choiceList", "feedback", "resultScreen",
    "simulationCard", "stimulusIntensity", "signalPath", "componentBank", "runSimulationButton",
    "simulationFeedback", "simulationNextButton", "classRankingList", "perfectReview", "missedList"
]) {
    assert.ok(html.includes(`id="${id}"`), `Student page is missing #${id}`);
}
assert.ok(html.includes("개인 탐험") && html.includes("학급 순위 탐험"));
assert.ok(html.includes("나의 오답노트"));
assert.ok(html.includes('src="immune-data.js"'));
assert.ok(html.includes("nigms.nih.gov/biobeat") && html.includes("cdc.gov/vaccines/basics/explaining-how-vaccines-work"));
assert.ok(html.includes('class="nervous-page immune-page"'), "Immune must reuse the tested responsive simulator layout.");

const styles = fs.readFileSync(files.styles, "utf8");
for (const asset of ["immune-hero.webp", "immune-barrier.webp", "immune-defense.webp", "immune-explorer.webp"]) {
    assert.ok(html.includes(asset) || styles.includes(asset), `Generated visual is not wired: ${asset}`);
}
for (const episodeFile of ["index.html", "digestion.html", "respiration.html", "nervous.html"]) {
    assert.ok(fs.readFileSync(path.join(dir, episodeFile), "utf8").includes('href="immune.html"'), `${episodeFile} must offer episode 05.`);
}

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="immune"'));
assert.ok(teacherHtml.includes('data-message-prefix="IMMUNE"'));
for (const id of ["roomCode", "copyBtn", "lobbyPlayers", "teacherStartButton", "teacherRacePanel", "teacherRankingList", "resetRaceButton"]) {
    assert.ok(teacherHtml.includes(`id="${id}"`), `Teacher page is missing #${id}`);
}

for (const file of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes('config.experienceType === "immune-simulation"'));
assert.ok(app.includes("function runInteractiveExperiment()"));
assert.ok(app.includes("intensity < scenario.threshold"));
assert.ok(app.includes("state.experimentPath.findIndex"));
assert.ok(app.includes('state.experimentPath.join(" → ")'));
assert.ok(app.includes("simulationCopy.reviewLabel"));

for (const selector of [".immune-page .hero-art", ".immune-briefing-art", ".immune-page .scene-panel", ".immune-page .simulation-card"]) {
    assert.ok(styles.includes(selector), `Immune styling is missing ${selector}`);
}
const simulatorStyles = fs.readFileSync(files.simulatorStyles, "utf8");
assert.match(simulatorStyles, /@media \(min-width: 740px\)[\s\S]*?\.simulation-card[\s\S]*?grid-column:\s*2/);

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("IMMUNE_ACTION"));
assert.ok(server.includes("IMMUNE_STATE"));
assert.ok(server.includes("immune: 61"));

console.log("immune-contract: five manipulation experiments, five checks, review, ranking, generated art and responsive UI ok");
