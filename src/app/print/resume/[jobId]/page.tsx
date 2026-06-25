import type React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { allowResumeImageUrl, allowResumeLinkUrl } from "@/lib/resume-url-policy";
import { takePrintResumePayload, type PrintResumePayload } from "@/lib/server/resume-print-store";
import { createServerSupabase } from "@/lib/supabase/server";
import { themes, type ThemeMeta, type ThemeStyles } from "@/styles/themes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ jobId: string }>;
  searchParams?: Promise<{ token?: string | string[] }>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "加载打印数据失败";
}

async function loadPayload(jobId: string, token: string | undefined) {
  if (!/^[\w-]{1,128}$/.test(jobId)) {
    throw new Error("Invalid print job ID");
  }

  if (token?.trim()) {
    return takePrintResumePayload(jobId, { token: token.trim() });
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    throw new Error("请先登录后再打印简历");
  }

  return takePrintResumePayload(jobId, { userId: data.user.id });
}

function PrintResumeContent({ payload }: { payload: PrintResumePayload }) {
  const currentTheme = themes[payload.theme] as ThemeMeta;
  const { markdown, settings } = payload;
  const containerStyle = {
    "--theme-color": settings.themeColor,
    "--heading-color": settings.headingColor,
    padding: `${settings.pageTopMargin}mm ${settings.pageRightMargin}mm ${settings.pageTopMargin}mm ${settings.pageLeftMargin}mm`,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    fontFamily: settings.fontFamily,
    ...currentTheme.styles.container,
  } as React.CSSProperties;

  const getStyle = (key: keyof ThemeStyles): React.CSSProperties | undefined => {
    const baseStyle = currentTheme.styles[key];

    if (key === "h2") {
      return {
        ...baseStyle,
        color: settings.headingColor,
        marginTop: `${settings.headingTopSpacing}px`,
        marginBottom: `${settings.headingBottomSpacing}px`,
        borderColor: settings.headingColor,
      };
    }

    return baseStyle;
  };

  return (
    <main
      data-pdf-content="true"
      className={currentTheme.container}
      style={{
        ...containerStyle,
        width: "210mm",
        minHeight: "297mm",
        border: "none",
        boxShadow: "none",
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        urlTransform={allowResumeLinkUrl}
        components={{
          h1: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h1 className={currentTheme.h1} style={getStyle("h1")} {...rest} />;
          },
          h2: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h2 className={currentTheme.h2} style={getStyle("h2")} {...rest} />;
          },
          h3: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h3 className={currentTheme.h3} style={getStyle("h3")} {...rest} />;
          },
          p: (props) => {
            const { node, ...rest } = props;
            void node;
            return <p className={currentTheme.p} style={getStyle("p")} {...rest} />;
          },
          ul: (props) => {
            const { node, ...rest } = props;
            void node;
            return <ul className={currentTheme.ul} style={getStyle("ul")} {...rest} />;
          },
          li: (props) => {
            const { node, ...rest } = props;
            void node;
            return <li className={currentTheme.li} style={getStyle("li")} {...rest} />;
          },
          a: (props) => {
            const { node, ...rest } = props;
            void node;
            return <a className={currentTheme.a} style={getStyle("a")} {...rest} />;
          },
          hr: () => (
            <div
              className="border-t border-slate-200"
              style={{
                margin: `${settings.sectionSpacing}px 0`,
                borderColor: `${settings.headingColor}22`,
              }}
            />
          ),
          img: (props) => {
            const { node, src, style: rawStyle, ...rest } = props;
            void node;
            const safeSrc = allowResumeImageUrl(String(src ?? ""));
            if (!safeSrc) return null;
            const hasInlineStyle = rawStyle != null && Object.keys(rawStyle).length > 0;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={safeSrc}
                style={rawStyle}
                {...rest}
                alt={props.alt ?? "resume asset"}
                className={hasInlineStyle ? "object-cover" : "my-3 max-h-52 border border-slate-200 object-cover"}
              />
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </main>
  );
}

function PrintError({ message }: { message: string }) {
  return (
    <div data-pdf-error-message={message} className="p-6 text-sm text-red-600">
      {message}
    </div>
  );
}

export default async function ResumePrintPage({ params, searchParams }: PageProps) {
  const { jobId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const token = getSearchParam(resolvedSearchParams.token);
  let payload: PrintResumePayload | null = null;
  let errorMessage: string | null = null;

  try {
    payload = await loadPayload(jobId, token);
  } catch (error) {
    errorMessage = getErrorMessage(error);
  }

  if (errorMessage) {
    return <PrintError message={errorMessage} />;
  }

  if (!payload) {
    return <PrintError message="Print job not found" />;
  }

  return <PrintResumeContent payload={payload} />;
}
