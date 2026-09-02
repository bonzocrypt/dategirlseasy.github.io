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
  ["reviews-hub-desktop.png", "/reviews/", 1440, 1000],
  ["reviews-hub-mobile.png", "/reviews/", 390, 844],
  ["getting-dates-category-desktop.png", "/ebooks/dates-and-escalation/", 1440, 1000],
  ["getting-dates-category-mobile.png", "/ebooks/dates-and-escalation/", 390, 844],
  ["bio-guide-reader-desktop.png", "/guides/bio-templates.html", 1440, 1000],
  ["bio-guide-reader-mobile.png", "/guides/bio-templates.html", 390, 844],
  ["profile-photo-fotor-desktop.png", "/guides/profile-photo-checklist.html", 1440, 1000],
  ["profile-photo-fotor-mobile.png", "/guides/profile-photo-checklist.html", 390, 844],
  ["body-language-reader-desktop.png", "/ebooks/body-language/body-language-clues-that-show-interest.html", 1440, 1000],
  ["body-language-reader-mobile.png", "/ebooks/body-language/body-language-clues-that-show-interest.html", 390, 844],
  ["first-move-guide-desktop.png", "/guides/when-to-make-the-first-move.html", 1440, 1000],
  ["first-move-guide-mobile.png", "/guides/when-to-make-the-first-move.html", 390, 844],
  ["pleasure-guide-desktop.png", "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html", 1440, 1000],
  ["pleasure-guide-mobile.png", "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html", 390, 844],
  ["privacy-cj-desktop.png", "/privacy.html", 1440, 1000],
  ["privacy-cj-mobile.png", "/privacy.html", 390, 844],
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
const appReviewLinks = [
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
const expectedDatingAppLinks = [
  "/comparisons/",
  "/reviews/",
  ...appReviewLinks,
];
const expectedGuideLibraryLinks = [
  "/guides/",
  "/ebooks/",
  "/ebooks/profile-and-photos/",
  "/ebooks/messaging-and-openers/",
  "/ebooks/dates-and-escalation/",
  "/ebooks/mindset-and-confidence/",
  "/ebooks/body-language/",
  "/ebooks/kissing-and-intimacy/",
];
const expectedInDepthGuideLinks = [
  "/ebooks/profile-and-photos/internet-dating-guide-for-men.html",
  "/ebooks/messaging-and-openers/conversation-skills-that-build-attraction.html",
  "/ebooks/dates-and-escalation/from-match-to-date-without-pressure.html",
  "/ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html",
  "/ebooks/kissing-and-intimacy/kissing-with-confidence.html",
  "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html",
];
const expectedGuideLinks = [...expectedGuideLibraryLinks, ...expectedInDepthGuideLinks];
const guideReaderPaths = [
  "/guides/dating-app-reset-checklist.html",
  "/ebooks/profile-and-photos/internet-dating-guide-for-men.html",
  "/guides/profile-photo-checklist.html",
  "/guides/bio-templates.html",
  "/guides/openers-that-get-replies.html",
  "/ebooks/messaging-and-openers/conversation-skills-that-build-attraction.html",
  "/guides/texting-that-keeps-momentum.html",
  "/guides/dms-and-social-media.html",
  "/guides/voice-notes-and-dm-etiquette.html",
  "/guides/video-calls-before-meeting.html",
  "/ebooks/dates-and-escalation/from-match-to-date-without-pressure.html",
  "/playbooks/first-date-playbook.html",
  "/ebooks/mindset-and-confidence/dating-confidence-for-shy-men.html",
  "/ebooks/body-language/using-body-language-to-look-more-confident.html",
  "/ebooks/body-language/reading-body-language-on-dates-and-app-meets.html",
  "/ebooks/body-language/body-language-clues-that-show-interest.html",
  "/ebooks/body-language/signals-and-subtext-in-dating.html",
  "/ebooks/kissing-and-intimacy/kissing-with-confidence.html",
  "/guides/when-to-make-the-first-move.html",
  "/ebooks/kissing-and-intimacy/how-to-pleasure-a-woman.html",
];

(async () => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const createContext = browser.newContext.bind(browser);
  browser.newContext = async function (options) {
    const context = await createContext(options);
    await context.addInitScript(() => {
      localStorage.setItem("dge-consent-v1", JSON.stringify({ version: 1, analytics: false, affiliate: false, updatedAt: "qa" }));
    });
    return context;
  };
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
          comparisonClipping: [...document.querySelectorAll(".comparison-dashboard > *:not([hidden])")]
            .map((element) => ({ element, rect: element.getBoundingClientRect() }))
            .filter(({ rect }) => rect.left < -1 || rect.right > window.innerWidth + 1)
            .map(({ element, rect }) => ({
              element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}`,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            })),
        };
      });
      if (!response || !response.ok()) errors.push(`${pathname} @ ${width}px returned ${response ? response.status() : "no response"}`);
      if (measurement.overflow) errors.push(`${pathname} @ ${width}px overflows: ${JSON.stringify(measurement)}`);
      if (measurement.comparisonClipping.length) errors.push(`${pathname} @ ${width}px clips comparison content: ${JSON.stringify(measurement.comparisonClipping)}`);
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
  if (/Beyond apps|Consider Matchmaking|Tawkify/i.test(await desktopNavPage.locator("#nav-dating-apps").innerText())) {
    errors.push("Retired matchmaking promotion remains in the desktop Dating Apps dropdown");
  }
  await desktopNavPage.screenshot({ path: path.join(outputDirectory, "homepage-desktop-dating-apps-menu.png"), fullPage: false });
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
  const desktopGuideLinks = await desktopNavPage.locator("#nav-guides a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  if (JSON.stringify(desktopGuideLinks) !== JSON.stringify(expectedGuideLinks)) {
    errors.push(`Desktop Guide links are missing or out of order: ${JSON.stringify(desktopGuideLinks)}`);
  }
  if ((await desktopNavPage.locator("#nav-guides").innerText()).includes("All Dating Guides")) errors.push("Retired All Dating Guides label remains in desktop navigation");
  const libraryGuidePanel = desktopNavPage.locator('[data-guide-menu-panel="library"]');
  const inDepthGuidePanel = desktopNavPage.locator('[data-guide-menu-panel="in-depth"]');
  const libraryGuidePath = desktopNavPage.locator('[data-guide-menu-view="library"]');
  const inDepthGuidePath = desktopNavPage.locator('[data-guide-menu-view="in-depth"]');
  if (!(await libraryGuidePanel.isVisible()) || !(await inDepthGuidePanel.isHidden())) errors.push("Desktop Guides menu does not begin with the Guide Library panel");
  await inDepthGuidePath.hover();
  if (!(await inDepthGuidePanel.isVisible()) || !(await libraryGuidePanel.isHidden())) errors.push("Hovering In-Depth Guides does not reveal its guide links");
  const visibleInDepthLinks = await inDepthGuidePanel.locator("a:visible").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  if (JSON.stringify(visibleInDepthLinks) !== JSON.stringify(expectedInDepthGuideLinks)) errors.push("In-Depth Guides preview links are missing or out of order");
  await libraryGuidePath.focus();
  if (!(await libraryGuidePanel.isVisible()) || !(await inDepthGuidePanel.isHidden())) errors.push("Keyboard focus on Guide Library does not restore its goal links");
  await desktopNavPage.screenshot({ path: path.join(outputDirectory, "homepage-desktop-guides-menu.png"), fullPage: false });
  await desktopNavPage.mouse.move(10, 400);
  await inDepthGuidePath.hover();
  await desktopNavPage.screenshot({ path: path.join(outputDirectory, "homepage-desktop-guides-in-depth-menu.png"), fullPage: false });
  await desktopNavPage.locator("main").click({ position: { x: 5, y: 5 } });
  if ((await guidesTriggerDesktop.getAttribute("aria-expanded")) !== "false") errors.push("Clicking outside does not close the desktop dropdown");
  await desktopNavContext.close();

  const themeContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const themePage = await themeContext.newPage();
  await themePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const desktopThemeToggle = themePage.locator(".theme-toggle-desktop");
  const mobileThemeToggle = themePage.locator(".theme-toggle-mobile");
  if (!(await desktopThemeToggle.isVisible()) || (await mobileThemeToggle.isVisible())) errors.push("Desktop theme control visibility is incorrect");
  if ((await desktopThemeToggle.getAttribute("aria-label")) !== "Switch to dark theme") errors.push("Default theme control label is incorrect");
  const lightState = await themePage.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    stored: localStorage.getItem("dge-theme"),
    background: getComputedStyle(document.body).backgroundColor,
    labels: [...document.querySelectorAll("[data-theme-toggle]")].map((button) => button.getAttribute("aria-label")),
  }));
  if (lightState.theme !== "light" || lightState.stored !== null || lightState.background !== "rgb(255, 255, 255)" || lightState.labels.some((label) => label !== "Switch to dark theme")) {
    errors.push(`Default light theme failed: ${JSON.stringify(lightState)}`);
  }
  await themePage.screenshot({ path: path.join(outputDirectory, "homepage-light-theme-desktop.png"), fullPage: false });
  await themePage.goto(`${baseUrl}/guides/`, { waitUntil: "domcontentloaded" });
  if ((await themePage.evaluate(() => document.documentElement.dataset.theme)) !== "light") errors.push("Light theme did not persist across navigation");
  await themePage.screenshot({ path: path.join(outputDirectory, "guides-light-theme-desktop.png"), fullPage: false });
  await themePage.goto(`${baseUrl}/comparisons/`, { waitUntil: "domcontentloaded" });
  await themePage.screenshot({ path: path.join(outputDirectory, "comparisons-light-theme-desktop.png"), fullPage: false });
  await themePage.goto(`${baseUrl}/about.html`, { waitUntil: "domcontentloaded" });
  await themePage.screenshot({ path: path.join(outputDirectory, "about-light-theme-desktop.png"), fullPage: false });
  await themePage.locator(".theme-toggle-desktop").press("Enter");
  if ((await themePage.evaluate(() => `${document.documentElement.dataset.theme}:${localStorage.getItem("dge-theme")}`)) !== "dark:dark") errors.push("Keyboard theme toggle did not restore and persist dark mode");
  await themePage.goto(`${baseUrl}/guides/`, { waitUntil: "domcontentloaded" });
  if ((await themePage.evaluate(() => document.documentElement.dataset.theme)) !== "dark") errors.push("Saved dark theme did not persist across navigation");
  await themeContext.close();

  const mobileThemeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileThemePage = await mobileThemeContext.newPage();
  await mobileThemePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  if (!(await mobileThemePage.locator(".theme-toggle-mobile").isVisible()) || (await mobileThemePage.locator(".theme-toggle-desktop").isVisible())) errors.push("Mobile theme control visibility is incorrect");
  await mobileThemePage.locator("[data-menu-toggle]").click();
  const mobileLightLayout = await mobileThemePage.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    headerControlsWithinViewport: [...document.querySelectorAll(".mobile-header-controls button")].every((button) => {
      const rect = button.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth;
    }),
  }));
  if (mobileLightLayout.theme !== "light" || mobileLightLayout.overflow || !mobileLightLayout.headerControlsWithinViewport) errors.push(`Mobile light theme layout failed: ${JSON.stringify(mobileLightLayout)}`);
  await mobileThemePage.screenshot({ path: path.join(outputDirectory, "homepage-light-theme-mobile-navigation.png"), fullPage: false });
  await mobileThemeContext.close();

  for (const width of [1024, 1440]) {
    const menuFitContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const menuFitPage = await menuFitContext.newPage();
    await menuFitPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    for (const label of ["Dating Apps", "Guides"]) {
      const trigger = menuFitPage.locator("[data-nav-trigger]").filter({ hasText: label });
      await trigger.click();
      const menuId = label === "Dating Apps" ? "#nav-dating-apps" : "#nav-guides";
      const fit = await menuFitPage.locator(menuId).evaluate((menu) => {
        const rect = menu.getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          visibleLinks: [...menu.querySelectorAll("a")].filter((link) => {
            const linkRect = link.getBoundingClientRect();
            return linkRect.width > 0 && linkRect.height > 0;
          }).length,
        };
      });
      if (fit.left < 0 || fit.right > width || fit.top < 0 || fit.bottom > 900 || fit.visibleLinks === 0) {
        errors.push(`${label} desktop menu does not fit at ${width}px: ${JSON.stringify(fit)}`);
      }
      await trigger.click();
    }
    await menuFitContext.close();
  }

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
  await nestedMobilePage.screenshot({ path: path.join(outputDirectory, "homepage-mobile-dating-apps-menu.png"), fullPage: false });
  await mobileAppsTrigger.click();
  await mobileGuidesTrigger.click();
  if ((await mobileGuidesTrigger.getAttribute("aria-expanded")) !== "true" || (await nestedMobilePage.locator("#nav-guides").getAttribute("data-open")) !== "true") {
    errors.push("Mobile Guides section does not expand on touch/click");
  }
  const mobileGuideLinks = await nestedMobilePage.locator("#nav-guides a:visible").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  if (JSON.stringify(mobileGuideLinks) !== JSON.stringify(expectedGuideLibraryLinks)) {
    errors.push(`Mobile Guide links are missing or out of order: ${JSON.stringify(mobileGuideLinks)}`);
  }
  const lastMobileGuideLink = nestedMobilePage.locator("#nav-guides a:visible").last();
  await lastMobileGuideLink.scrollIntoViewIfNeeded();
  if (!(await lastMobileGuideLink.isVisible())) errors.push("The final Guide topic is not reachable in the mobile menu");
  await nestedMobilePage.keyboard.press("Escape");
  if ((await mobileGuidesTrigger.getAttribute("aria-expanded")) !== "false") errors.push("First mobile Escape does not close the nested section");
  if (!(await mobileGuidesTrigger.evaluate((node) => document.activeElement === node))) errors.push("Nested mobile focus does not return to its trigger");
  await nestedMobilePage.keyboard.press("Escape");
  if ((await mobileMenuTrigger.getAttribute("aria-expanded")) !== "false") errors.push("Second mobile Escape does not close the main menu");
  await nestedMobileContext.close();

  for (const width of [390, 1440]) {
    const guideContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const guidePage = await guideContext.newPage();
    await guidePage.goto(`${baseUrl}/guides/`, { waitUntil: "domcontentloaded" });
    const items = guidePage.locator("[data-guide-item]");
    if ((await guidePage.locator(".adult-guide-grid > a").count()) !== 3) errors.push(`Guide Library lacks the relocated adult-only guide section at ${width}px`);
    if ((await items.count()) !== 21) errors.push(`Guide Library exposes ${(await items.count())} entries at ${width}px instead of 21`);
    await guidePage.locator('[data-guide-filter="topic"][data-guide-value="messaging"]').click();
    if ((await guidePage.locator("[data-guide-item]:visible").count()) !== 5) errors.push(`Messaging filter failed at ${width}px`);
    await guidePage.locator('[data-guide-filter="format"][data-guide-value="in-depth"]').click();
    if ((await guidePage.locator("[data-guide-item]:visible").count()) !== 1) errors.push(`Combined Guide filters failed at ${width}px`);
    await guidePage.locator("[data-guide-clear]").click();
    if ((await guidePage.locator("[data-guide-item]:visible").count()) !== 21) errors.push(`Clearing Guide filters failed at ${width}px`);
    if (new URL(guidePage.url()).search) errors.push(`Clearing Guide filters left query parameters at ${width}px`);
    await guidePage.locator('[data-guide-filter="topic"][data-guide-value="intimacy"]').click();
    if ((await guidePage.locator("[data-guide-item]:visible").count()) !== 3) errors.push(`Kissing & Intimacy filter failed at ${width}px`);
    await guidePage.locator("[data-guide-clear]").click();
    await guidePage.goto(`${baseUrl}/guides/?format=checklist`, { waitUntil: "domcontentloaded" });
    if ((await guidePage.locator("[data-guide-item]:visible").count()) !== 2) errors.push(`Bookmarkable checklist filter failed at ${width}px`);
    await guideContext.close();
  }

  for (const width of [390, 1440]) {
    const readerContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const readerPage = await readerContext.newPage();
    for (const pathname of guideReaderPaths) {
      await readerPage.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
      const contract = await readerPage.evaluate(() => {
        const reader = document.querySelector("[data-guide-reader]");
        const contents = reader?.querySelector(".reader-toc, .reader-jump-nav");
        const links = contents ? [...contents.querySelectorAll('a[href^="#"]')] : [];
        const firstLink = links[0];
        firstLink?.focus();
        const focusStyle = firstLink ? getComputedStyle(firstLink) : null;
        return {
          reader: Boolean(reader),
          breadcrumb: Boolean(reader?.querySelector('[aria-label="Breadcrumb"] a[href="/guides/"]')),
          contents: Boolean(contents),
          contentLinks: links.length,
          missingTargets: links.filter((link) => !document.getElementById(link.getAttribute("href").slice(1))).length,
          continuationLinks: reader?.querySelectorAll(".reader-next-grid a").length || 0,
          focusVisible: Boolean(firstLink && document.activeElement === firstLink && focusStyle && focusStyle.outlineStyle !== "none" && Number.parseFloat(focusStyle.outlineWidth) >= 3),
        };
      });
      if (!contract.reader || !contract.breadcrumb || !contract.contents || contract.contentLinks < 5 || contract.missingTargets || contract.continuationLinks !== 3 || !contract.focusVisible) {
        errors.push(`Guide reading contract failed on ${pathname} at ${width}px: ${JSON.stringify(contract)}`);
      }
    }
    await readerContext.close();
  }

  const fotorPaths = [
    "/guides/profile-photo-checklist.html",
    "/guides/dating-app-reset-checklist.html",
  ];
  for (const width of [390, 1440]) {
    const fotorContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const fotorPage = await fotorContext.newPage();
    for (const pathname of fotorPaths) {
      await fotorPage.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
      const link = fotorPage.locator('[data-affiliate-program="fotor"]');
      const contract = await fotorPage.evaluate(() => {
        const affiliateLink = document.querySelector('[data-affiliate-program="fotor"]');
        const card = affiliateLink?.closest(".affiliate-tool-card");
        const disclosure = card?.querySelector(".affiliate-disclosure");
        return {
          links: document.querySelectorAll('[data-affiliate-program="fotor"]').length,
          href: affiliateLink?.getAttribute("href") || "",
          target: affiliateLink?.getAttribute("target") || "",
          rel: affiliateLink?.getAttribute("rel") || "",
          disclosureBeforeLink: Boolean(disclosure && affiliateLink && (disclosure.compareDocumentPosition(affiliateLink) & Node.DOCUMENT_POSITION_FOLLOWING)),
          cardVisible: Boolean(card && card.getBoundingClientRect().width > 0 && card.getBoundingClientRect().height > 0),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      const relTokens = new Set(contract.rel.split(/\s+/));
      if (contract.links !== 1 || contract.href !== "https://www.fotor.com/?ref=dan" || contract.target !== "_blank" || !["sponsored", "nofollow", "noopener"].every((token) => relTokens.has(token)) || relTokens.has("noreferrer") || !contract.disclosureBeforeLink || !contract.cardVisible || contract.overflow || !(await link.isVisible())) {
        errors.push(`Fotor placement contract failed on ${pathname} at ${width}px: ${JSON.stringify(contract)}`);
      }
    }
    await fotorContext.close();
  }

  for (const width of [390, 1440]) {
    const reviewContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const reviewPage = await reviewContext.newPage();
    await reviewPage.goto(`${baseUrl}/reviews/`, { waitUntil: "domcontentloaded" });
    const reviewState = await reviewPage.evaluate(() => ({
      reviewHrefs: [...document.querySelectorAll(".review-card-grid > .card > a")].map((link) => link.getAttribute("href")),
      heroHasTinderPriority: document.querySelector(".review-hub-hero")?.textContent.includes("Tinder") || false,
      comparisonRoutes: document.querySelectorAll('main a[href="/comparisons/"]').length,
      directoryTarget: Boolean(document.getElementById("review-directory")),
      retiredLinks: document.querySelectorAll('a[href*="tawkify" i]').length,
      retiredPromotion: Boolean(document.querySelector(".matchmaking-alternative")),
    }));
    const expectedReviewHrefs = appReviewLinks;
    if (JSON.stringify(reviewState.reviewHrefs) !== JSON.stringify(expectedReviewHrefs)) errors.push(`Review hub cards are missing or out of order at ${width}px: ${JSON.stringify(reviewState.reviewHrefs)}`);
    if (reviewState.heroHasTinderPriority || reviewState.comparisonRoutes < 2 || !reviewState.directoryTarget || reviewState.retiredLinks || reviewState.retiredPromotion) errors.push(`Review hub decision hierarchy failed at ${width}px: ${JSON.stringify(reviewState)}`);
    const retiredResponse = await reviewPage.goto(`${baseUrl}/reviews/tawkify.html`, { waitUntil: "domcontentloaded" });
    if (!retiredResponse || retiredResponse.status() !== 404) errors.push(`Retired Tawkify URL returned ${retiredResponse?.status()} locally at ${width}px instead of 404`);
    await reviewContext.close();
  }

  for (const width of [390, 1440]) {
    const compareContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const comparePage = await compareContext.newPage();
    await comparePage.goto(`${baseUrl}/comparisons/`, { waitUntil: "domcontentloaded" });
    const choices = comparePage.locator("[data-compare-app]");
    if ((await choices.count()) !== 10) errors.push(`Comparison tool exposes ${(await choices.count())} apps at ${width}px instead of 10`);
    if (width === 390) {
      const mobileOverview = await comparePage.evaluate(() => {
        const wrapper = document.querySelector(".compare-overview-wrap");
        const rows = [...document.querySelectorAll("[data-compare-row]")];
        return {
          wrapperScrolls: wrapper ? wrapper.scrollWidth > wrapper.clientWidth + 1 : true,
          clippedRows: rows.filter((row) => row.getBoundingClientRect().right > window.innerWidth + 1).length,
        };
      });
      if (mobileOverview.wrapperScrolls || mobileOverview.clippedRows) errors.push(`Mobile overview still scrolls horizontally or clips rows: ${JSON.stringify(mobileOverview)}`);
    }
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

  for (const width of [390, 1440]) {
    const homepageContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const homepage = await homepageContext.newPage();
    await homepage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    const homepageState = await homepage.evaluate(() => ({
      heroProof: Boolean(document.querySelector(".hero-proof")),
      adultGuideLinks: document.querySelectorAll(".adult-guide-grid > a").length,
      featuredLinks: document.querySelectorAll("[data-featured-link]").length,
      featuredHeading: document.querySelector("[data-featured-link]")?.closest("section")?.querySelector("h2")?.textContent || "",
    }));
    if (homepageState.heroProof || homepageState.adultGuideLinks !== 0 || homepageState.featuredLinks !== 3 || !homepageState.featuredHeading.includes("Three useful moves")) {
      errors.push(`Homepage discovery contract failed at ${width}px: ${JSON.stringify(homepageState)}`);
    }
    await homepage.evaluate(() => document.querySelectorAll("[data-featured-link]").forEach((link) => link.addEventListener("click", (event) => event.preventDefault())));
    await homepage.locator("[data-featured-link]").first().click();
    const trackedEvent = await homepage.evaluate(() => [...(window.dataLayer || [])].reverse().find((item) => item.event === "featured_content_click"));
    if (!trackedEvent || trackedEvent.featured_destination !== "/comparisons/" || trackedEvent.featured_position !== 1) {
      errors.push(`Homepage featured click event failed at ${width}px: ${JSON.stringify(trackedEvent)}`);
    }
    await homepageContext.close();
  }

  for (const width of [390, 1440]) {
    const privacyContext = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const privacyPage = await privacyContext.newPage();
    await privacyPage.goto(`${baseUrl}/privacy.html`, { waitUntil: "domcontentloaded" });
    const privacyState = await privacyPage.evaluate(() => ({
      cjSection: Boolean(document.getElementById("cj-affiliate-tracking")),
      choicesSection: Boolean(document.getElementById("privacy-choices")),
      consentSection: Boolean(document.getElementById("uk-eu-consent")),
      servicesNotice: document.querySelectorAll('a[href="https://www.cj.com/legal/privacy-policy-services"]').length,
      privacyChoices: document.querySelectorAll('a[href="https://www.cj.com/dsr"]').length,
      headings: document.querySelectorAll("main h2").length,
    }));
    if (!privacyState.cjSection || !privacyState.choicesSection || !privacyState.consentSection || privacyState.servicesNotice !== 1 || privacyState.privacyChoices !== 1 || privacyState.headings < 8) {
      errors.push(`CJ privacy-page contract failed at ${width}px: ${JSON.stringify(privacyState)}`);
    }
    await privacyContext.close();
  }

  for (const [filename, pathname, width, height] of screenshotPages) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(75);
    await page.screenshot({ path: path.join(outputDirectory, filename), fullPage: true });
    await context.close();
  }

  const mobileTableContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileTablePage = await mobileTableContext.newPage();
  await mobileTablePage.goto(`${baseUrl}/comparisons/`, { waitUntil: "domcontentloaded" });
  await mobileTablePage.locator("#all-apps-title").scrollIntoViewIfNeeded();
  await mobileTablePage.screenshot({ path: path.join(outputDirectory, "comparisons-mobile-table.png"), fullPage: false });
  await mobileTableContext.close();

  const mobileFocusedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobileFocusedPage = await mobileFocusedContext.newPage();
  await mobileFocusedPage.goto(`${baseUrl}/comparisons/`, { waitUntil: "domcontentloaded" });
  await mobileFocusedPage.locator('[data-compare-app][value="bumble"]').check();
  await mobileFocusedPage.locator('[data-compare-app][value="tinder"]').check();
  await mobileFocusedPage.locator("[data-compare-run]").click();
  await mobileFocusedPage.locator("[data-compare-results]").scrollIntoViewIfNeeded();
  await mobileFocusedPage.screenshot({ path: path.join(outputDirectory, "comparisons-mobile-focused.png"), fullPage: false });
  await mobileFocusedContext.close();

  await browser.close();
  console.log(JSON.stringify({ pagesChecked: representativePaths.length, widths, measurements: results.length, screenshots: screenshotPages.length + 3, errors }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
})();
