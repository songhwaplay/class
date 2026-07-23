"use client";

import { useEffect, useMemo, useState } from "react";
import { createNumericChoices } from "../../../../lib/worksheet-choice-utils";
import MathFormula from "../../../components/math-formula";
import WorksheetChoicePanel, { type WorksheetChoiceProblem } from "./worksheet-choice-panel";

export type NumericWorksheetProblem = {
  id: string;
  kind: string;
  label: string;
  prompt: string;
  latex: string;
  answers: number[];
  answerLabels: string[];
};

type ProblemSet = { seed: number; problems: NumericWorksheetProblem[] };

type Props = {
  initialSeed: number;
  subject: string;
  title: string;
  instruction: string;
  createSet: (seed: number) => ProblemSet;
  createReviews: (kinds: string[], seed: number) => NumericWorksheetProblem[];
  formatChoice?: (problem: NumericWorksheetProblem, values: number[]) => string;
  makeChoices?: (problem: NumericWorksheetProblem) => Array<{ id: string; values: number[]; correct: boolean }>;
  showLatexOnWorksheet?: boolean;
  showPromptOnWorksheet?: boolean;
};

function answerLatex(problem: NumericWorksheetProblem, values: number[]) {
  return problem.answerLabels.map((label, index) => {
    const prefix = /^[A-Za-z]/.test(label)
      ? `${label}=`
      : label === "답"
        ? ""
        : `\\text{${label}}\\ `;
    return `${prefix}${values[index]}`;
  }).join(",\\quad ");
}

export default function NumericChoiceWorksheet({ initialSeed, subject, title, instruction, createSet, createReviews, formatChoice = answerLatex, makeChoices, showLatexOnWorksheet = true, showPromptOnWorksheet = true }: Props) {
  const [set, setSet] = useState(() => createSet(initialSeed));
  const [reviews, setReviews] = useState<NumericWorksheetProblem[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [scale, setScale] = useState(0.6);
  const problems = useMemo(() => [...set.problems, ...reviews], [set.problems, reviews]);
  const wrong = set.problems.filter((problem) => results[problem.id] === false);
  const choiceProblems: WorksheetChoiceProblem[] = problems.map((problem) => ({
    id: problem.id,
    label: problem.label,
    correctLatex: formatChoice(problem, problem.answers),
    choices: (makeChoices?.(problem) ?? createNumericChoices(problem.answers, problem.id)).map((choice) => ({
      id: choice.id,
      latex: formatChoice(problem, choice.values),
      correct: choice.correct,
    })),
  }));

  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 32) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function reset() {
    setSelected({});
    setResults({});
    setReviews([]);
  }

  function choose(problemId: string, choiceId: string) {
    setSelected((current) => ({ ...current, [problemId]: choiceId }));
    setResults((current) => {
      if (!(problemId in current)) return current;
      const next = { ...current };
      delete next[problemId];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(choiceProblems.map((problem) => [
      problem.id,
      problem.choices.find((choice) => choice.id === selected[problem.id])?.correct === true,
    ])));
  }

  function row(problem: NumericWorksheetProblem, index: number, answerSheet: boolean) {
    return (
      <article className="polynomial-question logarithm-question" data-testid="numeric-choice-question" key={`${problem.id}-${answerSheet}`}>
        <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="polynomial-question-body">
          <span className="polynomial-focus-label">{problem.label}</span>
          {showPromptOnWorksheet && <p className="logarithm-prompt">{problem.prompt}</p>}
          {(showLatexOnWorksheet || answerSheet) && <div className="logarithm-expression"><MathFormula latex={problem.latex} display /></div>}
          {answerSheet && <div className="logarithm-response"><MathFormula latex={formatChoice(problem, problem.answers)} /></div>}
        </div>
      </article>
    );
  }

  function sheet(answerSheet: boolean) {
    return (
      <div className={`a4-sheet counting-sheet polynomial-sheet logarithm-sheet polynomial-sheet-${problems.length}`} style={{ transform: `scale(${scale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>{subject}</span><strong>{title}{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {set.seed}</small></div>
        </header>
        <div className="polynomial-instruction"><b>{instruction} 빈 공간에 풀이 과정을 쓰세요.</b><span>답안 입력에서 4지선다 채점 · 오답 보충 최대 2문제</span></div>
        <div className="polynomial-problem-grid logarithm-grid">{problems.map((problem, index) => row(problem, index, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page logarithm-page numeric-choice-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{Object.values(results).filter(Boolean).length}<small>/{problems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" type="button" onClick={() => { setSet(createSet(Date.now() >>> 0)); reset(); }}>새 문제</button>
          <button className="button ghost" type="button" onClick={reset}>다시 풀기</button>
          {reviews.length === 0 && wrong.length > 0 && <button className="button secondary" type="button" onClick={() => setReviews(createReviews(wrong.map(({ kind }) => kind), set.seed ^ 0x9e3779b9))}>틀린 유형 {Math.min(wrong.length, 2)}문제 더</button>}
          <button className="button secondary" type="button" onClick={() => setPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" type="button" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" type="button" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * scale, height: 1123 * scale }} aria-label={`A4 ${title} 문제지`}>{sheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * scale, height: 1123 * scale }} aria-label={`A4 ${title} 정답지`}>{sheet(true)}</div>
      {panelOpen && <WorksheetChoicePanel title={title} problems={choiceProblems} selected={selected} results={results} onSelect={choose} onClose={() => setPanelOpen(false)} />}
    </main>
  );
}
