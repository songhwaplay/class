const decks = window.PROVERB_BANKS;
const BATCH_SIZE = 5;
let language = "ko";
let mode = "study";
let bankOrder = [];
let bankCursor = 0;
let studyBatch = [];
let studyPosition = 0;
let quizOrder = [];
let quizPosition = 0;
let currentChoices = null;
let correct = 0;
let attempts = 0;
const $ = (id) => document.getElementById(id);

function shuffle(items) {
  const result = [...items];
  for (let current = result.length - 1; current > 0; current -= 1) {
    const swap = Math.floor(Math.random() * (current + 1));
    [result[current], result[swap]] = [result[swap], result[current]];
  }
  return result;
}

function resetBank() {
  bankOrder = shuffle(Array.from({ length: decks[language].length }, (_, index) => index));
  bankCursor = 0;
}

function prepareBatch() {
  if (!bankOrder.length || bankCursor + BATCH_SIZE > bankOrder.length) resetBank();
  studyBatch = bankOrder.slice(bankCursor, bankCursor + BATCH_SIZE);
  bankCursor += BATCH_SIZE;
  studyPosition = 0;
  quizOrder = shuffle(studyBatch);
  quizPosition = 0;
  currentChoices = null;
  correct = 0;
  attempts = 0;
  $("nextQuestion").dataset.action = "next";
}

function updateNavigationLocale() {
  const english = language === "en";
  document.querySelector('[data-mode="study"]').textContent = english ? "Study" : "속담 공부";
  document.querySelector('[data-mode="quiz"]').textContent = english ? "Quiz" : "문제 풀기";
  document.querySelector('[data-language="ko"]').textContent = english ? "Korean Proverbs" : "한국 속담";
  document.querySelector('[data-language="en"]').textContent = english ? "English Proverbs" : "영어 속담";
}

function renderStudy() {
  const item = decks[language][studyBatch[studyPosition]];
  const english = language === "en";
  $("label").textContent = english
    ? `THIS SET ${studyPosition + 1} / ${BATCH_SIZE} · BANK ${decks.en.length}`
    : `이번 학습 ${studyPosition + 1} / ${BATCH_SIZE} · 전체 은행 ${decks.ko.length}개`;
  $("proverb").textContent = item.proverb;
  $("meaning").textContent = item.meaning;
  $("example").textContent = `예: ${item.example}`;
  $("previous").disabled = studyPosition === 0;
  $("next").textContent = studyPosition === BATCH_SIZE - 1
    ? (english ? "Start quiz" : "문제 풀기")
    : (english ? "Next proverb" : "다음 속담");
}

function buildChoices(correctIndex) {
  const distractors = shuffle(
    Array.from({ length: decks[language].length }, (_, index) => index)
      .filter((index) => index !== correctIndex)
  ).slice(0, 2);
  const choiceIndices = shuffle([correctIndex, ...distractors]);
  return {
    texts: choiceIndices.map((index) => decks[language][index].proverb),
    answer: choiceIndices.indexOf(correctIndex)
  };
}

function renderQuiz() {
  const itemIndex = quizOrder[quizPosition];
  const item = decks[language][itemIndex];
  const english = language === "en";
  currentChoices = buildChoices(itemIndex);
  $("quizKicker").textContent = english
    ? `QUICK QUIZ · ${quizPosition + 1} / ${BATCH_SIZE}`
    : `확인 퀴즈 · ${quizPosition + 1} / ${BATCH_SIZE}`;
  $("quiz-title").textContent = english
    ? "Which proverb best fits this situation?"
    : "이 상황에 알맞은 속담은?";
  $("reviewAnswer").textContent = english ? "Study this proverb again" : "이 속담 다시 공부하기";
  $("nextQuestion").textContent = english ? "Next question" : "다음 문제";
  $("nextQuestion").dataset.action = "next";
  $("score").textContent = english ? `Correct ${correct} / ${attempts}` : `정답 ${correct} / ${attempts}`;
  $("question").textContent = item.question;
  $("feedback").textContent = "";
  $("reviewAnswer").hidden = true;
  $("nextQuestion").hidden = false;
  $("nextQuestion").disabled = true;
  $("choices").replaceChildren(...currentChoices.texts.map((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice;
    button.dataset.sfx = "none";
    button.addEventListener("click", () => answer(choiceIndex, button));
    return button;
  }));
}

