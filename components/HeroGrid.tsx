import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const ROWS = 9;
const COLS = 31;
const GAP = 1;
const LINE_COLOR = "#ffffff";

// Title card placement, measured in grid squares. The card's top-left corner
// begins at the 3rd square across and the 2nd square down (0-indexed col 2,
// row 1) and spans a block of squares, snapping its edges to the grid lines.
const CARD_START_COL = 3;
const CARD_START_ROW = 1;
const CARD_COLS = 12;
const CARD_ROWS = 6;

// Stepped notch carved out of the card's bottom-right corner (in card-local
// grid cells) so the card reads as an L / staircase instead of a plain
// rectangle, letting the grid show through the corner. The bottom row drops its
// right-most NOTCH_BOTTOM_COLS cells; the row directly above drops its
// right-most NOTCH_UPPER_COLS cell(s).
const NOTCH_BOTTOM_COLS = 3;
const NOTCH_UPPER_COLS = 1;

const RoundTableIcon = (
  <svg className="hero-feature-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="18" cy="6" r="2.4" />
    <circle cx="18" cy="18" r="2.4" />
    <path d="M8.1 10.9 15.9 7.1M8.1 13.1 15.9 16.9" />
  </svg>
);

const AgentsIcon = (
  <svg className="hero-feature-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4.5" y="8" width="15" height="11" rx="3" />
    <path d="M12 8V4.5" />
    <circle cx="12" cy="3.4" r="1.2" />
    <path d="M9 13h.01M15 13h.01" />
    <path d="M2.5 13v2M21.5 13v2" />
  </svg>
);

const WorkspaceIcon = (
  <svg className="hero-feature-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16M9 12h12" />
  </svg>
);

type FeatureCard = {
  key: string;
  title: string;
  icon: typeof RoundTableIcon;
  items: string[];
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    key: "roundtable",
    title: "Round Table",
    icon: RoundTableIcon,
    items: ["Multiple models collaborate", "Weight model influence", "Synthesized answer"],
  },
  {
    key: "agents",
    title: "Custom Agents",
    icon: AgentsIcon,
    items: ["Specialized AI", "Shared project context", "Persistent memory"],
  },
  {
    key: "workspace",
    title: "Multi-Panel Workspace",
    icon: WorkspaceIcon,
    items: ["Multiple chats at once", "Side-by-side reasoning", "Built for parallel work"],
  },
];

const CheckIcon = (
  <svg className="hero-feature-card__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const HERO_GRID_GRADIENT = [
  "linear-gradient(112deg, #1E5A78 0%, #2A7F9E 10%, #3F9FC4 22%, #6ECFDF 36%, #8FE8F2 48%, #B5EEF0 58%, #D8EDB8 68%, #F6E7A8 78%, #F5B060 90%, #F47A2A 100%)",
  "radial-gradient(ellipse 75% 65% at 92% 88%, rgba(244, 122, 42, 0.28) 0%, transparent 58%)",
].join(", ");

type GridLayout = {
  cellSize: number;
  gap: number;
  patternSize: number;
  gridWidth: number;
  gridHeight: number;
};

/**
 * Compute the layout in *device* pixels first, then convert back to CSS px.
 *
 * The base grid lines (a repeating SVG background tile) and the overlay cells
 * (a CSS grid with `gap`) are two independent positioning systems. If a cell +
 * gap doesn't span a whole number of device pixels - which happens on any
 * fractional devicePixelRatio (e.g. Windows display scaling at 125%/150%) -
 * each system snaps to the device grid slightly differently. The two snappings
 * beat in and out of phase, and where they collide an overlay cell creeps over
 * a white line and the gap looks thinner. Snapping the cell + gap to integer
 * device pixels keeps every line on the exact same crisp boundary, so all gaps
 * render at a uniform width.
 */
function computeLayout(containerWidth: number, dpr: number): GridLayout {
  const deviceWidth = containerWidth * dpr;
  const gapDevice = Math.max(1, Math.round(GAP * dpr));
  const cellDevice = Math.floor((deviceWidth - (COLS - 1) * gapDevice) / COLS);

  const cellSize = cellDevice / dpr;
  const gap = gapDevice / dpr;
  const patternSize = (cellDevice + gapDevice) / dpr;
  const gridWidth = (cellDevice * COLS + gapDevice * (COLS - 1)) / dpr;
  const gridHeight = (cellDevice * ROWS + gapDevice * (ROWS - 1)) / dpr;

  return { cellSize, gap, patternSize, gridWidth, gridHeight };
}

