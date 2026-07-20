export default function ArithmeticModePage() {
  return (
    <main className="portal-page arithmetic-mode-page">
      <div className="arithmetic-mode-shell">
        <header className="catalog-header">
          <a className="catalog-back" href="/">← 홈</a>
          <div><h1>연산</h1></div>
        </header>
        <section className="arithmetic-mode-grid" aria-label="연산 모드 선택">
          <a className="arithmetic-mode-card personal" href="/arithmetic/personal">
            <span>01</span><strong>개인 모드</strong><i aria-hidden="true">→</i>
          </a>
          <a className="arithmetic-mode-card race" href="/arithmetic/race">
            <span>02</span><strong>순위 모드</strong><i aria-hidden="true">→</i>
          </a>
        </section>
      </div>
    </main>
  );
}
