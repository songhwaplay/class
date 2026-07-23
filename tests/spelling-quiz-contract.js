const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const spellingDir = path.join(root, "learning", "basics", "spelling");
const htmlPath = path.join(spellingDir, "index.html");
const questionsPath = path.join(spellingDir, "questions.js");
const extraQuestionsPath = path.join(spellingDir, "questions-extra.js");
const questionDeckPath = path.join(spellingDir, "question-deck.js");
const appPath = path.join(spellingDir, "app.js");
const stylesPath = path.join(spellingDir, "styles.css");
const teacherHtmlPath = path.join(spellingDir, "teacher.html");
const teacherAppPath = path.join(spellingDir, "teacher.js");
const teacherStylesPath = path.join(spellingDir, "teacher.css");
const bgmPath = path.join(spellingDir, "assets", "sound", "bgm.mp3");
const hubPath = path.join(root, "index.html");
const serverPath = path.join(root, "game-hub-server", "server.js");

for (const filePath of [htmlPath, questionsPath, extraQuestionsPath, questionDeckPath, appPath, stylesPath, teacherHtmlPath, teacherAppPath, teacherStylesPath, bgmPath]) {
    assert.ok(fs.existsSync(filePath), `Missing spelling quiz file: ${filePath}`);
}
assert.ok(fs.statSync(bgmPath).size > 0, "Spelling background music must not be empty.");

const questionsSource = fs.readFileSync(questionsPath, "utf8");
const extraQuestionsSource = fs.readFileSync(extraQuestionsPath, "utf8");
const questionContext = { window: {} };
vm.createContext(questionContext);
vm.runInContext(questionsSource, questionContext, { filename: questionsPath });
vm.runInContext(extraQuestionsSource, questionContext, { filename: extraQuestionsPath });

const questions = questionContext.window.SPELLING_QUESTIONS;
assert.ok(Array.isArray(questions), "Question bank must be an array.");
assert.strictEqual(questions.length, 160, "Question bank should contain 160 questions.");

const ids = new Set();
for (const question of questions) {
    assert.ok(question.id && typeof question.id === "string", "Every question needs an id.");
    assert.match(question.id, /^[a-z0-9_-]+$/i, `${question.id}: id must be safe for class ranking messages.`);
    assert.ok(!ids.has(question.id), `Duplicate question id: ${question.id}`);
    ids.add(question.id);

    for (const key of ["category", "prompt", "sentence", "answer", "explanation"]) {
        assert.ok(typeof question[key] === "string" && question[key].trim(), `${question.id}: missing ${key}`);
    }

    assert.ok(question.sentence.includes("___"), `${question.id}: sentence must contain a blank.`);
    assert.ok(Array.isArray(question.choices), `${question.id}: choices must be an array.`);
    assert.ok(question.choices.length >= 2 && question.choices.length <= 4, `${question.id}: invalid choice count.`);
    assert.strictEqual(new Set(question.choices).size, question.choices.length, `${question.id}: duplicate choices.`);
    assert.strictEqual(
        question.choices.filter((choice) => choice === question.answer).length,
        1,
        `${question.id}: answer must appear exactly once in choices.`
    );
}

const html = fs.readFileSync(htmlPath, "utf8");
for (const requiredId of [
    "modeScreen",
    "personalScreen",
    "personalModeButton",
    "classModeButton",
    "lobbyScreen",
    "joinCode",
    "quizScreen",
    "resultScreen",
    "personalStartButton",
    "questionText",
    "choiceList",
    "feedback",
    "nextButton",
    "spellingBgm",
    "bgmToggle",
    "classRankArea",
    "classRankingList",
    "missedList"
]) {
    assert.ok(html.includes(`id="${requiredId}"`), `Missing required element #${requiredId}`);
}

