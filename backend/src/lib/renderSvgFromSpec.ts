import { createSVGWindow } from 'svgdom';
import { SVG, registerWindow } from '@svgdotjs/svg.js';

export async function renderSvgFromSpec(spec: any): Promise<string> {
    // 1. Create a virtual DOM window
    const window = createSVGWindow();
    const document = window.document;

    // 2. Register this window with svg.js
    registerWindow(window, document);

    // 3. Create Canvas
    const width = 1080;
    const height = 1080;
    const canvas = SVG(document.documentElement).size(width, height);

    // Background
    const bg = spec.metadata?.brand_colors?.[2] || "#FFFFFF";
    const primary = spec.metadata?.brand_colors?.[0] || "#000000";
    const font = spec.metadata?.brand_fonts?.[0] || "Arial"; // Fallback to safe font

    canvas.rect(width, height).fill(bg);

    // 4. Render Elements
    let y = 120;
    if (spec.pages && Array.isArray(spec.pages)) {
        for (const page of spec.pages) {
            if (page.elements) {
                for (const el of page.elements) {
                    if (el.kind === "text") {
                        canvas.text(el.id || "Text")
                            .font({ family: font, size: 36, fill: primary })
                            .move(80, y);
                        y += 60;
                    } else if (el.kind === "image_placeholder") {
                        canvas.rect(420, 240)
                            .move(80, y)
                            .fill("#ddd")
                            .stroke({ width: 1, color: "#888" });

                        canvas.text("IMAGE: " + (el.id || "Placeholder"))
                            .font({ size: 20, fill: "#666" })
                            .move(200, y + 100);

                        y += 280;
                    }
                }
            }
        }
    }

    // 5. Footer / Metadata
    canvas.text(`Brand: ${spec.metadata?.brand || "—"} • v${spec.version || "1.0"}`)
        .font({ size: 14, fill: "#555" })
        .move(40, height - 30);

    // Return the SVG string
    return canvas.svg();
}
