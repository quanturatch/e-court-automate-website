"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Stats = { views: number; copies: number };

const CACHE_KEY = "ecourt-stats";
const SESSION_KEY = "ecourt-pv";

const StatsContext = createContext<{
  views: number | null;
  copies: number | null;
  recordCopy: () => void;
}>({ views: null, copies: null, recordCopy: () => {} });

function readCache(): Stats | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Stats>;
    if (typeof d.views === "number" && typeof d.copies === "number") {
      return { views: d.views, copies: d.copies };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(stats: Stats) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function ViewsProvider({
  children,
  initial = null,
}: {
  children: React.ReactNode;
  initial?: Stats | null;
}) {
  const [stats, setStats] = useState<Stats | null>(initial);

  const apply = useCallback((next: Stats) => {
    setStats(next);
    writeCache(next);
  }, []);

  useEffect(() => {
    if (!stats) {
      const cached = readCache();
      if (cached) setStats(cached);
    }

    let cancelled = false;
    const already = Boolean(sessionStorage.getItem(SESSION_KEY));
    if (!already) sessionStorage.setItem(SESSION_KEY, "1");
    const body = already ? undefined : JSON.stringify({ kind: "view" });
    const method = already ? "GET" : "POST";

    const ac = new AbortController();
    const timer = window.setTimeout(() => ac.abort(), 8000);

    (async () => {
      try {
        const r = await fetch("/api/stats", {
          method,
          cache: "no-store",
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body,
          signal: ac.signal,
        });
        const d = (await r.json()) as { views?: number; copies?: number; count?: number };
        const views = typeof d.views === "number" ? d.views : d.count;
        const copies = typeof d.copies === "number" ? d.copies : 0;
        if (!cancelled && typeof views === "number") {
          sessionStorage.setItem(SESSION_KEY, "1");
          apply({ views, copies });
        }
      } catch {
        /* keep SSR / cached numbers */
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(timer);
    };
  }, [apply]);

  const recordCopy = useCallback(() => {
    setStats((prev) => {
      const next = { views: prev?.views ?? 0, copies: (prev?.copies ?? 0) + 1 };
      writeCache(next);
      return next;
    });
    fetch("/api/stats", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "copy" }),
    })
      .then((r) => r.json())
      .then((d: { views?: number; copies?: number }) => {
        const copies = d.copies;
        if (typeof copies !== "number") return;
        setStats((prev) => {
          const next = {
            views: typeof d.views === "number" ? d.views : prev?.views ?? 0,
            copies: Math.max(prev?.copies ?? 0, copies),
          };
          writeCache(next);
          return next;
        });
      })
      .catch(() => {});
  }, [apply]);

  useEffect(() => {
    function isCopyControl(el: Element | null): el is HTMLElement {
      if (!el || !(el instanceof HTMLElement)) return false;
      if (el.closest("[data-track-copy], .copy-command, button.copy")) return true;
      const tag = el.closest("button, a, [role='button']");
      if (!tag) return false;
      const label = (tag.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return label === "copy" || label.startsWith("copied");
    }
    function onClick(e: MouseEvent) {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (isCopyControl(t)) recordCopy();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [recordCopy]);

  return (
    <StatsContext.Provider
      value={{ views: stats?.views ?? null, copies: stats?.copies ?? null, recordCopy }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  return useContext(StatsContext);
}

export function shownDownloads(copies: number | null): number {
  return 101 + Math.max(0, copies ?? 0);
}

export function ViewLabel({ className }: { className?: string }) {
  const { views, copies } = useStats();
  const dl = shownDownloads(copies);
  const viewsText =
    views === null ? "…" : `${views.toLocaleString("en-IN")} page view${views === 1 ? "" : "s"}`;
  const copiesText = `${dl.toLocaleString("en-IN")} downloads`;
  return (
    <span className={className}>
      {viewsText}
      <span className="stats-sep"> · </span>
      {copiesText}
    </span>
  );
}
