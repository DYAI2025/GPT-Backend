import {
  TemplateListItem,
  TemplateRenderRequest,
  TemplateRenderResponse,
  OutputFormat,
} from '../types/api.js';
import { storage } from '../lib/storage.js';
import { logger } from '../lib/logger.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template Registry (file-based MVP)
const TEMPLATES: TemplateListItem[] = [
  {
    id: 'magazin-cover',
    name: 'Magazin Cover',
    type: 'page',
    description: 'A professional magazine-style cover page',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Main title' },
      { name: 'subtitle', type: 'string', required: false, description: 'Subtitle' },
      { name: 'author', type: 'string', required: false, description: 'Author name' },
      { name: 'date', type: 'string', required: false, description: 'Publication date' },
      { name: 'imageUrl', type: 'string', required: false, description: 'Cover image URL' },
    ],
  },
  {
    id: 'report-header',
    name: 'Report Header',
    type: 'header',
    description: 'Professional report header section',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Report title' },
      { name: 'company', type: 'string', required: false, description: 'Company name' },
      { name: 'date', type: 'string', required: false, description: 'Report date' },
      { name: 'version', type: 'string', required: false, description: 'Version number' },
    ],
  },
  {
    id: 'data-card',
    name: 'Data Card',
    type: 'component',
    description: 'Visual data display card',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Card title' },
      { name: 'value', type: 'string', required: true, description: 'Primary value' },
      { name: 'subtitle', type: 'string', required: false, description: 'Description' },
      { name: 'trend', type: 'string', required: false, description: 'up/down/neutral' },
      { name: 'color', type: 'string', required: false, description: 'Accent color' },
    ],
  },
  // === PINTEREST TEMPLATES ===
  {
    id: 'pinterest-quote',
    name: 'Pinterest Quote Pin',
    type: 'pinterest',
    description: 'Standard Pinterest Pin (1000x1500, 2:3) for inspirational quotes',
    fields: [
      { name: 'quote', type: 'string', required: true, description: 'The main quote text' },
      { name: 'author', type: 'string', required: false, description: 'Quote author' },
      { name: 'brandName', type: 'string', required: false, description: 'Your brand name' },
      { name: 'brandUrl', type: 'string', required: false, description: 'Website URL' },
      { name: 'backgroundColor', type: 'string', required: false, description: 'Background color (hex)' },
      { name: 'accentColor', type: 'string', required: false, description: 'Accent color (hex)' },
      { name: 'imageUrl', type: 'string', required: false, description: 'Background image URL' },
    ],
  },
  {
    id: 'pinterest-tips',
    name: 'Pinterest Tips Pin',
    type: 'pinterest',
    description: 'Standard Pinterest Pin (1000x1500, 2:3) for tips and tricks',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Main title (e.g., "5 Tips for...")' },
      { name: 'tips', type: 'string[]', required: true, description: 'Array of tip texts (3-5 recommended)' },
      { name: 'brandName', type: 'string', required: false, description: 'Your brand name' },
      { name: 'category', type: 'string', required: false, description: 'Category tag' },
      { name: 'backgroundColor', type: 'string', required: false, description: 'Background color' },
      { name: 'accentColor', type: 'string', required: false, description: 'Accent color' },
    ],
  },
  {
    id: 'pinterest-infographic',
    name: 'Pinterest Infographic',
    type: 'pinterest',
    description: 'Long Pinterest Pin (1000x2100, 1:2.1) for infographics',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Infographic title' },
      { name: 'subtitle', type: 'string', required: false, description: 'Subtitle' },
      { name: 'sections', type: 'object[]', required: true, description: 'Array of {icon, title, description}' },
      { name: 'brandName', type: 'string', required: false, description: 'Your brand name' },
      { name: 'cta', type: 'string', required: false, description: 'Call to action text' },
      { name: 'backgroundColor', type: 'string', required: false, description: 'Background color' },
    ],
  },
  {
    id: 'pinterest-recipe',
    name: 'Pinterest Recipe Pin',
    type: 'pinterest',
    description: 'Long Pinterest Pin (1000x2100, 1:2.1) for recipes',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Recipe name' },
      { name: 'imageUrl', type: 'string', required: false, description: 'Food image URL' },
      { name: 'prepTime', type: 'string', required: false, description: 'Preparation time' },
      { name: 'cookTime', type: 'string', required: false, description: 'Cooking time' },
      { name: 'servings', type: 'string', required: false, description: 'Number of servings' },
      { name: 'ingredients', type: 'string[]', required: true, description: 'List of ingredients' },
      { name: 'steps', type: 'string[]', required: false, description: 'Cooking steps' },
      { name: 'brandName', type: 'string', required: false, description: 'Your brand/blog name' },
    ],
  },
  {
    id: 'pinterest-product',
    name: 'Pinterest Product Pin',
    type: 'pinterest',
    description: 'Standard Pinterest Pin (1000x1500, 2:3) for products',
    fields: [
      { name: 'productName', type: 'string', required: true, description: 'Product name' },
      { name: 'price', type: 'string', required: false, description: 'Product price' },
      { name: 'originalPrice', type: 'string', required: false, description: 'Original price (for sales)' },
      { name: 'imageUrl', type: 'string', required: true, description: 'Product image URL' },
      { name: 'features', type: 'string[]', required: false, description: 'Key features/benefits' },
      { name: 'cta', type: 'string', required: false, description: 'Call to action (e.g., "Shop Now")' },
      { name: 'brandName', type: 'string', required: false, description: 'Brand name' },
      { name: 'badge', type: 'string', required: false, description: 'Badge text (e.g., "SALE", "NEW")' },
    ],
  },
  {
    id: 'pinterest-checklist',
    name: 'Pinterest Checklist Pin',
    type: 'pinterest',
    description: 'Story Pin format (1080x1920, 9:16) for checklists',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Checklist title' },
      { name: 'items', type: 'string[]', required: true, description: 'Checklist items' },
      { name: 'brandName', type: 'string', required: false, description: 'Your brand name' },
      { name: 'category', type: 'string', required: false, description: 'Category tag' },
      { name: 'cta', type: 'string', required: false, description: 'Call to action' },
      { name: 'backgroundColor', type: 'string', required: false, description: 'Background color' },
      { name: 'accentColor', type: 'string', required: false, description: 'Accent color' },
    ],
  },
  {
    id: 'pinterest-story',
    name: 'Pinterest Story / Idea Pin',
    type: 'pinterest',
    description: 'Pinterest Story/Idea Pin format (1080x1920, 9:16) - elegant floral style',
    fields: [
      { name: 'title', type: 'string', required: true, description: 'Main headline text' },
      { name: 'subtitle', type: 'string', required: false, description: 'Subtitle or tagline' },
      { name: 'bodyText', type: 'string', required: false, description: 'Main body content' },
      { name: 'bulletPoints', type: 'string[]', required: false, description: 'List of bullet points' },
      { name: 'brandName', type: 'string', required: false, description: 'Brand name at bottom' },
      { name: 'brandLogo', type: 'string', required: false, description: 'Brand logo URL' },
      { name: 'cta', type: 'string', required: false, description: 'Call to action button text' },
      { name: 'ctaUrl', type: 'string', required: false, description: 'CTA link URL' },
      { name: 'backgroundImageUrl', type: 'string', required: false, description: 'Background image URL' },
      { name: 'style', type: 'string', required: false, description: 'Style preset: elegant, modern, bold, minimal' },
      { name: 'primaryColor', type: 'string', required: false, description: 'Primary accent color' },
      { name: 'secondaryColor', type: 'string', required: false, description: 'Secondary color' },
      { name: 'month', type: 'string', required: false, description: 'Month name (for seasonal content)' },
      { name: 'year', type: 'string', required: false, description: 'Year (for seasonal content)' },
    ],
  },
];

