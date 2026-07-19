(() => {
    "use strict";

    const currentScript = document.currentScript;
    if (!document.querySelector('link[data-class-finisher-style]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.dataset.classFinisherStyle = "true";
        stylesheet.href = currentScript
            ? new URL("finisher-board.css", currentScript.src).href
            : "../../assets/network/finisher-board.css";
        document.head.appendChild(stylesheet);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function recordsHtml(records) {
        if (!Array.isArray(records) || records.length === 0) {
            return '<div class="finisher-empty">아직 오늘의 클리어 기록이 없습니다.</div>';
        }
        return records.map(record => `
            <div class="finisher-row">
                <span class="finisher-time">${escapeHtml(record.time || "--:--")}</span>
                <span class="finisher-name">${escapeHtml(record.name)}</span>
                <span class="finisher-difficulty">${escapeHtml(record.difficulty)}</span>
            </div>
        `).join("");
    }

    function create({ gameId, getPlayerName, isValidPlayerName }) {
        if (!gameId) throw new Error("FINISHER_GAME_ID_REQUIRED");

        function targetFor(targetId) {
            return document.getElementById(targetId);
        }

        function showMessage(targetId, message) {
            const target = targetFor(targetId);
            if (target) target.innerHTML = `<div class="finisher-empty">${escapeHtml(message)}</div>`;
        }

        function render(targetId, records) {
            const target = targetFor(targetId);
            if (target) target.innerHTML = recordsHtml(records);
        }

        async function load(targetId = "today-finishers-list") {
            showMessage(targetId, "명단을 불러오는 중...");
            try {
                const data = await window.ClassroomFinishers.list(gameId);
                const records = data.records || [];
                render(targetId, records);
                return records;
            } catch (_) {
                showMessage(targetId, "명단 서버에 연결하지 못했습니다.");
                return [];
            }
        }

        async function register({ difficulty, rank, targetId = "result-finishers-list" }) {
            const name = String(getPlayerName?.() || "").trim();
            if (isValidPlayerName && !isValidPlayerName(name)) return load(targetId);

            showMessage(targetId, "기록을 등록하는 중...");
            try {
                const data = await window.ClassroomFinishers.save({ gameId, name, difficulty, rank });
                const records = data.records || [];
                render(targetId, records);
                render("today-finishers-list", records);
                return records;
            } catch (_) {
                showMessage(targetId, "기록 서버에 연결하지 못했지만 게임 클리어는 인정됩니다.");
                return [];
            }
        }

        return Object.freeze({ load, register, render });
    }

    window.ClassroomFinisherBoard = Object.freeze({ create });
})();
