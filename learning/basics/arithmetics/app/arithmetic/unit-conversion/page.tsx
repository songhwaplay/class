"use client";

import { useEffect, useMemo, useState } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type DisplayPart = { value: string; unit: string };
type AnswerPart = DisplayPart & { key: string };
type ConversionProblem = { id: string; left: DisplayPart[]; answer: AnswerPart[] };
type ProblemSet = { seed: number; problems: ConversionProblem[] };
type DecimalValue = { units: number; places: number };

const INITIAL_SEED = 20260721;

const UNIT_EXPONENT: Record<string, number> = {
  km: 6,
  m: 3,
  cm: 1,
  mm: 0,
  kg: 6,
  g: 3,
  mg: 0,
  L: 3,
  mL: 0,
};

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

function integer(next: () => number, minimum: number, maximum: number) {
  return minimum + Math.floor(next() * (maximum - minimum + 1));
}

function choose<T>(next: () => number, values: readonly T[]) {
  return values[integer(next, 0, values.length - 1)];
}

function formatDecimal(units: number, places: number) {
  if (places <= 0) return String(units * 10 ** -places);
  const factor = 10 ** places;
  const whole = Math.floor(units / factor);
  const fraction = String(units % factor).padStart(places, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function converted(value: DecimalValue, sourceUnit: string, targetUnit: string) {
  const shiftedPlaces = value.places - (UNIT_EXPONENT[sourceUnit] - UNIT_EXPONENT[targetUnit]);
  return formatDecimal(value.units, shiftedPlaces);
}

function simpleProblem(index: number, answer: DecimalValue, answerUnit: string, leftUnit: string): ConversionProblem {
  return {
    id: `unit-conversion-${index}`,
    left: [{ value: converted(answer, answerUnit, leftUnit), unit: leftUnit }],
    answer: [{ key: "value", value: formatDecimal(answer.units, answer.places), unit: answerUnit }],
  };
}

function digitOrZero(next: () => number) {
  return integer(next, 0, 1) * integer(next, 1, 9);
}

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const problems: ConversionProblem[] = [];

  // ① mm를 km, m, cm 중 하나로 바꾸어 제시
  problems.push(simpleProblem(0, { units: integer(next, 1, 19), places: 0 }, "mm", choose(next, ["km", "m", "cm"] as const)));

  // ② cm를 m 또는 mm로 바꾸어 제시
  problems.push(simpleProblem(1, { units: integer(next, 1, 99), places: integer(next, 0, 1) }, "cm", choose(next, ["m", "mm"] as const)));

  // ③⑤ m를 km, cm, mm 중 하나로 바꾸어 제시
  problems.push(simpleProblem(2, { units: integer(next, 1, 199), places: integer(next, 0, 2) }, "m", choose(next, ["km", "cm", "mm"] as const)));

  // ④ km를 m, cm, mm 중 하나로 바꾸어 제시
  problems.push(simpleProblem(3, { units: integer(next, 11, 99), places: integer(next, 1, 3) }, "km", choose(next, ["m", "cm", "mm"] as const)));

  problems.push(simpleProblem(4, { units: integer(next, 1, 99), places: integer(next, 0, 2) }, "m", choose(next, ["km", "cm", "mm"] as const)));

  // ⑥ g와 kg/mg 사이의 변환
  problems.push(simpleProblem(5, { units: integer(next, 11, 999), places: integer(next, 0, 2) }, choose(next, ["kg", "mg"] as const), "g"));

  // ⑦ kg와 g/mg 사이의 변환
  const massPlaces = integer(next, 0, 1);
  const massUnits = integer(next, 111, 999) + integer(next, 2, 500) * 10 ** massPlaces;
  problems.push(simpleProblem(6, { units: massUnits, places: massPlaces }, choose(next, ["g", "mg"] as const), "kg"));

  // ⑧ L와 mL 사이의 변환
  const volumeAnswerUnit = choose(next, ["L", "mL"] as const);
  problems.push(simpleProblem(7, { units: integer(next, 11, 1999), places: integer(next, 0, 3) }, volumeAnswerUnit, volumeAnswerUnit === "L" ? "mL" : "L"));

  // ⑨ 소수 km를 km, m, cm, mm로 나누어 쓰기
  const kilometers = integer(next, 0, 3);
  const meters = digitOrZero(next) + digitOrZero(next) * 10 + digitOrZero(next) * 100;
  const centimeters = digitOrZero(next) + digitOrZero(next) * 10;
  const millimeters = digitOrZero(next);
  problems.push({
    id: "unit-conversion-8",
    left: [{ value: formatDecimal(kilometers * 1_000_000 + meters * 1_000 + centimeters * 10 + millimeters, 6), unit: "km" }],
    answer: [
      { key: "km", value: String(kilometers), unit: "km" },
      { key: "m", value: String(meters), unit: "m" },
      { key: "cm", value: String(centimeters), unit: "cm" },
      { key: "mm", value: String(millimeters), unit: "mm" },
    ],
  });

  // ⑩ km와 m를 소수 km로 합쳐 쓰기
  const compositeKilometers = integer(next, 1, 3);
  const compositeMeters = integer(next, 1, 9) + digitOrZero(next) * 10;
  problems.push({
    id: "unit-conversion-9",
    left: [{ value: String(compositeKilometers), unit: "km" }, { value: String(compositeMeters), unit: "m" }],
    answer: [{ key: "km", value: formatDecimal(compositeKilometers * 1000 + compositeMeters, 3), unit: "km" }],
  });

  // ⑪ 소수 m를 m, cm, mm로 나누어 쓰기
  const wholeMeters = integer(next, 10, 11);
  const splitCentimeters = digitOrZero(next) + digitOrZero(next) * 10;
  const splitMillimeters = integer(next, 1, 9);
  problems.push({
    id: "unit-conversion-10",
    left: [{ value: formatDecimal(wholeMeters * 1000 + splitCentimeters * 10 + splitMillimeters, 3), unit: "m" }],
    answer: [
      { key: "m", value: String(wholeMeters), unit: "m" },
      { key: "cm", value: String(splitCentimeters), unit: "cm" },
      { key: "mm", value: String(splitMillimeters), unit: "mm" },
    ],
  });

  // ⑫ m와 cm/mm를 소수 m로 합쳐 쓰기
  const finalMeters = integer(next, 10, 11);
  const finalUnit = choose(next, ["cm", "mm"] as const);
  const finalSmallValue = integer(next, 1, 9);
  const finalMillimeters = finalMeters * 1000 + finalSmallValue * (finalUnit === "cm" ? 10 : 1);
  problems.push({
    id: "unit-conversion-11",
    left: [{ value: String(finalMeters), unit: "m" }, { value: String(finalSmallValue), unit: finalUnit }],
    answer: [{ key: "m", value: formatDecimal(finalMillimeters, 3), unit: "m" }],
  });

  return { seed, problems };
}

function sanitizeDecimal(value: string) {
  const filtered = value.replace(/[^0-9.]/g, "");
  const decimalIndex = filtered.indexOf(".");
  if (decimalIndex === -1) return filtered.slice(0, 10);
  return `${filtered.slice(0, decimalIndex + 1)}${filtered.slice(decimalIndex + 1).replace(/\./g, "")}`.slice(0, 10);
}

function matchesDecimal(value: string | undefined, expected: string) {
  if (!value || !/^\d+(?:\.\d+)?$/.test(value)) return false;
  return Number(value) === Number(expected);
}

export default function UnitConversionPage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
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
  const completed = problems.filter((problem) => problem.answer.some((part) => answers[problem.id]?.[part.key])).length;
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(problemId: string, key: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [problemId]: { ...current[problemId], [key]: sanitizeDecimal(value) },
    }));
    setResults((current) => {
      if (!(problemId in current)) return current;
      const next = { ...current };
      delete next[problemId];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(problems.map((problem) => [
      problem.id,
      problem.answer.every((part) => matchesDecimal(answers[problem.id]?.[part.key], part.value)),
    ])));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
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

  function renderDisplayPart(part: DisplayPart, index: number) {
    return <span className="unit-conversion-value" key={`${part.unit}-${index}`}><strong>{part.value}</strong><small>{part.unit}</small></span>;
  }

  function renderProblem(problem: ConversionProblem, index: number, answerSheet: boolean) {
    const graded = problem.id in results;
    const isCorrect = results[problem.id] === true;
    return (
      <div className={`multiplication-question unit-conversion-question${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="unit-conversion-question" key={problem.id}>
        <span className="unit-conversion-index">{index + 1}</span>
        <div className="unit-conversion-expression">
          <span className="unit-conversion-parts">{problem.left.map(renderDisplayPart)}</span>
          <span className="unit-conversion-equals">=</span>
          <span className={`unit-conversion-parts answer answer-count-${problem.answer.length}`}>
            {problem.answer.map((part) => answerSheet
              ? <span className="unit-conversion-static-answer" key={part.key}><strong>{part.value}</strong><small>{part.unit}</small></span>
              : <label className="unit-conversion-answer" key={part.key}>
                  <input type="text" inputMode="decimal" maxLength={10} value={answers[problem.id]?.[part.key] ?? ""} onChange={(event) => updateAnswer(problem.id, part.key, event.target.value)} aria-label={`${problem.id} ${part.unit} 답`} />
                  <small>{part.unit}</small>
                </label>)}
          </span>
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet unit-conversion-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>4학년</span><strong>단위변환{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="unit-conversion-grid">{problems.map((problem, index) => renderProblem(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page multiplication-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/12 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 단위변환 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 4학년 단위변환 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
