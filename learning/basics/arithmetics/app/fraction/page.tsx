"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  createQuestionSet,
  type FractionQuestion,
  type FractionQuestionSet,
} from "../fraction-engine";
import { moveBetweenFractionAnswerInputs } from "../components/fraction-answer-navigation";

type Answer = {
  whole?: string;
  numerator: string;
  denominator: string;
};

type GradeResult = {
  correct: boolean;
  code: string;
  message: string;
};

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260720;

function emptyAnswers(set: FractionQuestionSet) {
  return Object.fromEntries(
    set.questions.map((question) => [
      question.id,
      { whole: "", numerator: "", denominator: "" } satisfies Answer,
    ]),
  );
}

function isInteger(value: string) {
  return /^\d+$/.test(value.trim());
}

function grade(question: FractionQuestion, answer: Answer): GradeResult {
  const fields =
    question.type === "improper-to-mixed"
      ? [answer.whole ?? "", answer.numerator, answer.denominator]
      : [answer.numerator, answer.denominator];

  if (fields.some((value) => value.trim() === "")) {
    return {
      correct: false,
      code: "EMPTY",
      message:
        question.type === "improper-to-mixed"
          ? "자연수, 분자, 분모를 모두 입력하세요."
          : "분자와 분모를 모두 입력하세요.",
    };
  }

  if (fields.some((value) => !isInteger(value))) {
    return {
      correct: false,
      code: "NOT_INTEGER",
      message: "0 이상의 정수만 입력하세요.",
    };
  }

  const numerator = Number(answer.numerator);
  const denominator = Number(answer.denominator);

  if (denominator === 0) {
    return {
      correct: false,
      code: "DENOMINATOR_ZERO",
      message: "분모는 0이 될 수 없어요.",
    };
  }

  if (question.type === "mixed-to-improper") {
    const exact =
      numerator === question.expected.numerator &&
      denominator === question.expected.denominator;

    if (exact) {
      return {
        correct: true,
        code: "CORRECT",
        message: "정확해요! 자연수에 분모를 곱하고 분자를 더했어요.",
      };
    }

    const isEquivalent =
      numerator * question.expected.denominator ===
      question.expected.numerator * denominator;

    if (isEquivalent && denominator !== question.expected.denominator) {
      return {
        correct: false,
        code: "DENOMINATOR_CHANGED",
        message: "값은 같지만, 변환할 때 분모는 그대로 써야 해요.",
      };
    }

    if (
      denominator === question.expected.denominator &&
      numerator === question.prompt.whole + question.prompt.numerator
    ) {
      return {
        correct: false,
        code: "WHOLE_NOT_MULTIPLIED",
        message: "자연수에 분모를 먼저 곱한 뒤 분자를 더해 보세요.",
      };
    }

    return {
      correct: false,
      code: "INCORRECT",
      message: "자연수 × 분모 + 분자로 새 분자를 계산해 보세요.",
    };
  }

  const whole = Number(answer.whole);
  const exact =
    whole === question.expected.whole &&
    numerator === question.expected.numerator &&
    denominator === question.expected.denominator;

  if (exact) {
    return {
      correct: true,
      code: "CORRECT",
      message: "정확해요! 몫과 나머지를 바르게 찾았어요.",
    };
  }

  if (denominator !== question.expected.denominator) {
    return {
      correct: false,
      code: "DENOMINATOR_CHANGED",
      message: "나눈 뒤에도 분모는 그대로예요.",
    };
  }

  if (numerator >= denominator) {
    return {
      correct: false,
      code: "IMPROPER_REMAINDER",
      message: "대분수의 분수 부분은 분자가 분모보다 작아야 해요.",
    };
  }

  if (whole !== question.expected.whole) {
    return {
      correct: false,
      code: "QUOTIENT_ERROR",
      message: "가분수의 분자를 분모로 나눈 몫을 확인해 보세요.",
    };
  }

  if (numerator !== question.expected.numerator) {
    return {
      correct: false,
      code: "REMAINDER_ERROR",
      message: "나눗셈의 나머지가 대분수의 새 분자가 됩니다.",
    };
  }

  return {
    correct: false,
    code: "INCORRECT",
    message: "몫, 나머지, 분모를 차례로 다시 확인해 보세요.",
  };
}

