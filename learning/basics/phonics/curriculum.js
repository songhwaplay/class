window.PHONICS_CURRICULUM = {
  program: { id: "phonics-k1", title: "소리씨앗 파닉스", audience: "유치원~초1", version: 1 },
  stages: [
    { id: "stage-1", title: "1단계 · SATPIN", status: "active", principle: "배운 글자와 Heart Word만 읽습니다." },
    { id: "stage-2", title: "2단계 · CVC와 기본 자음군", status: "planned" }, { id: "stage-3", title: "3단계 · Digraphs", status: "planned" }, { id: "stage-4", title: "4단계 · Silent E", status: "planned" }, { id: "stage-5", title: "5단계 · 자음군 확장", status: "planned" }, { id: "stage-6", title: "6단계 · Vowel Teams", status: "planned" }, { id: "stage-7", title: "7단계 · R-controlled·특수 패턴", status: "planned" }, { id: "stage-8", title: "8단계 · 음절·형태소", status: "planned" }
  ],
  lessons: [
    { id: "s1-l1", order: 1, title: "s · a", focus: ["s", "a"], review: [], words: [], blend: [], sentence: "", heartWords: [], dictation: [], note: "소리와 글자를 처음 만나요." },
    { id: "s1-l2", order: 2, title: "t · p", focus: ["t", "p"], review: ["s", "a"], words: ["sat", "tap"], blend: [{ parts: ["s", "a", "t"], answer: "sat" }, { parts: ["t", "a", "p"], answer: "tap" }], sentence: "Pat sat.", heartWords: [], dictation: ["sat", "tap"], note: "소리를 왼쪽부터 천천히 이어 읽어요." },
    { id: "s1-l3", order: 3, title: "i · n", focus: ["i", "n"], review: ["s", "a", "t", "p"], words: ["pin", "tin", "pan", "tan"], blend: [{ parts: ["p", "i", "n"], answer: "pin" }, { parts: ["t", "i", "n"], answer: "tin" }], sentence: "A pin. A pan.", heartWords: ["a"], dictation: ["pin", "pan"], note: "짧은 모음 /i/와 /a/를 귀로 구별해요." },
    { id: "s1-l4", order: 4, title: "m · d", focus: ["m", "d"], review: ["s", "a", "t", "p", "i", "n"], words: ["mad", "mat", "dip", "dim"], blend: [{ parts: ["m", "a", "d"], answer: "mad" }, { parts: ["d", "i", "p"], answer: "dip" }], sentence: "A man sat.", heartWords: ["a"], dictation: ["mad", "dip"], note: "마지막 소리까지 빠뜨리지 않고 말해요." },
    { id: "s1-l5", order: 5, title: "c · k", focus: ["c", "k"], review: ["s", "a", "t", "p", "i", "n", "m", "d"], words: ["cat", "kit", "cap", "kid"], blend: [{ parts: ["c", "a", "t"], answer: "cat" }, { parts: ["k", "i", "d"], answer: "kid" }], sentence: "A cat sat.", heartWords: ["a"], dictation: ["cat", "kit"], note: "글자를 보며 소리를 하나씩 붙여요." },
    { id: "s1-l6", order: 6, title: "누적 읽기", focus: [], review: ["s", "a", "t", "p", "i", "n", "m", "d", "c", "k"], words: ["sat", "pin", "cat", "kit", "sand"], blend: [{ parts: ["s", "a", "n", "d"], answer: "sand" }, { parts: ["c", "a", "t"], answer: "cat" }], sentence: "A cat sat. A kid sat.", heartWords: ["a"], dictation: ["cat", "sand"], note: "배운 소리만으로 문장을 읽는 날이에요." }
  ]
};
