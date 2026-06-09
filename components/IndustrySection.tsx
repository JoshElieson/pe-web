import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../src/hooks/usePrefersReducedMotion";

type IndustryItem = {
  num: string;
  text: string;
};

type Industry = {
  id: string;
  label: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  items: IndustryItem[];
};

const INDUSTRIES: Industry[] = [
  {
    id: "multi-panel",
    label: "Multi-Panel Workspace",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="8" height="18" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
    title: "Multi-Panel Workspace",
    subtitle: "Think across multiple conversations simultaneously",
    items: [
      { num: "01", text: "Open multiple AI conversations side-by-side" },
      { num: "02", text: "Resize and organize panels however you work best" },
      { num: "03", text: "Run research, coding, and planning simultaneously" },
      { num: "04", text: "Eliminate constant context switching" },
    ],
  },
  {
    id: "shared-context",
    label: "Shared Context",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51 15.42 17.49M15.41 6.51 8.59 10.49" strokeLinecap="round" />
      </svg>
    ),
    title: "Shared Context",
    subtitle: "Every model understands the same project",
    items: [
      { num: "01", text: "Share files across every panel and agent" },
      { num: "02", text: "Maintain project understanding between conversations" },
      { num: "03", text: "Eliminate repetitive prompting" },
      { num: "04", text: "Keep all AI collaborators aligned" },
    ],
  },
  {
    id: "project-memory",
    label: "Project Memory",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
    title: "Project Memory",
    subtitle: "Knowledge persists beyond a single chat",
    items: [
      { num: "01", text: "Store project-specific instructions" },
      { num: "02", text: "Remember architecture decisions" },
      { num: "03", text: "Reuse knowledge across sessions" },
      { num: "04", text: "Build long-term AI collaborators" },
    ],
  },
  {
    id: "compare-outputs",
    label: "Compare Outputs",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="18" rx="1" />
        <path d="M10.5 12h3" strokeLinecap="round" />
      </svg>
    ),
    title: "Compare Outputs",
    subtitle: "Evaluate multiple approaches instantly",
    items: [
      { num: "01", text: "See answers side-by-side" },
      { num: "02", text: "Compare reasoning paths" },
      { num: "03", text: "Validate important decisions" },
      { num: "04", text: "Choose the strongest solution" },
    ],
  },
  {
    id: "team-collaboration",
    label: "Team Collaboration",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Team Collaboration",
    subtitle: "Designed for individuals and teams",
    items: [
      { num: "01", text: "Organize work into projects" },
      { num: "02", text: "Share agents and context" },
      { num: "03", text: "Standardize workflows" },
      { num: "04", text: "Scale from personal use to teams" },
    ],
  },
];

const PANEL_GRADIENTS: Record<string, string> = {
  "multi-panel":
    "linear-gradient(135deg, #f97316 0%, #fb923c 18%, #38bdf8 62%, #3b82f6 100%)",
  "shared-context":
    "linear-gradient(90deg, #ec4899 0%, #d946ef 22%, #a855f7 48%, #38bdf8 78%, #22d3ee 100%)",
  "project-memory":
    "linear-gradient(90deg, #06b6d4 0%, #22d3ee 24%, #6366f1 52%, #c084fc 76%, #e879f9 100%)",
  "compare-outputs":
    "linear-gradient(90deg, #f97316 0%, #ef4444 28%, #22d3ee 72%, #38bdf8 100%)",
  "team-collaboration":
    "linear-gradient(160deg, #22d3ee 0%, #818cf8 28%, #c084fc 55%, #f472b6 72%, #f97316 100%)",
};

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const PILL_TRANSITION = { type: "tween" as const, duration: 0.5, ease: MOTION_EASE };
const PANEL_FADE_MS = 320;

type PillMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getPillMetrics(tab: HTMLButtonElement, track: HTMLElement): PillMetrics {
  const tabRect = tab.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();

  return {
    x: tabRect.left - trackRect.left,
    y: tabRect.top - trackRect.top,
    width: tabRect.width,
    height: tabRect.height,
  };
}

