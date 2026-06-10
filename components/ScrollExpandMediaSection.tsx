import { useLayoutEffect, useRef, useState } from "react";
import { useShowcaseScrollProgress } from "../src/hooks/useShowcaseScrollProgress";

const DEMO_VIDEO_SRC = "assets/promo/forge-demo-hq.webm";

/** Resting width when the section first pins; expands slightly on scroll. */
const START_WIDTH_PX = 1400;
const END_WIDTH_PX = 1700;
const MOBILE_BREAKPOINT_PX = 767;
const MOBILE_HORIZONTAL_GUTTER_PX = 24;
const START_Y = 24;
const END_RADIUS = 36;

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function ScrollExpandMediaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rawProgress = useShowcaseScrollProgress(sectionRef);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  const isMobile = viewportWidth > 0 && viewportWidth <= MOBILE_BREAKPOINT_PX;
  const mobileMaxWidthPx = Math.max(viewportWidth - MOBILE_HORIZONTAL_GUTTER_PX, 0);
  const startWidthPx = isMobile
    ? mobileMaxWidthPx
    : Math.min(START_WIDTH_PX, viewportWidth - 48);
  const endWidthPx = isMobile
    ? mobileMaxWidthPx
    : Math.max(startWidthPx, Math.min(END_WIDTH_PX, viewportWidth - 48));
  const targetWidthPx = isMobile ? mobileMaxWidthPx : lerp(startWidthPx, endWidthPx, rawProgress);
  const translateY = isMobile ? 0 : lerp(START_Y, 0, rawProgress);
  const borderRadius = isMobile ? 16 : END_RADIUS;

  const videoStyle = {
    width: `${targetWidthPx}px`,
    maxWidth: isMobile ? "100%" : `${END_WIDTH_PX}px`,
    transform: isMobile ? "none" : `translateY(${translateY}px)`,
    borderRadius: `${borderRadius}px`,
  } as const;

  useLayoutEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    tryPlay();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="forge-showcase" aria-label="FORGE product demo">
      <div className="forge-showcase__sticky">
        <div className="forge-showcase__inner">
          <div ref={wrapperRef} className="forge-showcase__video-wrapper" style={videoStyle}>
            <div className="forge-showcase__media" data-media-slot="video">
              <video
                ref={videoRef}
                src={DEMO_VIDEO_SRC}
                autoPlay
                loop
                muted
                playsInline
                aria-label="FORGE product demo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
