import { Router, Request, Response, NextFunction } from 'express';
import { ZipBundleRequest } from '../types/api.js';
import { createZipBundle } from '../services/zipService.js';

const router = Router();

router.post(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as ZipBundleRequest;
            const response = await createZipBundle(request);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
