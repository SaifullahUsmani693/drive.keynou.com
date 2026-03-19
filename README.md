# Keynou Drive (Django + Next.js)

Manual subscription management with multi-tenant URL shortening and analytics.

## Prerequisites

- Python 3.12+
- Node.js 18+
- Redis (for caching)
- PostgreSQL (optional, SQLite works for dev)

## Backend setup (Django)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_default_tenant
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Backend environment variables

Set these in your shell or a `.env` file (example values shown):

```bash
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=*
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000
DJANGO_DB=sqlite
POSTGRES_DB=keynou_drive
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

## Frontend setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Frontend environment variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Useful URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Django Admin: http://localhost:8000/admin

## Admin panel usage

After logging in with a user whose profile has `is_admin=true`, visit:

- http://localhost:3000/admin

From there, you can enable access, adjust link caps, and review subscription requests.
