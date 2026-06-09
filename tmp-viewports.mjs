import { chromium } from "playwright";

const browser = await chromium.launch();
const viewports = [320, 375, 520, 768, 1024, 1280, 1440];

for (const width of viewports) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto("http://localhost:5175/", { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-forge__grid");
  const data = await page.evaluate(() => {
    const hero = document.querySelector(".hero-forge");
    const grid = document.querySelector(".hero-forge__grid");
    const logos = document.querySelector(".hero-logos");
    const cols = parseInt(grid.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1] || "0", 10);
    const cells = [...grid.children];
    const rowCount = new Set(cells.map((_, i) => Math.floor(i / cols))).size;
    const heroRect = hero.getBoundingClientRect();
    const logosRect = logos.getBoundingClientRect();
    const lastRowCell = cells[cells.length - cols];
    const lastRowRect = lastRowCell?.getBoundingClientRect();
    return {
      rowCount,
      heroHeight: heroRect.height,
      gapToLogos: logosRect.top - heroRect.bottom,
      lastRowVisible: lastRowRect ? lastRowRect.bottom <= heroRect.bottom + 0.5 : null,
      clipped: lastRowRect ? lastRowRect.bottom - heroRect.bottom : null,
    };
  });
  console.log(width, data);
  await page.close();
}

await browser.close();
