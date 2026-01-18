# Bug Tracker App

A full-stack Bug Tracker CRUD application with Django REST Framework backend and Next.js frontend.

## Tech Stack

- **Backend**: Python 3.12, Django 5, Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh) using djangorestframework-simplejwt
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Testing**: pytest, Jest, Playwright

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
│   └── tests/             # Jest + Playwright tests
├── docker-compose.yml
└── README.md
```

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings (defaults work for Docker)
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker compose up --build

# In a new terminal, run migrations
docker compose exec backend python manage.py migrate

# Create a superuser (optional)
docker compose exec backend python manage.py createsuperuser
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **API Documentation**: http://localhost:8000/api/docs/
- **API Schema**: http://localhost:8000/api/schema/

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

#### Frontend E2E Tests
```bash
# Make sure the app is running
docker compose exec frontend npm run test:e2e
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

## Environment Variables

See `.env.example` for all available configuration options.

## License

MIT
