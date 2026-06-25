import { useLayoutEffect } from 'react';

export const useSmartPagination = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    content: string
) => {
    useLayoutEffect(() => {
        // Delay execution to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            if (!containerRef.current) {
                console.warn('useSmartPagination: containerRef.current is null');
                return;
            }

            const container = containerRef.current;
            // 297mm at 96 DPI (1mm = 3.7795px)
            const PAGE_HEIGHT_PX = 1122.5;
            const PAGINATION_BAR_HEIGHT_PX = 40; // Height of gray pagination bar
            const SAFE_ZONE_PX = 60; // Extra buffer to ensure content doesn't touch pagination area

            // Danger zones where pagination bars exist
            const getDangerZones = () => {
                const zones = [];
                for (let i = 1; i <= 10; i++) { // Support up to 10 pages
                    const pageBreakCenter = i * PAGE_HEIGHT_PX;
                    zones.push({
                        start: pageBreakCenter - PAGINATION_BAR_HEIGHT_PX / 2 - SAFE_ZONE_PX,
                        end: pageBreakCenter + PAGINATION_BAR_HEIGHT_PX / 2 + SAFE_ZONE_PX
                    });
                }
                return zones;
            };

            const dangerZones = getDangerZones();

            // Get all direct children of the markdown container
            const elements = Array.from(container.children) as HTMLElement[];

            if (elements.length === 0) {
                console.warn('useSmartPagination: No elements found in container');
                return;
            }

            // Reset all margins first
            elements.forEach(el => {
                el.style.marginTop = '';
                el.style.paddingTop = '';
            });

            // Iteratively adjust elements to avoid danger zones
            // We need multiple passes because adjusting one element affects positions of subsequent ones
            const maxIterations = 15;
            let iteration = 0;
            let hasOverlap = true;

            while (hasOverlap && iteration < maxIterations) {
                hasOverlap = false;
                iteration++;

                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i];

                    // Get position relative to the container's parent (the white paper container)
                    const rect = el.getBoundingClientRect();
                    const parentContainer = container.parentElement;
                    if (!parentContainer) continue;

                    const parentRect = parentContainer.getBoundingClientRect();
                    const relativeTop = rect.top - parentRect.top;
                    const height = rect.height;
                    const relativeBottom = relativeTop + height;

                    // Check if this element overlaps with any danger zone
                    for (const zone of dangerZones) {
                        if (relativeTop < zone.end && relativeBottom > zone.start) {
                            // Found overlap
                            hasOverlap = true;

                            // Calculate current margin
                            const currentMargin = parseFloat(el.style.marginTop) || 0;

                            // Push element to after the danger zone
                            const pushDownAmount = zone.end - relativeTop;
                            el.style.marginTop = `${currentMargin + pushDownAmount}px`;

                            break; // Move to next element after first adjustment
                        }
                    }
                }
            }

        }, 200); // 200ms delay to ensure rendering is complete

        return () => clearTimeout(timer);
    }, [containerRef, content]); // Re-run when content changes
};
