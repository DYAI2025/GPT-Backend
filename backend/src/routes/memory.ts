import { Router, Request, Response, NextFunction } from 'express';
import { MemoryUpsertRequest, MemoryQueryRequest } from '../types/api.js';
import { upsertMemory, queryMemory } from '../services/memoryService.js';

const router = Router();

// Upsert memory entry
router.post(
    '/upsert',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as MemoryUpsertRequest;
            const response = await upsertMemory(request);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);

// Query memory entry
router.post(
    '/query',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as MemoryQueryRequest;
            const response = await queryMemory(request);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
