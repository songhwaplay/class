"use client";

import { useEffect, useMemo, useState } from "react";

type CountingSet = {
  seed: number;
  counts: number[];
  countSymbols: string[];
  drawSymbols: string[];
};

type Answers = {
  numbers: string[];
  words: string[];
  drawings: number[];
};

type PrintMode = "worksheet" | "answers" | "both";

const INITIAL_SEED = 20260720;
const NUMBER_WORDS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];

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

function shuffle<T>(values: T[], next: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(next() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createCountingSet(seed: number): CountingSet {
  const next = random(seed);
  return {
    seed,
    counts: shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], next),
    countSymbols: shuffle(["☆", "♡", "♧"], next),
    drawSymbols: shuffle(["○", "△", "□"], next),
  };
}

function emptyAnswers(): Answers {
  return {
    numbers: ["", "", ""],
    words: ["", "", ""],
    drawings: [0, 0, 0],
  };
}

function Symbols({ symbol, count }: { symbol: string; count: number }) {
  return (
    <span className="counting-symbols" aria-label={`${symbol} ${count}개`}>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} aria-hidden="true">{symbol}</span>
      ))}
    </span>
  );
}

function ResultMark({ value }: { value?: boolean }) {
  if (value === undefined) return null;
  return (
    <span className={`counting-result ${value ? "correct" : "wrong"}`} role="status">
      {value ? "맞음" : "틀림"}
    </span>
  );
}

