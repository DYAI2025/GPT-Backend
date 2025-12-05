import { Router, Request, Response, NextFunction } from 'express';
import { TemplateRenderRequest } from '../types/api.js';
import { listTemplates, renderTemplate } from '../services/templateService.js';

const router = Router();

// List all templates
router.get('/', (_req: Request, res: Response) => {
    const templates = listTemplates();
    res.status(200).json(templates);
});

// Render a template
router.post(
    '/render',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as TemplateRenderRequest;
            const response = await renderTemplate(request);
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
