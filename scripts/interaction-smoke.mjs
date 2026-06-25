import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1024 });
const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";

for (const route of ["/dashboard", "/editor"]) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
  console.log(`${route} => ${new URL(page.url()).pathname}`);
}

async function clickButton(text) {
  const found = await page.$$eval(
    "button",
    (buttons, target) => {
      const button = buttons.find((item) => item.textContent?.trim().includes(target));
      if (!button) return false;
      button.click();
      return true;
    },
    text
  );
  if (!found) throw new Error(`Missing button: ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 600));
}

async function clickSidebarButton(text) {
  const found = await page.$$eval(
    "aside button",
    (buttons, target) => {
      const button = buttons.find((item) => item.textContent?.trim() === target);
      if (!button) return false;
      button.click();
      return true;
    },
    text
  );
  if (!found) throw new Error(`Missing sidebar button: ${text}`);
  await new Promise((resolve) => setTimeout(resolve, 600));
}

await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle0", timeout: 30000 });
await clickButton("去注册");
await page.waitForFunction(() => Array.from(document.querySelectorAll("h1")).some((node) => node.textContent?.includes("创建账号")));
console.log("register state: ready");
await clickButton("返回登录");
await clickButton("验证码登录");
await page.waitForFunction(() => Array.from(document.querySelectorAll("button")).some((node) => node.textContent?.includes("验证并登录")));
console.log("sms state: ready");

await page.goto(`${baseUrl}/templates`, { waitUntil: "networkidle0", timeout: 30000 });
const firstCardState = await page.$eval("article > div", (node) => {
  const actions = node.querySelector("div[class*='translate-y-full']");
  return {
    borderColor: getComputedStyle(node).borderColor,
    actionsTransform: actions ? getComputedStyle(actions).transform : "",
  };
});
console.log(`first card default: ${JSON.stringify(firstCardState)}`);
await clickSidebarButton("互联网");
console.log(`internet cards: ${await page.$$eval("article", (nodes) => nodes.length)}`);
await clickSidebarButton("设计 / 创意");
console.log(`design cards: ${await page.$$eval("article", (nodes) => nodes.length)}`);
await clickSidebarButton("应届生");
console.log(`campus cards: ${await page.$$eval("article", (nodes) => nodes.length)}`);

await browser.close();
