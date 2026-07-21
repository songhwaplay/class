(() => {
    "use strict";

    const LEVEL_KEY = "classMusicVolumeLevel";
    const MUTED_KEY = "classMusicMuted";
    const DEFAULT_LEVEL = 3;
    const currentScript = document.currentScript;
    if (!window.ClassGameSfx && !document.querySelector("script[data-class-game-sfx]")) {
        const sfxScript = document.createElement("script");
        sfxScript.dataset.classGameSfx = "true";
        sfxScript.src = currentScript
            ? new URL("game-sfx.js", currentScript.src).href
            : "../../assets/sound/game-sfx.js";
        document.head.appendChild(sfxScript);
    }

    const audio = document.getElementById("bgm");
    if (!audio) return;

    if (!document.querySelector('link[data-class-music-style]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.dataset.classMusicStyle = "true";
        stylesheet.href = currentScript
            ? new URL("music-control.css", currentScript.src).href
            : "../../assets/sound/music-control.css";
        document.head.appendChild(stylesheet);
    }

    const savedLevel = Number(localStorage.getItem(LEVEL_KEY));
    let level = Number.isInteger(savedLevel) && savedLevel >= 1 && savedLevel <= 5
        ? savedLevel
        : DEFAULT_LEVEL;
    let muted = localStorage.getItem(MUTED_KEY) === "1";
    let applyingAudioState = false;
    let playbackUnlocked = false;

    const control = document.createElement("div");
    control.className = "unified-music-control";
    control.setAttribute("role", "group");
    control.setAttribute("aria-label", "Music volume controls");
    control.innerHTML = `
        <span class="unified-music-label">MUSIC VOLUME:</span>
        <button class="unified-music-mute" type="button">MUTE</button>
        <div class="unified-music-levels" role="group" aria-label="Music volume level">
            ${[1, 2, 3, 4, 5].map(value => `<button class="unified-music-segment" type="button" data-class-music-level="${value}" aria-label="Music volume ${value}"></button>`).join("")}
        </div>`;
    document.body.appendChild(control);
    document.body.classList.add("class-music-ready");

    const muteButton = control.querySelector(".unified-music-mute");
    const levelButtons = [...control.querySelectorAll("[data-class-music-level]")];

    function storeState() {
        localStorage.setItem(LEVEL_KEY, String(level));
        localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    }

    function render() {
        muteButton.textContent = muted ? "UNMUTE" : "MUTE";
        muteButton.classList.toggle("is-muted", muted);
        muteButton.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
        levelButtons.forEach(button => {
            const buttonLevel = Number(button.dataset.classMusicLevel);
            button.classList.toggle("is-on", buttonLevel <= level);
            button.setAttribute("aria-pressed", String(buttonLevel === level));
        });
    }

    function applyAudioState() {
        if (applyingAudioState) return;
        applyingAudioState = true;
        const targetVolume = level / 5;
        if (Math.abs(audio.volume - targetVolume) > 0.001) audio.volume = targetVolume;
        if (audio.muted !== muted) audio.muted = muted;
        audio.preload = "auto";
        applyingAudioState = false;
    }

    function announceState() {
        window.dispatchEvent(new CustomEvent("classmusicchange", {
            detail: { level, muted, volume: level / 5 }
        }));
    }

    async function startPlayback() {
        applyAudioState();
        try {
            await audio.play();
            playbackUnlocked = true;
        } catch (_) {
            playbackUnlocked = false;
        }
    }

    function setLevel(nextLevel) {
        level = Math.max(1, Math.min(5, Number(nextLevel) || DEFAULT_LEVEL));
        muted = false;
        storeState();
        render();
        applyAudioState();
        announceState();
        startPlayback();
    }

    function toggleMuted() {
        muted = !muted;
        storeState();
        render();
        applyAudioState();
        announceState();
        startPlayback();
    }

    muteButton.addEventListener("click", toggleMuted);
    levelButtons.forEach(button => {
        button.addEventListener("click", () => setLevel(button.dataset.classMusicLevel));
    });

    audio.addEventListener("volumechange", () => {
        if (!applyingAudioState) queueMicrotask(applyAudioState);
    });
    audio.addEventListener("play", applyAudioState);
    audio.addEventListener("loadeddata", () => {
        applyAudioState();
        if (playbackUnlocked || muted) startPlayback();
    });

    const unlockPlayback = () => startPlayback();
    document.addEventListener("pointerdown", unlockPlayback, { capture: true, once: true });
    document.addEventListener("keydown", unlockPlayback, { capture: true, once: true });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && playbackUnlocked && !audio.ended) startPlayback();
    });

    render();
    applyAudioState();
    startPlayback();
})();
