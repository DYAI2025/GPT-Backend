import { Router, Request, Response } from 'express';
import { renderSvgFromSpec } from '../lib/renderSvgFromSpec.js';
import { renderPdfFromSpec } from '../lib/renderPdfFromSpec.js';
import { validateSpec } from '../lib/validateSpec.js';

const router = Router();

// POST /canva/convert
// Body: { spec: object, output: "svg" | "pdf" }
router.post('/convert', async (req: Request, res: Response) => {
    try {
        const { spec, output = "svg" } = req.body;

        if (!spec) {
            res.status(400).json({ error: "Missing spec payload" });
            return;
        }

        const validation = validateSpec(spec);
        if (!validation.valid) {
            res.status(400).json({ error: "Invalid spec", details: validation.errors });
            return;
        }

        if (output === "pdf") {
            const pdfBuffer = await renderPdfFromSpec(spec);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="design-spec.pdf"');
            res.send(pdfBuffer);
        } else {
            const svgString = await renderSvgFromSpec(spec);
            res.setHeader("Content-Type", "image/svg+xml");
            res.setHeader("Content-Disposition", 'attachment; filename="design.svg"');
            res.send(svgString);
        }
    } catch (err) {
        console.error('Convert Error:', err);
        res.status(500).json({ error: "Render failed", details: String(err) });
    }
});

// POST /canva/preview
// Body: { spec: object, theme: "light"|"dark" }
// Returns: HTML Page
router.post('/preview', async (req: Request, res: Response) => {
    try {
        const { spec, theme = "light" } = req.body;

        if (!spec) {
            res.status(400).send("<h1>Error: Missing spec JSON</h1>");
            return;
        }

        // Validate but allow preview even if slightly invalid (DX friendly)
        const svg = await renderSvgFromSpec(spec);

        const isDark = theme === "dark";
        const bgColor = isDark ? "#111" : "#f8f8f8";
        const textColor = isDark ? "#fff" : "#333";

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Canva Spec Preview</title>
  <style>
    body { margin:0; background:${bgColor}; color:${textColor}; display:flex; flexDirection:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
    .container { margin-top: 20px; text-align: center; }
    iframe { width:600px; height:600px; border:none; box-shadow:0 10px 30px rgba(0,0,0,0.3); background:white; border-radius: 8px; }
    .controls { position:fixed; top:1rem; right:1rem; display:flex; gap:10px; }
    button { background:transparent; border:1px solid ${textColor}; color:${textColor}; padding:8px 16px; cursor:pointer; border-radius:4px; font-weight:bold; }
    button:hover { background:rgba(128,128,128,0.2); }
  </style>
</head>
<body>
  <div class="controls">
     <!-- Form to toggle theme via pure POST -->
     <form method="POST" action="/canva/preview" style="display:inline;">
        <input type="hidden" name="theme" value="${isDark ? "light" : "dark"}">
        <textarea name="spec" style="display:none;">${JSON.stringify(spec)}</textarea>
        <button type="submit">Toggle ${isDark ? "Light" : "Dark"} Mode</button>
     </form>
  </div>

  <div class="container">
    <h1>Design Preview</h1>
    <p>Brand: <strong>${spec.metadata?.brand || 'None'}</strong></p>
    
    <!-- Render SVG directly encoded to avoid iframe flicker issues or external calls -->
    <div style="background:white; padding:20px; display:inline-block; border-radius:8px;">
        ${svg}
    </div>
  </div>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html");
        res.send(html);

    } catch (err) {
        res.status(500).send(`<h1>Render Error</h1><pre>${String(err)}</pre>`);
    }
});

export default router;
