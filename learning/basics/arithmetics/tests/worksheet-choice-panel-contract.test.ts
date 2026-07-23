import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

function tsxFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return tsxFiles(target);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [target] : [];
  });
}

test("공통 객관식 패널을 여는 모든 화면이 패널 채점 함수를 전달한다", () => {
  const root = path.join(process.cwd(), "app", "arithmetic", "high-school");
  const missing = tsxFiles(root).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const calls = source.match(/<WorksheetChoicePanel\b[\s\S]*?\/>/g) ?? [];
    return calls.some((call) => !/\bonGrade=/.test(call))
      ? [path.relative(process.cwd(), file)]
      : [];
  });
  assert.deepEqual(missing, []);
});

test("공통 객관식 패널은 선택 상태와 패널 내부 채점 버튼을 제공한다", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "app", "arithmetic", "high-school", "components", "worksheet-choice-panel.tsx"),
    "utf8",
  );
  assert.match(source, /aria-pressed=/);
  assert.match(source, /onClick=\{onGrade\}/);
  assert.match(source, />전체 채점<\/button>/);
});
