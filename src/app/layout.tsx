import type { Metadata } from "next";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "极刻简历 - 认真写下你的下一步",
    template: "%s | 极刻简历",
  },
  description:
    "模块化编辑、实时 A4 预览与一键 PDF 导出的在线简历制作工具。",
  keywords: ["简历制作", "在线简历", "PDF导出", "简历模板", "求职", "中文简历"],
  authors: [{ name: "极刻简历" }],
  creator: "极刻简历",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "极刻简历",
    title: "极刻简历 - 在线简历编辑与 PDF 导出",
    description:
      "模块化编辑、实时 A4 预览、一键导出 PDF。从模板开始，快速做出可投递的中文简历。",
  },
  twitter: {
    card: "summary_large_image",
    title: "极刻简历 - 在线简历编辑与 PDF 导出",
    description:
      "模块化编辑、实时 A4 预览、一键导出 PDF 的在线简历制作工具。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
