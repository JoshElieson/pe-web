import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.forge.ai/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: "tmp-forge-ai.png", fullPage: false });

const data = await page.evaluate(() => {
  const hero = document.querySelector("main section, main > div");
  const allDivs = [...document.querySelectorAll("div")].filter((el) => {
    const style = el.getAttribute("style") || "";
    return style.includes("gridTemplateRows") || style.includes("grid-template-rows");
  });
  return {
    gridDivs: allDivs.slice(0, 3).map((el) => ({
      style: el.getAttribute("style"),
      rect: el.getBoundingClientRect(),
      childCount: el.children.length,
    })),
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
