// ============================================
// GPT Backend Services - Frontend Application
// ============================================

// Configuration - defaulting to Live Vercel Backend
let config = {
  backendUrl: localStorage.getItem('backendUrl') || 'https://backend-dyai2025s-projects.vercel.app',
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
    const data = await response.json();

    if (data.status === 'ok') {
      statusBadge.className = 'status-badge connected';
      statusBadge.innerHTML = '<span class="status-dot"></span>Connected';

      healthStatus.textContent = '✓ Healthy';
      healthStatus.className = 'status-value success';

      dbStatus.textContent = data.services?.database ? '✓ Connected' : '✗ Error';
      dbStatus.className = `status-value ${data.services?.database ? 'success' : 'error'}`;

      // Storage is only true if bucket is configured, but ZIP streaming works anyway
      storageStatus.textContent = data.services?.storage ? '✓ Connected' : '- (Direct Stream)';
      storageStatus.className = 'status-value success';

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
    const templates = await response.json();

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
    output.textContent = 'Creating ZIP streaming request...';

    // Direct form submit approach for download testing could be better, but fetch blob works
    const response = await fetch(`${config.backendUrl}/zip-bundles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName, files })
    });

    if (response.ok) {
      output.textContent = "Success! Download initiated.";
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'bundle'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('ZIP downloaded!', 'success');
    } else {
      const err = await response.json();
      throw new Error(err.error || 'Failed');
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

    const result = await response.json();
    output.textContent = JSON.stringify(result, null, 2);

    if (result.html) {
      showToast('Template rendered successfully!', 'success');
      // Optionally preview
      const previewWindow = window.open("", "Preview", "width=600,height=800");
      previewWindow.document.write(result.html);
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
      body: JSON.stringify({ userId, memoryKey: key, content: value })
    });

    const data = await response.json();
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
      body: JSON.stringify({ userId, memoryKey: key })
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (data.results) {
      showToast('Memory retrieved!', 'success');
    }
  } catch (error) {
    output.textContent = `Error: ${error.message}`;
    showToast('Memory unavailable', 'error');
  }
}

// Documentation Functions
function copySystemPrompt() {
  const prompt = `Du bist ein technischer Assistent, der eng mit einem eigenen Backend-Webservice zusammenarbeitet.

DEINE ROLLE
- Du sprichst NICHT direkt mit Datenbanken oder Speicherdiensten.
- Du nutzt ausschließlich die bereitgestellten HTTP-Actions zu dieser Base-URL: ${config.backendUrl}

VERFÜGBARE ACTIONS:
1. POST /zip-bundles - Erstellt ZIP-Archive aus Dateien (Stream Download)
2. GET /templates - Listet verfügbare Templates
3. POST /templates/render - Rendert Templates zu HTML
4. POST /memory/upsert - Speichert Daten im Gedächtnis
5. POST /memory/query - Ruft gespeicherte Daten ab

SICHERHEIT:
- Frage den Nutzer nach seinem "Markennamen" und nutze diesen als userId.
- Speichere Brand-Guidelines (Farben, Fonts) im Memory unter dem Key "brand_guidelines".`;

  navigator.clipboard.writeText(prompt);
  showToast('System prompt copied!', 'success');
}

function downloadOpenAPI() {
  const openapi = `openapi: 3.1.0
info:
  title: GPT Backend Services API
  version: 1.0.0
  description: API für Pinterest Templates, ZIP-Bundles und Langzeitgedächtnis
servers:
  - url: ${config.backendUrl}
paths:
  /health:
    get:
      summary: Health Check
      operationId: checkHealth
  /templates:
    get:
      summary: Verfügbare Templates auflisten
      operationId: listTemplates
  /templates/render:
    post:
      summary: Template rendern
      operationId: renderTemplate
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [templateId, data]
              properties:
                templateId: {type: string}
                data: {type: object}
  /zip-bundles:
    post:
      summary: ZIP Datei erstellen
      operationId: createZipBundle
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [files]
              properties:
                filename: {type: string}
                files:
                  type: array
                  items:
                    type: object
                    required: [name, content]
                    properties:
                      name: {type: string}
                      content: {type: string}
      responses:
        '200':
          description: ZIP Datei Download (Binary)
          content:
            application/zip:
              schema:
                type: string
                format: binary
  /memory/query:
    post:
      operationId: queryMemory
      summary: Erinnerungen abrufen
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId]
              properties:
                userId: {type: string}
                search: {type: string}
                memoryKey: {type: string}
  /memory/upsert:
    post:
      operationId: upsertMemory
      summary: Wissen speichern
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId, memoryKey, content]
              properties:
                userId: {type: string}
                memoryKey: {type: string}
                content: {type: object}`;

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
  // Simplified docs alert
  alert("1. Create ZIP\n2. List Templates\n3. Render Template\n4. Save Memory\n5. Query Memory");
}

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
