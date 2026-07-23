"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PLAYER_NAME_KEY = "classPlayerName";

function normalizedPlayerName(value: string | null) {
  return String(value ?? "").replace(/[^가-힣]/g, "").slice(0, 6);
}

export default function ArithmeticModePage() {
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingName = normalizedPlayerName(params.get("name"));
    const storedName = normalizedPlayerName(window.localStorage.getItem(PLAYER_NAME_KEY));
    const resolvedName = /^[가-힣]{2,6}$/.test(incomingName) ? incomingName : storedName;
    if (!/^[가-힣]{2,6}$/.test(resolvedName)) return;
    window.localStorage.setItem(PLAYER_NAME_KEY, resolvedName);
    const timer = window.setTimeout(() => setPlayerName(resolvedName), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const personalHref = playerName ? `/arithmetic/personal?${new URLSearchParams({ name: playerName })}` : "/arithmetic/personal";
  const raceHref = playerName ? `/arithmetic/race?${new URLSearchParams({ name: playerName })}` : "/arithmetic/race";

  return (
    <main className="portal-page arithmetic-mode-page">
      <div className="arithmetic-mode-shell">
        <header className="catalog-header">
          <Link className="catalog-back" href="/">← 홈</Link>
          <div><h1>연산</h1></div>
        </header>
        <section className="arithmetic-mode-grid" aria-label="연산 모드 선택">
          <a className="arithmetic-mode-card personal" href={personalHref}>
            <span>01</span><strong>개인 모드</strong><i aria-hidden="true">→</i>
          </a>
          <a className="arithmetic-mode-card race" href={raceHref}>
            <span>02</span><strong>순위 모드</strong><i aria-hidden="true">→</i>
          </a>
        </section>
      </div>
    </main>
  );
}
