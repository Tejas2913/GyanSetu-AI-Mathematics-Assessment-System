# GyanSetu — Local Development Setup Guide

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Python | 3.11+ | `python --version` |
| pip | Latest | `pip --version` |

## Step 1: Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down from **Settings → API**:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **Anon/Public key** (for the client)
   - **Service role key** (for the server — keep secret!)
   - **JWT secret** (from Settings → API → JWT Settings)
3. Go to **SQL Editor** and run:
   - `database/migrations/001_initial_schema.sql` — creates all 11 tables
   - `database/rls_policies.sql` — enables Row Level Security
4. Go to **Storage** and create a bucket:
   - Name: `student-uploads`
   - Public: `false`
   - File size limit: `5MB`
   - Allowed MIME types: `image/*`
5. Go to **Authentication → Providers** and ensure Email auth is enabled

## Step 2: Environment Variables

Copy `.env.example` and fill in values:

```bash
# Client
cp .env.example client/.env
# Edit client/.env — fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Server
cp .env.example server/.env
# Edit server/.env — fill ALL variables
```

## Step 3: Backend Setup

```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify: `http://localhost:8000/health` should return `{"status": "healthy"}`

## Step 4: Frontend Setup

```bash
cd client
npm install
npm run dev
```

Verify: `http://localhost:5173` should load the app

## Step 5: Seed Data (Phase 2)

```bash
cd database/seed
python seed.py
```

## Development Workflow

| Command | Location | Purpose |
|---|---|---|
| `npm run dev` | `client/` | Start Vite dev server (port 5173) |
| `uvicorn main:app --reload` | `server/` | Start FastAPI dev server (port 8000) |
| `python -m pytest` | `server/` | Run backend tests |
| `npm run build` | `client/` | Build production bundle |

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
