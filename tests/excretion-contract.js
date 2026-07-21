"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "excretion.html"),
    data: path.join(dir, "excretion-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "excretion.css"),
    teacherHtml: path.join(dir, "excretion-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = ["excretion-hero.webp", "excretion-kidney.webp", "excretion-path.webp", "excretion-explorer.png"]
    .map((name) => path.join(root, "assets", "images", "body-explorer", name));

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing excretion explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Excretion explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;

assert.equal(config.gameId, "excretion");
assert.equal(config.messagePrefix, "EXCRETION");
assert.equal(config.experienceType, "excretion-simulation");
assert.equal(config.simulationCopy.runLabel, "배설 과정 실행");
assert.equal(stages.length, 10);
assert.equal(new Set(stages.map((stage) => stage.id)).size, 10);
assert.equal(stages.filter((stage) => stage.kind === "experiment").length, 5);
assert.equal(stages.filter((stage) => stage.kind === "check").length, 5);

stages.forEach((stage, index) => {
    assert.equal(stage.kind, index % 2 === 0 ? "experiment" : "check", `${stage.id}: experiments and checks must alternate`);
    for (const key of ["id", "shortLabel", "location", "scene", "oxygen", "chapter", "mission", "fact", "question", "answer", "explanation"]) {
        assert.ok(typeof stage[key] === "string" && stage[key].trim(), `${stage.id}: missing ${key}`);
    }
    if (stage.kind === "experiment") {
        const scenario = stage.scenario;
        assert.ok(scenario && scenario.visual, `${stage.id}: missing live urinary visual`);
        assert.ok(Number.isInteger(scenario.threshold) && scenario.threshold > 0 && scenario.threshold < 100);
        assert.equal(scenario.correctPath.length, 5);
        assert.equal(new Set(scenario.correctPath).size, 5);
        assert.equal(stage.answer, scenario.correctPath.join(" → "));
        assert.equal(scenario.components.length, 9);
        assert.equal(new Set(scenario.components).size, 9);
        scenario.correctPath.forEach((component) => assert.ok(scenario.components.includes(component), `${stage.id}: missing ${component}`));
        assert.equal(scenario.hints.length, 5);
        assert.ok(["filter", "reclaim", "pathway", "balance", "bladder"].includes(scenario.visual.process));
        assert.ok(Number.isFinite(scenario.visual.startFill) && Number.isFinite(scenario.visual.endFill));
    } else {
        assert.equal(stage.choices.length, 3);
        assert.equal(new Set(stage.choices).size, 3);
        assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1);
        assert.ok(stage.hint.trim());
    }
});

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
for (const idea of ["콩팥", "노폐물", "혈액", "요관", "방광", "요도", "소변", "필요한 물질"]) {
    assert.ok(learningText.includes(idea), `Missing excretion idea: ${idea}`);
}
assert.doesNotMatch(learningText, /사구체|보먼주머니|헨레고리|항이뇨호르몬|알도스테론|삼투압|여과율/, "Medical-school vocabulary should stay out of the school journey.");

const html = fs.readFileSync(files.html, "utf8");
for (const id of ["modeScreen", "personalModeButton", "classModeButton", "journeyScreen", "simulationCard", "stimulusIntensity", "signalPath", "componentBank", "excretionVisual", "bladderFluid", "filterState", "urineState", "bladderState", "resultScreen", "classRankingList", "missedList"]) {
    assert.ok(html.includes(`id="${id}"`), `Student page is missing #${id}`);
}
assert.ok(html.includes("개인 탐험") && html.includes("학급 순위 탐험") && html.includes("나의 오답노트"));
assert.ok(html.includes('src="excretion-data.js"'));
assert.ok(html.includes("niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"));
assert.ok(html.includes("niddk.nih.gov/health-information/urologic-diseases/urinary-tract-how-it-works"));

const styles = fs.readFileSync(files.styles, "utf8");
for (const asset of ["excretion-hero.webp", "excretion-kidney.webp", "excretion-path.webp", "excretion-explorer.png"]) {
    assert.ok(html.includes(asset) || styles.includes(asset), `Generated visual is not wired: ${asset}`);
}
assert.ok(styles.includes(".excretion-live-visual") && styles.includes(".bladder-fluid"));
assert.ok(styles.includes("@media (min-width: 740px) and (max-height: 820px)"));

for (const episodeFile of ["index.html", "digestion.html", "respiration.html", "nervous.html", "immune.html", "movement.html"]) {
    assert.ok(fs.readFileSync(path.join(dir, episodeFile), "utf8").includes('href="excretion.html"'), `${episodeFile} must offer episode 07.`);
}

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="excretion"'));
assert.ok(teacherHtml.includes('data-message-prefix="EXCRETION"'));

for (const file of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes('config.experienceType === "excretion-simulation"'));
assert.ok(app.includes("function updateExcretionVisual"));
assert.ok(app.includes('elements.bladderFluid?.setAttribute("height"'));

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("EXCRETION_ACTION"));
assert.ok(server.includes("EXCRETION_STATE"));
assert.ok(server.includes("excretion: 61"));

console.log("excretion-contract: five live urinary experiments, five checks, review, ranking, generated art and responsive UI ok");
