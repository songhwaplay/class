"use client";

import { useEffect, useMemo, useState } from "react";

type Person = "지혜" | "슬기" | "용기";
type Counts = Record<Person, number>;
type PrintMode = "worksheet" | "answers" | "both";
type ProblemSet = {
  seed: number;
  initial: Counts;
  first: { toSeulgi: number; toCourage: number; after: Counts };
  second: { toCourage: number; fromWisdom: number; after: Counts };
  third: { fromWisdom: number; toSeulgi: number; after: Counts; asked: Person };
};

const INITIAL_SEED = 20260720;
const PEOPLE: Person[] = ["지혜", "슬기", "용기"];

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

function createProblemSet(seed: number): ProblemSet {
  const next = random(seed);
  const wisdom = integer(next, 7, 9);
  const initial: Counts = {
    지혜: wisdom,
    슬기: wisdom - integer(next, 3, 5),
    용기: integer(next, 1, 3),
  };

  const firstToSeulgi = integer(next, 1, 2);
  const firstToCourage = 1;
  const firstAfter: Counts = {
    지혜: initial.지혜 - firstToSeulgi - firstToCourage,
    슬기: initial.슬기 + firstToSeulgi,
    용기: initial.용기 + firstToCourage,
  };

  const secondToCourage = integer(next, 1, 2);
  const secondFromWisdom = integer(next, 1, 2);
  const secondAfter: Counts = {
    지혜: firstAfter.지혜 - secondFromWisdom,
    슬기: firstAfter.슬기 - secondToCourage + secondFromWisdom,
    용기: firstAfter.용기 + secondToCourage,
  };

  const thirdFromWisdom = integer(next, 1, 2);
  const thirdToSeulgi = integer(next, 1, 3);
  const thirdAfter: Counts = {
    지혜: secondAfter.지혜 - thirdFromWisdom,
    슬기: secondAfter.슬기 + thirdToSeulgi,
    용기: secondAfter.용기 + thirdFromWisdom - thirdToSeulgi,
  };

  return {
    seed,
    initial,
    first: { toSeulgi: firstToSeulgi, toCourage: firstToCourage, after: firstAfter },
    second: { toCourage: secondToCourage, fromWisdom: secondFromWisdom, after: secondAfter },
    third: {
      fromWisdom: thirdFromWisdom,
      toSeulgi: thirdToSeulgi,
      after: thirdAfter,
      asked: PEOPLE[integer(next, 0, 2)],
    },
  };
}

function fieldId(question: number, person?: Person) {
  return person ? `q${question}-${person}` : `q${question}`;
}

function emptyAnswers() {
  return Object.fromEntries([
    ...PEOPLE.map((person) => fieldId(1, person)),
    ...PEOPLE.map((person) => fieldId(2, person)),
    fieldId(3),
  ].map((id) => [id, ""]));
}

function ResultMark({ value }: { value?: boolean }) {
  if (value === undefined) return null;
  return <span className={`counting-result ${value ? "correct" : "wrong"}`} role="status">{value ? "맞음" : "틀림"}</span>;
}

