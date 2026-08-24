const fs = require("node:fs");
const path = require("node:path");
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require("playwright-core");
}
const { chromium } = playwright;

const root = path.resolve(__dirname, "..");
const outputDirectory = process.env.DGE_QA_SCREENSHOTS || path.join(root, "project-evidence", "screenshots", "after");
const baseUrl = "http://127.0.0.1:8008";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const screenshotPages = [
  ["homepage-desktop.png", "/", 1440, 1000],
  ["homepage-mobile.png", "/", 390, 844],
  ["start-here-desktop.png", "/join.html", 1440, 1000],
  ["start-here-mobile.png", "/join.html", 390, 844],
  ["guides-hub-desktop.png", "/guides/", 1440, 1000],
  ["guides-hub-mobile.png", "/guides/", 390, 844],
  ["guide-library-desktop.png", "/ebooks/", 1440, 1000],
  ["guide-library-mobile.png", "/ebooks/", 390, 844],
];

const representativePaths = [...new Set(screenshotPages.filter((item) => item[1] !== "/404.html").map((item) => item[1]))];
const widths = [320, 375, 390, 768, 1024, 1440];

(async () => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const errors = [];
  const results = [];

  for (const pathname of representativePaths) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(75);
      const measurement = await page.evaluate(() => {
        const doc = document.documentElement;
        const offenders = [...document.querySelectorAll("body *")]
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1))
          .slice(0, 5)
          .map(({ element, rect }) => ({
            element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          }));
        return {
          innerWidth: window.innerWidth,
          scrollWidth: doc.scrollWidth,
          overflow: doc.scrollWidth > window.innerWidth + 1,
          offenders,
        };
      });
      if (!response || !response.ok()) errors.push(`${pathname} @ ${width}px returned ${response ? response.status() : "no response"}`);
      if (measurement.overflow) errors.push(`${pathname} @ ${width}px overflows: ${JSON.stringify(measurement)}`);
      if (consoleErrors.length) errors.push(`${pathname} @ ${width}px console: ${consoleErrors.join(" | ")}`);
      results.push({ pathname, width, ...measurement, consoleErrors: consoleErrors.length });
      await context.close();
    }
  }

  const menuContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const menuPage = await menuContext.newPage();
  await menuPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await menuPage.waitForTimeout(75);
  const button = menuPage.locator("[data-menu-toggle]");
  const nav = menuPage.locator("[data-primary-nav]");
  if (!(await button.isVisible())) errors.push("Mobile menu button is not visible at 390px");
  if ((await button.getAttribute("aria-expanded")) !== "false") errors.push("Mobile menu does not begin collapsed");
  await button.click();
  if ((await button.getAttribute("aria-expanded")) !== "true" || (await nav.getAttribute("data-open")) !== "true") {
    errors.push("Mobile menu does not expose the correct open state");
  }
  await menuPage.keyboard.press("Tab");
  const mobileFirstLink = menuPage.locator("[data-primary-nav] a").first();
  if (!(await mobileFirstLink.evaluate((node) => document.activeElement === node))) errors.push("Mobile menu Tab order does not begin with Start Here");
  await menuPage.screenshot({ path: path.join(outputDirectory, "homepage-mobile-navigation.png"), fullPage: false });
  await menuPage.keyboard.press("Escape");
  if ((await button.getAttribute("aria-expanded")) !== "false") errors.push("Escape does not close the mobile menu");
  const focused = await menuPage.evaluate(() => document.activeElement === document.querySelector("[data-menu-toggle]"));
  if (!focused) errors.push("Mobile menu focus does not return to the trigger after Escape");
  await menuContext.close();

  const desktopNavContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktopNavPage = await desktopNavContext.newPage();
  await desktopNavPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const appsTrigger = desktopNavPage.locator('[data-nav-trigger]').filter({ hasText: 'Dating Apps' });
  await appsTrigger.click();
  if ((await appsTrigger.getAttribute("aria-expanded")) !== "true") errors.push("Desktop Dating Apps dropdown does not open on click");
  const firstAppLink = desktopNavPage.locator("#nav-dating-apps a").first();
  await desktopNavPage.keyboard.press("Tab");
  if (!(await firstAppLink.evaluate((node) => document.activeElement === node))) errors.push("Desktop dropdown Tab order does not enter its first link");
  await desktopNavPage.keyboard.press("Shift+Tab");
  if (!(await appsTrigger.evaluate((node) => document.activeElement === node))) errors.push("Reverse Tab does not return to the dropdown trigger");
  await appsTrigger.press("ArrowDown");
  if (!(await firstAppLink.evaluate((node) => document.activeElement === node))) errors.push("ArrowDown does not focus the first dropdown link");
  await desktopNavPage.keyboard.press("Escape");
  if ((await appsTrigger.getAttribute("aria-expanded")) !== "false") errors.push("Escape does not close the desktop dropdown");
  if (!(await appsTrigger.evaluate((node) => document.activeElement === node))) errors.push("Desktop dropdown focus does not return to its trigger");
  const guidesTriggerDesktop = desktopNavPage.locator('[data-nav-trigger]').filter({ hasText: 'Guides' });
  await guidesTriggerDesktop.click();
  await desktopNavPage.locator("main").click({ position: { x: 5, y: 5 } });
  if ((await guidesTriggerDesktop.getAttribute("aria-expanded")) !== "false") errors.push("Clicking outside does not close the desktop dropdown");
  await desktopNavContext.close();

  const nestedMobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const nestedMobilePage = await nestedMobileContext.newPage();
  await nestedMobilePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const mobileMenuTrigger = nestedMobilePage.locator("[data-menu-toggle]");
  const mobileGuidesTrigger = nestedMobilePage.locator('[data-nav-trigger]').filter({ hasText: 'Guides' });
  await mobileMenuTrigger.click();
  await mobileGuidesTrigger.click();
  if ((await mobileGuidesTrigger.getAttribute("aria-expanded")) !== "true" || (await nestedMobilePage.locator("#nav-guides").getAttribute("data-open")) !== "true") {
    errors.push("Mobile Guides section does not expand on touch/click");
  }
  await nestedMobilePage.keyboard.press("Escape");
  if ((await mobileGuidesTrigger.getAttribute("aria-expanded")) !== "false") errors.push("First mobile Escape does not close the nested section");
  if (!(await mobileGuidesTrigger.evaluate((node) => document.activeElement === node))) errors.push("Nested mobile focus does not return to its trigger");
  await nestedMobilePage.keyboard.press("Escape");
  if ((await mobileMenuTrigger.getAttribute("aria-expanded")) !== "false") errors.push("Second mobile Escape does not close the main menu");
  await nestedMobileContext.close();

  const cardContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const cardPage = await cardContext.newPage();
  await cardPage.goto(`${baseUrl}/join.html`, { waitUntil: "domcontentloaded" });
  await cardPage.locator("a.goal-card").first().click({ position: { x: 180, y: 100 } });
  if (!cardPage.url().endsWith("/reviews/")) errors.push(`Whole goal-card click navigated to ${cardPage.url()}`);
  await cardContext.close();

  for (const [filename, pathname, width, height] of screenshotPages) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(75);
    await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify({ pagesChecked: representativePaths.length, widths, measurements: results.length, screenshots: screenshotPages.length + 1, errors }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
})();
