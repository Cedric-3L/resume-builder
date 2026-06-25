import Link from "next/link";
import { ArrowRight, Download, LetterText, PanelsTopLeft, PenLine } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { ScaledResumePreview } from "@/components/ui/ScaledResumePreview";
import { resumeTemplates, templateKeys } from "@/store/demoData";

const featured = templateKeys.slice(0, 3);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#171716]">
      <Navbar />

      <main>
        <section className="mx-auto grid h-[650px] max-w-[1440px] overflow-hidden border-b border-[#bbb5ab] px-5 sm:px-8 lg:grid-cols-[44%_56%] lg:px-12">
          <div className="flex flex-col justify-start pb-4 pr-10 pt-[86px]">
            <h1 className="font-editorial text-[56px] font-semibold leading-[1.18] tracking-[-.055em] sm:text-[70px]">
              认真写下
              <br />
              你的下一步
            </h1>
            <p className="mt-6 font-editorial text-[20px] tracking-[.08em] text-[#35322f]">
              内容决定机会，排版让它被看见
            </p>
            <div className="editorial-rule mt-5" />

            <div className="mt-9 flex items-center gap-10">
              <Link href="/editor" className="bg-[#1d1d1b] px-9 py-4 text-sm text-white transition hover:bg-[#075be8]">
                开始写简历
              </Link>
              <Link href="/templates" className="inline-flex items-center gap-3 text-sm hover:text-[#075be8]">
                查看模板 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid max-w-[510px] grid-cols-3 gap-8 border-t border-[#c9c3b9] pt-7">
              {[
                [PenLine, "专注内容", "侧重写作体验"],
                [PanelsTopLeft, "实时排版", "所见即所得"],
                [Download, "一键导出", "PDF / Word 双格式"],
              ].map(([Icon, title, text]) => {
                const Graphic = Icon as typeof PenLine;
                return (
                  <div key={String(title)}>
                    <Graphic className="h-5 w-5 stroke-[1.3]" />
                    <div className="mt-3 text-sm font-medium">{String(title)}</div>
                    <div className="mt-1 text-xs leading-5 text-[#77716a]">{String(text)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-start justify-center border-l border-[#bbb5ab] pt-6">
            <div className="relative z-10 h-[819px] w-[580px] translate-x-[-68px] bg-white shadow-[0_20px_55px_rgba(53,44,34,.14)]">
              <div className="absolute -left-8 top-5 -z-10 h-full w-full rotate-[-3deg] bg-[#fefcf8] shadow-[0_8px_28px_rgba(53,44,34,.10)]" />
              <div className="absolute -right-7 top-8 -z-20 h-full w-full rotate-[3deg] bg-[#fdfaf5] shadow-[0_8px_28px_rgba(53,44,34,.08)]" />
              <ScaledResumePreview templateKey={featured[1]} themeKey={resumeTemplates[featured[1]].defaultTheme} />
            </div>

            <div className="absolute right-0 top-3 h-[625px] w-[112px] border-l border-[#bdb7ad] pl-5 pt-24">
              {[
                [PanelsTopLeft, "结构", "智能优化层级"],
                [LetterText, "字体", "中英文平衡搭配"],
                [Download, "导出", "PDF / Word"],
              ].map(([Icon, title, text], index) => {
                const Graphic = Icon as typeof PenLine;
                return (
                  <div key={String(title)} className={index ? "mt-16" : ""}>
                    <Graphic className="h-5 w-5 stroke-[1.2]" />
                    <div className="mt-3 text-sm font-medium">{String(title)}</div>
                    <div className="mt-1 text-[11px] leading-5 text-[#77716a]">{String(text)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 pb-7 pt-5 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-editorial text-2xl font-semibold">精选模板</h2>
              <div className="editorial-rule mt-3" />
              <p className="mt-2 text-xs text-[#77716a]">为不同职位行业，精心设计的排版方案</p>
            </div>
            <Link href="/templates" className="inline-flex items-center gap-3 text-sm hover:text-[#075be8]">
              查看全部模板 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid gap-8 lg:grid-cols-3">
            {featured.map((key) => {
              const item = resumeTemplates[key];
              return (
                <Link key={key} href="/templates" className="group grid grid-cols-[1.18fr_.82fr] gap-5 border-t border-[#c4beb4] pt-4">
                  <div className="h-[300px] overflow-hidden bg-white shadow-[0_16px_34px_rgba(53,44,34,.10)] sm:h-[330px] lg:h-[300px] xl:h-[335px]">
                    <div className="w-full">
                      <ScaledResumePreview templateKey={key} themeKey={item.defaultTheme} />
                    </div>
                  </div>
                  <div className="py-1">
                    <h3 className="font-editorial text-lg font-semibold group-hover:text-[#075be8]">{item.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#77716a]">{item.description}</p>
                    <div className="mt-4 text-[11px] leading-5 text-[#77716a]">
                      适合人群
                      <br />
                      互联网 / 教育 / 设计
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-6 border-t border-[#bbb5ab] pt-5 text-sm text-[#6f6b65]">
            <span className="font-editorial text-base text-[#272522]">深受 100 万+ 求职者信赖</span>
            <div className="flex flex-wrap gap-x-12 gap-y-3 text-xs tracking-[.08em]">
              <span>ByteDance</span><span>Tencent</span><span>Alibaba</span><span>Meituan</span><span>Huawei</span><span>Microsoft</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
