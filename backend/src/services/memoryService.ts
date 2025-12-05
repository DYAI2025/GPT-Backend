import {
    MemoryUpsertRequest,
    MemoryUpsertResponse,
    MemoryQueryRequest,
    MemoryQueryResponse,
} from '../types/api.js';
import { supabase } from '../lib/supabaseClient.js';
import { logger } from '../lib/logger.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

// Upsert memory entry
export async function upsertMemory(
    request: MemoryUpsertRequest
): Promise<MemoryUpsertResponse> {
    // Validate request
    if (!request.userId) {
        throw new ValidationError('userId is required');
    }
    if (!request.key) {
        throw new ValidationError('key is required');
    }
    if (!request.value || typeof request.value !== 'object') {
        throw new ValidationError('value must be an object');
    }

    logger.info('Upserting memory', {
        userId: request.userId,
        key: request.key,
    });

    const result = await supabase.upsertMemory(
        request.userId,
        request.key,
        request.value
    );

    logger.info('Memory upserted', {
        userId: request.userId,
        key: request.key,
        updated: result.updated,
    });

    return {
        success: true,
        updated: result.updated,
    };
}

// Query memory entry
export async function queryMemory(
    request: MemoryQueryRequest
): Promise<MemoryQueryResponse> {
    // Validate request
    if (!request.userId) {
        throw new ValidationError('userId is required');
    }
    if (!request.key) {
        throw new ValidationError('key is required');
    }

    logger.info('Querying memory', {
        userId: request.userId,
        key: request.key,
    });

    const value = await supabase.queryMemory(request.userId, request.key);

    if (value === null) {
        throw new NotFoundError(
            `No memory entry found for userId='${request.userId}' and key='${request.key}'`
        );
    }

    logger.info('Memory retrieved', {
        userId: request.userId,
        key: request.key,
    });

    return { value };
}
