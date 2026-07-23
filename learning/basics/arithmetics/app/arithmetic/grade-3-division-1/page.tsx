"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

type PrintMode = "worksheet" | "answers" | "both";
type DivisionKind = "quotative" | "partitive";
type StoryProblem = { id: string; index: number; divisor: number; quotient: number; kind: DivisionKind; unit: string };
type ProblemSet = { seed: number; problems: StoryProblem[] };

const INITIAL_SEED = 20260720;
const STORY_TYPES: Array<{ kind: DivisionKind; unit: string }> = [
  { kind: "quotative", unit: "명" },
  { kind: "partitive", unit: "개" },
  { kind: "quotative", unit: "통" },
  { kind: "quotative", unit: "명" },
  { kind: "quotative", unit: "일" },
  { kind: "partitive", unit: "개" },
  { kind: "quotative", unit: "일" },
  { kind: "partitive", unit: "장" },
  { kind: "partitive", unit: "명" },
  { kind: "quotative", unit: "대" },
];

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
  return {
    seed,
    problems: STORY_TYPES.map(({ kind, unit }, index) => {
      const divisor = integer(next, 2, 3);
      return { id: `division-story-${index}`, index, divisor, quotient: 6 / divisor, kind, unit };
    }),
  };
}

function DrawingPad({ id, register }: { id: string; register: (id: string, canvas: HTMLCanvasElement | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    register(id, canvas);
    return () => register(id, null);
  }, [id, register]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const position = point(event);
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(position.x, position.y);
    context.lineWidth = 5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#17233c";
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const position = point(event);
    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function finish() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div className="division-drawing-pad">
      <canvas ref={canvasRef} width={520} height={116} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} aria-label={`${id} 그림 그리기`} />
      <button type="button" onClick={clear}>지우기</button>
    </div>
  );
}

function story(problem: StoryProblem) {
  const value = <strong>{problem.divisor}</strong>;
  switch (problem.index) {
    case 0: return <>선물 6개를 한 명당 {value}개씩 주면 몇 명이 받을까요?</>;
    case 1: return <>선물 6개를 {value}명이 똑같이 나누면 한 명당 몇 개일까요?</>;
    case 2: return <>선물 6개를 한 통에 {value}개씩 담으면 몇 통이 될까요?</>;
    case 3: return <>선물 6개를 한 명당 {value}개씩 나누어주면 몇 명이 받을까요?</>;
    case 4: return <>과일 6개를 하루에 {value}개씩 먹으면 며칠 걸릴까요?</>;
    case 5: return <>과일 6개를 {value}일 동안 똑같이 먹으면 하루에 몇 개일까요?</>;
    case 6: return <>학습지 6장을 하루에 {value}장씩 풀면 며칠 더 걸릴까요?</>;
    case 7: return <>학습지 6장을 {value}일 동안 풀면 하루에 몇 장씩 풀까요?</>;
    case 8: return <>친구 6명이 자동차 {value}대에 똑같이 타면 한 차에 몇 명일까요?</>;
    default: return <>친구 6명이 한 차에 {value}명씩 타면 차가 몇 대 필요할까요?</>;
  }
}

function GroupDiagram({ problem }: { problem: StoryProblem }) {
  const groupCount = problem.kind === "quotative" ? problem.quotient : problem.divisor;
  const groupSize = 6 / groupCount;
  return (
    <div className="division-group-diagram" aria-label={`${groupCount}묶음 그림`}>
      {Array.from({ length: groupCount }, (_, group) => (
        <span className="division-dot-group" key={group}>
          {Array.from({ length: groupSize }, (_, dot) => <i key={dot} />)}
        </span>
      ))}
    </div>
  );
}

