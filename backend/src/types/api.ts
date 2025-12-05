// ============================================
// API Types for GPT Modular Backend
// ============================================

// Health Check
export interface HealthResponse {
    status: 'ok' | 'error';
    uptimeSeconds: number;
    timestamp: string;
    services: {
        database: boolean;
        storage: boolean;
    };
}

// ZIP Bundle Types
export type FileKind = 'markdown' | 'code' | 'binary' | 'text';

export interface ZipFile {
    path: string;
    kind: FileKind;
    language?: string;
    sourceUrl?: string;
    content?: string;
}

export interface ZipBundleRequest {
    projectName: string;
    files: ZipFile[];
}

export interface ZipBundleResponse {
    downloadUrl: string;
    fileCount: number;
}

// Template Types
export interface TemplateField {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

export interface TemplateListItem {
    id: string;
    name: string;
    type: string;
    description?: string;
    fields: TemplateField[];
}

export type OutputFormat = 'html' | 'pdf';

export interface TemplateRenderRequest {
    templateId: string;
    data: Record<string, unknown>;
    output?: OutputFormat;
}

export interface TemplateRenderResponse {
    downloadUrl: string;
    output: OutputFormat;
}

// Memory Types
export interface MemoryUpsertRequest {
    userId: string;
    key: string;
    value: Record<string, unknown>;
}

export interface MemoryUpsertResponse {
    success: boolean;
    updated: boolean;
}

export interface MemoryQueryRequest {
    userId: string;
    key: string;
}

export interface MemoryQueryResponse {
    value: Record<string, unknown>;
}

// Error Types
export interface ErrorDetail {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ErrorResponse {
    error: ErrorDetail;
}

// Service Configuration Types (for UI)
export interface ServiceConfig {
    id: string;
    name: string;
    enabled: boolean;
    endpoint: string;
    description: string;
    settings: Record<string, unknown>;
}

export interface GPTAction {
    id: string;
    name: string;
    operationId: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    requestSchema?: Record<string, unknown>;
    responseSchema?: Record<string, unknown>;
}
