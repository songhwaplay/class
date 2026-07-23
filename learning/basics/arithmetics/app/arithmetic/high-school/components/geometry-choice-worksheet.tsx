"use client";

import { useEffect, useMemo, useState } from "react";
import MathFormula from "../../../components/math-formula";
import { rotateChoices } from "../../../../lib/worksheet-choice-utils";
import { targetQuestion } from "../../../../lib/worksheet-question";
import WorksheetChoicePanel, { type WorksheetChoiceProblem } from "./worksheet-choice-panel";

export type GeometryChoiceItem = WorksheetChoiceProblem & { latex: string };

type Props = {
  subject?: string;
  title: string;
  seed: number;
  problems: GeometryChoiceItem[];
};

export default function GeometryChoiceWorksheet({ subject = "기하", title, seed, problems }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [scale, setScale] = useState(0.6);
  const [arrangement, setArrangement] = useState(0);
  const displayedProblems = useMemo(() => {
    const ordered = rotateChoices(problems, `${seed}-problems-${arrangement}`);
    return ordered.map((problem) => ({
      ...problem,
      choices: rotateChoices(problem.choices, `${seed}-${problem.id}-${arrangement}`),
    }));
  }, [arrangement, problems, seed]);

  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 32) / 794, 1));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function reset() {
    setSelected({});
    setResults({});
  }

  function checkAll() {
    setResults(Object.fromEntries(displayedProblems.map((problem) => [
      problem.id,
      problem.choices.find(({ id }) => id === selected[problem.id])?.correct === true,
    ])));
  }

  function selectChoice(problemId: string, choiceId: string) {
    setSelected((current) => ({ ...current, [problemId]: choiceId }));
    setResults((current) => {
      const next = { ...current };
      delete next[problemId];
      return next;
    });
  }

  function sheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet polynomial-sheet derivative-sheet trig-derivative-sheet geometry-choice-sheet polynomial-sheet-7" style={{ transform: `scale(${scale})` }}>
        <header className="counting-sheet-header polynomial-sheet-header">
          <div className="counting-sheet-title"><span>{subject}</span><strong>{title}{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {seed}</small></div>
        </header>
        <div className="polynomial-problem-grid derivative-problem-grid trig-derivative-problem-grid">
          {displayedProblems.map((problem, index) => (
            <article className="polynomial-question derivative-question trig-derivative-question geometry-choice-question" key={problem.id} data-testid="geometry-question">
              <div className="polynomial-question-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="polynomial-question-body">
                <span className="polynomial-focus-label">{targetQuestion(problem.label)}</span>
                <div className="derivative-expression trig-derivative-expression geometry-choice-expression"><MathFormula latex={problem.latex} displayStyle /></div>
                {answerSheet && <div className="derivative-static-answer"><MathFormula latex={problem.correctLatex} displayStyle /></div>}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="counting-page polynomial-page derivative-page trig-derivative-page geometry-choice-page formula-only-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{Object.values(results).filter(Boolean).length}<small>/{displayedProblems.length} 정답</small></strong></div>
        <div className="toolbar">
          <button className="button secondary" onClick={() => { setArrangement((value) => value + 1); reset(); }}>새 배열</button>
          <button className="button ghost" onClick={reset}>다시 풀기</button>
          <button className="button secondary" onClick={() => setPanelOpen(true)}>답안 입력</button>
          <button className="button ghost" onClick={() => window.print()}>인쇄</button>
          <button className="button primary" onClick={checkAll}>전체 채점</button>
        </div>
      </div>
      {panelOpen && <WorksheetChoicePanel title={title} problems={displayedProblems} displayStyle selected={selected} results={results} onSelect={selectChoice} onGrade={checkAll} onClose={() => setPanelOpen(false)} />}
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * scale, height: 1123 * scale }}>{sheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * scale, height: 1123 * scale }}>{sheet(true)}</div>
    </main>
  );
}
