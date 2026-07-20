"use client";

import { useEffect, useState } from "react";

type Session = {
  race: { roomCode: string; worksheetName: string; worksheetRoute: string; status: string; startedAt: number | null };
  participant: { id: string; name: string; submittedAt: number | null; correctCount: number | null; totalCount: number | null; mistakeCount: number; rank: number | null };
};

const questionSelectors = [
  ".counting-question", ".drawing-question", ".addsub-equation-row", ".reading-row", ".give-question", ".complement-row", ".skip-row", ".vertical-equation", ".digit-equation", ".group-question", ".length-question", ".multiplication-question", ".multiplication-five-question", ".clock-question",
];

function formatElapsed(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function waitForPaint() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => window.setTimeout(resolve, 40))));
}

export default function ArithmeticRaceController() {
  const [credentials, setCredentials] = useState<{ room: string; participant: string; participantToken: string } | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attemptMessage, setAttemptMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("race");
    const participant = params.get("participant");
    const participantToken = params.get("participantToken");
    if (room && participant && participantToken) setCredentials({ room, participant, participantToken });
  }, []);

  useEffect(() => {
    if (!credentials) return;
    document.documentElement.dataset.raceMode = "true";
    let active = true;
    const load = async () => {
      try {
        const query = new URLSearchParams({ room: credentials.room, participant: credentials.participant, participantToken: credentials.participantToken });
        const response = await fetch(`/api/arithmetic-race?${query}`, { cache: "no-store" });
        const data = await response.json() as Session & { error?: string };
        if (!response.ok) throw new Error(data.error || "순위 정보를 불러오지 못했습니다.");
        if (active) setSession(data);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "순위 정보를 불러오지 못했습니다.");
      }
    };
    void load();
    const poll = window.setInterval(load, 2000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      window.clearInterval(poll);
      window.clearInterval(clock);
      delete document.documentElement.dataset.raceMode;
    };
  }, [credentials]);

  useEffect(() => {
    if (!session?.participant.submittedAt) return;
    document.querySelectorAll<HTMLInputElement | HTMLButtonElement>(".worksheet-stage input, .worksheet-stage button").forEach((element) => { element.disabled = true; });
  }, [session?.participant.submittedAt]);

  if (!credentials) return null;

  async function submit() {
    if (!session || session.participant.submittedAt || submitting) return;
    setSubmitting(true);
    setError("");
    setAttemptMessage("");
    try {
      const gradingButton = [...document.querySelectorAll<HTMLButtonElement>(".counting-toolbar button")].find((button) => button.textContent?.trim() === "전체 채점");
      if (!gradingButton) throw new Error("이 학습지의 채점 버튼을 찾지 못했습니다.");
      gradingButton.click();
      await waitForPaint();
      const stage = document.querySelector(".worksheet-stage");
      if (!stage) throw new Error("학습지를 찾지 못했습니다.");
      const correctSelector = questionSelectors.map((selector) => `${selector}.is-correct`).join(",");
      const wrongSelector = questionSelectors.map((selector) => `${selector}.is-wrong`).join(",");
      const correctCount = stage.querySelectorAll(correctSelector).length;
      const wrongCount = stage.querySelectorAll(wrongSelector).length;
      const totalCount = correctCount + wrongCount;
      if (!totalCount) throw new Error("채점 결과를 확인하지 못했습니다.");
      const response = await fetch("/api/arithmetic-race", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "submit", roomCode: credentials.room, participantId: credentials.participant, participantToken: credentials.participantToken, correctCount, totalCount }),
      });
      const result = await response.json() as { error?: string; completed?: boolean; submittedAt?: number | null; rank?: number | null; correctCount?: number; totalCount?: number; wrongCount?: number; mistakeCount?: number };
      if (!response.ok) throw new Error(result.error || "제출하지 못했습니다.");
      setSession((current) => current ? { ...current, participant: { ...current.participant, submittedAt: result.submittedAt ?? null, rank: result.rank ?? null, correctCount: result.correctCount ?? correctCount, totalCount: result.totalCount ?? totalCount, mistakeCount: result.mistakeCount ?? current.participant.mistakeCount } } : current);
      if (!result.completed) setAttemptMessage(`${result.wrongCount ?? wrongCount}개 오답 · 고쳐서 다시 도착`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "제출하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const submitted = Boolean(session?.participant.submittedAt);
  const mistakeCount = session?.participant.mistakeCount ?? 0;
  const elapsed = session?.race.startedAt ? formatElapsed((session.participant.submittedAt ?? now) - session.race.startedAt) : "00:00";
  return (
    <aside className="race-submit-bar" aria-label="순위 모드">
      <span className="race-room">방 {credentials.room}</span>
      <strong>{session?.participant.name ?? "입장 확인 중"}</strong>
      <time>{elapsed}</time>
      {submitted ? (
        <span className="race-submitted"><b>전부 정답</b>{mistakeCount ? ` · 오답 ${mistakeCount}개` : " · 한 번에 통과"}{session?.participant.rank ? ` · ${session.participant.rank}위` : " · 도착"}</span>
      ) : (
        <>{attemptMessage && <span className="race-attempt" role="status">{attemptMessage}</span>}<button type="button" onClick={submit} disabled={!session || submitting}>{submitting ? "채점 중" : "채점·도착"}</button></>
      )}
      {error && <span className="race-error" role="alert">{error}</span>}
    </aside>
  );
}
