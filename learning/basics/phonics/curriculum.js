window.PHONICS_CURRICULUM = {
  wordBank: {
    sat: { scene: "🧒🪑", korean: "앉았어요", hint: "의자에 앉은 모습" },
    tap: { scene: "👆🚪", korean: "톡 두드리다", hint: "손가락으로 가볍게 톡톡" },
    pin: { scene: "📌", korean: "핀", hint: "종이를 고정하는 핀" },
    tin: { scene: "🥫", korean: "깡통", hint: "금속으로 된 통" },
    pan: { scene: "🍳", korean: "프라이팬", hint: "음식을 굽는 팬" },
    mad: { scene: "😠", korean: "화난", hint: "화가 난 얼굴" },
    mat: { scene: "🧘", korean: "매트", hint: "바닥에 까는 매트" },
    dip: { scene: "🥕🥣", korean: "찍어 먹다", hint: "소스에 푹 찍어요" },
    dim: { scene: "🌙", korean: "어두운", hint: "빛이 약해 어두워요" },
    cat: { scene: "🐱", korean: "고양이", hint: "야옹 하는 동물" },
    cap: { scene: "🧢", korean: "모자", hint: "머리에 쓰는 모자" },
    kid: { scene: "🧒", korean: "아이", hint: "어린 사람" },
    sand: { scene: "🏖️", korean: "모래", hint: "해변의 고운 알갱이" }
  },
  lessons: [
    { id: "s1-l1", order: 1, title: "s · a", focus: ["s", "a"], review: [], words: [], blend: [], sentence: "", heartWords: [], dictation: [], note: "소리와 글자를 처음 만나요." },
    { id: "s1-l2", order: 2, title: "t · p", focus: ["t", "p"], review: ["s", "a"], words: ["sat", "tap"], blend: [{ parts: ["s", "a", "t"], answer: "sat" }, { parts: ["t", "a", "p"], answer: "tap" }], sentence: "Pat sat.", heartWords: [], dictation: ["sat"], note: "뜻과 장면을 먼저 보고, 그 다음 소리를 이어 읽어요." },
    { id: "s1-l3", order: 3, title: "i · n", focus: ["i", "n"], review: ["s", "a", "t", "p"], words: ["pin", "tin", "pan"], blend: [{ parts: ["p", "i", "n"], answer: "pin" }, { parts: ["t", "i", "n"], answer: "tin" }], sentence: "A pin. A pan.", heartWords: ["a"], dictation: ["pin"], note: "짧은 모음 /i/와 /a/를 귀로 구별해요." },
    { id: "s1-l4", order: 4, title: "m · d", focus: ["m", "d"], review: ["s", "a", "t", "p", "i", "n"], words: ["mad", "mat", "dip", "dim"], blend: [{ parts: ["m", "a", "d"], answer: "mad" }, { parts: ["d", "i", "p"], answer: "dip" }], sentence: "A man sat.", heartWords: ["a"], dictation: ["mad"], note: "마지막 소리까지 빠뜨리지 않고 말해요." },
    { id: "s1-l5", order: 5, title: "c · k", focus: ["c", "k"], review: ["s", "a", "t", "p", "i", "n", "m", "d"], words: ["cat", "cap", "kid"], blend: [{ parts: ["c", "a", "t"], answer: "cat" }, { parts: ["k", "i", "d"], answer: "kid" }], sentence: "A cat sat.", heartWords: ["a"], dictation: ["cat"], note: "글자를 보며 소리를 하나씩 붙여요." },
    { id: "s1-l6", order: 6, title: "누적 읽기", focus: [], review: ["s", "a", "t", "p", "i", "n", "m", "d", "c", "k"], words: ["sat", "pin", "cat", "sand"], blend: [{ parts: ["s", "a", "n", "d"], answer: "sand" }, { parts: ["c", "a", "t"], answer: "cat" }], sentence: "A cat sat. A kid sat.", heartWords: ["a"], dictation: ["cat"], note: "배운 소리와 뜻을 함께 떠올려요." }
  ]
};
