import { supabase } from './supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const ZIPS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_ZIPS || 'zips';
const RENDERS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_RENDERS || 'renders';
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';
const USE_LOCAL_STORAGE = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY;

export interface UploadResult {
    publicUrl: string;
    path: string;
}

// Ensure local storage directories exist
function ensureLocalDirs() {
    const zipsDir = path.join(LOCAL_STORAGE_PATH, 'zips');
    const rendersDir = path.join(LOCAL_STORAGE_PATH, 'renders');
    if (!fs.existsSync(zipsDir)) fs.mkdirSync(zipsDir, { recursive: true });
    if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });
}

class StorageService {
    private isLocal: boolean;
    private baseUrl: string;

    constructor() {
        this.isLocal = USE_LOCAL_STORAGE;
        this.baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        if (this.isLocal) {
            ensureLocalDirs();
            console.log('📁 Using local file storage (Supabase not configured)');
        }
    }

    // Upload ZIP file
    async uploadZip(buffer: Buffer, projectName: string): Promise<UploadResult> {
        const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-');
        const filename = `${sanitizedName}-${uuidv4()}.zip`;

        if (this.isLocal) {
            const filePath = path.join(LOCAL_STORAGE_PATH, 'zips', filename);
            fs.writeFileSync(filePath, buffer);
            return {
                publicUrl: `${this.baseUrl}/files/zips/${filename}`,
                path: filePath,
            };
        }

        const { error } = await supabase.getClient()
            .storage
            .from(ZIPS_BUCKET)
            .upload(filename, buffer, {
                contentType: 'application/zip',
                upsert: false,
            });

        if (error) {
            throw new Error(`Storage upload error: ${error.message}`);
        }

        return {
            publicUrl: this.getPublicUrl(ZIPS_BUCKET, filename),
            path: filename,
        };
    }

    // Upload rendered file (HTML/PDF)
    async uploadRender(
        buffer: Buffer,
        templateId: string,
        extension: 'html' | 'pdf'
    ): Promise<UploadResult> {
        const filename = `${templateId}-${Date.now()}-${uuidv4()}.${extension}`;

        if (this.isLocal) {
            const filePath = path.join(LOCAL_STORAGE_PATH, 'renders', filename);
            fs.writeFileSync(filePath, buffer);
            return {
                publicUrl: `${this.baseUrl}/files/renders/${filename}`,
                path: filePath,
            };
        }

        const contentType = extension === 'pdf' ? 'application/pdf' : 'text/html';
        const { error } = await supabase.getClient()
            .storage
            .from(RENDERS_BUCKET)
            .upload(filename, buffer, {
                contentType,
                upsert: false,
            });

        if (error) {
            throw new Error(`Storage upload error: ${error.message}`);
        }

        return {
            publicUrl: this.getPublicUrl(RENDERS_BUCKET, filename),
            path: filename,
        };
    }

    // Get public URL for Supabase storage
    getPublicUrl(bucket: string, filepath: string): string {
        const supabaseUrl = process.env.SUPABASE_URL;
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filepath}`;
    }

    // Get signed URL (for private buckets)
    async getSignedUrl(
        bucket: string,
        filepath: string,
        expiresInSeconds: number = 3600
    ): Promise<string> {
        if (this.isLocal) {
            return `${this.baseUrl}/files/${bucket}/${filepath}`;
        }

        const { data, error } = await supabase.getClient()
            .storage
            .from(bucket)
            .createSignedUrl(filepath, expiresInSeconds);

        if (error) {
            throw new Error(`Signed URL error: ${error.message}`);
        }

        return data.signedUrl;
    }

    // Check storage health
    async checkHealth(): Promise<boolean> {
        if (this.isLocal) {
            return fs.existsSync(LOCAL_STORAGE_PATH);
        }

        try {
            const { error } = await supabase.getClient()
                .storage
                .from(ZIPS_BUCKET)
                .list('', { limit: 1 });
            return !error;
        } catch {
            return false;
        }
    }

    // Check if using local storage
    isLocalStorage(): boolean {
        return this.isLocal;
    }
}

export const storage = new StorageService();