// Get all templates
export function listTemplates(): TemplateListItem[] {
  return TEMPLATES;
}

// Get single template
export function getTemplate(templateId: string): TemplateListItem | undefined {
  return TEMPLATES.find((t) => t.id === templateId);
}

// Render template to HTML
export async function renderTemplate(
  request: TemplateRenderRequest
): Promise<TemplateRenderResponse> {
  // Validate request
  if (!request.templateId) {
    throw new ValidationError('templateId is required');
  }
  if (!request.data) {
    throw new ValidationError('data object is required');
  }

  const template = getTemplate(request.templateId);
  if (!template) {
    throw new NotFoundError(`Template '${request.templateId}' not found`);
  }

  // Validate required fields
  for (const field of template.fields) {
    if (field.required && !(field.name in request.data)) {
      throw new ValidationError(`Required field '${field.name}' is missing`);
    }
  }

  const output: OutputFormat = request.output || 'html';

  logger.info('Rendering template', {
    templateId: request.templateId,
    output,
  });

  // Render HTML
  const html = renderToHtml(template, request.data);

  let buffer: Buffer;
  let extension: 'html' | 'pdf';

  if (output === 'pdf') {
    // For PDF, we'd use Puppeteer (simplified for now)
    buffer = await renderToPdf(html);
    extension = 'pdf';
  } else {
    buffer = Buffer.from(html, 'utf-8');
    extension = 'html';
  }

  // Upload to storage
  const { publicUrl } = await storage.uploadRender(
    buffer,
    request.templateId,
    extension
  );

  logger.info('Template rendered', {
    templateId: request.templateId,
    output,
    size: buffer.length,
  });

  return {
    downloadUrl: publicUrl,
    output,
  };
}

