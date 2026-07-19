"use strict";

const fs = require("node:fs");

const files = process.argv.slice(2);
if (!files.length) {
    throw new Error("HTML file paths are required.");
}

for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const inlineScripts = html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
    let count = 0;

    for (const script of inlineScripts) {
        Function(script[1]);
        count += 1;
    }

    console.log(`${file}: ${count} inline script(s) ok`);
}
