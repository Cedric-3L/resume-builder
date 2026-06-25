import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("tmp/visual-qa");
await mkdir(outputDir, { recursive: true });
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const viewportWidth = Number(process.env.QA_WIDTH ?? 1440);
const viewportHeight = Number(process.env.QA_HEIGHT ?? 1024);
const outputSuffix = process.env.QA_SUFFIX ?? "";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const pages = [
  ["homepage", `${baseUrl}/`],
  ["templates", `${baseUrl}/templates`],
  ["login", `${baseUrl}/login`],
];

for (const [name, url] of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({
    path: path.join(outputDir, `${name}${outputSuffix}.png`),
    fullPage: false,
  });
  await page.close();
}

await browser.close();
