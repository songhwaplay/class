import { arithmeticWorksheetCatalog } from "../../lib/arithmetic-worksheets";

const explicitGrades: Record<string, string> = {
  "19단": "3",
  "제곱수": "3",
};

export default function ArithmeticCatalog() {
  return (
    <main className="portal-page catalog-page">
      <div className="catalog-shell">
        <header className="catalog-header">
          <a className="catalog-back" href="/arithmetic" aria-label="연산 모드 선택으로 돌아가기">← 연산</a>
          <div><h1>연산 학습지 고르기</h1></div>
        </header>
        <ol className="worksheet-catalog" aria-label="연산 학습지 목록">
          {arithmeticWorksheetCatalog.map(({ name, route }, index) => {
            const gradeMatch = name.match(/^([1-6])(?!\d)(.+)$/);
            const grade = explicitGrades[name] ?? gradeMatch?.[1];
            const title = explicitGrades[name] ? name : gradeMatch ? gradeMatch[2] : name;
            const content = <>
              <span className="worksheet-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="worksheet-title">
                {grade && <small className="worksheet-grade">{`(${grade}학년)`}</small>}
                <strong>{title}</strong>
              </span>
              {route && <span className="worksheet-arrow" aria-hidden="true">→</span>}
            </>;
            return <li key={`${index}-${name}`}>{route ? <a className="worksheet-choice is-ready" href={route} data-testid="worksheet-choice">{content}</a> : <div className="worksheet-choice" data-testid="worksheet-choice">{content}</div>}</li>;
          })}
        </ol>
      </div>
    </main>
  );
}
