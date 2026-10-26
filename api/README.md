# amavocat API

Backend of the backoffice: authentication now, content entries and scheduled publishing next.
Fastify 5 + TypeScript, SQLite through Drizzle ORM, zod validation, Vitest.

## Local development

```bash
cd api
cp .env.example .env          # then adjust if needed
npm install
npm run user:create:dev -- --email aurelie@example.com --name "Aurélie Manier" --role admin
npm run dev                   # http://localhost:3000/api/health
npm test
```

`npm run dev` and `npm run user:create:dev` load `api/.env` when it exists.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Liveness check |
| POST | `/api/auth/login` | no | `{ email, password }`, sets the `amv_session` cookie. Limited to 5 attempts / 15 min / IP |
| POST | `/api/auth/logout` | cookie | Deletes the session and clears the cookie |
| GET | `/api/auth/me` | cookie | Current user |

Security notes: passwords are hashed with argon2id, only a SHA-256 of the session token is stored, the cookie is
`HttpOnly` + `SameSite=Strict` (+ `Secure` in production), and non-GET requests from an origin outside `CORS_ORIGINS`
are refused.

## Database

Migrations are generated from `src/db/schema.ts` with `npm run db:generate` and applied automatically when the
server (or the CLI) opens the database.

## Deployment on Alwaysdata

The `API` workflow (`.github/workflows/api.yml`) tests every pull request touching `api/`, and on `main` uploads the
build to a dedicated folder, installs production dependencies over SSH, then restarts the Node.js site through the
Alwaysdata API. It is skipped until the settings below exist.

One-time setup:

1. Alwaysdata, **Sites > Add a site**: type *Node.js*, address `api.aureliemanier-avocat.fr`,
   command `node dist/server.js`, working directory `/home/aureliemanier-avocat/api/`
   (outside `www/`, which the public site deploy wipes with `rsync --delete`).
   Environment variables:
   `NODE_ENV=production COOKIE_SECURE=true DATABASE_PATH=/home/aureliemanier-avocat/data/amavocat.sqlite
   CORS_ORIGINS=https://admin.aureliemanier-avocat.fr,https://aureliemanier-avocat.fr`.
2. Alwaysdata, **Profile > Tokens**: create an API token.
3. GitHub, environment `prod`: add variables `ALWAYSDATA_API_PATH=/home/aureliemanier-avocat/api/` and
   `ALWAYSDATA_API_SITE_ID=<id of the Node.js site>`, and secret `ALWAYSDATA_API_TOKEN`.
4. After the first deploy, create Aurélie's account over SSH:
   `cd ~/api && DATABASE_PATH=~/data/amavocat.sqlite npm run user:create -- --email ... --name "Aurélie Manier"`.
