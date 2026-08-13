const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "project-evidence", "screenshots", "after");
const baseUrl = "http://127.0.0.1:8008";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const screenshotPages = [
  ["homepage-desktop.png", "/", 1440, 1000],
  ["homepage-mobile.png", "/", 390, 844],
  ["review-tinder-desktop.png", "/reviews/tinder.html", 1440, 1000],
  ["review-tinder-mobile.png", "/reviews/tinder.html", 390, 844],
  ["comparison-tinder-bumble-desktop.png", "/comparisons/tinder-vs-bumble.html", 1440, 1000],
  ["comparison-tinder-bumble-mobile.png", "/comparisons/tinder-vs-bumble.html", 390, 844],
  ["guide-openers-desktop.png", "/guides/openers-that-get-replies.html", 1440, 1000],
  ["guide-openers-mobile.png", "/guides/openers-that-get-replies.html", 390, 844],
  ["long-guide-internet-dating-desktop.png", "/ebooks/profile-and-photos/internet-dating-guide-for-men.html", 1440, 1000],
  ["long-guide-internet-dating-mobile.png", "/ebooks/profile-and-photos/internet-dating-guide-for-men.html", 390, 844],
  ["404-branded-desktop.png", "/404.html", 1440, 1000],
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
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));
      const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
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
  await menuPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const button = menuPage.locator("[data-menu-toggle]");
  const nav = menuPage.locator("[data-primary-nav]");
  if (!(await button.isVisible())) errors.push("Mobile menu button is not visible at 390px");
  if ((await button.getAttribute("aria-expanded")) !== "false") errors.push("Mobile menu does not begin collapsed");
  await button.click();
  if ((await button.getAttribute("aria-expanded")) !== "true" || (await nav.getAttribute("data-open")) !== "true") {
    errors.push("Mobile menu does not expose the correct open state");
  }
  await menuPage.screenshot({ path: path.join(outputDirectory, "homepage-mobile-navigation.png"), fullPage: false });
  await menuPage.keyboard.press("Escape");
  if ((await button.getAttribute("aria-expanded")) !== "false") errors.push("Escape does not close the mobile menu");
  const focused = await menuPage.evaluate(() => document.activeElement === document.querySelector("[data-menu-toggle]"));
  if (!focused) errors.push("Mobile menu focus does not return to the trigger after Escape");
  await menuContext.close();

  for (const [filename, pathname, width, height] of screenshotPages) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify({ pagesChecked: representativePaths.length, widths, measurements: results.length, screenshots: screenshotPages.length + 1, errors }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
})();
