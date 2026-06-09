import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://www.forge.ai/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

const forge = await page.evaluate(() => {
  const section = [...document.querySelectorAll("section")].find((el) =>
    el.className.includes("overflow-hidden"),
  );
  const grid = [...document.querySelectorAll("div")].find((el) => {
    const style = el.getAttribute("style") || "";
    return style.includes("grid-template-rows: repeat(30, 60px)");
  });
  const sectionRect = section?.getBoundingClientRect();
  const sectionStyle = section ? getComputedStyle(section) : null;
  const logos = [...document.querySelectorAll("p, div")].find((el) =>
    el.textContent?.includes("SECURES THE AGENTS"),
  );
  return {
    section: section
      ? {
          height: sectionRect?.height,
          paddingTop: sectionStyle?.paddingTop,
          overflow: sectionStyle?.overflow,
          bottom: sectionRect?.bottom,
        }
      : null,
    gridTop: grid?.getBoundingClientRect().top,
    logosTop: logos?.getBoundingClientRect().top,
  };
});

await page.goto("http://localhost:5175/", { waitUntil: "networkidle" });
await page.waitForSelector(".hero-forge__grid");

const ours = await page.evaluate(() => {
  const hero = document.querySelector(".hero-forge");
  const grid = document.querySelector(".hero-forge__grid");
  const logos = document.querySelector(".hero-logos");
  const heroRect = hero.getBoundingClientRect();
  return {
    hero: { height: heroRect.height, bottom: heroRect.bottom },
    gridTop: grid.getBoundingClientRect().top,
    logosTop: logos.getBoundingClientRect().top,
  };
});

console.log(JSON.stringify({ forge, ours }, null, 2));
await browser.close();
