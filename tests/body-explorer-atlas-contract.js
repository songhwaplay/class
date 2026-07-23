"use strict";

const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const explorerRoot = path.join(root, "learning", "simulations", "body-explorer");
const read = (file) => fs.readFileSync(path.join(explorerRoot, file), "utf8");
const loadStages = (file) => {
    const sandbox = { window: {} };
    vm.runInNewContext(read(file), sandbox, { filename: file });
    return sandbox.window.BODY_EXPLORER_STAGES;
};

const circulationHtml = read("index.html");
const circulationApp = read("app.js");
const circulationAtlas = read("atlas-3d.js");
const circulationData = read("journey-data.js");
const circulationStyles = read("styles.css");

assert.match(circulationHtml, /id="anatomyExplorer"/);
assert.match(circulationHtml, /id="anatomyMap"/);
assert.match(circulationHtml, /src="atlas-3d\.js"/);
assert.match(circulationHtml, /data-atlas-mode="explore"/);
assert.match(circulationHtml, /data-atlas-view="body"/);
assert.match(circulationHtml, /data-atlas-view="heart"/);
assert.match(circulationHtml, /data-atlas-view="lung"/);
assert.match(circulationHtml, /data-atlas-layer="skin"/);
assert.match(circulationHtml, /data-atlas-layer="organs"/);
assert.match(circulationHtml, /data-atlas-layer="vessels"/);

const circulationTargets = [
    "body-return",
    "right-atrium",
    "tricuspid",
    "pulmonary-artery",
    "alveoli",
    "pulmonary-vein",
    "mitral",
    "left-ventricle",
    "aorta",
    "tissue-exchange"
];

circulationTargets.forEach((target) => {
    assert.match(circulationHtml, new RegExp(`data-target="${target}"`));
    assert.match(circulationData, new RegExp(`target:\\s*"${target}"`));
    assert.match(circulationApp, new RegExp(`"${target}"|${target}:`));
});

assert.match(circulationApp, /function renderAnatomyExplorer/);
assert.match(circulationApp, /function selectAnatomyTarget/);
assert.match(circulationApp, /body-explorer-stage-rendered/);
assert.match(circulationAtlas, /function setFreeExplore/);
assert.match(circulationAtlas, /pointerdown/);
assert.match(circulationAtlas, /data-atlas-layer/);
assert.match(circulationStyles, /@media \(max-width: (?:739|800)px\)/);
assert.match(circulationStyles, /\.anatomy-map\s*\{[^}]*min-height:\s*390px/s);
assert.match(circulationStyles, /\.anatomy-hotspot::before\s*\{[^}]*inset:\s*-9px/s);
assert.match(circulationStyles, /min-height:\s*34px/);
assert.match(circulationStyles, /data-target="tissue-exchange"\]\s*\{\s*left:\s*57%;\s*top:\s*60%;\s*\}/);

const premiumSystems = [
    "digestion",
    "respiration",
    "nervous",
    "immune",
    "movement",
    "excretion",
    "temperature"
];
const systemAtlas = read("system-atlas.js");
const premiumStyles = read("series-premium.css");
const manipulationSource = systemAtlas.slice(
    systemAtlas.indexOf("const manipulationStages ="),
    systemAtlas.indexOf("const choiceList =")
);
const liveJourneySource = systemAtlas.slice(
    systemAtlas.indexOf("const liveJourneyProfiles ="),
    systemAtlas.indexOf("const liveJourney =")
);

premiumSystems.forEach((system) => {
    const html = read(`${system}.html`);
    assert.match(html, /href="series-premium\.css\?v=20260723-3"/);
    assert.match(html, /src="system-atlas\.js\?v=20260723-3"/);
    assert.match(html, /src="app\.js"/);
    assert.match(systemAtlas, new RegExp(`${system}:`));
});

["digestion", "respiration"].forEach((system) => {
    const stages = loadStages(`${system}-data.js`);
    assert.strictEqual(stages.length, 10, `${system} should keep ten journey stages`);
    stages.forEach((stage) => {
        assert.ok(
            manipulationSource.includes(`"${stage.id}"`) || manipulationSource.includes(`${stage.id}:`),
            `${system} stage ${stage.id} is missing a direct-manipulation configuration`
        );
        assert.ok(
            liveJourneySource.includes(`"${stage.id}"`) || liveJourneySource.includes(`${stage.id}:`),
            `${system} stage ${stage.id} is missing live-atlas telemetry`
        );
    });
});

