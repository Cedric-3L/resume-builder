import Link from "next/link";

const FOOTER_LINKS = {
  产品: [
    { href: "/templates", label: "模板库" },
    { href: "/editor", label: "在线编辑" },
  ],
  账户: [
    { href: "/login", label: "登录" },
    { href: "/dashboard", label: "个人中心" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#bdb7ad] bg-[#f3eee6]">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-editorial text-5xl leading-none">G</span>
              <div className="flex h-9 flex-col justify-center">
                <div className="font-editorial text-lg font-semibold leading-tight tracking-[.12em]">极刻简历</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400 leading-tight">GeekCV</div>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#6f6b65]">
              内容决定机会，排版让它被看见。认真写下你的下一步。
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8">
          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} 极刻简历. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
