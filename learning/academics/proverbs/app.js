const decks = {
  ko: [
    { proverb: "돌다리도 두들겨 보고 건너라", meaning: "잘 아는 일이라도 실수하지 않도록 다시 확인하라는 뜻입니다.", example: "숙제를 제출하기 전에 답을 다시 확인했어요.", question: "민지는 발표 파일을 보내기 전, 첨부 파일과 받는 사람을 한 번 더 확인했어요.", choices: ["돌다리도 두들겨 보고 건너라", "가는 말이 고와야 오는 말이 곱다", "티끌 모아 태산"], answer: 0 },
    { proverb: "티끌 모아 태산", meaning: "아주 작은 것도 계속 모이면 큰 것이 된다는 뜻입니다.", example: "매일 새 단어를 다섯 개씩 익히면 어휘력이 자라요.", question: "지후는 매일 10분씩 책을 읽어 한 달에 책 한 권을 끝냈어요.", choices: ["원숭이도 나무에서 떨어진다", "티끌 모아 태산", "낮말은 새가 듣고 밤말은 쥐가 듣는다"], answer: 1 },
    { proverb: "가는 말이 고와야 오는 말이 곱다", meaning: "남에게 좋은 말을 해야 나도 좋은 말을 듣는다는 뜻입니다.", example: "친구에게 먼저 친절하게 말했더니 친구도 웃으며 답했어요.", question: "서로 기분 좋게 말하는 반을 만들려면 먼저 상대에게 예의 있게 말해야 해요.", choices: ["소 잃고 외양간 고친다", "가는 말이 고와야 오는 말이 곱다", "금강산도 식후경"], answer: 1 },
    { proverb: "원숭이도 나무에서 떨어진다", meaning: "아무리 능숙한 사람도 때로는 실수할 수 있다는 뜻입니다.", example: "수학을 잘하는 형도 계산을 틀릴 때가 있어요.", question: "늘 받아쓰기를 잘하던 유나가 오늘은 한 문제를 틀렸어요.", choices: ["원숭이도 나무에서 떨어진다", "백지장도 맞들면 낫다", "시작이 반이다"], answer: 0 },
    { proverb: "소 잃고 외양간 고친다", meaning: "일이 잘못된 뒤에야 뒤늦게 손을 써서 소용이 없다는 뜻입니다.", example: "이가 아파진 뒤에야 양치를 열심히 하기 시작했어요.", question: "중요한 자료를 잃어버린 뒤에야 컴퓨터 백업을 시작했어요.", choices: ["등잔 밑이 어둡다", "소 잃고 외양간 고친다", "고래 싸움에 새우 등 터진다"], answer: 1 },
    { proverb: "백지장도 맞들면 낫다", meaning: "쉬운 일도 함께하면 더 쉽다는 뜻입니다.", example: "친구들과 힘을 모아 교실을 금방 정리했어요.", question: "혼자 옮기기 힘든 상자를 친구와 함께 들어 쉽게 옮겼어요.", choices: ["세 살 버릇 여든까지 간다", "금강산도 식후경", "백지장도 맞들면 낫다"], answer: 2 },
    { proverb: "금강산도 식후경", meaning: "아무리 좋은 일도 배가 부르고 난 뒤에야 제대로 즐길 수 있다는 뜻입니다.", example: "구경을 시작하기 전에 먼저 점심을 먹었어요.", question: "놀이공원에 도착한 가족은 배가 고파서 놀이기구보다 먼저 식당에 갔어요.", choices: ["금강산도 식후경", "시작이 반이다", "우물 안 개구리"], answer: 0 },
    { proverb: "낮말은 새가 듣고 밤말은 쥐가 듣는다", meaning: "아무도 듣지 않는 것 같아도 말은 새어 나갈 수 있으니 조심하라는 뜻입니다.", example: "비밀 이야기는 주변을 살피고 신중하게 해야 해요.", question: "복도에서 친구의 비밀을 크게 말하면 다른 사람이 들을 수 있어요.", choices: ["티끌 모아 태산", "낮말은 새가 듣고 밤말은 쥐가 듣는다", "원숭이도 나무에서 떨어진다"], answer: 1 },
    { proverb: "세 살 버릇 여든까지 간다", meaning: "어릴 때 든 버릇은 나이가 들어서도 쉽게 고치기 어렵다는 뜻입니다.", example: "어릴 때부터 정리하는 습관을 들이는 것이 좋아요.", question: "선생님은 어릴 때부터 바른 자세와 인사 습관을 익히라고 하셨어요.", choices: ["세 살 버릇 여든까지 간다", "돌다리도 두들겨 보고 건너라", "고래 싸움에 새우 등 터진다"], answer: 0 },
    { proverb: "등잔 밑이 어둡다", meaning: "가까이에 있는 것을 오히려 알아차리지 못한다는 뜻입니다.", example: "안경을 찾다가 머리 위에 쓴 것을 뒤늦게 알았어요.", question: "책상 위에 둔 연필을 한참 동안 방 안 여기저기에서 찾았어요.", choices: ["시작이 반이다", "등잔 밑이 어둡다", "가는 말이 고와야 오는 말이 곱다"], answer: 1 },
    { proverb: "시작이 반이다", meaning: "어떤 일이든 시작하면 이미 절반은 이룬 것과 같다는 뜻입니다.", example: "어렵게 느껴져도 첫 문장부터 써 보기로 했어요.", question: "민호는 미루던 독후감을 우선 한 줄이라도 써 보기로 했어요.", choices: ["시작이 반이다", "우물 안 개구리", "소 잃고 외양간 고친다"], answer: 0 },
    { proverb: "우물 안 개구리", meaning: "좁은 경험만으로 세상을 다 안다고 생각하는 사람을 이르는 말입니다.", example: "다른 나라의 생활을 알아보니 내가 알던 것이 전부가 아니었어요.", question: "자기 동네에서 본 것만이 세상의 전부라고 믿는 사람에게 알맞은 말은 무엇일까요?", choices: ["백지장도 맞들면 낫다", "우물 안 개구리", "금강산도 식후경"], answer: 1 }
  ],
  en: [
    { proverb: "Practice makes perfect.", meaning: "연습을 계속하면 실력이 좋아진다는 뜻입니다.", example: "She practiced the piano every day and played the song smoothly.", question: "준은 매일 영어 발음을 연습해서 어려운 문장을 자신 있게 읽게 되었어요.", choices: ["Practice makes perfect.", "The early bird catches the worm.", "Two heads are better than one."], answer: 0 },
    { proverb: "The early bird catches the worm.", meaning: "부지런하고 일찍 준비하는 사람이 좋은 기회를 얻는다는 뜻입니다.", example: "He started his project early and had time to improve it.", question: "수아는 시험공부를 미리 시작해 모르는 문제를 질문할 시간도 얻었어요.", choices: ["Where there is a will, there is a way.", "The early bird catches the worm.", "Practice makes perfect."], answer: 1 },
    { proverb: "Two heads are better than one.", meaning: "두 사람이 함께 생각하면 더 좋은 해결책을 찾을 수 있다는 뜻입니다.", example: "The team shared ideas and solved the puzzle together.", question: "어려운 과제를 친구와 함께 의논했더니 더 좋은 방법이 떠올랐어요.", choices: ["Two heads are better than one.", "Actions speak louder than words.", "Every cloud has a silver lining."], answer: 0 },
    { proverb: "Actions speak louder than words.", meaning: "말보다 실제 행동이 더 중요하다는 뜻입니다.", example: "He promised to help and then actually stayed to clean.", question: "도와주겠다는 말만 하기보다 직접 청소를 시작한 친구의 행동이 더 믿음직했어요.", choices: ["Honesty is the best policy.", "Actions speak louder than words.", "Better late than never."], answer: 1 },
    { proverb: "Where there is a will, there is a way.", meaning: "뜻이 있고 노력하면 방법을 찾을 수 있다는 뜻입니다.", example: "She kept trying until she found a solution.", question: "태호는 어려운 로봇 만들기를 포기하지 않고 여러 방법을 시도해 완성했어요.", choices: ["Where there is a will, there is a way.", "Don't judge a book by its cover.", "Easy come, easy go."], answer: 0 },
    { proverb: "Don't judge a book by its cover.", meaning: "겉모습만 보고 사람이나 사물을 판단하지 말라는 뜻입니다.", example: "The plain-looking restaurant served wonderful food.", question: "겉표지가 낡은 책이었지만 읽어 보니 매우 재미있고 유익했어요.", choices: ["Look before you leap.", "Don't judge a book by its cover.", "When in Rome, do as the Romans do."], answer: 1 },
    { proverb: "Better late than never.", meaning: "늦더라도 전혀 하지 않는 것보다 하는 편이 낫다는 뜻입니다.", example: "He apologized a week later, but it was better than staying silent.", question: "기한은 지났지만 지금이라도 사과하고 잘못을 바로잡기로 했어요.", choices: ["Better late than never.", "Practice makes perfect.", "A friend in need is a friend indeed."], answer: 0 },
    { proverb: "Honesty is the best policy.", meaning: "정직하게 행동하는 것이 가장 좋은 방법이라는 뜻입니다.", example: "She admitted her mistake and told the truth.", question: "컵을 깨뜨린 아이는 혼날까 두려웠지만 사실대로 말씀드렸어요.", choices: ["Every cloud has a silver lining.", "Honesty is the best policy.", "The early bird catches the worm."], answer: 1 },
    { proverb: "When in Rome, do as the Romans do.", meaning: "새로운 곳에서는 그곳의 관습과 방식을 존중하라는 뜻입니다.", example: "Visitors followed the local custom at the ceremony.", question: "외국을 방문한 학생들은 그 나라의 식사 예절을 배우고 따랐어요.", choices: ["When in Rome, do as the Romans do.", "Easy come, easy go.", "Two heads are better than one."], answer: 0 },
    { proverb: "Look before you leap.", meaning: "행동하기 전에 결과를 신중히 생각하라는 뜻입니다.", example: "Check the details before you agree to the plan.", question: "현우는 신청 버튼을 누르기 전에 날짜와 준비물을 자세히 확인했어요.", choices: ["Actions speak louder than words.", "Look before you leap.", "Better late than never."], answer: 1 },
    { proverb: "A friend in need is a friend indeed.", meaning: "어려울 때 도와주는 친구가 진정한 친구라는 뜻입니다.", example: "She stayed with me when everyone else had left.", question: "모두 집에 간 뒤에도 친구 한 명은 다친 민재를 끝까지 도와주었어요.", choices: ["A friend in need is a friend indeed.", "Honesty is the best policy.", "Practice makes perfect."], answer: 0 },
    { proverb: "Every cloud has a silver lining.", meaning: "어려운 상황에도 좋은 면이나 희망은 있다는 뜻입니다.", example: "Missing the trip gave her time to rest and recover.", question: "대회는 취소됐지만 그 덕분에 부족한 부분을 더 연습할 시간이 생겼어요.", choices: ["Easy come, easy go.", "Every cloud has a silver lining.", "Don't judge a book by its cover."], answer: 1 }
  ]
};