assert.ok(html.includes('href="styles.css"'), "Quiz stylesheet is not linked.");
assert.ok(html.includes('src="questions.js"'), "Question bank is not linked.");
assert.ok(html.includes('src="questions-extra.js"'), "Expanded question bank is not linked.");
assert.ok(html.includes('src="question-deck.js"'), "No-repeat question deck is not linked.");
assert.ok(html.includes('src="app.js"'), "Quiz app is not linked.");
assert.ok(html.includes('src="/learning/basics/spelling/assets/sound/bgm.mp3"'), "Personal mode background music is not linked.");
assert.ok(html.includes("loop preload=\"auto\""), "Spelling background music should loop.");
assert.ok(html.includes("game-network.js"), "Class ranking mode must load the classroom network.");
assert.ok(html.includes("multiplayer-lobby.js"), "Class ranking mode must load the shared lobby.");
assert.ok(html.includes("학급 단체전 · 순위 모드"), "Class ranking mode choice is missing.");
assert.ok(html.includes("나의 오답노트"), "Personal wrong-answer notebook is missing.");
assert.ok(html.includes("한국어 어문 규범"), "Official language norms source should be visible.");
assert.ok(html.includes("표준국어대사전"), "Standard dictionary source should be visible.");

const appSource = fs.readFileSync(appPath, "utf8");
new vm.Script(appSource, { filename: appPath });
assert.ok(appSource.includes("SESSION_SIZE = 10"), "A round should contain 10 questions.");
assert.ok(appSource.includes("classPlayerName"), "Player name handoff should be supported.");
assert.ok(appSource.includes("localStorage"), "Best score should be stored locally.");
assert.ok(appSource.includes('GAME_ID = "spelling"'), "Class ranking mode needs a unique game id.");
assert.ok(appSource.includes('action: "SUBMIT"'), "Class results must be submitted to the ranking server.");
assert.ok(appSource.includes("renderClassRanking"), "Students need a live class ranking view.");
assert.ok(appSource.includes("PERSONAL_DECK_KEY"), "Personal mode should avoid repeats until the question deck is exhausted.");
assert.ok(appSource.includes('state.mode !== "personal"'), "Student music must be limited to personal mode.");
assert.ok(appSource.includes('if (state.mode === "class")'), "Class ranking mode must explicitly stop music on student devices.");
assert.ok(appSource.includes("elements.bgmToggle.classList.add(\"hidden\")"), "The music control must be hidden from students in class mode.");

const teacherHtml = fs.readFileSync(teacherHtmlPath, "utf8");
for (const requiredId of ["roomCode", "copyBtn", "lobbyPlayers", "teacherStartButton", "teacherRankingList", "resetRaceButton", "spellingBgm", "bgmToggle"]) {
    assert.ok(teacherHtml.includes(`id="${requiredId}"`), `Teacher page is missing #${requiredId}`);
}
assert.ok(teacherHtml.includes('src="/learning/basics/spelling/assets/sound/bgm.mp3"'), "Teacher ranking page background music is not linked.");
const teacherSource = fs.readFileSync(teacherAppPath, "utf8");
new vm.Script(teacherSource, { filename: teacherAppPath });
assert.ok(teacherSource.includes('action: "START"'), "Teacher must be able to start all students together.");
assert.ok(teacherSource.includes('action: "RESET"'), "Teacher must be able to prepare a new ranking round.");
assert.ok(teacherSource.includes("TEACHER_DECK_KEY"), "Class rounds should avoid repeats until the teacher deck is exhausted.");
assert.ok(teacherSource.includes("startBgm();"), "The teacher computer must start music with the class competition.");
assert.ok(teacherSource.includes("stopBgm();"), "Resetting the class competition must stop and rewind the music.");

const serverSource = fs.readFileSync(serverPath, "utf8");
new vm.Script(serverSource, { filename: serverPath });
assert.ok(serverSource.includes("SPELLING_ACTION"), "Server is missing spelling ranking actions.");
assert.ok(serverSource.includes("SPELLING_STATE"), "Server is missing spelling ranking broadcasts.");
assert.ok(serverSource.includes("elapsedMs: Math.max(0, Date.now() - game.startedAt)"), "Completion time must be server-authoritative.");

const hub = fs.readFileSync(hubPath, "utf8");
assert.ok(hub.includes('href="learning/basics/spelling/index.html"'), "Hub is missing the spelling quiz link.");
assert.ok(hub.includes("한글 맞춤법"), "Hub is missing the Korean orthography title.");
assert.ok(hub.includes("(Korean Spelling)"), "Hub is missing the English subtitle.");

console.log(`Spelling quiz contract passed (${questions.length} questions).`);
