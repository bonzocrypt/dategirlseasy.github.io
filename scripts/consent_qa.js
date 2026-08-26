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
const evidence = path.join(root, "project-evidence", "screenshots", "after");

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function watchRequests(page) {
  const urls = [];
  page.on("request", (request) => urls.push(request.url()));
  return urls;
}

(async () => {
  const errors = [];
  fs.mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const requests = watchRequests(page);
    await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-consent-banner]:not([hidden])");

    const labels = await page.locator("[data-consent-banner] button").allTextContents();
    assert(JSON.stringify(labels) === JSON.stringify(["Accept all", "Necessary only", "Customize"]), "initial banner choices are missing or out of order", errors);
    assert(!requests.some((url) => url.includes("googletagmanager.com/gtag/js")), "Google Analytics loaded before consent", errors);
    assert(!requests.some((url) => url.includes("googletagmanager.com/gtm.js")), "Google Tag Manager loaded before consent", errors);
    assert(requests.some((url) => url.includes("clarity.ms/tag/y72r4c6i9y")), "Clarity no-cookie bootstrap did not load", errors);
    const initialCookies = await context.cookies();
    assert(!initialCookies.some((cookie) => cookie.name === "_clck" || cookie.name === "_clsk" || cookie.name === "_ga" || cookie.name.startsWith("_ga_")), "analytics cookies appeared before consent", errors);

    const bannerAccessibility = await page.locator("[data-consent-banner]").evaluate((banner) => {
      const controls = Array.from(banner.querySelectorAll("button"));
      const targets = controls.map((node) => {
        const rect = node.getBoundingClientRect();
        return { name: node.textContent.trim(), width: rect.width, height: rect.height };
      });
      controls[0].focus();
      const style = getComputedStyle(controls[0]);
      return {
        targetTooSmall: targets.filter((target) => target.width < 44 || target.height < 44),
        focusVisible: style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 2
      };
    });
    assert(bannerAccessibility.targetTooSmall.length === 0, "consent controls do not meet the 44px target size", errors);
    assert(bannerAccessibility.focusVisible, "consent controls lack a visible keyboard focus style", errors);

    await page.screenshot({ path: path.join(evidence, "privacy-consent-banner-desktop.png"), fullPage: false });
    await page.getByRole("button", { name: "Customize" }).click();
    assert(await page.locator("[data-consent-dialog]").evaluate((node) => node.open), "Customize did not open the privacy dialog", errors);
    assert(await page.locator('[data-consent-category="analytics"]').evaluate((node) => node === document.activeElement), "privacy dialog did not focus the first optional category", errors);
    await page.screenshot({ path: path.join(evidence, "privacy-consent-dialog-desktop.png"), fullPage: false });
    await page.keyboard.press("Escape");
    assert(await page.getByRole("button", { name: "Customize" }).evaluate((node) => node === document.activeElement), "closing the dialog did not restore focus", errors);
    await page.getByRole("button", { name: "Necessary only" }).click();

    const necessaryChoice = await page.evaluate(() => JSON.parse(localStorage.getItem("dge-consent-v1")));
    assert(necessaryChoice.analytics === false && necessaryChoice.affiliate === false, "Necessary only did not disable both optional categories", errors);
    assert(await page.locator("[data-consent-banner]").isHidden(), "banner remained visible after Necessary only", errors);
    assert(await page.getByRole("button", { name: "Privacy choices" }).count() === 1, "footer Privacy choices control is missing", errors);
    const necessaryCookies = await context.cookies();
    assert(!necessaryCookies.some((cookie) => cookie.name === "_clck" || cookie.name === "_clsk" || cookie.name === "_ga" || cookie.name.startsWith("_ga_")), "analytics cookies appeared after Necessary only", errors);
    await context.close();

    const acceptedContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await acceptedContext.addInitScript(() => {
      localStorage.setItem("dge-consent-v1", JSON.stringify({ version: 1, analytics: true, affiliate: true, updatedAt: new Date().toISOString() }));
    });
    const acceptedPage = await acceptedContext.newPage();
    const acceptedRequests = watchRequests(acceptedPage);
    await acceptedPage.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    await acceptedPage.waitForTimeout(600);
    assert(await acceptedPage.locator("[data-consent-banner]").isHidden(), "returning accepted visitor saw the first-visit banner", errors);
    assert(acceptedRequests.some((url) => url.includes("googletagmanager.com/gtag/js?id=G-T2TQHDFBZP")), "Google Analytics did not load after analytics consent", errors);
    assert(!acceptedRequests.some((url) => url.includes("googletagmanager.com/gtm.js")), "retired GTM container still loaded", errors);
    await acceptedPage.getByRole("button", { name: "Privacy choices" }).click();
    assert(await acceptedPage.locator('[data-consent-category="analytics"]').isChecked(), "saved Analytics choice was not restored", errors);
    assert(await acceptedPage.locator('[data-consent-category="affiliate"]').isChecked(), "saved Affiliate choice was not restored", errors);
    await acceptedPage.screenshot({ path: path.join(evidence, "privacy-consent-dialog-mobile.png"), fullPage: false });
    const overflow = await acceptedPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `mobile consent UI overflows by ${overflow}px`, errors);
    await acceptedContext.close();

    const affiliateContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const affiliatePage = await affiliateContext.newPage();
    const affiliateRequests = watchRequests(affiliatePage);
    await affiliatePage.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    await affiliatePage.screenshot({ path: path.join(evidence, "privacy-consent-banner-mobile.png"), fullPage: false });
    await affiliatePage.getByRole("button", { name: "Customize" }).click();
    await affiliatePage.locator('[data-consent-category="affiliate"]').check();
    await affiliatePage.getByRole("button", { name: "Save choices" }).click();
    const affiliateChoice = await affiliatePage.evaluate(() => window.DGEConsent.get());
    assert(affiliateChoice.analytics === false && affiliateChoice.affiliate === true, "custom affiliate-only choice was not saved", errors);
    assert(!affiliateRequests.some((url) => url.includes("googletagmanager.com/gtag/js")), "affiliate-only consent incorrectly loaded Analytics", errors);
    await affiliateContext.close();

    const gpcContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await gpcContext.addInitScript(() => {
      Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: true });
    });
    const gpcPage = await gpcContext.newPage();
    await gpcPage.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    await gpcPage.getByRole("button", { name: "Accept all" }).click();
    const gpcChoice = await gpcPage.evaluate(() => window.DGEConsent.get());
    assert(gpcChoice.analytics === true && gpcChoice.affiliate === false, "Global Privacy Control did not keep affiliate tracking disabled", errors);
    await gpcPage.getByRole("button", { name: "Privacy choices" }).click();
    assert(await gpcPage.locator('[data-consent-category="affiliate"]').isDisabled(), "Global Privacy Control did not disable the affiliate setting", errors);
    assert(await gpcPage.locator("[data-consent-gpc-note]").isVisible(), "Global Privacy Control explanation is missing", errors);
    await gpcContext.close();
  } finally {
    await browser.close();
  }

  if (errors.length) {
    console.error("Consent QA failed:");
    errors.forEach((error) => console.error("- " + error));
    process.exit(1);
  }
  console.log("Consent QA passed: defaults, choices, cookies, persistence, GPC, tracking gates, focus, and mobile overflow.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
