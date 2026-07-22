"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "temperature.html"),
    data: path.join(dir, "temperature-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "temperature.css"),
    teacherHtml: path.join(dir, "temperature-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = ["temperature-hero.webp", "temperature-hot.webp", "temperature-cold.webp", "temperature-explorer.webp"]
    .map((name) => path.join(root, "assets", "images", "body-explorer", name));

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing temperature explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Temperature explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;

assert.equal(config.gameId, "temperature");
assert.equal(config.messagePrefix, "TEMPERATURE");
assert.equal(config.experienceType, "temperature-simulation");
assert.equal(config.simulationCopy.runLabel, "체온 조절 실행");
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
        assert.ok(scenario && scenario.visual, `${stage.id}: missing live thermoregulation visual`);
        assert.ok(Number.isInteger(scenario.threshold) && scenario.threshold > 0 && scenario.threshold < 100);
        assert.equal(scenario.correctPath.length, 5);
        assert.equal(new Set(scenario.correctPath).size, 5);
        assert.equal(stage.answer, scenario.correctPath.join(" → "));
        assert.equal(scenario.components.length, 9);
        assert.equal(new Set(scenario.components).size, 9);
        scenario.correctPath.forEach((component) => assert.ok(scenario.components.includes(component), `${stage.id}: missing ${component}`));
        assert.equal(scenario.hints.length, 5);
        assert.ok(["sense", "cool", "conserve", "shiver", "balance"].includes(scenario.visual.process));
        assert.ok(Number.isFinite(scenario.visual.startTemp) && Number.isFinite(scenario.visual.endTemp));
    } else {
        assert.equal(stage.choices.length, 3);
        assert.equal(new Set(stage.choices).size, 3);
        assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1);
        assert.ok(stage.hint.trim());
        assert.ok(stage.question.length >= 30, `${stage.id}: reasoning question is too short`);
    }
});

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
for (const idea of ["뇌", "피부 혈관", "땀", "증발", "열", "근육", "떨림", "체온"]) {
    assert.ok(learningText.includes(idea), `Missing temperature-regulation idea: ${idea}`);
}
assert.doesNotMatch(learningText, /시상하부|교감신경|콜린성|카테콜아민|갑상샘호르몬|갈색지방|혈관운동/, "Medical-school vocabulary should stay out of the school journey.");

const html = fs.readFileSync(files.html, "utf8");
for (const id of ["modeScreen", "personalModeButton", "classModeButton", "journeyScreen", "simulationCard", "stimulusIntensity", "signalPath", "componentBank", "temperatureVisual", "temperatureColumn", "skinVessel", "sweatDrops", "heatArrows", "muscleShiver", "temperatureState", "vesselState", "responseState", "resultScreen", "classRankingList", "missedList"]) {
    assert.ok(html.includes(`id="${id}"`), `Student page is missing #${id}`);
}
assert.ok(html.includes("개인 탐험") && html.includes("학급 순위 탐험") && html.includes("나의 오답노트"));
assert.ok(html.includes('src="temperature-data.js"'));
assert.ok(html.includes("ncbi.nlm.nih.gov/books/NBK507838"));
assert.ok(html.includes("ncbi.nlm.nih.gov/books/NBK541107"));

const styles = fs.readFileSync(files.styles, "utf8");
for (const asset of ["temperature-hero.webp", "temperature-hot.webp", "temperature-cold.webp", "temperature-explorer.webp"]) {
    assert.ok(html.includes(asset) || styles.includes(asset), `Generated visual is not wired: ${asset}`);
}
assert.ok(styles.includes(".temperature-live-visual") && styles.includes(".skin-vessel"));
assert.ok(styles.includes("@media (min-width: 740px) and (max-height: 820px)"));

for (const episodeFile of ["index.html", "digestion.html", "respiration.html", "nervous.html", "immune.html", "movement.html", "excretion.html"]) {
    assert.ok(fs.readFileSync(path.join(dir, episodeFile), "utf8").includes('href="temperature.html"'), `${episodeFile} must offer episode 08.`);
}

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="temperature"'));
assert.ok(teacherHtml.includes('data-message-prefix="TEMPERATURE"'));

for (const file of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes('config.experienceType === "temperature-simulation"'));
assert.ok(app.includes("function updateTemperatureVisual"));
assert.ok(app.includes('elements.temperatureColumn?.setAttribute("height"'));

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("TEMPERATURE_ACTION"));
assert.ok(server.includes("TEMPERATURE_STATE"));
assert.ok(server.includes("temperature: 61"));

console.log("temperature-contract: five live thermoregulation experiments, five reasoning checks, review, ranking, generated art and responsive UI ok");
