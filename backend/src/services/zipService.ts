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
// Create ZIP bundle and pipe to writable stream (e.g. Response)
export async function createZipStream(
    request: ZipBundleRequest,
    outputStream: any
): Promise<void> {
    // Validate request
    if (!request.files || !Array.isArray(request.files) || request.files.length === 0) {
        throw new ValidationError('files array is required and must not be empty');
    }

    logger.info('Creating ZIP stream', {
        projectName: request.projectName,
        fileCount: request.files.length,
    });

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        throw err;
    });

    // Pipe to output
    archive.pipe(outputStream);

    // Process each file
    for (const file of request.files) {
        await addFileToArchive(archive, file);
    }

    // Finalize archive
    await archive.finalize();

    logger.info('ZIP stream finalized', {
        projectName: request.projectName
    });
}

// Add single file to archive
async function addFileToArchive(
    archive: archiver.Archiver,
    file: ZipFile
): Promise<void> {
    // Tolerant handling: Accept 'name' as alias for 'path' to fix common GPT errors
    // Allow 'name' property even if not in strict type by casting
    if (!file.path && (file as any).name) {
        file.path = (file as any).name;
    }

    if (!file.path) {
        throw new ValidationError('file.path (or file.name) is required for each file');
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
