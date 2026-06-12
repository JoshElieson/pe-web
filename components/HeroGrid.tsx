import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const ROWS = 9;
const MIN_COLS = 14;
const MAX_COLS = 31;
// Target CSS px per (cell + gap). The column count adapts to the viewport so
// the squares stay roughly this size on any monitor, which in turn keeps the
// title card and floating cards at a consistent physical size.
const TARGET_STEP = 62;
const GAP = 1;
const LINE_COLOR = "#ffffff";

// Title card placement, measured in grid squares. The card's top row is fixed;
// its column start/span are computed per-viewport in computeCardPlacement so
// the card keeps a readable size and the floating cards always fit beside it.
const CARD_START_ROW = 1;
const CARD_ROWS = 6;

// Floating feature-card cluster. Sized in em (see styles.css) so the whole
// cluster can be scaled by setting font-size; natural dimensions are its
// bounding box at 1em = 16px.
const CLUSTER_MIN_VIEWPORT = 1100;
const CLUSTER_NATURAL_W_EM = 34.5;
const CLUSTER_NATURAL_H_EM = 26.5;
const CLUSTER_BASE_FONT = 16;

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
  cols: number;
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
  const cols = Math.min(
    MAX_COLS,
    Math.max(MIN_COLS, Math.round(containerWidth / TARGET_STEP))
  );

  const deviceWidth = containerWidth * dpr;
  const gapDevice = Math.max(1, Math.round(GAP * dpr));
  const cellDevice = Math.floor((deviceWidth - (cols - 1) * gapDevice) / cols);

  const cellSize = cellDevice / dpr;
  const gap = gapDevice / dpr;
  const patternSize = (cellDevice + gapDevice) / dpr;
  const gridWidth = (cellDevice * cols + gapDevice * (cols - 1)) / dpr;
  const gridHeight = (cellDevice * ROWS + gapDevice * (ROWS - 1)) / dpr;

  return { cols, cellSize, gap, patternSize, gridWidth, gridHeight };
}

/**
 * Choose where the title card sits and how many columns it spans. With the
 * floating cards visible the card hugs the left side and leaves the right
 * portion of the grid free; without them it widens slightly and centers.
 */
function computeCardPlacement(cols: number, showCluster: boolean) {
  if (showCluster) {
    const cardCols = Math.min(12, Math.floor(cols * 0.55));
    const cardStartCol = cols >= 26 ? 3 : 2;
    return { cardCols, cardStartCol };
  }
  const cardCols = Math.min(12, cols - 4);
  const cardStartCol = Math.floor((cols - cardCols) / 2);
  return { cardCols, cardStartCol };
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

  const { cols, cellSize, gap, patternSize, gridWidth, gridHeight } = layout;

  const showCluster = gridWidth >= CLUSTER_MIN_VIEWPORT;
  const { cardCols, cardStartCol } = computeCardPlacement(cols, showCluster);

  // Title card geometry. The clip-path traces the card outline clockwise from
  // the top-left, stepping in at the bottom-right to carve the staircase notch.
  // Interior cut lines land on grid lines (multiples of `step`); the far right
  // and bottom edges use the exact card size (which omits the trailing gap).
  const step = cellSize + gap;
  const cardW = cardCols * cellSize + (cardCols - 1) * gap;
  const cardH = CARD_ROWS * cellSize + (CARD_ROWS - 1) * gap;
  const notchUpperX = (cardCols - NOTCH_UPPER_COLS) * step;
  const notchBottomX = (cardCols - NOTCH_BOTTOM_COLS) * step;
  const notchUpperY = (CARD_ROWS - 2) * step;
  const notchMidY = (CARD_ROWS - 1) * step;
  const cardClip = `polygon(0px 0px, ${cardW}px 0px, ${cardW}px ${notchUpperY}px, ${notchUpperX}px ${notchUpperY}px, ${notchUpperX}px ${notchMidY}px, ${notchBottomX}px ${notchMidY}px, ${notchBottomX}px ${cardH}px, 0px ${cardH}px)`;

  // Floating cluster geometry. The cluster lives in the free zone to the right
  // of the title card; it scales down (via font-size, everything inside is in
  // em) when the zone is narrower than its natural size, so the cards always
  // stay fully on screen.
  const zoneStart = cardStartCol * step + cardW + step / 2;
  const zoneWidth = gridWidth - zoneStart - step / 2;
  const clusterScale = Math.min(
    1,
    zoneWidth / (CLUSTER_NATURAL_W_EM * CLUSTER_BASE_FONT)
  );
  const clusterFont = CLUSTER_BASE_FONT * clusterScale;
  const clusterW = CLUSTER_NATURAL_W_EM * clusterFont;
  const clusterH = CLUSTER_NATURAL_H_EM * clusterFont;
  const clusterLeft = zoneStart + Math.min((zoneWidth - clusterW) / 2, 192);
  const clusterTop = Math.max(step / 2, (gridHeight - clusterH) / 2);

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
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
            gap: `${gap}px`,
            "--hero-grad": HERO_GRID_GRADIENT,
            "--hero-grid-w": `${gridWidth}px`,
            "--hero-grid-h": `${gridHeight}px`,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {Array.from({ length: ROWS * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
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
            left: cardStartCol * step,
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
            the grid on the right; staggered diagonally with gaps between cards.
            Position and scale are computed from the grid so the cluster always
            fits beside the title card; on narrow viewports it is omitted and
            the title card centers instead. */}
        {showCluster && (
        <div
          className="hero-feature-cluster"
          style={{
            left: clusterLeft,
            top: clusterTop,
            width: clusterW,
            height: clusterH,
            fontSize: `${clusterFont}px`,
          }}
          aria-hidden="true"
        >
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
        )}
      </div>
    </div>
  );
}