function Fraction({
  numerator,
  denominator,
  label,
  variant = "display",
}: {
  numerator: ReactNode;
  denominator: ReactNode;
  label?: string;
  variant?: "display" | "input";
}) {
  return (
    <span
      className={`fraction fraction-${variant}`}
      aria-label={label ?? `${denominator}분의 ${numerator}`}
    >
      {variant === "input" ? (
        <>
          <span className="fraction-number fraction-denominator">{denominator}</span>
          <span className="fraction-line" aria-hidden="true" />
          <span className="fraction-number fraction-numerator">{numerator}</span>
        </>
      ) : (
        <>
          <span className="fraction-number">{numerator}</span>
          <span className="fraction-line" aria-hidden="true" />
          <span className="fraction-number">{denominator}</span>
        </>
      )}
    </span>
  );
}

function NumberInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      className="number-input"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))}
      data-fraction-answer-input="true"
      onKeyDown={moveBetweenFractionAnswerInputs}
      aria-label={label}
      autoComplete="off"
    />
  );
}

function AnswerInput({
  question,
  answer,
  onChange,
}: {
  question: FractionQuestion;
  answer: Answer;
  onChange: (next: Answer) => void;
}) {
  if (question.type === "mixed-to-improper") {
    return (
      <Fraction
        variant="input"
        numerator={
          <NumberInput
            value={answer.numerator}
            onChange={(numerator) => onChange({ ...answer, numerator })}
            label={`${question.number}번 답의 분자`}
          />
        }
        denominator={
          <NumberInput
            value={answer.denominator}
            onChange={(denominator) => onChange({ ...answer, denominator })}
            label={`${question.number}번 답의 분모`}
          />
        }
        label={`${question.number}번 가분수 답 입력`}
      />
    );
  }

  return (
    <span className="mixed-answer" aria-label={`${question.number}번 대분수 답 입력`}>
      <NumberInput
        value={answer.whole ?? ""}
        onChange={(whole) => onChange({ ...answer, whole })}
        label={`${question.number}번 답의 자연수`}
      />
      <Fraction
        variant="input"
        numerator={
          <NumberInput
            value={answer.numerator}
            onChange={(numerator) => onChange({ ...answer, numerator })}
            label={`${question.number}번 답의 분자`}
          />
        }
        denominator={
          <NumberInput
            value={answer.denominator}
            onChange={(denominator) => onChange({ ...answer, denominator })}
            label={`${question.number}번 답의 분모`}
          />
        }
        label={`${question.number}번 답의 분수 부분`}
      />
    </span>
  );
}

function ProblemPrompt({ question }: { question: FractionQuestion }) {
  if (question.type === "mixed-to-improper") {
    return (
      <span className="mixed-number" aria-label={`${question.prompt.whole}와 ${question.prompt.denominator}분의 ${question.prompt.numerator}`}>
        <strong>{question.prompt.whole}</strong>
        <Fraction
          numerator={question.prompt.numerator}
          denominator={question.prompt.denominator}
        />
      </span>
    );
  }

  return (
    <Fraction
      numerator={question.prompt.numerator}
      denominator={question.prompt.denominator}
    />
  );
}

function CorrectAnswer({ question }: { question: FractionQuestion }) {
  if (question.type === "mixed-to-improper") {
    return (
      <Fraction
        numerator={question.expected.numerator}
        denominator={question.expected.denominator}
        label={`${question.number}번 정답, ${question.expected.denominator}분의 ${question.expected.numerator}`}
      />
    );
  }

  return (
    <span
      className="mixed-answer"
      aria-label={`${question.number}번 정답, ${question.expected.whole}와 ${question.expected.denominator}분의 ${question.expected.numerator}`}
    >
      <strong>{question.expected.whole}</strong>
      <Fraction
        numerator={question.expected.numerator}
        denominator={question.expected.denominator}
      />
    </span>
  );
}