function buildGridLinePattern({ cellSize, gap, patternSize }: GridLayout) {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize}" height="${patternSize}">`,
    `<rect x="${cellSize}" y="0" width="${gap}" height="${patternSize}" fill="${LINE_COLOR}"/>`,
    `<rect x="0" y="${cellSize}" width="${patternSize}" height="${gap}" fill="${LINE_COLOR}"/>`,
    `</svg>`,
  ].join("");

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function HeroGrid() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<GridLayout | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () =>
      setLayout(computeLayout(el.clientWidth, window.devicePixelRatio || 1));

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    // devicePixelRatio can change without a resize (e.g. dragging the window to
    // a monitor with different scaling), so recompute when it does too.
    let mql: MediaQueryList | null = null;
    const listenForDpr = () => {
      mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mql.addEventListener("change", onDprChange);
    };
    const onDprChange = () => {
      mql?.removeEventListener("change", onDprChange);
      update();
      listenForDpr();
    };
    listenForDpr();

    return () => {
      observer.disconnect();
      mql?.removeEventListener("change", onDprChange);
    };
  }, []);

  if (!layout || layout.cellSize <= 0) {
    return <div ref={wrapRef} className="hero-blank-grid-wrap" />;
  }

  const { cellSize, gap, patternSize, gridWidth, gridHeight } = layout;

  // Title card geometry. The clip-path traces the card outline clockwise from
  // the top-left, stepping in at the bottom-right to carve the staircase notch.
  // Interior cut lines land on grid lines (multiples of `step`); the far right
  // and bottom edges use the exact card size (which omits the trailing gap).
  const step = cellSize + gap;
  const cardW = CARD_COLS * cellSize + (CARD_COLS - 1) * gap;
  const cardH = CARD_ROWS * cellSize + (CARD_ROWS - 1) * gap;
  const notchUpperX = (CARD_COLS - NOTCH_UPPER_COLS) * step;
  const notchBottomX = (CARD_COLS - NOTCH_BOTTOM_COLS) * step;
  const notchUpperY = (CARD_ROWS - 2) * step;
  const notchMidY = (CARD_ROWS - 1) * step;
  const cardClip = `polygon(0px 0px, ${cardW}px 0px, ${cardW}px ${notchUpperY}px, ${notchUpperX}px ${notchUpperY}px, ${notchUpperX}px ${notchMidY}px, ${notchBottomX}px ${notchMidY}px, ${notchBottomX}px ${cardH}px, 0px ${cardH}px)`;

  return (
    <div ref={wrapRef} className="hero-blank-grid-wrap">
      {/* Base grid is pure white (backing color + white grid-line pattern). The
          overlay above reconstructs the full gradient per-cell, so the static
          look is unchanged - but keeping the base white guarantees that any
          rounded corner reveals clean white behind it, with no hard-edged
          gradient corner bleeding through at the sub-pixel seam. */}
      <div
        className="hero-blank-grid"
        style={{
          width: gridWidth,
          height: gridHeight,
          backgroundColor: LINE_COLOR,
          backgroundImage: buildGridLinePattern(layout),
          backgroundSize: `${patternSize}px ${patternSize}px`,
        }}
        aria-hidden="true"
      />

      {/* Overlay used only for the wave animation. It sits exactly on top of the
          grid above. Each cell is a solid-white backing with the cell's exact
          slice of the same gradient layered on top; as the wave passes we animate
          the gradient layer's border-radius, so the corners clip away to reveal
          pure white behind. The squares never move, resize, recolor or fade, and
          the crisp base grid lines show through the 1px gaps between cells. */}
      <div
        className="hero-blank-grid-overlay"
        style={
          {
            width: gridWidth,
            height: gridHeight,
            gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
            gap: `${gap}px`,
            "--hero-grad": HERO_GRID_GRADIENT,
            "--hero-grid-w": `${gridWidth}px`,
            "--hero-grid-h": `${gridHeight}px`,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          return (
            <div
              key={index}
              className="hero-blank-grid-overlay__cell"
              style={
                {
                  "--hero-col": col,
                  "--hero-bg-x": `-${col * patternSize}px`,
                  "--hero-bg-y": `-${row * patternSize}px`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Title card. It is a sibling of the grid layers and only sits on top of
          them (higher stacking order, its own pointer-events), so it never
          alters the grid's layout, cells or wave animation. Its position and
          size are derived from the same cell metrics, so its edges land exactly
          on the grid lines. */}
      <div
        className="hero-blank-card-layer"
        style={{ width: gridWidth, height: gridHeight }}
      >
        <div
          className="hero-blank-card"
          style={{
            left: CARD_START_COL * step,
            top: CARD_START_ROW * step,
            width: cardW,
            height: cardH,
            clipPath: cardClip,
          }}
        >
          <h1 className="hero-blank-card__title">
            One Prompt. Multiple Models.
            <br />
            Better Answers.
          </h1>
          <p className="hero-blank-card__subtitle">
            Run one prompt across every model you use, compare answers
            side-by-side, and ship prompts with confidence
          </p>
          <a className="hero-blank-card__cta" href="download.html">
            Get Access
          </a>
        </div>

        {/* Floating feature cards. Purely decorative cluster that sits on top of
            the grid on the right; staggered diagonally with gaps between cards. */}
        <div className="hero-feature-cluster" aria-hidden="true">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.key}
              className={`hero-feature-card hero-feature-card--${card.key}`}
            >
              <div className="hero-feature-card__header">
                {card.icon}
                <span className="hero-feature-card__title">{card.title}</span>
              </div>
              <div className="hero-feature-card__list">
                {card.items.map((item) => (
                  <div key={item} className="hero-feature-card__item">
                    {CheckIcon}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