let language = "ko";
let studyIndex = 0;
let mode = "study";
let quizOrder = [];
let quizPosition = 0;
let correct = 0;
let attempts = 0;
const $ = (id) => document.getElementById(id);

function shuffledIndices(length) {
  const indices = Array.from({ length }, (_, index) => index);
  for (let current = indices.length - 1; current > 0; current -= 1) {
    const swap = Math.floor(Math.random() * (current + 1));
    [indices[current], indices[swap]] = [indices[swap], indices[current]];
  }
  return indices;
}

function resetQuiz() {
  quizOrder = shuffledIndices(decks[language].length);
  quizPosition = 0;
  correct = 0;
  attempts = 0;
  $("nextQuestion").dataset.action = "next";
}

function currentQuizIndex() {
  if (!quizOrder.length) resetQuiz();
  return quizOrder[quizPosition];
}

function updateNavigationLocale() {
  const english = language === "en";
  document.querySelector('[data-mode="study"]').textContent = english ? "Study" : "속담 공부";
  document.querySelector('[data-mode="quiz"]').textContent = english ? "Quiz" : "문제 풀기";
  document.querySelector('[data-language="ko"]').textContent = english ? "Korean Proverbs" : "한국 속담";
  document.querySelector('[data-language="en"]').textContent = english ? "English Proverbs" : "영어 속담";
}