export default function GiveAndTakeOnePage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, string>>(emptyAnswers);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 16) / 794, (window.innerHeight - 68) / 1123, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const completed = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);
  const correct = Object.values(results).filter(Boolean).length;

  function updateAnswer(question: number, id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 2) }));
    setResults((current) => {
      if (!(question in current)) return current;
      const next = { ...current };
      delete next[question];
      return next;
    });
  }

  function checkAll() {
    setResults({
      1: PEOPLE.every((person) => Number(answers[fieldId(1, person)]) === questionSet.first.after[person]),
      2: PEOPLE.every((person) => Number(answers[fieldId(2, person)]) === questionSet.second.after[person]),
      3: Number(answers[fieldId(3)]) === questionSet.third.after[questionSet.third.asked],
    });
  }

  function resetAnswers() {
    setAnswers(emptyAnswers());
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

  function answerBox(question: number, person: Person | undefined, answer: number, answerSheet: boolean) {
    const id = fieldId(question, person);
    return answerSheet ? (
      <strong className="give-static-answer">{answer}</strong>
    ) : (
      <input
        className="give-answer-input"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={answers[id]}
        onChange={(event) => updateAnswer(question, id, event.target.value)}
        aria-label={`${question}번${person ? ` ${person}` : ""} 답`}
      />
    );
  }

  function peopleAnswers(question: number, counts: Counts, answerSheet: boolean) {
    return (
      <div className="give-people-answers">
        {PEOPLE.map((person) => (
          <label key={person}>
            <span>{person}</span>
            {answerBox(question, person, counts[person], answerSheet)}
            <small>장</small>
          </label>
        ))}
      </div>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet give-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>1학년</span>
            <strong>주고받기{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>

        <div className="give-sheet-body">
          <section className="give-intro">
            <h2>글을 읽고 물음에 답하시오. [1~3번]</h2>
            <p>
              지혜, 슬기, 용기는 카드 놀이를 하려고 합니다. 카드를 지혜는 <strong>{questionSet.initial.지혜}장</strong>,
              슬기는 <strong>{questionSet.initial.슬기}장</strong>, 용기는 <strong>{questionSet.initial.용기}장</strong> 가지고 있습니다.
            </p>
          </section>

          <section className={`give-question${results[1] === true ? " is-correct" : results[1] === false ? " is-wrong" : ""}`} data-testid="give-question">
            <span className="give-question-number">1</span>
            <p>첫 번째 놀이에서 지혜는 슬기에게 카드 <strong>{questionSet.first.toSeulgi}장</strong>을 주고, 용기에게 카드 <strong>{questionSet.first.toCourage}장</strong>을 주었습니다.</p>
            <h3>세 사람이 가지고 있는 카드는 각각 몇 장입니까?</h3>
            {peopleAnswers(1, questionSet.first.after, answerSheet)}
            {!answerSheet && <ResultMark value={results[1]} />}
          </section>

          <section className={`give-question${results[2] === true ? " is-correct" : results[2] === false ? " is-wrong" : ""}`} data-testid="give-question">
            <span className="give-question-number">2</span>
            <p>두 번째 놀이에서 슬기는 용기에게 카드 <strong>{questionSet.second.toCourage}장</strong>을 주고, 지혜에게 카드 <strong>{questionSet.second.fromWisdom}장</strong>을 받았습니다.</p>
            <h3>세 사람이 가지고 있는 카드는 각각 몇 장입니까?</h3>
            {peopleAnswers(2, questionSet.second.after, answerSheet)}
            {!answerSheet && <ResultMark value={results[2]} />}
          </section>

          <section className={`give-question${results[3] === true ? " is-correct" : results[3] === false ? " is-wrong" : ""}`} data-testid="give-question">
            <span className="give-question-number">3</span>
            <p>세 번째 놀이에서 용기는 지혜에게 카드 <strong>{questionSet.third.fromWisdom}장</strong>을 받고, 슬기에게 카드 <strong>{questionSet.third.toSeulgi}장</strong>을 주었습니다.</p>
            <h3>{questionSet.third.asked}가 가지고 있는 카드는 몇 장입니까?</h3>
            <div className="give-single-answer">
              {answerBox(3, undefined, questionSet.third.after[questionSet.third.asked], answerSheet)}
              <small>장</small>
            </div>
            {!answerSheet && <ResultMark value={results[3]} />}
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page give-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correct}<small>/3 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
          <div className="print-control">
            <button className="button ghost print-button" type="button" aria-expanded={printMenuOpen} aria-haspopup="menu" onClick={() => setPrintMenuOpen((open) => !open)}>인쇄</button>
            {printMenuOpen && (
              <div className="print-menu" role="menu" aria-label="인쇄 자료 선택">
                <button type="button" role="menuitem" onClick={() => printMaterials("worksheet")}>문제지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("answers")}>답지만 인쇄</button>
                <button type="button" role="menuitem" onClick={() => printMaterials("both")}>문제지+답지 인쇄</button>
              </div>
            )}
          </div>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>

      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 주고받기 문제지">
        {renderSheet(false)}
      </div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 주고받기 전체 답지">
        {renderSheet(true)}
      </div>
    </main>
  );
}
