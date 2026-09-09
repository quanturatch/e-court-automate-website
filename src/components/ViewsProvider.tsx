"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ViewsContext = createContext<number | null>(null);

export function ViewsProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const already = sessionStorage.getItem("ecourt-pv");
    const method = already ? "GET" : "POST";
    fetch("/api/views", { method })
      .then((r) => r.json())
      .then((d: { count?: number }) => {
        if (!cancelled && typeof d.count === "number") {
          sessionStorage.setItem("ecourt-pv", "1");
          setCount(d.count);
        }
      })
      .catch(() => {});
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
