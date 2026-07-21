(() => {
  "use strict";

  const state = { pilots: [], active: null, answers: new Map(), currentIndex: 0, questionStartedAt: 0 };
  const byId = (id) => document.getElementById(id);

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || "요청을 처리하지 못했습니다.");
      error.code = payload.error;
      throw error;
    }
    return payload;
  }

  function showView(view) {
    byId("pilotDashboard").hidden = view !== "dashboard";
    byId("questionView").hidden = view !== "question";
    byId("completionView").hidden = view !== "completion";
  }

  function pilotButton(pilot) {
    const button = node("button", `button ${pilot.submitted ? "secondary" : "primary"}`, pilot.submitted ? "제출 완료" : pilot.started ? "이어서 풀기" : "시작하기");
    button.type = "button";
    button.disabled = pilot.submitted;
    button.addEventListener("click", () => openPilot(pilot.id));
    return button;
  }

  function renderPilots() {
    const list = byId("studentPilotList");
    list.replaceChildren();
    if (!state.pilots.length) {
      list.append(node("p", "empty-pilots", "지금 열린 독해 활동이 없습니다. 선생님이 파일럿을 공개하면 여기에 나타나요."));
      return;
    }
    state.pilots.forEach((pilot) => {
      const card = node("article", "student-pilot-card");
      const meta = node("div", "student-pilot-meta");
      meta.append(node("span", "", `${pilot.itemCount}문항`), node("span", "", pilot.submitted ? "완료" : pilot.started ? "진행 중" : "새 활동"));
      card.append(meta, node("h3", "", pilot.title), node("p", "", "각 문항은 한 번만 답할 수 있어요. 지문을 충분히 읽고 가장 알맞은 보기를 고르세요."), pilotButton(pilot));
      list.append(card);
    });
  }

  async function loadPilots() {
    const payload = await api("/api/reading/student/pilots");
    state.pilots = payload.pilots;
    byId("studentName").textContent = payload.student.name;
    byId("studentClass").textContent = `${payload.student.schoolName} · ${payload.student.grade}학년 ${payload.student.classNumber}반`;
    renderPilots();
  }

  function firstUnansweredIndex() {
    return state.active.items.findIndex((item) => !state.answers.has(item.versionId));
  }

  function renderQuestion() {
    const item = state.active.items[state.currentIndex];
    if (!item) return;
    const total = state.active.items.length;
    byId("questionLevel").textContent = `${item.track === "en" ? "E" : "K"}${item.targetLevel}`;
    byId("questionProgress").textContent = `${state.currentIndex + 1} / ${total}`;
    byId("pilotQuestionTitle").textContent = state.active.pilot.title;
    byId("progressFill").style.width = `${Math.round(((state.currentIndex + 1) / total) * 100)}%`;
    byId("questionTopic").textContent = item.topicTitle;
    byId("studentPassage").textContent = item.passageText;
    byId("studentPrompt").textContent = item.promptText;
    byId("answerStatus").textContent = "";
    const choices = byId("studentChoices");
    choices.replaceChildren();
    item.choices.forEach((choiceText, index) => {
      const label = node("label", "student-choice");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "studentAnswer";
      radio.value = String(index);
      const copy = node("div");
      copy.append(node("span", "choice-number", `${index + 1}`), document.createTextNode(` ${choiceText}`));
      label.append(radio, copy);
      choices.append(label);
    });
    state.questionStartedAt = performance.now();
    showView("question");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openPilot(pilotId) {
    try {
      const payload = await api(`/api/reading/student/pilots/${pilotId}/start`, { method: "POST", body: "{}" });
      if (payload.attempt.submitted) {
        showView("completion");
        return;
      }
      state.active = payload;
      state.answers = new Map(payload.answers.map((answer) => [answer.versionId, answer.selectedIndex]));
      const next = firstUnansweredIndex();
      if (next < 0) {
        await submitPilot();
        return;
      }
      state.currentIndex = next;
      renderQuestion();
    } catch (error) {
      byId("studentGateMessage").textContent = error.message;
      byId("studentGateLink").hidden = false;
      byId("studentGate").hidden = false;
      byId("studentApp").hidden = true;
    }
  }

  async function saveAnswer(event) {
    event.preventDefault();
    const selected = document.querySelector('input[name="studentAnswer"]:checked');
    if (!selected) {
      byId("answerStatus").textContent = "보기를 하나 선택해 주세요.";
      return;
    }
    const button = byId("saveAnswerButton");
    const item = state.active.items[state.currentIndex];
    const responseMs = Math.max(250, Math.min(3600000, Math.round(performance.now() - state.questionStartedAt)));
    button.disabled = true;
    byId("answerStatus").textContent = "답을 저장하고 있어요…";
    try {
      await api(`/api/reading/student/pilots/${state.active.pilot.id}/responses`, {
        method: "POST",
        body: JSON.stringify({ versionId: item.versionId, selectedIndex: Number(selected.value), responseMs })
      });
      state.answers.set(item.versionId, Number(selected.value));
      const next = firstUnansweredIndex();
      if (next < 0) await submitPilot();
      else {
        state.currentIndex = next;
        renderQuestion();
      }
    } catch (error) {
      byId("answerStatus").textContent = error.message;
      if (error.code === "RESPONSE_ALREADY_SAVED") await openPilot(state.active.pilot.id);
    } finally {
      button.disabled = false;
    }
  }

  async function submitPilot() {
    byId("answerStatus").textContent = "전체 응답을 제출하고 있어요…";
    try {
      await api(`/api/reading/student/pilots/${state.active.pilot.id}/submit`, { method: "POST", body: "{}" });
      showView("completion");
    } catch (error) {
      byId("answerStatus").textContent = error.message;
    }
  }

  async function backToDashboard() {
    state.active = null;
    await loadPilots();
    showView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function wireEvents() {
    byId("answerForm").addEventListener("submit", saveAnswer);
    byId("backToPilotsButton").addEventListener("click", backToDashboard);
    byId("completionBackButton").addEventListener("click", backToDashboard);
  }

  async function activateStudent(session) {
    if (session.user?.role !== "student" || !session.membership) {
      throw new Error("먼저 홈에서 학급 코드와 학생 번호를 연결해 주세요.");
    }
    await loadPilots();
    byId("studentGate").hidden = true;
    byId("studentApp").hidden = false;
    showView("dashboard");
  }

  async function waitForGoogle() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (window.google?.accounts?.id) return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  async function renderGoogleButton(clientId) {
    const container = byId("pilotGoogleSignIn");
    container.hidden = false;
    if (!await waitForGoogle()) throw new Error("Google 로그인을 불러오지 못했습니다. 페이지를 새로고침해 주세요.");
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        byId("studentGateMessage").textContent = "학교 계정을 확인하고 있어요…";
        try {
          const result = await api("/api/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential })
          });
          await activateStudent({ signedIn: true, user: result.user, membership: result.membership });
        } catch (error) {
          byId("studentGateMessage").textContent = error.message;
          byId("studentGateLink").hidden = false;
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false
    });
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: Math.min(340, container.clientWidth || 340)
    });
  }

  async function start() {
    wireEvents();
    try {
      const config = await api("/api/auth/config");
      if (!config.enabled) throw new Error("학교 계정 로그인이 아직 설정되지 않았습니다.");
      const session = await api("/api/auth/me");
      if (!session.signedIn) {
        byId("studentGateMessage").textContent = "학교 Google 계정으로 로그인해 주세요.";
        await renderGoogleButton(config.clientId);
        return;
      }
      await activateStudent(session);
    } catch (error) {
      byId("studentGateMessage").textContent = error.message;
      byId("studentGateLink").hidden = false;
    }
  }

  start();
})();
