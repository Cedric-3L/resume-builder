"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { allowResumeImageUrl, allowResumeLinkUrl } from "@/lib/resume-url-policy";
import { getTemplateSections, TemplateKey } from "@/store/demoData";
import { generateMarkdownFromSections } from "@/store/useResumeStore";
import { themes, ThemeKey, ThemeMeta, ThemeStyles } from "@/styles/themes";

interface MiniResumePreviewProps {
  templateKey: TemplateKey;
  themeKey: ThemeKey;
  fitContent?: boolean;
}

export const MiniResumePreview = React.memo(function MiniResumePreview({
  templateKey,
  themeKey,
  fitContent = false,
}: MiniResumePreviewProps) {
  const theme = themes[themeKey] as ThemeMeta;

  const markdown = useMemo(() => {
    return generateMarkdownFromSections(getTemplateSections(templateKey), templateKey);
  }, [templateKey]);

  const getStyle = (key: keyof ThemeStyles): React.CSSProperties | undefined =>
    theme.styles[key];

  return (
    <div
      className={cn("overflow-hidden select-none", theme.container)}
      style={{
        width: fitContent ? "100%" : "210mm",
        height: fitContent ? "auto" : "297mm",
        minHeight: fitContent ? undefined : "297mm",
        aspectRatio: fitContent ? "210 / 297" : undefined,
        padding: fitContent ? "6.66%" : "14mm",
        fontSize: "10px",
        lineHeight: 1.45,
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        "--theme-color": "#2563eb",
        ...theme.styles.container,
      } as React.CSSProperties}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        urlTransform={allowResumeLinkUrl}
        components={{
          h1: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h1 className={theme.h1} style={getStyle("h1")} {...rest} />;
          },
          h2: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h2 className={theme.h2} style={getStyle("h2")} {...rest} />;
          },
          h3: (props) => {
            const { node, ...rest } = props;
            void node;
            return <h3 className={theme.h3} style={getStyle("h3")} {...rest} />;
          },
          p: (props) => {
            const { node, ...rest } = props;
            void node;
            return <p className={theme.p} style={getStyle("p")} {...rest} />;
          },
          ul: (props) => {
            const { node, ...rest } = props;
            void node;
            return <ul className={theme.ul} style={getStyle("ul")} {...rest} />;
          },
          li: (props) => {
            const { node, ...rest } = props;
            void node;
            return <li className={theme.li} style={getStyle("li")} {...rest} />;
          },
          a: (props) => {
            const { node, ...rest } = props;
            void node;
            return <a className={theme.a} style={getStyle("a")} {...rest} />;
          },
          hr: () => <div className="my-4 border-t border-dashed border-slate-200" />,
          img: (props) => {
            const { node, alt, ...rest } = props;
            void node;
            const safeSrc = allowResumeImageUrl(String(rest.src ?? ""));
            if (!safeSrc) return null;
            return (
              <img
                {...rest}
                src={safeSrc}
                alt={alt ?? "template asset"}
                className="my-2 max-h-36 w-auto max-w-full border border-slate-200 object-cover shadow-sm"
              />
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
