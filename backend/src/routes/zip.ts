import { Router, Request, Response, NextFunction } from 'express';
import { ZipBundleRequest } from '../types/api.js';
import { createZipStream } from '../services/zipService.js';

const router = Router();

router.post(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as ZipBundleRequest;

            // Compatibility: Allow 'filename' as alias for 'projectName' (common GPT hallucination)
            if (!(request as any).projectName && (request as any).filename) {
                // If filename ends with .zip, strip it for project name
                let name = (request as any).filename as string;
                if (name.toLowerCase().endsWith('.zip')) {
                    name = name.slice(0, -4);
                }
                request.projectName = name;
            }

            // Set headers for download
            const safeProjectName = (request.projectName || 'bundle').replace(/[^a-z0-9-_]/gi, '_');
            const filename = `${safeProjectName}.zip`;

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            await createZipStream(request, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