export default function CountingOnePage() {
  const [questionSet, setQuestionSet] = useState(() => createCountingSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    function fitA4Sheet() {
      const availableWidth = window.innerWidth - 16;
      setSheetScale(Math.min(availableWidth / 794, 1));
    }

    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const completed = useMemo(
    () =>
      answers.numbers.filter(Boolean).length +
      answers.words.filter(Boolean).length +
      answers.drawings.filter((count) => count > 0).length,
    [answers],
  );
  const correct = Object.values(results).filter(Boolean).length;

  function clearResult(questionNumber: number) {
    setResults((current) => {
      if (!(questionNumber in current)) return current;
      const next = { ...current };
      delete next[questionNumber];
      return next;
    });
  }

  function updateNumber(index: number, value: string) {
    setAnswers((current) => ({
      ...current,
      numbers: current.numbers.map((answer, answerIndex) => answerIndex === index ? value : answer),
    }));
    clearResult(index + 1);
  }

  function updateWord(index: number, value: string) {
    setAnswers((current) => ({
      ...current,
      words: current.words.map((answer, answerIndex) => answerIndex === index ? value : answer),
    }));
    clearResult(index + 4);
  }

  function updateDrawing(index: number, amount: number) {
    setAnswers((current) => ({
      ...current,
      drawings: current.drawings.map((count, answerIndex) =>
        answerIndex === index ? Math.max(0, Math.min(9, count + amount)) : count,
      ),
    }));
    clearResult(index + 7);
  }

  function checkAll() {
    const nextResults: Record<number, boolean> = {};
    for (let index = 0; index < 3; index += 1) {
      nextResults[index + 1] = Number(answers.numbers[index]) === questionSet.counts[index];
      nextResults[index + 4] = answers.words[index].replace(/\s/g, "") === NUMBER_WORDS[questionSet.counts[index + 3]];
      nextResults[index + 7] = answers.drawings[index] === questionSet.counts[index + 6];
    }
    setResults(nextResults);
  }

  function resetAnswers() {
    setAnswers(emptyAnswers());
    setResults({});
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    setQuestionSet(createCountingSet(seed));
    resetAnswers();
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title">
            <span>1학년</span>
            <strong>수 세기①{answerSheet ? " 정답" : ""}</strong>
          </div>
          <div className="counting-sheet-info">
            <span>이름 <i /></span>
            <span>날짜 <i /></span>
            <small>문제지 {questionSet.seed}</small>
          </div>
        </header>

        <div className="counting-sheet-body">
          <div className="counting-top-grid">
            <section className="counting-section coral">
              <h2>몇 개인지 숫자로 쓰세요.</h2>
              <div className="counting-question-list">
                {questionSet.counts.slice(0, 3).map((count, index) => (
                  <article
                    className={`counting-question${results[index + 1] === true ? " is-correct" : results[index + 1] === false ? " is-wrong" : ""}`}
                    key={`number-${index}`}
                  >
                    <span className="counting-question-number">{index + 1}</span>
                    <Symbols symbol={questionSet.countSymbols[index]} count={count} />
                    <span className="counting-arrow" aria-hidden="true">→</span>
                    {answerSheet ? (
                      <strong className="counting-static-answer">{count}</strong>
                    ) : (
                      <input
                        className="counting-answer-input numeric"
                        inputMode="numeric"
                        maxLength={1}
                        value={answers.numbers[index]}
                        onChange={(event) => updateNumber(index, event.target.value.replace(/[^1-9]/g, ""))}
                        aria-label={`${index + 1}번 답`}
                      />
                    )}
                    <span>개</span>
                    {!answerSheet && <ResultMark value={results[index + 1]} />}
                  </article>
                ))}
              </div>
            </section>

            <section className="counting-section teal">
              <h2>몇 개인지 한글로 쓰세요.</h2>
              <div className="counting-question-list">
                {questionSet.counts.slice(3, 6).map((count, index) => (
                  <article
                    className={`counting-question${results[index + 4] === true ? " is-correct" : results[index + 4] === false ? " is-wrong" : ""}`}
                    key={`word-${index}`}
                  >
                    <span className="counting-question-number">{index + 4}</span>
                    <Symbols symbol={questionSet.countSymbols[index]} count={count} />
                    <span className="counting-arrow" aria-hidden="true">→</span>
                    {answerSheet ? (
                      <strong className="counting-static-answer word">{NUMBER_WORDS[count]}</strong>
                    ) : (
                      <input
                        className="counting-answer-input word"
                        maxLength={3}
                        value={answers.words[index]}
                        onChange={(event) => updateWord(index, event.target.value)}
                        aria-label={`${index + 4}번 답`}
                      />
                    )}
                    <span>개</span>
                    {!answerSheet && <ResultMark value={results[index + 4]} />}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="counting-section drawing-section">
            <h2>주어진 수만큼 그리세요.</h2>
            <div className="drawing-question-list">
              {questionSet.counts.slice(6, 9).map((count, index) => (
                <article
                  className={`drawing-question${results[index + 7] === true ? " is-correct" : results[index + 7] === false ? " is-wrong" : ""}`}
                  key={`drawing-${index}`}
                >
                  <div className="drawing-prompt">
                    <span className="counting-question-number">{index + 7}</span>
                    <strong>{questionSet.drawSymbols[index]}</strong>
                    <span>{index === 1 ? `${NUMBER_WORDS[count]} 개` : `${count}개`}</span>
                    <span className="counting-arrow" aria-hidden="true">→</span>
                  </div>
                  <div className="drawing-answer">
                    <Symbols
                      symbol={questionSet.drawSymbols[index]}
                      count={answerSheet ? count : answers.drawings[index]}
                    />
                    {!answerSheet && (
                      <div className="drawing-controls" aria-label={`${index + 7}번 개수 조절`}>
                        <button type="button" onClick={() => updateDrawing(index, -1)} aria-label="한 개 빼기">−</button>
                        <button type="button" onClick={() => updateDrawing(index, 1)} aria-label="한 개 더하기">＋</button>
                      </div>
                    )}
                  </div>
                  {!answerSheet && <ResultMark value={results[index + 7]} />}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress">
          <strong>{correct}<small>/9 정답</small></strong>
        </div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={newSet}>새 문제</button>
          <button className="button ghost" type="button" onClick={resetAnswers}>다시 쓰기</button>
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

      <div
        className="a4-stage counting-a4-stage worksheet-stage"
        style={{ width: 794 * sheetScale, height: 1123 * sheetScale }}
        aria-label="A4 수 세기 문제지"
      >
        {renderSheet(false)}
      </div>
      <div
        className="a4-stage counting-a4-stage answer-stage"
        style={{ width: 794 * sheetScale, height: 1123 * sheetScale }}
        aria-label="A4 수 세기 전체 답지"
      >
        {renderSheet(true)}
      </div>
    </main>
  );
}
