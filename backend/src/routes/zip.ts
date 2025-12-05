import { Router, Request, Response, NextFunction } from 'express';
import { ZipBundleRequest } from '../types/api.js';
import { createZipStream } from '../services/zipService.js';

const router = Router();

router.post(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as ZipBundleRequest;

            // Set headers for download
            const filename = request.projectName ? `${request.projectName}.zip` : 'bundle.zip';
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            await createZipStream(request, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
