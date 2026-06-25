"use client";

import { useEffect, useRef, useState } from "react";
import { MiniResumePreview } from "@/components/ui/MiniResumePreview";
import type { TemplateKey } from "@/store/demoData";
import type { ThemeKey } from "@/styles/themes";

const A4_WIDTH_PX = 793.7008;

export function ScaledResumePreview({
  templateKey,
  themeKey,
}: {
  templateKey: TemplateKey;
  themeKey: ThemeKey;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      setScale(container.clientWidth / A4_WIDTH_PX);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative aspect-[210/297] w-full overflow-hidden bg-white">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        <MiniResumePreview templateKey={templateKey} themeKey={themeKey} />
      </div>
    </div>
  );
}
