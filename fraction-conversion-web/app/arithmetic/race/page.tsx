"use client";

import { FormEvent, useEffect, useState } from "react";

type JoinState = {
  roomCode: string;
  participantId: string;
  participantToken: string;
  race: { worksheetName: string; worksheetRoute: string; status: string };
};

const PLAYER_NAME_KEY = "classPlayerName";

function normalizedPlayerName(value: string | null) {
  return String(value ?? "").replace(/[^가-힣]/g, "").slice(0, 6);
}

export default function ArithmeticRaceJoinPage() {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState<JoinState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingName = normalizedPlayerName(params.get("name"));
    const storedName = normalizedPlayerName(window.localStorage.getItem(PLAYER_NAME_KEY));
    const resolvedName = /^[가-힣]{2,6}$/.test(incomingName) ? incomingName : storedName;
    if (/^[가-힣]{2,6}$/.test(resolvedName)) {
      window.localStorage.setItem(PLAYER_NAME_KEY, resolvedName);
      setName(resolvedName);
    }
    const room = params.get("room");
    const participantId = params.get("participant");
    const participantToken = params.get("participantToken");
    if (!room || !participantId || !participantToken) return;
    setRoomCode(room);
    setJoined({ roomCode: room, participantId, participantToken, race: { worksheetName: "", worksheetRoute: "", status: "waiting" } });
  }, []);

  useEffect(() => {
    if (!joined) return;
    let active = true;
    const check = async () => {
      try {
        const query = new URLSearchParams({ room: joined.roomCode, participant: joined.participantId, participantToken: joined.participantToken });
        const response = await fetch(`/api/arithmetic-race?${query}`, { cache: "no-store" });
        const data = await response.json() as { race?: JoinState["race"]; error?: string };
        if (!response.ok || !data.race) throw new Error(data.error || "방 정보를 불러오지 못했습니다.");
        if (!active) return;
        setJoined((current) => current ? { ...current, race: data.race! } : current);
        if (data.race.status === "running") {
          const params = new URLSearchParams({ race: joined.roomCode, participant: joined.participantId, participantToken: joined.participantToken });
          window.location.href = `${data.race.worksheetRoute}?${params}`;
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "방 정보를 불러오지 못했습니다.");
      }
    };
    void check();
    const poll = window.setInterval(check, 1500);
    return () => { active = false; window.clearInterval(poll); };
  }, [joined?.roomCode, joined?.participantId, joined?.participantToken]);

  async function join(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/arithmetic-race", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "join", roomCode, name }),
      });
      const data = await response.json() as { participantId?: string; participantToken?: string; race?: JoinState["race"]; error?: string };
      if (!response.ok || !data.participantId || !data.participantToken || !data.race) throw new Error(data.error || "입장하지 못했습니다.");
      const next = { roomCode, participantId: data.participantId, participantToken: data.participantToken, race: data.race };
      setJoined(next);
      const params = new URLSearchParams({ room: roomCode, participant: data.participantId, participantToken: data.participantToken });
      window.history.replaceState(null, "", `/arithmetic/race?${params}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "입장하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-page race-entry-page">
      <div className="race-entry-shell">
        <header className="catalog-header"><a className="catalog-back" href="/arithmetic">← 연산</a><div><h1>순위 모드</h1></div></header>
        {joined ? (
          <section className="race-waiting-card" aria-live="polite">
            <span>방 {joined.roomCode}</span>
            <h2>{joined.race.worksheetName || "학습지 확인 중"}</h2>
            <strong>교사가 시작할 때까지 기다리세요.</strong>
          </section>
        ) : (
          <div className="race-entry-grid">
            <form className="race-join-card" onSubmit={join}>
              <h2>학생 입장</h2>
              <label>방 번호<input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} required /></label>
              <label>이름<input value={name} onChange={(event) => setName(event.target.value.slice(0, 20))} maxLength={20} required /></label>
              <button type="submit" disabled={loading}>{loading ? "입장 중" : "입장"}</button>
            </form>
            <div className="race-teacher-actions"><a className="race-teacher-button" href="/arithmetic/race/teacher">교사용 페이지</a></div>
          </div>
        )}
        {error && <p className="race-form-error" role="alert">{error}</p>}
      </div>
    </main>
  );
}
