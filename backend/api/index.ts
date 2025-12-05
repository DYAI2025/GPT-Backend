import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Simple health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: false,
            storage: false
        }
    });
});

// Template definitions
const TEMPLATES = [
    {
        id: 'pinterest-quote',
        name: 'Pinterest Quote Pin',
        type: 'pinterest',
        description: 'Standard Pinterest Pin (1000x1500, 2:3) for inspirational quotes',
        fields: [
            { name: 'quote', type: 'string', required: true },
            { name: 'author', type: 'string', required: false },
            { name: 'brandName', type: 'string', required: false },
        ]
    },
    {
        id: 'pinterest-tips',
        name: 'Pinterest Tips Pin',
        type: 'pinterest',
        description: 'Standard Pinterest Pin (1000x1500, 2:3) for tips and tricks',
        fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'tips', type: 'array', required: true },
        ]
    },
    {
        id: 'pinterest-story',
        name: 'Pinterest Story / Idea Pin',
        type: 'pinterest',
        description: 'Pinterest Story/Idea Pin format (1080x1920, 9:16)',
        fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'subtitle', type: 'string', required: false },
            { name: 'month', type: 'string', required: false },
        ]
    }
];

// List templates
app.get('/templates', (_req: Request, res: Response) => {
    res.json(TEMPLATES);
});

// Render template (simplified - returns HTML string)
app.post('/templates/render', (req: Request, res: Response) => {
    const { templateId, data } = req.body;

    if (!templateId || !data) {
        return res.status(400).json({ error: 'templateId and data required' });
    }

    // Simple HTML rendering based on template
    let html = '';

    if (templateId === 'pinterest-quote') {
        html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
body { margin: 0; width: 1000px; height: 1500px; }
.pin { width: 1000px; height: 1500px; background: linear-gradient(135deg, #1a1a2e, #302b63); 
  display: flex; flex-direction: column; justify-content: center; align-items: center; 
  padding: 80px; text-align: center; font-family: 'Playfair Display', serif; }
.quote { font-size: 52px; color: #fff; line-height: 1.4; margin-bottom: 40px; }
.author { font-size: 24px; color: rgba(255,255,255,0.7); }
</style></head>
<body><div class="pin">
  <p class="quote">"${data.quote || ''}"</p>
  ${data.author ? `<p class="author">— ${data.author}</p>` : ''}
</div></body></html>`;
    } else if (templateId === 'pinterest-story') {
        html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Dancing+Script&display=swap" rel="stylesheet">
<style>
body { margin: 0; width: 1080px; height: 1920px; }
.pin { width: 1080px; height: 1920px; background: linear-gradient(180deg, #f5ebe0, #d4c4b0);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 80px; text-align: center; }
.date { font-family: 'Dancing Script', cursive; font-size: 48px; color: #d4a574; margin-bottom: 40px; }
.title { font-family: 'Playfair Display', serif; font-size: 72px; color: #5c4033; margin-bottom: 20px; }
.subtitle { font-size: 28px; color: #5c4033; opacity: 0.8; }
</style></head>
<body><div class="pin">
  ${data.month ? `<div class="date">${data.month} ${data.year || ''}</div>` : ''}
  <h1 class="title">${data.title || ''}</h1>
  ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ''}
</div></body></html>`;
    } else {
        return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
        html: html,
        output: 'html',
        message: 'Template rendered successfully. Use the HTML content directly.'
    });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'GPT Modular Backend',
        version: '1.0.0',
        description: 'Backend service for Custom GPT Actions',
        endpoints: {
            health: 'GET /health',
            templates: 'GET /templates',
            templateRender: 'POST /templates/render',
        },
        privacy: 'https://dyai2025.github.io/GPT-Backend/privacy.html'
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
export default app;
