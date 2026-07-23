(() => {
  const data = window.PHONICS_CURRICULUM;
  const $ = (id) => document.getElementById(id);
  const storeKey = "phonicsSeedProgressV2";
  let current;
  const state = () => { try { return JSON.parse(localStorage.getItem(storeKey)) || { done: [] }; } catch { return { done: [] }; } };
  const save = (value) => localStorage.setItem(storeKey, JSON.stringify(value));
  const speak = (text) => { speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = "en-US"; utterance.rate = .7; speechSynthesis.speak(utterance); };
  const target = () => current?.dictation[0] || current?.words[0] || "sat";
  function renderMenu() {
    const saved = state();
    $("progressText").textContent = `나의 진도 ${saved.done.length} / ${data.lessons.length} 차시`;
    $("progressBar").style.width = `${saved.done.length / data.lessons.length * 100}%`;
    $("lessonList").innerHTML = data.lessons.map((lesson) => `<button class="${saved.done.includes(lesson.id) ? "done" : ""}" data-id="${lesson.id}">${lesson.order}차시<br><b>${lesson.title}</b></button>`).join("");
    $("lessonList").querySelectorAll("button").forEach((button) => button.onclick = () => openLesson(button.dataset.id));
  }
  function openLesson(id) {
    current = data.lessons.find((lesson) => lesson.id === id);
    $("study").hidden = false;
    $("lessonLabel").textContent = `${current.order}차시 · ${current.title}`;
    $("focusTitle").textContent = current.focus.length ? `${current.focus.join(" · ")} 소리를 만나요.` : "배운 소리를 다시 모아요.";
    $("soundLetters").innerHTML = (current.focus.length ? current.focus : current.review).map((letter) => `<span>${letter}</span>`).join("");
    $("lessonNote").textContent = current.note;
    $("wordCards").innerHTML = current.words.map((word) => { const item = data.wordBank[word]; return `<button class="word-card" data-word="${word}"><span>${item.scene}</span><b>${word}</b><strong>${item.korean}</strong><small>${item.hint}</small></button>`; }).join("") || "이번 차시는 새 글자와 소리를 먼저 만나요.";
    $("wordCards").querySelectorAll("button").forEach((button) => button.onclick = () => speak(button.dataset.word));
    $("blendArea").innerHTML = current.blend.map((item) => `<div class="blend-row">${item.parts.map((part) => `<span class="chip">${part}</span>`).join("")} → <button data-answer="${item.answer}">정답 보기</button><b class="blend-answer"></b></div>`).join("") || "다음 차시에서 소리를 모아 읽어 볼게요.";
    $("blendArea").querySelectorAll("button").forEach((button) => button.onclick = () => { button.parentElement.querySelector(".blend-answer").textContent = button.dataset.answer; button.remove(); });
    const item = data.wordBank[target()];
    $("dictationScene").innerHTML = item ? `<span>${item.scene}</span><div><b>${item.korean}</b><small>${item.hint}</small></div>` : "";
    $("answer").value = ""; $("feedback").textContent = ""; $("feedback").className = "";
    $("sentence").textContent = current.sentence || "새 글자를 소리 내어 읽어 보세요.";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
  $("hearFocus").onclick = () => speak((current.focus.length ? current.focus : current.review).join(" "));
  $("hearWord").onclick = () => speak(target());
  $("hearSentence").onclick = () => speak(current.sentence);
  $("check").onclick = () => { const correct = target(); const feedback = $("feedback"); if ($("answer").value.trim().toLowerCase() === correct) { feedback.textContent = `맞아요! ${correct}`; feedback.className = "good"; } else { feedback.textContent = "괜찮아요. 그림을 다시 보고 단어를 한 번 더 들어 볼까요?"; feedback.className = "bad"; } };
  $("complete").onclick = () => { const saved = state(); if (!saved.done.includes(current.id)) saved.done.push(current.id); save(saved); renderMenu(); $("complete").textContent = "완료했어요! ✓"; };
  $("back").onclick = () => { $("study").hidden = true; window.scrollTo({ top: 0, behavior: "smooth" }); };
  $("reset").onclick = () => { localStorage.removeItem(storeKey); renderMenu(); $("study").hidden = true; };
  renderMenu();
})();