export default function GradeThreeDivisionOnePage() {
  const [questionSet, setQuestionSet] = useState(() => createProblemSet(INITIAL_SEED));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [sheetScale, setSheetScale] = useState(0.6);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const canvases = useRef<Record<string, HTMLCanvasElement>>({});

  useEffect(() => {
    function fitA4Sheet() {
      setSheetScale(Math.min((window.innerWidth - 32) / 794, 1));
    }
    fitA4Sheet();
    window.addEventListener("resize", fitA4Sheet);
    return () => window.removeEventListener("resize", fitA4Sheet);
  }, []);

  const registerCanvas = useCallback((id: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) canvases.current[id] = canvas;
    else delete canvases.current[id];
  }, []);
  const expected = useMemo(() => questionSet.problems.flatMap((problem) => [
    [`${problem.id}-equation`, String(problem.quotient)] as const,
    [`${problem.id}-answer`, String(problem.quotient)] as const,
  ]), [questionSet]);
  const completed = Object.values(answers).filter(Boolean).length;
  const correctProblems = questionSet.problems.filter((problem) => (
    results[`${problem.id}-equation`] === true && results[`${problem.id}-answer`] === true
  )).length;

  function updateAnswer(id: string, value: string) {
    setAnswers((current) => ({ ...current, [id]: value.replace(/[^0-9]/g, "").slice(0, 1) }));
    setResults((current) => {
      if (!(id in current)) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function checkAll() {
    setResults(Object.fromEntries(expected.map(([id, answer]) => [id, answers[id] === answer])));
  }

  function clearDrawings() {
    Object.values(canvases.current).forEach((canvas) => canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height));
  }

  function resetAnswers() {
    setAnswers({});
    setResults({});
    clearDrawings();
  }

  function newSet() {
    if (completed > 0 && !window.confirm("쓴 답이 사라집니다. 새 문제를 만들까요?")) return;
    clearDrawings();
    setQuestionSet(createProblemSet((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0));
    setAnswers({});
    setResults({});
  }

  function printMaterials(mode: PrintMode) {
    setPrintMenuOpen(false);
    document.documentElement.dataset.printMode = mode;
    const clearPrintMode = () => delete document.documentElement.dataset.printMode;
    window.addEventListener("afterprint", clearPrintMode, { once: true });
    window.requestAnimationFrame(() => window.print());
  }

  function response(problem: StoryProblem, field: "equation" | "answer", answerSheet: boolean) {
    if (answerSheet) return <strong className={`division-static-answer ${field}`}>{problem.quotient}</strong>;
    const id = `${problem.id}-${field}`;
    return <input className={`division-answer-input ${field}`} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1} value={answers[id] ?? ""} onChange={(event) => updateAnswer(id, event.target.value)} aria-label={`${id} 답`} />;
  }

  function renderProblem(problem: StoryProblem, answerSheet: boolean) {
    const ids = [`${problem.id}-equation`, `${problem.id}-answer`];
    const graded = ids.some((id) => id in results);
    const isCorrect = graded && ids.every((id) => results[id]);
    return (
      <article className={`division-story-problem${graded ? isCorrect ? " is-correct" : " is-wrong" : ""}`} data-testid="division-story-problem" key={problem.id}>
        <p><b>{problem.index + 1}</b>{story(problem)}</p>
        <div className="division-story-work">
          <div className="division-story-drawing"><span>그림</span>{answerSheet ? <GroupDiagram problem={problem} /> : <DrawingPad id={problem.id} register={registerCanvas} />}</div>
          <div className="division-story-response">
            <span>식</span><strong>6 ÷ {problem.divisor} =</strong>{response(problem, "equation", answerSheet)}
            <span>답</span>{response(problem, "answer", answerSheet)}<em>{problem.unit}</em>
          </div>
        </div>
        {!answerSheet && graded && <span className={`counting-result ${isCorrect ? "correct" : "wrong"}`} role="status">{isCorrect ? "맞음" : "틀림"}</span>}
      </article>
    );
  }

  function renderSheet(answerSheet: boolean) {
    return (
      <div className="a4-sheet counting-sheet division-story-sheet" style={{ transform: `scale(${sheetScale})` }}>
        <header className="counting-sheet-header">
          <div className="counting-sheet-title"><span>3학년</span><strong>나눗셈①{answerSheet ? " 정답" : ""}</strong></div>
          <div className="counting-sheet-info"><span>이름 <i /></span><span>날짜 <i /></span><small>문제지 {questionSet.seed}</small></div>
        </header>
        <div className="division-story-grid">{questionSet.problems.map((problem) => renderProblem(problem, answerSheet))}</div>
      </div>
    );
  }

  return (
    <main className="counting-page division-story-page">
      <div className="counting-toolbar">
        <a className="counting-back" href="/arithmetic">← 연산</a>
        <div className="counting-progress"><strong>{correctProblems}<small>/10 정답</small></strong></div>
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
      <div className="a4-stage counting-a4-stage worksheet-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈① 문제지">{renderSheet(false)}</div>
      <div className="a4-stage counting-a4-stage answer-stage" style={{ width: 794 * sheetScale, height: 1123 * sheetScale }} aria-label="A4 3학년 나눗셈① 전체 답지">{renderSheet(true)}</div>
    </main>
  );
}
