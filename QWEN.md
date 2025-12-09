# Qwen Code Context: GPT Backend Services

## Project Overview

This is a modular, serverless backend service for OpenAI Custom GPTs, hosted on Vercel. The project provides powerful "Actions" that enhance GPTs with capabilities such as file creation (ZIP, PDF, SVG), visual rendering, and long-term memory.

**Project Name:** GPT Modular Backend  
**Primary Technology:** Node.js/TypeScript with Express.js  
**Deployment Platform:** Vercel (Serverless Functions)  
**Database:** Supabase (PostgreSQL)  
**License:** MIT

## Core Features

### 1. Canva & Design Automation
- **SVG Rendering:** Converts JSON specifications into vector-based layouts
- **PDF Export:** Generates downloadable PDF files directly in chat
- **HTML Preview:** Provides live preview of designs in browser with dark mode support

### 2. ZIP Bundling Service
- Allows GPTs to create and bundle multiple files together
- Supports streaming responses (no temporary storage needed)
- Use case: "Create 5 Instagram posts and the matching CSV data"

### 3. Memory (Long-term Storage)
- Long-term storage for user preferences (brand colors, tone of voice)
- Isolated storage per user ID or brand key
- Uses Supabase PostgreSQL database

### 4. Template Engine
- Server-side rendering of HTML templates for social media
- Pre-built templates for Pinterest stories, quotes, etc.
- Output as HTML that can be saved as images or used in Canva

## Project Structure

```
gpt-backend/
├── backend/                 # Express server code
│   ├── api/                 # Vercel API routes
│   ├── src/
│   │   ├── routes/          # API endpoints (canva.ts, zip.ts, etc.)
│   │   ├── services/        # Business logic (memoryService.ts)
│   │   ├── lib/             # Core utilities (rendering, validation)
│   │   ├── types/           # TypeScript type definitions
│   │   └── middleware/      # Error handling, logging
│   ├── templates/           # HTML template files
│   ├── dist/                # Compiled TypeScript output
│   ├── openapi.yaml         # API specification for GPT integration
│   ├── package.json         # Dependencies and scripts
│   └── vercel.json          # Vercel deployment configuration
├── frontend/                # Static files (privacy, terms, etc.)
├── css/, js/                # Frontend assets
├── skills/                  # GPT skill configurations
├── README.md                # Project documentation
└── openapi.yaml             # Root OpenAPI specification
```

## Building and Running

### Prerequisites
- Node.js 18+
- Vercel CLI (`npm i -g vercel`)

### Local Development
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create environment file:
   ```bash
   # Copy example
   cp .env.example .env
   
   # Update with your values
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_secret_key
   CORS_ALLOW_ORIGINS=*
   ```

3. Start development server:
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

### Production Build
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## API Endpoints

Base URL (Production): `https://backend-dyai2025s-projects.vercel.app`

### Canva Converter
- `POST /canva/convert` - Generates SVG or PDF from JSON spec
- `POST /canva/preview` - HTML preview page with theme toggle

### ZIP Service
- `POST /zip-bundles` - Creates ZIP download from file array

### Memory Service
- `POST /memory/upsert` - Stores user data
- `POST /memory/query` - Retrieves user data

### System Endpoints
- `GET /health` - Server & DB status check
- `GET /templates` - List all available templates

## Database Schema

The application uses Supabase PostgreSQL with the following key tables:

### user_memory table
- Stores user preferences and long-term data
- Columns: id, user_id, key, value (JSONB), created_at, updated_at
- Unique constraint on (user_id, key) for upsert operations

### templates table (optional)
- Stores templates in database instead of files
- Columns: id, name, type, description, metadata (JSONB), body, timestamps

## Deployment to Vercel

The project is optimized for Vercel deployment:

1. Set environment variables in Vercel dashboard:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - SUPABASE_ANON_KEY
   - SUPABASE_STORAGE_BUCKETS

2. Deploy using:
   ```bash
   vercel --prod
   ```

## GPT Integration

To integrate with OpenAI Custom GPTs:

1. Open GPT Editor → Configure → Create new action
2. Import OpenAPI schema from:
   `https://raw.githubusercontent.com/DYAI2025/GPT-Backend/main/backend/openapi.yaml`
3. Set Authentication to `None`
4. Set Privacy Policy to `https://dyai2025.github.io/GPT-Backend/privacy.html`

## Key Dependencies

### Core Dependencies
- `express`: Web framework
- `@supabase/supabase-js`: Database client
- `archiver`: ZIP file creation
- `pdfkit`: PDF generation
- `@svgdotjs/svg.js`, `svgdom`: SVG rendering
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variables

### Development Dependencies
- `typescript`: Type checking
- `tsx`: TypeScript execution
- `vitest`: Testing framework
- `eslint`: Code linting

## Development Conventions

- Written in TypeScript with strict mode enabled
- Uses ES modules (NodeNext)
- Follows RESTful API design principles
- Implements comprehensive error handling and logging
- Uses Ajv for JSON schema validation
- Includes OpenAPI specification for external integrations
- Comprehensive CORS configuration for GPT Action compatibility

## Testing Strategy

- Unit tests with Vitest framework
- API endpoint testing
- Integration tests for database operations
- Validation of JSON schemas

## Security Considerations

- Secure CORS configuration appropriate for GPT Actions
- User data isolation by userId
- Environment variable management for sensitive data
- Input validation for all API endpoints
- SQL injection prevention through parameterized queries