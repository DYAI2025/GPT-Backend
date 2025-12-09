// ============================================
// GPT Backend Services - Frontend Application
// ============================================

// Configuration
let config = {
    backendUrl: localStorage.getItem('backendUrl') || 'http://localhost:3000',
    supabaseUrl: localStorage.getItem('supabaseUrl') || '',
    storageBucket: localStorage.getItem('storageBucket') || 'zips'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initTabs();
    testConnection();
    loadTemplates();
});

// Load saved configuration
function loadConfig() {
    document.getElementById('backendUrl').value = config.backendUrl;
    document.getElementById('supabaseUrl').value = config.supabaseUrl;
    document.getElementById('storageBucket').value = config.storageBucket;
}

// Save configuration
function saveConfig() {
    config.backendUrl = document.getElementById('backendUrl').value;
    config.supabaseUrl = document.getElementById('supabaseUrl').value;
    config.storageBucket = document.getElementById('storageBucket').value;

    localStorage.setItem('backendUrl', config.backendUrl);
    localStorage.setItem('supabaseUrl', config.supabaseUrl);
    localStorage.setItem('storageBucket', config.storageBucket);

    showToast('Configuration saved!', 'success');
    testConnection();
}

// Export configuration as .env
function exportConfig() {
    const envContent = `# GPT Backend Configuration
NODE_ENV=production
PORT=3000

# Backend URL
BACKEND_URL=${config.backendUrl}

# Supabase
SUPABASE_URL=${config.supabaseUrl}
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_STORAGE_BUCKET_ZIPS=${config.storageBucket}
SUPABASE_STORAGE_BUCKET_RENDERS=renders

# CORS
CORS_ALLOW_ORIGINS=*
LOG_LEVEL=info
`;

    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration exported!', 'success');
}

// Test backend connection
async function testConnection() {
    const statusBadge = document.getElementById('connectionStatus');
    const healthStatus = document.getElementById('healthStatus');
    const dbStatus = document.getElementById('dbStatus');
    const storageStatus = document.getElementById('storageStatus');
    const uptimeStatus = document.getElementById('uptimeStatus');

    statusBadge.className = 'status-badge';
    statusBadge.innerHTML = '<span class="status-dot"></span>Checking...';

    try {
        const response = await fetch(`${config.backendUrl}/health`);
        let data;
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, try to get text response
            const text = await response.text();
            data = { status: 'error', message: `Non-JSON response: ${text}` };
        }

        if (data.status === 'ok') {
            statusBadge.className = 'status-badge connected';
            statusBadge.innerHTML = '<span class="status-dot"></span>Connected';

            healthStatus.textContent = '✓ Healthy';
            healthStatus.className = 'status-value success';

            dbStatus.textContent = data.services?.database ? '✓ Connected' : '✗ Error';
            dbStatus.className = `status-value ${data.services?.database ? 'success' : 'error'}`;

            storageStatus.textContent = data.services?.storage ? '✓ Connected' : '✗ Error';
            storageStatus.className = `status-value ${data.services?.storage ? 'success' : 'error'}`;

            uptimeStatus.textContent = formatUptime(data.uptimeSeconds || 0);
            uptimeStatus.className = 'status-value';
        } else {
            throw new Error('Service unhealthy');
        }
    } catch (error) {
        statusBadge.className = 'status-badge error';
        statusBadge.innerHTML = '<span class="status-dot"></span>Disconnected';

        healthStatus.textContent = '✗ Unavailable';
        healthStatus.className = 'status-value error';
        dbStatus.textContent = '-';
        dbStatus.className = 'status-value';
        storageStatus.textContent = '-';
        storageStatus.className = 'status-value';
        uptimeStatus.textContent = '-';
        uptimeStatus.className = 'status-value';
    }
}

// Format uptime
function formatUptime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}

