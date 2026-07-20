import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the fraction conversion practice product", async () => {
  const response = await render("/fraction");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>수학 학습지<\/title>/);
  assert.match(html, /대분수를 가분수로/);
  assert.match(html, /가분수를 대분수로/);
  assert.match(html, /전체 채점/);
  assert.match(html, />인쇄<\/button>/);
  assert.match(html, /문제지 번호\s*(?:<!-- -->)?20260720/);
  assert.match(html, /aria-label="A4 분수 변환 문제지"/);
  assert.match(html, /aria-label="A4 분수 변환 전체 답지"/);
  assert.equal((html.match(/data-testid="question-card"/g) ?? []).length, 16);
  assert.equal((html.match(/data-testid="answer-card"/g) ?? []).length, 16);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders the learning index and the arithmetic catalog in workbook order", async () => {
  const indexResponse = await render("/");
  const indexHtml = await indexResponse.text();
  assert.match(indexHtml, /href="\/arithmetic"/);
  assert.match(indexHtml, /연산 학습지/);
  assert.match(indexHtml, /href="\/fraction"/);

  const catalogResponse = await render("/arithmetic");
  const catalogHtml = await catalogResponse.text();
  assert.equal((catalogHtml.match(/data-testid="worksheet-choice"/g) ?? []).length, 64);
  assert.ok(catalogHtml.indexOf("1수세기①") < catalogHtml.indexOf("1덧셈뺄셈①"));
  assert.ok(catalogHtml.indexOf("3분수①") < catalogHtml.indexOf("3분수②"));
  assert.ok(catalogHtml.indexOf("3분수②") < catalogHtml.indexOf("3무게,들이"));
  assert.ok(catalogHtml.indexOf("6비례식") < catalogHtml.indexOf("6원기둥"));
  assert.match(catalogHtml, /href="\/fraction"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/counting-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/add-subtract-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/add-subtract-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/give-and-take-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/complements-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/add-subtract-3"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/add-subtract-4"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/number-reading-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/skip-counting-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-2-add-subtract-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-2-add-subtract-2"[^>]*data-testid="worksheet-choice"/);
  assert.doesNotMatch(catalogHtml, /난이도|연산 종류/);
});

