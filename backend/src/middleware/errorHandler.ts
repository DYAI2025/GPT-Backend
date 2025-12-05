import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api.js';
import { logger } from '../lib/logger.js';

// Custom Error Classes
export class AppError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404, 'NOT_FOUND');
    }
}

export class InternalError extends AppError {
    constructor(message: string) {
        super(message, 500, 'INTERNAL_ERROR');
    }
}

// Error Handler Middleware
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const response: ErrorResponse = {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
        },
    };

    let statusCode = 500;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        response.error.code = err.code;
        response.error.message = err.message;
    } else if (err.name === 'SyntaxError') {
        statusCode = 400;
        response.error.code = 'INVALID_JSON';
        response.error.message = 'Invalid JSON in request body';
    }

    res.status(statusCode).json(response);
}

// 404 Handler
export function notFoundHandler(req: Request, res: Response): void {
    const response: ErrorResponse = {
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    };
    res.status(404).json(response);
}
