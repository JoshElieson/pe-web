import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { GitBranchPlus, ShieldCheck, UserCog } from "lucide-react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../src/hooks/usePrefersReducedMotion";

const TAB_ICON_PROPS = { size: 18, strokeWidth: 1.5, "aria-hidden": true as const };

type MockupType = "agent-editor" | "permissions" | "workflow";

type TabIconGlow = {
  color: string;
  shadows: [string, string, string];
};

type GovernTab = {
  id: string;
  label: string;
  subtitle: string;
  icon: ReactNode;
  title: string;
  description: string;
  bullets: string[];
  mockup: MockupType;
  gradient: string;
  iconGlow: TabIconGlow;
};

const TABS: GovernTab[] = [
  {
    id: "custom-agents",
    label: "Custom Agents",
    subtitle: "Create specialists for every task",
    icon: <UserCog {...TAB_ICON_PROPS} />,
    title: "Create specialists for every task",
    description:
      "Build AI teammates with custom prompts, permissions, models, memory, and workflows. Every agent can be tailored to a specific role and reused across projects.",
    bullets: [
      "Persistent personality & instructions",
      "Custom model assignment",
      "Project-scoped memory",
      "Independent permissions",
    ],
    mockup: "agent-editor",
    gradient:
      "linear-gradient(135deg, #f97316 0%, #fb923c 18%, #38bdf8 62%, #3b82f6 100%)",
    iconGlow: {
      color: "#3b82f6",
      shadows: [
        "rgba(249, 115, 22, 0.55)",
        "rgba(56, 189, 248, 0.5)",
        "rgba(59, 130, 246, 0.35)",
      ],
    },
  },
  {
    id: "permissions",
    label: "Permissions & Control",
    subtitle: "Grant exactly the access you want",
    icon: <ShieldCheck {...TAB_ICON_PROPS} />,
    title: "Grant exactly the access you want",
    description:
      "Every agent operates within a permission system you control. Allow file access, terminal commands, browser usage, Git operations, and more.",
    bullets: [
      "File read/write controls",
      "Terminal execution approval",
      "Browser permissions",
      "Git access management",
      "Project isolation",
    ],
    mockup: "permissions",
    gradient:
      "linear-gradient(135deg, #ec4899 0%, #d946ef 22%, #a855f7 48%, #38bdf8 78%, #22d3ee 100%)",
    iconGlow: {
      color: "#a855f7",
      shadows: [
        "rgba(236, 72, 153, 0.55)",
        "rgba(168, 85, 247, 0.5)",
        "rgba(34, 211, 238, 0.35)",
      ],
    },
  },
  {
    id: "automations",
    label: "Automations & Workflows",
    subtitle: "Let Forge work while you don't",
    icon: <GitBranchPlus {...TAB_ICON_PROPS} />,
    title: "Let Forge work while you don't",
    description:
      "Chain prompts, tools, agents, and actions into repeatable workflows. Automate testing, documentation, code reviews, deployments, and recurring development tasks.",
    bullets: [
      "Scheduled automations",
      "Multi-step workflows",
      "Agent handoffs",
      "Tool execution",
      "Project-aware context",
    ],
    mockup: "workflow",
    gradient:
      "linear-gradient(135deg, #22d3ee 0%, #818cf8 28%, #c084fc 55%, #f472b6 72%, #f97316 100%)",
    iconGlow: {
      color: "#818cf8",
      shadows: [
        "rgba(34, 211, 238, 0.55)",
        "rgba(192, 132, 252, 0.5)",
        "rgba(249, 115, 22, 0.35)",
      ],
    },
  },
];

const PERMISSION_TOGGLES = [
  { label: "Read Files", enabled: true },
  { label: "Edit Files", enabled: true },
  { label: "Terminal", enabled: true },
  { label: "Git Push", enabled: false },
  { label: "Browser", enabled: true },
] as const;

