(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    root.MusicStudioCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    const NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
    const KEY_SCALES = {
        C: ["C", "D", "E", "F", "G", "A", "B"],
        G: ["G", "A", "B", "C", "D", "E", "F♯"],
        D: ["D", "E", "F♯", "G", "A", "B", "C♯"],
        A: ["A", "B", "C♯", "D", "E", "F♯", "G♯"],
        E: ["E", "F♯", "G♯", "A", "B", "C♯", "D♯"],
        F: ["F", "G", "A", "B♭", "C", "D", "E"],
        Bb: ["B♭", "C", "D", "E♭", "F", "G", "A"],
        Eb: ["E♭", "F", "G", "A♭", "B♭", "C", "D"]
    };
    const MINOR_SCALES = {
        A: {
            natural: ["A", "B", "C", "D", "E", "F", "G"],
            harmonic: ["A", "B", "C", "D", "E", "F", "G♯"],
            melodic: ["A", "B", "C", "D", "E", "F♯", "G♯"]
        },
        E: {
            natural: ["E", "F♯", "G", "A", "B", "C", "D"],
            harmonic: ["E", "F♯", "G", "A", "B", "C", "D♯"],
            melodic: ["E", "F♯", "G", "A", "B", "C♯", "D♯"]
        },
        B: {
            natural: ["B", "C♯", "D", "E", "F♯", "G", "A"],
            harmonic: ["B", "C♯", "D", "E", "F♯", "G", "A♯"],
            melodic: ["B", "C♯", "D", "E", "F♯", "G♯", "A♯"]
        },
        "F#": {
            natural: ["F♯", "G♯", "A", "B", "C♯", "D", "E"],
            harmonic: ["F♯", "G♯", "A", "B", "C♯", "D", "E♯"],
            melodic: ["F♯", "G♯", "A", "B", "C♯", "D♯", "E♯"]
        },
        "C#": {
            natural: ["C♯", "D♯", "E", "F♯", "G♯", "A", "B"],
            harmonic: ["C♯", "D♯", "E", "F♯", "G♯", "A", "B♯"],
            melodic: ["C♯", "D♯", "E", "F♯", "G♯", "A♯", "B♯"]
        },
        D: {
            natural: ["D", "E", "F", "G", "A", "B♭", "C"],
            harmonic: ["D", "E", "F", "G", "A", "B♭", "C♯"],
            melodic: ["D", "E", "F", "G", "A", "B", "C♯"]
        },
        G: {
            natural: ["G", "A", "B♭", "C", "D", "E♭", "F"],
            harmonic: ["G", "A", "B♭", "C", "D", "E♭", "F♯"],
            melodic: ["G", "A", "B♭", "C", "D", "E", "F♯"]
        },
        C: {
            natural: ["C", "D", "E♭", "F", "G", "A♭", "B♭"],
            harmonic: ["C", "D", "E♭", "F", "G", "A♭", "B"],
            melodic: ["C", "D", "E♭", "F", "G", "A", "B"]
        }
    };
    const PITCH_CLASS = {
        C: 0, "B♯": 0, "C♯": 1, "D♭": 1, D: 2, "D♯": 3, "E♭": 3, E: 4,
        "E♯": 5, F: 5, "F♯": 6, "G♭": 6, G: 7, "G♯": 8, "A♭": 8, A: 9,
        "A♯": 10, "B♭": 10, B: 11
    };
    const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"];
    const FUNCTION_INFO = [
        { name: "토닉", short: "T", description: "안정과 출발" },
        { name: "서브도미넌트", short: "SD", description: "진행을 여는 힘" },
        { name: "토닉", short: "T", description: "으뜸화음의 대리" },
        { name: "서브도미넌트", short: "SD", description: "긴장을 준비" },
        { name: "도미넌트", short: "D", description: "으뜸화음으로 해결" },
        { name: "토닉", short: "T", description: "부드러운 대리" },
        { name: "도미넌트", short: "D", description: "강한 해결 욕구" }
    ];
    const MINOR_FUNCTION_INFO = [
        { name: "토닉", short: "T", description: "단조의 중심" },
        { name: "서브도미넌트", short: "SD", description: "진행을 준비" },
        { name: "토닉", short: "T", description: "토닉의 대리" },
        { name: "서브도미넌트", short: "SD", description: "긴장을 준비" },
        { name: "도미넌트", short: "D", description: "토닉으로 진행" },
        { name: "서브도미넌트", short: "SD", description: "진행을 확장" },
        { name: "도미넌트", short: "D", description: "토닉으로 진행" }
    ];
    const RHYTHM_PATTERNS = {
        steady: {
            name: "4분음표 워크",
            level: "기초",
            hits: [0, 4, 8, 12],
            syllables: ["타", "타", "타", "타"]
        },
        eighths: {
            name: "8비트 드라이브",
            level: "기초",
            hits: [0, 2, 4, 6, 8, 10, 12, 14],
            syllables: ["타", "카", "타", "카", "타", "카", "타", "카"]
        },
        offbeat: {
            name: "오프비트 팝",
            level: "중급",
            hits: [0, 3, 6, 8, 11, 14],
            syllables: ["타", "앤", "카", "타", "앤", "카"]
        },
        syncopation: {
            name: "싱코페이션",
            level: "도전",
            hits: [0, 3, 6, 9, 10, 14],
            syllables: ["타", "앤", "카", "앤", "타", "카"]
        }
    };

    function normalizeKey(key) {
        return String(key || "C").replace("♭", "b");
    }

    function getChordQuality(intervals, useSevenths) {
        const signature = intervals.join(",");
        const qualities = useSevenths ? {
            "0,4,7,11": { suffix: "maj7", type: "major", romanSuffix: "maj7" },
            "0,4,7,10": { suffix: "7", type: "major", romanSuffix: "7" },
            "0,3,7,10": { suffix: "m7", type: "minor", romanSuffix: "7" },
            "0,3,7,11": { suffix: "m(maj7)", type: "minor", romanSuffix: "(maj7)" },
            "0,3,6,10": { suffix: "m7♭5", type: "diminished", romanSuffix: "ø7" },
            "0,3,6,9": { suffix: "dim7", type: "diminished", romanSuffix: "°7" },
            "0,4,8,11": { suffix: "+maj7", type: "augmented", romanSuffix: "+maj7" },
            "0,4,8,10": { suffix: "+7", type: "augmented", romanSuffix: "+7" }
        } : {
            "0,4,7": { suffix: "", type: "major", romanSuffix: "" },
            "0,3,7": { suffix: "m", type: "minor", romanSuffix: "" },
            "0,3,6": { suffix: "dim", type: "diminished", romanSuffix: "°" },
            "0,4,8": { suffix: "+", type: "augmented", romanSuffix: "+" }
        };
        return qualities[signature] || { suffix: "", type: "major", romanSuffix: "" };
    }

    function makeRoman(degree, quality) {
        const lowerCase = quality.type === "minor" || quality.type === "diminished";
        const base = lowerCase ? ROMAN_BASE[degree].toLowerCase() : ROMAN_BASE[degree];
        return base + quality.romanSuffix;
    }

    function buildDiatonicChords(key, useSevenths, mode, minorVariant) {
        const normalizedKey = normalizeKey(key);
        const selectedMode = mode === "minor" ? "minor" : "major";
        const variant = ["natural", "harmonic", "melodic"].includes(minorVariant) ? minorVariant : "natural";
        const minorScaleSet = MINOR_SCALES[normalizedKey] || MINOR_SCALES.A;
        const scale = selectedMode === "minor" ? minorScaleSet[variant] : (KEY_SCALES[normalizedKey] || KEY_SCALES.C);
        const functionInfo = selectedMode === "minor" ? MINOR_FUNCTION_INFO : FUNCTION_INFO;
        const stackSize = useSevenths ? 4 : 3;
        return scale.map(function (note, index) {
            const rootPc = PITCH_CLASS[note];
            const noteNames = [];
            for (let stack = 0; stack < stackSize; stack += 1) noteNames.push(scale[(index + stack * 2) % 7]);
            const pitchClasses = noteNames.map(function (name) { return PITCH_CLASS[name]; });
            const intervals = pitchClasses.map(function (pitchClass) { return (pitchClass - rootPc + 12) % 12; });
            const quality = getChordQuality(intervals, useSevenths);
            return {
                degree: index,
                roman: makeRoman(index, quality),
                name: note + quality.suffix,
                root: note,
                rootPc: rootPc,
                pitchClasses: pitchClasses,
                noteNames: noteNames,
                quality: quality.type,
                functionName: functionInfo[index].name,
                functionShort: functionInfo[index].short,
                functionDescription: functionInfo[index].description
            };
        });
    }

    function getProgression(degrees, key, useSevenths, mode, minorVariant) {
        const chords = buildDiatonicChords(key, useSevenths, mode, minorVariant);
        return degrees.map(function (degree) { return chords[degree]; });
    }

    function midiToFrequency(midi) {
        return 440 * Math.pow(2, (Number(midi) - 69) / 12);
    }

    function getClosedPositionMidi(chord, baseC) {
        const cMidi = Number.isFinite(Number(baseC)) ? Number(baseC) : 60;
        const rootMidi = cMidi + chord.rootPc;
        return chord.pitchClasses.map(function (pitchClass) {
            return rootMidi + (pitchClass - chord.rootPc + 12) % 12;
        });
    }

    function scoreRhythm(expectedTimes, tapTimes, toleranceMs) {
        const tolerance = Math.max(40, Number(toleranceMs) || 150);
        const expected = expectedTimes.slice().sort(function (a, b) { return a - b; });
        const taps = tapTimes.slice().sort(function (a, b) { return a - b; });
        const unused = new Set(taps.map(function (_, index) { return index; }));
        const matches = [];

        expected.forEach(function (target) {
            let bestIndex = -1;
            let bestError = Infinity;
            unused.forEach(function (tapIndex) {
                const error = Math.abs(taps[tapIndex] - target);
                if (error < bestError) {
                    bestError = error;
                    bestIndex = tapIndex;
                }
            });
            if (bestIndex >= 0 && bestError <= tolerance) {
                unused.delete(bestIndex);
                matches.push({ expected: target, actual: taps[bestIndex], error: taps[bestIndex] - target });
            }
        });

        const accuracy = expected.length ? matches.length / expected.length : 0;
        const timing = matches.length
            ? matches.reduce(function (sum, match) { return sum + Math.max(0, 1 - Math.abs(match.error) / tolerance); }, 0) / matches.length
            : 0;
        const extraPenalty = expected.length ? Math.min(0.25, unused.size / expected.length * 0.2) : 0;
        const score = Math.max(0, Math.round((accuracy * 0.7 + timing * 0.3 - extraPenalty) * 100));
        const averageError = matches.length
            ? Math.round(matches.reduce(function (sum, match) { return sum + Math.abs(match.error); }, 0) / matches.length)
            : 0;

        return {
            score: score,
            matched: matches.length,
            missed: expected.length - matches.length,
            extra: unused.size,
            averageError: averageError,
            matches: matches
        };
    }

    function getNoteName(pitchClass) {
        const index = ((Number(pitchClass) % 12) + 12) % 12;
        return NOTE_NAMES[index];
    }

    return {
        NOTE_NAMES: NOTE_NAMES,
        KEY_SCALES: KEY_SCALES,
        MINOR_SCALES: MINOR_SCALES,
        RHYTHM_PATTERNS: RHYTHM_PATTERNS,
        buildDiatonicChords: buildDiatonicChords,
        getProgression: getProgression,
        midiToFrequency: midiToFrequency,
        getClosedPositionMidi: getClosedPositionMidi,
        scoreRhythm: scoreRhythm,
        getNoteName: getNoteName
    };
});
