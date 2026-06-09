import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const VISIBLE_ROWS = 9;
const GRID_TOP_OFFSET = 72;
const GRID_BLEED_COLUMNS = 0;

type Breakpoint = "mobile" | "sm" | "tablet" | "desktop";

type GridConfig = {
  cellSize: number;
  whiteCells: { startRow: number; endRow: number; startCol: number; endCol: number };
  excludeLShape: boolean;
  bottomRightSteps: number[];
  bottomLeftColumnHeight: number;
  rightEdgeColumnHeight: number;
  rightEdgeFullColumns: number;
  leftEdgeFullColumns: number;
  bottomRightCornerExtraWidth: number;
  bottomCenterTiles: number;
};

const GRID_CONFIGS: Record<Breakpoint, GridConfig> = {
  mobile: {
    cellSize: 44,
    whiteCells: { startRow: 1, endRow: 7, startCol: 0, endCol: 25 },
    excludeLShape: false,
    bottomRightSteps: [5, 3, 3, 2, 2, 2, 2],
    bottomLeftColumnHeight: 4,
    rightEdgeColumnHeight: 0,
    rightEdgeFullColumns: 0,
    leftEdgeFullColumns: 1,
    bottomRightCornerExtraWidth: 0,
    bottomCenterTiles: 7,
  },
  sm: {
    cellSize: 44,
    whiteCells: { startRow: 1, endRow: 7, startCol: 0, endCol: 25 },
    excludeLShape: false,
    bottomRightSteps: [4, 4, 3, 3, 2, 2, 1],
    bottomLeftColumnHeight: 4,
    rightEdgeColumnHeight: 0,
    rightEdgeFullColumns: 0,
    leftEdgeFullColumns: 1,
    bottomRightCornerExtraWidth: 0,
    bottomCenterTiles: 0,
  },
  tablet: {
    cellSize: 55,
    whiteCells: { startRow: 1, endRow: 8, startCol: 1, endCol: 13 },
    excludeLShape: false,
    bottomRightSteps: [3, 2, 1],
    bottomLeftColumnHeight: 2,
    rightEdgeColumnHeight: 0,
    rightEdgeFullColumns: 0,
    leftEdgeFullColumns: 0,
    bottomRightCornerExtraWidth: 0,
    bottomCenterTiles: 0,
  },
  desktop: {
    cellSize: 66,
    whiteCells: { startRow: 1, endRow: 8, startCol: 1, endCol: 14 },
    excludeLShape: false,
    bottomRightSteps: [4, 3, 2, 1],
    bottomLeftColumnHeight: 2,
    rightEdgeColumnHeight: 0,
    rightEdgeFullColumns: 0,
    leftEdgeFullColumns: 0,
    bottomRightCornerExtraWidth: 0,
    bottomCenterTiles: 0,
  },
};

const getBreakpoint = (width: number): Breakpoint => {
  if (width < 640) return "mobile";
  if (width < 768) return "sm";
  if (width < 1024) return "tablet";
  return "desktop";
};

const gridBodyHeight = (cellSize: number, rows: number) => rows * cellSize + (rows - 1) + 2;

const gridTotalHeight = (cellSize: number, rows: number) =>
  GRID_TOP_OFFSET + gridBodyHeight(cellSize, rows);

function isWhiteCell(col: number, row: number, cols: number, config: GridConfig): boolean {
  const { whiteCells: g, excludeLShape: exclude, bottomRightSteps: steps } = config;
  if (!(row >= g.startRow && row <= g.endRow && col >= g.startCol && col <= g.endCol)) {
    return false;
  }

  if (exclude) {
    const bottomRow = row === g.endRow;
    const nearBottom = row === g.endRow - 1;
    const rightCol = col === g.endCol;
    const nearRight = col === g.endCol - 1;
    const twoFromRight = col === g.endCol - 2;
    if ((bottomRow && (rightCol || nearRight || twoFromRight)) || (nearBottom && rightCol)) {
      return false;
    }
  }

  const stepIndex = g.endRow - row;
  if (stepIndex >= 0 && stepIndex < steps.length) {
    const step = steps[stepIndex];
    if (g.endCol >= cols) {
      if (col >= cols - step) return false;
    } else if (col > g.endCol - step) {
      return false;
    }
  }

  const leftStart = g.endRow - config.bottomLeftColumnHeight;
  if (
    config.bottomLeftColumnHeight > 0 &&
    col === g.startCol &&
    row >= leftStart &&
    row < g.endRow
  ) {
    return false;
  }

  const rightStart = g.endRow - config.rightEdgeColumnHeight + 1;
  if (
    config.rightEdgeColumnHeight > 0 &&
    col === cols - 1 &&
    row >= rightStart &&
    row <= g.endRow
  ) {
    return false;
  }

  if (config.rightEdgeFullColumns > 0 && col >= cols - config.rightEdgeFullColumns) return false;
  if (config.leftEdgeFullColumns > 0 && col < g.startCol + config.leftEdgeFullColumns) return false;

  if (
    config.bottomRightCornerExtraWidth > 0 &&
    row === g.endRow &&
    col >= cols - config.rightEdgeFullColumns - config.bottomRightCornerExtraWidth &&
    col < cols - config.rightEdgeFullColumns
  ) {
    return false;
  }

  if (config.bottomCenterTiles > 0 && row === g.endRow) {
    const start = Math.floor((cols - config.bottomCenterTiles) / 2);
    if (col >= start && col < start + config.bottomCenterTiles) return false;
  }

  return true;
}

