(() => {
    "use strict";

    const map = document.getElementById("anatomyMap");
    const layer = map?.querySelector(".anatomy-layer");
    if (!map || !layer) return;

    const viewButtons = [...map.querySelectorAll("[data-atlas-view]")];
    const layerButtons = [...map.querySelectorAll("[data-atlas-layer]")];
    const cameraButtons = [...map.querySelectorAll("[data-atlas-camera]")];
    const freeExploreButton = map.querySelector("[data-atlas-mode='explore']");
    const hint = map.querySelector(".atlas-3d-hint");
    const feedback = document.getElementById("explorerFeedback");
    const feedbackTitle = document.getElementById("explorerFeedbackTitle");
    const feedbackText = document.getElementById("explorerFeedbackText");
    const state = { rotateX: -2, rotateY: 0, zoom: 1, dragging: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 };
    const focusScale = { body: 1.03, heart: 1.02, lung: 1.03 };
    const anatomyNotes = {
        "body-return": { title: "대정맥 · VENA CAVA", text: "온몸을 돌고 산소가 적어진 혈액을 심장의 우심방으로 되돌려 보내는 가장 큰 정맥입니다." },
        "right-atrium": { title: "우심방 · RIGHT ATRIUM", text: "대정맥에서 돌아온 혈액을 가장 먼저 받아 우심실 쪽으로 보내는 심장의 방입니다." },
        tricuspid: { title: "삼첨판 · TRICUSPID VALVE", text: "우심방과 우심실 사이에서 열리고 닫히며 혈액이 뒤로 흐르는 것을 막습니다." },
        "pulmonary-artery": { title: "폐동맥 · PULMONARY ARTERY", text: "우심실에서 나온 산소가 적은 혈액을 폐로 운반합니다. 동맥이지만 산소가 적은 혈액이 흐릅니다." },
        alveoli: { title: "폐포 · ALVEOLI", text: "포도송이처럼 모인 작은 공기주머니입니다. 산소는 혈액으로, 이산화탄소는 폐포 안으로 이동합니다." },
        "pulmonary-vein": { title: "폐정맥 · PULMONARY VEIN", text: "폐에서 산소를 얻은 혈액을 좌심방으로 운반합니다. 정맥이지만 산소가 풍부한 혈액이 흐릅니다." },
        mitral: { title: "이첨판 · MITRAL VALVE", text: "좌심방과 좌심실 사이의 판막으로, 강하게 수축할 때도 혈액의 역류를 막습니다." },
        "left-ventricle": { title: "좌심실 · LEFT VENTRICLE", text: "두꺼운 근육으로 강하게 수축해 산소가 풍부한 혈액을 대동맥과 온몸으로 밀어냅니다." },
        aorta: { title: "대동맥 · AORTA", text: "좌심실에서 나온 혈액이 온몸으로 퍼져 나갈 때 가장 먼저 지나는 우리 몸의 가장 큰 동맥입니다." },
        "tissue-exchange": { title: "모세혈관 · CAPILLARY BED", text: "가느다란 벽을 사이에 두고 세포에 산소와 영양소를 주며 이산화탄소와 노폐물을 받아옵니다." }
    };
    let savedFeedback = null;

    map.dataset.layerSkin = "true";
    map.dataset.layerOrgans = "true";
    map.dataset.layerVessels = "true";
    map.classList.add("atlas-3d-ready");

    function applyCamera() {
        const focus = map.dataset.focus || "body";
        const scale = (focusScale[focus] || 1) * state.zoom;
        layer.style.setProperty("--atlas-rotate-x", `${state.rotateX}deg`);
        layer.style.setProperty("--atlas-rotate-y", `${state.rotateY}deg`);
        layer.style.setProperty("--atlas-scale", scale.toFixed(3));
        map.style.setProperty("--atlas-light-x", `${50 + state.rotateY * .9}%`);
        map.style.setProperty("--atlas-shadow-x", `${state.rotateY * -.45}px`);
        map.dataset.cameraMoved = String(Math.abs(state.rotateY) > 2 || Math.abs(state.rotateX + 2) > 2 || Math.abs(state.zoom - 1) > .02);
    }

    function syncViewButtons() {
        const focus = map.dataset.focus || "body";
        viewButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.atlasView === focus)));
        applyCamera();
    }

    function showExploreOverview() {
        if (!feedbackTitle || !feedbackText) return;
        const focus = map.dataset.focus || "body";
        const overview = {
            body: ["전신 순환계 자유 탐험", "피부와 혈관 레이어를 분리하고 대정맥·대동맥·모세혈관을 눌러 기능을 확인하세요."],
            heart: ["심장 절개 자유 탐험", "네 개의 방과 판막, 심장에 연결된 큰 혈관을 눌러 혈액이 한 방향으로 흐르는 원리를 살펴보세요."],
            lung: ["폐와 기체교환 자유 탐험", "폐동맥·폐포·폐정맥을 눌러 산소와 이산화탄소가 이동하는 방향을 비교하세요."]
        }[focus];
        feedback.dataset.state = "explore";
        feedbackTitle.textContent = overview[0];
        feedbackText.textContent = overview[1];
    }

    function setFreeExplore(active) {
        const next = Boolean(active);
        map.classList.toggle("is-free-explore", next);
        freeExploreButton?.setAttribute("aria-pressed", String(next));
        document.getElementById("anatomyExplorer")?.classList.toggle("free-explore-active", next);
        map.querySelectorAll(".anatomy-hotspot").forEach((button) => button.classList.remove("is-inspected"));

        if (next) {
            if (!savedFeedback && feedbackTitle && feedbackText && feedback) {
                savedFeedback = {
                    title: feedbackTitle.textContent,
                    text: feedbackText.textContent,
                    state: feedback.dataset.state
                };
            }
            showExploreOverview();
            announce("자유 해부 탐험을 시작했습니다. 구조를 눌러 기능을 확인하세요.");
            return;
        }

        if (savedFeedback && feedbackTitle && feedbackText && feedback) {
            feedbackTitle.textContent = savedFeedback.title;
            feedbackText.textContent = savedFeedback.text;
            feedback.dataset.state = savedFeedback.state;
        }
        savedFeedback = null;
        announce("혈액순환 경로 탐험으로 돌아왔습니다.");
    }

    function announce(message) {
        const announcer = document.getElementById("announcer");
        if (announcer) announcer.textContent = message;
    }

    function resetCamera(announceChange = true) {
        state.rotateX = -2;
        state.rotateY = 0;
        state.zoom = 1;
        applyCamera();
        if (announceChange) announce("3D 해부 보기의 회전과 확대를 초기화했습니다.");
    }

    viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
            map.dataset.focus = button.dataset.atlasView;
            syncViewButtons();
            if (map.classList.contains("is-free-explore")) showExploreOverview();
            announce(`${button.textContent.trim()} 해부 보기로 전환했습니다.`);
        });
    });

    freeExploreButton?.addEventListener("click", () => {
        setFreeExplore(!map.classList.contains("is-free-explore"));
    });

    layerButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const layerName = button.dataset.atlasLayer;
            const key = `layer${layerName[0].toUpperCase()}${layerName.slice(1)}`;
            const next = map.dataset[key] !== "false" ? "false" : "true";
            map.dataset[key] = next;
            button.setAttribute("aria-pressed", next);
            announce(`${button.textContent.trim()} 레이어를 ${next === "true" ? "표시" : "숨김"}했습니다.`);
        });
    });

    cameraButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.dataset.atlasCamera;
            if (action === "reset") {
                resetCamera();
                return;
            }
            state.zoom = Math.max(.82, Math.min(1.28, state.zoom + (action === "zoom-in" ? .08 : -.08)));
            applyCamera();
            announce(`해부 보기를 ${action === "zoom-in" ? "확대" : "축소"}했습니다.`);
        });
    });

    map.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) return;
        state.dragging = true;
        state.moved = false;
        state.startX = event.clientX;
        state.startY = event.clientY;
        state.originX = state.rotateX;
        state.originY = state.rotateY;
        map.classList.add("is-rotating");
        map.setPointerCapture?.(event.pointerId);
    });

    map.addEventListener("pointermove", (event) => {
        if (!state.dragging) return;
        const deltaX = event.clientX - state.startX;
        const deltaY = event.clientY - state.startY;
        if (Math.abs(deltaX) + Math.abs(deltaY) > 5) state.moved = true;
        state.rotateY = Math.max(-28, Math.min(28, state.originY + deltaX * .16));
        state.rotateX = Math.max(-14, Math.min(12, state.originX - deltaY * .12));
        applyCamera();
        if (state.moved) hint?.classList.add("is-used");
    });

    function stopRotation(event) {
        if (!state.dragging) return;
        state.dragging = false;
        map.classList.remove("is-rotating");
        map.releasePointerCapture?.(event.pointerId);
    }

    map.addEventListener("pointerup", stopRotation);
    map.addEventListener("pointercancel", stopRotation);

    map.addEventListener("click", (event) => {
        if (!map.classList.contains("is-free-explore")) return;
        const hotspot = event.target.closest(".anatomy-hotspot");
        if (!hotspot) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const note = anatomyNotes[hotspot.dataset.target];
        if (!note || !feedbackTitle || !feedbackText || !feedback) return;
        map.querySelectorAll(".anatomy-hotspot").forEach((button) => button.classList.toggle("is-inspected", button === hotspot));
        feedback.dataset.state = "explore";
        feedbackTitle.textContent = note.title;
        feedbackText.textContent = note.text;
        announce(`${note.title}. ${note.text}`);
    }, true);

    map.addEventListener("wheel", (event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        state.zoom = Math.max(.82, Math.min(1.28, state.zoom + (event.deltaY < 0 ? .05 : -.05)));
        applyCamera();
    }, { passive: false });

    new MutationObserver(syncViewButtons).observe(map, { attributes: true, attributeFilter: ["data-focus"] });
    syncViewButtons();
})();