// Load templates
async function loadTemplates() {
    const grid = document.getElementById('templatesGrid');

    try {
        const response = await fetch(`${config.backendUrl}/templates`);
        let templates;
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            templates = await response.json();
        } else {
            // If not JSON, try to get text response
            const text = await response.text();
            templates = [{ name: 'Error', type: 'error', description: `Non-JSON response: ${text}` }];
        }

        grid.innerHTML = templates.map(template => `
      <div class="template-card">
        <div class="template-preview">
          <span style="font-size: 3rem;">📄</span>
        </div>
        <div class="template-info">
          <h4 class="template-name">${template.name}</h4>
          <span class="template-type">${template.type}</span>
          <p class="template-desc">${template.description || 'No description'}</p>
        </div>
      </div>
    `).join('');
    } catch (error) {
        // Keep skeleton loading state or show error
        console.log('Could not load templates:', error.message);
    }
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// API Testing Functions
async function testZipBundle() {
    const projectName = document.getElementById('zipProjectName').value;
    const filesJson = document.getElementById('zipFiles').value;
    const output = document.getElementById('zipResponse');

    try {
        const files = JSON.parse(filesJson);
        output.textContent = 'Creating ZIP bundle...';

        const response = await fetch(`${config.backendUrl}/zip-bundles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, files })
        });

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // The ZIP endpoint returns application/zip, so this shouldn't normally happen
            // But if there's an error, it might return JSON
            if (response.status >= 400) {
                // Try to parse error response as JSON
                try {
                    data = await response.json();
                } catch {
                    // If that fails, get response as text
                    const text = await response.text();
                    data = { error: 'Non-JSON error response', details: text };
                }
            } else {
                // For successful response with non-JSON content
                const blob = await response.blob();
                data = { message: `ZIP response received, size: ${blob.size} bytes` };
            }
        }

        output.textContent = JSON.stringify(data, null, 2);

        if (data.downloadUrl) {
            showToast('ZIP bundle created! Click to download.', 'success');
        }
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        showToast('Failed to create ZIP bundle', 'error');
    }
}

async function testTemplateRender() {
    const templateId = document.getElementById('templateId').value;
    const dataJson = document.getElementById('templateData').value;
    const outputFormat = document.getElementById('templateOutput').value;
    const output = document.getElementById('templateResponse');

    try {
        const data = JSON.parse(dataJson);
        output.textContent = 'Rendering template...';

        const response = await fetch(`${config.backendUrl}/templates/render`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId, data, output: outputFormat })
        });

        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // If not JSON response (e.g., PDF, HTML), handle accordingly
            if (response.status >= 400) {
                // Try to parse error response as JSON
                try {
                    result = await response.json();
                } catch {
                    // If that fails, get response as text
                    const text = await response.text();
                    result = { error: 'Non-JSON error response', details: text };
                }
            } else {
                // For successful response with non-JSON content (PDF, HTML)
                const contentLength = response.headers.get('content-length');
                result = { 
                    message: 'Template rendered successfully', 
                    contentType: contentType,
                    size: contentLength ? `${contentLength} bytes` : 'unknown size' 
                };
            }
        }

        output.textContent = JSON.stringify(result, null, 2);

        if (result.downloadUrl) {
            showToast('Template rendered successfully!', 'success');
        }
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        showToast('Failed to render template', 'error');
    }
}

async function testMemoryUpsert() {
    const userId = document.getElementById('memoryUserId').value;
    const key = document.getElementById('memoryKey').value;
    const valueJson = document.getElementById('memoryValue').value;
    const output = document.getElementById('memoryResponse');

    try {
        const value = JSON.parse(valueJson);
        output.textContent = 'Saving to memory...';

        const response = await fetch(`${config.backendUrl}/memory/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, key, value })
        });

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON response, handle as text
            const text = await response.text();
            if (response.ok) {
                data = { message: 'Operation successful', response: text };
            } else {
                data = { error: 'Non-JSON error response', details: text };
            }
        }

        output.textContent = JSON.stringify(data, null, 2);
        showToast('Memory saved successfully!', 'success');
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        showToast('Failed to save memory', 'error');
    }
}

