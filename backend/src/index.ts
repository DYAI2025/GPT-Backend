import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import healthRouter from './routes/health.js';
import zipRouter from './routes/zip.js';
import templatesRouter from './routes/templates.js';
import memoryRouter from './routes/memory.js';
import canvaRouter from './routes/canva.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (Order is critical!)

// 1. CORS - The most common GPT failure point
// Explicitly handle OPTIONS preflight
app.use((req, res, next) => {
    // Allow any origin (for GPT Actions) or restrict via env
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGINS || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight immediately
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Also use cors package as fallback/helper
app.use(cors({
    origin: process.env.CORS_ALLOW_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. Request Logging (Debug Mode)
// Log raw request details to help debug GPT payload issues
app.use((req, res, next) => {
    logger.info(`👉 ${req.method} ${req.url}`);
    // Log headers mostly for Auth debugging
    // logger.debug('Headers:', req.headers); 
    next();
});

// 3. Body Parsing with Error Handling
// Use a larger limit for images/files
app.use(express.json({ limit: '50mb' }));

// Catch JSON syntax errors (e.g. malformed JSON from GPT)
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        logger.error('❌ Malformed JSON received', { error: err.message });
        return res.status(400).json({
            error: {
                code: 'BAD_REQUEST',
                message: 'Invalid JSON format in request body'
            }
        });
    }
    next();
});

// 4. Detailed Body Logging (after parsing)
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        // Deep clone to avoid mutating original body if we redact
        const logBody = JSON.parse(JSON.stringify(req.body));

        // Truncate long strings (like base64 images) for logs
        const truncate = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].length > 500) {
                    obj[key] = `[String length: ${obj[key].length} - truncated]`;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    truncate(obj[key]);
                }
            }
        };
        truncate(logBody);

        logger.info('📦 Request Body:', logBody);
    }
    next();
});

// Standard Request Timer
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.requestLog(req.method, req.path, res.statusCode, duration);
    });
    next();
});

// Debug / Test Endpoint
app.post('/test', (req: Request, res: Response) => {
    logger.info('🧪 Test Ping received');
    return res.json({
        status: 'ok',
        message: 'Connectivity verified',
        timestamp: new Date().toISOString(),
        receivedHeaders: {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Present (Redacted)' : 'Missing',
            'user-agent': req.headers['user-agent']
        },
        receivedBody: req.body
    });
});

// Routes
app.use('/health', healthRouter);
app.use('/zip-bundles', zipRouter);
app.use('/templates', templatesRouter);
app.use('/memory', memoryRouter);
app.use('/canva', canvaRouter);

// Serve static frontend files (Privacy Policy, Terms, etc.)
// Adjust path relative to 'dist' or 'src' depending on run context
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming structure: /backend/dist/index.js -> /backend/frontend/
const frontendPath = path.join(__dirname, '../../frontend');

app.use(express.static(frontendPath));

// ... (lines 43-48)

app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'GPT Modular Backend',
        version: '1.2.0',
        description: 'Backend service for Custom GPT Actions - ZIP, Templates, Memory, Canva Converter',
        endpoints: {
            health: 'GET /health',
            zipBundles: 'POST /zip-bundles',
            templates: 'GET /templates',
            templateRender: 'POST /templates/render',
            memoryUpsert: 'POST /memory/upsert',
            memoryQuery: 'POST /memory/query',
            canvaConvert: 'POST /canva/convert',
            canvaPreview: 'POST /canva/preview',
        },
        documentation: '/docs',
        privacy: 'https://dyai2025.github.io/GPT-Backend/privacy.html',
        terms: 'https://dyai2025.github.io/GPT-Backend/terms.html',
    });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if not running on Vercel
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${PORT}`);
        logger.info('Available endpoints:', {
            health: `GET http://localhost:${PORT}/health`,
            zipBundles: `POST http://localhost:${PORT}/zip-bundles`,
            templates: `GET http://localhost:${PORT}/templates`,
            templateRender: `POST http://localhost:${PORT}/templates/render`,
            memoryUpsert: `POST http://localhost:${PORT}/memory/upsert`,
            memoryQuery: `POST http://localhost:${PORT}/memory/query`,
        });
    });
}

// Export for Vercel
export default app;