test("renders the first counting worksheet with interactive and printable answers", async () => {
  const response = await render("/arithmetic/counting-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /수 세기①/);
  assert.match(html, /몇 개인지 숫자로 쓰세요/);
  assert.match(html, /몇 개인지 한글로 쓰세요/);
  assert.match(html, /주어진 수만큼 그리세요/);
  assert.match(html, />전체 채점<\/button>/);
  assert.match(html, />인쇄<\/button>/);
  assert.match(html, /aria-label="A4 수 세기 문제지"/);
  assert.match(html, /aria-label="A4 수 세기 전체 답지"/);
  assert.equal((html.match(/class="counting-question"/g) ?? []).length, 12);
  assert.equal((html.match(/class="drawing-question"/g) ?? []).length, 6);
});

test("renders the first addition and subtraction worksheet in three columns", async () => {
  const response = await render("/arithmetic/add-subtract-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /덧셈뺄셈①/);
  assert.match(html, />전체 채점<\/button>/);
  assert.match(html, />인쇄<\/button>/);
  assert.match(html, /aria-label="A4 덧셈뺄셈① 문제지"/);
  assert.match(html, /aria-label="A4 덧셈뺄셈① 전체 답지"/);
  assert.equal((html.match(/class="addsub-equation-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="addsub-input /g) ?? []).length, 30);
});

test("renders the second addition and subtraction worksheet with two-digit entries", async () => {
  const response = await render("/arithmetic/add-subtract-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /덧셈뺄셈②/);
  assert.match(html, /aria-label="A4 덧셈뺄셈② 문제지"/);
  assert.match(html, /aria-label="A4 덧셈뺄셈② 전체 답지"/);
  assert.equal((html.match(/class="addsub-equation-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="addsub-input /g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
});

test("renders the third addition and subtraction worksheet within twenty", async () => {
  const response = await render("/arithmetic/add-subtract-3");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /덧셈뺄셈③/);
  assert.match(html, /aria-label="A4 덧셈뺄셈③ 문제지"/);
  assert.match(html, /aria-label="A4 덧셈뺄셈③ 전체 답지"/);
  assert.equal((html.match(/class="addsub-equation-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="addsub-input /g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.equal((html.match(/<span>\+<\/span>/g) ?? []).length, 28);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 32);
});

test("renders the fourth addition and subtraction worksheet with changing blanks", async () => {
  const response = await render("/arithmetic/add-subtract-4");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /덧셈뺄셈④/);
  assert.match(html, /aria-label="A4 덧셈뺄셈④ 문제지"/);
  assert.match(html, /aria-label="A4 덧셈뺄셈④ 전체 답지"/);
  assert.equal((html.match(/class="addsub-equation-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="addsub-input /g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.equal((html.match(/<span>\+<\/span>/g) ?? []).length, 18);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 42);
  const blankOrder = [...html.matchAll(/aria-label="((?:addition|subtraction|mixed)-\d+ (?:left|right|result)) 답"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(blankOrder, [
    "addition-0 result", "addition-1 result", "addition-2 left", "addition-3 result", "addition-4 result",
    "addition-5 right", "addition-6 result", "addition-7 result", "addition-8 left", "addition-9 right",
    "subtraction-0 left", "subtraction-1 right", "subtraction-2 left", "subtraction-3 right", "subtraction-4 result",
    "subtraction-5 right", "subtraction-6 left", "subtraction-7 right", "subtraction-8 result", "subtraction-9 right",
    "mixed-0 left", "mixed-1 left", "mixed-2 left", "mixed-3 result", "mixed-4 left",
    "mixed-5 right", "mixed-6 result", "mixed-7 left", "mixed-8 left", "mixed-9 right",
  ]);
});

test("renders the first number-reading worksheet in two columns", async () => {
  const response = await render("/arithmetic/number-reading-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /수 읽기/);
  assert.match(html, /한자\(일 이 삼···\)/);
  assert.match(html, /우리말\(하나 둘 셋···\)/);
  assert.match(html, /aria-label="A4 수 읽기 문제지"/);
  assert.match(html, /aria-label="A4 수 읽기 전체 답지"/);
  assert.equal((html.match(/data-testid="reading-row"/g) ?? []).length, 36);
  assert.equal((html.match(/class="reading-input"/g) ?? []).length, 18);
  assert.equal((html.match(/class="reading-static-answer"/g) ?? []).length, 18);
  assert.doesNotMatch(html, /삽심/);
});

test("renders the first skip-counting worksheet with the workbook blank pattern", async () => {
  const response = await render("/arithmetic/skip-counting-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /뛰어 세기/);
  assert.match(html, /aria-label="A4 뛰어 세기 문제지"/);
  assert.match(html, /aria-label="A4 뛰어 세기 전체 답지"/);
  assert.equal((html.match(/data-testid="skip-row"/g) ?? []).length, 20);
  assert.equal((html.match(/class="skip-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="skip-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 30);

  const blankOrder = [...html.matchAll(/aria-label="(skip-\d+-\d+) 답"/g)].map((match) => match[1]);
  assert.deepEqual(blankOrder, [
    "skip-0-2", "skip-0-4",
    "skip-1-3", "skip-1-4", "skip-1-5",
    "skip-2-2", "skip-2-3", "skip-2-4",
    "skip-3-1", "skip-3-2", "skip-3-3", "skip-3-4",
    "skip-4-2", "skip-4-4", "skip-4-6",
    "skip-5-2", "skip-5-4",
    "skip-6-3", "skip-6-4", "skip-6-5",
    "skip-7-2", "skip-7-3", "skip-7-4",
    "skip-8-1", "skip-8-2", "skip-8-3", "skip-8-4",
    "skip-9-2", "skip-9-4", "skip-9-6",
  ]);
});

test("renders the first grade-two vertical addition and subtraction worksheet", async () => {
  const response = await render("/arithmetic/grade-2-add-subtract-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /2학년/);
  assert.match(html, /덧셈뺄셈①/);
  assert.match(html, /aria-label="A4 2학년 덧셈뺄셈① 문제지"/);
  assert.match(html, /aria-label="A4 2학년 덧셈뺄셈① 전체 답지"/);
  assert.equal((html.match(/data-testid="vertical-equation"/g) ?? []).length, 32);
  assert.equal((html.match(/class="vertical-input"/g) ?? []).length, 16);
  assert.equal((html.match(/class="vertical-static-answer"/g) ?? []).length, 16);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 16);
  assert.equal((html.match(/<i>\+<\/i>/g) ?? []).length, 16);
  assert.equal((html.match(/<i>−<\/i>/g) ?? []).length, 16);
  assert.match(css, /\.vertical-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,[\s\S]*?grid-template-rows:\s*repeat\(4,/);
  assert.match(css, /\.vertical-equation\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.vertical-equation\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
});

test("renders the second grade-two worksheet with two missing digits per problem", async () => {
  const response = await render("/arithmetic/grade-2-add-subtract-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /2학년/);
  assert.match(html, /덧셈뺄셈②/);
  assert.match(html, /aria-label="A4 2학년 덧셈뺄셈② 문제지"/);
  assert.match(html, /aria-label="A4 2학년 덧셈뺄셈② 전체 답지"/);
  assert.equal((html.match(/data-testid="digit-equation"/g) ?? []).length, 24);
  assert.equal((html.match(/class="digit-input"/g) ?? []).length, 24);
  assert.equal((html.match(/class="digit-static-answer"/g) ?? []).length, 24);
  assert.equal((html.match(/maxLength="1"/g) ?? []).length, 24);
  assert.equal((html.match(/<i>\+<\/i>/g) ?? []).length, 12);
  assert.equal((html.match(/<i>−<\/i>/g) ?? []).length, 12);
  assert.match(css, /\.digit-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,[\s\S]*?grid-template-rows:\s*repeat\(4,/);
  assert.match(css, /\.digit-equation\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.digit-equation\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);

  const blankOrder = [...html.matchAll(/aria-label="(digit-\d+-\d+-(?:top|bottom|result)(?:Tens|Ones|Hundreds)) 답"/g)].map((match) => match[1]);
  assert.deepEqual(blankOrder, [
    "digit-0-0-bottomOnes", "digit-0-0-resultTens",
    "digit-0-1-topTens", "digit-0-1-resultOnes",
    "digit-0-2-topOnes", "digit-0-2-bottomTens",
    "digit-1-0-bottomTens", "digit-1-0-resultOnes",
    "digit-1-1-topOnes", "digit-1-1-resultTens",
    "digit-1-2-topTens", "digit-1-2-bottomOnes",
    "digit-2-0-bottomOnes", "digit-2-0-resultTens",
    "digit-2-1-topTens", "digit-2-1-resultOnes",
    "digit-2-2-topOnes", "digit-2-2-bottomTens",
    "digit-3-0-bottomTens", "digit-3-0-resultOnes",
    "digit-3-1-topOnes", "digit-3-1-resultTens",
    "digit-3-2-topTens", "digit-3-2-bottomOnes",
  ]);
});

test("renders the sequential give-and-take worksheet and printable answers", async () => {
  const response = await render("/arithmetic/give-and-take-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /주고받기/);
  assert.match(html, /글을 읽고 물음에 답하시오\. \[1~3번\]/);
  assert.match(html, /첫 번째 놀이에서 지혜는 슬기에게 카드/);
  assert.match(html, /두 번째 놀이에서 슬기는 용기에게 카드/);
  assert.match(html, /세 번째 놀이에서 용기는 지혜에게 카드/);
  assert.match(html, /aria-label="A4 주고받기 문제지"/);
  assert.match(html, /aria-label="A4 주고받기 전체 답지"/);
  assert.equal((html.match(/data-testid="give-question"/g) ?? []).length, 6);
  assert.equal((html.match(/class="give-answer-input"/g) ?? []).length, 7);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 7);
});

test("renders the first complements worksheet in three columns", async () => {
  const response = await render("/arithmetic/complements-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /10으로 모으거나 가르기/);
  assert.match(html, /aria-label="10에서 빼기"/);
  assert.match(html, /aria-label="두 수로 10 만들기"/);
  assert.match(html, /aria-label="세 수 더하기"/);
  assert.match(html, /aria-label="A4 보수 문제지"/);
  assert.match(html, /aria-label="A4 보수 전체 답지"/);
  assert.equal((html.match(/data-testid="complement-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="complement-input/g) ?? []).length, 30);
});

test("keeps the printable worksheet on one compact A4 page", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const printBlock = css.slice(css.indexOf("@media print"));

  assert.match(printBlock, /size:\s*A4 portrait/);
  assert.match(printBlock, /margin:\s*0/);
  assert.match(printBlock, /width:\s*210mm/);
  assert.match(printBlock, /height:\s*297mm/);
  assert.match(printBlock, /transform:\s*none !important/);
  assert.match(printBlock, /grid-template-columns:\s*1fr 1fr/);
  assert.match(printBlock, /min-height:\s*10\.5mm/);
  assert.match(printBlock, /page-break-inside:\s*avoid/);
  assert.match(printBlock, /\.answer-stage\s*\{[\s\S]*?display:\s*block !important;[\s\S]*?page-break-before:\s*always;/);
  assert.match(printBlock, /\.a4-sheet \.fraction-line\s*\{[\s\S]*?border-top:\s*2px solid currentColor;[\s\S]*?background:\s*transparent !important;/);
  assert.doesNotMatch(printBlock, /margin:\s*12mm/);
});

test("keeps the desktop worksheet in one two-column viewport", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const desktopBlock = css.slice(
    css.indexOf("@media (min-width: 761px)"),
    css.indexOf("@media (prefers-reduced-motion"),
  );

  assert.match(desktopBlock, /height:\s*100dvh/);
  assert.match(desktopBlock, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopBlock, /grid-template-rows:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(desktopBlock, /\.hero\s*\{\s*display:\s*none/);
  assert.match(desktopBlock, /gap:\s*0/);
  assert.match(desktopBlock, /border-left:\s*2px solid/);
  assert.match(css, /width:\s*fit-content/);
  assert.match(css, /justify-self:\s*start/);
  assert.match(css, /\.a4-sheet\s*\{[\s\S]*?width:\s*794px;[\s\S]*?height:\s*1123px;/);
  assert.match(css, /\.a4-stage\s*\{[\s\S]*?margin:\s*0 auto;/);
  assert.match(css, /\.answer-stage\s*\{\s*display:\s*none;/);
  assert.match(css, /\.site-footer\s*\{\s*display:\s*none;/);
  assert.match(css, /\.a4-sheet \.question-row > \.fraction\s*\{\s*font-size:\s*27px;/);
});

test("shows only right or wrong after grading", async () => {
  const pageSource = await readFile(new URL("../app/fraction/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /result\.correct \? "맞음" : "틀림"/);
  assert.doesNotMatch(pageSource, /function Explanation|풀이 보기|풀이 닫기|result\.message|explain-button/);
});

test("uses soft green and red row shading for arithmetic grading", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const countingSource = await readFile(new URL("../app/arithmetic/counting-1/page.tsx", import.meta.url), "utf8");
  const addSubSource = await readFile(new URL("../app/arithmetic/add-subtract-1/page.tsx", import.meta.url), "utf8");

  assert.match(css, /\.counting-question\.is-correct,[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.counting-question\.is-wrong,[\s\S]*?background:\s*var\(--red-soft\)/);
  assert.match(countingSource, /counting-question\$\{results\[index \+ 1\][\s\S]*?is-correct/);
  assert.match(addSubSource, /addsub-equation-row\$\{graded[\s\S]*?is-correct/);
});

test("opens the browser print dialog without creating a download", async () => {
  const pageSource = await readFile(new URL("../app/fraction/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /window\.print\(\)/);
  assert.match(pageSource, /dataset\.printMode = mode/);
  assert.match(pageSource, /문제지만 인쇄/);
  assert.match(pageSource, /답지만 인쇄/);
  assert.match(pageSource, /문제지\+답지 인쇄/);
  assert.doesNotMatch(pageSource, /html2canvas|jsPDF|\.save\(/);
  assert.doesNotMatch(pageSource, /훈련실|곱하고 더하기|나누고 남기기|오늘의 분수 연습|기억할 한 줄|시제품/);
  assert.doesNotMatch(pageSource, />3학년 분수</);
});
