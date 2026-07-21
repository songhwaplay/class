(() => {
  "use strict";

  const DOMAIN_LABELS = {
    science: "과학",
    math_data: "수학·데이터",
    society_economy: "사회·경제",
    technology_information: "기술·정보",
    health_life: "보건·생활",
    ethics_citizenship: "도덕·시민",
    arts_language: "예술·언어",
    environment: "환경"
  };
  const QUESTION_LABELS = {
    explicit: "명시 정보",
    main_idea: "주제·요지",
    title: "제목",
    purpose: "목적",
    inference: "추론",
    blank: "빈칸",
    order: "순서",
    insertion: "문장 삽입",
    implication: "함축 의미",
    vocabulary: "문맥 어휘",
    summary: "요약",
    content_match: "내용 일치",
    data_interpretation: "자료 해석"
  };
  const STATUS_LABELS = {
    draft: "초안",
    auto_checked: "자동검사 완료",
    review_pending: "검수 대기",
    changes_requested: "수정 필요",
    approved_for_pilot: "파일럿 승인",
    calibrated: "난도 보정",
    published: "공개",
    retired: "중단"
  };
  const REVIEW_RUBRIC_LABELS = {
    factAccuracy: "사실이 정확한가",
    selfContained: "지문만으로 풀 수 있는가",
    uniqueAnswer: "정답이 하나뿐인가",
    answerEvidence: "정답 근거가 분명한가",
    distractorQuality: "오답이 그럴듯하고 공정한가",
    levelFit: "목표 수준에 맞는가",
    naturalLanguage: "문장이 자연스러운가",
    educationalValue: "배울 가치가 있는가",
    safety: "편견·위험·유해성이 없는가",
    explanationQuality: "해설이 정확하고 유용한가"
  };

  const state = {
    view: "items",
    topics: [],
    items: [],
    selectedTopicId: null,
    selectedItemId: null,
    topicDetail: null,
    itemDetail: null,
    currentVersion: null,
    sourceEditingId: null,
    searchTimer: null,
    access: null
  };

  const byId = (id) => document.getElementById(id);
  const gate = byId("gate");
  const gateMessage = byId("gateMessage");
  const adminLoginLink = byId("adminLoginLink");
  const app = byId("app");
  const recordList = byId("recordList");
  const emptyState = byId("emptyState");
  const topicEditor = byId("topicEditor");
  const itemEditor = byId("itemEditor");
  const toastElement = byId("toast");

  function node(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
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
      error.details = payload.details;
      throw error;
    }
    return payload;
  }

  function showToast(message, error = false) {
    toastElement.textContent = message;
    toastElement.classList.toggle("error", error);
    toastElement.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toastElement.hidden = true; }, 3600);
  }

  function setStatus(element, message, error = false) {
    element.textContent = message;
    element.classList.toggle("error", error);
  }

  function listFromLines(value) {
    return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }

  function listFromComma(value) {
    return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  }

  function dateValue(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  function expectedChoiceCount(level) {
    if (Number(level) <= 2) return 3;
    if (Number(level) <= 4) return 4;
    return 5;
  }

  function levelCode(track, level) {
    return `${track === "en" ? "E" : "K"}${level}`;
  }

  function showEditor(which) {
    emptyState.hidden = which !== "empty";
    topicEditor.hidden = which !== "topic";
    itemEditor.hidden = which !== "item";
  }

  function populateStaticSelects() {
    const domainSelects = [byId("primaryDomain"), byId("domainFilter")];
    domainSelects.forEach((select) => {
      select.replaceChildren();
      if (select.id === "domainFilter") select.append(new Option("전체", ""));
      Object.entries(DOMAIN_LABELS).forEach(([value, label]) => select.append(new Option(label, value)));
    });
    const questionType = byId("questionType");
    questionType.replaceChildren();
    Object.entries(QUESTION_LABELS).forEach(([value, label]) => questionType.append(new Option(label, value)));
  }

  async function refreshSummary() {
    const summary = await api("/api/reading/admin/summary");
    byId("statDraft").textContent = summary.draft;
    byId("statChecked").textContent = summary.autoChecked;
    byId("statReview").textContent = summary.reviewPending;
    byId("statExpired").textContent = summary.expiredSources;
    byId("statPublished").textContent = summary.published;
  }

  function topicQuery() {
    const params = new URLSearchParams();
    const q = byId("searchInput").value.trim();
    const domain = byId("domainFilter").value;
    if (q) params.set("q", q);
    if (domain) params.set("domain", domain);
    return params.toString();
  }

  function itemQuery() {
    const params = new URLSearchParams();
    const q = byId("searchInput").value.trim();
    const track = byId("trackFilter").value;
    const level = byId("levelFilter").value;
    const status = byId("statusFilter").value;
    if (q) params.set("q", q);
    if (track) params.set("track", track);
    if (level) params.set("level", level);
    if (status) params.set("status", status);
    return params.toString();
  }

  async function refreshTopics() {
    const payload = await api(`/api/reading/admin/topics?${topicQuery()}`);
    state.topics = payload.topics;
    fillTopicOptions();
    if (state.view === "topics") renderRecordList();
  }

  async function refreshItems() {
    const payload = await api(`/api/reading/admin/items?${itemQuery()}`);
    state.items = payload.items;
    if (state.view === "items") renderRecordList();
  }

  async function refreshAll() {
    await Promise.all([refreshSummary(), refreshTopics(), refreshItems()]);
  }

  async function importSamples() {
    const button = byId("importSampleButton");
    const confirmed = window.confirm("수면과 기억·평균의 함정 샘플 32문항을 불러올까요? 이미 있는 문항은 건너뜁니다.");
    if (!confirmed) return;
    button.disabled = true;
    button.textContent = "불러오는 중…";
    try {
      const result = await api("/api/reading/admin/sample-import", { method: "POST", body: "{}" });
      await refreshAll();
      const message = result.itemsCreated
        ? `${result.itemsCreated}문항과 ${result.topicsCreated}개 주제를 불러왔습니다.`
        : `이미 등록된 샘플입니다. ${result.itemsSkipped}문항을 건너뛰었습니다.`;
      showToast(message);
    } catch (error) {
      showToast(error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = "샘플 불러오기";
    }
  }

  function fillTopicOptions() {
    const select = byId("itemTopic");
    const current = select.value;
    select.replaceChildren();
    state.topics.forEach((topic) => {
      select.append(new Option(`${topic.title} · ${topic.topicKey}`, String(topic.id)));
    });
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  }

  function recordButton({ active, metaLeft, metaRight, title, subtitle, onClick }) {
    const button = node("button", `record-card${active ? " active" : ""}`);
    button.type = "button";
    const meta = node("div", "record-meta");
    meta.append(node("span", "", metaLeft), node("span", "", metaRight));
    button.append(meta, node("strong", "", title), node("p", "", subtitle));
    button.addEventListener("click", onClick);
    return button;
  }

  function renderRecordList() {
    recordList.replaceChildren();
    const records = state.view === "items" ? state.items : state.topics;
    byId("listCount").textContent = `${records.length}개`;
    if (!records.length) {
      recordList.append(node("p", "record-empty", state.view === "items" ? "조건에 맞는 문항이 없습니다.\n새 문항을 만들어 보세요." : "등록된 지식 원본이 없습니다."));
      return;
    }
    if (state.view === "items") {
      state.items.forEach((item) => {
        recordList.append(recordButton({
          active: item.id === state.selectedItemId,
          metaLeft: `${levelCode(item.track, item.targetLevel)} · ${QUESTION_LABELS[item.questionType] || item.questionType}`,
          metaRight: STATUS_LABELS[item.status] || item.status || "버전 없음",
          title: item.topicTitle,
          subtitle: item.promptText || item.itemKey,
          onClick: () => openItem(item.id)
        }));
      });
    } else {
      state.topics.forEach((topic) => {
        recordList.append(recordButton({
          active: topic.id === state.selectedTopicId,
          metaLeft: DOMAIN_LABELS[topic.primaryDomain] || topic.primaryDomain,
          metaRight: `${topic.itemCount}문항 · ${topic.sourceCount}출처`,
          title: topic.title,
          subtitle: topic.topicKey,
          onClick: () => openTopic(topic.id)
        }));
      });
    }
  }

  async function switchView(view) {
    if (view === "topics" && !state.access?.canEdit) return;
    state.view = view;
    document.querySelectorAll(".view-tab").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    byId("itemFilters").hidden = view !== "items";
    byId("domainFilterField").hidden = view !== "topics";
    byId("filterTitle").textContent = view === "items" ? "문항 찾기" : "지식 원본 찾기";
    byId("searchInput").placeholder = view === "items" ? "주제명 또는 문항 키" : "주제명 또는 주제 키";
    renderRecordList();
    if (view === "items" && state.selectedItemId) await openItem(state.selectedItemId);
    else if (view === "topics" && state.selectedTopicId) await openTopic(state.selectedTopicId);
    else showEditor("empty");
  }

  function topicPayload() {
    return {
      topicKey: byId("topicKey").value,
      title: byId("topicTitle").value,
      primaryDomain: byId("primaryDomain").value,
      relatedDomains: listFromComma(byId("relatedDomains").value),
      coreQuestion: byId("coreQuestion").value,
      coreFacts: listFromLines(byId("coreFacts").value),
      misconceptions: listFromLines(byId("misconceptions").value),
      practicalUse: byId("practicalUse").value,
      ageScope: {
        lowerElementary: byId("ageLower").value.trim(),
        upperElementary: byId("ageUpper").value.trim(),
        middleSchool: byId("ageMiddle").value.trim(),
        highSchool: byId("ageHigh").value.trim()
      },
      uncertaintyNotes: byId("uncertaintyNotes").value,
      status: byId("topicStatus").value
    };
  }

  function fillTopicForm(topic = null) {
    const ageScope = topic?.ageScope || {};
    byId("topicKey").value = topic?.topicKey || "";
    byId("topicTitle").value = topic?.title || "";
    byId("primaryDomain").value = topic?.primaryDomain || "science";
    byId("relatedDomains").value = (topic?.relatedDomains || []).join(", ");
    byId("coreQuestion").value = topic?.coreQuestion || "";
    byId("coreFacts").value = (topic?.coreFacts || []).join("\n");
    byId("misconceptions").value = (topic?.misconceptions || []).join("\n");
    byId("practicalUse").value = topic?.practicalUse || "";
    byId("ageLower").value = ageScope.lowerElementary || "";
    byId("ageUpper").value = ageScope.upperElementary || "";
    byId("ageMiddle").value = ageScope.middleSchool || "";
    byId("ageHigh").value = ageScope.highSchool || "";
    byId("uncertaintyNotes").value = topic?.uncertaintyNotes || "";
    byId("topicStatus").value = topic?.status || "draft";
    byId("topicDirtyBadge").hidden = true;
    setStatus(byId("topicSaveStatus"), "");
  }

  function newTopic() {
    state.selectedTopicId = null;
    state.topicDetail = null;
    renderRecordList();
    fillTopicForm();
    byId("topicEditorTitle").textContent = "새 지식 원본";
    byId("sourcesSection").hidden = true;
    showEditor("topic");
    byId("topicKey").focus();
  }

  async function openTopic(topicId) {
    try {
      const detail = await api(`/api/reading/admin/topics/${topicId}`);
      state.selectedTopicId = topicId;
      state.topicDetail = detail;
      renderRecordList();
      fillTopicForm(detail.topic);
      byId("topicEditorTitle").textContent = detail.topic.title;
      byId("sourcesSection").hidden = false;
      renderSources(detail.sources);
      resetSourceForm();
      showEditor("topic");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function saveTopic(event) {
    event.preventDefault();
    const status = byId("topicSaveStatus");
    setStatus(status, "저장 중…");
    try {
      const isNew = !state.selectedTopicId;
      const payload = await api(isNew ? "/api/reading/admin/topics" : `/api/reading/admin/topics/${state.selectedTopicId}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(topicPayload())
      });
      state.selectedTopicId = payload.topic.id;
      await Promise.all([refreshTopics(), refreshSummary()]);
      await openTopic(payload.topic.id);
      setStatus(status, "저장했습니다.");
      showToast("지식 원본을 저장했습니다.");
    } catch (error) {
      setStatus(status, error.message, true);
    }
  }

  function sourcePayload() {
    return {
      title: byId("sourceTitle").value,
      publisher: byId("sourcePublisher").value,
      sourceUrl: byId("sourceUrl").value,
      sourceKind: byId("sourceKind").value,
      publishedOn: byId("sourcePublishedOn").value || null,
      expiresAt: byId("sourceExpiresAt").value || null,
      notes: byId("sourceNotes").value
    };
  }

  function resetSourceForm() {
    state.sourceEditingId = null;
    byId("sourceForm").reset();
    byId("sourceId").value = "";
    byId("sourceKind").value = "official";
    byId("sourceSaveButton").textContent = "출처 추가";
    byId("sourceCancelButton").hidden = true;
    setStatus(byId("sourceSaveStatus"), "");
  }

  function editSource(source) {
    state.sourceEditingId = source.id;
    byId("sourceId").value = source.id;
    byId("sourceTitle").value = source.title || "";
    byId("sourcePublisher").value = source.publisher || "";
    byId("sourceUrl").value = source.sourceUrl || "";
    byId("sourceKind").value = source.sourceKind || "official";
    byId("sourcePublishedOn").value = dateValue(source.publishedOn);
    byId("sourceExpiresAt").value = dateValue(source.expiresAt);
    byId("sourceNotes").value = source.notes || "";
    byId("sourceSaveButton").textContent = "출처 수정";
    byId("sourceCancelButton").hidden = false;
    byId("sourceTitle").focus();
  }

  function renderSources(sources) {
    const list = byId("sourceList");
    list.replaceChildren();
    byId("sourceCount").textContent = `${sources.length}개`;
    if (!sources.length) {
      list.append(node("p", "record-empty", "등록된 출처가 없습니다. 첫 출처를 추가하세요."));
      return;
    }
    sources.forEach((source) => {
      const card = node("article", "source-card");
      const content = node("div");
      content.append(node("strong", "", source.title));
      content.append(node("span", "", `${source.publisher} · ${source.sourceKind}`));
      const link = node("a", "", source.sourceUrl);
      link.href = source.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      content.append(link);
      if (source.expiresAt) content.append(node("span", "", `재검수 ${dateValue(source.expiresAt)}`));
      const edit = node("button", "text-button", "수정");
      edit.type = "button";
      edit.addEventListener("click", () => editSource(source));
      card.append(content, edit);
      list.append(card);
    });
  }

  async function saveSource(event) {
    event.preventDefault();
    if (!state.selectedTopicId) return;
    const status = byId("sourceSaveStatus");
    setStatus(status, "저장 중…");
    try {
      const editing = Boolean(state.sourceEditingId);
      await api(editing ? `/api/reading/admin/sources/${state.sourceEditingId}` : `/api/reading/admin/topics/${state.selectedTopicId}/sources`, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(sourcePayload())
      });
      await Promise.all([openTopic(state.selectedTopicId), refreshTopics(), refreshSummary()]);
      showToast(editing ? "출처를 수정했습니다." : "출처를 추가했습니다.");
    } catch (error) {
      setStatus(status, error.message, true);
    }
  }

  function currentChoiceValues() {
    return [...document.querySelectorAll(".choice-row")].map((row) => ({
      choice: row.querySelector(".choice-text").value,
      reason: row.querySelector(".choice-reason").value,
      correct: row.querySelector(".choice-radio").checked
    }));
  }

  function renderChoiceRows(count, choices = [], reasons = [], correctIndex = 0, options = {}) {
    const settings = typeof options === "boolean"
      ? { contentDisabled: options, answerDisabled: options, showReasons: true }
      : {
          contentDisabled: options.contentDisabled === true,
          answerDisabled: options.answerDisabled === true,
          showReasons: options.showReasons !== false
        };
    const container = byId("choiceRows");
    container.replaceChildren();
    for (let index = 0; index < count; index += 1) {
      const row = node("div", "choice-row");
      const radio = document.createElement("input");
      radio.className = "choice-radio";
      radio.type = "radio";
      radio.name = "correctChoice";
      radio.value = String(index);
      radio.checked = Number.isInteger(correctIndex) && index === correctIndex;
      radio.disabled = settings.answerDisabled;
      radio.setAttribute("aria-label", `${index + 1}번을 정답으로 선택`);
      const inputs = node("div", "choice-inputs");
      const choice = document.createElement("textarea");
      choice.className = "choice-text";
      choice.rows = 2;
      choice.placeholder = `${index + 1}번 선지`;
      choice.value = choices[index] || "";
      choice.disabled = settings.contentDisabled;
      const reason = document.createElement("textarea");
      reason.className = "choice-reason";
      reason.rows = 2;
      reason.placeholder = index === correctIndex ? "정답 근거 보충(선택)" : "이 선지가 틀린 이유";
      reason.value = reasons[index] || "";
      reason.disabled = settings.contentDisabled;
      reason.hidden = !settings.showReasons;
      inputs.append(choice, reason);
      row.append(radio, inputs);
      container.append(row);
    }
    container.querySelectorAll("input, textarea").forEach((element) => element.addEventListener("input", renderPreview));
    container.querySelectorAll(".choice-radio").forEach((radio) => radio.addEventListener("change", () => {
      [...container.querySelectorAll(".choice-reason")].forEach((reason, index) => {
        reason.placeholder = Number(radio.value) === index && radio.checked ? "정답 근거 보충(선택)" : "이 선지가 틀린 이유";
      });
      renderPreview();
    }));
  }

  function itemPayload() {
    const rows = currentChoiceValues();
    const correctIndex = rows.findIndex((row) => row.correct);
    return {
      topicId: Number(byId("itemTopic").value),
      track: byId("itemTrack").value,
      targetLevel: Number(byId("itemLevel").value),
      questionType: byId("questionType").value,
      itemKey: byId("itemKey").value,
      passageText: byId("passageText").value,
      promptText: byId("promptText").value,
      choices: rows.map((row) => row.choice),
      correctIndex,
      answerEvidence: byId("answerEvidence").value,
      explanation: byId("explanation").value,
      distractorReasons: rows.map((row) => row.reason),
      difficultyMeta: {}
    };
  }

  function setItemEditable(editable, answerEditable = editable) {
    byId("passageText").disabled = !editable;
    byId("promptText").disabled = !editable;
    byId("answerEvidence").disabled = !editable;
    byId("explanation").disabled = !editable;
    document.querySelectorAll("#choiceRows .choice-text, #choiceRows .choice-reason").forEach((element) => { element.disabled = !editable; });
    document.querySelectorAll("#choiceRows .choice-radio").forEach((element) => { element.disabled = !answerEditable; });
    byId("saveItemButton").hidden = !editable;
  }

  function setIdentityEditable(editable) {
    ["itemTopic", "itemTrack", "itemLevel", "questionType", "itemKey"].forEach((id) => { byId(id).disabled = !editable; });
  }

  function setItemStatus(status) {
    const badge = byId("itemStatusBadge");
    badge.className = `status-badge ${status || "draft"}`;
    badge.textContent = STATUS_LABELS[status] || status || "초안";
  }

  function renderReviewRubric(review = null) {
    const container = byId("reviewRubric");
    container.replaceChildren();
    Object.entries(REVIEW_RUBRIC_LABELS).forEach(([key, labelText]) => {
      const row = node("div", "rubric-row");
      const label = document.createElement("label");
      const select = document.createElement("select");
      const selectId = `rubric-${key}`;
      label.htmlFor = selectId;
      label.textContent = labelText;
      select.id = selectId;
      select.dataset.rubricKey = key;
      select.append(new Option("선택", ""), new Option("0 · 문제 있음", "0"), new Option("1 · 보완 필요", "1"), new Option("2 · 충족", "2"));
      if (review) {
        select.value = String(review.rubric?.[key] ?? "");
        select.disabled = true;
      }
      row.append(label, select);
      container.append(row);
    });
  }

  function renderReviewPanel(detail, version) {
    const panel = byId("reviewPanel");
    const myReview = detail.myReviews.find((entry) => entry.versionId === version.id) || null;
    const feedback = (detail.reviewFeedback || []).filter((entry) => entry.versionId === version.id);
    const counts = detail.reviewCounts.find((entry) => entry.versionId === version.id) || { pass: 0, changesRequested: 0 };
    const canBlindReview = detail.access.canReview && !detail.access.canEdit;
    const editorStatusVisible = ["review_pending", "changes_requested", "approved_for_pilot"].includes(version.status);
    const canSeePanel = (canBlindReview && (version.status === "review_pending" || Boolean(myReview)))
      || (detail.access.canEdit && editorStatusVisible);
    panel.hidden = !canSeePanel;
    if (!canSeePanel) return;

    byId("reviewCount").textContent = counts.changesRequested
      ? `${counts.changesRequested}건 수정 요청`
      : `${counts.pass} / 2 통과`;
    renderReviewRubric(myReview);
    const isOwnVersion = version.isOwnVersion === true;
    const isSubmitted = Boolean(myReview);
    const editorReadOnly = detail.access.canEdit;
    const canSubmit = canBlindReview && version.status === "review_pending" && !isSubmitted && !isOwnVersion;
    byId("reviewRubric").hidden = isOwnVersion || editorReadOnly;
    byId("reviewDecision").closest(".field").hidden = isOwnVersion || editorReadOnly;
    byId("reviewComment").closest(".field").hidden = isOwnVersion || editorReadOnly;
    byId("submitReviewButton").hidden = !canSubmit;
    if (editorReadOnly) {
      const changeComments = feedback
        .filter((entry) => entry.decision === "changes_requested")
        .map((entry) => entry.comment)
        .filter(Boolean);
      byId("reviewIntro").textContent = changeComments.length
        ? `검수 의견: ${changeComments.join(" / ")}`
        : counts.pass >= 2
          ? "서로 다른 검수자 두 명이 통과시켰습니다. 파일럿에 사용할 수 있습니다."
          : `독립 검수 통과 ${counts.pass}/2명입니다. 검수자의 정답 선택은 공개되지 않습니다.`;
      setStatus(byId("reviewStatus"), "");
      return;
    }
    if (isOwnVersion) {
      byId("reviewIntro").textContent = "본인이 만든 버전은 독립 검수할 수 없습니다. 다른 검수자 두 명이 확인해야 합니다.";
      setStatus(byId("reviewStatus"), "");
      return;
    }
    if (isSubmitted) {
      byId("reviewIntro").textContent = "제출한 검수는 변경할 수 없습니다. 다른 검수자의 선택은 공개되지 않습니다.";
      byId("reviewDecision").value = myReview.decision;
      byId("reviewDecision").disabled = true;
      byId("reviewComment").value = myReview.comment || "";
      byId("reviewComment").disabled = true;
      setStatus(byId("reviewStatus"), `제출 완료 · ${myReview.totalScore}/20점 · ${STATUS_LABELS[myReview.decision] || myReview.decision}`);
    } else {
      byId("reviewIntro").textContent = "저장된 정답과 다른 검수자의 선택은 보이지 않습니다. 정답이라고 판단한 보기를 먼저 고르세요.";
      byId("reviewDecision").value = "pass";
      byId("reviewDecision").disabled = false;
      byId("reviewComment").value = "";
      byId("reviewComment").disabled = false;
      setStatus(byId("reviewStatus"), "");
    }
  }

  function resetCheckPanel() {
    byId("checkState").className = "count-pill neutral";
    byId("checkState").textContent = "실행 전";
    const results = byId("checkResults");
    results.replaceChildren(node("p", "", "초안을 저장한 뒤 자동검사를 실행하세요."));
  }

  function renderCheck(check) {
    if (!check) {
      resetCheckPanel();
      return;
    }
    const result = check.results || check;
    const passed = check.passed ?? !(result.errors || []).length;
    byId("checkState").className = `count-pill ${passed ? "pass" : "fail"}`;
    byId("checkState").textContent = passed ? "통과" : "수정 필요";
    const container = byId("checkResults");
    container.replaceChildren();
    const metrics = result.metrics || {};
    container.append(node("p", "", `지문 ${metrics.characterCount ?? 0}자${metrics.wordCount !== null && metrics.wordCount !== undefined ? ` · ${metrics.wordCount}단어` : ""} · 선지 ${metrics.choiceCount ?? 0}개`));
    const issues = [...(result.errors || []).map((entry) => ({ ...entry, kind: "error" })), ...(result.warnings || []).map((entry) => ({ ...entry, kind: "warning" }))];
    if (!issues.length) {
      container.append(node("p", "", "필수 오류와 참고 경고가 없습니다."));
      return;
    }
    const list = document.createElement("ul");
    issues.forEach((issue) => list.append(node("li", issue.kind, issue.message)));
    container.append(list);
  }

  function renderPreview() {
    const track = byId("itemTrack").value;
    const level = byId("itemLevel").value;
    const passage = byId("passageText").value.trim();
    const prompt = byId("promptText").value.trim();
    const rows = currentChoiceValues();
    byId("previewLevel").textContent = levelCode(track, level);
    byId("previewPassage").textContent = passage || "지문을 입력하면 여기에 표시됩니다.";
    byId("previewPrompt").textContent = prompt || "발문";
    const choices = byId("previewChoices");
    choices.replaceChildren();
    rows.forEach((row, index) => {
      const choice = node("div", "preview-choice");
      choice.append(node("span", "", String(index + 1)), node("span", "", row.choice || `${index + 1}번 선지`));
      choices.append(choice);
    });
    const words = (passage.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length;
    byId("passageMetric").textContent = track === "en" ? `${words}단어 · ${passage.length}자` : `${passage.length}자`;
  }

  function newItem() {
    if (!state.access?.canEdit) return;
    if (!state.topics.length) {
      switchView("topics").then(newTopic);
      showToast("문항보다 먼저 지식 원본을 만들어야 합니다.", true);
      return;
    }
    state.selectedItemId = null;
    state.itemDetail = null;
    state.currentVersion = null;
    renderRecordList();
    byId("itemEyebrow").textContent = "NEW ITEM";
    byId("itemEditorTitle").textContent = "새 문항";
    byId("itemTopic").value = String(state.topics[0].id);
    byId("itemTrack").value = "ko";
    byId("itemLevel").value = "1";
    byId("questionType").value = "explicit";
    byId("itemKey").value = "";
    byId("passageText").value = "";
    byId("promptText").value = "";
    byId("answerEvidence").value = "";
    byId("explanation").value = "";
    renderChoiceRows(3);
    setIdentityEditable(true);
    setItemEditable(true);
    setItemStatus("draft");
    byId("cloneVersionButton").hidden = true;
    byId("runCheckButton").hidden = true;
    byId("submitForReviewButton").hidden = true;
    byId("answerEvidenceField").hidden = false;
    byId("explanationField").hidden = false;
    byId("reviewPanel").hidden = true;
    setStatus(byId("itemSaveStatus"), "");
    resetCheckPanel();
    renderPreview();
    showEditor("item");
    byId("passageText").focus();
  }

  async function openItem(itemId) {
    try {
      const detail = await api(`/api/reading/admin/items/${itemId}`);
      state.selectedItemId = itemId;
      state.itemDetail = detail;
      state.currentVersion = detail.versions[0];
      renderRecordList();
      const item = detail.item;
      const version = state.currentVersion;
      byId("itemEyebrow").textContent = `${levelCode(item.track, item.targetLevel)} · ${QUESTION_LABELS[item.questionType] || item.questionType}`;
      byId("itemEditorTitle").textContent = item.topicTitle;
      byId("itemTopic").value = String(item.topicId);
      byId("itemTrack").value = item.track;
      byId("itemLevel").value = String(item.targetLevel);
      byId("questionType").value = item.questionType;
      byId("itemKey").value = item.itemKey;
      byId("passageText").value = version.passageText;
      byId("promptText").value = version.promptText;
      byId("answerEvidence").value = version.answerEvidence;
      byId("explanation").value = version.explanation;
      const myReview = detail.myReviews.find((entry) => entry.versionId === version.id) || null;
      const contentEditable = detail.access.canEdit && version.status === "draft";
      const answerEditable = detail.access.canReview
        && !detail.access.canEdit
        && version.status === "review_pending"
        && !myReview
        && !version.isOwnVersion;
      const selectedIndex = detail.access.canEdit ? version.correctIndex : myReview?.reviewerAnswerIndex;
      renderChoiceRows(version.choices.length, version.choices, version.distractorReasons, selectedIndex, {
        contentDisabled: !contentEditable,
        answerDisabled: !contentEditable && !answerEditable,
        showReasons: detail.access.canEdit
      });
      setIdentityEditable(false);
      setItemEditable(contentEditable, contentEditable || answerEditable);
      setItemStatus(version.status);
      byId("answerEvidenceField").hidden = !detail.access.canEdit;
      byId("explanationField").hidden = !detail.access.canEdit;
      byId("cloneVersionButton").hidden = !detail.access.canEdit || version.status === "draft";
      byId("runCheckButton").hidden = !detail.access.canEdit || !["draft", "auto_checked"].includes(version.status);
      byId("submitForReviewButton").hidden = !detail.access.canEdit || version.status !== "auto_checked";
      setStatus(byId("itemSaveStatus"), `버전 ${version.versionNo}`);
      const check = detail.checks.find((entry) => entry.versionId === version.id);
      renderCheck(check);
      renderReviewPanel(detail, version);
      renderPreview();
      showEditor("item");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function persistItem() {
    const payload = itemPayload();
    if (!state.selectedItemId) {
      const created = await api("/api/reading/admin/items", { method: "POST", body: JSON.stringify(payload) });
      state.selectedItemId = created.item.id;
      state.currentVersion = created.version;
      renderCheck(created.precheck);
      return created.version;
    }
    const saved = await api(`/api/reading/admin/versions/${state.currentVersion.id}`, { method: "PUT", body: JSON.stringify(payload) });
    state.currentVersion = saved.version;
    renderCheck(saved.precheck);
    return saved.version;
  }

  async function saveItem(event) {
    if (event) event.preventDefault();
    const status = byId("itemSaveStatus");
    setStatus(status, "저장 중…");
    try {
      const version = await persistItem();
      await Promise.all([refreshItems(), refreshSummary()]);
      await openItem(state.selectedItemId);
      setStatus(status, `버전 ${version.versionNo} 저장 완료`);
      showToast("문항 초안을 저장했습니다.");
      return version;
    } catch (error) {
      setStatus(status, error.message, true);
      throw error;
    }
  }

  async function runCheck() {
    const button = byId("runCheckButton");
    button.disabled = true;
    try {
      if (state.currentVersion?.status === "draft") await saveItem();
      const payload = await api(`/api/reading/admin/versions/${state.currentVersion.id}/check`, { method: "POST", body: "{}" });
      renderCheck({ passed: payload.check.passed, results: payload.check.results });
      await Promise.all([refreshItems(), refreshSummary()]);
      await openItem(state.selectedItemId);
      showToast(payload.check.passed ? "자동검사를 통과했습니다." : "수정할 항목이 있습니다.", !payload.check.passed);
    } catch (error) {
      showToast(error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  async function submitForReview() {
    const button = byId("submitForReviewButton");
    if (!state.currentVersion) return;
    button.disabled = true;
    try {
      await api(`/api/reading/admin/versions/${state.currentVersion.id}/submit`, { method: "POST", body: "{}" });
      await Promise.all([refreshItems(), refreshSummary()]);
      await openItem(state.selectedItemId);
      showToast("검수자 두 명에게 독립 검수를 요청했습니다.");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  async function submitReview() {
    const button = byId("submitReviewButton");
    const selectedAnswer = document.querySelector("#choiceRows .choice-radio:checked");
    if (!selectedAnswer) {
      setStatus(byId("reviewStatus"), "정답이라고 판단한 보기를 먼저 선택해 주세요.", true);
      return;
    }
    const rubric = {};
    for (const select of document.querySelectorAll("#reviewRubric select[data-rubric-key]")) {
      if (select.value === "") {
        setStatus(byId("reviewStatus"), "열 가지 검수 기준을 모두 평가해 주세요.", true);
        select.focus();
        return;
      }
      rubric[select.dataset.rubricKey] = Number(select.value);
    }
    const decision = byId("reviewDecision").value;
    const comment = byId("reviewComment").value.trim();
    if (decision === "changes_requested" && !comment) {
      setStatus(byId("reviewStatus"), "수정 요청 이유를 적어 주세요.", true);
      byId("reviewComment").focus();
      return;
    }
    button.disabled = true;
    setStatus(byId("reviewStatus"), "검수 제출 중…");
    try {
      const result = await api(`/api/reading/admin/versions/${state.currentVersion.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          reviewerAnswerIndex: Number(selectedAnswer.value),
          rubric,
          decision,
          comment
        })
      });
      await Promise.all([refreshItems(), refreshSummary()]);
      await openItem(state.selectedItemId);
      const message = result.review.decision === "pass"
        ? `검수 통과로 기록했습니다. 현재 ${result.passCount}/2명 승인입니다.`
        : "검수 기준을 충족하지 못해 수정 요청으로 기록했습니다.";
      showToast(message, result.review.decision !== "pass");
    } catch (error) {
      setStatus(byId("reviewStatus"), error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  async function cloneVersion() {
    const button = byId("cloneVersionButton");
    button.disabled = true;
    try {
      await api(`/api/reading/admin/items/${state.selectedItemId}/versions`, {
        method: "POST",
        body: JSON.stringify({ baseVersionId: state.currentVersion.id })
      });
      await Promise.all([refreshItems(), refreshSummary()]);
      await openItem(state.selectedItemId);
      showToast("수정 가능한 새 초안 버전을 만들었습니다.");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      button.disabled = false;
    }
  }

  function permissionCheck(labelText, checked, disabled = false) {
    const label = node("label", "permission-check");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.disabled = disabled;
    label.append(input, document.createTextNode(labelText));
    return { label, input };
  }

  async function openReviewerDialog() {
    const dialog = byId("reviewerDialog");
    const list = byId("reviewerList");
    list.replaceChildren(node("p", "dialog-copy", "계정 목록을 불러오는 중…"));
    dialog.showModal();
    try {
      const payload = await api("/api/reading/admin/reviewers");
      list.replaceChildren();
      payload.reviewers.forEach((reviewer) => {
        const row = node("div", "reviewer-row");
        const identity = node("div", "reviewer-identity");
        identity.append(
          node("strong", "", reviewer.name || reviewer.email),
          node("span", "", `${reviewer.email} · ${reviewer.isAdmin ? "관리자" : "교사"}`)
        );
        const edit = permissionCheck("출제", reviewer.canEdit, reviewer.isAdmin);
        const review = permissionCheck("검수", reviewer.canReview, reviewer.isAdmin);
        const publish = permissionCheck("공개", reviewer.canPublish, reviewer.isAdmin);
        edit.input.addEventListener("change", () => {
          if (edit.input.checked) review.input.checked = false;
        });
        review.input.addEventListener("change", () => {
          if (review.input.checked) edit.input.checked = false;
        });
        const save = node("button", "button secondary small", reviewer.isAdmin ? "고정" : "저장");
        save.type = "button";
        save.disabled = reviewer.isAdmin;
        save.addEventListener("click", async () => {
          save.disabled = true;
          try {
            await api(`/api/reading/admin/reviewers/${reviewer.userId}`, {
              method: "PUT",
              body: JSON.stringify({
                canEdit: edit.input.checked,
                canReview: review.input.checked,
                canPublish: publish.input.checked
              })
            });
            showToast(`${reviewer.name || reviewer.email} 계정의 권한을 저장했습니다.`);
          } catch (error) {
            showToast(error.message, true);
          } finally {
            save.disabled = false;
          }
        });
        row.append(identity, edit.label, review.label, publish.label, save);
        list.append(row);
      });
      if (!payload.reviewers.length) list.append(node("p", "dialog-copy", "권한을 줄 수 있는 교사 계정이 없습니다."));
    } catch (error) {
      list.replaceChildren(node("p", "save-status error", error.message));
    }
  }

  function handleLevelChange() {
    const previous = currentChoiceValues();
    const count = expectedChoiceCount(byId("itemLevel").value);
    const correctIndex = Math.max(0, previous.findIndex((entry) => entry.correct));
    renderChoiceRows(count, previous.map((entry) => entry.choice), previous.map((entry) => entry.reason), Math.min(correctIndex, count - 1));
    renderPreview();
  }

  function configureAccessUi() {
    const canEdit = state.access?.canEdit === true;
    const topicsTab = document.querySelector('.view-tab[data-view="topics"]');
    topicsTab.hidden = !canEdit;
    byId("newButton").hidden = !canEdit;
    byId("importSampleButton").closest(".import-box").hidden = !canEdit;
    byId("reviewersButton").hidden = !state.access?.isAdmin;
    byId("pilotLink").hidden = !canEdit;
    if (!canEdit) {
      state.view = "items";
      byId("statusFilter").value = "review_pending";
    }
  }

  function wireEvents() {
    document.querySelectorAll(".view-tab").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    byId("newButton").addEventListener("click", () => state.view === "items" ? newItem() : newTopic());
    byId("topicForm").addEventListener("submit", saveTopic);
    byId("topicForm").addEventListener("input", () => { byId("topicDirtyBadge").hidden = false; });
    byId("sourceForm").addEventListener("submit", saveSource);
    byId("sourceCancelButton").addEventListener("click", resetSourceForm);
    byId("itemForm").addEventListener("submit", (event) => saveItem(event).catch(() => {}));
    byId("runCheckButton").addEventListener("click", runCheck);
    byId("submitForReviewButton").addEventListener("click", submitForReview);
    byId("submitReviewButton").addEventListener("click", submitReview);
    byId("cloneVersionButton").addEventListener("click", cloneVersion);
    byId("importSampleButton").addEventListener("click", importSamples);
    byId("reviewersButton").addEventListener("click", openReviewerDialog);
    byId("closeReviewerDialog").addEventListener("click", () => byId("reviewerDialog").close());
    byId("reviewerDialog").addEventListener("click", (event) => {
      if (event.target === byId("reviewerDialog")) byId("reviewerDialog").close();
    });
    byId("itemLevel").addEventListener("change", handleLevelChange);
    byId("itemTrack").addEventListener("change", renderPreview);
    ["passageText", "promptText", "answerEvidence", "explanation"].forEach((id) => byId(id).addEventListener("input", renderPreview));

    ["trackFilter", "levelFilter", "statusFilter"].forEach((id) => byId(id).addEventListener("change", () => refreshItems().catch((error) => showToast(error.message, true))));
    byId("domainFilter").addEventListener("change", () => refreshTopics().catch((error) => showToast(error.message, true)));
    byId("searchInput").addEventListener("input", () => {
      window.clearTimeout(state.searchTimer);
      state.searchTimer = window.setTimeout(() => {
        const refresh = state.view === "items" ? refreshItems : refreshTopics;
        refresh().catch((error) => showToast(error.message, true));
      }, 240);
    });
  }

  async function start() {
    populateStaticSelects();
    wireEvents();
    try {
      const config = await api("/api/auth/config");
      if (!config.enabled) {
        gateMessage.textContent = `서버 설정이 필요합니다: ${(config.missing || []).join(", ")}`;
        adminLoginLink.hidden = false;
        return;
      }
      const session = await api("/api/auth/me");
      if (!session.signedIn) {
        gateMessage.textContent = "문제은행을 사용하려면 먼저 로그인해 주세요.";
        adminLoginLink.hidden = false;
        return;
      }
      const access = await api("/api/reading/access");
      if (!access.allowed) {
        gateMessage.textContent = "독해 문제은행 권한이 없습니다. 관리자에게 출제 또는 검수 권한을 요청해 주세요.";
        adminLoginLink.hidden = false;
        return;
      }
      state.access = access;
      byId("adminEmail").textContent = access.user.email;
      configureAccessUi();
      await refreshAll();
      gate.hidden = true;
      app.hidden = false;
      renderRecordList();
    } catch (error) {
      gateMessage.textContent = error.message;
      adminLoginLink.hidden = false;
    }
  }

  start();
})();
