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

test("renders the learning index, arithmetic mode choice, and catalog in workbook order", async () => {
  const indexResponse = await render("/");
  const indexHtml = await indexResponse.text();
  assert.match(indexHtml, /href="\/arithmetic"/);
  assert.match(indexHtml, /연산 학습지/);
  assert.match(indexHtml, /href="\/fraction"/);

  const modeResponse = await render("/arithmetic");
  const modeHtml = await modeResponse.text();
  assert.match(modeHtml, /href="\/arithmetic\/personal"/);
  assert.match(modeHtml, /개인 모드/);
  assert.match(modeHtml, /href="\/arithmetic\/race"/);
  assert.match(modeHtml, /순위 모드/);

  const catalogResponse = await render("/arithmetic/personal");
  const catalogHtml = await catalogResponse.text();
  assert.equal((catalogHtml.match(/data-testid="worksheet-choice"/g) ?? []).length, 63);
  assert.ok(catalogHtml.indexOf("수세기①") < catalogHtml.indexOf("덧셈뺄셈①"));
  assert.ok(catalogHtml.indexOf("분수①") < catalogHtml.indexOf("분수②"));
  assert.ok(catalogHtml.indexOf("분수②") < catalogHtml.indexOf("무게,들이"));
  assert.ok(catalogHtml.indexOf("비례식") < catalogHtml.indexOf("원기둥"));
  assert.match(catalogHtml, /worksheet-grade[^>]*>\(1학년\)<\/small><strong>뛰어세기<\/strong>/);
  assert.match(catalogHtml, /worksheet-grade[^>]*>\(3학년\)<\/small><strong>19단<\/strong>/);
  assert.match(catalogHtml, /worksheet-grade[^>]*>\(3학년\)<\/small><strong>제곱수<\/strong>/);
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
  assert.match(catalogHtml, /href="\/arithmetic\/grade-2-add-subtract-3"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/group-counting-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/length-measuring-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/multiplication-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/multiplication-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/multiplication-3"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/multiplication-4"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/multiplication-5"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/clock-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-add-subtract"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-add-subtract-blanks"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-complement-subtraction-100"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-complement-subtraction-1000"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-add-subtract-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-division-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-multiplication-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-multiplication-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-length"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-time-1"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-time-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-multiplication-3"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/nineteen-times-table"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/square-numbers"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-division-2"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-division-3"[^>]*data-testid="worksheet-choice"/);
  assert.match(catalogHtml, /href="\/arithmetic\/grade-3-fraction-1"[^>]*data-testid="worksheet-choice"/);
  assert.doesNotMatch(catalogHtml, /2시계①|2시계②/);
  assert.doesNotMatch(catalogHtml, /난이도|연산 종류/);
});

test("renders student and teacher ranking mode entry screens", async () => {
  const studentResponse = await render("/arithmetic/race");
  assert.equal(studentResponse.status, 200);
  const studentHtml = await studentResponse.text();
  assert.match(studentHtml, /학생 입장/);
  assert.match(studentHtml, /방 번호/);
  assert.match(studentHtml, /class="race-teacher-button" href="\/arithmetic\/race\/teacher">교사용 페이지<\/a>/);

  const teacherResponse = await render("/arithmetic/race/teacher");
  assert.equal(teacherResponse.status, 200);
  const teacherHtml = await teacherResponse.text();
  assert.match(teacherHtml, /연산 순위판/);
  assert.match(teacherHtml, /교사 PIN/);
  assert.match(teacherHtml, /방 만들기/);
  assert.match(teacherHtml, /2구구단⑤/);

  const modeSource = await readFile(new URL("../app/arithmetic/page.tsx", import.meta.url), "utf8");
  const raceSource = await readFile(new URL("../app/arithmetic/race/page.tsx", import.meta.url), "utf8");
  assert.match(modeSource, /params\.get\("name"\)/);
  assert.match(modeSource, /localStorage\.setItem\(PLAYER_NAME_KEY, resolvedName\)/);
  assert.match(raceSource, /setName\(resolvedName\)/);
});