type GridCell = {
  key: string;
  white: boolean;
};

export function ForgeGridAnimation() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );
  const resizeTimeout = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
      if (resizeTimeout.current !== null) window.clearTimeout(resizeTimeout.current);
      resizeTimeout.current = window.setTimeout(() => {
        resizeTimeout.current = null;
      }, 140);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimeout.current !== null) window.clearTimeout(resizeTimeout.current);
    };
  }, []);

  const applyHeroHeight = useCallback(
    (
      totalHeight: number,
      cellSize: number,
      whiteStartCol: number,
      whiteStartRow: number,
      isWideLayout: boolean,
    ) => {
      const hero = document.querySelector<HTMLElement>(".hero-forge");
      const gridWrap = document.querySelector<HTMLElement>(".hero-forge__grid-wrap");
      const content = document.querySelector<HTMLElement>(".hero-forge__content");
      const heightValue = `${totalHeight}px`;

      document.documentElement.style.setProperty("--hero-grid-total-height", heightValue);
      document.documentElement.style.setProperty("--hero-cell-size", `${cellSize}px`);

      if (hero) {
        if (isWideLayout) {
          hero.style.height = heightValue;
          hero.style.minHeight = heightValue;
        } else {
          hero.style.height = "auto";
          hero.style.minHeight = heightValue;
        }
      }
      if (gridWrap) {
        gridWrap.style.height = heightValue;
        gridWrap.style.minHeight = heightValue;
      }
      if (content && isWideLayout) {
        const gap = cellSize + 1;
        const contentLeft = 1 + whiteStartCol * gap + Math.round(gap * 0.85);
        const contentTop = GRID_TOP_OFFSET + 1 + whiteStartRow * gap + Math.round(gap * 0.85);
        content.style.left = `${contentLeft}px`;
        content.style.top = `${contentTop}px`;
      } else if (content) {
        content.style.left = "";
        content.style.top = "";
      }
    },
    [],
  );

  const layout = useMemo(() => {
    const breakpoint = getBreakpoint(width);
    const config = GRID_CONFIGS[breakpoint];
    const { cellSize } = config;
    const rows = VISIBLE_ROWS;
    const gap = cellSize + 1;
    const viewportCols = Math.max(1, Math.ceil((width - 1) / gap));
    const cols = viewportCols + GRID_BLEED_COLUMNS * 2;
    const gridOffsetX = GRID_BLEED_COLUMNS * gap;
    const bodyHeight = gridBodyHeight(cellSize, rows);
    const totalHeight = gridTotalHeight(cellSize, rows);
    const cells: GridCell[] = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cells.push({
          key: `${row}-${col}`,
          white: isWhiteCell(col, row, cols, config),
        });
      }
    }

    return {
      cellSize,
      cols,
      rows,
      bodyHeight,
      totalHeight,
      gridOffsetX,
      whiteStartCol: config.whiteCells.startCol,
      whiteStartRow: config.whiteCells.startRow,
      isWideLayout: width >= 768,
      cells,
    };
  }, [width]);

  useLayoutEffect(() => {
    applyHeroHeight(
      layout.totalHeight,
      layout.cellSize,
      layout.whiteStartCol,
      layout.whiteStartRow,
      layout.isWideLayout,
    );
  }, [
    applyHeroHeight,
    layout.cellSize,
    layout.isWideLayout,
    layout.totalHeight,
    layout.whiteStartCol,
    layout.whiteStartRow,
  ]);

  return (
    <>
      <div className="hero-forge__gradient" aria-hidden="true" />
      <div
        className="hero-forge__grid"
        style={{
          left: `-${layout.gridOffsetX}px`,
          gridTemplateColumns: `repeat(${layout.cols}, ${layout.cellSize}px)`,
          gridTemplateRows: `repeat(${layout.rows}, ${layout.cellSize}px)`,
          height: `${layout.bodyHeight}px`,
          maxHeight: `${layout.bodyHeight}px`,
        }}
      >
        {layout.cells.map((cell) => (
          <div
            key={cell.key}
            className={`hero-grid-cell ${cell.white ? "hero-grid-cell--white" : "hero-grid-cell--color"}`}
            style={{
              width: `${layout.cellSize}px`,
              height: `${layout.cellSize}px`,
            }}
          />
        ))}
      </div>
    </>
  );
}
