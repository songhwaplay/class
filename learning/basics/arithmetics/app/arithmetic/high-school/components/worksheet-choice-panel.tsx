"use client";

import MathFormula from "../../../components/math-formula";
import { targetQuestion } from "../../../../lib/worksheet-question";

export type WorksheetChoice = {
  id: string;
  latex: string;
  correct: boolean;
};

export type WorksheetChoiceProblem = {
  id: string;
  label: string;
  choices: WorksheetChoice[];
  correctLatex: string;
};

type Props = {
  title: string;
  problems: WorksheetChoiceProblem[];
  displayStyle?: boolean;
  selected: Record<string, string>;
  results: Record<string, boolean>;
  onSelect: (problemId: string, choiceId: string) => void;
  onGrade: () => void;
  onClose: () => void;
};

export default function WorksheetChoicePanel({ title, problems, displayStyle = false, selected, results, onSelect, onGrade, onClose }: Props) {
  const completed = problems.filter((problem) => selected[problem.id] !== undefined).length;
  return (
    <div className="trig-derivative-answer-panel-backdrop" role="presentation" onClick={onClose}>
      <aside className="trig-derivative-answer-panel" role="dialog" aria-modal="true" aria-label={`${title} 답안 입력`} onClick={(event) => event.stopPropagation()}>
        <header>
          <div><strong>답안 입력</strong><span>{completed}/{problems.length}문제 선택</span></div>
          <button type="button" onClick={onClose} aria-label="닫기">×</button>
        </header>
        <div className="trig-derivative-answer-list">
          {problems.map((problem, problemIndex) => (
            <section className="trig-derivative-answer-item" key={problem.id}>
              <div className="trig-derivative-answer-item-heading"><strong>{String(problemIndex + 1).padStart(2, "0")}</strong><span>{targetQuestion(problem.label)}</span></div>
              <div className="trig-derivative-choices">
                {problem.choices.map((choice, choiceIndex) => (
                  <button className={`trig-derivative-choice${selected[problem.id] === choice.id ? " is-selected" : ""}`} type="button" key={choice.id} aria-pressed={selected[problem.id] === choice.id} onClick={() => onSelect(problem.id, choice.id)}>
                    <span>{choiceIndex + 1}</span><MathFormula latex={choice.latex} displayStyle={displayStyle} />
                  </button>
                ))}
              </div>
              {problem.id in results && <div className={`trig-derivative-panel-grade ${results[problem.id] ? "is-correct" : "is-wrong"}`}>{results[problem.id] ? "정답" : <>정답 <MathFormula latex={problem.correctLatex} displayStyle={displayStyle} /></>}</div>}
            </section>
          ))}
        </div>
        <button className="button primary trig-derivative-panel-grade" type="button" disabled={completed === 0} onClick={onGrade}>전체 채점</button>
      </aside>
    </div>
  );
}
