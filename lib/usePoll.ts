"use client";
import { useEffect, useRef, useState } from "react";

export type PollState<T> = { data: T | null; error: string | null; loading: boolean; updatedAt: number | null };

/** Fetch JSON `{ data }` from an internal API route and refresh on an interval while the tab is visible. */
export function usePoll<T>(url: string | null, intervalMs: number): PollState<T> {
  const [state, setState] = useState<PollState<T>>({ data: null, error: null, loading: true, updatedAt: null });
  const urlRef = useRef(url);

  useEffect(() => {
    urlRef.current = url;
    if (!url) return;
    let alive = true;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, data: s.data && urlRef.current === url ? s.data : null }));

    async function load() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch(url!, { signal: ctrl.signal, cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status})`);
        setState({ data: json.data as T, error: null, loading: false, updatedAt: Date.now() });
      } catch (e) {
        if (!alive || (e as Error).name === "AbortError") return;
        setState((s) => ({ ...s, error: (e as Error).message, loading: false }));
      }
    }
    load();
    const id = window.setInterval(load, intervalMs);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; ctrl.abort(); clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [url, intervalMs]);

  return state;
}
