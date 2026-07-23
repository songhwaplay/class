"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type Direction = "to-korean" | "to-number";
type Problem = { id: string; direction: Direction; number: string; reading: string };
type ProblemSet = { seed: number; problems: Problem[] };

const INITIAL_SEED = 20260720;
const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SMALL_UNITS = ["천", "백", "십", ""];
const LARGE_UNITS = ["조", "억", "만", ""];
const FIRST_DIGITS = ["1", "1", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const OTHER_DIGITS = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "1", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const WRITE_LENGTH_GROUPS = [[15, 16], [13, 14], [10, 11, 12], [7, 8, 9]] as const;
const READ_LENGTH_GROUPS = [[15, 16], [13, 14], [10, 11, 12], [7, 8, 9], [5, 6]] as const;

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(values: readonly T[], next: () => number) {
  return values[Math.floor(next() * values.length)];
}

function randomNumber(length: number, next: () => number) {
  let value = pick(FIRST_DIGITS, next);
  for (let index = 1; index < length; index += 1) value += pick(OTHER_DIGITS, next);
  return value;
}

function readFourDigits(value: string) {
  return value.padStart(4, "0").split("").map((character, index) => {
    const digit = Number(character);
    if (digit === 0) return "";
    const digitName = digit === 1 && index < 3 ? "" : DIGITS[digit];
    return `${digitName}${SMALL_UNITS[index]}`;
  }).join("");
}

function koreanNumberReading(number: string) {
  const padded = number.padStart(Math.ceil(number.length / 4) * 4, "0");
  const groupCount = padded.length / 4;
  const parts: string[] = [];
  for (let index = 0; index < groupCount; index += 1) {
    const group = readFourDigits(padded.slice(index * 4, index * 4 + 4));
    if (!group) continue;
    parts.push(`${group}${LARGE_UNITS[4 - groupCount + index]}`);
  }
  return parts.join(" ");
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const writeNumbers = WRITE_LENGTH_GROUPS.map((lengths) => randomNumber(pick(lengths, next), next));
  const specialLength = 9 + Math.floor(next() * 8);
  writeNumbers.push(`${pick(FIRST_DIGITS, next)}${"0".repeat(specialLength - 1)}`);
  const readNumbers = READ_LENGTH_GROUPS.map((lengths) => randomNumber(pick(lengths, next), next));
  const problems = [
    ...writeNumbers.map((number, index): Problem => ({
      id: `grade-four-number-write-${index}`,
      direction: "to-korean",
      number,
      reading: koreanNumberReading(number),
    })),
    ...readNumbers.map((number, index): Problem => ({
      id: `grade-four-number-read-${index}`,
      direction: "to-number",
      number,
      reading: koreanNumberReading(number),
    })),
  ];
  return { seed, problems };
}

function normalizeKorean(value: string) {
  return value.normalize("NFC").replace(/\s+/g, "");
}

function normalizeNumber(value: string) {
  return value.replace(/[\s,]+/g, "");
}

export default function GradeFourNumberReadingPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const problems = useMemo(() => questionSet.problems, [questionSet]);
  const completed = problems.filter((problem) => {
    const value = answers[problem.id] ?? "";
    return problem.direction === "to-korean" ? normalizeKorean(value) : normalizeNumber(value);
  }).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(problem: Problem, value: string) {
    const nextValue = problem.direction === "to-number"
      ? value.replace(/[^0-9,\s]/g, "").slice(0, 20)
      : value.slice(0, 40);
    setAnswers((current) => ({ ...current, [problem.id]: nextValue }));
    setResults((current) => {
      if (!(problem.id in current)) return current;
      const next = { ...current };
      delete next[problem.id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => {
      const value = answers[problem.id] ?? "";
      const isCorrect = problem.direction === "to-korean"
        ? normalizeKorean(value) === normalizeKorean(problem.reading)
        : normalizeNumber(value) === problem.number;
      return [problem.id, isCorrect];
    })));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("답이 사라집니다. 새 문제를 만들까요?")) return;
    setQuestionSet(createProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderProblem(problem: Problem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    const prompt = problem.direction === "to-korean" ? problem.number : problem.reading;
    const answer = problem.direction === "to-korean" ? problem.reading : problem.number;
    return (
      <div className={`multiplication-question large-number-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="large-number-question" key={problem.id}>
        <span className="large-number-index">{index + 1}</span>
        <strong className={`large-number-prompt ${problem.direction}`}>{prompt}</strong>
        <span className="large-number-arrow">→</span>
        {answerSheet ? (
          <strong className={`large-number-static-answer ${problem.direction}`}>{answer}</strong>
        ) : (
          <input
            className={`large-number-input ${problem.direction}`}
            type="text"
            inputMode={problem.direction === "to-number" ? "numeric" : "text"}
            maxLength={problem.direction === "to-number" ? 20 : 40}
            value={answers[problem.id] ?? ""}
            onChange={(event) => updateAnswer(problem, event.target.value)}
            aria-label={`${index + 1}번 답`}
          />
        )}
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet large-number-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>숫자읽기{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="large-number-columns">
          <section className="large-number-column write" aria-label="한자어로 쓰기">
            <h2>한자어로 쓰기</h2>
            {questionSet.problems.slice(0, 5).map((problem, index) => renderProblem(problem, index, answerSheet))}
          </section>
          <section className="large-number-column read" aria-label="숫자로 쓰기">
            <h2>숫자로 쓰기</h2>
            {questionSet.problems.slice(5).map((problem, index) => renderProblem(problem, index + 5, answerSheet))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/10 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 풀기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
              <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
              <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
            </div>}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 숫자읽기 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 숫자읽기 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
