const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const htmlPath = path.join(__dirname, "..", "classtools", "roaster.html");
const html = fs.readFileSync(htmlPath, "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, "Inline roster script is missing.");
assert.match(html, /id="school-name"/, "School name input is missing.");
assert.match(html, /id="school-year"/, "School year input is missing.");
assert.match(html, /id="grade"/, "Grade input is missing.");
assert.match(html, /id="class-number"/, "Class number input is missing.");
assert.match(html, /id="teacher-name"/, "Teacher name input is missing.");
assert.match(html, /id="numbers"/, "Number input is missing.");
assert.match(html, /id="names"/, "Name input is missing.");

const listeners = new Map();

function element(key) {
    return {
        key,
        value: "",
        textContent: "",
        dataset: {},
        disabled: false,
        hidden: false,
        children: [],
        attributes: {},
        setAttribute(name, value) {
            this.attributes[name] = value;
        },
        addEventListener(name, callback) {
            listeners.set(`${key}:${name}`, callback);
        },
        replaceChildren() {
            this.children = [];
        },
        append(...nodes) {
            this.children.push(...nodes);
        },
    };
}

const selectors = [
    "#school-name",
    "#school-year",
    "#grade",
    "#class-number",
    "#teacher-name",
    "#profile-status",
    "#class-summary",
    "#numbers",
    "#names",
    "#number-count",
    "#name-count",
    "#input-status",
    "#save-button",
    "#roster-body",
    "#table-wrap",
    "#empty-preview",
    "#student-total",
];

const elements = Object.fromEntries(selectors.map((selector) => [selector, element(selector)]));
const storage = new Map();
storage.set("class-teacher-v1", "김담임");

const context = {
    document: {
        querySelector(selector) {
            return elements[selector];
        },
        createElement(tag) {
            return element(tag);
        },
    },
    localStorage: {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, value);
        },
        removeItem(key) {
            storage.delete(key);
        },
    },
    JSON,
};

vm.runInNewContext(script, context, { filename: htmlPath });

const thisYear = new Date().getFullYear();
assert.deepEqual(
    elements["#school-year"].children.map((option) => option.value),
    [String(thisYear - 1), String(thisYear), String(thisYear + 1)],
    "School year should offer only last, current, and next year.",
);
assert.equal(elements["#school-year"].value, String(thisYear), "Current year should be selected by default.");
assert.equal(elements["#teacher-name"].value, "김담임", "The saved teacher name should load.");
elements["#school-name"].value = "계상초등학교";
elements["#grade"].value = "3";
elements["#class-number"].value = "2";
elements["#teacher-name"].value = "이담임";
listeners.get("#teacher-name:input")();
const profile = JSON.parse(storage.get("class-profile-v1"));
assert.deepEqual(profile, {
    schoolName: "계상초등학교",
    schoolYear: String(thisYear),
    grade: "3",
    classNumber: "2",
    teacherName: "이담임",
});
assert.equal(elements["#profile-status"].textContent, "자동 저장됨", "Profile save status should be shown.");
assert.match(elements["#class-summary"].textContent, /계상초등학교/);
assert.match(elements["#class-summary"].textContent, /3학년 2반/);

assert.equal(elements["#save-button"].disabled, true, "An empty roster should not save.");

elements["#numbers"].value = "1\n2\n3";
elements["#names"].value = "김민준\n이서연\n박지우";
listeners.get("#numbers:input")();

assert.equal(elements["#save-button"].disabled, false, "Matching rows should be saveable.");
assert.equal(elements["#roster-body"].children.length, 3, "All matching rows should be previewed.");
assert.equal(elements["#student-total"].textContent, "3명", "The student total should be shown.");

listeners.get("#save-button:click")();
const saved = JSON.parse(storage.get("class-roster-v1"));
assert.deepEqual(JSON.parse(JSON.stringify(saved)), [
    { number: "1", name: "김민준" },
    { number: "2", name: "이서연" },
    { number: "3", name: "박지우" },
]);

elements["#names"].value = "김민준\n이서연";
listeners.get("#names:input")();

assert.equal(elements["#save-button"].disabled, true, "Mismatched rows should not save.");
assert.match(elements["#input-status"].textContent, /부족/, "A row mismatch should explain the problem.");

elements["#numbers"].value = "1\n1";
elements["#names"].value = "김민준\n이서연";
listeners.get("#numbers:input")();

assert.equal(elements["#save-button"].disabled, true, "Duplicate numbers should not save.");
assert.match(elements["#input-status"].textContent, /중복/, "Duplicate numbers should explain the problem.");

elements["#numbers"].value = "1\n\n3";
elements["#names"].value = "김민준\n이서연\n박지우";
listeners.get("#numbers:input")();

assert.equal(elements["#save-button"].disabled, true, "Blank middle rows should not save.");
assert.match(elements["#input-status"].textContent, /빈 줄/, "Blank middle rows should explain the problem.");

console.log("Class roster contract: OK");
