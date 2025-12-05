# GPT Modular Backend

A powerful, modular backend service for Custom GPT Actions providing ZIP bundling, template rendering, and persistent memory capabilities.

## 🚀 Features

- **ZIP Bundler** - Create downloadable ZIP archives from dynamically generated files
- **Template Renderer** - Render beautiful pre-designed templates to HTML/PDF
- **Persistent Memory** - Store and retrieve user-specific data via Supabase
- **Beautiful UI** - Configuration dashboard (GitHub Pages compatible)

## 📁 Project Structure

```
gpt-backend/
├── backend/                 # Node.js/TypeScript API Server
│   ├── src/
│   │   ├── index.ts        # Express server entry point
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── lib/            # Utilities (Supabase, Storage, Logger)
│   │   ├── middleware/     # Error handling
│   │   └── types/          # TypeScript interfaces
│   ├── openapi.yaml        # API specification
│   └── supabase-schema.sql # Database schema
│
└── frontend/               # Static UI (GitHub Pages)
    ├── index.html
    ├── css/styles.css
    └── js/app.js
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Supabase account (for database and storage)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run `supabase-schema.sql` in the SQL Editor
3. Create storage buckets: `zips` and `renders`
4. Copy your project URL and service key to `.env`

### 3. Run Development Server

```bash
npm run dev
# Server runs at http://localhost:3000
```

### 4. Deploy Backend

**Vercel:**
```bash
npm run build
vercel deploy
```

**Railway/Render:**
- Connect GitHub repo
- Set environment variables
- Deploy

### 5. Host Frontend (GitHub Pages)

1. Push the `frontend/` folder to a GitHub repo
2. Enable GitHub Pages in Settings
3. Access at `https://yourusername.github.io/repo-name/`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/zip-bundles` | POST | Create ZIP archive |
| `/templates` | GET | List available templates |
| `/templates/render` | POST | Render a template |
| `/memory/upsert` | POST | Save memory entry |
| `/memory/query` | POST | Retrieve memory entry |

## 🔧 GPT Builder Setup

1. Open the GPT Builder
2. Add an Action with your backend URL
3. Import `openapi.yaml` or configure manually
4. Add the system prompt from the UI

## 📝 Example Requests

### Create ZIP Bundle

```json
POST /zip-bundles
{
  "projectName": "my-project",
  "files": [
    {
      "path": "README.md",
      "kind": "markdown",
      "content": "# My Project\n\nHello World!"
    },
    {
      "path": "src/index.ts",
      "kind": "code",
      "language": "typescript",
      "content": "console.log('Hello!');"
    }
  ]
}
```

### Render Template

```json
POST /templates/render
{
  "templateId": "magazin-cover",
  "data": {
    "title": "Amazing Report",
    "subtitle": "Q4 2024 Results",
    "author": "John Doe"
  },
  "output": "pdf"
}
```

### Store Memory

```json
POST /memory/upsert
{
  "userId": "user-123",
  "key": "preferences",
  "value": {
    "theme": "dark",
    "language": "en"
  }
}
```

## 🎨 Available Templates

- **Magazin Cover** - Professional magazine-style cover page
- **Report Header** - Business report header section  
- **Data Card** - Visual data display component

## 🔒 Environment Variables

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_STORAGE_BUCKET_ZIPS=zips
SUPABASE_STORAGE_BUCKET_RENDERS=renders
CORS_ALLOW_ORIGINS=*
LOG_LEVEL=info
```

## 📄 License

MIT
