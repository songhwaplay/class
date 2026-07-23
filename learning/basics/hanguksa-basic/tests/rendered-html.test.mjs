import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const appRoot = new URL("../app/", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/hanguksa", {
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

test("server-renders the Korean-history study app at its portal path", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /lang="ko"/);
  assert.match(html, /site-shell home-shell/);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps the app integrated under the portal's hanguksa route", async () => {
  const [page, studyApp, layout, nextConfig] = await Promise.all([
    readFile(new URL("page.tsx", appRoot), "utf8"),
    readFile(new URL("StudyApp.tsx", appRoot), "utf8"),
    readFile(new URL("layout.tsx", appRoot), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<StudyApp\s*\/>/);
  assert.match(studyApp, /className="site-shell home-shell"/);
  assert.match(studyApp, /questionsData/);
  assert.match(studyApp, /classPlayerName/);
  assert.match(layout, /<html lang="ko">/);
  assert.match(layout, /generateMetadata/);
  assert.match(nextConfig, /basePath:\s*"\/hanguksa"/);

  await assert.rejects(access(new URL("_sites-preview", appRoot)));
});
