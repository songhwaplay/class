const decks = {
  ko: [
    { proverb: "돌다리도 두들겨 보고 건너라", meaning: "아무리 잘 아는 일이라도 실수하지 않도록 다시 확인하라는 뜻입니다.", example: "숙제를 제출하기 전에 답을 다시 확인했어요.", question: "민지는 발표 파일을 보내기 전, 첨부 파일과 받는 사람을 한 번 더 확인했어요.", choices: ["돌다리도 두들겨 보고 건너라", "가는 말이 고와야 오는 말이 곱다", "티끌 모아 태산"], answer: 0 },
    { proverb: "티끌 모아 태산", meaning: "아주 작은 것도 계속 모이면 큰 것이 된다는 뜻입니다.", example: "매일 새 단어를 다섯 개씩 익히면 어휘력이 자라요.", question: "지후는 매일 10분씩 책을 읽어 한 달에 책 한 권을 끝냈어요.", choices: ["원숭이도 나무에서 떨어진다", "티끌 모아 태산", "낮말은 새가 듣고 밤말은 쥐가 듣는다"], answer: 1 },
    { proverb: "가는 말이 고와야 오는 말이 곱다", meaning: "남에게 좋은 말을 해야 나도 좋은 말을 듣는다는 뜻입니다.", example: "친구에게 먼저 친절하게 말했더니 친구도 웃으며 답했어요.", question: "서로 기분 좋게 말하는 반을 만들자는 상황에 알맞은 속담은 무엇일까요?", choices: ["소 잃고 외양간 고친다", "가는 말이 고와야 오는 말이 곱다", "금강산도 식후경"], answer: 1 }
  ],
  en: [
    { proverb: "Practice makes perfect.", meaning: "연습을 계속하면 실력이 좋아진다는 뜻입니다.", example: "She practiced the piano every day and played the song smoothly.", question: "준은 매일 영어 발음을 연습해서 어려운 문장을 자신 있게 읽게 되었어요.", choices: ["Practice makes perfect.", "The early bird catches the worm.", "Two heads are better than one."], answer: 0 },
    { proverb: "The early bird catches the worm.", meaning: "부지런하고 일찍 준비하는 사람이 좋은 기회를 얻는다는 뜻입니다.", example: "He started his project early and had time to improve it.", question: "수아는 시험 공부를 미리 시작해 모르는 문제를 선생님께 물어볼 시간도 얻었어요.", choices: ["Where there is a will, there is a way.", "The early bird catches the worm.", "Practice makes perfect."], answer: 1 },
    { proverb: "Two heads are better than one.", meaning: "두 사람이 함께 생각하면 한 사람보다 더 좋은 해결책을 찾을 수 있다는 뜻입니다.", example: "The team shared ideas and solved the puzzle together.", question: "어려운 과제를 친구와 역할을 나누어 해결했더니 더 좋은 방법이 떠올랐어요.", choices: ["Two heads are better than one.", "Actions speak louder than words.", "Every cloud has a silver lining."], answer: 0 }
  ]
};

let language = "ko";
let index = 0;
let mode = "study";
let correct = 0;
let attempts = 0;
const $ = (id) => document.getElementById(id);
const backgroundMusic = $("backgroundMusic");
const musicToggle = $("musicToggle");
backgroundMusic.volume = 0.28;

function updateMusicButton(playing) {
  musicToggle.textContent = playing ? "♫ 음악 끄기" : "♫ 음악 켜기";
  musicToggle.setAttribute("aria-pressed", String(playing));
  musicToggle.setAttribute("aria-label", playing ? "배경음악 끄기" : "배경음악 켜기");
}

async function startMusic() {
  try {
    await backgroundMusic.play();
    updateMusicButton(true);
  } catch {
    updateMusicButton(false);
  }
}

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) await startMusic();
  else {
    backgroundMusic.pause();
    updateMusicButton(false);
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#musicToggle") && backgroundMusic.paused) startMusic();
}, { once: true });

function updateNavigationLocale() {
  const english = language === "en";
  document.querySelector('[data-mode="study"]').textContent = english ? "Study" : "속담 공부";
  document.querySelector('[data-mode="quiz"]').textContent = english ? "Quiz" : "문제 풀기";
  document.querySelector('[data-language="ko"]').textContent = english ? "Korean Proverbs" : "한국 속담";
  document.querySelector('[data-language="en"]').textContent = english ? "English Proverbs" : "영어 속담";
}

function renderStudy() {
  const item = decks[language][index];
  $("label").textContent = language === "ko"
    ? `한국 속담 ${index + 1} / ${decks.ko.length}`
    : `English proverb ${index + 1} / ${decks.en.length}`;
  $("proverb").textContent = item.proverb;
  $("meaning").textContent = item.meaning;
  $("example").textContent = `예: ${item.example}`;
}

function renderQuiz() {
  const item = decks[language][index];
  const englishQuiz = language === "en";
  $("quizKicker").textContent = englishQuiz ? "QUICK QUIZ" : "확인 퀴즈";
  $("quiz-title").textContent = englishQuiz
    ? "Which proverb best fits this situation?"
    : "이 상황에 알맞은 속담은?";
  $("reviewAnswer").textContent = englishQuiz
    ? "Study this proverb again"
    : "이 속담 다시 공부하기";
  $("nextQuestion").textContent = englishQuiz ? "Next question" : "다음 문제";
  $("score").textContent = englishQuiz
    ? `Correct ${correct} / ${attempts}`
    : `정답 ${correct} / ${attempts}`;
  $("question").textContent = item.question;
  $("feedback").textContent = "";
  $("reviewAnswer").hidden = true;
  $("nextQuestion").disabled = true;
  $("choices").replaceChildren(...item.choices.map((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice;
    button.addEventListener("click", () => answer(choiceIndex, button));
    return button;
  }));
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
  const item = decks[language][index];
  const buttons = [...$("choices").querySelectorAll("button")];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === item.answer) button.classList.add("correct");
  });
  attempts += 1;
  if (choiceIndex === item.answer) {
    correct += 1;
    $("feedback").textContent = language === "en"
      ? "Correct! You matched the proverb to the situation."
      : "정답! 뜻과 상황을 잘 연결했어요.";
  } else {
    selectedButton.classList.add("wrong");
    $("feedback").textContent = language === "en"
      ? `The correct answer is “${item.proverb}”`
      : `정답은 “${item.proverb}”입니다.`;
    $("reviewAnswer").hidden = false;
  }
  $("nextQuestion").disabled = false;
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
    index = 0;
    document.querySelectorAll(".language-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    updateNavigationLocale();
    mode === "study" ? renderStudy() : renderQuiz();
  });
});
$("next").addEventListener("click", () => {
  index = (index + 1) % decks[language].length;
  renderStudy();
});
$("previous").addEventListener("click", () => {
  index = (index - 1 + decks[language].length) % decks[language].length;
  renderStudy();
});
$("nextQuestion").addEventListener("click", () => {
  index = (index + 1) % decks[language].length;
  renderQuiz();
});
$("reviewAnswer").addEventListener("click", () => setMode("study"));

updateNavigationLocale();
renderStudy();
