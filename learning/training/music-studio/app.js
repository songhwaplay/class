(function () {
    "use strict";

    const core = window.MusicStudioCore;
    const PROGRESSIONS = {
        pop: { name: "팝 진행", degrees: [0, 4, 5, 3], hint: "안정 → 긴장 → 여운 → 확장" },
        jazz: { name: "2-5-1 진행", degrees: [1, 4, 0, 0], hint: "준비 → 긴장 → 해결 → 머무름" },
        turnaround: { name: "턴어라운드", degrees: [0, 5, 1, 4], hint: "안정 → 대리 → 준비 → 긴장" },
        anthem: { name: "6-4-1-5 진행", degrees: [5, 3, 0, 4], hint: "여운 → 확장 → 안정 → 다시 긴장" }
    };
    const FUNCTION_COPY = {
        토닉: "<strong>토닉(T)</strong>은 조성의 중심이며 시작과 종지에 사용합니다.",
        서브도미넌트: "<strong>서브도미넌트(SD)</strong>는 도미넌트로 진행하거나 화성 진행을 확장합니다.",
        도미넌트: "<strong>도미넌트(D)</strong>는 토닉으로 해결되는 긴장 기능을 가집니다."
    };
    const KEY_OPTIONS = {
        major: ["C", "G", "D", "A", "E", "F", "Bb", "Eb"],
        minor: ["A", "E", "B", "F#", "C#", "D", "G", "C"]
    };
    const MINOR_VARIANT_LABEL = { natural: "자연단조", harmonic: "화성단조", melodic: "가락단조" };

    const state = {
        audioContext: null,
        masterGain: null,
        compressor: null,
        reverb: null,
        reverbGain: null,
        noiseBuffer: null,
        key: "C",
        mode: "major",
        minorVariant: "natural",
        useSevenths: false,
        progressionId: "pop",
        progressionDegrees: PROGRESSIONS.pop.degrees.slice(),
        selectedSlot: 0,
        selectedChord: 0,
        progressionToken: 0,
        quizTarget: 4,
        quizAnswered: false,
        rhythmMode: "dictation",
        rhythmPattern: "steady",
        rhythmPlaybackToken: 0,
        tempo: 84,
        metronomeOn: false,
        metronomeTimer: 0,
        challengeRunning: false,
        challengeActive: false,
        performanceStartMs: 0,
        taps: [],
        dictationLevel: "all",
        dictationQuestionId: null,
        dictationQuestionNumber: 0,
        dictationAnswer: [],
        dictationReviewed: false,
        dictationSolved: false,
        dictationAttempts: 0,
        dictationCorrect: 0,
        dictationListens: 0,
        practiceCount: 0
    };

    const elements = {};

    function cacheElements() {
        [
            "practiceCount", "harmonyLab", "rhythmLab", "keySelect", "minorVariantControl", "minorVariantSelect", "progressionName",
            "progressionSlots", "progressionHint", "playProgressionButton", "functionExplanation",
            "chordBankTitle", "chordBank", "piano", "chordReadout", "quizPrompt", "quizListenButton",
            "quizChoices", "quizFeedback", "newQuizButton", "tempoOutput", "tempoSlider", "rhythmName",
            "rhythmListenButton", "metronomeButton", "rhythmGrid", "rhythmSyllables", "challengeStatus",
            "challengeTitle", "challengeGuide", "tapButton", "startChallengeButton", "scorePanel",
            "rhythmScore", "scoreTitle", "scoreDetail", "retryButton", "dictationPanel", "performancePanel",
            "dictationQuestionLabel", "dictationListenButton", "dictationGrid", "dictationFeedback",
            "clearDictationButton", "checkDictationButton", "newDictationButton", "dictationBankCount",
            "dictationAttemptCount", "dictationCorrectCount", "dictationListenCount", "toast"
        ].forEach(function (id) { elements[id] = document.getElementById(id); });
    }

    function ensureAudio() {
        if (!state.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                showToast("이 브라우저에서는 소리 재생을 지원하지 않아요.");
                return null;
            }
            state.audioContext = new AudioContextClass();
            const context = state.audioContext;
            state.masterGain = context.createGain();
            state.compressor = context.createDynamicsCompressor();
            state.reverb = context.createConvolver();
            state.reverbGain = context.createGain();

            state.masterGain.gain.value = .82;
            state.compressor.threshold.value = -20;
            state.compressor.knee.value = 18;
            state.compressor.ratio.value = 3;
            state.compressor.attack.value = .004;
            state.compressor.release.value = .24;
            state.reverbGain.gain.value = .18;

            const impulseLength = Math.floor(context.sampleRate * 1.7);
            const impulse = context.createBuffer(2, impulseLength, context.sampleRate);
            for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
                const data = impulse.getChannelData(channel);
                for (let index = 0; index < impulseLength; index += 1) {
                    const decay = Math.pow(1 - index / impulseLength, 2.8);
                    data[index] = (Math.random() * 2 - 1) * decay;
                }
            }
            state.reverb.buffer = impulse;

            const noiseLength = Math.floor(context.sampleRate * .25);
            state.noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
            const noise = state.noiseBuffer.getChannelData(0);
            for (let index = 0; index < noiseLength; index += 1) noise[index] = Math.random() * 2 - 1;

            state.reverb.connect(state.reverbGain).connect(state.compressor);
            state.compressor.connect(state.masterGain).connect(context.destination);
        }
        if (state.audioContext.state === "suspended") state.audioContext.resume();
        return state.audioContext;
    }

    function connectToMix(source, reverbAmount) {
        const context = ensureAudio();
        if (!context || !source) return;
        const dry = context.createGain();
        dry.gain.value = .9;
        source.connect(dry).connect(state.compressor);
        if (reverbAmount) {
            const send = context.createGain();
            send.gain.value = reverbAmount;
            source.connect(send).connect(state.reverb);
        }
    }

    function playPianoTone(frequency, when, duration, volume) {
        const context = ensureAudio();
        if (!context) return;
        const start = Math.max(context.currentTime, when || context.currentTime);
        const length = Math.max(.25, duration || .8);
        const envelope = context.createGain();
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.value = .7;
        filter.frequency.setValueAtTime(6200, start);
        filter.frequency.exponentialRampToValueAtTime(1700, start + Math.min(.9, length));
        envelope.gain.setValueAtTime(.0001, start);
        envelope.gain.exponentialRampToValueAtTime(volume || .075, start + .008);
        envelope.gain.exponentialRampToValueAtTime((volume || .075) * .48, start + .16);
        envelope.gain.exponentialRampToValueAtTime(.0001, start + length + .38);
        filter.connect(envelope);
        connectToMix(envelope, .34);

        [
            { ratio: 1, gain: 1, type: "triangle", detune: -2 },
            { ratio: 1, gain: .45, type: "sine", detune: 3 },
            { ratio: 2, gain: .22, type: "sine", detune: 0 },
            { ratio: 3, gain: .08, type: "sine", detune: 0 }
        ].forEach(function (partial) {
            const oscillator = context.createOscillator();
            const partialGain = context.createGain();
            oscillator.type = partial.type;
            oscillator.frequency.setValueAtTime(frequency * partial.ratio, start);
            oscillator.detune.value = partial.detune;
            partialGain.gain.value = partial.gain;
            oscillator.connect(partialGain).connect(filter);
            oscillator.start(start);
            oscillator.stop(start + length + .42);
        });

        const hammer = context.createOscillator();
        const hammerGain = context.createGain();
        hammer.type = "sine";
        hammer.frequency.setValueAtTime(frequency * 5.7, start);
        hammerGain.gain.setValueAtTime((volume || .075) * .16, start);
        hammerGain.gain.exponentialRampToValueAtTime(.0001, start + .045);
        hammer.connect(hammerGain);
        connectToMix(hammerGain, .08);
        hammer.start(start);
        hammer.stop(start + .06);
    }

    function playClick(when, accent, volumeScale) {
        const context = ensureAudio();
        if (!context) return;
        const start = Math.max(context.currentTime, when || context.currentTime);
        const output = context.createGain();
        const filter = context.createBiquadFilter();
        const amount = (accent ? .11 : .075) * (volumeScale || 1);
        filter.type = "bandpass";
        filter.frequency.value = accent ? 1700 : 1180;
        filter.Q.value = 5.5;
        output.gain.setValueAtTime(amount, start);
        output.gain.exponentialRampToValueAtTime(.0001, start + .07);
        filter.connect(output);
        connectToMix(output, .035);
        [1, 1.47].forEach(function (ratio, index) {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = (accent ? 1700 : 1180) * ratio;
            gain.gain.value = index ? .32 : 1;
            oscillator.connect(gain).connect(filter);
            oscillator.start(start);
            oscillator.stop(start + .075);
        });
    }

    function playNoiseTransient(when, frequency, duration, volume) {
        const context = ensureAudio();
        if (!context || !state.noiseBuffer) return;
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = state.noiseBuffer;
        filter.type = "bandpass";
        filter.frequency.value = frequency;
        filter.Q.value = 1.1;
        gain.gain.setValueAtTime(volume, when);
        gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
        source.connect(filter).connect(gain);
        connectToMix(gain, .025);
        source.start(when);
        source.stop(when + duration + .015);
    }

    function playDrum(when, accent) {
        const context = ensureAudio();
        if (!context) return;
        const start = Math.max(context.currentTime, when || context.currentTime);
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(accent ? 155 : 205, start);
        oscillator.frequency.exponentialRampToValueAtTime(accent ? 52 : 92, start + .11);
        gain.gain.setValueAtTime(accent ? .22 : .13, start);
        gain.gain.exponentialRampToValueAtTime(.0001, start + (accent ? .18 : .1));
        oscillator.connect(gain);
        connectToMix(gain, accent ? .02 : .06);
        oscillator.start(start);
        oscillator.stop(start + .2);
        playNoiseTransient(start, accent ? 2600 : 3400, accent ? .075 : .045, accent ? .055 : .038);
    }

    function getChords() {
        return core.buildDiatonicChords(state.key, state.useSevenths, state.mode, state.minorVariant);
    }

    function displayKey(key) {
        return String(key).replace("#", "♯").replace("b", "♭");
    }

    function renderKeyOptions() {
        elements.keySelect.innerHTML = "";
        KEY_OPTIONS[state.mode].forEach(function (key) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = displayKey(key) + (state.mode === "major" ? " 장조" : " 단조");
            option.selected = key === state.key;
            elements.keySelect.appendChild(option);
        });
        elements.minorVariantControl.classList.toggle("hidden", state.mode !== "minor");
    }

    function playChord(chord, when, duration) {
        const context = ensureAudio();
        if (!context || !chord) return;
        const start = when || context.currentTime + .02;
        const length = duration || .85;
        core.getLeftHandCompingMidi(chord).forEach(function (midi) {
            playPianoTone(core.midiToFrequency(midi), start, length, .052);
        });
    }

    function renderHarmony() {
        const chords = getChords();
        const progression = PROGRESSIONS[state.progressionId];
        elements.progressionName.textContent = progression.name;
        elements.progressionHint.textContent = progression.hint;
        const scaleLabel = state.mode === "major" ? "장조" : MINOR_VARIANT_LABEL[state.minorVariant];
        elements.chordBankTitle.textContent = displayKey(state.key) + " " + scaleLabel + "의 다이어토닉 코드";
        document.querySelectorAll("[data-progression]").forEach(function (button) {
            const preset = PROGRESSIONS[button.dataset.progression];
            button.textContent = preset.degrees.map(function (degree) { return chords[degree].roman; }).join("–");
        });
        elements.progressionSlots.innerHTML = "";
        state.progressionDegrees.forEach(function (degree, index) {
            const chord = chords[degree];
            const button = document.createElement("button");
            button.type = "button";
            button.className = "chord-slot" + (state.selectedSlot === index ? " selected" : "");
            button.dataset.slot = index;
            button.innerHTML = "<span>0" + (index + 1) + " · " + chord.roman + "</span><strong>" + chord.name + "</strong><small>" + chord.functionName + " · " + chord.functionDescription + "</small><i></i>";
            button.addEventListener("click", function () {
                state.selectedSlot = index;
                state.selectedChord = degree;
                renderHarmony();
                playChord(chord);
            });
            elements.progressionSlots.appendChild(button);
        });

        elements.chordBank.innerHTML = "";
        chords.forEach(function (chord, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "chord-button" + (state.selectedChord === index ? " active" : "");
            button.dataset.function = chord.functionName;
            button.innerHTML = "<span>" + chord.roman + "</span><strong>" + chord.name + "</strong><small>" + chord.functionShort + " · " + chord.functionName + "</small>";
            button.addEventListener("click", function () {
                state.selectedChord = index;
                state.progressionDegrees[state.selectedSlot] = index;
                renderHarmony();
                playChord(chord);
                explainFunction(chord.functionName);
            });
            elements.chordBank.appendChild(button);
        });
        renderPiano(chords[state.selectedChord]);
    }

    function renderPiano(chord) {
        const whitePitchClasses = [0, 2, 4, 5, 7, 9, 11];
        const blackPitchClasses = [1, 3, 6, 8, 10];
        const whiteMidis = [];
        const blackMidis = [];
        const voicing = core.getLeftHandCompingMidi(chord);
        for (let midi = 48; midi <= 72; midi += 1) {
            const pitchClass = midi % 12;
            if (whitePitchClasses.includes(pitchClass)) whiteMidis.push(midi);
            if (blackPitchClasses.includes(pitchClass)) blackMidis.push(midi);
        }
        elements.piano.innerHTML = "";
        whiteMidis.forEach(function (midi) {
            const pitchClass = midi % 12;
            const octave = Math.floor(midi / 12) - 1;
            const noteName = core.getNoteName(pitchClass);
            const key = document.createElement("button");
            key.type = "button";
            key.className = "white-key" + (voicing.includes(midi) ? " active" : "");
            key.setAttribute("aria-label", noteName + octave + " 음 듣기");
            key.innerHTML = "<span>" + (pitchClass === 0 ? noteName + octave : noteName) + "</span>";
            key.addEventListener("click", function () { playPianoTone(core.midiToFrequency(midi), 0, .65, .07); });
            elements.piano.appendChild(key);
        });
        blackMidis.forEach(function (midi) {
            const pitchClass = midi % 12;
            const octave = Math.floor(midi / 12) - 1;
            const key = document.createElement("button");
            key.type = "button";
            key.className = "black-key" + (voicing.includes(midi) ? " active" : "");
            key.style.left = (whiteMidis.filter(function (whiteMidi) { return whiteMidi < midi; }).length / whiteMidis.length * 100) + "%";
            key.setAttribute("aria-label", core.getNoteName(pitchClass) + octave + " 음 듣기");
            key.addEventListener("click", function () { playPianoTone(core.midiToFrequency(midi), 0, .65, .07); });
            elements.piano.appendChild(key);
        });
        const playedNotes = voicing.map(function (midi, index) {
            return chord.noteNames[index] + (Math.floor(midi / 12) - 1);
        });
        elements.chordReadout.textContent = chord.roman + " · " + chord.name + " · 왼손 컴핑 " + playedNotes.join("–") + " · 음역 C3–C5";
    }

    function playProgression() {
        const context = ensureAudio();
        if (!context) return;
        const chords = getChords();
        const token = ++state.progressionToken;
        const start = context.currentTime + .08;
        const beat = .78;
        elements.playProgressionButton.classList.add("playing");
        state.progressionDegrees.forEach(function (degree, index) {
            playChord(chords[degree], start + index * beat, .68);
            window.setTimeout(function () {
                if (token !== state.progressionToken) return;
                document.querySelectorAll(".chord-slot").forEach(function (slot, slotIndex) {
                    slot.classList.toggle("playing", slotIndex === index);
                });
            }, 80 + index * beat * 1000);
        });
        window.setTimeout(function () {
            if (token !== state.progressionToken) return;
            document.querySelectorAll(".chord-slot").forEach(function (slot) { slot.classList.remove("playing"); });
            elements.playProgressionButton.classList.remove("playing");
        }, 100 + state.progressionDegrees.length * beat * 1000);
    }

    function explainFunction(functionName) {
        elements.functionExplanation.innerHTML = FUNCTION_COPY[functionName] || FUNCTION_COPY.토닉;
    }

    function makeQuiz() {
        const candidates = [0, 1, 3, 4, 5];
        state.quizTarget = candidates[Math.floor(Math.random() * candidates.length)];
        state.quizAnswered = false;
        elements.quizPrompt.textContent = "코드를 듣고 로마 숫자를 고르세요.";
        elements.quizFeedback.textContent = "";
        const choiceSet = new Set([state.quizTarget]);
        while (choiceSet.size < 3) choiceSet.add(candidates[Math.floor(Math.random() * candidates.length)]);
        const choices = Array.from(choiceSet).sort(function () { return Math.random() - .5; });
        const chords = getChords();
        elements.quizChoices.innerHTML = "";
        choices.forEach(function (degree) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = chords[degree].roman;
            button.setAttribute("aria-label", chords[degree].roman + " 코드 선택");
            button.addEventListener("click", function () { answerQuiz(degree, button); });
            elements.quizChoices.appendChild(button);
        });
    }

    function answerQuiz(degree, button) {
        if (state.quizAnswered) return;
        const chords = getChords();
        if (degree === state.quizTarget) {
            state.quizAnswered = true;
            button.classList.add("correct");
            elements.quizFeedback.textContent = "정답! " + chords[degree].name + " · " + chords[degree].functionName + " 화음입니다.";
            incrementPractice();
        } else {
            button.classList.add("wrong");
            elements.quizFeedback.textContent = chords[degree].roman + "는 아니에요. 한 번 더 들어보세요.";
            window.setTimeout(function () { button.classList.remove("wrong"); }, 650);
        }
    }

    function getDictationPool() {
        if (state.dictationLevel === "all") return core.RHYTHM_DICTATION_BANK;
        return core.RHYTHM_DICTATION_BANK.filter(function (pattern) { return pattern.level === state.dictationLevel; });
    }

    function getDictationQuestion() {
        return core.RHYTHM_DICTATION_BANK.find(function (pattern) { return pattern.id === state.dictationQuestionId; });
    }

    function renderDictationGrid() {
        const question = getDictationQuestion();
        if (!question) return;
        elements.dictationGrid.innerHTML = "";
        for (let index = 0; index < 16; index += 1) {
            const selected = state.dictationAnswer.includes(index);
            const target = question.hits.includes(index);
            const step = document.createElement("button");
            step.type = "button";
            step.className = "rhythm-step answer-step" + (selected ? " selected" : "");
            if (state.dictationReviewed) {
                if (selected && target) step.classList.add("correct");
                else if (target) step.classList.add("missed");
                else if (selected) step.classList.add("extra");
            }
            step.dataset.step = index;
            step.setAttribute("aria-pressed", String(selected));
            step.setAttribute("aria-label", (Math.floor(index / 4) + 1) + "박 " + ["1", "e", "&", "a"][index % 4] + (selected ? " 입력됨" : " 비어 있음"));
            step.addEventListener("click", function () {
                const answerIndex = state.dictationAnswer.indexOf(index);
                if (answerIndex >= 0) state.dictationAnswer.splice(answerIndex, 1);
                else state.dictationAnswer.push(index);
                state.dictationAnswer.sort(function (a, b) { return a - b; });
                if (state.dictationReviewed) {
                    state.dictationReviewed = false;
                    elements.dictationFeedback.className = "";
                    elements.dictationFeedback.textContent = "답을 수정했습니다. 다시 확인하세요.";
                }
                renderDictationGrid();
            });
            elements.dictationGrid.appendChild(step);
        }
    }

    function newDictationQuestion() {
        state.rhythmPlaybackToken += 1;
        const pool = getDictationPool();
        const candidates = pool.filter(function (pattern) { return pattern.id !== state.dictationQuestionId; });
        const choices = candidates.length ? candidates : pool;
        const next = choices[Math.floor(Math.random() * choices.length)];
        state.dictationQuestionId = next.id;
        state.dictationQuestionNumber += 1;
        state.dictationAnswer = [];
        state.dictationReviewed = false;
        state.dictationSolved = false;
        elements.dictationQuestionLabel.textContent = "문제 " + state.dictationQuestionNumber + " · " + pool.length + "개 중 무작위";
        elements.dictationBankCount.textContent = pool.length;
        elements.dictationFeedback.className = "";
        elements.dictationFeedback.textContent = "한 마디 예비박 뒤에 문제가 두 번 재생됩니다.";
        renderDictationGrid();
    }

    function clearDictationAnswer() {
        state.dictationAnswer = [];
        state.dictationReviewed = false;
        elements.dictationFeedback.className = "";
        elements.dictationFeedback.textContent = "입력을 지웠습니다.";
        renderDictationGrid();
    }

    function checkDictationAnswer() {
        const question = getDictationQuestion();
        if (!question || !state.dictationAnswer.length) {
            showToast("격자에 리듬을 먼저 입력하세요.");
            return;
        }
        const result = core.scoreRhythmDictation(question.hits, state.dictationAnswer);
        state.dictationReviewed = true;
        state.dictationAttempts += 1;
        elements.dictationAttemptCount.textContent = state.dictationAttempts;
        if (result.exact) {
            if (!state.dictationSolved) {
                state.dictationSolved = true;
                state.dictationCorrect += 1;
                elements.dictationCorrectCount.textContent = state.dictationCorrect;
                incrementPractice();
            }
            elements.dictationFeedback.className = "correct";
            elements.dictationFeedback.textContent = "정답 · " + question.style + " 리듬";
        } else {
            elements.dictationFeedback.className = "incorrect";
            elements.dictationFeedback.textContent = result.score + "점 · 맞음 " + result.correct + " · 빠짐 " + result.missed + " · 추가 " + result.extra;
        }
        renderDictationGrid();
    }

    function listenToDictation() {
        const context = ensureAudio();
        const question = getDictationQuestion();
        if (!context || !question || state.challengeRunning) return;
        const token = ++state.rhythmPlaybackToken;
        const beatSeconds = 60 / state.tempo;
        const beatMs = beatSeconds * 1000;
        const stepMs = beatMs / 4;
        const countStart = context.currentTime + .08;
        state.dictationListens += 1;
        elements.dictationListenCount.textContent = state.dictationListens;
        elements.dictationFeedback.className = "";
        elements.dictationFeedback.textContent = "재생 중";
        for (let beat = 0; beat < 4; beat += 1) playClick(countStart + beat * beatSeconds, beat === 0, .9);
        const firstStart = countStart + 4 * beatSeconds;
        const secondStart = firstStart + 4 * beatSeconds;
        scheduleHits(question.hits, firstStart, true);
        scheduleHits(question.hits, secondStart, true);
        animateRhythmGrid(80 + 4 * beatMs, stepMs, token, elements.dictationGrid);
        animateRhythmGrid(80 + 8 * beatMs, stepMs, token, elements.dictationGrid);
        window.setTimeout(function () {
            if (token !== state.rhythmPlaybackToken) return;
            elements.dictationFeedback.textContent = "들은 위치를 클릭한 뒤 정답을 확인하세요.";
        }, 80 + 12 * beatMs);
    }

    function switchRhythmMode(mode) {
        if (state.challengeRunning) return;
        state.rhythmMode = mode === "performance" ? "performance" : "dictation";
        document.querySelectorAll("[data-rhythm-mode]").forEach(function (button) {
            const active = button.dataset.rhythmMode === state.rhythmMode;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
        elements.dictationPanel.classList.toggle("hidden", state.rhythmMode !== "dictation");
        elements.performancePanel.classList.toggle("hidden", state.rhythmMode !== "performance");
        if (state.rhythmMode !== "performance" && state.metronomeOn) toggleMetronome();
    }

    function renderRhythm() {
        const pattern = core.RHYTHM_PATTERNS[state.rhythmPattern];
        elements.rhythmName.textContent = pattern.name;
        elements.rhythmSyllables.textContent = pattern.syllables.join(" · ");
        elements.rhythmGrid.innerHTML = "";
        for (let index = 0; index < 16; index += 1) {
            const step = document.createElement("div");
            step.className = "rhythm-step" + (pattern.hits.includes(index) ? " hit" : "");
            step.dataset.step = index;
            step.setAttribute("aria-label", (index + 1) + "번째 16분음표" + (pattern.hits.includes(index) ? " 연주" : " 쉼"));
            elements.rhythmGrid.appendChild(step);
        }
        elements.scorePanel.classList.add("hidden");
        resetChallengeCopy();
    }

    function animateRhythmGrid(startDelayMs, durationMs, token, targetGrid) {
        const grid = targetGrid || elements.rhythmGrid;
        for (let index = 0; index < 16; index += 1) {
            window.setTimeout(function () {
                if (token !== state.rhythmPlaybackToken) return;
                grid.querySelectorAll(".rhythm-step").forEach(function (step, stepIndex) {
                    step.classList.toggle("current", stepIndex === index);
                });
            }, startDelayMs + index * durationMs);
        }
        window.setTimeout(function () {
            if (token !== state.rhythmPlaybackToken) return;
            grid.querySelectorAll(".rhythm-step").forEach(function (step) { step.classList.remove("current"); });
        }, startDelayMs + 16 * durationMs);
    }

    function scheduleHits(hits, startTime, includeBeatClicks) {
        const context = ensureAudio();
        const beatSeconds = 60 / state.tempo;
        const stepSeconds = beatSeconds / 4;
        if (!context) return;
        for (let beat = 0; beat < 4; beat += 1) {
            if (includeBeatClicks) playClick(startTime + beat * beatSeconds, beat === 0, .8);
        }
        hits.forEach(function (step) { playDrum(startTime + step * stepSeconds, step % 4 === 0); });
    }

    function schedulePattern(startTime, includeBeatClicks) {
        const pattern = core.RHYTHM_PATTERNS[state.rhythmPattern];
        scheduleHits(pattern.hits, startTime, includeBeatClicks);
    }

    function listenToRhythm() {
        const context = ensureAudio();
        if (!context || state.challengeRunning) return;
        const token = ++state.rhythmPlaybackToken;
        const stepSeconds = (60 / state.tempo) / 4;
        schedulePattern(context.currentTime + .08, true);
        animateRhythmGrid(80, stepSeconds * 1000, token);
    }

    function startMetronome() {
        if (!state.metronomeOn) return;
        const context = ensureAudio();
        if (!context) return;
        playClick(context.currentTime + .02, true, .75);
        state.metronomeTimer = window.setTimeout(startMetronome, (60 / state.tempo) * 1000);
    }

    function toggleMetronome() {
        state.metronomeOn = !state.metronomeOn;
        elements.metronomeButton.classList.toggle("active", state.metronomeOn);
        elements.metronomeButton.setAttribute("aria-pressed", String(state.metronomeOn));
        window.clearTimeout(state.metronomeTimer);
        if (state.metronomeOn) startMetronome();
    }

    function startChallenge() {
        if (state.challengeRunning) return;
        const context = ensureAudio();
        if (!context) return;
        const beatSeconds = 60 / state.tempo;
        const beatMs = beatSeconds * 1000;
        const countStart = context.currentTime + .12;
        const token = ++state.rhythmPlaybackToken;
        state.challengeRunning = true;
        state.challengeActive = false;
        state.taps = [];
        elements.scorePanel.classList.add("hidden");
        elements.startChallengeButton.disabled = true;
        elements.challengeStatus.textContent = "예비박";
        elements.challengeGuide.textContent = "큰 박을 느끼며 준비하세요.";
        for (let beat = 0; beat < 4; beat += 1) {
            playClick(countStart + beat * beatSeconds, beat === 0, 1.05);
            window.setTimeout(function () {
                if (token !== state.rhythmPlaybackToken) return;
                elements.challengeTitle.textContent = String(beat + 1);
            }, 120 + beat * beatMs);
        }

        const performanceDelay = 120 + 4 * beatMs;
        const performanceStart = countStart + 4 * beatSeconds;
        state.performanceStartMs = performance.now() + performanceDelay;
        schedulePattern(performanceStart, true);
        animateRhythmGrid(performanceDelay, beatMs / 4, token);
        window.setTimeout(function () {
            if (token !== state.rhythmPlaybackToken) return;
            state.challengeActive = true;
            elements.challengeStatus.textContent = "시작";
            elements.challengeTitle.textContent = "리듬을 두드리세요!";
            elements.challengeGuide.textContent = "TAP 버튼 또는 스페이스바를 사용하세요.";
        }, performanceDelay);
        window.setTimeout(function () {
            if (token !== state.rhythmPlaybackToken) return;
            finishChallenge();
        }, performanceDelay + 4 * beatMs + 180);
    }

    function registerTap() {
        if (!state.challengeActive) {
            if (!state.challengeRunning) showToast("먼저 ‘연습 시작’을 눌러주세요.");
            return;
        }
        const relative = performance.now() - state.performanceStartMs;
        state.taps.push(relative);
        elements.tapButton.classList.add("active");
        window.setTimeout(function () { elements.tapButton.classList.remove("active"); }, 90);
        const stepMs = (60 / state.tempo) * 1000 / 4;
        const stepIndex = Math.max(0, Math.min(15, Math.round(relative / stepMs)));
        const step = elements.rhythmGrid.querySelector('[data-step="' + stepIndex + '"]');
        if (step) {
            step.classList.add("tap-flash");
            window.setTimeout(function () { step.classList.remove("tap-flash"); }, 120);
        }
        const context = ensureAudio();
        if (context) playDrum(context.currentTime, relative < 120);
    }

    function finishChallenge() {
        state.challengeRunning = false;
        state.challengeActive = false;
        elements.startChallengeButton.disabled = false;
        document.querySelectorAll(".rhythm-step").forEach(function (step) { step.classList.remove("current"); });
        const pattern = core.RHYTHM_PATTERNS[state.rhythmPattern];
        const stepMs = (60 / state.tempo) * 1000 / 4;
        const expected = pattern.hits.map(function (step) { return step * stepMs; });
        const result = core.scoreRhythm(expected, state.taps, Math.min(170, Math.max(90, stepMs * .75)));
        elements.rhythmScore.textContent = result.score;
        elements.scoreTitle.textContent = result.score >= 90 ? "매우 정확합니다." : result.score >= 70 ? "대체로 정확합니다." : result.score >= 45 ? "일부 박이 어긋났습니다." : "패턴을 다시 들어보세요.";
        elements.scoreDetail.textContent = "정확 " + result.matched + "회 · 놓침 " + result.missed + "회 · 평균 오차 " + result.averageError + "ms" + (result.extra ? " · 추가 탭 " + result.extra + "회" : "");
        elements.scorePanel.classList.remove("hidden");
        elements.challengeStatus.textContent = "완료";
        elements.challengeTitle.textContent = "연습 결과: " + result.score + "점";
        elements.challengeGuide.textContent = "정확도와 오차를 확인하세요.";
        incrementPractice();
    }

    function resetChallengeCopy() {
        if (state.challengeRunning) return;
        elements.challengeStatus.textContent = "준비";
        elements.challengeTitle.textContent = "준비되면 시작하세요";
        elements.challengeGuide.textContent = "한 마디 카운트 후, 들었던 리듬을 따라 두드립니다.";
    }

    function switchTab(tabName) {
        document.querySelectorAll(".lab-tab").forEach(function (button) {
            const active = button.dataset.tab === tabName;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
        elements.harmonyLab.classList.toggle("hidden", tabName !== "harmony");
        elements.rhythmLab.classList.toggle("hidden", tabName !== "rhythm");
        if (tabName !== "rhythm" && state.metronomeOn) toggleMetronome();
    }

    function loadPracticeCount() {
        const today = new Date().toISOString().slice(0, 10);
        try {
            const saved = JSON.parse(localStorage.getItem("musicLabPractice") || "null");
            state.practiceCount = saved && saved.date === today ? Number(saved.count) || 0 : 0;
        } catch (error) {
            state.practiceCount = 0;
        }
        elements.practiceCount.textContent = state.practiceCount;
    }

    function incrementPractice() {
        const today = new Date().toISOString().slice(0, 10);
        state.practiceCount += 1;
        elements.practiceCount.textContent = state.practiceCount;
        try { localStorage.setItem("musicLabPractice", JSON.stringify({ date: today, count: state.practiceCount })); } catch (error) { /* local storage is optional */ }
    }

    let toastTimer = 0;
    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () { elements.toast.classList.remove("show"); }, 2200);
    }

    function bindEvents() {
        document.querySelectorAll(".lab-tab").forEach(function (button) {
            button.addEventListener("click", function () { switchTab(button.dataset.tab); });
        });
        document.querySelectorAll("[data-mode]").forEach(function (button) {
            button.addEventListener("click", function () {
                const nextMode = button.dataset.mode;
                if (nextMode === state.mode) return;
                state.mode = nextMode;
                state.key = nextMode === "minor" ? "A" : "C";
                state.minorVariant = "natural";
                elements.minorVariantSelect.value = "natural";
                state.progressionId = "pop";
                state.progressionDegrees = PROGRESSIONS.pop.degrees.slice();
                state.selectedSlot = 0;
                state.selectedChord = state.progressionDegrees[0];
                document.querySelectorAll("[data-mode]").forEach(function (item) { item.classList.toggle("active", item === button); });
                document.querySelectorAll("[data-progression]").forEach(function (item) { item.classList.toggle("active", item.dataset.progression === "pop"); });
                renderKeyOptions();
                renderHarmony();
                makeQuiz();
            });
        });
        elements.keySelect.addEventListener("change", function () {
            state.key = elements.keySelect.value;
            state.selectedChord = state.progressionDegrees[state.selectedSlot];
            renderHarmony();
            makeQuiz();
        });
        elements.minorVariantSelect.addEventListener("change", function () {
            state.minorVariant = elements.minorVariantSelect.value;
            renderHarmony();
            makeQuiz();
        });
        document.querySelectorAll("[data-voicing]").forEach(function (button) {
            button.addEventListener("click", function () {
                state.useSevenths = button.dataset.voicing === "seventh";
                document.querySelectorAll("[data-voicing]").forEach(function (item) { item.classList.toggle("active", item === button); });
                renderHarmony();
                makeQuiz();
            });
        });
        document.querySelectorAll("[data-progression]").forEach(function (button) {
            button.addEventListener("click", function () {
                state.progressionId = button.dataset.progression;
                state.progressionDegrees = PROGRESSIONS[state.progressionId].degrees.slice();
                state.selectedSlot = 0;
                state.selectedChord = state.progressionDegrees[0];
                document.querySelectorAll("[data-progression]").forEach(function (item) { item.classList.toggle("active", item === button); });
                renderHarmony();
            });
        });
        document.querySelectorAll("[data-function]").forEach(function (button) {
            if (button.closest(".function-flow")) button.addEventListener("click", function () { explainFunction(button.dataset.function); });
        });
        elements.playProgressionButton.addEventListener("click", playProgression);
        elements.quizListenButton.addEventListener("click", function () { playChord(getChords()[state.quizTarget]); });
        elements.newQuizButton.addEventListener("click", makeQuiz);
        document.querySelectorAll("[data-rhythm-mode]").forEach(function (button) {
            button.addEventListener("click", function () { switchRhythmMode(button.dataset.rhythmMode); });
        });
        elements.tempoSlider.addEventListener("input", function () {
            state.tempo = Number(elements.tempoSlider.value);
            elements.tempoOutput.value = state.tempo;
            elements.tempoOutput.textContent = state.tempo;
            if (state.metronomeOn) { window.clearTimeout(state.metronomeTimer); startMetronome(); }
        });
        elements.rhythmListenButton.addEventListener("click", listenToRhythm);
        elements.metronomeButton.addEventListener("click", toggleMetronome);
        elements.dictationListenButton.addEventListener("click", listenToDictation);
        elements.clearDictationButton.addEventListener("click", clearDictationAnswer);
        elements.checkDictationButton.addEventListener("click", checkDictationAnswer);
        elements.newDictationButton.addEventListener("click", newDictationQuestion);
        document.querySelectorAll("[data-dictation-level]").forEach(function (button) {
            button.addEventListener("click", function () {
                state.dictationLevel = button.dataset.dictationLevel;
                document.querySelectorAll("[data-dictation-level]").forEach(function (item) { item.classList.toggle("active", item === button); });
                newDictationQuestion();
            });
        });
        document.querySelectorAll("[data-pattern]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (state.challengeRunning) return;
                state.rhythmPattern = button.dataset.pattern;
                document.querySelectorAll("[data-pattern]").forEach(function (item) { item.classList.toggle("active", item === button); });
                renderRhythm();
            });
        });
        elements.startChallengeButton.addEventListener("click", startChallenge);
        elements.retryButton.addEventListener("click", startChallenge);
        elements.tapButton.addEventListener("pointerdown", function (event) { event.preventDefault(); registerTap(); });
        window.addEventListener("keydown", function (event) {
            if (event.code !== "Space" || elements.rhythmLab.classList.contains("hidden") || state.rhythmMode !== "performance") return;
            const tag = document.activeElement && document.activeElement.tagName;
            if (tag === "INPUT" || tag === "SELECT") return;
            event.preventDefault();
            if (!event.repeat) registerTap();
        });
    }

    function init() {
        cacheElements();
        bindEvents();
        loadPracticeCount();
        renderKeyOptions();
        renderHarmony();
        newDictationQuestion();
        renderRhythm();
        makeQuiz();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
