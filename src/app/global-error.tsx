"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <main className="flex min-h-screen items-center justify-center bg-[#f8f4ed] px-4 text-[#171716]">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="font-editorial text-4xl font-semibold">系统错误</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              应用遇到严重错误。请刷新页面或稍后再试。
            </p>
            <button
              onClick={reset}
              className="mt-8 bg-[#075be8] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064fc9]"
            >
              刷新页面
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