// Render template to HTML string
function renderToHtml(
  template: TemplateListItem,
  data: Record<string, unknown>
): string {
  // Base styles
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        min-height: 100vh;
        color: #fff;
      }
      .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
      .cover {
        background: linear-gradient(145deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        border-radius: 24px;
        padding: 60px 40px;
        text-align: center;
        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .cover h1 {
        font-size: 3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
      }
      .cover h2 {
        font-size: 1.5rem;
        color: rgba(255,255,255,0.7);
        font-weight: 400;
        margin-bottom: 30px;
      }
      .cover .meta {
        color: rgba(255,255,255,0.5);
        font-size: 0.9rem;
      }
      .cover .meta span { margin: 0 15px; }
      .cover-image {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: 16px;
        margin: 30px 0;
      }
      .report-header {
        background: linear-gradient(135deg, #232526 0%, #414345 100%);
        padding: 40px;
        border-radius: 16px;
        border-left: 4px solid #667eea;
      }
      .report-header h1 { font-size: 2rem; margin-bottom: 10px; }
      .report-header .company { color: #667eea; font-weight: 600; }
      .report-header .meta { color: rgba(255,255,255,0.6); margin-top: 20px; }
      .data-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 30px;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .data-card .title { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
      .data-card .value { 
        font-size: 3rem; 
        font-weight: 800;
        margin: 10px 0;
      }
      .data-card .trend-up { color: #10b981; }
      .data-card .trend-down { color: #ef4444; }
    </style>
  `;

  let content = '';

  switch (template.id) {
    case 'magazin-cover':
      content = `
        <div class="container">
          <div class="cover">
            <h1>${escapeHtml(String(data.title || 'Untitled'))}</h1>
            ${data.subtitle ? `<h2>${escapeHtml(String(data.subtitle))}</h2>` : ''}
            ${data.imageUrl ? `<img class="cover-image" src="${escapeHtml(String(data.imageUrl))}" alt="Cover" />` : ''}
            <div class="meta">
              ${data.author ? `<span>By ${escapeHtml(String(data.author))}</span>` : ''}
              ${data.date ? `<span>${escapeHtml(String(data.date))}</span>` : ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'report-header':
      content = `
        <div class="container">
          <div class="report-header">
            <h1>${escapeHtml(String(data.title || 'Report'))}</h1>
            ${data.company ? `<p class="company">${escapeHtml(String(data.company))}</p>` : ''}
            <div class="meta">
              ${data.date ? `<span>Date: ${escapeHtml(String(data.date))}</span>` : ''}
              ${data.version ? `<span> • Version ${escapeHtml(String(data.version))}</span>` : ''}
            </div>
          </div>
        </div>
      `;
      break;

    case 'data-card':
      const trend = String(data.trend || 'neutral');
      const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : '';
      const color = String(data.color || '#667eea');
      content = `
        <div class="container">
          <div class="data-card">
            <div class="title">${escapeHtml(String(data.title || 'Metric'))}</div>
            <div class="value ${trendClass}" style="color: ${color}">
              ${escapeHtml(String(data.value || '0'))}
            </div>
            ${data.subtitle ? `<div class="title">${escapeHtml(String(data.subtitle))}</div>` : ''}
          </div>
        </div>
      `;
      break;

    // === PINTEREST TEMPLATES ===
    case 'pinterest-quote':
      return renderPinterestQuote(data);

    case 'pinterest-tips':
      return renderPinterestTips(data);

    case 'pinterest-infographic':
      return renderPinterestInfographic(data);

    case 'pinterest-recipe':
      return renderPinterestRecipe(data);

    case 'pinterest-product':
      return renderPinterestProduct(data);

    case 'pinterest-checklist':
      return renderPinterestChecklist(data);

    case 'pinterest-story':
      return renderPinterestStory(data);

    default:
      content = `<div class="container"><p>Unknown template</p></div>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(String(data.title || 'Rendered Template'))}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
      ${styles}
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

// Simple HTML escape
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Render HTML to PDF using Puppeteer
async function renderToPdf(html: string): Promise<Buffer> {
  try {
    // Dynamic import for Puppeteer
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();
    return Buffer.from(pdf);
  } catch (error) {
    logger.error('PDF rendering failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Fallback: return HTML as buffer if PDF fails
    return Buffer.from(html, 'utf-8');
  }
}

// ============================================
// PINTEREST TEMPLATE RENDER FUNCTIONS
// ============================================

// Pinterest Quote Pin (1000x1500, 2:3)
function renderPinterestQuote(data: Record<string, unknown>): string {
  const bgColor = String(data.backgroundColor || '#1a1a2e');
  const accentColor = String(data.accentColor || '#667eea');
  const quote = escapeHtml(String(data.quote || 'Your inspiring quote here'));
  const author = data.author ? escapeHtml(String(data.author)) : null;
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const brandUrl = data.brandUrl ? escapeHtml(String(data.brandUrl)) : null;
  const imageUrl = data.imageUrl ? escapeHtml(String(data.imageUrl)) : null;

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: 'Inter', sans-serif; }
.pin {
  width: 1000px; height: 1500px;
  background: ${imageUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('${imageUrl}')` : `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, 20)} 100%)`};
  background-size: cover; background-position: center;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 80px; text-align: center; position: relative;
}
.quote-marks { font-size: 120px; color: ${accentColor}; opacity: 0.3; line-height: 1; margin-bottom: -40px; }
.quote { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; color: #fff; line-height: 1.4; margin-bottom: 40px; }
.author { font-size: 24px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 3px; }
.author::before { content: '— '; }
.brand { position: absolute; bottom: 60px; left: 0; right: 0; text-align: center; }
.brand-name { font-size: 20px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 2px; }
.brand-url { font-size: 16px; color: rgba(255,255,255,0.5); margin-top: 8px; }
.accent-line { width: 80px; height: 4px; background: ${accentColor}; margin: 30px auto; }
</style></head>
<body><div class="pin">
  <div class="quote-marks">"</div>
  <p class="quote">${quote}</p>
  <div class="accent-line"></div>
  ${author ? `<p class="author">${author}</p>` : ''}
  ${brandName ? `<div class="brand"><div class="brand-name">${brandName}</div>${brandUrl ? `<div class="brand-url">${brandUrl}</div>` : ''}</div>` : ''}
</div></body></html>`;
}

// Pinterest Tips Pin (1000x1500, 2:3)
function renderPinterestTips(data: Record<string, unknown>): string {
  const bgColor = String(data.backgroundColor || '#0f172a');
  const accentColor = String(data.accentColor || '#f59e0b');
  const title = escapeHtml(String(data.title || '5 Essential Tips'));
  const tips = Array.isArray(data.tips) ? data.tips.map(t => escapeHtml(String(t))) : ['Tip 1', 'Tip 2', 'Tip 3'];
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const category = data.category ? escapeHtml(String(data.category)) : null;

  const tipsHtml = tips.map((tip, i) => `
    <div class="tip">
      <div class="tip-number">${i + 1}</div>
      <div class="tip-text">${tip}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: 'Inter', sans-serif; }
.pin {
  width: 1000px; height: 1500px;
  background: linear-gradient(180deg, ${bgColor} 0%, ${adjustColor(bgColor, 15)} 100%);
  padding: 60px; display: flex; flex-direction: column;
}
.category { font-size: 18px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 4px; font-weight: 600; margin-bottom: 20px; }
.title { font-size: 56px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 50px; }
.tips { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.tip { display: flex; align-items: flex-start; gap: 24px; padding: 28px; background: rgba(255,255,255,0.05); border-radius: 16px; border-left: 4px solid ${accentColor}; }
.tip-number { width: 50px; height: 50px; background: ${accentColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: ${bgColor}; flex-shrink: 0; }
.tip-text { font-size: 24px; color: rgba(255,255,255,0.9); line-height: 1.5; }
.brand { margin-top: auto; padding-top: 40px; text-align: center; font-size: 18px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 2px; }
</style></head>
<body><div class="pin">
  ${category ? `<div class="category">${category}</div>` : ''}
  <h1 class="title">${title}</h1>
  <div class="tips">${tipsHtml}</div>
  ${brandName ? `<div class="brand">${brandName}</div>` : ''}
</div></body></html>`;
}

// Pinterest Infographic (1000x2100, 1:2.1)
function renderPinterestInfographic(data: Record<string, unknown>): string {
  const bgColor = String(data.backgroundColor || '#1e293b');
  const title = escapeHtml(String(data.title || 'Infographic Title'));
  const subtitle = data.subtitle ? escapeHtml(String(data.subtitle)) : null;
  const sections = Array.isArray(data.sections) ? data.sections : [
    { icon: '📊', title: 'Section 1', description: 'Description here' },
    { icon: '📈', title: 'Section 2', description: 'Description here' },
    { icon: '🎯', title: 'Section 3', description: 'Description here' },
  ];
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const cta = data.cta ? escapeHtml(String(data.cta)) : null;

  const sectionsHtml = sections.map((s: any, i: number) => `
    <div class="section">
      <div class="section-icon">${s.icon || '📌'}</div>
      <div class="section-content">
        <h3 class="section-title">${escapeHtml(String(s.title || `Section ${i + 1}`))}</h3>
        <p class="section-desc">${escapeHtml(String(s.description || ''))}</p>
      </div>
    </div>
  `).join('<div class="connector"></div>');

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 2100px; font-family: 'Inter', sans-serif; }
.pin {
  width: 1000px; height: 2100px;
  background: linear-gradient(180deg, ${bgColor} 0%, ${adjustColor(bgColor, 20)} 100%);
  padding: 80px; display: flex; flex-direction: column;
}
.header { text-align: center; margin-bottom: 60px; }
.title { font-size: 56px; font-weight: 800; color: #fff; margin-bottom: 16px; }
.subtitle { font-size: 24px; color: rgba(255,255,255,0.6); }
.sections { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.section { display: flex; gap: 30px; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 20px; }
.section-icon { font-size: 48px; width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 20px; display: flex; align-items: center; justify-content: center; }
.section-title { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px; }
.section-desc { font-size: 20px; color: rgba(255,255,255,0.7); line-height: 1.5; }
.connector { width: 4px; height: 40px; background: linear-gradient(180deg, #667eea, #764ba2); margin-left: 38px; border-radius: 2px; }
.footer { margin-top: 60px; text-align: center; }
.cta { display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50px; font-size: 22px; font-weight: 700; color: #fff; }
.brand { margin-top: 30px; font-size: 18px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 3px; }
</style></head>
<body><div class="pin">
  <div class="header">
    <h1 class="title">${title}</h1>
    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
  </div>
  <div class="sections">${sectionsHtml}</div>
  <div class="footer">
    ${cta ? `<div class="cta">${cta}</div>` : ''}
    ${brandName ? `<div class="brand">${brandName}</div>` : ''}
  </div>
</div></body></html>`;
}

// Pinterest Recipe Pin (1000x2100, 1:2.1)
function renderPinterestRecipe(data: Record<string, unknown>): string {
  const title = escapeHtml(String(data.title || 'Delicious Recipe'));
  const imageUrl = data.imageUrl ? escapeHtml(String(data.imageUrl)) : null;
  const prepTime = data.prepTime ? escapeHtml(String(data.prepTime)) : null;
  const cookTime = data.cookTime ? escapeHtml(String(data.cookTime)) : null;
  const servings = data.servings ? escapeHtml(String(data.servings)) : null;
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients.map(i => escapeHtml(String(i))) : ['Ingredient 1', 'Ingredient 2'];
  const steps = Array.isArray(data.steps) ? data.steps.map(s => escapeHtml(String(s))) : [];
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;

  const ingredientsHtml = ingredients.map(ing => `<li>${ing}</li>`).join('');
  const stepsHtml = steps.map((step, i) => `<li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('');

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 2100px; font-family: 'Inter', sans-serif; }
.pin { width: 1000px; height: 2100px; background: #fff; }
.image-section { height: 500px; background: ${imageUrl ? `url('${imageUrl}')` : 'linear-gradient(135deg, #ff6b6b, #feca57)'}; background-size: cover; background-position: center; position: relative; }
.image-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); }
.title { font-family: 'Playfair Display', serif; font-size: 48px; color: #fff; }
.content { padding: 50px; }
.meta { display: flex; gap: 40px; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #eee; }
.meta-item { text-align: center; }
.meta-icon { font-size: 32px; margin-bottom: 8px; }
.meta-label { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
.meta-value { font-size: 20px; font-weight: 600; color: #333; }
.section-title { font-size: 28px; font-weight: 700; color: #333; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
.section-title::before { content: ''; width: 6px; height: 30px; background: linear-gradient(180deg, #ff6b6b, #feca57); border-radius: 3px; }
.ingredients { margin-bottom: 40px; }
.ingredients ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ingredients li { font-size: 20px; color: #555; padding-left: 30px; position: relative; }
.ingredients li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: bold; }
.steps ul { list-style: none; }
.steps li { font-size: 20px; color: #555; margin-bottom: 20px; padding-left: 10px; line-height: 1.6; }
.steps li strong { color: #ff6b6b; }
.brand { margin-top: 40px; padding-top: 30px; border-top: 2px solid #eee; text-align: center; font-size: 18px; color: #888; }
</style></head>
<body><div class="pin">
  <div class="image-section">
    <div class="image-overlay"><h1 class="title">${title}</h1></div>
  </div>
  <div class="content">
    <div class="meta">
      ${prepTime ? `<div class="meta-item"><div class="meta-icon">⏱️</div><div class="meta-label">Prep</div><div class="meta-value">${prepTime}</div></div>` : ''}
      ${cookTime ? `<div class="meta-item"><div class="meta-icon">🍳</div><div class="meta-label">Cook</div><div class="meta-value">${cookTime}</div></div>` : ''}
      ${servings ? `<div class="meta-item"><div class="meta-icon">👥</div><div class="meta-label">Servings</div><div class="meta-value">${servings}</div></div>` : ''}
    </div>
    <div class="ingredients">
      <h2 class="section-title">Ingredients</h2>
      <ul>${ingredientsHtml}</ul>
    </div>
    ${steps.length > 0 ? `<div class="steps"><h2 class="section-title">Instructions</h2><ul>${stepsHtml}</ul></div>` : ''}
    ${brandName ? `<div class="brand">📍 ${brandName}</div>` : ''}
  </div>
</div></body></html>`;
}

// Pinterest Product Pin (1000x1500, 2:3)
function renderPinterestProduct(data: Record<string, unknown>): string {
  const productName = escapeHtml(String(data.productName || 'Amazing Product'));
  const price = data.price ? escapeHtml(String(data.price)) : null;
  const originalPrice = data.originalPrice ? escapeHtml(String(data.originalPrice)) : null;
  const imageUrl = data.imageUrl ? escapeHtml(String(data.imageUrl)) : '';
  const features = Array.isArray(data.features) ? data.features.map(f => escapeHtml(String(f))) : [];
  const cta = data.cta ? escapeHtml(String(data.cta)) : 'Shop Now';
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const badge = data.badge ? escapeHtml(String(data.badge)) : null;

  const featuresHtml = features.map(f => `<li>✨ ${f}</li>`).join('');

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: 'Inter', sans-serif; }
.pin { width: 1000px; height: 1500px; background: #fff; display: flex; flex-direction: column; }
.image-section { height: 750px; background: ${imageUrl ? `url('${imageUrl}')` : '#f8f9fa'}; background-size: contain; background-position: center; background-repeat: no-repeat; position: relative; }
.badge { position: absolute; top: 30px; left: 30px; padding: 12px 24px; background: #ef4444; color: #fff; font-size: 18px; font-weight: 800; border-radius: 8px; text-transform: uppercase; }
.content { flex: 1; padding: 50px; display: flex; flex-direction: column; }
.brand { font-size: 16px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
.product-name { font-size: 42px; font-weight: 800; color: #1a1a1a; margin-bottom: 20px; line-height: 1.2; }
.pricing { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.price { font-size: 40px; font-weight: 800; color: #10b981; }
.original-price { font-size: 28px; color: #aaa; text-decoration: line-through; }
.features { list-style: none; margin-bottom: 30px; }
.features li { font-size: 20px; color: #555; margin-bottom: 12px; }
.cta { margin-top: auto; padding: 24px; background: linear-gradient(135deg, #1a1a1a, #333); border-radius: 16px; text-align: center; font-size: 24px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
</style></head>
<body><div class="pin">
  <div class="image-section">
    ${badge ? `<div class="badge">${badge}</div>` : ''}
  </div>
  <div class="content">
    ${brandName ? `<div class="brand">${brandName}</div>` : ''}
    <h1 class="product-name">${productName}</h1>
    <div class="pricing">
      ${price ? `<span class="price">${price}</span>` : ''}
      ${originalPrice ? `<span class="original-price">${originalPrice}</span>` : ''}
    </div>
    ${features.length > 0 ? `<ul class="features">${featuresHtml}</ul>` : ''}
    <div class="cta">${cta}</div>
  </div>
</div></body></html>`;
}

// Pinterest Checklist Pin (1080x1920, 9:16)
function renderPinterestChecklist(data: Record<string, unknown>): string {
  const bgColor = String(data.backgroundColor || '#0f172a');
  const accentColor = String(data.accentColor || '#10b981');
  const title = escapeHtml(String(data.title || 'Your Checklist'));
  const items = Array.isArray(data.items) ? data.items.map(i => escapeHtml(String(i))) : ['Item 1', 'Item 2', 'Item 3'];
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const category = data.category ? escapeHtml(String(data.category)) : null;
  const cta = data.cta ? escapeHtml(String(data.cta)) : null;

  const itemsHtml = items.map(item => `
    <div class="item">
      <div class="checkbox"></div>
      <span class="item-text">${item}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; font-family: 'Inter', sans-serif; }
.pin {
  width: 1080px; height: 1920px;
  background: linear-gradient(180deg, ${bgColor} 0%, ${adjustColor(bgColor, 25)} 100%);
  padding: 80px; display: flex; flex-direction: column;
}
.category { font-size: 20px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 4px; font-weight: 600; margin-bottom: 24px; }
.title { font-size: 64px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 60px; }
.items { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.item { display: flex; align-items: center; gap: 24px; padding: 28px 32px; background: rgba(255,255,255,0.05); border-radius: 16px; }
.checkbox { width: 40px; height: 40px; border: 3px solid ${accentColor}; border-radius: 10px; flex-shrink: 0; }
.item-text { font-size: 26px; color: rgba(255,255,255,0.9); line-height: 1.4; }
.footer { margin-top: auto; padding-top: 50px; text-align: center; }
.cta { display: inline-block; padding: 20px 50px; background: ${accentColor}; border-radius: 50px; font-size: 22px; font-weight: 700; color: #fff; }
.brand { margin-top: 30px; font-size: 18px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 3px; }
</style></head>
<body><div class="pin">
  ${category ? `<div class="category">${category}</div>` : ''}
  <h1 class="title">${title}</h1>
  <div class="items">${itemsHtml}</div>
  <div class="footer">
    ${cta ? `<div class="cta">${cta}</div>` : ''}
    ${brandName ? `<div class="brand">${brandName}</div>` : ''}
  </div>
</div></body></html>`;
}

// Helper: Adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// Pinterest Story / Idea Pin (1080x1920, 9:16)
function renderPinterestStory(data: Record<string, unknown>): string {
  const title = escapeHtml(String(data.title || 'Your Title Here'));
  const subtitle = data.subtitle ? escapeHtml(String(data.subtitle)) : null;
  const bodyText = data.bodyText ? escapeHtml(String(data.bodyText)) : null;
  const bulletPoints = Array.isArray(data.bulletPoints) ? data.bulletPoints.map(p => escapeHtml(String(p))) : [];
  const brandName = data.brandName ? escapeHtml(String(data.brandName)) : null;
  const brandLogo = data.brandLogo ? escapeHtml(String(data.brandLogo)) : null;
  const cta = data.cta ? escapeHtml(String(data.cta)) : null;
  const backgroundImageUrl = data.backgroundImageUrl ? escapeHtml(String(data.backgroundImageUrl)) : null;
  const style = String(data.style || 'elegant');
  const primaryColor = String(data.primaryColor || '#d4a574');
  const secondaryColor = String(data.secondaryColor || '#f5ebe0');
  const month = data.month ? escapeHtml(String(data.month)) : null;
  const year = data.year ? escapeHtml(String(data.year)) : null;

  // Style presets
  const styles: Record<string, { bg: string; text: string; accent: string; font: string }> = {
    elegant: {
      bg: 'linear-gradient(180deg, #f5ebe0 0%, #e8ddd0 50%, #d4c4b0 100%)',
      text: '#5c4033',
      accent: '#d4a574',
      font: "'Playfair Display', serif"
    },
    modern: {
      bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      text: '#ffffff',
      accent: '#667eea',
      font: "'Inter', sans-serif"
    },
    bold: {
      bg: 'linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 100%)',
      text: '#ffffff',
      accent: '#feca57',
      font: "'Inter', sans-serif"
    },
    minimal: {
      bg: '#ffffff',
      text: '#1a1a1a',
      accent: '#000000',
      font: "'Inter', sans-serif"
    },
    floral: {
      bg: `linear-gradient(180deg, ${secondaryColor} 0%, ${adjustColor(secondaryColor, -10)} 100%)`,
      text: '#5c4033',
      accent: primaryColor,
      font: "'Playfair Display', serif"
    }
  };

  const currentStyle = styles[style] || styles.elegant;

  // Floral decoration SVG pattern
  const floralPattern = `
    <svg class="floral-top" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M200 20 Q220 60 260 40 Q300 20 280 80 Q260 140 200 100 Q140 140 120 80 Q100 20 140 40 Q180 60 200 20" fill="${currentStyle.accent}" opacity="0.3"/>
      <circle cx="50" cy="50" r="30" fill="${currentStyle.accent}" opacity="0.2"/>
      <circle cx="350" cy="60" r="25" fill="${currentStyle.accent}" opacity="0.2"/>
      <path d="M30 120 Q60 80 90 120 Q60 160 30 120" fill="${currentStyle.accent}" opacity="0.25"/>
      <path d="M310 130 Q340 90 370 130 Q340 170 310 130" fill="${currentStyle.accent}" opacity="0.25"/>
    </svg>
  `;

  const floralBottom = `
    <svg class="floral-bottom" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M200 180 Q220 140 260 160 Q300 180 280 120 Q260 60 200 100 Q140 60 120 120 Q100 180 140 160 Q180 140 200 180" fill="${currentStyle.accent}" opacity="0.3"/>
      <circle cx="60" cy="150" r="35" fill="${currentStyle.accent}" opacity="0.2"/>
      <circle cx="340" cy="140" r="28" fill="${currentStyle.accent}" opacity="0.2"/>
    </svg>
  `;

  const bulletHtml = bulletPoints.length > 0 ? `
    <div class="bullets">
      ${bulletPoints.map(point => `<div class="bullet-item"><span class="bullet-dot">✦</span><span>${point}</span></div>`).join('')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; font-family: ${currentStyle.font}; }
.pin {
  width: 1080px; height: 1920px;
  background: ${backgroundImageUrl ? `url('${backgroundImageUrl}')` : currentStyle.bg};
  background-size: cover; background-position: center;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}

/* Floral decorations */
.floral-top { position: absolute; top: 0; left: 0; width: 100%; height: auto; }
.floral-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: auto; transform: rotate(180deg); }

/* Content area */
.content {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 120px 80px; text-align: center;
  position: relative; z-index: 10;
}

/* Month/Year badge */
.date-badge {
  font-family: 'Dancing Script', cursive;
  font-size: 48px; color: ${currentStyle.accent};
  margin-bottom: 40px; letter-spacing: 2px;
}

/* Title */
.title {
  font-size: 72px; font-weight: 700; color: ${currentStyle.text};
  line-height: 1.2; margin-bottom: 30px; max-width: 900px;
}

/* Subtitle */
.subtitle {
  font-size: 32px; color: ${currentStyle.text}; opacity: 0.8;
  margin-bottom: 40px; font-weight: 400; max-width: 800px;
}

/* Decorative line */
.divider {
  width: 120px; height: 3px;
  background: ${currentStyle.accent};
  margin: 30px auto; border-radius: 2px;
}

/* Body text */
.body-text {
  font-size: 28px; color: ${currentStyle.text}; opacity: 0.9;
  line-height: 1.6; max-width: 800px; margin-bottom: 40px;
  font-family: 'Inter', sans-serif; font-weight: 400;
}

/* Bullet points */
.bullets {
  text-align: left; max-width: 700px; margin: 30px auto;
}
.bullet-item {
  display: flex; align-items: flex-start; gap: 16px;
  font-size: 26px; color: ${currentStyle.text};
  margin-bottom: 20px; line-height: 1.5;
  font-family: 'Inter', sans-serif;
}
.bullet-dot { color: ${currentStyle.accent}; font-size: 20px; margin-top: 4px; }

/* CTA Button */
.cta-button {
  display: inline-block; padding: 24px 60px;
  background: ${currentStyle.accent}; color: #fff;
  font-size: 24px; font-weight: 600; border-radius: 50px;
  text-transform: uppercase; letter-spacing: 3px;
  margin-top: 40px; font-family: 'Inter', sans-serif;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

/* Brand footer */
.brand-footer {
  position: absolute; bottom: 60px; left: 0; right: 0;
  text-align: center; z-index: 10;
}
.brand-logo { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 16px; object-fit: cover; }
.brand-name {
  font-size: 22px; color: ${currentStyle.text}; opacity: 0.7;
  text-transform: uppercase; letter-spacing: 4px;
  font-family: 'Inter', sans-serif; font-weight: 500;
}

/* Background overlay for images */
${backgroundImageUrl ? `.pin::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.85) 100%);
  z-index: 1;
}` : ''}
</style></head>
<body><div class="pin">
  ${style === 'elegant' || style === 'floral' ? floralPattern : ''}
  
  <div class="content">
    ${month || year ? `<div class="date-badge">${month || ''} ${year || ''}</div>` : ''}
    <h1 class="title">${title}</h1>
    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    <div class="divider"></div>
    ${bodyText ? `<p class="body-text">${bodyText}</p>` : ''}
    ${bulletHtml}
    ${cta ? `<div class="cta-button">${cta}</div>` : ''}
  </div>
  
  ${style === 'elegant' || style === 'floral' ? floralBottom : ''}
  
  ${brandName || brandLogo ? `
  <div class="brand-footer">
    ${brandLogo ? `<img src="${brandLogo}" class="brand-logo" alt="Logo" />` : ''}
    ${brandName ? `<div class="brand-name">${brandName}</div>` : ''}
  </div>
  ` : ''}
</div></body></html>`;
}

