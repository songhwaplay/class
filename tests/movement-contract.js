"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const files = {
    html: path.join(dir, "movement.html"),
    data: path.join(dir, "movement-data.js"),
    app: path.join(dir, "app.js"),
    styles: path.join(dir, "movement.css"),
    simulatorStyles: path.join(dir, "nervous.css"),
    teacherHtml: path.join(dir, "movement-teacher.html"),
    teacherApp: path.join(dir, "teacher.js"),
    server: path.join(root, "game-hub-server", "server.js")
};
const images = ["movement-hero.webp", "movement-joint.webp", "movement-load.webp", "movement-explorer.webp"]
    .map((name) => path.join(root, "assets", "images", "body-explorer", name));

for (const file of [...Object.values(files), ...images]) {
    assert.ok(fs.existsSync(file), `Missing movement explorer file: ${file}`);
    assert.ok(fs.statSync(file).size > 0, `Movement explorer file is empty: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(files.data, "utf8"), context, { filename: files.data });
const stages = context.window.BODY_EXPLORER_STAGES;
const config = context.window.BODY_EXPLORER_CONFIG;

assert.equal(config.gameId, "movement");
assert.equal(config.messagePrefix, "MOVEMENT");
assert.equal(config.experienceType, "movement-simulation");
assert.equal(config.simulationCopy.runLabel, "움직임 실행");
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
        assert.ok(scenario && scenario.visual, `${stage.id}: missing live movement visual`);
        assert.ok(Number.isInteger(scenario.threshold) && scenario.threshold > 0 && scenario.threshold < 100);
        assert.equal(scenario.correctPath.length, 5);
        assert.equal(new Set(scenario.correctPath).size, 5);
        assert.equal(stage.answer, scenario.correctPath.join(" → "));
        assert.equal(scenario.components.length, 9);
        assert.equal(new Set(scenario.components).size, 9);
        scenario.correctPath.forEach((component) => assert.ok(scenario.components.includes(component), `${stage.id}: missing ${component}`));
        assert.equal(scenario.hints.length, 5);
        assert.ok(Number.isFinite(scenario.visual.startAngle) && Number.isFinite(scenario.visual.endAngle));
        assert.ok(["front", "back"].includes(scenario.visual.activeMuscle));
    } else {
        assert.equal(stage.choices.length, 3);
        assert.equal(new Set(stage.choices).size, 3);
        assert.equal(stage.choices.filter((choice) => choice === stage.answer).length, 1);
        assert.ok(stage.hint.trim());
    }
});

assert.deepEqual(Array.from(stages, (stage) => stage.answer), [
    "위팔뼈와 아래팔뼈 → 팔꿈치 관절에서 연결 → 연골이 충격을 줄임 → 근육이 뼈를 당김 → 팔의 각도 변화",
    "단단한 뼈 사이에서 각도가 달라질 연결 지점이 없어지기 때문에",
    "팔을 굽히라는 신호 → 앞쪽 근육 수축 → 뒤쪽 근육 이완 → 힘줄이 아래팔뼈를 당김 → 팔꿈치가 굽어짐",
    "앞쪽 근육이 수축해 뼈를 당기고 뒤쪽 근육은 이완한다",
    "팔을 펴라는 신호 → 뒤쪽 근육 수축 → 앞쪽 근육 이완 → 힘줄이 아래팔뼈를 당김 → 팔꿈치가 펴짐",
    "근육은 수축해 한쪽으로 당기므로 반대 방향의 움직임에는 반대쪽 근육의 당김이 필요하기 때문에",
    "근육 섬유 수축 → 근육이 짧고 두꺼워짐 → 힘줄에 당기는 힘 전달 → 뼈가 관절 중심으로 움직임 → 팔의 위치 변화",
    "근육의 당기는 힘이 뼈에 충분히 전달되지 않아 관절 움직임이 어려워진다",
    "가방의 무게가 아래로 작용 → 앞쪽 근육 수축 → 힘줄에 당기는 힘 전달 → 아래팔뼈가 관절 중심으로 회전 → 가방을 들어 올림",
    "더 큰 무게가 팔을 아래로 돌리려 하므로 그 힘에 맞설 더 큰 당기는 힘이 필요하기 때문에"
]);

const learningText = stages.map((stage) => `${stage.fact} ${stage.question} ${stage.explanation} ${stage.answer}`).join(" ");
for (const idea of ["관절", "수축", "이완", "힘줄", "뼈", "물체의 무게"]) {
    assert.ok(learningText.includes(idea), `Missing movement idea: ${idea}`);
}
assert.doesNotMatch(learningText, /근원섬유|액틴|미오신|ATP|근방추|등척성|회전 모멘트|토크/, "Advanced biomechanics vocabulary should stay out of the elementary journey.");

const html = fs.readFileSync(files.html, "utf8");
for (const id of ["modeScreen", "personalModeButton", "classModeButton", "journeyScreen", "simulationCard", "stimulusIntensity", "signalPath", "componentBank", "motionVisual", "motionForearm", "motionFrontMuscle", "motionBackMuscle", "motionAngle", "resultScreen", "classRankingList", "missedList"]) {
    assert.ok(html.includes(`id="${id}"`), `Student page is missing #${id}`);
}
assert.ok(html.includes("개인 탐험") && html.includes("학급 순위 탐험") && html.includes("나의 오답노트"));
assert.ok(html.includes('src="movement-data.js"'));
assert.ok(html.includes("niams.nih.gov/health-topics/educational-resources/health-lesson-learning-about-joints"));
assert.ok(html.includes("ncbi.nlm.nih.gov/books/NBK613072"));

const styles = fs.readFileSync(files.styles, "utf8");
for (const asset of ["movement-hero.webp", "movement-joint.webp", "movement-load.webp", "movement-explorer.webp"]) {
    assert.ok(html.includes(asset) || styles.includes(asset), `Generated visual is not wired: ${asset}`);
}
assert.ok(styles.includes(".motion-live-visual") && styles.includes("#motionForearm"));
assert.ok(styles.includes("@media (min-width: 740px) and (max-height: 820px)"));

for (const episodeFile of ["index.html", "digestion.html", "respiration.html", "nervous.html", "immune.html"]) {
    assert.ok(fs.readFileSync(path.join(dir, episodeFile), "utf8").includes('href="movement.html"'), `${episodeFile} must offer episode 06.`);
}

const teacherHtml = fs.readFileSync(files.teacherHtml, "utf8");
assert.ok(teacherHtml.includes('data-game-id="movement"'));
assert.ok(teacherHtml.includes('data-message-prefix="MOVEMENT"'));

for (const file of [files.data, files.app, files.teacherApp, files.server]) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const app = fs.readFileSync(files.app, "utf8");
assert.ok(app.includes('config.experienceType === "movement-simulation"'));
assert.ok(app.includes("function updateMovementVisual"));
assert.ok(app.includes('elements.motionForearm?.setAttribute("transform"'));

const server = fs.readFileSync(files.server, "utf8");
assert.ok(server.includes("MOVEMENT_ACTION"));
assert.ok(server.includes("MOVEMENT_STATE"));
assert.ok(server.includes("movement: 61"));

console.log("movement-contract: five live joint experiments, five checks, review, ranking, generated art and responsive UI ok");
