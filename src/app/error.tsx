"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f4ed] px-4 text-[#171716]">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-[#c7c1b8]">
          <AlertTriangle className="h-10 w-10 stroke-[1.2] text-[#f05a1a]" />
        </div>
        <h1 className="font-editorial text-4xl font-semibold">出错了</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
          页面加载时遇到问题，请刷新后重试。如问题持续存在请联系我们。
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="editorial-button inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            重试
          </button>
          <Link
            href="/"
            className="border border-[#aaa49b] px-6 py-2.5 text-sm font-semibold transition hover:border-[#171716]"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
