"use strict";

const assert = require("node:assert/strict");
const core = require("../learning/training/music-studio/music-core.js");

const cMajor = core.buildDiatonicChords("C", false);
assert.equal(cMajor.length, 7);
assert.equal(cMajor[0].name, "C");
assert.equal(cMajor[1].name, "Dm");
assert.equal(cMajor[4].name, "G");
assert.deepEqual(cMajor[4].pitchClasses, [7, 11, 2]);
assert.equal(cMajor[4].functionName, "도미넌트");
assert.deepEqual(core.getClosedPositionMidi(cMajor[0], 60), [60, 64, 67]);
assert.equal(core.getClosedPositionMidi(cMajor[0], 60).length, 3);
assert.deepEqual(core.getLeftHandCompingMidi(cMajor[0]), [48, 52, 55]);
assert.equal(core.getLeftHandCompingMidi(cMajor[0]).length, 3);

const gMajorSevenths = core.buildDiatonicChords("G", true);
assert.equal(gMajorSevenths[0].name, "Gmaj7");
assert.equal(gMajorSevenths[4].name, "D7");
assert.equal(gMajorSevenths[6].name, "F♯m7♭5");
assert.equal(core.getClosedPositionMidi(gMajorSevenths[0], 60).length, 4);
assert.deepEqual(core.getLeftHandCompingMidi(gMajorSevenths[0]), [55, 59, 62, 66]);

[cMajor, gMajorSevenths].flat().forEach((chord) => {
    core.getLeftHandCompingMidi(chord).forEach((midi) => {
        assert.ok(midi >= 48 && midi < 72);
    });
});

const pop = core.getProgression([0, 4, 5, 3], "F", false);
assert.deepEqual(pop.map((chord) => chord.name), ["F", "C", "Dm", "B♭"]);
assert.ok(Math.abs(core.midiToFrequency(69) - 440) < 0.001);

const aNaturalMinor = core.buildDiatonicChords("A", false, "minor", "natural");
assert.deepEqual(aNaturalMinor.map((chord) => chord.name), ["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
assert.deepEqual(aNaturalMinor.map((chord) => chord.roman), ["i", "ii°", "III", "iv", "v", "VI", "VII"]);

const aHarmonicMinor = core.buildDiatonicChords("A", false, "minor", "harmonic");
assert.deepEqual(aHarmonicMinor.map((chord) => chord.name), ["Am", "Bdim", "C+", "Dm", "E", "F", "G♯dim"]);
assert.equal(aHarmonicMinor[4].functionName, "도미넌트");

const aMelodicMinor = core.buildDiatonicChords("A", false, "minor", "melodic");
assert.deepEqual(aMelodicMinor.map((chord) => chord.name), ["Am", "Bm", "C+", "D", "E", "F♯dim", "G♯dim"]);

const aHarmonicSevenths = core.buildDiatonicChords("A", true, "minor", "harmonic");
assert.equal(aHarmonicSevenths[4].name, "E7");
assert.equal(aHarmonicSevenths[6].name, "G♯dim7");
assert.deepEqual(aHarmonicSevenths[4].noteNames, ["E", "G♯", "B", "D"]);

["A", "E", "B", "F#", "C#", "D", "G", "C"].forEach((key) => {
    ["natural", "harmonic", "melodic"].forEach((variant) => {
        const chords = core.buildDiatonicChords(key, true, "minor", variant);
        assert.equal(chords.length, 7);
        chords.forEach((chord) => assert.ok(Number.isInteger(chord.rootPc)));
    });
});

const perfect = core.scoreRhythm([0, 500, 1000, 1500], [12, 490, 1015, 1490], 120);
assert.equal(perfect.matched, 4);
assert.equal(perfect.missed, 0);
assert.ok(perfect.score >= 95);

const partial = core.scoreRhythm([0, 500, 1000, 1500], [5, 510, 9000], 120);
assert.equal(partial.matched, 2);
assert.equal(partial.missed, 2);
assert.equal(partial.extra, 1);
assert.ok(partial.score < perfect.score);

assert.equal(core.RHYTHM_DICTATION_BANK.length, 48);
assert.equal(new Set(core.RHYTHM_DICTATION_BANK.map((pattern) => pattern.hits.join(","))).size, 48);
core.RHYTHM_DICTATION_BANK.forEach((pattern) => {
    assert.ok(["basic", "offbeat", "sixteenth", "mixed"].includes(pattern.level));
    assert.ok(pattern.hits.length >= 4);
    pattern.hits.forEach((step) => assert.ok(Number.isInteger(step) && step >= 0 && step < 16));
});

const exactDictation = core.scoreRhythmDictation([0, 3, 6, 8], [0, 3, 6, 8]);
assert.deepEqual(exactDictation, { exact: true, score: 100, correct: 4, missed: 0, extra: 0 });
const missedDictation = core.scoreRhythmDictation([0, 3, 6, 8], [0, 3, 7]);
assert.equal(missedDictation.exact, false);
assert.equal(missedDictation.correct, 2);
assert.equal(missedDictation.missed, 2);
assert.equal(missedDictation.extra, 1);

console.log("music-studio-unit: ok");
