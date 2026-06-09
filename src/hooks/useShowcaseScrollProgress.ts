import { useEffect, useState, type RefObject } from "react";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** power2.out — matches antigravity.google GSAP easing */
export function easePower2Out(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Progress for the bottom-of-page sticky showcase:
 * - Starts growing as the section enters the viewport
 * - Finishes expanding while the video is pinned and visible
 */
export function useShowcaseScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId = 0;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(section.offsetHeight - vh, 1);

      let raw = 0;

      if (rect.top > 0) {
        const approach = (vh - rect.top) / vh;
        raw = clamp(approach * 0.4, 0, 0.4);
      } else {
        const pinned = clamp(-rect.top / (scrollRange * 0.65), 0, 1);
        raw = 0.4 + pinned * 0.6;
      }

      setProgress(easePower2Out(raw));
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          update();
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(section);
    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sectionRef]);

  return progress;
}
