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

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ALLOW_ORIGINS || '*',
}));
app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.requestLog(req.method, req.path, res.statusCode, duration);
    });
    next();
});

// Routes
app.use('/health', healthRouter);
app.use('/zip-bundles', zipRouter);
app.use('/templates', templatesRouter);
app.use('/memory', memoryRouter);

// Static file serving for local storage mode
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';
app.use('/files', express.static(LOCAL_STORAGE_PATH));

// API Info
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'GPT Modular Backend',
        version: '1.0.0',
        description: 'Backend service for Custom GPT Actions - ZIP, Templates, Memory',
        endpoints: {
            health: 'GET /health',
            zipBundles: 'POST /zip-bundles',
            templates: 'GET /templates',
            templateRender: 'POST /templates/render',
            memoryUpsert: 'POST /memory/upsert',
            memoryQuery: 'POST /memory/query',
        },
        documentation: '/docs',
    });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
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

export default app;
