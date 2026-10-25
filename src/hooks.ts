import { useEffect, useRef, useState, type RefObject } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

const SCRAMBLE_CHARS = "ABCDEFGHKMNPRSTX0123456789#$&/=+*";

/** Scramble-decode text effect. Static under reduced motion. */
export function useScramble(text: string, startDelay = 0): string {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState<string>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? text
      : text.replace(/\S/g, "\u00A0")
  );

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }

    let raf = 0;
    let started: number | null = null;
    const settlePerMs = 55;

    const tick = (t: number) => {
      if (started === null) started = t + startDelay;
      if (t < started) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const settled = Math.floor((t - started) / settlePerMs);
      if (settled >= text.length) {
        setOut(text);
        return;
      }
      setOut(
        text
          .split("")
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < settled) return c;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, startDelay]);

  return out;
}

/** Animated count-up that starts when the element scrolls into view. */
export function useCountUp(target: number, duration = 1300): { ref: RefObject<HTMLDivElement | null>; value: number } {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, reduced]);

  return { ref, value };
}
