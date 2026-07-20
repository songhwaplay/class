"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 8765;
const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".mp3": "audio/mpeg",
    ".png": "image/png"
};

http.createServer((request, response) => {
    const requestPath = decodeURIComponent(String(request.url || "/").split("?")[0]);
    const relative = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
    const filePath = path.resolve(root, `.${relative}`);

    if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stat) => {
        if (statError || !stat.isFile()) {
            response.writeHead(404).end("Not found");
            return;
        }
        response.setHeader("Content-Type", mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream");
        fs.createReadStream(filePath).pipe(response);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`Static preview: http://127.0.0.1:${port}/`);
});
