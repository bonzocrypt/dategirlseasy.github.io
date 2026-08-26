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
const baseUrl = process.env.DGE_BASE_URL || "http://127.0.0.1:8008";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const widgetScript = "https://www.viator.com/orion/partner/widget.js";
const evidence = path.join(root, "project-evidence", "screenshots", "after");

function check(condition, message, errors) {
  if (!condition) errors.push(message);
}

async function mockWidget(page, requests) {
  page.on("request", (request) => {
    if (request.url().startsWith(widgetScript)) requests.push(request.url());
  });
  await page.route(widgetScript, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: 'document.querySelectorAll("[data-vi-widget-ref]").forEach(function(node){node.dataset.qaWidgetRendered="true";});'
    });
  });
}

(async () => {
  const errors = [];
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const widgetRequests = [];
    await mockWidget(page, widgetRequests);
    await page.goto(baseUrl + "/guides/date-ideas-near-you/", { waitUntil: "domcontentloaded" });

    await page.locator("[data-date-location]").fill("Chicago");
    await page.getByRole("button", { name: "Find date ideas" }).click();
    check(widgetRequests.length === 0, "Viator loaded before affiliate consent", errors);
    check(await page.locator("[data-viator-consent-gate]").isVisible(), "affiliate consent gate did not appear", errors);
    check((await page.locator("[data-date-ideas-status]").innerText()).includes("Chicago"), "destination status omitted the requested city", errors);
    await page.screenshot({ path: path.join(evidence, "date-ideas-consent-gate-desktop.png"), fullPage: false });

    await page.getByRole("button", { name: "Review privacy choices" }).click();
    await page.locator('[data-consent-category="affiliate"]').check();
    await page.getByRole("button", { name: "Save choices" }).click();
    await page.waitForSelector('[data-vi-widget-ref][data-qa-widget-rendered="true"]', { state: "attached" });
    const widgetContract = await page.locator("[data-vi-widget-ref]").evaluate((node) => ({
      partner: node.dataset.viPartnerId,
      reference: node.dataset.viWidgetRef,
      term: node.dataset.viSearchTerm
    }));
    check(widgetRequests.length === 1, "Viator widget did not load exactly once after consent", errors);
    check(widgetContract.partner === "P00316944", "Viator partner ID is incorrect", errors);
    check(widgetContract.reference === "W-1e85be51-22c9-4ee6-981a-a49ddc586901", "Viator widget reference is incorrect", errors);
    check(widgetContract.term === "Chicago", "Viator search term did not match the city", errors);
    check(new URL(page.url()).searchParams.get("city") === "Chicago", "city was not preserved in the page URL", errors);

    await page.getByRole("button", { name: "Privacy choices" }).click();
    await page.getByRole("button", { name: "Necessary only" }).click();
    check(await page.locator("[data-vi-widget-ref]").count() === 0, "withdrawing affiliate consent did not remove the widget", errors);
    await context.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    const mobileRequests = [];
    await mockWidget(mobilePage, mobileRequests);
    await mobilePage.goto(baseUrl + "/guides/date-ideas-near-you/?city=Miami", { waitUntil: "domcontentloaded" });
    check(mobileRequests.length === 0, "query-string destination bypassed affiliate consent", errors);
    const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(mobileOverflow <= 1, `date-idea page overflows mobile by ${mobileOverflow}px`, errors);
    await mobilePage.screenshot({ path: path.join(evidence, "date-ideas-consent-gate-mobile.png"), fullPage: false });
    await mobileContext.close();

    const savedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await savedContext.addInitScript(() => {
      localStorage.setItem("dge-consent-v1", JSON.stringify({ version: 1, analytics: false, affiliate: true, updatedAt: "qa" }));
    });
    const savedPage = await savedContext.newPage();
    const savedRequests = [];
    await mockWidget(savedPage, savedRequests);
    await savedPage.goto(baseUrl + "/guides/date-ideas-near-you/?city=Miami", { waitUntil: "domcontentloaded" });
    await savedPage.waitForSelector('[data-vi-widget-ref][data-qa-widget-rendered="true"]', { state: "attached" });
    check(savedRequests.length === 1, "saved affiliate consent did not load a requested destination", errors);
    check(await savedPage.locator("[data-vi-widget-ref]").getAttribute("data-vi-search-term") === "Miami", "saved-consent widget used the wrong destination", errors);
    const savedOverflow = await savedPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(savedOverflow <= 1, `rendered widget contract overflows mobile by ${savedOverflow}px`, errors);
    await savedContext.close();

    const gpcContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await gpcContext.addInitScript(() => {
      Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    });
    const gpcPage = await gpcContext.newPage();
    const gpcRequests = [];
    await mockWidget(gpcPage, gpcRequests);
    await gpcPage.goto(baseUrl + "/guides/date-ideas-near-you/", { waitUntil: "domcontentloaded" });
    await gpcPage.locator("[data-date-location]").fill("Las Vegas");
    await gpcPage.getByRole("button", { name: "Find date ideas" }).click();
    await gpcPage.getByRole("button", { name: "Review privacy choices" }).click();
    await gpcPage.locator("[data-consent-dialog]").getByRole("button", { name: "Accept all" }).click();
    check(gpcRequests.length === 0, "Global Privacy Control did not block the affiliate widget", errors);
    await gpcContext.close();

    const visualContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await visualContext.addInitScript(() => {
      localStorage.setItem("dge-consent-v1", JSON.stringify({ version: 1, analytics: false, affiliate: false, updatedAt: "qa" }));
    });
    const visualPage = await visualContext.newPage();
    await visualPage.goto(baseUrl + "/guides/date-ideas-near-you/", { waitUntil: "domcontentloaded" });
    await visualPage.screenshot({ path: path.join(evidence, "date-ideas-guide-desktop.png"), fullPage: false });
    await visualPage.locator("#finder").scrollIntoViewIfNeeded();
    await visualPage.screenshot({ path: path.join(evidence, "date-ideas-finder-desktop.png"), fullPage: false });
    await visualContext.close();

    const mobileVisualContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await mobileVisualContext.addInitScript(() => {
      localStorage.setItem("dge-consent-v1", JSON.stringify({ version: 1, analytics: false, affiliate: false, updatedAt: "qa" }));
    });
    const mobileVisualPage = await mobileVisualContext.newPage();
    await mobileVisualPage.goto(baseUrl + "/guides/date-ideas-near-you/", { waitUntil: "domcontentloaded" });
    await mobileVisualPage.screenshot({ path: path.join(evidence, "date-ideas-guide-mobile.png"), fullPage: false });
    await mobileVisualPage.locator("#finder").scrollIntoViewIfNeeded();
    await mobileVisualPage.screenshot({ path: path.join(evidence, "date-ideas-finder-mobile.png"), fullPage: false });
    await mobileVisualContext.close();
  } finally {
    await browser.close();
  }

  if (errors.length) {
    console.error("Date-idea QA failed:");
    errors.forEach((error) => console.error("- " + error));
    process.exit(1);
  }
  console.log("Date-idea QA passed: consent gate, partner IDs, city search, withdrawal, GPC, and mobile overflow.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
