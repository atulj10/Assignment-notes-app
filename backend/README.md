# Notes API

A production-quality Notes REST API built with Node.js, Express, PostgreSQL (via Supabase), Prisma ORM, and JWT authentication. Supports full-text search, tag filtering, pagination, and note sharing.

## Prerequisites

- Node.js 20+
- A Supabase account (free tier works) or any PostgreSQL instance
- npm or Docker

## Environment Variables

| Variable | Description |
|---|----|
| `DATABASE_URL` | Pooled PostgreSQL connection string for runtime (port 6543, with `?pgbouncer=true`) |
| `DIRECT_URL` | Direct PostgreSQL connection string for Prisma migrations (port 5432, no pooler) |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (default: `24h`) |
| `PORT` | Server port (default: `3000`) |

## Local Setup

### 1. Clone and install

```bash
cd backend
cp .env.example .env
npm install
```

### 2. Configure database

Edit `.env` with your Supabase connection strings from Project Settings > Database > Connection string.

```
DATABASE_URL=postgresql://postgres.hhclbdpatyeawicggbyc:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.hhclbdpatyeawicggbyc:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your-jwt-secret-here
```

- `DATABASE_URL` — pooled connection (port 6543) used at runtime by the app
- `DIRECT_URL` — direct connection (port 5432) used only by `prisma migrate` commands

### 3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

This creates the `users`, `notes`, and `note_shares` tables with proper indexes.

### 4. Add full-text search index

Run the SQL in `prisma/extensions/fulltext_search.sql` via your Supabase SQL editor or psql:

```bash
psql $DATABASE_URL -f prisma/extensions/fulltext_search.sql
```

### 5. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`.

## Running with Docker

```bash
docker-compose up --build
```

## Deployment (Render)

1. Push your code to a GitHub repository.
2. In Render Dashboard, create a **New Blueprint** and connect your repo.
3. Render will auto-detect `render.yaml` at the root and deploy the backend service.
4. Set `DATABASE_URL` and `JWT_SECRET` manually in Render dashboard (marked as `sync: false` in render.yaml).

## API Endpoints

### Auth

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

### Notes (all require Bearer token)

**List notes**
```bash
curl http://localhost:3000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**List notes with pagination**
```bash
curl "http://localhost:3000/api/notes?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**List notes filtered by tag**
```bash
curl "http://localhost:3000/api/notes?tag=work" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get a single note**
```bash
curl http://localhost:3000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create a note**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My Note","content":"Hello world","tags":["work","ideas"]}'
```

**Update a note**
```bash
curl -X PUT http://localhost:3000/api/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Title","content":"Updated content"}'
```

**Delete a note**
```bash
curl -X DELETE http://localhost:3000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Share a note**
```bash
curl -X POST http://localhost:3000/api/notes/NOTE_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"share_with_email":"other@example.com"}'
```

### Search

```bash
curl "http://localhost:3000/api/notes/search?q=keyword" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl "http://localhost:3000/api/notes/search?q=keyword&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Misc

```bash
curl http://localhost:3000/api/about
curl http://localhost:3000/api/openapi.json
```
