import Link from "next/link";
import { FileSearch } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f4ed] px-4 text-[#171716]">
      <div className="text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center border border-[#c7c1b8]">
          <FileSearch className="h-10 w-10 stroke-[1.2] text-[#075be8]" />
        </div>
        <h1 className="font-editorial text-7xl font-semibold">404</h1>
        <div className="editorial-rule mx-auto mt-5" />
        <p className="mt-5 text-base leading-7 text-[#77716a]">
          页面未找到，请检查地址是否正确
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="editorial-button px-6 py-2.5 text-sm font-semibold"
          >
            返回首页
          </Link>
          <Link
            href="/templates"
            className="border border-[#aaa49b] px-6 py-2.5 text-sm font-semibold transition hover:border-[#171716]"
          >
            浏览模板
          </Link>
        </div>
      </div>
    </main>
  );
}
