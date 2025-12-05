import { Router, Request, Response } from 'express';
import { HealthResponse } from '../types/api.js';
import { supabase } from '../lib/supabaseClient.js';
import { storage } from '../lib/storage.js';

const router = Router();
const startTime = Date.now();

router.get('/', async (_req: Request, res: Response) => {
    const [dbHealth, storageHealth] = await Promise.all([
        supabase.checkHealth(),
        storage.checkHealth(),
    ]);

    const response: HealthResponse = {
        status: dbHealth && storageHealth ? 'ok' : 'error',
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        services: {
            database: dbHealth,
            storage: storageHealth,
        },
    };

    const statusCode = response.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(response);
});

export default router;
