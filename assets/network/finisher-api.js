(() => {
    "use strict";

    const API_URL = `${window.ClassroomNetwork?.HTTP_URL || window.location.origin}/api/finishers`;

    async function request(url, options) {
        await window.ClassroomNetwork?.wakeServer?.();
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error(`HTTP_${response.status}`);
                window.ClassroomNetwork?.hideStatus?.();
                return await response.json();
            } catch (error) {
                lastError = error;
                if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 700));
            }
        }
        window.ClassroomNetwork?.showStatus?.(
            "RECORD SERVER ERROR",
            "완주 기록 서버에 연결하지 못했습니다. 게임 결과는 정상적으로 인정됩니다.",
            true
        );
        throw lastError || new Error("FINISHER_API_FAILED");
    }

    async function list(gameId) {
        return request(`${API_URL}?gameId=${encodeURIComponent(gameId)}`, { cache: "no-store" });
    }

    async function save({ gameId, name, difficulty, rank }) {
        return request(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId, name, difficulty, rank })
        });
    }

    window.ClassroomFinishers = Object.freeze({ list, save });
})();