["nervous", "immune", "movement", "excretion", "temperature"].forEach((system) => {
    const stages = loadStages(`${system}-data.js`);
    const experiments = stages.filter((stage) => stage.kind === "experiment");
    assert.strictEqual(experiments.length, 5, `${system} should keep five direct physiology experiments`);
    experiments.forEach((stage) => {
        assert.ok(stage.scenario, `${system} experiment ${stage.id} is missing its scenario`);
        assert.ok(Array.isArray(stage.scenario.correctPath), `${system} experiment ${stage.id} is missing its correct path`);
        assert.ok(Number.isFinite(stage.scenario.threshold), `${system} experiment ${stage.id} is missing its threshold`);
        assert.ok(
            liveJourneySource.includes(`"${stage.id}"`) || liveJourneySource.includes(`${stage.id}:`),
            `${system} experiment ${stage.id} is missing live-atlas telemetry`
        );
    });
});

assert.match(systemAtlas, /className = "system-process-atlas"/);
assert.match(systemAtlas, /className = "physiology-direct-console"/);
assert.match(systemAtlas, /body-explorer-stage-rendered/);
assert.match(systemAtlas, /MutationObserver/);
assert.match(systemAtlas, /if \(!isExperiment\)\s*\{[\s\S]*?activePhysiologyStage = "";[\s\S]*?physiologyCompleting = false;/);
assert.match(systemAtlas, /stage\.id !== activePhysiologyStage \|\| !directConsole\.isConnected/);
assert.match(systemAtlas, /function isInTargetRange\(value, minimum, maximum\)/);
assert.doesNotMatch(systemAtlas, /response\s*>=\s*78/);
assert.ok(
    (manipulationSource.match(/targetMax:/g) || []).length >= 10,
    "digestion and respiration should use target bands often enough to prevent right-edge solving"
);
assert.match(
    manipulationSource,
    /controls:\s*\[\{[^}]*targetMin:[^}]*targetMax:[^}]*\},\s*\{[^}]*targetMin:[^}]*targetMax:/,
    "dual controls should define independent target bands"
);

const goalPatternsSource = systemAtlas.match(/const physiologyGoalPatterns = (\[[\s\S]*?\]);\s*\n\s*function physiologyGoalFor/);
assert.ok(goalPatternsSource, "physiology target patterns should be inspectable");
const physiologyGoalPatterns = Function(`"use strict"; return (${goalPatternsSource[1]});`)();
assert.strictEqual(physiologyGoalPatterns.length, 5);
physiologyGoalPatterns.forEach((pattern, index) => {
    assert.ok(
        pattern.responseStart < pattern.response[0] || pattern.responseStart > pattern.response[1],
        `physiology pattern ${index + 1} should start outside its response target`
    );
    assert.ok(pattern.response[1] < 100, `physiology pattern ${index + 1} must reject the right edge`);
});
assert.match(premiumStyles, /\.system-process-atlas/);
assert.match(premiumStyles, /\.physiology-direct-console/);
assert.match(premiumStyles, /@media \(max-width: 739px\)/);
assert.match(premiumStyles, /\.physiology-direct-console\s*\{\s*grid-template-columns:\s*1fr;/);
assert.match(premiumStyles, /\.system-atlas-toolbar button\s*\{[^}]*min-height:\s*32px/s);
assert.match(premiumStyles, /\.atlas-journey-rail button\s*\{[^}]*height:\s*24px/s);
assert.match(premiumStyles, /\.physiology-control input\s*\{[^}]*height:\s*36px/s);
assert.match(premiumStyles, /@media \(max-width: 739px\)[\s\S]*?\.atlas-journey-rail\s*\{[^}]*repeat\(5,\s*1fr\)/);

for (const file of fs.readdirSync(explorerRoot).filter((name) => name.endsWith(".html"))) {
    const html = read(file);
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        const reference = match[1].split("?")[0];
        if (!reference || /^(?:https?:|#|data:)/.test(reference)) continue;
        assert.ok(
            fs.existsSync(path.resolve(explorerRoot, reference)),
            `${file} references missing local asset: ${match[1]}`
        );
    }
}

console.log("body-explorer-atlas-contract: circulation 3D atlas, seven system atlases, responsive controls and local assets ok");