const WORKFLOW_STEPS = [
  "Code Change",
  "Review Agent",
  "Test Agent",
  "Documentation Agent",
  "Git Commit",
] as const;

function MockupShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="govern-section__dashboard-wrap">
      <div className="govern-section__dashboard-grid" aria-hidden="true" />
      <div className="govern-section__dashboard">
        <div className="govern-section__dashboard-header">
          <h4 className="govern-section__dashboard-title">{title}</h4>
        </div>
        {children}
      </div>
    </div>
  );
}

function AgentEditorMockup() {
  return (
    <MockupShell title="Agent editor">
      <div className="govern-section__mockup-form">
        <div className="govern-section__mockup-field">
          <span className="govern-section__mockup-label">Name</span>
          <span className="govern-section__mockup-value">Frontend Engineer</span>
        </div>
        <div className="govern-section__mockup-field">
          <span className="govern-section__mockup-label">Model</span>
          <span className="govern-section__mockup-value govern-section__mockup-value--select">
            claude-sonnet-4.6
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <div className="govern-section__mockup-field">
          <span className="govern-section__mockup-label">Permissions</span>
          <span className="govern-section__mockup-value govern-section__mockup-value--select">
            Read files, Edit files, Browser
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <div className="govern-section__mockup-field govern-section__mockup-field--textarea">
          <span className="govern-section__mockup-label">Description</span>
          <span className="govern-section__mockup-textarea">
            Expert in React, TypeScript, and modern UI patterns. Reviews component architecture,
            accessibility, and performance.
          </span>
        </div>
      </div>
    </MockupShell>
  );
}

function PermissionsMockup() {
  return (
    <MockupShell title="Permission dashboard">
      <ul className="govern-section__mockup-toggles" role="list">
        {PERMISSION_TOGGLES.map((toggle) => (
          <li key={toggle.label} className="govern-section__mockup-toggle">
            <span className="govern-section__mockup-toggle-label">{toggle.label}</span>
            <span
              className={`govern-section__mockup-toggle-state${toggle.enabled ? " govern-section__mockup-toggle-state--on" : " govern-section__mockup-toggle-state--off"}`}
              aria-hidden="true"
            >
              {toggle.enabled ? "✓" : "✗"}
            </span>
          </li>
        ))}
      </ul>
    </MockupShell>
  );
}

