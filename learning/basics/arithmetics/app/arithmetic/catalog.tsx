import { Fragment } from "react";
import { learningWorksheetCatalog } from "../../lib/arithmetic-worksheets";

type LearningStage = "elementary" | "middle" | "high" | "stem";

const stageMeta: Record<LearningStage, { label: string; shortLabel: string }> = {
  elementary: { label: "초등", shortLabel: "초등" },
  middle: { label: "중등", shortLabel: "중등" },
  high: { label: "고등", shortLabel: "고등" },
  stem: { label: "이공계 기초", shortLabel: "이공계 기초" },
};

function worksheetStage(grade: string): LearningStage {
  if (grade.startsWith("초")) return "elementary";
  if (grade.startsWith("중")) return "middle";
  if (grade === "이공계 기초") return "stem";
  return "high";
}

export default function ArithmeticCatalog() {
  const availableStages = new Set(learningWorksheetCatalog.map(({ grade }) => worksheetStage(grade)));

  return (
    <main className="portal-page catalog-page">
      <div className="catalog-shell">
        <header className="catalog-header">
          <a className="catalog-back" href="/arithmetic" aria-label="연산 모드 선택으로 돌아가기">← 연산</a>
          <div><h1>기초 연산</h1></div>
        </header>
        <nav className="catalog-stage-nav" aria-label="수학 과정">
          {(Object.keys(stageMeta) as LearningStage[]).map((stage) => {
            const meta = stageMeta[stage];
            const isAvailable = availableStages.has(stage);
            return isAvailable
              ? <a key={stage} className={`catalog-stage-link stage-${stage}`} href={`#stage-${stage}`}>{meta.label}</a>
              : <span key={stage} className={`catalog-stage-link stage-${stage} is-upcoming`} aria-disabled="true">{meta.label}<small>준비 중</small></span>;
          })}
        </nav>
        <ol className="worksheet-catalog" aria-label="연산 학습지 목록">
          {learningWorksheetCatalog.map(({ route, grade, title }, index) => {
            const stage = worksheetStage(grade);
            const previousStage = index > 0 ? worksheetStage(learningWorksheetCatalog[index - 1].grade) : null;
            const content = <>
              <span className="worksheet-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="worksheet-title">
                <small className="worksheet-grade">{`(${grade})`}</small>
                <strong>{title}</strong>
              </span>
              {route && <span className="worksheet-arrow" aria-hidden="true">→</span>}
            </>;
            return (
              <Fragment key={`${index}-${title}`}>
                {stage !== previousStage && (
                  <li className={`worksheet-stage-heading stage-${stage}`} id={`stage-${stage}`}>
                    <strong>{stageMeta[stage].shortLabel}</strong>
                  </li>
                )}
                <li>
                  {route
                    ? <a className={`worksheet-choice is-ready stage-${stage}`} href={route} data-stage={stage} data-testid="worksheet-choice">{content}</a>
                    : <div className={`worksheet-choice stage-${stage}`} data-stage={stage} data-testid="worksheet-choice">{content}</div>}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
