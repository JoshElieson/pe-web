import { useEffect, useState, type RefObject } from "react";

export type SectionScrollProgressOptions = {
  /**
   * Progress 0 when the section top is at this fraction of viewport height
   * (1 = bottom edge, section just entering view).
   */
  startAt?: number;
  /**
   * Progress 1 when the section top is at this fraction of viewport height
   * (0 = top edge).
   */
  endAt?: number;
  speed?: number;
};

/**
 * Maps scroll position to 0–1 based on where the section top sits in the viewport.
 */
export function useSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  options: SectionScrollProgressOptions = {},
): number {
  const { startAt = 1, endAt = 0, speed = 1 } = options;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const viewportHeight = window.innerHeight;
      const startTop = startAt * viewportHeight;
      const endTop = endAt * viewportHeight;
      const range = startTop - endTop;

      if (range <= 0) {
        setProgress(1);
        return;
      }

      const rect = section.getBoundingClientRect();
      const raw = (startTop - rect.top) / range;
      const next = Math.min(1, Math.max(0, raw * speed));
      setProgress(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef, startAt, endAt, speed]);

  return progress;
}
