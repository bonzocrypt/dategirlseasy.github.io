const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.DGE_CAPTURE_BASE_URL;
const outputDirectory = process.env.DGE_CAPTURE_OUTPUT_DIR;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

if (!baseUrl || !outputDirectory) {
  console.error("Set DGE_CAPTURE_BASE_URL and DGE_CAPTURE_OUTPUT_DIR.");
  process.exit(2);
}

const pages = [
  ["homepage-mobile.png", "/"],
  ["review-tinder-mobile.png", "/reviews/tinder.html"],
  ["comparison-tinder-bumble-mobile.png", "/comparisons/tinder-vs-bumble.html"],
  ["guide-openers-mobile.png", "/guides/openers-that-get-replies.html"],
  ["long-guide-internet-dating-mobile.png", "/ebooks/profile-and-photos/internet-dating-guide-for-men.html"],
];

(async () => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const captured = [];
  const skipped = [];

  for (const [filename, pathname] of pages) {
    const destination = path.join(outputDirectory, filename);
    if (fs.existsSync(destination)) {
      skipped.push(filename);
      continue;
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle" });
    if (!response || !response.ok()) throw new Error(`${pathname} returned ${response ? response.status() : "no response"}`);
    await page.screenshot({ path: destination, fullPage: true });
    captured.push(filename);
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify({ captured, skipped }, null, 2));
})();
