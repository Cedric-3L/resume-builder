/* eslint-disable @next/next/no-img-element */
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { themes, ThemeMeta, ThemeStyles } from "@/styles/themes";
import { cn } from "@/lib/utils";
import { allowResumeImageUrl, allowResumeLinkUrl } from "@/lib/resume-url-policy";
import { useResumeStore } from "@/store/useResumeStore";
import type { Element } from "hast";

const A4_WIDTH_MM = 210;
const A4_WIDTH_PX = 793.72;
const A4_HEIGHT_PX = 1122.52;
const PREVIEW_PAGE_GAP_PX = 2;

export function allowResumeAssetUrl(url: string, key?: string, node?: Readonly<Element>) {
  if (key === "src" || node?.tagName === "img") {
    return allowResumeImageUrl(url);
  }

  return allowResumeLinkUrl(url);
}

function stripPreviewShadow(className: string) {
  return className.replace(/\bshadow[^\s]*\b/g, "").replace(/\s+/g, " ").trim();
}

function stripPreviewRounded(className: string) {
  return className.replace(/\brounded[^\s]*\b/g, "").replace(/\s+/g, " ").trim();
}

type ResumeDocumentContentProps = {
  markdown: string;
  themeClassNames: {
    container: string;
    h1: string;
    h2: string;
    h3: string;
    p: string;
    ul: string;
    li: string;
    a: string;
  };
  containerStyle: React.CSSProperties;
  getStyle: (key: keyof ThemeStyles) => React.CSSProperties | undefined;
  headingColor: string;
  sectionSpacing: number;
  minHeightMm: number;
  wrapperRef?: React.Ref<HTMLDivElement>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
};

