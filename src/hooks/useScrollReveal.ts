import { useEffect, useRef, useState } from "react";

export interface UseScrollRevealOptions extends IntersectionObserverInit {
  /** Disconnect after first intersection (default true) */
  once?: boolean;
}

/**
 * Observes an element and toggles visibility when it enters the viewport.
 * Pair with `.scroll-reveal` + `.scroll-reveal-visible` from index.css.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: UseScrollRevealOptions,
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? true;
  const threshold = options?.threshold ?? 0.12;
  const rootMargin = options?.rootMargin ?? "0px 0px -48px 0px";
  const root = options?.root;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin, root },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, root]);

  return { ref, inView };
}
