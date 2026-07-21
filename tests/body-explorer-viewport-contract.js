"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "learning", "simulations", "body-explorer");
const app = fs.readFileSync(path.join(dir, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(dir, "styles.css"), "utf8");
const nervousStyles = fs.readFileSync(path.join(dir, "nervous.css"), "utf8");
const immuneStyles = fs.readFileSync(path.join(dir, "immune.css"), "utf8");
const pages = ["index.html", "digestion.html", "respiration.html", "nervous.html", "immune.html"]
    .map((file) => fs.readFileSync(path.join(dir, file), "utf8"));

assert.ok(app.includes('elements.stageFact.textContent = ""'), "Facts must start empty before a learner answers.");
assert.ok(app.includes('elements.factCard.setAttribute("aria-hidden", "true")'), "Hidden facts must also stay hidden from assistive technology.");
assert.ok(app.includes('elements.factCard.classList.add("is-revealed")'), "Facts must be revealed after solving.");
const selectRouteSource = app.slice(app.indexOf("function selectRoute"), app.indexOf("function goToNextStage"));
assert.ok(selectRouteSource.indexOf("revealFact(stage)") > selectRouteSource.indexOf("if (!isCorrect)"), "Quiz facts must only be revealed in the correct-answer path.");
const experimentSource = app.slice(app.indexOf("function runInteractiveExperiment"), app.indexOf("function renderStage"));
assert.ok(experimentSource.indexOf("revealFact(stage)") > experimentSource.indexOf("mismatchIndex !== -1"), "Experiment facts must only be revealed after a successful run.");
assert.doesNotMatch(app, /announcer\.textContent = `[^`]*stage\.fact/, "Announcements must not reveal facts before answering.");

for (const [index, html] of pages.entries()) {
    assert.ok(/(?:풀이|실험) 뒤 핵심 정리/.test(html), `Episode ${index + 1} must label the fact as post-answer learning.`);
}

assert.ok(styles.includes("@media (min-width: 740px)"), "Tablet and larger viewports need the one-screen layout.");
assert.ok(styles.includes("height: 100dvh"), "The active journey must be bounded to the visible viewport.");
assert.match(styles, /grid-template-columns:\s*minmax\(260px,[^)]+\)\s*minmax\(390px,[^)]+\)/, "The scene and question must share the viewport side by side.");
assert.ok(styles.includes("body.journey-active footer"), "Nonessential footer content must be removed during a journey.");
assert.match(styles, /\.feedback \{[\s\S]*?height:\s*134px/, "Feedback must use reserved height before and after disclosure.");
assert.match(styles, /\.question-card \.feedback\.hidden \{[\s\S]*?display:\s*block !important/, "Hidden feedback must keep its reserved layout space.");
assert.match(styles, /\.fact-card \{[\s\S]*?visibility:\s*hidden/, "Facts must be visually hidden before solving.");
assert.match(styles, /\.fact-card\.is-revealed \{[\s\S]*?visibility:\s*visible/, "Facts must become visible after solving.");
assert.match(nervousStyles, /@media \(min-width: 740px\)[\s\S]*?\.simulation-card[\s\S]*?grid-row:\s*3/, "The nervous simulator must occupy the stable question-panel slot.");
assert.match(nervousStyles, /\.simulation-feedback \{[\s\S]*?min-height:\s*93px/, "Simulation feedback must reserve space before and after execution.");
assert.ok(immuneStyles.includes(".immune-page .simulation-card"), "The immune simulator must inherit the stable simulation panel layout.");

console.log("body-explorer-viewport-contract: answer privacy and stable quiz/simulation viewport layout ok");
