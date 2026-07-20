"use client";

import { useEffect, useState } from "react";
import { raceReadyWorksheets } from "../../../../lib/arithmetic-worksheets";

type Race = { roomCode: string; worksheetName: string; worksheetRoute: string; status: string; startedAt: number | null };
type Participant = { id: string; name: string; submittedAt: number | null; correctCount: number | null; totalCount: number | null; mistakeCount: number; rank: number | null };
type Board = { race: Race; participants: Participant[]; ranking: Participant[] };

function formatElapsed(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ArithmeticRaceTeacherPage() {
  const [pin, setPin] = useState("");
  const [worksheetRoute, setWorksheetRoute] = useState(raceReadyWorksheets[0]?.route ?? "");
  const [credentials, setCredentials] = useState<{ roomCode: string; teacherToken: string } | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get("room");
    const teacherToken = params.get("teacherToken");
    if (roomCode && teacherToken) setCredentials({ roomCode, teacherToken });
  }, []);

  useEffect(() => {
    if (!credentials) return;
    let active = true;
    const load = async () => {
      try {
        const query = new URLSearchParams({ room: credentials.roomCode, teacherToken: credentials.teacherToken });
        const response = await fetch(`/api/arithmetic-race?${query}`, { cache: "no-store" });
        const data = await response.json() as Board & { error?: string };
        if (!response.ok) throw new Error(data.error || "순위판을 불러오지 못했습니다.");
        if (active) setBoard(data);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "순위판을 불러오지 못했습니다.");
      }
    };
    void load();
    const poll = window.setInterval(load, 1200);
    return () => { active = false; window.clearInterval(poll); };
  }, [credentials]);

  async function createRoom() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/arithmetic-race", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", worksheetRoute, pin }) });
      const data = await response.json() as { roomCode?: string; teacherToken?: string; error?: string };
      if (!response.ok || !data.roomCode || !data.teacherToken) throw new Error(data.error || "방을 만들지 못했습니다.");
      const next = { roomCode: data.roomCode, teacherToken: data.teacherToken };
      setCredentials(next);
      setPin("");
      window.history.replaceState(null, "", `/arithmetic/race/teacher?${new URLSearchParams({ room: next.roomCode, teacherToken: next.teacherToken })}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "방을 만들지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function startRace() {
    if (!credentials || !window.confirm("입장한 학생 모두에게 동시에 문제를 시작할까요?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/arithmetic-race", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start", roomCode: credentials.roomCode, teacherToken: credentials.teacherToken }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "시작하지 못했습니다.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "시작하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function closeRoom() {
    if (!credentials || !window.confirm("이 방과 순위 기록을 닫을까요?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/arithmetic-race", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", roomCode: credentials.roomCode, teacherToken: credentials.teacherToken }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "방을 닫지 못했습니다.");
      setCredentials(null);
      setBoard(null);
      window.history.replaceState(null, "", "/arithmetic/race/teacher");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "방을 닫지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const waiting = board?.participants.filter((participant) => !participant.submittedAt) ?? [];
  return (
    <main className="race-teacher-page">
      <header className="race-teacher-header"><a href="/arithmetic/race">← 순위 모드</a><h1>연산 순위판</h1></header>
      {!credentials ? (
        <section className="race-create-panel">
          <label>교사 PIN<input type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value.replace(/[^0-9]/g, "").slice(0, 8))} maxLength={8} required /></label>
          <label>학습지<select value={worksheetRoute} onChange={(event) => setWorksheetRoute(event.target.value)}>{raceReadyWorksheets.map((worksheet) => <option value={worksheet.route} key={worksheet.route}>{worksheet.name}</option>)}</select></label>
          <button type="button" onClick={createRoom} disabled={loading || !pin}>{loading ? "만드는 중" : "방 만들기"}</button>
        </section>
      ) : (
        <div className="race-teacher-layout">
          <section className="race-room-panel">
            <span>방 번호</span><strong>{credentials.roomCode}</strong><h2>{board?.race.worksheetName ?? "불러오는 중"}</h2>
            {board?.race.status === "waiting" ? <button type="button" onClick={startRace} disabled={loading || !board.participants.length}>시작</button> : <b className="race-live">진행 중</b>}
            <p>{board?.participants.length ?? 0}명 입장</p>
            <button className="race-close" type="button" onClick={closeRoom} disabled={loading}>방 닫기</button>
          </section>
          <section className="race-ranking-panel">
            <header><h2>실시간 순위</h2><span>전부 맞힌 학생만 · 오답이 적은 순 · 같으면 도착 시간</span></header>
            <div className="race-ranking-list">
              {board?.ranking.length ? board.ranking.map((participant) => <div className={`race-ranking-row rank-${participant.rank}`} key={participant.id}><strong>{participant.rank}위</strong><b>{participant.name}</b><span>오답 {participant.mistakeCount}개</span><time>{board.race.startedAt && participant.submittedAt ? formatElapsed(participant.submittedAt - board.race.startedAt) : "--:--"}</time></div>) : <p className="race-empty">도착한 학생이 없습니다.</p>}
            </div>
            <h3>미도착</h3>
            <div className="race-waiting-list">{waiting.length ? waiting.map((participant) => <span key={participant.id}>{participant.name}</span>) : <p className="race-empty">모두 도착했습니다.</p>}</div>
          </section>
        </div>
      )}
      {error && <p className="race-form-error" role="alert">{error}</p>}
    </main>
  );
}
