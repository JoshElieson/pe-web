import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.forge.ai/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

const data = await page.evaluate(() => {
  const grid = [...document.querySelectorAll("div")].find((el) => {
    const style = el.getAttribute("style") || "";
    return style.includes("grid-template-rows: repeat(30, 60px)");
  });
  if (!grid) return { error: "no grid" };

  let node = grid.parentElement;
  const chain = [];
  while (node && chain.length < 8) {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    chain.push({
      tag: node.tagName,
      className: node.className?.toString?.().slice(0, 100) || "",
      height: rect.height,
      overflow: style.overflow,
      styleHeight: node.getAttribute("style"),
    });
    node = node.parentElement;
  }

  const gridRect = grid.getBoundingClientRect();
  const col0Cells = [...grid.children].filter((_, i) => i % 24 === 0);
  const visibleCol0 = col0Cells.filter((cell) => {
    const r = cell.getBoundingClientRect();
    return r.bottom > 57 && r.top < 607;
  });

  return {
    gridRect: { top: gridRect.top, bottom: gridRect.bottom, height: gridRect.height },
    parentChain: chain,
    col0VisibleCount: visibleCol0.length,
    col0Total: col0Cells.length,
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
