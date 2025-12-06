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
        // Status is OK if API is running. DB failure is just a partial degradation.
        status: dbHealth ? 'ok' : 'degraded',
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        services: {
            database: dbHealth,
            storage: storageHealth,
        },
    };

    // Always return 200 so the frontend can display the partial status
    res.status(200).json(response);
});

export default router;