test("keeps every race-ready worksheet connected to grading and score reading", async () => {
  const worksheetSource = await readFile(new URL("../lib/arithmetic-worksheets.ts", import.meta.url), "utf8");
  const controllerSource = await readFile(new URL("../app/components/arithmetic-race-controller.tsx", import.meta.url), "utf8");
  const readyRoutesBlock = worksheetSource.match(/const readyRoutes:[\s\S]*?= \{([\s\S]*?)\n\};/)?.[1] ?? "";
  const routes = [...new Set([...readyRoutesBlock.matchAll(/"(\/arithmetic\/[^"?]+)"/g)].map((match) => match[1]))];
  const selectorsBlock = controllerSource.match(/const questionSelectors = \[([\s\S]*?)\n\];/)?.[1] ?? "";
  const selectors = [...selectorsBlock.matchAll(/"(\.[^"]+)"/g)].map((match) => match[1]);

  assert.equal(routes.length, 37);
  assert.ok(selectors.includes(".multiplication-five-question"));
  assert.ok(selectors.includes(".clock-question"));
  assert.ok(selectors.includes(".division-story-problem"));
  assert.ok(selectors.includes(".time-conversion-question"));
  assert.ok(selectors.includes(".time-calculation-question"));

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} 렌더링 실패`);
    const html = await response.text();
    const worksheetStart = html.indexOf("worksheet-stage");
    const answerStart = html.indexOf("answer-stage", worksheetStart + 1);
    const worksheetHtml = html.slice(worksheetStart, answerStart > worksheetStart ? answerStart : undefined);
    const connectedSelectors = selectors.filter((selector) => {
      const className = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`class="[^"]*\\b${className}\\b`).test(worksheetHtml);
    });

    assert.ok(worksheetStart >= 0, `${route} 문제지 영역 누락`);
    assert.match(html, />전체 채점<\/button>/, `${route} 전체 채점 버튼 누락`);
    assert.ok(connectedSelectors.length > 0, `${route} 순위 점수 판독 대상 누락`);
  }
});

test("renders the grade-three three-digit addition and subtraction worksheet", async () => {
  const response = await render("/arithmetic/grade-3-add-subtract");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-add-subtract/page.tsx", import.meta.url), "utf8");
  assert.match(html, /<span>3학년<\/span><strong>덧셈뺄셈/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈 문제지"/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-equation"/g) ?? []).length, 32);
  assert.equal((html.match(/class="vertical-input"/g) ?? []).length, 16);
  assert.equal((html.match(/class="vertical-static-answer"/g) ?? []).length, 16);
  assert.equal((html.match(/maxLength="4"/g) ?? []).length, 16);
  assert.equal((html.match(/<i>\+<\/i>/g) ?? []).length, 16);
  assert.equal((html.match(/<i>−<\/i>/g) ?? []).length, 16);
  assert.match(source, /const OPERATOR_PATTERN = \["\+", "−", "\+", "−", "−", "−", "\+", "−", "\+", "\+", "−", "\+", "−", "\+", "−", "\+"\]/);
  assert.match(source, /integer\(next, 4, 9\) \* 10 \+ integer\(next, 3, 9\)/);
  assert.match(source, /integer\(next, 0, 4\) \* 10 \+ integer\(next, 0, 4\)/);
});

test("renders the first clock worksheet with paired writing and reading answers", async () => {
  const response = await render("/arithmetic/clock-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const source = await readFile(new URL("../app/arithmetic/clock-1/page.tsx", import.meta.url), "utf8");
  assert.match(html, />시계(?: 정답)?<\/strong>/);
  assert.match(html, />새 문제<\/button>/);
  assert.match(html, /aria-label="A4 시계 문제지"/);
  assert.match(html, /aria-label="A4 시계 전체 답지"/);
  assert.equal((html.match(/data-testid="clock-question"/g) ?? []).length, 18);
  assert.equal((html.match(/class="clock-input clock-number-input"/g) ?? []).length, 18);
  assert.equal((html.match(/class="clock-input clock-reading-input"/g) ?? []).length, 9);
  assert.equal((html.match(/class="clock-static-number"/g) ?? []).length, 18);
  assert.equal((html.match(/class="clock-static-reading"/g) ?? []).length, 9);
  assert.doesNotMatch(html, /정답은/);
  assert.match(source, /const MINUTE_STEPS = Array\.from\(\{ length: 60 \}, \(_, index\) => index\)/);
  assert.match(source, /shuffle\(candidates, random\(seed\)\)\.slice\(0, 9\)/);
  assert.match(source, /reading: clockReading\(time\.hour, time\.minute\)/);
  assert.match(css, /\.clock-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.clock-question\.is-correct/);
  assert.match(css, /\.clock-question\.is-wrong/);
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

test("renders the grade-three missing-digit worksheet from the workbook pattern", async () => {
  const response = await render("/arithmetic/grade-3-add-subtract-blanks");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-add-subtract-blanks/page.tsx", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /덧셈뺄셈빈칸/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈빈칸 문제지"/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈빈칸 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-blank-equation"/g) ?? []).length, 24);
  assert.equal((html.match(/class="digit-input"/g) ?? []).length, 36);
  assert.equal((html.match(/class="digit-static-answer"/g) ?? []).length, 36);
  assert.equal((html.match(/maxLength="1"/g) ?? []).length, 36);
  assert.equal((html.match(/<i>\+<\/i>/g) ?? []).length, 12);
  assert.equal((html.match(/<i>−<\/i>/g) ?? []).length, 12);
  assert.match(source, /\["topOnes", "bottomTens", "resultHundreds"\]/);
  assert.match(source, /\["topHundreds", "bottomOnes", "resultTens"\]/);
  assert.match(source, /\["topTens", "bottomHundreds", "resultOnes"\]/);
  assert.match(source, /\["topOnes", "bottomHundreds", "resultTens"\]/);
  assert.match(source, /\["topTens", "bottomOnes", "resultHundreds"\]/);
  assert.match(source, /\["topHundreds", "bottomTens", "resultOnes"\]/);
  assert.match(source, /additionGroup\(0\);[\s\S]*subtractionGroup\(1, false\);[\s\S]*additionGroup\(2\);[\s\S]*subtractionGroup\(3, true\);/);
  assert.match(source, /<small>\/12 정답<\/small>/);
});

test("renders the grade-three complement subtraction to 100 worksheet", async () => {
  const response = await render("/arithmetic/grade-3-complement-subtraction-100");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-complement-subtraction-100/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /보수뺄셈100/);
  assert.match(html, /aria-label="A4 3학년 보수뺄셈100 문제지"/);
  assert.match(html, /aria-label="A4 3학년 보수뺄셈100 전체 답지"/);
  assert.equal((html.match(/data-testid="hundred-complement-row"/g) ?? []).length, 44);
  assert.equal((html.match(/class="complement-input wide"/g) ?? []).length, 22);
  assert.equal((html.match(/class="complement-static-answer wide"/g) ?? []).length, 22);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 22);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 44);
  assert.match(source, /const left = 100;/);
  assert.match(source, /const left = 100 \+ integer\(next, 1, 3\);/);
  assert.match(source, /integer\(next, 2, 7\) \* 10 \+ integer\(next, 1, 9\)/);
  assert.match(source, /<small>\/22 정답<\/small>/);
  assert.match(css, /\.hundred-complement-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /\.hundred-complement-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(11,/);
});

test("renders the grade-three complement subtraction to 1000 worksheet", async () => {
  const response = await render("/arithmetic/grade-3-complement-subtraction-1000");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-complement-subtraction-1000/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /보수뺄셈1000/);
  assert.match(html, /aria-label="A4 3학년 보수뺄셈1000 문제지"/);
  assert.match(html, /aria-label="A4 3학년 보수뺄셈1000 전체 답지"/);
  assert.equal((html.match(/data-testid="thousand-complement-row"/g) ?? []).length, 40);
  assert.equal((html.match(/class="complement-input thousand-wide"/g) ?? []).length, 20);
  assert.equal((html.match(/class="complement-static-answer thousand-wide"/g) ?? []).length, 20);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 20);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 40);
  assert.match(source, /const left = 1000;/);
  assert.match(source, /integer\(next, 13, left - 11\)/);
  assert.match(source, /Array\.from\(\{ length: 10 \}/);
  assert.match(source, /<small>\/20 정답<\/small>/);
  assert.match(css, /\.thousand-complement-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /\.thousand-complement-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(10,/);
});

test("renders the second grade-three addition and subtraction worksheet", async () => {
  const response = await render("/arithmetic/grade-3-add-subtract-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-add-subtract-2/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /덧셈뺄셈②/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈② 문제지"/);
  assert.match(html, /aria-label="A4 3학년 덧셈뺄셈② 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-two-row"/g) ?? []).length, 40);
  assert.equal((html.match(/class="complement-input grade-three-two-wide"/g) ?? []).length, 20);
  assert.equal((html.match(/class="complement-static-answer grade-three-two-wide"/g) ?? []).length, 20);
  assert.equal((html.match(/maxLength="4"/g) ?? []).length, 20);
  assert.equal((html.match(/<span>\+<\/span>/g) ?? []).length, 20);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 20);
  assert.match(source, /const linkedRight = integer\(next, 2, 8\) \* 100;/);
  assert.match(source, /linkedLeft, linkedRight - integer\(next, 1, 2\)/);
  assert.match(source, /integer\(next, 1, 8\) \* 100 \+ integer\(next, 98, 99\)/);
  assert.match(source, /if \(index < 6\)[\s\S]*integer\(next, 5, 9\) \* 100/);
  assert.match(source, /if \(index === 6\)[\s\S]*left - 111/);
  assert.match(source, /integer\(next, 5, 10\) \* 100 \+ 1/);
  assert.match(source, /<small>\/20 정답<\/small>/);
  assert.match(css, /\.grade-three-two-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /\.grade-three-two-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(10,/);
});

test("renders the first grade-three division story worksheet", async () => {
  const response = await render("/arithmetic/grade-3-division-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-division-1/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /나눗셈①/);
  assert.match(html, /aria-label="A4 3학년 나눗셈① 문제지"/);
  assert.match(html, /aria-label="A4 3학년 나눗셈① 전체 답지"/);
  assert.equal((html.match(/data-testid="division-story-problem"/g) ?? []).length, 20);
  assert.equal((html.match(/class="division-answer-input equation"/g) ?? []).length, 10);
  assert.equal((html.match(/class="division-answer-input answer"/g) ?? []).length, 10);
  assert.equal((html.match(/class="division-static-answer equation"/g) ?? []).length, 10);
  assert.equal((html.match(/class="division-static-answer answer"/g) ?? []).length, 10);
  assert.equal((html.match(/<canvas/g) ?? []).length, 10);
  assert.equal((html.match(/class="division-group-diagram"/g) ?? []).length, 10);
  assert.equal((html.match(/maxLength="1"/g) ?? []).length, 20);
  assert.match(source, /const STORY_TYPES:[\s\S]*?quotative[\s\S]*?partitive/);
  assert.match(source, /const divisor = integer\(next, 2, 3\);/);
  assert.match(source, /quotient: 6 \/ divisor/);
  assert.match(source, /problem\.kind === "quotative" \? problem\.quotient : problem\.divisor/);
  assert.match(source, /<small>\/10 정답<\/small>/);
  assert.match(css, /\.division-story-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,[\s\S]*?grid-template-rows:\s*repeat\(5,/);
  assert.match(css, /\.division-story-problem\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.division-story-problem\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
});

test("renders the first grade-three multiplication worksheet", async () => {
  const response = await render("/arithmetic/grade-3-multiplication-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-multiplication-1/page.tsx", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /곱셈①/);
  assert.match(html, /aria-label="A4 3학년 곱셈① 문제지"/);
  assert.match(html, /aria-label="A4 3학년 곱셈① 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-multiplication-equation"/g) ?? []).length, 32);
  assert.equal((html.match(/class="vertical-input"/g) ?? []).length, 16);
  assert.equal((html.match(/class="vertical-static-answer"/g) ?? []).length, 16);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 16);
  assert.equal((html.match(/<i>×<\/i>/g) ?? []).length, 32);
  assert.match(source, /const TOP_RANGES:[^\n]*\[\[77, 99\], \[15, 99\], \[15, 99\], \[77, 99\]\]/);
  assert.match(source, /integer\(next, 2, 9\)/);
  assert.match(source, /result: top \* bottom/);
  assert.match(source, /<small>\/16 정답<\/small>/);
});

test("renders the second grade-three multiplication worksheet", async () => {
  const response = await render("/arithmetic/grade-3-multiplication-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-multiplication-2/page.tsx", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /곱셈②/);
  assert.match(html, /aria-label="A4 3학년 곱셈② 문제지"/);
  assert.match(html, /aria-label="A4 3학년 곱셈② 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-multiplication-two-question"/g) ?? []).length, 44);
  assert.equal((html.match(/class="multiplication-input grade-three-multiplication-two-input"/g) ?? []).length, 22);
  assert.equal((html.match(/class="multiplication-static-answer grade-three-multiplication-two-static-answer"/g) ?? []).length, 22);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 22);
  assert.equal((html.match(/<span>×<\/span>/g) ?? []).length, 44);
  assert.match(source, /Array\.from\(\{ length: 2 \}/);
  assert.match(source, /Array\.from\(\{ length: 11 \}/);
  assert.match(source, /integer\(next, 11, 99\)/);
  assert.match(source, /integer\(next, 2, 9\)/);
  assert.match(source, /product: multiplicand \* multiplier/);
  assert.match(source, /<small>\/22 정답<\/small>/);
});

test("renders the grade-three compound-length worksheet", async () => {
  const response = await render("/arithmetic/grade-3-length");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-length/page.tsx", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /<strong>길이<\/strong>/);
  assert.match(html, /aria-label="A4 3학년 길이 문제지"/);
  assert.match(html, /aria-label="A4 3학년 길이 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-length-question"/g) ?? []).length, 18);
  assert.equal((html.match(/class="length-operation-input"/g) ?? []).length, 9);
  assert.equal((html.match(/class="length-operation-input minor"/g) ?? []).length, 9);
  assert.equal((html.match(/class="length-operation-static"/g) ?? []).length, 9);
  assert.equal((html.match(/class="length-operation-static minor"/g) ?? []).length, 9);
  assert.equal((html.match(/<b>\+<\/b>/g) ?? []).length, 12);
  assert.equal((html.match(/<b>−<\/b>/g) ?? []).length, 6);
  assert.match(source, /base: 1000 \| 100 \| 10/);
  assert.match(source, /integer\(next, 100, 999\)/);
  assert.match(source, /integer\(next, 666, 999\)/);
  assert.match(source, /integer\(next, 5, 9\) \* 10/);
  assert.match(source, /Math\.floor\(total \/ units\.base\)/);
  assert.match(source, /minor: total % units\.base/);
  assert.match(source, /<small>\/9 정답<\/small>/);
});

test("renders the first grade-three time conversion worksheet", async () => {
  const response = await render("/arithmetic/grade-3-time-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-time-1/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /시간①/);
  assert.match(html, /aria-label="A4 3학년 시간① 문제지"/);
  assert.match(html, /aria-label="A4 3학년 시간① 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-time-question"/g) ?? []).length, 24);
  assert.equal((html.match(/class="time-conversion-input"/g) ?? []).length, 12);
  assert.equal((html.match(/class="time-conversion-static"/g) ?? []).length, 12);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 12);
  assert.match(source, /slice\(0, 6\)/);
  assert.match(source, /minimum = index % 2 === 0 \? 1 : 11/);
  assert.match(source, /result: major \* 60 \+ minor/);
  assert.match(source, /majorUnit: "시간"[\s\S]*?answerUnit: "분"/);
  assert.match(source, /majorUnit: "분"[\s\S]*?answerUnit: "초"/);
  assert.match(source, /<small>\/12 정답<\/small>/);
  assert.match(css, /\.time-conversion-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,[\s\S]*?grid-template-rows:\s*repeat\(6,/);
  assert.match(css, /\.time-conversion-question\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.time-conversion-question\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
});

test("renders the second grade-three time calculation worksheet", async () => {
  const response = await render("/arithmetic/grade-3-time-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-time-2/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /시간②/);
  assert.match(html, /aria-label="A4 3학년 시간② 문제지"/);
  assert.match(html, /aria-label="A4 3학년 시간② 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-time-two-question"/g) ?? []).length, 16);
  assert.equal((html.match(/class="time-calculation-input"/g) ?? []).length, 18);
  assert.equal((html.match(/class="time-calculation-static"/g) ?? []).length, 18);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 18);
  assert.match(source, /hoursMinutesAddition/);
  assert.match(source, /hoursMinutesSubtraction/);
  assert.match(source, /minutesSecondsAddition/);
  assert.match(source, /minutesSecondsSubtraction/);
  assert.match(source, /mixedSubtractions/);
  assert.match(source, /Math\.floor\(total \/ 3600\)/);
  assert.match(source, /Math\.floor\(\(total % 3600\) \/ 60\)/);
  assert.match(source, /total % 60/);
  assert.match(source, /<small>\/8 정답<\/small>/);
  assert.match(css, /\.time-calculation-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,[\s\S]*?grid-template-rows:\s*repeat\(4,/);
  assert.match(css, /\.time-calculation-question\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.time-calculation-question\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
});

test("renders the third grade-three multiplication worksheet", async () => {
  const response = await render("/arithmetic/grade-3-multiplication-3");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-multiplication-3/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /곱셈③/);
  assert.match(html, /aria-label="A4 3학년 곱셈③ 문제지"/);
  assert.match(html, /aria-label="A4 3학년 곱셈③ 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-multiplication-three-question"/g) ?? []).length, 32);
  assert.equal((html.match(/class="multiplication-input grade-three-multiplication-three-input"/g) ?? []).length, 16);
  assert.equal((html.match(/class="multiplication-static-answer grade-three-multiplication-three-static-answer"/g) ?? []).length, 16);
  assert.equal((html.match(/maxLength="4"/g) ?? []).length, 16);
  assert.equal((html.match(/<span>×<\/span>/g) ?? []).length, 32);
  assert.match(source, /left: \[666, 999\], right: \[6, 9\]/);
  assert.match(source, /left: \[15, 99\], right: \[15, 99\]/);
  assert.match(source, /left: \[77, 99\], right: \[77, 99\]/);
  assert.match(source, /product: left \* right/);
  assert.match(source, /<small>\/16 정답<\/small>/);
  assert.match(css, /\.grade-three-multiplication-three-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,[\s\S]*?grid-template-rows:\s*repeat\(4,/);
});

test("renders the nineteen-times-table worksheet", async () => {
  const response = await render("/arithmetic/nineteen-times-table");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/nineteen-times-table/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /19단/);
  assert.match(html, /aria-label="A4 19단 문제지"/);
  assert.match(html, /aria-label="A4 19단 전체 답지"/);
  assert.equal((html.match(/data-testid="nineteen-times-question"/g) ?? []).length, 60);
  assert.equal((html.match(/class="multiplication-input nineteen-times-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="multiplication-static-answer nineteen-times-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 30);
  assert.equal((html.match(/<span>×<\/span>/g) ?? []).length, 60);
  assert.match(source, /GROUPED_RIGHT_RANGES: Range\[\] = \[\[11, 13\], \[14, 16\], \[17, 19\]\]/);
  assert.match(source, /\[\[11, 13\], \[14, 15\], \[16, 17\], \[18, 19\]\]/);
  assert.match(source, /if \(index === 28\) left \*= 10/);
  assert.match(source, /if \(index === 29\) right \*= 10/);
  assert.match(source, /const ordered = shuffle\(generated, next\)/);
  assert.match(source, /<small>\/30 정답<\/small>/);
  assert.match(css, /\.nineteen-times-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.nineteen-times-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(10,/);
});

test("renders the square-numbers worksheet", async () => {
  const response = await render("/arithmetic/square-numbers");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/square-numbers/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /제곱수/);
  assert.match(html, /2제곱수:/);
  assert.match(html, /5제곱수:/);
  assert.match(html, /aria-label="A4 제곱수 문제지"/);
  assert.match(html, /aria-label="A4 제곱수 전체 답지"/);
  assert.equal((html.match(/data-testid="square-number-question"/g) ?? []).length, 54);
  assert.equal((html.match(/class="multiplication-input square-number-input"/g) ?? []).length, 27);
  assert.equal((html.match(/class="multiplication-static-answer square-number-static-answer"/g) ?? []).length, 27);
  assert.equal((html.match(/maxLength="4"/g) ?? []).length, 27);
  assert.equal((html.match(/data-testid="square-memory-blank"/g) ?? []).length, 18);
  assert.match(source, /SQUARE_NUMBERS = Array\.from\(\{ length: 9 \}, \(_, index\) => index \+ 11\)/);
  assert.match(source, /\{ left: 8, right: 128 \}/);
  assert.match(source, /\{ left: 4, right: 256 \}/);
  assert.match(source, /firstSquares = shuffle\(SQUARE_NUMBERS, next\)/);
  assert.match(source, /secondSquares = shuffle\(SQUARE_NUMBERS, next\)/);
  assert.match(source, /powerProducts = shuffle\(POWER_PRODUCTS, next\)/);
  assert.match(source, /<small>\/27 정답<\/small>/);
  assert.match(css, /\.square-number-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.square-number-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(9,/);
});

test("renders the second grade-three division worksheet", async () => {
  const response = await render("/arithmetic/grade-3-division-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-division-2/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /나눗셈②/);
  assert.match(html, /aria-label="A4 3학년 나눗셈② 문제지"/);
  assert.match(html, /aria-label="A4 3학년 나눗셈② 전체 답지"/);
  assert.equal((html.match(/data-testid="division-remainder-question"/g) ?? []).length, 50);
  assert.equal((html.match(/class="multiplication-input division-remainder-input"/g) ?? []).length, 25);
  assert.equal((html.match(/class="multiplication-input division-remainder-input division-remainder-input-small"/g) ?? []).length, 25);
  assert.equal((html.match(/class="multiplication-static-answer division-remainder-static"/g) ?? []).length, 25);
  assert.equal((html.match(/class="multiplication-static-answer division-remainder-static division-remainder-static-small"/g) ?? []).length, 25);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 25);
  assert.equal((html.match(/maxLength="1"/g) ?? []).length, 25);
  assert.equal((html.match(/<span>÷<\/span>/g) ?? []).length, 50);
  assert.equal((html.match(/<span>···<\/span>/g) ?? []).length, 50);
  assert.match(source, /Array\.from\(\{ length: 20 \}/);
  assert.match(source, /integer\(next, 11, 99\)/);
  assert.match(source, /shuffle\(\[2, 3, 4, 5, 6, 7, 8, 9\], next\)\.slice\(0, 5\)/);
  assert.match(source, /integer\(next, 101, 999\)/);
  assert.match(source, /quotient: Math\.floor\(dividend \/ divisor\), remainder: dividend % divisor/);
  assert.match(source, /<small>\/25 정답<\/small>/);
  assert.match(css, /\.division-remainder-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.division-remainder-column-large\s*\{[\s\S]*?grid-template-rows:\s*repeat\(5,/);
});

test("renders the third grade-three division worksheet in the workbook's four columns", async () => {
  const response = await render("/arithmetic/grade-3-division-3");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-division-3/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /나눗셈③/);
  assert.match(html, /2, 4단/);
  assert.match(html, /3, 5, 6, 7, 8단/);
  assert.match(html, /순서 섞기/);
  assert.match(html, /aria-label="A4 3학년 나눗셈③ 문제지"/);
  assert.match(html, /aria-label="A4 3학년 나눗셈③ 전체 답지"/);
  assert.equal((html.match(/data-testid="division-three-question"/g) ?? []).length, 232);
  assert.equal((html.match(/class="multiplication-input division-three-input"/g) ?? []).length, 116);
  assert.equal((html.match(/class="multiplication-static-answer division-three-static-answer"/g) ?? []).length, 116);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 116);
  assert.equal((html.match(/<span>÷<\/span>/g) ?? []).length, 232);
  assert.match(source, /const TWO_FACTS = facts\(2, \[98, 96, 94/);
  assert.match(source, /const FOUR_FACTS = facts\(4, \[96, 92, 76, 72, 68, 64/);
  assert.match(source, /quotient: dividend \/ divisor/);
  assert.match(source, /const review = shuffle\(SOURCE_FACTS, next\)/);
  assert.match(source, /review\.slice\(0, 29\)/);
  assert.match(source, /review\.slice\(29\)/);
  assert.match(source, /<small>\/116 정답<\/small>/);
  assert.match(css, /\.division-three-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,/);
  assert.match(css, /\.division-three-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(29,/);
});

test("renders the first grade-three fraction worksheet with stable fraction bars", async () => {
  const response = await render("/arithmetic/grade-3-fraction-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const source = await readFile(new URL("../app/arithmetic/grade-3-fraction-1/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /3학년/);
  assert.match(html, /분수①/);
  assert.match(html, /aria-label="A4 3학년 분수① 문제지"/);
  assert.match(html, /aria-label="A4 3학년 분수① 전체 답지"/);
  assert.equal((html.match(/data-testid="grade-three-fraction-question"/g) ?? []).length, 30);
  assert.equal((html.match(/class="grade-three-fraction-value-input"/g) ?? []).length, 10);
  assert.equal((html.match(/class="grade-three-fraction-part-input"/g) ?? []).length, 10);
  assert.equal((html.match(/grade-three-fraction-static/g) ?? []).length, 15);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 10);
  assert.equal((html.match(/maxLength="1"/g) ?? []).length, 10);
  assert.match(source, /Array\.from\(\{ length: 10 \}/);
  assert.match(source, /const numerator = integer\(next, 1, 8\)/);
  assert.match(source, /const denominator = integer\(next, numerator \+ 1, 9\)/);
  assert.match(source, /whole: unit \* denominator/);
  assert.match(source, /answer: unit \* numerator/);
  assert.match(source, /Array\.from\(\{ length: 5 \}/);
  assert.match(source, /const denominator = integer\(next, numerator \+ 1, 4\)/);
  assert.match(source, /<small>\/15 정답<\/small>/);
  assert.match(css, /\.grade-three-fraction-value-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /\.grade-three-fraction-value-grid\s*\{[\s\S]*?grid-template-rows:\s*repeat\(5,/);
  assert.match(css, /\.grade-three-fraction-line\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*2px;/);
});

test("renders the third grade-two worksheet with mixed missing terms", async () => {
  const response = await render("/arithmetic/grade-2-add-subtract-3");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /2학년/);
  assert.match(html, /덧셈뺄셈③/);
  assert.match(html, /aria-label="A4 덧셈뺄셈③ 문제지"/);
  assert.match(html, /aria-label="A4 덧셈뺄셈③ 전체 답지"/);
  assert.equal((html.match(/class="addsub-equation-row"/g) ?? []).length, 60);
  assert.equal((html.match(/class="addsub-input /g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="3"/g) ?? []).length, 30);
  assert.equal((html.match(/<span>\+<\/span>/g) ?? []).length, 26);
  assert.equal((html.match(/<span>−<\/span>/g) ?? []).length, 34);

  const blankOrder = [...html.matchAll(/aria-label="(grade2-(?:left|middle|right)-\d+ (?:left|right|result)) 답"/g)].map((match) => match[1]);
  assert.deepEqual(blankOrder, [
    "grade2-left-0 result", "grade2-left-1 result", "grade2-left-2 result", "grade2-left-3 result", "grade2-left-4 result",
    "grade2-left-5 result", "grade2-left-6 result", "grade2-left-7 result", "grade2-left-8 result", "grade2-left-9 result",
    "grade2-middle-0 left", "grade2-middle-1 right", "grade2-middle-2 left", "grade2-middle-3 right", "grade2-middle-4 result",
    "grade2-middle-5 right", "grade2-middle-6 left", "grade2-middle-7 right", "grade2-middle-8 result", "grade2-middle-9 right",
    "grade2-right-0 left", "grade2-right-1 left", "grade2-right-2 left", "grade2-right-3 result", "grade2-right-4 left",
    "grade2-right-5 right", "grade2-right-6 result", "grade2-right-7 left", "grade2-right-8 left", "grade2-right-9 right",
  ]);
});

test("renders the grade-two group-counting worksheet with six symbol arrays", async () => {
  const response = await render("/arithmetic/group-counting-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /묶어 세기/);
  assert.match(html, /aria-label="A4 묶어 세기 문제지"/);
  assert.match(html, /aria-label="A4 묶어 세기 전체 답지"/);
  assert.equal((html.match(/data-testid="group-question"/g) ?? []).length, 12);
  assert.equal((html.match(/class="symbol-array"/g) ?? []).length, 12);
  assert.equal((html.match(/class="group-input"/g) ?? []).length, 6);
  assert.equal((html.match(/class="group-static-answer"/g) ?? []).length, 6);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 6);
  assert.match(css, /\.group-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,[\s\S]*?grid-template-rows:\s*repeat\(3,/);
  assert.match(css, /\.group-question\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.group-question\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
  assert.deepEqual([...html.matchAll(/aria-label="(group-\d+) 답"/g)].map((match) => match[1]), [
    "group-0", "group-1", "group-2", "group-3", "group-4", "group-5",
  ]);
});

test("renders the grade-two length-measuring worksheet with eight physical lines", async () => {
  const response = await render("/arithmetic/length-measuring-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /길이 재기/);
  assert.match(html, /어림하기/);
  assert.match(html, /자로 재기/);
  assert.match(html, /aria-label="A4 길이 재기 문제지"/);
  assert.match(html, /aria-label="A4 길이 재기 전체 답지"/);
  assert.equal((html.match(/data-testid="length-question"/g) ?? []).length, 16);
  assert.equal((html.match(/class="length-input length-estimate-input"/g) ?? []).length, 8);
  assert.equal((html.match(/class="length-input length-measured-input"/g) ?? []).length, 8);
  assert.equal((html.match(/class="length-static-answer"/g) ?? []).length, 8);
  assert.equal((html.match(/class="measure-line"/g) ?? []).length, 16);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 16);
  assert.match(css, /\.length-list\s*\{[\s\S]*?grid-template-rows:\s*repeat\(8,/);
  assert.match(css, /\.length-question\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.length-question\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);
});

test("renders the first multiplication worksheet with the workbook blank pattern", async () => {
  const response = await render("/arithmetic/multiplication-1");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /구구단 ①/);
  assert.match(html, /aria-label="A4 구구단 ① 문제지"/);
  assert.match(html, /aria-label="A4 구구단 ① 전체 답지"/);
  assert.equal((html.match(/data-testid="multiplication-question"/g) ?? []).length, 60);
  assert.equal((html.match(/class="multiplication-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="multiplication-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.equal((html.match(/<span>×<\/span>/g) ?? []).length, 60);
  assert.match(css, /\.multiplication-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(css, /\.multiplication-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(10,/);
  assert.match(css, /\.multiplication-question\.is-correct[\s\S]*?background:\s*var\(--green-soft\)/);
  assert.match(css, /\.multiplication-question\.is-wrong[\s\S]*?background:\s*var\(--red-soft\)/);

  assert.deepEqual([...html.matchAll(/aria-label="(multiplication-\d+-\d+) 답"/g)].map((match) => match[1]), [
    "multiplication-0-0", "multiplication-0-1", "multiplication-0-2", "multiplication-0-3", "multiplication-0-4",
    "multiplication-0-5", "multiplication-0-6", "multiplication-0-7", "multiplication-0-8", "multiplication-0-9",
    "multiplication-1-0", "multiplication-1-1", "multiplication-1-2", "multiplication-1-3", "multiplication-1-4",
    "multiplication-1-5", "multiplication-1-6", "multiplication-1-7", "multiplication-1-8", "multiplication-1-9",
    "multiplication-2-0", "multiplication-2-1", "multiplication-2-2", "multiplication-2-3", "multiplication-2-4",
    "multiplication-2-5", "multiplication-2-6", "multiplication-2-7", "multiplication-2-8", "multiplication-2-9",
  ]);
});

test("renders the second multiplication worksheet with three and four times tables", async () => {
  const response = await render("/arithmetic/multiplication-2");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /구구단 ②/);
  assert.match(html, /aria-label="A4 구구단 ② 문제지"/);
  assert.match(html, /aria-label="A4 구구단 ② 전체 답지"/);
  assert.equal((html.match(/data-testid="multiplication-question"/g) ?? []).length, 60);
  assert.equal((html.match(/class="multiplication-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="multiplication-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.deepEqual([...html.matchAll(/aria-label="(multiplication-two-\d+-\d+) 답"/g)].map((match) => match[1]), [
    "multiplication-two-0-0", "multiplication-two-0-1", "multiplication-two-0-2", "multiplication-two-0-3", "multiplication-two-0-4",
    "multiplication-two-0-5", "multiplication-two-0-6", "multiplication-two-0-7", "multiplication-two-0-8", "multiplication-two-0-9",
    "multiplication-two-1-0", "multiplication-two-1-1", "multiplication-two-1-2", "multiplication-two-1-3", "multiplication-two-1-4",
    "multiplication-two-1-5", "multiplication-two-1-6", "multiplication-two-1-7", "multiplication-two-1-8", "multiplication-two-1-9",
    "multiplication-two-2-0", "multiplication-two-2-1", "multiplication-two-2-2", "multiplication-two-2-3", "multiplication-two-2-4",
    "multiplication-two-2-5", "multiplication-two-2-6", "multiplication-two-2-7", "multiplication-two-2-8", "multiplication-two-2-9",
  ]);
});

test("renders the third multiplication worksheet with six and seven times tables", async () => {
  const response = await render("/arithmetic/multiplication-3");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /구구단 ③/);
  assert.match(html, /aria-label="A4 구구단 ③ 문제지"/);
  assert.match(html, /aria-label="A4 구구단 ③ 전체 답지"/);
  assert.equal((html.match(/data-testid="multiplication-question"/g) ?? []).length, 60);
  assert.equal((html.match(/class="multiplication-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="multiplication-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.deepEqual([...html.matchAll(/aria-label="(multiplication-three-\d+-\d+) 답"/g)].map((match) => match[1]), [
    "multiplication-three-0-0", "multiplication-three-0-1", "multiplication-three-0-2", "multiplication-three-0-3", "multiplication-three-0-4",
    "multiplication-three-0-5", "multiplication-three-0-6", "multiplication-three-0-7", "multiplication-three-0-8", "multiplication-three-0-9",
    "multiplication-three-1-0", "multiplication-three-1-1", "multiplication-three-1-2", "multiplication-three-1-3", "multiplication-three-1-4",
    "multiplication-three-1-5", "multiplication-three-1-6", "multiplication-three-1-7", "multiplication-three-1-8", "multiplication-three-1-9",
    "multiplication-three-2-0", "multiplication-three-2-1", "multiplication-three-2-2", "multiplication-three-2-3", "multiplication-three-2-4",
    "multiplication-three-2-5", "multiplication-three-2-6", "multiplication-three-2-7", "multiplication-three-2-8", "multiplication-three-2-9",
  ]);
});

test("renders the fourth multiplication worksheet with eight and nine times tables", async () => {
  const response = await render("/arithmetic/multiplication-4");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /구구단 ④/);
  assert.match(html, /aria-label="A4 구구단 ④ 문제지"/);
  assert.match(html, /aria-label="A4 구구단 ④ 전체 답지"/);
  assert.equal((html.match(/data-testid="multiplication-question"/g) ?? []).length, 60);
  assert.equal((html.match(/class="multiplication-input"/g) ?? []).length, 30);
  assert.equal((html.match(/class="multiplication-static-answer"/g) ?? []).length, 30);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 30);
  assert.deepEqual([...html.matchAll(/aria-label="(multiplication-four-\d+-\d+) 답"/g)].map((match) => match[1]), [
    "multiplication-four-0-0", "multiplication-four-0-1", "multiplication-four-0-2", "multiplication-four-0-3", "multiplication-four-0-4",
    "multiplication-four-0-5", "multiplication-four-0-6", "multiplication-four-0-7", "multiplication-four-0-8", "multiplication-four-0-9",
    "multiplication-four-1-0", "multiplication-four-1-1", "multiplication-four-1-2", "multiplication-four-1-3", "multiplication-four-1-4",
    "multiplication-four-1-5", "multiplication-four-1-6", "multiplication-four-1-7", "multiplication-four-1-8", "multiplication-four-1-9",
    "multiplication-four-2-0", "multiplication-four-2-1", "multiplication-four-2-2", "multiplication-four-2-3", "multiplication-four-2-4",
    "multiplication-four-2-5", "multiplication-four-2-6", "multiplication-four-2-7", "multiplication-four-2-8", "multiplication-four-2-9",
  ]);
});

test("renders the fifth multiplication worksheet as the workbook's five-by-twenty review", async () => {
  const response = await render("/arithmetic/multiplication-5");
  assert.equal(response.status, 200);

  const html = await response.text();
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(html, /구구단 ⑤/);
  assert.match(html, /aria-label="A4 구구단 ⑤ 문제지"/);
  assert.match(html, /aria-label="A4 구구단 ⑤ 전체 답지"/);
  assert.equal((html.match(/data-testid="multiplication-five-question"/g) ?? []).length, 200);
  assert.equal((html.match(/multiplication-five-input/g) ?? []).length, 100);
  assert.equal((html.match(/multiplication-five-static-answer/g) ?? []).length, 100);
  assert.equal((html.match(/maxLength="2"/g) ?? []).length, 100);
  assert.equal((html.match(/aria-label="multiplication-five-\d+-\d+ 답"/g) ?? []).length, 100);
  assert.equal((html.match(/<span>0<\/span><span>×<\/span><strong>8<\/strong><span>=<\/span>/g) ?? []).length, 2);
  assert.equal((html.match(/<span>6<\/span><span>×<\/span><strong>1<\/strong><span>=<\/span>/g) ?? []).length, 4);
  assert.equal((html.match(/<span>9<\/span><span>×<\/span><strong>9<\/strong><span>=<\/span>/g) ?? []).length, 4);
  assert.match(css, /\.multiplication-five-columns\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,/);
  assert.match(css, /\.multiplication-five-column\s*\{[\s\S]*?grid-template-rows:\s*repeat\(20,/);
  assert.ok(css.indexOf(".multiplication-five-columns") > css.indexOf(".multiplication-columns"));
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

test("uses arrived-only mistake-first ranking with correction attempts", async () => {
  const routeSource = await readFile(new URL("../app/api/arithmetic-race/route.ts", import.meta.url), "utf8");
  const controllerSource = await readFile(new URL("../app/components/arithmetic-race-controller.tsx", import.meta.url), "utf8");
  const rankingSource = await readFile(new URL("../lib/arithmetic-race-ranking.ts", import.meta.url), "utf8");
  const teacherSource = await readFile(new URL("../app/arithmetic/race/teacher/page.tsx", import.meta.url), "utf8");
  const schemaSource = await readFile(new URL("../db/schema.ts", import.meta.url), "utf8");
  const migrationSource = await readFile(new URL("../drizzle/0001_youthful_king_cobra.sql", import.meta.url), "utf8");
  const hosting = JSON.parse(await readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"));

  assert.equal(hosting.d1, "DB");
  assert.match(rankingSource, /row\.submitted_at !== null && row\.total_count !== null && row\.correct_count === row\.total_count/);
  assert.match(rankingSource, /Number\(a\.mistake_count\)[\s\S]*?- \(Number\(b\.mistake_count\)/);
  assert.match(rankingSource, /Number\(a\.submitted_at\)[\s\S]*?- \(Number\(b\.submitted_at\)/);
  assert.match(routeSource, /const completed = wrongCount === 0/);
  assert.match(routeSource, /mistake_count = CASE WHEN total_count IS NULL THEN \? ELSE mistake_count END/);
  assert.match(routeSource, /rank: completed \? ranking\.find/);
  assert.match(routeSource, /ARITHMETIC_TEACHER_PIN/);
  assert.doesNotMatch(routeSource, /2468/);
  assert.doesNotMatch(controllerSource, /최종 제출 후에는 답을 고칠 수 없습니다/);
  assert.match(controllerSource, /if \(!result\.completed\) setAttemptMessage/);
  assert.match(controllerSource, /채점·도착/);
  assert.match(controllerSource, /\.worksheet-stage/);
  assert.match(teacherSource, /전부 맞힌 학생만 · 오답이 적은 순 · 같으면 도착 시간/);
  assert.match(teacherSource, /오답 \{participant\.mistakeCount\}개/);
  assert.match(teacherSource, /<h3>미도착<\/h3>/);
  assert.match(schemaSource, /mistakeCount: integer\("mistake_count"\)\.notNull\(\)\.default\(0\)/);
  assert.match(migrationSource, /ADD `mistake_count` integer DEFAULT 0 NOT NULL/);
});
