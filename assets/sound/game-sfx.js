(() => {
    "use strict";

    if (window.ClassGameSfx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const SFX_LEVEL_KEY = "classSfxVolumeLevel";
    const SFX_MUTED_KEY = "classSfxMuted";
    const DEFAULT_VOLUME = 0.6;
    const SOUND_NAMES = new Set(["click", "bell", "card", "stone", "success", "error", "tick"]);

    let context = null;
    let output = null;
    let noiseBuffer = null;
    let muted = readStored(SFX_MUTED_KEY) === "1";
    let volume = readInitialVolume();

    function readStored(key) {
        try {
            return window.localStorage.getItem(key) || "";
        } catch (_) {
            return "";
        }
    }

    function readInitialVolume() {
        const storedSfx = readStored(SFX_LEVEL_KEY);
        const storedMusic = readStored("classMusicVolumeLevel");
        const level = Number(storedSfx || storedMusic);
        return Number.isInteger(level) && level >= 1 && level <= 5
            ? level / 5
            : DEFAULT_VOLUME;
    }

    function ensureContext() {
        if (!AudioContextClass) return null;
        if (!context) {
            try {
                context = new AudioContextClass({ latencyHint: "interactive" });
            } catch (_) {
                context = new AudioContextClass();
            }

            const compressor = context.createDynamicsCompressor();
            output = context.createGain();
            compressor.threshold.value = -16;
            compressor.knee.value = 8;
            compressor.ratio.value = 5;
            compressor.attack.value = 0.002;
            compressor.release.value = 0.12;
            output.connect(compressor);
            compressor.connect(context.destination);
            updateOutputGain();
        }
        if (context.state === "suspended") context.resume().catch(() => {});
        return context;
    }

    function updateOutputGain() {
        if (!output || !context) return;
        const target = muted ? 0.0001 : Math.max(0.0001, Math.min(1, volume));
        output.gain.cancelScheduledValues(context.currentTime);
        output.gain.setTargetAtTime(target, context.currentTime, 0.008);
    }

    function getNoiseBuffer(ctx) {
        if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
        noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.09), ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let index = 0; index < data.length; index += 1) {
            data[index] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    function makeGain(ctx, start, peak, end, duration) {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + 0.003);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, end), start + duration);
        gain.connect(output);
        return gain;
    }

    function tone(ctx, options) {
        const start = options.start ?? ctx.currentTime;
        const duration = options.duration ?? 0.08;
        const oscillator = ctx.createOscillator();
        const gain = makeGain(ctx, start, options.gain ?? 0.08, 0.0001, duration);
        oscillator.type = options.type || "sine";
        oscillator.frequency.setValueAtTime(options.from, start);
        oscillator.frequency.exponentialRampToValueAtTime(options.to || options.from, start + duration);
        oscillator.connect(gain);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
    }

    function noise(ctx, options = {}) {
        const start = options.start ?? ctx.currentTime;
        const duration = Math.min(0.085, options.duration ?? 0.04);
        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = makeGain(ctx, start, options.gain ?? 0.05, 0.0001, duration);
        source.buffer = getNoiseBuffer(ctx);
        filter.type = options.filterType || "bandpass";
        filter.frequency.setValueAtTime(options.frequency || 2200, start);
        filter.Q.setValueAtTime(options.q || 1.2, start);
        source.connect(filter);
        filter.connect(gain);
        source.start(start, 0, duration);
        source.stop(start + duration + 0.01);
    }

    function playClick(ctx) {
        const now = ctx.currentTime;
        tone(ctx, { start: now, from: 760, to: 470, duration: 0.045, gain: 0.075, type: "triangle" });
        tone(ctx, { start: now + 0.004, from: 1320, to: 880, duration: 0.028, gain: 0.025 });
    }

    function playBell(ctx) {
        const now = ctx.currentTime;
        const highpass = ctx.createBiquadFilter();
        const bellGain = ctx.createGain();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(820, now);
        bellGain.gain.setValueAtTime(0.0001, now);
        bellGain.gain.exponentialRampToValueAtTime(0.31, now + 0.003);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
        highpass.connect(bellGain);
        bellGain.connect(output);

        [
            [1760, 1, "sine", 0],
            [2635, 0.62, "sine", 0.002],
            [3518, 0.34, "triangle", 0.004],
            [4720, 0.2, "sine", 0.006],
            [6120, 0.1, "sine", 0.008]
        ].forEach(([frequency, strength, type, delay]) => {
            const start = now + delay;
            const oscillator = ctx.createOscillator();
            const partialGain = ctx.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, start);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.992, start + 0.3);
            partialGain.gain.setValueAtTime(0.0001, start);
            partialGain.gain.exponentialRampToValueAtTime(strength, start + 0.002);
            partialGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
            oscillator.connect(partialGain);
            partialGain.connect(highpass);
            oscillator.start(start);
            oscillator.stop(start + 0.54);
        });

        const strike = ctx.createBufferSource();
        const strikeFilter = ctx.createBiquadFilter();
        const strikeGain = ctx.createGain();
        strike.buffer = getNoiseBuffer(ctx);
        strikeFilter.type = "bandpass";
        strikeFilter.frequency.setValueAtTime(5400, now);
        strikeFilter.Q.setValueAtTime(1.8, now);
        strikeGain.gain.setValueAtTime(0.12, now);
        strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
        strike.connect(strikeFilter);
        strikeFilter.connect(strikeGain);
        strikeGain.connect(highpass);
        strike.start(now, 0, 0.04);
        strike.stop(now + 0.045);
    }

    function playCard(ctx) {
        const now = ctx.currentTime;
        noise(ctx, { start: now, duration: 0.065, frequency: 2850, q: 0.65, gain: 0.08 });
        tone(ctx, { start: now + 0.008, from: 410, to: 290, duration: 0.055, gain: 0.04, type: "triangle" });
    }

    function playStone(ctx) {
        const now = ctx.currentTime;
        tone(ctx, { start: now, from: 245, to: 155, duration: 0.055, gain: 0.1, type: "sine" });
        noise(ctx, { start: now, duration: 0.025, frequency: 1250, q: 1.1, gain: 0.07 });
    }

    function playSuccess(ctx) {
        const now = ctx.currentTime;
        [659.25, 830.61, 987.77].forEach((frequency, index) => {
            tone(ctx, {
                start: now + index * 0.075,
                from: frequency,
                to: frequency * 1.01,
                duration: 0.18,
                gain: 0.07,
                type: "sine"
            });
        });
    }

    function playError(ctx) {
        const now = ctx.currentTime;
        tone(ctx, { start: now, from: 210, to: 155, duration: 0.14, gain: 0.1, type: "square" });
        tone(ctx, { start: now + 0.08, from: 165, to: 125, duration: 0.15, gain: 0.075, type: "square" });
    }

    function playTick(ctx) {
        const now = ctx.currentTime;
        tone(ctx, { start: now, from: 1180, to: 930, duration: 0.025, gain: 0.045, type: "square" });
    }

    const players = {
        click: playClick,
        bell: playBell,
        card: playCard,
        stone: playStone,
        success: playSuccess,
        error: playError,
        tick: playTick
    };

    function play(name = "click") {
        const soundName = SOUND_NAMES.has(name) ? name : "click";
        if (muted) return false;
        const ctx = ensureContext();
        if (!ctx || !output) return false;
        players[soundName](ctx);
        return true;
    }

    function unlock() {
        return Boolean(ensureContext());
    }

    function setMuted(nextMuted) {
        muted = Boolean(nextMuted);
        updateOutputGain();
    }

    function setVolume(nextVolume) {
        const parsed = Number(nextVolume);
        if (Number.isFinite(parsed)) volume = Math.max(0, Math.min(1, parsed));
        updateOutputGain();
    }

    function interactiveFromTarget(target) {
        if (!(target instanceof Element)) return null;
        return target.closest("button, a[href], input[type='button'], input[type='submit'], [role='button'], [data-sfx]");
    }

    function soundForElement(element) {
        if (!element || element.matches(":disabled, [aria-disabled='true']")) return "";
        const requested = String(element.dataset.sfx || "click").toLowerCase();
        return requested === "none" ? "" : requested;
    }

    function handlePress(event) {
        if (event.isPrimary === false || (typeof event.button === "number" && event.button > 0)) return;
        const element = interactiveFromTarget(event.target);
        const soundName = soundForElement(element);
        if (soundName) play(soundName);
    }

    function handleKeyboardClick(event) {
        if (event.detail !== 0) return;
        const element = interactiveFromTarget(event.target);
        const soundName = soundForElement(element);
        if (soundName) play(soundName);
    }

    if (window.PointerEvent) {
        document.addEventListener("pointerdown", handlePress, { capture: true, passive: true });
    } else {
        document.addEventListener("touchstart", handlePress, { capture: true, passive: true });
        document.addEventListener("mousedown", handlePress, { capture: true, passive: true });
    }
    document.addEventListener("click", handleKeyboardClick, { capture: true });
    window.addEventListener("classsfxchange", (event) => {
        if (!event.detail) return;
        setMuted(event.detail.muted);
        setVolume(event.detail.volume);
    });

    window.ClassGameSfx = {
        play,
        unlock,
        setMuted,
        setVolume,
        isMuted: () => muted,
        isSupported: () => Boolean(AudioContextClass)
    };
    window.dispatchEvent(new CustomEvent("classsfxready"));
})();