function renderQuizComplete() {
  const english = language === "en";
  $("quizKicker").textContent = english ? "SET COMPLETE" : "5개 학습 완료";
  $("quiz-title").textContent = english ? "Great work!" : "이번 묶음을 끝냈어요!";
  $("question").textContent = english
    ? `You answered ${correct} out of ${BATCH_SIZE} questions correctly.`
    : `5문제 중 ${correct}문제를 맞혔습니다.`;
  $("choices").replaceChildren();
  $("feedback").textContent = "";
  $("reviewAnswer").hidden = true;
  $("nextQuestion").hidden = false;
  $("nextQuestion").disabled = false;
  $("nextQuestion").dataset.action = "next-batch";
  $("nextQuestion").textContent = english ? "Study the next 5" : "다음 5개 공부";
}

function setMode(nextMode) {
  mode = nextMode;
  const studying = mode === "study";
  $("studyView").hidden = !studying;
  $("quizView").hidden = studying;
  $("score").hidden = studying;
  document.querySelectorAll(".mode-tab").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  studying ? renderStudy() : renderQuiz();
}

function answer(choiceIndex, selectedButton) {
  const item = decks[language][quizOrder[quizPosition]];
  const buttons = [...$("choices").querySelectorAll("button")];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === currentChoices.answer) button.classList.add("correct");
  });
  attempts += 1;
  if (choiceIndex === currentChoices.answer) {
    correct += 1;
    window.ClassGameSfx?.play("success");
    $("feedback").textContent = language === "en"
      ? "Correct! You matched the proverb to the situation."
      : "정답! 뜻과 상황을 잘 연결했어요.";
  } else {
    selectedButton.classList.add("wrong");
    window.ClassGameSfx?.play("error");
    $("feedback").textContent = language === "en"
      ? `The correct answer is “${item.proverb}”.`
      : `정답은 “${item.proverb}”입니다.`;
    $("reviewAnswer").hidden = false;
  }
  $("nextQuestion").disabled = false;
  const last = quizPosition === BATCH_SIZE - 1;
  $("nextQuestion").textContent = last
    ? (language === "en" ? "See results" : "결과 보기")
    : (language === "en" ? "Next question" : "다음 문제");
  $("score").textContent = language === "en"
    ? `Correct ${correct} / ${attempts}`
    : `정답 ${correct} / ${attempts}`;
}

document.querySelectorAll(".mode-tab").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".language-tab").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    resetBank();
    prepareBatch();
    document.querySelectorAll(".language-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    updateNavigationLocale();
    mode === "study" ? renderStudy() : renderQuiz();
  });
});

$("next").addEventListener("click", () => {
  if (studyPosition === BATCH_SIZE - 1) setMode("quiz");
  else {
    studyPosition += 1;
    renderStudy();
  }
});

$("previous").addEventListener("click", () => {
  if (studyPosition > 0) studyPosition -= 1;
  renderStudy();
});

$("nextQuestion").addEventListener("click", () => {
  if ($("nextQuestion").dataset.action === "next-batch") {
    prepareBatch();
    setMode("study");
  } else if (quizPosition === BATCH_SIZE - 1) {
    renderQuizComplete();
  } else {
    quizPosition += 1;
    renderQuiz();
  }
});

$("reviewAnswer").addEventListener("click", () => {
  studyPosition = studyBatch.indexOf(quizOrder[quizPosition]);
  setMode("study");
});

updateNavigationLocale();
resetBank();
prepareBatch();
renderStudy();
