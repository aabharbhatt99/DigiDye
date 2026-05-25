# DyeMix - Dye Formulation SaaS Platform

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python run.py
```

Backend runs at: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: http://localhost:4200

### Demo Credentials

- **Email:** demo@dyemix.com
- **Password:** demo123

The demo comes pre-seeded with:
- 1 profile (Wool Dyeing - Acid Dyes)
- 4 base dyes (CMYK)
- 8 sample recipes
- 5 color directory entries

---

## Architecture

This application follows **Hexagonal Architecture (Ports & Adapters)**:

```
Frontend (Angular 17 PWA)
    ↓ HTTP REST API
Backend (Flask)
    ├── Entrypoints (API routes)
    ├── Services (Use cases)
    ├── Ports (Abstract interfaces)
    └── Adapters (Concrete implementations)
        ├── InMemory (demo/testing)
        └── Supabase (production - coming)
```

### Swapping Adapters

Change the `.env` file to swap any dependency:

```env
DB_BACKEND=inmemory     # or "supabase"
AUTH_PROVIDER=inmemory  # or "supabase", "auth0"
STORAGE_PROVIDER=inmemory  # or "supabase", "s3"
COLOR_ENGINE=interpolation  # or "nearest_neighbor", "kubelka_munk"
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── domain/models/    # Pure dataclasses (no infra imports)
│   │   ├── ports/            # Abstract interfaces
│   │   ├── services/         # Business logic (use cases)
│   │   ├── adapters/         # Concrete implementations
│   │   │   └── inmemory/     # In-memory adapter (demo)
│   │   └── entrypoints/      # API routes
│   ├── .env                  # Configuration
│   └── run.py                # Entry point
├── frontend/
│   └── src/app/
│       ├── core/             # Auth, API services
│       └── features/         # Lazy-loaded pages
└── requirements/             # Project documentation
```
