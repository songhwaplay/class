const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = 18765;
const serverPath = path.join(__dirname, "..", "game-hub-server", "server.js");
const child = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    PORT: String(port),
    DATABASE_URL: "",
    GOOGLE_CLIENT_ID: "",
    TEACHER_EMAILS: "",
    ADMIN_EMAILS: ""
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let stderr = "";
child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start. ${stderr}`);
}

(async () => {
  try {
    await waitForServer();
    const rootResponse = await fetch(`http://127.0.0.1:${port}/`);
    const rootHtml = await rootResponse.text();
    assert.equal(rootResponse.status, 200);
    assert.match(rootHtml, /id="googleSignInButton"/);

    const configResponse = await fetch(`http://127.0.0.1:${port}/api/auth/config`);
    const config = await configResponse.json();
    assert.equal(config.enabled, false);
    assert.ok(config.missing.includes("DATABASE_URL"));
    assert.ok(config.missing.includes("GOOGLE_CLIENT_ID"));
    assert.equal(config.adminConfigured, false);
    console.log("Classroom server smoke: OK");
  } finally {
    child.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