function AnswerCard({ question }: { question: FractionQuestion }) {
  return (
    <article className="question-card answer-card" data-testid="answer-card">
      <div className="question-row">
        <span className="question-number">{question.number}</span>
        <ProblemPrompt question={question} />
        <span className="equals" aria-hidden="true">=</span>
        <CorrectAnswer question={question} />
      </div>
    </article>
  );
}

function QuestionCard({
  question,
  answer,
  result,
  onAnswer,
  onCheck,
}: {
  question: FractionQuestion;
  answer: Answer;
  result?: GradeResult;
  onAnswer: (next: Answer) => void;
  onCheck: () => void;
}) {
  return (
    <article
      className={`question-card ${result ? (result.correct ? "is-correct" : "is-wrong") : ""}`}
      data-testid="question-card"
    >
      <div className="question-row">
        <span className="question-number">{question.number}</span>
        <ProblemPrompt question={question} />
        <span className="equals" aria-hidden="true">=</span>
        <AnswerInput question={question} answer={answer} onChange={onAnswer} />
        <button className="check-button" type="button" onClick={onCheck}>
          확인
        </button>
      </div>

      {result && (
        <div className={`feedback ${result.correct ? "correct" : "wrong"}`} role="status">
          <span className="feedback-icon" aria-hidden="true">{result.correct ? "✓" : "×"}</span>
          <span>{result.correct ? "맞음" : "틀림"}</span>
        </div>
      )}
    </article>
  );
}

