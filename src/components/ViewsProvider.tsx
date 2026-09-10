"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ViewsContext = createContext<number | null>(null);

export function ViewsProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const already = sessionStorage.getItem("ecourt-pv");
    const method = already ? "GET" : "POST";

    (async () => {
      try {
        const r = await fetch("/api/views", { method, cache: "no-store" });
        const d = (await r.json()) as { count?: number };
        if (!cancelled && typeof d.count === "number") {
          sessionStorage.setItem("ecourt-pv", "1");
          setCount(d.count);
          return;
        }
      } catch {
        /* fall through */
      }
      try {
        const r = await fetch("/api/views", { method: "GET", cache: "no-store" });
        const d = (await r.json()) as { count?: number };
        if (!cancelled && typeof d.count === "number") setCount(d.count);
        else if (!cancelled) setCount(0);
      } catch {
        if (!cancelled) setCount(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <ViewsContext.Provider value={count}>{children}</ViewsContext.Provider>;
}

export function useViews(): number | null {
  return useContext(ViewsContext);
}

export function ViewLabel({ className }: { className?: string }) {
  const count = useViews();
  const label =
    count === null
      ? "…"
      : `${count.toLocaleString("en-IN")} page view${count === 1 ? "" : "s"}`;
  return <span className={className}>{label}</span>;
}
