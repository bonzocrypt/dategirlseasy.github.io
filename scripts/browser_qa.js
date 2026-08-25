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
  ["comparisons-desktop.png", "/comparisons/", 1440, 1000],
  ["comparisons-mobile.png", "/comparisons/", 390, 844],
  ["hinge-review-desktop.png", "/reviews/hinge.html", 1440, 1000],
  ["hinge-review-mobile.png", "/reviews/hinge.html", 390, 844],
  ["bumble-review-desktop.png", "/reviews/bumble.html", 1440, 1000],
  ["bumble-review-mobile.png", "/reviews/bumble.html", 390, 844],
  ["match-review-desktop.png", "/reviews/match.html", 1440, 1000],
  ["match-review-mobile.png", "/reviews/match.html", 390, 844],
  ["eharmony-review-desktop.png", "/reviews/eharmony.html", 1440, 1000],
  ["eharmony-review-mobile.png", "/reviews/eharmony.html", 390, 844],
  ["facebook-dating-review-desktop.png", "/reviews/facebook-dating.html", 1440, 1000],
  ["facebook-dating-review-mobile.png", "/reviews/facebook-dating.html", 390, 844],
  ["feeld-review-desktop.png", "/reviews/feeld.html", 1440, 1000],
  ["feeld-review-mobile.png", "/reviews/feeld.html", 390, 844],
  ["okcupid-review-desktop.png", "/reviews/okcupid.html", 1440, 1000],
  ["okcupid-review-mobile.png", "/reviews/okcupid.html", 390, 844],
  ["coffee-meets-bagel-review-desktop.png", "/reviews/coffee-meets-bagel.html", 1440, 1000],
  ["coffee-meets-bagel-review-mobile.png", "/reviews/coffee-meets-bagel.html", 390, 844],
  ["plenty-of-fish-review-desktop.png", "/reviews/plenty-of-fish.html", 1440, 1000],
  ["plenty-of-fish-review-mobile.png", "/reviews/plenty-of-fish.html", 390, 844],
];

const representativePaths = [...new Set(screenshotPages.filter((item) => item[1] !== "/404.html").map((item) => item[1]))];
const widths = [320, 375, 390, 768, 1024, 1440];
const expectedDatingAppLinks = [
  "/reviews/",
  "/comparisons/",
  "/reviews/bumble.html",
  "/reviews/coffee-meets-bagel.html",
  "/reviews/eharmony.html",
  "/reviews/facebook-dating.html",
  "/reviews/feeld.html",
  "/reviews/hinge.html",
  "/reviews/match.html",
  "/reviews/okcupid.html",
  "/reviews/plenty-of-fish.html",
  "/reviews/tinder.html",
];

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
  const desktopAppLinks = await desktopNavPage.locator("#nav-dating-apps a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  if (JSON.stringify(desktopAppLinks) !== JSON.stringify(expectedDatingAppLinks)) {
    errors.push(`Desktop Dating Apps links are missing or out of order: ${JSON.stringify(desktopAppLinks)}`);
  }
  if ((await desktopNavPage.locator("#nav-dating-apps").innerText()).includes("Tinder vs Bumble")) {
    errors.push("Tinder vs Bumble remains in the global Dating Apps dropdown");
  }
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
  const mobileAppsTrigger = nestedMobilePage.locator('[data-nav-trigger]').filter({ hasText: 'Dating Apps' });
  const mobileGuidesTrigger = nestedMobilePage.locator('[data-nav-trigger]').filter({ hasText: 'Guides' });
  await mobileMenuTrigger.click();
  await mobileAppsTrigger.click();
  const mobileAppLinks = await nestedMobilePage.locator("#nav-dating-apps a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  if (JSON.stringify(mobileAppLinks) !== JSON.stringify(expectedDatingAppLinks)) {
    errors.push(`Mobile Dating Apps links are missing or out of order: ${JSON.stringify(mobileAppLinks)}`);
  }
  const lastMobileAppLink = nestedMobilePage.locator("#nav-dating-apps a").last();
  await lastMobileAppLink.scrollIntoViewIfNeeded();
  if (!(await lastMobileAppLink.isVisible())) errors.push("The last alphabetical app review is not reachable in the mobile menu");
  await mobileAppsTrigger.click();
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

  for (const width of [390, 1440]) {
    const compareContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const comparePage = await compareContext.newPage();
    await comparePage.goto(`${baseUrl}/comparisons/`, { waitUntil: "domcontentloaded" });
    const choices = comparePage.locator("[data-compare-app]");
    if ((await choices.count()) !== 10) errors.push(`Comparison tool exposes ${(await choices.count())} apps at ${width}px instead of 10`);
    const runButton = comparePage.locator("[data-compare-run]");
    if (!(await runButton.isDisabled())) errors.push(`Compare button is enabled before two choices at ${width}px`);
    await comparePage.locator('[data-compare-app][value="tinder"]').check();
    await comparePage.locator('[data-compare-app][value="bumble"]').check();
    if (await runButton.isDisabled()) errors.push(`Compare button remains disabled with two choices at ${width}px`);
    await runButton.click();
    const results = comparePage.locator("[data-compare-results]");
    if (!(await results.isVisible())) errors.push(`Comparison results remain hidden at ${width}px`);
    const visibleColumns = await results.locator("[data-compare-column]").evaluateAll((nodes) => [
      ...new Set(nodes.filter((node) => node.offsetParent !== null).map((node) => node.getAttribute("data-compare-column"))),
    ].sort());
    if (JSON.stringify(visibleColumns) !== JSON.stringify(["bumble", "tinder"])) {
      errors.push(`Focused comparison shows the wrong columns at ${width}px: ${JSON.stringify(visibleColumns)}`);
    }
    const focusedHeading = await comparePage.locator("#focused-comparison-title").innerText();
    if (!focusedHeading.includes("Bumble") || !focusedHeading.includes("Tinder")) errors.push(`Focused heading omits selected apps at ${width}px`);
    const savedApps = new URL(comparePage.url()).searchParams.get("apps")?.split(",").sort() || [];
    if (JSON.stringify(savedApps) !== JSON.stringify(["bumble", "tinder"])) errors.push(`Comparison URL does not preserve choices at ${width}px: ${comparePage.url()}`);
    await comparePage.locator('[data-compare-app][value="hinge"]').check();
    if (!(await comparePage.locator('[data-compare-app][value="match"]').isDisabled())) errors.push(`A fourth app remains selectable at ${width}px`);
    await comparePage.locator("[data-compare-clear]").click();
    if (await results.isVisible()) errors.push(`Clear does not hide comparison results at ${width}px`);
    if (comparePage.url().includes("apps=")) errors.push(`Clear does not remove comparison query at ${width}px`);
    await comparePage.goto(`${baseUrl}/comparisons/?apps=tinder,bumble,hinge`, { waitUntil: "domcontentloaded" });
    if (!(await comparePage.locator("[data-compare-results]").isVisible())) errors.push(`URL-restored comparison is hidden at ${width}px`);
    const restoredCount = await comparePage.locator("[data-compare-app]:checked").count();
    if (restoredCount !== 3) errors.push(`URL-restored comparison selected ${restoredCount} apps at ${width}px instead of 3`);
    await compareContext.close();
  }

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
    const useViewportCapture = pathname === "/comparisons/" && width === 390;
    await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: !useViewportCapture });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify({ pagesChecked: representativePaths.length, widths, measurements: results.length, screenshots: screenshotPages.length + 1, errors }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
})();