async function testMemoryQuery() {
    const userId = document.getElementById('memoryUserId').value;
    const key = document.getElementById('memoryKey').value;
    const output = document.getElementById('memoryResponse');

    try {
        output.textContent = 'Querying memory...';

        const response = await fetch(`${config.backendUrl}/memory/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, key })
        });

        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON response, handle as text
            const text = await response.text();
            if (response.ok) {
                data = { message: 'Operation successful', response: text };
            } else {
                data = { error: 'Non-JSON error response', details: text };
            }
        }

        output.textContent = JSON.stringify(data, null, 2);

        if (data.value) {
            showToast('Memory retrieved!', 'success');
        }
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        showToast('Memory not found', 'error');
    }
}

// Documentation Functions
function copySystemPrompt() {
    const prompt = `Du bist ein technischer Assistent, der eng mit einem eigenen Backend-Webservice zusammenarbeitet.

DEINE ROLLE
- Du sprichst NICHT direkt mit Datenbanken oder Speicherdiensten.
- Du nutzt ausschließlich die bereitgestellten HTTP-Actions zu dieser Base-URL: ${config.backendUrl}

VERFÜGBARE ACTIONS:
1. POST /zip-bundles - Erstellt ZIP-Archive aus Dateien
2. GET /templates - Listet verfügbare Templates
3. POST /templates/render - Rendert Templates zu HTML/PDF
4. POST /memory/upsert - Speichert Daten im Gedächtnis
5. POST /memory/query - Ruft gespeicherte Daten ab

Bei jeder Aktion nutze das korrekte JSON-Format laut API-Dokumentation.`;

    navigator.clipboard.writeText(prompt);
    showToast('System prompt copied!', 'success');
}

function downloadOpenAPI() {
    const openapi = `openapi: 3.1.0
info:
  title: GPT Modular Backend
  version: 1.0.0
  description: Backend-Service für ZIP-Bundles, Templates und Memory
servers:
  - url: ${config.backendUrl}
paths:
  /health:
    get:
      summary: Healthcheck
      operationId: checkHealth
      responses:
        '200':
          description: Service healthy
  /zip-bundles:
    post:
      summary: Erzeugt ein ZIP-Bundle
      operationId: createZipBundle
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [projectName, files]
              properties:
                projectName:
                  type: string
                files:
                  type: array
                  items:
                    type: object
                    properties:
                      path:
                        type: string
                      kind:
                        type: string
                        enum: [markdown, code, binary, text]
                      content:
                        type: string
                      language:
                        type: string
                      sourceUrl:
                        type: string
      responses:
        '200':
          description: ZIP erstellt
  /templates:
    get:
      summary: Listet alle Templates
      operationId: listTemplates
      responses:
        '200':
          description: Template-Liste
  /templates/render:
    post:
      summary: Rendert ein Template
      operationId: renderTemplate
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [templateId, data]
              properties:
                templateId:
                  type: string
                data:
                  type: object
                output:
                  type: string
                  enum: [html, pdf]
      responses:
        '200':
          description: Template gerendert
  /memory/upsert:
    post:
      summary: Speichert Memory-Eintrag
      operationId: upsertMemory
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId, key, value]
              properties:
                userId:
                  type: string
                key:
                  type: string
                value:
                  type: object
      responses:
        '200':
          description: Memory gespeichert
  /memory/query:
    post:
      summary: Liest Memory-Eintrag
      operationId: queryMemory
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId, key]
              properties:
                userId:
                  type: string
                key:
                  type: string
      responses:
        '200':
          description: Memory gefunden
        '404':
          description: Nicht gefunden`;

    const blob = new Blob([openapi], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.yaml';
    a.click();
    URL.revokeObjectURL(url);
    showToast('OpenAPI schema downloaded!', 'success');
}

function showActionDocs() {
    const docs = `# GPT Action Descriptions

## 1. createZipBundle (POST /zip-bundles)
Verwende diese Action, um ein ZIP-Bundle aus Dateien zu erstellen.
- projectName: Kurzer Name ohne Sonderzeichen
- files[]: Array mit path, kind, content/sourceUrl

## 2. listTemplates (GET /templates)
Ruft alle verfügbaren Templates ab.

## 3. renderTemplate (POST /templates/render)
Rendert ein Template mit Daten.
- templateId: ID aus listTemplates
- data: Objekt mit Template-Feldern
- output: "html" oder "pdf"

## 4. upsertMemory (POST /memory/upsert)
Speichert Daten für einen Nutzer.
- userId: Stabile Nutzer-ID
- key: Schlüssel für die Daten
- value: JSON-Objekt

## 5. queryMemory (POST /memory/query)
Ruft gespeicherte Daten ab.
- userId: Nutzer-ID
- key: Zu suchender Schlüssel`;

    alert(docs);
}

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
