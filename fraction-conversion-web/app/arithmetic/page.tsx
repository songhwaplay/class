const worksheetNames = [
  "1수세기①",
  "1덧셈뺄셈①",
  "1덧셈뺄셈②",
  "1주고받기",
  "1보수",
  "1덧셈뺄셈③",
  "1덧셈뺄셈④",
  "1수읽기",
  "1뛰어세기",
  "2덧셈뺄셈①",
  "2덧셈뺄셈②",
  "2덧셈뺄셈③",
  "2묶어세기",
  "2길이재기",
  "2구구단①",
  "2구구단②",
  "2구구단③",
  "2구구단④",
  "2구구단⑤",
  "2시계①",
  "2시계②",
  "3덧셈뺄셈",
  "3덧셈뺄셈빈칸",
  "3보수뺄셈100",
  "3보수뺄셈1000",
  "3덧셈뺄셈②",
  "3나눗셈①",
  "3곱셈①",
  "3곱셈②",
  "3길이",
  "3시간①",
  "3시간②",
  "3곱셈③",
  "19단",
  "제곱수",
  "3나눗셈②",
  "3나눗셈③",
  "3분수①",
  "3분수②",
  "3무게,들이",
  "3분수③",
  "4숫자읽기",
  "4곱셈",
  "4큰수곱셈",
  "4나눗셈",
  "4분수",
  "4소수",
  "단위변환",
  "5혼합계산",
  "자연수분해",
  "프라임넘버",
  "5약수,배수",
  "5분수①",
  "5분수②",
  "5분수③",
  "5소수",
  "6분수",
  "6소수①",
  "6소수②",
  "6소수③",
  "6혼합계산",
  "6비례식",
  "6원",
  "6원기둥",
] as const;

export default function ArithmeticCatalogPage() {
  return (
    <main className="portal-page catalog-page">
      <div className="catalog-shell">
        <header className="catalog-header">
          <a className="catalog-back" href="/" aria-label="수학 학습지 홈으로 돌아가기">← 홈</a>
          <div>
            <h1>연산 학습지 고르기</h1>
          </div>
        </header>

        <ol className="worksheet-catalog" aria-label="연산 학습지 목록">
          {worksheetNames.map((name, index) => {
            const route =
              name === "1수세기①"
                ? "/arithmetic/counting-1"
                : name === "1덧셈뺄셈①"
                  ? "/arithmetic/add-subtract-1"
                  : name === "1덧셈뺄셈②"
                    ? "/arithmetic/add-subtract-2"
                    : name === "1주고받기"
                      ? "/arithmetic/give-and-take-1"
                      : name === "1보수"
                        ? "/arithmetic/complements-1"
                        : name === "1덧셈뺄셈③"
                          ? "/arithmetic/add-subtract-3"
                          : name === "1덧셈뺄셈④"
                            ? "/arithmetic/add-subtract-4"
                            : name === "1수읽기"
                              ? "/arithmetic/number-reading-1"
                              : name === "1뛰어세기"
                                ? "/arithmetic/skip-counting-1"
                                : name === "2덧셈뺄셈①"
                                  ? "/arithmetic/grade-2-add-subtract-1"
                                  : name === "2덧셈뺄셈②"
                                    ? "/arithmetic/grade-2-add-subtract-2"
                                    : name === "2덧셈뺄셈③"
                                      ? "/arithmetic/grade-2-add-subtract-3"
                                      : name === "2묶어세기"
                                        ? "/arithmetic/group-counting-1"
                                        : name === "2길이재기"
                                          ? "/arithmetic/length-measuring-1"
                        : name === "3분수②"
                          ? "/fraction"
                          : null;
            const content = (
              <>
                <span className="worksheet-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{name}</strong>
                {route && <span className="worksheet-arrow" aria-hidden="true">→</span>}
              </>
            );

            return (
              <li key={`${index}-${name}`}>
                {route ? (
                  <a className="worksheet-choice is-ready" href={route} data-testid="worksheet-choice">
                    {content}
                  </a>
                ) : (
                  <div className="worksheet-choice" data-testid="worksheet-choice">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
