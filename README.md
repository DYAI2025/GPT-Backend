# 🧠 GPT Backend Services

Ein modulares, serverless Backend für **OpenAI Custom GPTs**, gehostet auf Vercel.
Dieses Projekt stellt leistungsstarke "Actions" bereit, die deine GPTs mit Fähigkeiten wie **Dateierstellung (ZIP, PDF, SVG)**, **Visuellem Rendering** und **Langzeitgedächtnis** ausstatten.

---

## ✨ Features

### 1. 🏗️ Canva & Design Automation
Wandelt JSON-Spezifikationen (`canva_spec.json`) in visuelle Assets um.
*   **SVG Rendering:** Vektorbasierte Layouts aus JSON-Daten.
*   **PDF Export:** Downloadbare PDF-Dateien direkt im Chat.
*   **HTML Preview:** Live-Vorschau von Designs im Browser (mit Dark Mode).

### 2. 📦 ZIP Bundling Service
Erlaubt dem GPT, **mehrere Dateien** zu erzeugen und gebündelt bereitzustellen.
*   **Use Case:** "Erstelle mir 5 Instagram Posts und die passenden CSV-Daten."
*   **Technik:** Streaming-Response (keine temporäre Speicherung nötig).

### 3. 🧠 Memory (Gedächtnis)
Langzeitspeicher für User-Präferenzen (z.B. Markenfarben, Tone of Voice).
*   **Datenbank:** Supabase (PostgreSQL).
*   **Isolation:** Speicherung pro `userId` (oder Brand-Key).

### 4. 🎨 Template Engine
Serverseitiges Rendering von HTML-Templates für Social Media.
*   **Templates:** `pinterest-story`, `pinterest-quote`, etc.
*   **Output:** HTML (kann vom User als Bild gespeichert oder in Canva genutzt werden).

---

## 🚀 API Endpoints

Basis URL (Produktion): `https://backend-dyai2025s-projects.vercel.app`

### 🎨 Canva Converter
| Methode | Endpoint | Beschreibung | Body |
|---------|----------|--------------|------|
| `POST` | `/canva/convert` | Generiert SVG oder PDF | `{ spec: {...}, output: "svg"|"pdf" }` |
| `POST` | `/canva/preview` | HTML Vorschau Seite | `{ spec: {...}, theme: "light"|"dark" }` |

### 📦 ZIP Service
| Methode | Endpoint | Beschreibung | Body |
|---------|----------|--------------|------|
| `POST` | `/zip-bundles` | Erstellt ZIP Download | `{ files: [{ path, content }] }` |

### 🧠 Memory
| Methode | Endpoint | Beschreibung | Body |
|---------|----------|--------------|------|
| `POST` | `/memory/upsert` | Speichert Daten | `{ userId, memoryKey, content }` |
| `POST` | `/memory/query` | Sucht Daten | `{ userId, search, memoryKey }` |

### 🔍 System
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| `GET` | `/health` | Server & DB Status prüfen |
| `GET` | `/templates` | Liste aller Templates |

---

## 🛠️ Installation & Setup

### Voraussetzungen
*   Node.js 18+
*   Vercel CLI (`npm i -g vercel`)
*   Supabase Account (optional für Memory)

### Laufzeit- & Build-Befehle (virtueller Server)
*   **Arbeitsverzeichnis:** immer `backend/`
*   **Entwicklung starten:** `npm run dev` (nodemon/tsx Watcher, Port 3000)
*   **Build erstellen:** `npm run build` (legt `backend/dist/index.js` an)
*   **Produktionsstart lokal:** `npm start` (setzt einen fertigen Build voraus)
*   **Vercel Build Hooks:** Die Root-`vercel.json` führt automatisch `cd backend && npm install` und `cd backend && npm run build` aus und deployed anschließend `backend/dist/index.js`.
    *  Wenn kein Bild/Asset ausgeliefert wird, überprüfe zuerst, ob der Build wirklich `backend/dist` erzeugt hat und ob die Deployment-Logs keinen Fehler beim Install/Build zeigen.

### 1. Projekt klonen & installieren
```bash
git clone https://github.com/DYAI2025/GPT-Backend.git
cd gpt-backend/backend
npm install
```

### 2. Lokale Entwicklung
Erstelle eine `.env` Datei im `backend` Ordner:
```env
SUPABASE_URL=dein_supabase_url
SUPABASE_SERVICE_KEY=dein_secret_key
CORS_ALLOW_ORIGINS=*
```

Starte den Server:
```bash
npm run dev
# Server läuft auf http://localhost:3000
```

### 3. Deployment auf Vercel
Das Projekt ist für Vercel optimiert (Serverless Functions via `api/index.ts` Entrypoint).

```bash
vercel --prod
```
*   Setze die `SUPABASE_..` Environment Variables im Vercel Dashboard.

---

## 🤖 GPT Integration (Custom GPTs)

Um dieses Backend in einem Custom GPT zu nutzen:

1.  **GPT Editor öffnen:** "Configure" -> "Create new action".
2.  **Schema Import:** Importiere das OpenAPI Schema von:
    `https://raw.githubusercontent.com/DYAI2025/GPT-Backend/main/backend/openapi.yaml`
3.  **Authentication:** `None`.
4.  **Privacy Policy:** 
    `https://dyai2025.github.io/GPT-Backend/privacy.html`

### System Prompt (Beispiel)
Füge dies in die "Instructions" deines GPTs ein:
> "Du bist der Social Media Architect. Nutze die Action `convertCanvaSpec`, um Designs zu visualisieren, und `createZipBundle`, um Datenpakete zu schnüren. Speichere Markenfarben via `upsertMemory`."

---

## 📁 Projektstruktur

```
gpt-backend/
├── backend/            # Express Server Code
│   ├── src/
│   │   ├── routes/     # API Endpoints (canva.ts, zip.ts...)
│   │   ├── lib/        # Logic (Rendering, DB...)
│   │   └── schemas/    # JSON Validation
│   └── openapi.yaml    # API Definition für GPT
├── frontend/           # Test-Dashboard (GitHub Pages)
└── skill_canva.../     # GPT Prompt & Docs
```

## 📄 Lizenz
MIT License.
