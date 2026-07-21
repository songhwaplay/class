(() => {
  "use strict";

  const state = { options: { classes: [], items: [] }, pilots: [], selectedVersions: new Set() };
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
    if (!response.ok) throw new Error(payload.message || "요청을 처리하지 못했습니다.");
    return payload;
  }

  function setStatus(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
  }

  function toast(message, isError = false) {
    const element = byId("pilotToast");
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => { element.hidden = true; }, 3600);
  }

  function levelCode(item) {
    return `${item.track === "en" ? "E" : "K"}${item.targetLevel}`;
  }

  function classLabel(classroom) {
    return `${classroom.schoolName} · ${classroom.grade}학년 ${classroom.classNumber}반 · ${classroom.rosterCount}명`;
  }

  function renderClasses() {
    const select = byId("pilotClass");
    select.replaceChildren();
    if (!state.options.classes.length) {
      select.append(new Option("먼저 학급 명단을 등록해 주세요", ""));
      select.disabled = true;
      return;
    }
    select.disabled = false;
    state.options.classes.forEach((classroom) => select.append(new Option(classLabel(classroom), String(classroom.id))));
  }

  function updateSelectedCount() {
    byId("selectedCount").textContent = `${state.selectedVersions.size}개 선택`;
  }

  function renderApprovedItems() {
    const list = byId("approvedItemList");
    const track = byId("pilotTrack").value;
    const level = byId("pilotLevel").value;
    const items = state.options.items.filter((item) =>
      (!track || item.track === track) && (!level || item.targetLevel === Number(level))
    );
    list.replaceChildren();
    if (!items.length) {
      list.append(node("p", "pilot-empty", state.options.items.length
        ? "선택한 조건의 승인 문항이 없습니다."
        : "아직 파일럿 승인을 받은 문항이 없습니다. 먼저 서로 다른 검수자 두 명의 승인을 받아 주세요."));
      return;
    }
    items.forEach((item) => {
      const label = node("label", "approved-item");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.selectedVersions.has(item.versionId);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked && state.selectedVersions.size >= 30) {
          checkbox.checked = false;
          toast("한 파일럿에는 최대 30문항까지 넣을 수 있습니다.", true);
          return;
        }
        if (checkbox.checked) state.selectedVersions.add(item.versionId);
        else state.selectedVersions.delete(item.versionId);
        updateSelectedCount();
      });
      const copy = node("div");
      copy.append(
        node("strong", "", `${levelCode(item)} · ${item.topicTitle}`),
        node("span", "", `${item.promptText} · ${item.itemKey}`)
      );
      label.append(checkbox, copy);
      list.append(label);
    });
  }

  function statusLabel(status) {
    return { draft: "초안", open: "진행 중", closed: "종료" }[status] || status;
  }

  function updateStats() {
    byId("approvedCount").textContent = state.options.items.length;
    byId("draftPilotCount").textContent = state.pilots.filter((pilot) => pilot.status === "draft").length;
    byId("openPilotCount").textContent = state.pilots.filter((pilot) => pilot.status === "open").length;
    byId("closedPilotCount").textContent = state.pilots.filter((pilot) => pilot.status === "closed").length;
  }

  async function pilotAction(pilot, action) {
    if (action === "close" && !window.confirm("학생 응시를 종료할까요? 종료 후에는 새 답안을 받을 수 없습니다.")) return;
    try {
      await api(`/api/reading/admin/pilots/${pilot.id}/${action}`, { method: "POST", body: "{}" });
      await refreshPilots();
      toast(action === "open" ? "학생에게 파일럿을 공개했습니다." : "파일럿을 종료했습니다.");
    } catch (error) {
      toast(error.message, true);
    }
  }

  function actionButton(text, className, handler) {
    const button = node("button", className, text);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function renderPilots() {
    const list = byId("pilotList");
    list.replaceChildren();
    if (!state.pilots.length) {
      list.append(node("p", "pilot-empty", "아직 만든 파일럿이 없습니다. 승인 문항을 골라 첫 세트를 만들어 보세요."));
      updateStats();
      return;
    }
    state.pilots.forEach((pilot) => {
      const card = node("article", "pilot-card");
      const head = node("div", "pilot-card-head");
      head.append(
        node("span", `status-chip ${pilot.status}`, statusLabel(pilot.status)),
        node("span", "count-pill", `${pilot.itemCount}문항`)
      );
      const title = node("h3", "", pilot.title);
      const info = node("p", "", `${pilot.schoolName} · ${pilot.grade}학년 ${pilot.classNumber}반 · 시작 ${pilot.startedCount}명 · 제출 ${pilot.submittedCount}명`);
      const actions = node("div", "pilot-card-actions");
      if (pilot.status === "draft") {
        actions.append(actionButton("학생에게 공개", "button primary small", () => pilotAction(pilot, "open")));
      }
      if (pilot.status === "open") {
        actions.append(actionButton("응시 종료", "button accent small", () => pilotAction(pilot, "close")));
      }
      actions.append(actionButton("집계 보기", "button secondary small", () => showResults(pilot.id)));
      card.append(head, title, info, actions);
      list.append(card);
    });
    updateStats();
  }

  async function refreshPilots() {
    const payload = await api("/api/reading/admin/pilots");
    state.pilots = payload.pilots;
    renderPilots();
  }

  function timeText(value) {
    if (value === null || value === undefined) return "자료 없음";
    return `${(value / 1000).toFixed(1)}초`;
  }

  function renderResults(payload) {
    const section = byId("resultsSection");
    const pilot = payload.pilot;
    byId("resultsTitle").textContent = pilot.title;
    const summary = byId("resultsSummary");
    summary.replaceChildren();
    [
      ["학급 인원", `${pilot.rosterCount}명`],
      ["응시 시작", `${pilot.startedCount}명`],
      ["제출 완료", `${pilot.submittedCount}명`]
    ].forEach(([label, value]) => {
      const tile = node("div", "summary-tile");
      tile.append(node("span", "", label), node("strong", "", value));
      summary.append(tile);
    });
    const items = byId("resultsItems");
    items.replaceChildren();
    payload.items.forEach((item) => {
      const card = node("article", "result-card");
      const meta = node("div", "result-meta");
      meta.append(node("span", "section-kicker", `${item.track === "en" ? "E" : "K"}${item.targetLevel} · ${item.position}번`), node("span", "count-pill", `${item.responseCount}명 응답`));
      const accuracy = item.accuracy === null ? "자료 없음" : `${Math.round(item.accuracy * 100)}%`;
      card.append(meta, node("h3", "", item.topicTitle), node("p", "", item.promptText));
      const metrics = node("div", "result-metrics");
      metrics.append(
        node("span", "metric-pill", `정답률 ${accuracy}`),
        node("span", "metric-pill", `평균 ${timeText(item.averageResponseMs)}`),
        node("span", "metric-pill", `중앙 ${timeText(item.medianResponseMs)}`)
      );
      card.append(metrics);
      const bars = node("div", "choice-bars");
      const maximum = Math.max(1, ...item.choiceCounts);
      item.choiceCounts.forEach((count, index) => {
        const wrapper = node("div");
        const barHead = node("div", "choice-bar-head");
        barHead.append(node("span", "", `${index + 1}번 · ${item.choices[index]}`), node("span", "", `${count}명`));
        const track = node("div", "choice-bar-track");
        const fill = node("div", "choice-bar-fill");
        fill.style.width = `${Math.round((count / maximum) * 100)}%`;
        track.append(fill);
        wrapper.append(barHead, track);
        bars.append(wrapper);
      });
      card.append(bars);
      items.append(card);
    });
    section.hidden = false;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function showResults(pilotId) {
    try {
      const payload = await api(`/api/reading/admin/pilots/${pilotId}/results`);
      renderResults(payload);
    } catch (error) {
      toast(error.message, true);
    }
  }

  async function createPilot(event) {
    event.preventDefault();
    const status = byId("createStatus");
    if (!state.selectedVersions.size) {
      setStatus(status, "승인 문항을 하나 이상 선택해 주세요.", true);
      return;
    }
    const button = byId("createPilotButton");
    button.disabled = true;
    setStatus(status, "초안 만드는 중…");
    try {
      await api("/api/reading/admin/pilots", {
        method: "POST",
        body: JSON.stringify({
          title: byId("pilotTitle").value,
          classId: Number(byId("pilotClass").value),
          versionIds: [...state.selectedVersions]
        })
      });
      state.selectedVersions.clear();
      byId("pilotTitle").value = "";
      updateSelectedCount();
      renderApprovedItems();
      await refreshPilots();
      setStatus(status, "초안을 만들었습니다.");
      toast("파일럿 초안을 만들었습니다. 확인 후 학생에게 공개하세요.");
    } catch (error) {
      setStatus(status, error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  function wireEvents() {
    byId("pilotForm").addEventListener("submit", createPilot);
    ["pilotTrack", "pilotLevel"].forEach((id) => byId(id).addEventListener("change", renderApprovedItems));
    byId("refreshPilotsButton").addEventListener("click", () => refreshPilots().catch((error) => toast(error.message, true)));
    byId("closeResultsButton").addEventListener("click", () => { byId("resultsSection").hidden = true; });
  }

  async function start() {
    wireEvents();
    try {
      const config = await api("/api/auth/config");
      if (!config.enabled) throw new Error("로그인 및 데이터베이스 설정이 필요합니다.");
      const session = await api("/api/auth/me");
      if (!session.signedIn) throw new Error("먼저 로그인해 주세요.");
      const access = await api("/api/reading/access");
      if (!access.canEdit) throw new Error("파일럿을 운영할 출제 권한이 없습니다.");
      byId("accountEmail").textContent = access.user.email;
      const [options, pilots] = await Promise.all([
        api("/api/reading/admin/pilot-options"),
        api("/api/reading/admin/pilots")
      ]);
      state.options = options;
      state.pilots = pilots.pilots;
      renderClasses();
      renderApprovedItems();
      renderPilots();
      updateSelectedCount();
      byId("gate").hidden = true;
      byId("pilotApp").hidden = false;
    } catch (error) {
      byId("gateMessage").textContent = error.message;
      byId("gateLink").hidden = false;
    }
  }

  start();
})();
