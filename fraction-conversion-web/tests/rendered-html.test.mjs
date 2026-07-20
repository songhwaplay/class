import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>분수 변환 훈련실<\/title>/);
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
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /result\.correct \? "맞음" : "틀림"/);
  assert.doesNotMatch(pageSource, /function Explanation|풀이 보기|풀이 닫기|result\.message|explain-button/);
});

test("downloads printable PDFs without relying on the native print dialog", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /import\("html2canvas"\)/);
  assert.match(pageSource, /import\("jspdf"\)/);
  assert.match(pageSource, /문제지만 PDF/);
  assert.match(pageSource, /답지만 PDF/);
  assert.match(pageSource, /문제지\+답지 PDF/);
  assert.doesNotMatch(pageSource, /window\.print\(\)/);
});
