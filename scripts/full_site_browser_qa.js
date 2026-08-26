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
const baseUrl = "http://127.0.0.1:8008";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function urlFor(file) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -10)}`;
  return `/${relative}`;
}

function collectHtml(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

(async () => {
  const errors = [];
  const pages = collectHtml(root).map(urlFor).sort();
  const widths = [320, 375, 390, 768, 1024, 1440];
  const themes = ["dark", "light"];

  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: chromePath });
    for (const theme of themes) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript((selectedTheme) => {
        try { localStorage.setItem("dge-theme", selectedTheme); } catch (error) { /* no-op */ }
      }, theme);
      const page = await context.newPage();
      for (const pathname of pages) {
        const consoleErrors = [];
        const localFailures = [];
        const onConsole = (message) => {
          if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
            consoleErrors.push(message.text());
          }
        };
        const onPageError = (error) => consoleErrors.push(error.message);
        const onRequestFailed = (request) => {
          if (request.url().startsWith(baseUrl)) {
            localFailures.push(`${request.url()} (${request.failure()?.errorText || "failed"})`);
          }
        };
        const onResponse = (response) => {
          if (response.url().startsWith(baseUrl) && response.status() >= 400) {
            localFailures.push(`${response.url()} (HTTP ${response.status()})`);
          }
        };
        page.on("console", onConsole);
        page.on("pageerror", onPageError);
        page.on("requestfailed", onRequestFailed);
        page.on("response", onResponse);
        const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(75);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const button = document.querySelector("[data-menu-toggle]");
          const nav = document.querySelector("[data-primary-nav]");
          const footerMeta = document.querySelector(".footer-meta-v2");
          const footerRect = footerMeta?.getBoundingClientRect();
          const footerStyle = footerMeta ? getComputedStyle(footerMeta) : null;
          const footerLineHeight = footerStyle ? Number.parseFloat(footerStyle.lineHeight) : 0;
          const themeButtons = [...document.querySelectorAll("[data-theme-toggle]")];
          return {
            theme: doc.dataset.theme,
            bodyBackground: getComputedStyle(document.body).backgroundColor,
            themeButtons: themeButtons.map((themeButton) => ({
              visible: getComputedStyle(themeButton).display !== "none",
              label: themeButton.getAttribute("aria-label"),
            })),
            overflow: doc.scrollWidth > window.innerWidth + 1,
            scrollWidth: doc.scrollWidth,
            innerWidth: window.innerWidth,
            menuButtonVisible: button ? getComputedStyle(button).display !== "none" : false,
            menuCollapsed: button?.getAttribute("aria-expanded") === "false" && nav?.getAttribute("data-open") === "false",
            footerText: footerMeta?.textContent.trim() || "",
            footerWithinViewport: Boolean(footerRect && footerRect.left >= -1 && footerRect.right <= window.innerWidth + 1 && footerMeta.scrollWidth <= footerMeta.clientWidth + 1),
            footerWrappedOnMobile: window.innerWidth > 320 || Boolean(footerRect && footerLineHeight && footerRect.height > footerLineHeight * 1.5),
            navTriggers: [...document.querySelectorAll("[data-nav-trigger]")].map((trigger) => ({
              expanded: trigger.getAttribute("aria-expanded"),
              controls: trigger.getAttribute("aria-controls"),
              targetExists: Boolean(document.getElementById(trigger.getAttribute("aria-controls") || "")),
              isButton: trigger.tagName === "BUTTON",
            })),
            comparisonClipping: [...document.querySelectorAll(".comparison-dashboard > *:not([hidden])")]
              .map((element) => element.getBoundingClientRect())
              .some((rect) => rect.left < -1 || rect.right > window.innerWidth + 1),
            tableRegions: [...document.querySelectorAll(".comparison-table-wrap")].map((region) => {
              const visible = region.offsetParent !== null;
              region.focus();
              const style = getComputedStyle(region);
              return {
                visible,
                focusable: region.tabIndex === 0,
                label: region.getAttribute("aria-labelledby"),
                labelExists: Boolean(document.getElementById(region.getAttribute("aria-labelledby") || "")),
                containsTable: Boolean(region.querySelector("table")),
                receivesFocus: document.activeElement === region,
                visibleFocus: style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 3,
              };
            }),
          };
        });
        const location = `${pathname} @ ${width} (${theme})`;
        if (!response || !response.ok()) errors.push(`${location}: HTTP ${response ? response.status() : "none"}`);
        if (result.theme !== theme) errors.push(`${location}: selected theme did not apply`);
        if (result.themeButtons.length !== 2 || result.themeButtons.filter((item) => item.visible).length !== 1) errors.push(`${location}: responsive theme control visibility failed`);
        const expectedThemeLabel = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
        if (result.themeButtons.some((item) => item.label !== expectedThemeLabel)) errors.push(`${location}: theme control accessible label failed`);
        if (theme === "light" && result.bodyBackground !== "rgb(255, 255, 255)") errors.push(`${location}: light page background is not white (${result.bodyBackground})`);
        if (result.overflow) errors.push(`${location}: overflow ${result.scrollWidth}/${result.innerWidth}`);
        if (result.comparisonClipping) errors.push(`${location}: comparison dashboard content is clipped by the viewport`);
        if (width <= 768 && (!result.menuButtonVisible || !result.menuCollapsed)) errors.push(`${location}: mobile menu initial state failed`);
        if (result.footerText !== "© 2026 Date Girls Easy. A Vaulted Holdings LLC publication.") errors.push(`${location}: footer legal line is incorrect`);
        if (!result.footerWithinViewport || !result.footerWrappedOnMobile) errors.push(`${location}: footer legal line does not wrap cleanly`);
        if (result.navTriggers.length !== 2 || result.navTriggers.some((item) => item.expanded !== "false" || !item.controls || !item.targetExists || !item.isButton)) {
          errors.push(`${location}: shared dropdown navigation contract failed`);
        }
        for (const [regionIndex, region] of result.tableRegions.entries()) {
          if (!region.focusable || !region.label || !region.labelExists || !region.containsTable || (region.visible && (!region.receivesFocus || !region.visibleFocus))) {
            errors.push(`${location}: comparison table region ${regionIndex + 1} accessibility contract failed`);
          }
        }
        if (consoleErrors.length) errors.push(`${location}: console ${consoleErrors.join(" | ")}`);
        if (localFailures.length) errors.push(`${location}: local requests ${localFailures.join(" | ")}`);
        page.off("console", onConsole);
        page.off("pageerror", onPageError);
        page.off("requestfailed", onRequestFailed);
        page.off("response", onResponse);
      }
      await context.close();
    }
    }
    const report = { status: errors.length ? "failed" : "passed", pages: pages.length, widths, themes, combinations: pages.length * widths.length * themes.length, errors };
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = errors.length ? 1 : 0;
  } catch (error) {
    throw error;
  } finally {
    if (browser) await browser.close();
  }
})();