function WorkflowMockup() {
  return (
    <MockupShell title="Workflow builder">
      <ol className="govern-section__mockup-workflow" role="list">
        {WORKFLOW_STEPS.map((step, index) => (
          <li key={step} className="govern-section__mockup-workflow-step">
            <span className="govern-section__mockup-workflow-node">{step}</span>
            {index < WORKFLOW_STEPS.length - 1 && (
              <span className="govern-section__mockup-workflow-arrow" aria-hidden="true">
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
    </MockupShell>
  );
}

function MockupPanel({ type }: { type: MockupType }) {
  switch (type) {
    case "agent-editor":
      return <AgentEditorMockup />;
    case "permissions":
      return <PermissionsMockup />;
    case "workflow":
      return <WorkflowMockup />;
  }
}

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;
const OUTLINE_TRANSITION = {
  type: "tween" as const,
  duration: 0.45,
  ease: MOTION_EASE,
};

type OutlineMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

function getOutlineMetrics(
  tab: HTMLButtonElement,
  track: HTMLElement,
): OutlineMetrics {
  const tabRect = tab.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const cs = getComputedStyle(tab);
  const r = (value: string) => parseFloat(value) || 0;

  return {
    x: tabRect.left - trackRect.left,
    y: tabRect.top - trackRect.top,
    width: tabRect.width,
    height: tabRect.height,
    topLeft: r(cs.borderTopLeftRadius),
    topRight: r(cs.borderTopRightRadius),
    bottomRight: r(cs.borderBottomRightRadius),
    bottomLeft: r(cs.borderBottomLeftRadius),
  };
}

export function GovernSection() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0];
  const reducedMotion = usePrefersReducedMotion();
  const outlineTransition = reducedMotion ? { duration: 0 } : OUTLINE_TRANSITION;

  const tabsTrackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [outline, setOutline] = useState<OutlineMetrics>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
  });

  const updateOutline = useCallback(() => {
    const index = TABS.findIndex((t) => t.id === activeId);
    const tab = tabRefs.current[index];
    const track = tabsTrackRef.current;
    if (!tab || !track) return;

    const metrics = getOutlineMetrics(tab, track);

    // Each shared seam is a single 1px border owned by the *previous* segment,
    // which sits just outside this segment's box. Stretch the outline by 1px
    // over that seam so the ring fully wraps the segment on every side.
    const prev = index > 0 ? tabRefs.current[index - 1] : null;
    if (prev) {
      const tabRect = tab.getBoundingClientRect();
      const prevRect = prev.getBoundingClientRect();
      if (Math.abs(prevRect.top - tabRect.top) < 1) {
        metrics.x -= 1;
        metrics.width += 1;
      } else {
        metrics.y -= 1;
        metrics.height += 1;
      }
    }

    setOutline(metrics);
  }, [activeId]);

  useLayoutEffect(() => {
    updateOutline();

    const track = tabsTrackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(updateOutline);
    observer.observe(track);
    tabRefs.current.forEach((tab) => {
      if (tab) observer.observe(tab);
    });

    window.addEventListener("resize", updateOutline);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOutline);
    };
  }, [updateOutline]);

  return (
    <section className="govern-section" aria-labelledby="govern-heading">
      <div className="govern-section__inner">
        <header className="govern-section__header">
          <h2 id="govern-heading" className="govern-section__title">
            Agents that work your way
          </h2>
          <p className="govern-section__lead">
            Build custom agents, control every permission, and automate the work that slows you down.
          </p>
        </header>

        <nav className="govern-section__tabs" aria-label="Agent capabilities">
          <div ref={tabsTrackRef} className="govern-section__tabs-track">
            <motion.div
              aria-hidden="true"
              className="govern-section__tab-outline"
              initial={false}
              animate={{
                x: outline.x,
                y: outline.y,
                width: outline.width,
                height: outline.height,
                borderTopLeftRadius: outline.topLeft,
                borderTopRightRadius: outline.topRight,
                borderBottomRightRadius: outline.bottomRight,
                borderBottomLeftRadius: outline.bottomLeft,
                opacity: outline.width > 0 ? 1 : 0,
              }}
              transition={outlineTransition}
              style={{ background: active.gradient }}
            />
            <ul className="govern-section__tabs-list" role="list">
              {TABS.map((tab, index) => {
                const isActive = tab.id === activeId;
                return (
                  <li key={tab.id}>
                    <button
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      type="button"
                      className={`govern-section__tab${isActive ? " govern-section__tab--active" : ""}`}
                      onClick={() => setActiveId(tab.id)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={`govern-section__tab-icon${isActive ? " govern-section__tab-icon--active" : ""}`}
                        style={
                          isActive
                            ? ({
                                "--tab-icon-color": tab.iconGlow.color,
                                "--tab-glow-1": tab.iconGlow.shadows[0],
                                "--tab-glow-2": tab.iconGlow.shadows[1],
                                "--tab-glow-3": tab.iconGlow.shadows[2],
                              } as CSSProperties)
                            : undefined
                        }
                      >
                        {tab.icon}
                      </span>
                      <span className="govern-section__tab-body">
                        <span className="govern-section__tab-label">{tab.label}</span>
                        <span className="govern-section__tab-sub">{tab.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="govern-section__panel" aria-live="polite">
          <div className="govern-section__copy">
            <h3 className="govern-section__panel-title">{active.title}</h3>
            <p className="govern-section__panel-desc">{active.description}</p>
            <ul className="govern-section__bullets" role="list">
              {active.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          <MockupPanel type={active.mockup} />
        </div>
      </div>
    </section>
  );
}