function IndustryPanel({ industry }: { industry: Industry }) {
  return (
    <>
      <h3 className="industry-section__panel-title">{industry.title}</h3>
      <p className="industry-section__panel-subtitle">{industry.subtitle}</p>
      <ol className="industry-section__items">
        {industry.items.map((item) => (
          <li key={item.num} className="industry-section__item">
            <span className="industry-section__item-num">{item.num}</span>
            <span className="industry-section__item-text">{item.text}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

export function IndustrySection() {
  const [activeId, setActiveId] = useState(INDUSTRIES[0].id);
  const [renderedId, setRenderedId] = useState(INDUSTRIES[0].id);
  const [panelOpacity, setPanelOpacity] = useState(1);
  const [panelTranslateY, setPanelTranslateY] = useState(0);
  const active = INDUSTRIES.find((industry) => industry.id === activeId) ?? INDUSTRIES[0];
  const rendered =
    INDUSTRIES.find((industry) => industry.id === renderedId) ?? INDUSTRIES[0];
  const reducedMotion = usePrefersReducedMotion();
  const pillTransition = reducedMotion ? { duration: 0 } : PILL_TRANSITION;
  const tabsTrackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingTabRef = useRef(INDUSTRIES[0].id);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pill, setPill] = useState<PillMetrics>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const updatePill = useCallback(() => {
    const index = INDUSTRIES.findIndex((industry) => industry.id === activeId);
    const tab = tabRefs.current[index];
    const track = tabsTrackRef.current;
    if (!tab || !track) return;

    setPill(getPillMetrics(tab, track));
  }, [activeId]);

  useLayoutEffect(() => {
    updatePill();

    const track = tabsTrackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(track);
    tabRefs.current.forEach((tab) => {
      if (tab) observer.observe(tab);
    });

    window.addEventListener("resize", updatePill);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [updatePill]);

  const focusTab = useCallback((id: string) => {
    document.getElementById(`industry-tab-${id}`)?.focus();
  }, []);

  const selectTab = useCallback(
    (id: string) => {
      if (id === activeId) return;

      pendingTabRef.current = id;
      setActiveId(id);

      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }

      requestAnimationFrame(() => {
        setPanelOpacity(0);
        setPanelTranslateY(-8);

        fadeTimerRef.current = setTimeout(() => {
          setRenderedId(pendingTabRef.current);
          setPanelTranslateY(10);
          setPanelOpacity(0);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPanelOpacity(1);
              setPanelTranslateY(0);
            });
          });

          fadeTimerRef.current = null;
        }, PANEL_FADE_MS);
      });
    },
    [activeId],
  );

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const lastIndex = INDUSTRIES.length - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          nextIndex = index === lastIndex ? 0 : index + 1;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          nextIndex = index === 0 ? lastIndex : index - 1;
          break;
        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          event.preventDefault();
          nextIndex = lastIndex;
          break;
        default:
          return;
      }

      const next = INDUSTRIES[nextIndex];
      selectTab(next.id);
      focusTab(next.id);
    },
    [focusTab, selectTab],
  );

  return (
    <section className="industry-section" aria-labelledby="industry-heading">
      <div className="industry-section__inner">
        <header className="industry-section__header">
          <h2 id="industry-heading" className="industry-section__title">
            The AI Workspace
          </h2>
          <p className="industry-section__lead">
            Bring every model, conversation, and project into one unified environment—built for how you actually work.
          </p>
        </header>

        <div className="industry-section__body">
          <nav className="industry-section__nav" aria-label="Workspace features">
            <div ref={tabsTrackRef} className="industry-section__tabs-track">
              <motion.div
                aria-hidden="true"
                className="industry-section__tabs-active-pill"
                initial={false}
                animate={{
                  x: pill.x,
                  y: pill.y,
                  width: pill.width,
                  height: pill.height,
                  opacity: pill.height > 0 ? 1 : 0,
                }}
                transition={pillTransition}
              />
              <ul
                className="industry-section__tabs"
                role="tablist"
                aria-orientation="vertical"
              >
              {INDUSTRIES.map((industry, index) => {
                const isActive = industry.id === activeId;
                return (
                  <li key={industry.id} role="none">
                    <button
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      type="button"
                      role="tab"
                      id={`industry-tab-${industry.id}`}
                      aria-selected={isActive}
                      aria-controls={`industry-panel-${industry.id}`}
                      tabIndex={isActive ? 0 : -1}
                      className={`industry-section__tab${isActive ? " industry-section__tab--active" : ""}`}
                      onClick={() => selectTab(industry.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      <span className="industry-section__tab-icon">{industry.icon}</span>
                      <span className="industry-section__tab-label">{industry.label}</span>
                    </button>
                  </li>
                );
              })}
              </ul>
            </div>
          </nav>

          <div className="industry-section__panel-wrap">
            <div
              className="industry-section__panel-border"
              style={
                {
                  "--industry-panel-gradient":
                    PANEL_GRADIENTS[active.id] ?? PANEL_GRADIENTS["multi-panel"],
                } as React.CSSProperties
              }
            >
              <div className="industry-section__panel">
                <div className="industry-section__panel-stage" aria-live="polite">
                  <article
                    id={`industry-panel-${rendered.id}`}
                    role="tabpanel"
                    aria-labelledby={`industry-tab-${rendered.id}`}
                    tabIndex={0}
                    className="industry-section__panel-content"
                    style={{
                      opacity: panelOpacity,
                      transform: `translateY(${panelTranslateY}px)`,
                    }}
                  >
                    <IndustryPanel industry={rendered} />
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
