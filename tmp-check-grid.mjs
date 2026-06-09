import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5175/", { waitUntil: "networkidle" });
await page.waitForSelector(".hero-forge__grid");
await page.waitForTimeout(300);

const data = await page.evaluate(() => {
  const hero = document.querySelector(".hero-forge");
  const grid = document.querySelector(".hero-forge__grid");
  const wrap = document.querySelector(".hero-forge__grid-wrap");
  const cols = parseInt(grid.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1] || "0", 10);
  const cells = [...grid.children];
  const rowKeys = new Set(cells.map((_, i) => Math.floor(i / cols)));
  const heroRect = hero.getBoundingClientRect();
  const gridRect = grid.getBoundingClientRect();
  const lastRowCells = cells.filter((_, i) => Math.floor(i / cols) === rowKeys.size - 1);
  const lastRowRect = lastRowCells[0]?.getBoundingClientRect();

  return {
    heroInlineHeight: hero.style.height,
    heroComputedHeight: getComputedStyle(hero).height,
    wrapComputedHeight: getComputedStyle(wrap).height,
    cssVar: getComputedStyle(hero).getPropertyValue("--hero-grid-total-height").trim(),
    cellCount: cells.length,
    cols,
    uniqueRows: rowKeys.size,
    gridTemplateRows: grid.style.gridTemplateRows,
    gridRect: { top: gridRect.top, bottom: gridRect.bottom, height: gridRect.height },
    heroRect: { top: heroRect.top, bottom: heroRect.bottom, height: heroRect.height },
    lastRowBottom: lastRowRect?.bottom,
    clippedPx: lastRowRect ? lastRowRect.bottom - heroRect.bottom : null,
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
