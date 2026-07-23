(() => {
  "use strict";
  const state = { items: [], track: "ko", set: [], index: 0, score: 0, answered: false };
  const $ = (id) => document.getElementById(id);
  const node = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };

  function show(view) {
    $("dashboardView").hidden = view !== "dashboard";
    $("questionView").hidden = view !== "question";
    $("resultView").hidden = view !== "result";
  }

  function renderLevels() {
    const list = $("levelList"); list.replaceChildren();
    const items = state.items.filter((item) => item.track === state.track);
    for (let level = 1; level <= 8; level += 1) {
      const count = items.filter((item) => item.targetLevel === level).length;
      const card = node("button", "level-card", ""); card.type = "button"; card.disabled = !count;
      card.append(node("strong", "level-code", `${state.track === "en" ? "E" : "K"}${level}`), node("span", "", count ? "5문제" : "준비 중"));
      card.addEventListener("click", () => startSet(level)); list.append(card);
    }
  }

  function startSet(level) {
    state.set = state.items.filter((item) => item.track === state.track && item.targetLevel === level).sort(() => Math.random() - .5).slice(0, 5);
    state.index = 0; state.score = 0; renderQuestion(); show("question"); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestion() {
    const item = state.set[state.index]; state.answered = false;
    $("questionLevel").textContent = `${item.track === "en" ? "E" : "K"}${item.targetLevel}`;
    $("questionProgress").textContent = `${state.index + 1} / ${state.set.length}`;
    $("questionTopic").textContent = item.topicTitle;
    $("progressFill").style.width = `${((state.index + 1) / state.set.length) * 100}%`;
    $("studentPassage").textContent = item.passageText; $("studentPrompt").textContent = item.promptText;
    $("feedback").hidden = true; $("answerStatus").textContent = "";
    const choices = $("studentChoices"); choices.replaceChildren();
    item.choices.forEach((choice, index) => {
      const button = node("button", "student-choice", ""); button.type = "button";
      button.append(node("span", "choice-number", String(index + 1)), node("span", "", choice));
      button.addEventListener("click", () => choose(index, button)); choices.append(button);
    });
    $("nextButton").disabled = true; $("nextButton").textContent = "정답 확인";
  }

  function choose(index, selected) {
    if (state.answered) return;
    [...$("studentChoices").children].forEach((button) => button.classList.remove("selected"));
    selected.classList.add("selected"); $("nextButton").disabled = false; $("nextButton").onclick = () => check(index);
  }

  function check(index) {
    if (state.answered) return next();
    state.answered = true; const item = state.set[state.index]; const correct = index === item.correctIndex;
    if (correct) state.score += 1;
    [...$("studentChoices").children].forEach((button, choiceIndex) => { button.disabled = true; if (choiceIndex === item.correctIndex) button.classList.add("correct"); else if (choiceIndex === index) button.classList.add("wrong"); });
    const feedback = $("feedback"); feedback.className = `feedback ${correct ? "is-correct" : "is-wrong"}`; feedback.textContent = `${correct ? "정답 · " : "오답 · "}${item.explanation}`; feedback.hidden = false;
    $("nextButton").textContent = state.index === state.set.length - 1 ? "결과 보기" : "다음 문제";
  }

  function next() { if (state.index + 1 < state.set.length) { state.index += 1; renderQuestion(); } else { $("resultTitle").textContent = `${state.score} / ${state.set.length}`; $("resultCopy").textContent = `정답 ${state.score}개 · 오답 ${state.set.length - state.score}개`; show("result"); } }

  async function start() {
    try { const response = await fetch("/api/reading/self-study"); if (!response.ok) throw new Error(); state.items = (await response.json()).items || []; renderLevels(); }
    catch (_) { $("levelList").replaceChildren(node("p", "empty-pilots", "문제를 불러오지 못했습니다.")); }
  }
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => { state.track = tab.dataset.track; document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button === tab)); renderLevels(); }));
  $("backButton").addEventListener("click", () => show("dashboard")); $("restartButton").addEventListener("click", () => show("dashboard")); $("nextButton").addEventListener("click", () => {});
  start();
})();