export default function Home() {
  const [questionSet, setQuestionSet] = useState(() => createQuestionSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => emptyAnswers(questionSet));
  const [results, setResults] = useState<Record<string, GradeResult>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      const availableWidth = window.innerWidth - 16;
      const availableHeight = window.innerHeight - 68;
      setSheetScale(Math.min(availableWidth / 794, availableHeight / 1123, 1));
    }

    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const leftQuestions = useMemo(
    () => questionSet.questions.filter((question) => question.type === "mixed-to-improper"),
    [questionSet],
  );
  const rightQuestions = useMemo(
    () => questionSet.questions.filter((question) => question.type === "improper-to-mixed"),
    [questionSet],
  );

  const attempted = Object.keys(results).length;
  const correct = Object.values(results).filter((result) => result.correct).length;
  const filled = Object.values(answers).filter((answer) =>
    [answer.whole, answer.numerator, answer.denominator].some(Boolean),
  ).length;

  function updateAnswer(id: string, next: Answer) {
    setAnswers((current) => ({ ...current, [id]: next }));
    if (results[id]) {
      setResults((current) => {
        const nextResults = { ...current };
        delete nextResults[id];
        return nextResults;
      });
    }
  }

  function checkQuestion(question: FractionQuestion) {
    setResults((current) => ({
      ...current,
      [question.id]: grade(question, answers[question.id]),
    }));
  }

  function checkAll() {
    setResults(
      Object.fromEntries(
        questionSet.questions.map((question) => [
          question.id,
          grade(question, answers[question.id]),
        ]),
      ),
    );
    document.getElementById("progress-summary")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function resetAnswers() {
    setAnswers(emptyAnswers(questionSet));
    setResults({});
  }

  function newSet() {
    const hasWork = filled > 0;
    if (hasWork && !window.confirm("입력한 답이 사라집니다. 새 문제를 만들까요?")) return;
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const nextSet = createQuestionSet(seed);
    setQuestionSet(nextSet);
    setAnswers(emptyAnswers(nextSet));
    setResults({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;

    const clearPrintMode = () => {
      delete document.documentElement.dataset.printMode;
    };

    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderSection(
    title: string,
    questions: FractionQuestion[],
    tone: "coral" | "teal",
  ) {
    return (
      <section className={`problem-section ${tone}`} aria-labelledby={`${tone}-title`}>
        <header className="section-header">
          <div>
            <h2 id={`${tone}-title`}>{title}</h2>
          </div>
          <span className="section-count">8문제</span>
        </header>
        <div className="question-list">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id]}
              result={results[question.id]}
              onAnswer={(next) => updateAnswer(question.id, next)}
              onCheck={() => checkQuestion(question)}
            />
          ))}
        </div>
      </section>
    );
  }

  function renderAnswerSection(
    title: string,
    questions: FractionQuestion[],
    tone: "coral" | "teal",
  ) {
    return (
      <section className={`problem-section ${tone}`} aria-labelledby={`${tone}-answer-title`}>
        <header className="section-header">
          <div>
            <h2 id={`${tone}-answer-title`}>{title}</h2>
          </div>
          <span className="section-count">8문제</span>
        </header>
        <div className="question-list">
          {questions.map((question) => (
            <AnswerCard key={`answer-${question.id}`} question={question} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <main>
      <div className="screen-toolbar">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="기초연산 홈으로">
          <span className="brand-mark" aria-hidden="true">½</span>
          <span>분수 변환</span>
        </Link>
        <span className="grade-badge">3학년 · 16문제</span>
      </header>

      <section className="control-panel" aria-label="문제지 도구">
        <div className="progress-copy" id="progress-summary">
          <span className="progress-label">현재 진행</span>
          <strong>{correct}<small>/16 정답</small></strong>
          <span>{attempted ? `${attempted}문제 확인함` : "답을 입력하고 확인해 보세요"}</span>
        </div>
        <div className="progress-track" aria-label={`16문제 중 ${correct}문제 정답`}>
          <span style={{ width: `${(correct / 16) * 100}%` }} />
        </div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          <div className="print-control">
            <button
              className="button ghost print-button"
              type="button"
              aria-expanded={printMenuOpen}
              aria-haspopup="menu"
              onClick={() => setPrintMenuOpen((open) => !open)}
            >
              인쇄
            </button>
            {printMenuOpen && (
              <div className="print-menu" role="menu" aria-label="인쇄할 자료 선택">
                <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
              </div>
            )}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
        <div className="set-meta">
          <span>문제지 번호 {questionSet.seed}</span>
          <span>작성 {filled}/16</span>
        </div>
      </section>

      </div>

      <div
        className="a4-stage worksheet-stage"
        style={{ width: 794 * sheetScale, height: 1123 * sheetScale }}
      >
        <section
          className="a4-sheet"
          style={{ transform: `scale(${sheetScale})` }}
          aria-label="A4 분수 변환 문제지"
        >
          <header className="sheet-header">
            <div className="sheet-title">
              <span>3학년</span>
              <strong>대분수와 가분수 변환</strong>
            </div>
            <div className="sheet-info">
              <span>이름 <i aria-hidden="true" /></span>
              <span>날짜 <i aria-hidden="true" /></span>
              <small>문제지 {questionSet.seed}</small>
            </div>
          </header>

          <div className="worksheet-grid">
            {renderSection("대분수를 가분수로", leftQuestions, "coral")}
            {renderSection("가분수를 대분수로", rightQuestions, "teal")}
          </div>
        </section>
      </div>

      <div className="a4-stage answer-stage" aria-hidden="true">
        <section className="a4-sheet answer-sheet" aria-label="A4 분수 변환 전체 답지">
          <header className="sheet-header">
            <div className="sheet-title">
              <span>3학년</span>
              <strong>대분수와 가분수 변환 · 전체 답지</strong>
            </div>
            <div className="sheet-info">
              <span>문제지 <b>{questionSet.seed}</b></span>
            </div>
          </header>

          <div className="worksheet-grid">
            {renderAnswerSection("대분수 → 가분수 정답", leftQuestions, "coral")}
            {renderAnswerSection("가분수 → 대분수 정답", rightQuestions, "teal")}
          </div>
        </section>
      </div>
    </main>
  );
}
