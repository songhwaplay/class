"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.join(__dirname, "..");
const serverRoot = path.join(root, "game-hub-server");
const port = 24500 + Math.floor(Math.random() * 500);

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server startup timed out.")), 8000);
    let errors = "";
    child.stderr.on("data", (chunk) => { errors += chunk.toString(); });
    child.stdout.on("data", (chunk) => {
      if (!chunk.toString().includes("listening on port")) return;
      clearTimeout(timer);
      resolve();
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited early (${code}). ${errors}`));
    });
  });
}

async function run() {
  const child = spawn(process.execPath, [path.join(serverRoot, "server.js")], {
    cwd: serverRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "test",
      DATABASE_URL: "",
      GOOGLE_CLIENT_ID: ""
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(child);
    const base = `http://127.0.0.1:${port}`;
    const [page, script, style, pilotPage, pilotScript, studentPage, studentScript, config] = await Promise.all([
      fetch(`${base}/admin/reading/`),
      fetch(`${base}/admin/reading/app.js`),
      fetch(`${base}/admin/reading/style.css`),
      fetch(`${base}/admin/reading/pilots.html`),
      fetch(`${base}/admin/reading/pilots.js`),
      fetch(`${base}/learning/reading/`),
      fetch(`${base}/learning/reading/app.js`),
      fetch(`${base}/api/auth/config`)
    ]);
    assert.equal(page.status, 200);
    assert.equal(script.status, 200);
    assert.equal(style.status, 200);
    assert.equal(pilotPage.status, 200);
    assert.equal(pilotScript.status, 200);
    assert.equal(studentPage.status, 200);
    assert.equal(studentScript.status, 200);
    assert.equal(config.status, 200);
    assert.match(await page.text(), /독해 문제 제작실/);
    assert.match(await script.text(), /\/api\/reading\/admin\/items/);
    assert.match(await style.text(), /\.workbench/);
    assert.match(await pilotPage.text(), /실전 응답 수집/);
    assert.match(await pilotScript.text(), /\/api\/reading\/admin\/pilots/);
    assert.match(await studentPage.text(), /차분히 읽고, 하나씩/);
    assert.match(await studentScript.text(), /\/api\/reading\/student\/pilots/);
    const configuration = await config.json();
    assert.equal(configuration.enabled, false);
    console.log("Reading admin route smoke: OK");
  } finally {
    child.kill();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
