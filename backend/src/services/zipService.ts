import archiver from 'archiver';
import { ZipBundleRequest, ZipBundleResponse, ZipFile } from '../types/api.js';
import { storage } from '../lib/storage.js';
import { logger } from '../lib/logger.js';
import { ValidationError } from '../middleware/errorHandler.js';
import https from 'https';
import http from 'http';

// Download file from URL
async function downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

// Create ZIP bundle from files
export async function createZipBundle(
    request: ZipBundleRequest
): Promise<ZipBundleResponse> {
    // Validate request
    if (!request.projectName) {
        throw new ValidationError('projectName is required');
    }
    if (!request.files || !Array.isArray(request.files) || request.files.length === 0) {
        throw new ValidationError('files array is required and must not be empty');
    }

    logger.info('Creating ZIP bundle', {
        projectName: request.projectName,
        fileCount: request.files.length,
    });

    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('error', (err) => {
        throw err;
    });

    // Process each file
    for (const file of request.files) {
        await addFileToArchive(archive, file);
    }

    // Finalize archive
    await archive.finalize();

    // Wait for all data
    const zipBuffer = Buffer.concat(chunks);

    // Upload to storage
    const { publicUrl } = await storage.uploadZip(zipBuffer, request.projectName);

    logger.info('ZIP bundle created', {
        projectName: request.projectName,
        fileCount: request.files.length,
        size: zipBuffer.length,
    });

    return {
        downloadUrl: publicUrl,
        fileCount: request.files.length,
    };
}

// Add single file to archive
async function addFileToArchive(
    archive: archiver.Archiver,
    file: ZipFile
): Promise<void> {
    if (!file.path) {
        throw new ValidationError('file.path is required for each file');
    }

    if (file.kind === 'binary' && file.sourceUrl) {
        // Download binary file
        try {
            const content = await downloadFile(file.sourceUrl);
            archive.append(content, { name: file.path });
        } catch (error) {
            logger.error('Failed to download binary file', {
                path: file.path,
                sourceUrl: file.sourceUrl,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw new ValidationError(`Failed to download file from ${file.sourceUrl}`);
        }
    } else if (file.content !== undefined) {
        // Add text content
        archive.append(file.content, { name: file.path });
    } else {
        throw new ValidationError(
            `File ${file.path}: either content or sourceUrl (for binary) is required`
        );
    }
}