function renderStudy() {
  const item = decks[language][studyIndex];
  $("label").textContent = language === "ko"
    ? `한국 속담 ${studyIndex + 1} / ${decks.ko.length}`
    : `English proverb ${studyIndex + 1} / ${decks.en.length}`;
  $("proverb").textContent = item.proverb;
  $("meaning").textContent = item.meaning;
  $("example").textContent = `예: ${item.example}`;
}

function renderQuiz() {
  const item = decks[language][currentQuizIndex()];
  const english = language === "en";
  $("quizKicker").textContent = english
    ? `QUICK QUIZ · ${quizPosition + 1} / ${quizOrder.length}`
    : `확인 퀴즈 · ${quizPosition + 1} / ${quizOrder.length}`;
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
  $("choices").replaceChildren(...item.choices.map((choice, choiceIndex) => {
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
  $("quizKicker").textContent = english ? "QUIZ COMPLETE" : "문제 풀이 완료";
  $("quiz-title").textContent = english ? "Great work!" : "끝까지 잘 풀었어요!";
  $("question").textContent = english
    ? `You answered ${correct} out of ${attempts} questions correctly.`
    : `총 ${attempts}문제 중 ${correct}문제를 맞혔습니다.`;
  $("choices").replaceChildren();
  $("feedback").textContent = "";
  $("reviewAnswer").hidden = true;
  $("nextQuestion").hidden = false;
  $("nextQuestion").disabled = false;
  $("nextQuestion").dataset.action = "restart";
  $("nextQuestion").textContent = english ? "Restart quiz" : "다시 풀기";
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
  const item = decks[language][currentQuizIndex()];
  const buttons = [...$("choices").querySelectorAll("button")];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === item.answer) button.classList.add("correct");
  });
  attempts += 1;
  if (choiceIndex === item.answer) {
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
  const isLast = quizPosition === quizOrder.length - 1;
  $("nextQuestion").textContent = isLast
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
    studyIndex = 0;
    resetQuiz();
    document.querySelectorAll(".language-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    updateNavigationLocale();
    mode === "study" ? renderStudy() : renderQuiz();
  });
});

$("next").addEventListener("click", () => {
  studyIndex = (studyIndex + 1) % decks[language].length;
  renderStudy();
});

$("previous").addEventListener("click", () => {
  studyIndex = (studyIndex - 1 + decks[language].length) % decks[language].length;
  renderStudy();
});

$("nextQuestion").addEventListener("click", () => {
  if ($("nextQuestion").dataset.action === "restart") {
    resetQuiz();
    renderQuiz();
  } else if (quizPosition === quizOrder.length - 1) {
    renderQuizComplete();
  } else {
    quizPosition += 1;
    renderQuiz();
  }
});

$("reviewAnswer").addEventListener("click", () => {
  studyIndex = currentQuizIndex();
  setMode("study");
});

updateNavigationLocale();
resetQuiz();
renderStudy();
