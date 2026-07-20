const learningAreas = [
  {
    href: "/arithmetic",
    symbol: "+ − × ÷",
    title: "연산 학습지",
    tone: "arithmetic",
  },
  {
    href: "/fraction",
    symbol: "½",
    title: "대분수와 가분수 변환",
    tone: "fraction",
  },
] as const;

export default function LearningIndexPage() {
  return (
    <main className="portal-page index-page">
      <div className="portal-shell">
        <header className="portal-header">
          <a className="portal-brand" href="/" aria-label="수학 학습지 홈">
            <span className="portal-brand-mark">수</span>
            <span>수학 학습지</span>
          </a>
        </header>

        <section className="portal-hero" aria-labelledby="portal-title">
          <h1 id="portal-title">학습지 선택</h1>
        </section>

        <section className="learning-area-grid" aria-label="학습 영역 선택">
          {learningAreas.map((area, index) => (
            <a className={`learning-area-card ${area.tone}`} href={area.href} key={area.href}>
              <span className="learning-area-number">0{index + 1}</span>
              <span className="learning-area-symbol" aria-hidden="true">{area.symbol}</span>
              <h2>{area.title}</h2>
              <span className="learning-area-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
