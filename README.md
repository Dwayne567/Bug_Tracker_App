# Bug Tracker App

A production-ready full-stack Bug Tracker CRUD application with Django REST Framework backend and Next.js frontend, featuring JWT authentication, PostgreSQL database, and Docker containerization.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Django](https://img.shields.io/badge/Django-5.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## Features

- 🔐 **JWT Authentication** - Secure login/register with access & refresh tokens
- 🐛 **Bug Management** - Full CRUD operations for bug reports
- 🔍 **Search & Filter** - Filter by severity, status, and search by text
- 📱 **Responsive UI** - Mobile-friendly Tailwind CSS design
- 🐳 **Docker Ready** - One-command setup with Docker Compose
- ✅ **Tested** - Backend (pytest) and Frontend (Jest, Cypress) tests

## Tech Stack

- **Backend**: Python 3.12, Django 5, Django REST Framework
- **Database**: PostgreSQL 16
- **Authentication**: JWT (access + refresh) using djangorestframework-simplejwt
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Testing**: pytest, Jest, Cypress
- **DevOps**: Docker, Docker Compose

## Project Structure

```
/
├── backend/                 # Django REST API
│   ├── config/             # Django project settings
│   ├── bugs/               # Bug tracking app
│   └── tests/              # pytest tests
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # API client, utilities
│   └── cypress/           # Cypress E2E tests
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd Bug_Tracker_App

# Copy environment file
cp .env.example .env  # On Windows Git Bash
# OR
copy .env.example .env  # On Windows CMD
```

### 2. Start with Docker Compose

```bash
# Build and start all services (first build takes ~5-10 minutes)
docker compose up --build

# In a new terminal, run database migrations
docker compose exec backend python manage.py migrate

# Create an admin user (optional)
docker compose exec backend python manage.py createsuperuser
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000/api/ |
| **API Documentation** | http://localhost:8000/api/docs/ |
| **Django Admin** | http://localhost:8000/admin/ |

### 4. Default Login

A default admin user is created with the migrations. You can log in immediately:

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `Admin123!` |

Or click **Register** at http://localhost:3000 to create a new account.

### 5. Using the App

1. Open http://localhost:3000
2. Sign in with the default credentials above, or register a new account
3. Start creating and managing bug reports!

## Development

### Running Tests

#### Backend Tests
```bash
docker compose exec backend pytest -v
```

#### Frontend Unit Tests
```bash
docker compose exec frontend npm test
```

#### Frontend E2E Tests (Cypress)
```bash
# Headless run (make sure the app is running)
cd frontend
npm run test:e2e

# Interactive Cypress Test Runner
npm run test:e2e:open
```

### Local Development (without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/` - Obtain JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### Bug Reports
- `GET /api/bugs/` - List bugs (with filtering, search, pagination)
- `POST /api/bugs/` - Create bug
- `GET /api/bugs/{id}/` - Get bug details
- `PUT /api/bugs/{id}/` - Update bug
- `PATCH /api/bugs/{id}/` - Partial update bug
- `DELETE /api/bugs/{id}/` - Delete bug

### Query Parameters for /api/bugs/
- `severity` - Filter by severity (low, medium, high, critical)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `search` - Search in title and description
- `ordering` - Sort field (default: -created_at)

## Common Commands

```bash
# Start the app (detached mode)
docker compose up -d

# Stop the app
docker compose down

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart backend

# Run Django shell
docker compose exec backend python manage.py shell

# Create database backup
docker compose exec postgres pg_dump -U bugtracker bugtracker_db > backup.sql
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `SECRET_KEY` - Django secret key (auto-generated for development)
- `DEBUG` - Set to `False` in production
- `POSTGRES_*` - Database connection settings
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend

## Database Access (DBeaver / pgAdmin)

Connect to the PostgreSQL database with any SQL client:

| Field | Value |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `bugtracker` |
| **Username** | `bugtracker` |
| **Password** | `bugtracker_password` |

## Troubleshooting

**Docker daemon not running:**
- Make sure Docker Desktop is open and running

**Port already in use:**
- Change ports in `docker-compose.yml` or stop conflicting services

**Database connection errors:**
- Wait a few seconds for PostgreSQL to initialize
- Run `docker compose restart backend`

## License

MIT
