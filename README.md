# HeartBox

A private place for families (and close friends) to keep and share their memories.

- A **HeartBox** is a private group, usually a family. People join with an invite code.
- A **Relic** is anything placed in a HeartBox: a photo, video, recipe, story or tradition.
  Relics can be filed under occasions (Christmas, Weddings, Birthdays, ...).
- Your **timeline** shows relics from every HeartBox you belong to. Relics are never
  visible outside the HeartBox they were placed in.

Created by Diego Cuevas, Kyle Mantovani and Rob Mantovani.

## Stack

| Part | Tech |
|---|---|
| Web app | Next.js 16 (App Router), React 19, Tailwind (`frontend/`) |
| API | Django 5 + Django REST Framework, session auth (`backend/heartbox/`) |
| Database | PostgreSQL 16 |
| Media | Cloudinary (images resized on upload; delivered with `f_auto,q_auto` and a width) |
| Hosting | Docker Compose + Caddy (automatic HTTPS) on one small server |

The browser only talks to one origin. `/api`, `/accounts`, `/admin` and `/static`
go to Django; everything else goes to Next.js. In development Next.js does this
forwarding (see `frontend/next.config.js`); in production Caddy does (see `Caddyfile`).
This keeps the session and CSRF cookies first-party, so no CORS setup is needed.

## Local development

Requirements: Python 3.12, Node 22, and Docker (for Postgres) or a local Postgres.

```bash
# 1. Database + API
cd backend/heartbox
cp .env.example .env            # add Cloudinary keys if you want uploads to work
docker compose up -d db         # or point DATABASE_URL at your own Postgres
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver      # http://localhost:8000

# 2. Web app (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3000
```

Password-reset emails are printed to the Django console in development.

> **Existing local databases:** migrations used to be gitignored, and the schema
> changed (duplicate relations removed, `Family.creator` added, PINs hashed). The
> simplest path is a fresh database: `docker compose down -v && docker compose up -d db`
> then `python manage.py migrate`.

### Checks

```bash
cd backend/heartbox && python manage.py test api      # needs Postgres
cd frontend && npm run lint && npm run typecheck && npm run build
```

CI runs the same checks on every pull request (`.github/workflows/ci.yml`).

## Deploying

The cheapest reliable setup is one small VPS (Hetzner, DigitalOcean, Lightsail;
2 GB RAM is plenty to start) running `docker-compose.yml`:

1. Point your domain's DNS `A` record at the server.
2. On the server: clone the repo, `cp .env.example .env`, fill in `DOMAIN`,
   `SECRET_KEY`, `POSTGRES_PASSWORD`, Cloudinary keys and SMTP settings.
3. `docker compose up -d --build`. Caddy fetches the HTTPS certificate on first request.
   Migrations run automatically when the API container starts.
4. `docker compose exec backend python manage.py createsuperuser` for `/admin`.
5. Back up Postgres, for example with a nightly cron:
   `docker compose exec -T db pg_dump -U heartbox heartbox | gzip > backup-$(date +%F).sql.gz`
   and copy it off the server (e.g. to Cloudflare R2 or Backblaze B2).

Social login (Google/Facebook/GitHub) needs the provider keys in `.env` and the
callback URL `https://<DOMAIN>/accounts/<provider>/login/callback/` registered with
each provider.

### Other hosting options

- **Frontend on Vercel, API on Render/Railway/Fly:** set `BACKEND_URL` in Vercel to the
  API's URL so Next.js proxies `/api`. Note that Vercel's free Hobby plan does not allow
  commercial use.
- **Managed Postgres** (Neon, Supabase, Render): set `DATABASE_URL`.

## Keeping running costs down

Media storage and bandwidth are the main costs. The app already:

- compresses photos in the browser before upload (usually under 1 MB each) and caps
  uploads at 10 MB for images and 50 MB for videos (`MAX_*_UPLOAD_BYTES`);
- downscales images to at most 2048 px when they are stored;
- serves images at the size the layout needs, in modern formats (`src/utils/media.ts`);
- paginates feeds (20 relics per page) and polls notifications once a minute, only
  while the tab is visible.

If Cloudinary's free tier runs out, the next step is moving storage to Cloudflare R2
(no egress fees) with direct browser uploads.

## API overview

All endpoints are under `/api/` and need a signed-in session unless noted.

| Endpoint | Purpose |
|---|---|
| `POST user/sign-up`, `user/sign-in`, `user/logout`; `GET user/check-login` | Auth (sign-up, sign-in and check-login are public) |
| `POST user/forgot-password`, `user/reset-password` | Password reset (public, rate limited) |
| `GET/POST user/families`; `PATCH user/families/<id>/settings`; `POST .../remove-member` | HeartBoxes |
| `POST user/families/join-family`, `PATCH user/families/leave-family` | Membership |
| `GET user/posts` (`?familyId=`, `?userId=`, `?postId=`, `?before=&limit=`) | Relic feeds |
| `POST user/posts`; `PATCH/DELETE user/posts/<id>`; `POST/DELETE user/posts/<id>/like` | Relics |
| `GET user/posts/category/<slug>/`, `GET user/categories` | Categories |
| `GET/POST/DELETE user/comments` | Comments |
| `GET user/search?q=` | People, HeartBoxes and relics you can see |
| `GET user/notifications`, `user/notification/count` | Notifications |
| `GET api/health` | Health check (public) |
