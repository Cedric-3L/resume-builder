import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { savePrintResumePayload } from "@/lib/server/resume-print-store";
import { generateMarkdownFromSections } from "@/store/useResumeStore";
import { validateCsrf } from "@/lib/server/csrf";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { recordExportEvent } from "@/lib/server/account-storage";
import type { ResumeSettings } from "@/store/useResumeStore";
import type { TemplateKey } from "@/store/demoData";
import type { ThemeKey } from "@/styles/themes";
import type { ResumeSection } from "@/types/resume";

export const runtime = "nodejs";

type BrowserPage = {
  goto: (url: string, options?: { waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2"; timeout?: number }) => Promise<unknown>;
  waitForFunction: (fn: () => boolean, options?: { polling?: "raf" | "mutation" | number; timeout?: number }) => Promise<unknown>;
  evaluate: <T>(fn: () => T | Promise<T>) => Promise<T>;
  pdf: (options: {
    format: "A4";
    printBackground: boolean;
    preferCSSPageSize: boolean;
    margin: { top: string; right: string; bottom: string; left: string };
  }) => Promise<Uint8Array>;
  close: () => Promise<void>;
};

type Browser = {
  newPage: () => Promise<BrowserPage>;
  close: () => Promise<void>;
};

type PuppeteerModule = {
  launch: (options: { headless: true; args: string[]; executablePath?: string }) => Promise<Browser>;
};

type PDFSettings = ResumeSettings;

const PDF_PAGE_READY_TIMEOUT_MS = 15000;
const PDF_BROWSER_IDLE_TIMEOUT_MS = 60000;

let browserPromise: Promise<Browser> | null = null;
let browserIdleTimer: ReturnType<typeof setTimeout> | null = null;
let activePdfPages = 0;

interface RequestBody {
  sections: ResumeSection[];
  settings: PDFSettings;
  template?: TemplateKey;
  theme?: ThemeKey;
  title?: string;
}

function getOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "PDF 导出失败，请查看服务端日志";
}

async function launchBrowser() {
  try {
    const puppeteer = (await import("puppeteer")) as unknown as PuppeteerModule;
    const launchOptions: { headless: true; args: string[]; executablePath?: string } = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    return puppeteer.launch(launchOptions);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message.includes("Cannot find module")
        ? "缺少 puppeteer 依赖，请先安装 puppeteer 后再导出 PDF"
        : error instanceof Error
          ? error.message
          : "浏览器 PDF 引擎启动失败"
    );
  }
}

function clearBrowserIdleTimer() {
  if (browserIdleTimer) {
    clearTimeout(browserIdleTimer);
    browserIdleTimer = null;
  }
}

function scheduleBrowserIdleClose() {
  clearBrowserIdleTimer();
  if (!browserPromise || activePdfPages > 0) {
    return;
  }

  browserIdleTimer = setTimeout(() => {
    const idleBrowserPromise = browserPromise;
    browserPromise = null;
    browserIdleTimer = null;
    void idleBrowserPromise?.then((browser) => browser.close()).catch(() => undefined);
  }, PDF_BROWSER_IDLE_TIMEOUT_MS);
  browserIdleTimer.unref?.();
}

async function getBrowser() {
  clearBrowserIdleTimer();
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

async function resetBrowser() {
  clearBrowserIdleTimer();
  const staleBrowserPromise = browserPromise;
  browserPromise = null;
  await staleBrowserPromise?.then((browser) => browser.close()).catch(() => undefined);
}

async function newPdfPage() {
  let browser = await getBrowser();
  try {
    const page = await browser.newPage();
    activePdfPages += 1;
    return page;
  } catch {
    await resetBrowser();
    browser = await getBrowser();
    const page = await browser.newPage();
    activePdfPages += 1;
    return page;
  }
}

function releasePdfPage() {
  activePdfPages = Math.max(0, activePdfPages - 1);
  scheduleBrowserIdleClose();
}

async function waitForPrintPageReady(page: BrowserPage) {
  await page.waitForFunction(
    () => Boolean(document.querySelector("[data-pdf-content='true'], [data-pdf-error-message]")),
    { polling: "raf", timeout: PDF_PAGE_READY_TIMEOUT_MS }
  );

  const pageError = await page.evaluate(() => document.querySelector("[data-pdf-error-message]")?.getAttribute("data-pdf-error-message") || "");
  if (pageError) {
    throw new Error(pageError);
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      })
    );
  });
}

export async function POST(request: NextRequest) {
  const csrf = validateCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.error }, { status: csrf.status });
  }

  const rl = checkRateLimit(`pdf:generate:${getClientIp(request)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let page: BrowserPage | null = null;
  let leasedPage = false;

  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return NextResponse.json({ error: "请先登录后再导出 PDF" }, { status: 401 });
    }

    const body: RequestBody = await request.json();
    const markdown = generateMarkdownFromSections(body.sections, body.template, body.settings);
    const printJob = await savePrintResumePayload(data.user.id, {
      markdown,
      theme: body.theme || "professional",
      settings: body.settings,
      title: body.title,
    });

    page = await newPdfPage();
    leasedPage = true;
    await page.goto(
      `${getOrigin(request)}/print/resume/${printJob.id}?token=${encodeURIComponent(printJob.token)}`,
      {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      }
    );

    await waitForPrintPageReady(page);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    const pdfBody = new ArrayBuffer(pdf.byteLength);
    new Uint8Array(pdfBody).set(pdf);
    await recordExportEvent(data.user.id, body.title).catch(() => undefined);

    return new NextResponse(pdfBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(body.title || "resume")}.pdf; filename="${encodeURIComponent(body.title || "resume")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await page?.close().catch(() => undefined);
    if (leasedPage) {
      releasePdfPage();
    }
  }
}