function ResumeDocumentContent({
  markdown,
  themeClassNames,
  containerStyle,
  getStyle,
  headingColor,
  sectionSpacing,
  minHeightMm,
  wrapperRef,
  contentRef,
}: ResumeDocumentContentProps) {
  return (
    <div
      ref={wrapperRef}
      className={cn("mx-auto bg-white", themeClassNames.container)}
      style={{
        ...containerStyle,
        width: `${A4_WIDTH_MM}mm`,
        minHeight: `${minHeightMm}mm`,
      }}
    >
      <div ref={contentRef}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          urlTransform={allowResumeAssetUrl}
          components={{
            h1: (props) => {
              const { node, ...rest } = props;
              void node;
              return <h1 className={themeClassNames.h1} style={getStyle("h1")} {...rest} />;
            },
            h2: (props) => {
              const { node, ...rest } = props;
              void node;
              return <h2 className={themeClassNames.h2} style={getStyle("h2")} {...rest} />;
            },
            h3: (props) => {
              const { node, ...rest } = props;
              void node;
              return <h3 className={themeClassNames.h3} style={getStyle("h3")} {...rest} />;
            },
            p: (props) => {
              const { node, ...rest } = props;
              void node;
              return <p className={themeClassNames.p} style={getStyle("p")} {...rest} />;
            },
            ul: (props) => {
              const { node, ...rest } = props;
              void node;
              return <ul className={themeClassNames.ul} style={getStyle("ul")} {...rest} />;
            },
            li: (props) => {
              const { node, ...rest } = props;
              void node;
              return <li className={themeClassNames.li} style={getStyle("li")} {...rest} />;
            },
            a: (props) => {
              const { node, ...rest } = props;
              void node;
              return <a className={themeClassNames.a} style={getStyle("a")} {...rest} />;
            },
            hr: () => (
              <div
                className="border-t border-slate-200"
                style={{
                  margin: `${sectionSpacing}px 0`,
                  borderColor: `${headingColor}22`,
                }}
              />
            ),
            img: (props) => {
              const { node, src, style: rawStyle, ...rest } = props;
              void node;
              const safeSrc = allowResumeImageUrl(String(src ?? ""));
              if (!safeSrc) return null;
              const hasInlineStyle = rawStyle != null && (typeof rawStyle === "string" ? (rawStyle as string).trim().length > 0 : Object.keys(rawStyle).length > 0);
              return (
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
      </div>
    </div>
  );
}

export const ResumePreview = forwardRef<HTMLDivElement, object>(function ResumePreview(
  _props,
  ref
) {
  const { markdown, theme, settings } = useResumeStore();
  const currentTheme = themes[theme] as ThemeMeta;
  const exportContentRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [contentHeightPx, setContentHeightPx] = useState(A4_HEIGHT_PX);
  const [previewScale, setPreviewScale] = useState<number | null>(null);

  const applyKeepTogetherLayout = React.useCallback(() => {
    const content = exportContentRef.current;
    if (!content) {
      return;
    }

    const keepNodes = Array.from(
      content.querySelectorAll<HTMLElement>('[data-page-keep="true"]')
    );

    keepNodes.forEach((node) => {
      node.style.marginTop = "0px";
    });

    const rootRect = content.getBoundingClientRect();

    keepNodes.forEach((node) => {
      const nodeRect = node.getBoundingClientRect();
      const start = nodeRect.top - rootRect.top;
      const height = nodeRect.height;
      const offsetInPage = start % A4_HEIGHT_PX;
      const spillsToNextPage = offsetInPage + height > A4_HEIGHT_PX;

      if (spillsToNextPage && height < A4_HEIGHT_PX) {
        const pushDown = A4_HEIGHT_PX - offsetInPage;
        node.style.marginTop = `${Math.ceil(pushDown)}px`;
      }
    });
  }, []);

  useEffect(() => {
    if (!exportContentRef.current) {
      return;
    }

    const content = exportContentRef.current;
    let frameId = 0;

    const syncPreviewLayout = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        applyKeepTogetherLayout();
        const verticalPaddingPx = settings.pageTopMargin * 3.7795 * 2;
        const nextContentHeight = Math.max(A4_HEIGHT_PX, content.scrollHeight + verticalPaddingPx);
        setContentHeightPx(nextContentHeight);
      });
    };

    const observer = new ResizeObserver(() => {
      syncPreviewLayout();
    });

    syncPreviewLayout();

    observer.observe(content);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [applyKeepTogetherLayout, markdown, settings.pageTopMargin, settings.fontSize, settings.lineHeight]);

  useEffect(() => {
    if (!exportContentRef.current) {
      return;
    }

    let frameId = 0;
    frameId = window.requestAnimationFrame(() => {
      const verticalPaddingPx = settings.pageTopMargin * 3.7795 * 2;
      applyKeepTogetherLayout();
      const nextContentHeight = Math.max(
        A4_HEIGHT_PX,
        exportContentRef.current?.scrollHeight
          ? exportContentRef.current.scrollHeight + verticalPaddingPx
          : A4_HEIGHT_PX
      );
      setContentHeightPx(nextContentHeight);
    });

    return () => cancelAnimationFrame(frameId);
  }, [applyKeepTogetherLayout, markdown, settings.pageTopMargin]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const viewport = viewportRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const availableWidth = Math.max(width - 8, 320);
      const nextScale = Math.min(1.08, Math.max(0.58, availableWidth / A4_WIDTH_PX));
      setPreviewScale(nextScale);
    });

    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  const containerStyle = useMemo(
    () =>
      ({
        "--theme-color": settings.themeColor,
        "--heading-color": settings.headingColor,
        padding: `${settings.pageTopMargin}mm ${settings.pageRightMargin}mm ${settings.pageTopMargin}mm ${settings.pageLeftMargin}mm`,
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        fontFamily: settings.fontFamily,
        ...currentTheme.styles.container,
      }) as React.CSSProperties,
    [currentTheme.styles.container, settings]
  );

  const resolvedPreviewScale = previewScale ?? 0.72;
  const scaledWidth = A4_WIDTH_PX * resolvedPreviewScale;
  const totalContentHeightPx = Math.max(contentHeightPx, A4_HEIGHT_PX);
  const pageCount = Math.max(1, Math.ceil(totalContentHeightPx / A4_HEIGHT_PX));
  const fullPagedHeightPx = pageCount * A4_HEIGHT_PX;
  const scaledPageHeight = A4_HEIGHT_PX * resolvedPreviewScale;
  const exportHeightMm = fullPagedHeightPx / 3.7795;

  const themeClassNames = useMemo(
    () => ({
      container: stripPreviewRounded(stripPreviewShadow(currentTheme.container)),
      h1: currentTheme.h1,
      h2: currentTheme.h2,
      h3: currentTheme.h3,
      p: currentTheme.p,
      ul: currentTheme.ul,
      li: currentTheme.li,
      a: currentTheme.a,
    }),
    [currentTheme]
  );

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

  const assignExportRef = (node: HTMLDivElement | null) => {
    if (typeof ref === "function") {
      ref(node);
      return;
    }

    if (ref) {
      ref.current = node;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed opacity-0"
        style={{ left: "-200vw", top: 0 }}
      >
        <ResumeDocumentContent
          markdown={markdown}
          themeClassNames={themeClassNames}
          containerStyle={containerStyle}
          getStyle={getStyle}
          headingColor={settings.headingColor}
          sectionSpacing={settings.sectionSpacing}
          minHeightMm={exportHeightMm}
          wrapperRef={assignExportRef}
          contentRef={exportContentRef}
        />
      </div>

      <div ref={viewportRef} className="no-scrollbar min-h-0 flex-1 overflow-auto px-4 py-4">
        <div className="flex min-h-full items-start justify-center pb-4">
          <div
            className="flex flex-col items-stretch"
            style={{
              width: `${scaledWidth}px`,
              visibility: previewScale === null ? "hidden" : "visible",
              gap: `${PREVIEW_PAGE_GAP_PX}px`,
            }}
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <div key={index} className="flex flex-col" style={{ gap: index === 0 ? "0px" : "1px" }}>
                {index > 0 ? (
                  <div className="flex items-center gap-1 px-0.5">
                    <div className="h-px flex-1 bg-[#cfc6b8]/80" />
                    <div className="rounded-full border border-[#d6cec1] bg-[#fffaf2] px-1.5 py-0 text-[8px] font-semibold tracking-[0.08em] text-[#77716a] shadow-sm">
                      第 {index + 1} 页
                    </div>
                    <div className="h-px flex-1 bg-[#cfc6b8]/80" />
                  </div>
                ) : null}

                <div
                  className="relative overflow-hidden border border-[#d8d0c3] bg-white shadow-[0_18px_48px_rgba(77,63,44,0.13)]"
                  style={{
                    width: `${scaledWidth}px`,
                    height: `${scaledPageHeight}px`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0"
                    style={{ transform: `scale(${resolvedPreviewScale})`, transformOrigin: "top left" }}
                  >
                    <div style={{ transform: `translateY(-${index * A4_HEIGHT_PX}px)` }}>
                      <ResumeDocumentContent
                        markdown={markdown}
                        themeClassNames={themeClassNames}
                        containerStyle={containerStyle}
                        getStyle={getStyle}
                        headingColor={settings.headingColor}
                        sectionSpacing={settings.sectionSpacing}
                        minHeightMm={exportHeightMm}
                      />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#fffaf2]/94 px-2.5 py-1 text-[10px] font-semibold text-[#77716a] shadow-sm ring-1 ring-[#d6cec1]/80">
                    {index + 1} / {pageCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
