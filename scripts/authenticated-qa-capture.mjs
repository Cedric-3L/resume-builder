import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const outputDir = path.resolve("tmp/visual-qa/authenticated");
await mkdir(outputDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
const browserIssues = [];
page.on("pageerror", (error) => browserIssues.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") browserIssues.push(`console: ${message.text()}`);
});
await page.setViewport({ width: 1440, height: 1024, deviceScaleFactor: 1 });
await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle0", timeout: 30000 });
await page.type('input[type="email"]', "demo@geekcv.com");
await page.type('input[type="password"]', "123456");
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }).catch(() => undefined);

if (!page.url().includes("/dashboard")) {
  const message = await page.$eval("body", (node) => node.textContent ?? "");
  throw new Error(`Demo login did not reach dashboard: ${page.url()} :: ${message.slice(0, 500)}`);
}

const sections = [
  ["个人资料", "profile"],
  ["会员中心", "membership"],
  ["我的收藏", "favorites"],
  ["我的订单", "orders"],
  ["使用教程", "tutorial"],
  ["管理后台", "admin"],
];

for (const [label, name] of sections) {
  const clicked = await page.$$eval("aside button", (buttons, target) => {
    const button = buttons.find((item) => item.textContent?.includes(target));
    if (!button) return false;
    button.click();
    return true;
  }, label);
  if (!clicked) continue;
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false });
}

await browser.close();

if (browserIssues.length) {
  console.log([...new Set(browserIssues)].join("\n"));
}
