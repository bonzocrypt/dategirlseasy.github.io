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

  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: chromePath });
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
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
          return {
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
        if (!response || !response.ok()) errors.push(`${pathname} @ ${width}: HTTP ${response ? response.status() : "none"}`);
        if (result.overflow) errors.push(`${pathname} @ ${width}: overflow ${result.scrollWidth}/${result.innerWidth}`);
        if (result.comparisonClipping) errors.push(`${pathname} @ ${width}: comparison dashboard content is clipped by the viewport`);
        if (width <= 768 && (!result.menuButtonVisible || !result.menuCollapsed)) errors.push(`${pathname} @ ${width}: mobile menu initial state failed`);
        if (result.footerText !== "© 2026 Date Girls Easy. A Vaulted Holdings LLC publication.") errors.push(`${pathname} @ ${width}: footer legal line is incorrect`);
        if (!result.footerWithinViewport || !result.footerWrappedOnMobile) errors.push(`${pathname} @ ${width}: footer legal line does not wrap cleanly`);
        if (result.navTriggers.length !== 2 || result.navTriggers.some((item) => item.expanded !== "false" || !item.controls || !item.targetExists || !item.isButton)) {
          errors.push(`${pathname} @ ${width}: shared dropdown navigation contract failed`);
        }
        for (const [regionIndex, region] of result.tableRegions.entries()) {
          if (!region.focusable || !region.label || !region.labelExists || !region.containsTable || (region.visible && (!region.receivesFocus || !region.visibleFocus))) {
            errors.push(`${pathname} @ ${width}: comparison table region ${regionIndex + 1} accessibility contract failed`);
          }
        }
        if (consoleErrors.length) errors.push(`${pathname} @ ${width}: console ${consoleErrors.join(" | ")}`);
        if (localFailures.length) errors.push(`${pathname} @ ${width}: local requests ${localFailures.join(" | ")}`);
        page.off("console", onConsole);
        page.off("pageerror", onPageError);
        page.off("requestfailed", onRequestFailed);
        page.off("response", onResponse);
      }
      await context.close();
    }
    const report = { status: errors.length ? "failed" : "passed", pages: pages.length, widths, combinations: pages.length * widths.length, errors };
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = errors.length ? 1 : 0;
  } catch (error) {
    throw error;
  } finally {
    if (browser) await browser.close();
  }
})();
