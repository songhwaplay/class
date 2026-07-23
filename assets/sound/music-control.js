(() => {
    "use strict";

    const MUSIC_LEVEL_KEY = "classMusicVolumeLevel";
    const MUSIC_MUTED_KEY = "classMusicMuted";
    const SFX_LEVEL_KEY = "classSfxVolumeLevel";
    const SFX_MUTED_KEY = "classSfxMuted";
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

    // Load Music State
    const savedMusicLevel = Number(localStorage.getItem(MUSIC_LEVEL_KEY));
    let musicLevel = Number.isInteger(savedMusicLevel) && savedMusicLevel >= 1 && savedMusicLevel <= 5
        ? savedMusicLevel
        : DEFAULT_LEVEL;
    let musicMuted = localStorage.getItem(MUSIC_MUTED_KEY) === "1";

    // Load SFX State
    const savedSfxLevel = Number(localStorage.getItem(SFX_LEVEL_KEY));
    let sfxLevel = Number.isInteger(savedSfxLevel) && savedSfxLevel >= 1 && savedSfxLevel <= 5
        ? savedSfxLevel
        : musicLevel;
    let sfxMuted = localStorage.getItem(SFX_MUTED_KEY) === "1";

    let applyingAudioState = false;
    let playbackUnlocked = false;

    const control = document.createElement("div");
    control.className = "unified-music-control";
    control.setAttribute("role", "group");
    control.setAttribute("aria-label", "Audio volume controls");
    control.innerHTML = `
        <div class="unified-audio-group">
            <span class="unified-music-label">MUSIC:</span>
            <button class="unified-music-mute" id="musicMuteBtn" type="button">MUTE</button>
            <div class="unified-music-levels" role="group" aria-label="Music volume level">
                ${[1, 2, 3, 4, 5].map(v => `<button class="unified-music-segment" type="button" data-class-music-level="${v}" aria-label="Music ${v}"></button>`).join("")}
            </div>
        </div>
        <div class="unified-audio-divider"></div>
        <div class="unified-audio-group">
            <span class="unified-music-label">SFX:</span>
            <button class="unified-music-mute" id="sfxMuteBtn" type="button">MUTE</button>
            <div class="unified-music-levels" role="group" aria-label="SFX volume level">
                ${[1, 2, 3, 4, 5].map(v => `<button class="unified-music-segment" type="button" data-class-sfx-level="${v}" aria-label="SFX ${v}"></button>`).join("")}
            </div>
        </div>`;

    document.body.appendChild(control);
    document.body.classList.add("class-music-ready");

    const musicMuteBtn = control.querySelector("#musicMuteBtn");
    const musicLevelBtns = [...control.querySelectorAll("[data-class-music-level]")];
    const sfxMuteBtn = control.querySelector("#sfxMuteBtn");
    const sfxLevelBtns = [...control.querySelectorAll("[data-class-sfx-level]")];

    function storeState() {
        localStorage.setItem(MUSIC_LEVEL_KEY, String(musicLevel));
        localStorage.setItem(MUSIC_MUTED_KEY, musicMuted ? "1" : "0");
        localStorage.setItem(SFX_LEVEL_KEY, String(sfxLevel));
        localStorage.setItem(SFX_MUTED_KEY, sfxMuted ? "1" : "0");
    }

    function render() {
        // Music UI
        musicMuteBtn.textContent = musicMuted ? "UNMUTE" : "MUTE";
        musicMuteBtn.classList.toggle("is-muted", musicMuted);
        musicLevelBtns.forEach(btn => {
            const val = Number(btn.dataset.classMusicLevel);
            btn.classList.toggle("is-on", val <= musicLevel);
        });

        // SFX UI
        sfxMuteBtn.textContent = sfxMuted ? "UNMUTE" : "MUTE";
        sfxMuteBtn.classList.toggle("is-muted", sfxMuted);
        sfxLevelBtns.forEach(btn => {
            const val = Number(btn.dataset.classSfxLevel);
            btn.classList.toggle("is-on", val <= sfxLevel);
        });
    }

    function applyAudioState() {
        if (applyingAudioState) return;
        applyingAudioState = true;
        const targetVolume = musicLevel / 5;
        if (Math.abs(audio.volume - targetVolume) > 0.001) audio.volume = targetVolume;
        if (audio.muted !== musicMuted) audio.muted = musicMuted;
        audio.preload = "auto";
        applyingAudioState = false;
    }

    function announceState() {
        window.dispatchEvent(new CustomEvent("classmusicchange", {
            detail: { level: musicLevel, muted: musicMuted, volume: musicLevel / 5 }
        }));
        window.dispatchEvent(new CustomEvent("classsfxchange", {
            detail: { level: sfxLevel, muted: sfxMuted, volume: sfxLevel / 5 }
        }));
        if (window.ClassGameSfx) {
            window.ClassGameSfx.setMuted(sfxMuted);
            window.ClassGameSfx.setVolume(sfxLevel / 5);
        }
    }

    async function startPlayback() {
        applyAudioState();
        try {
            await audio.play();
            playbackUnlocked = true;
            return true;
        } catch (_) {
            playbackUnlocked = false;
            return false;
        }
    }

    musicMuteBtn.addEventListener("click", () => {
        musicMuted = !musicMuted;
        storeState();
        render();
        applyAudioState();
        announceState();
        startPlayback();
    });

    musicLevelBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            musicLevel = Number(btn.dataset.classMusicLevel);
            musicMuted = false;
            storeState();
            render();
            applyAudioState();
            announceState();
            startPlayback();
        });
    });

    sfxMuteBtn.addEventListener("click", () => {
        sfxMuted = !sfxMuted;
        storeState();
        render();
        announceState();
    });

    sfxLevelBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            sfxLevel = Number(btn.dataset.classSfxLevel);
            sfxMuted = false;
            storeState();
            render();
            announceState();
        });
    });

    audio.addEventListener("volumechange", () => {
        if (!applyingAudioState) queueMicrotask(applyAudioState);
    });
    audio.addEventListener("play", applyAudioState);
    audio.addEventListener("loadeddata", () => {
        applyAudioState();
        if (playbackUnlocked || musicMuted) startPlayback();
    });

    const unlockEvents = ["pointerdown", "click", "touchstart", "keydown"];
    const unlockPlayback = async () => {
        if (!await startPlayback()) return;
        unlockEvents.forEach(eventName => document.removeEventListener(eventName, unlockPlayback, true));
    };
    unlockEvents.forEach(eventName => document.addEventListener(eventName, unlockPlayback, { capture: true }));

    render();
    applyAudioState();
    announceState();
    startPlayback();
})();
