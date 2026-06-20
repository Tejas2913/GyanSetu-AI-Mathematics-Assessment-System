# GyanSetu — AI-Graded Practice Engine

**Class 10 Mathematics — Quadratic Equations**

An AI-powered practice and grading engine that provides step-wise feedback on student answers using Gemini 2.5 Flash.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| AI | Gemini 2.5 Flash (multimodal) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Supabase account
- Gemini API key

### 1. Clone and setup environment
```bash
cp .env.example client/.env
cp .env.example server/.env
# Edit both .env files with your actual keys
```

### 2. Setup Supabase
1. Create a new Supabase project
2. Run `database/migrations/001_initial_schema.sql` in SQL Editor
3. Run `database/rls_policies.sql` in SQL Editor
4. Create a storage bucket named `student-uploads`

### 3. Start the backend
```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```

### 5. Open the app
Visit `http://localhost:5173`

## Project Structure

```
gyansetu/
├── client/          # React + Vite + Tailwind frontend
├── server/          # FastAPI backend
├── database/        # SQL migrations and seed data
└── docs/            # Documentation
```

See `docs/setup.md` for detailed setup instructions.

## Features

- ✏️ **3-way input**: Typing, voice (Web Speech API), photo (Gemini Vision)
- 🤖 **AI step-wise grading**: Rubric-grounded, partial marks, structured feedback
- 📊 **Student dashboard**: Performance trends, weak topic analysis
- 📄 **Teacher/Parent reports**: Role-specific summaries
- 📐 **Cheat sheet**: MathJax-rendered formulas and concepts
- 🔥 **Hot questions**: Board exam frequency-tagged questions
