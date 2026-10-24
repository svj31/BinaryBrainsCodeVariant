"use client";

import { useEffect, useState } from "react";

/** True while the element is on screen and the tab is visible; used to pause WebGL work nobody can see. */
export function useVisible(ref: React.RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let seen = true;
    const sync = () => setOn(seen && !document.hidden);
    const io = new IntersectionObserver(([e]) => ((seen = e.isIntersecting), sync()), { rootMargin: "100px" });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => (io.disconnect(), document.removeEventListener("visibilitychange", sync));
  }, [ref]);
  return on;
}
