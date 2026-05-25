# Plan: Modular Dye Formulation SaaS â€” Phase 1

**TL;DR**: Build the app using **Hexagonal Architecture (Ports & Adapters)** so every external dependency (database, auth, file storage, color engine) sits behind an abstract interface. Swapping Supabase for Firebase, or nearest-neighbor for an ML model, means writing a new adapter class and changing one env var â€” zero changes to business logic or API routes. Stack: Angular 17+ PWA â†’ Flask + Gunicorn â†’ Supabase (PostgreSQL + Auth + Storage). Every layer is replaceable.

---

## Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FRONTEND (Angular PWA)                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Features â”‚ â”‚ Shared   â”‚ â”‚ Core Services     â”‚   â”‚
â”‚  â”‚ (lazy)   â”‚ â”‚ (UI lib) â”‚ â”‚ (injectable,      â”‚   â”‚
â”‚  â”‚          â”‚ â”‚          â”‚ â”‚  swappable via DI) â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚ HTTP (REST API)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  BACKEND (Flask)                                  â”‚
â”‚                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚ Entrypoints â”‚â”€â”€â”€â–¶â”‚ Service Layer  â”‚              â”‚
â”‚  â”‚ (API routes)â”‚    â”‚ (Use cases)    â”‚              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                             â”‚ depends on PORTS only â”‚
â”‚                     â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚                     â”‚   PORTS        â”‚              â”‚
â”‚                     â”‚ (Abstract      â”‚              â”‚
â”‚                     â”‚  interfaces)   â”‚              â”‚
â”‚                     â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                             â”‚ implemented by        â”‚
â”‚                     â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚                     â”‚  ADAPTERS      â”‚              â”‚
â”‚                     â”‚ (Supabase,     â”‚              â”‚
â”‚                     â”‚  SQLAlchemy,   â”‚              â”‚
â”‚                     â”‚  Firebase...) â”‚              â”‚
â”‚                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Folder Structure

### Backend

```
backend/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ main.py                      # Flask app bootstrap
â”‚   â”œâ”€â”€ config.py                    # Pydantic BaseSettings (.env)
â”‚   â”œâ”€â”€ dependencies.py              # All provider/factory wiring factories
â”‚   â”‚
â”‚   â”œâ”€â”€ domain/                      # PURE business logic (NO infra imports)
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”œâ”€â”€ tenant.py            # Tenant entity
â”‚   â”‚   â”‚   â”œâ”€â”€ user.py              # User entity
â”‚   â”‚   â”‚   â”œâ”€â”€ profile.py           # Profile entity
â”‚   â”‚   â”‚   â”œâ”€â”€ base_dye.py          # BaseDye entity
â”‚   â”‚   â”‚   â”œâ”€â”€ recipe.py            # Recipe + RecipeIngredient entities
â”‚   â”‚   â”‚   â”œâ”€â”€ color.py             # Color value objects (LAB, RGB, Hex)
â”‚   â”‚   â”‚   â””â”€â”€ image.py             # UploadedImage entity
â”‚   â”‚   â””â”€â”€ exceptions.py            # Domain-specific exceptions
â”‚   â”‚
â”‚   â”œâ”€â”€ ports/                       # ABSTRACT INTERFACES (the contracts)
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ repositories/
â”‚   â”‚   â”‚   â”œâ”€â”€ base.py              # AbstractRepository[T] generic
â”‚   â”‚   â”‚   â”œâ”€â”€ profile_repo.py      # AbstractProfileRepository
â”‚   â”‚   â”‚   â”œâ”€â”€ recipe_repo.py       # AbstractRecipeRepository
â”‚   â”‚   â”‚   â”œâ”€â”€ base_dye_repo.py     # AbstractBaseDyeRepository
â”‚   â”‚   â”‚   â”œâ”€â”€ image_repo.py        # AbstractImageRepository
â”‚   â”‚   â”‚   â””â”€â”€ directory_repo.py    # AbstractDirectoryRepository
â”‚   â”‚   â”œâ”€â”€ auth.py                  # AbstractAuthProvider
â”‚   â”‚   â”œâ”€â”€ storage.py               # AbstractStorageProvider
â”‚   â”‚   â”œâ”€â”€ color_engine.py          # AbstractColorEngine (strategy)
â”‚   â”‚   â””â”€â”€ unit_of_work.py          # AbstractUnitOfWork
â”‚   â”‚
â”‚   â”œâ”€â”€ services/                    # USE CASES (orchestrate domain + ports)
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ auth_service.py          # Signup, login, token validation
â”‚   â”‚   â”œâ”€â”€ profile_service.py       # CRUD profiles + base dyes
â”‚   â”‚   â”œâ”€â”€ recipe_service.py        # CRUD recipes, import, search
â”‚   â”‚   â”œâ”€â”€ formulation_service.py   # Color matching + recipe generation
â”‚   â”‚   â”œâ”€â”€ directory_service.py     # Color directory management
â”‚   â”‚   â””â”€â”€ image_service.py         # Image upload + management
â”‚   â”‚
â”‚   â”œâ”€â”€ adapters/                    # CONCRETE IMPLEMENTATIONS
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ supabase/                # --- Supabase adapter bundle ---
â”‚   â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”‚   â”œâ”€â”€ client.py            # Supabase client singleton
â”‚   â”‚   â”‚   â”œâ”€â”€ repositories/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ profile_repo.py  # SupabaseProfileRepository
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ recipe_repo.py   # SupabaseRecipeRepository
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ base_dye_repo.py
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image_repo.py
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ directory_repo.py
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.py              # SupabaseAuthProvider
â”‚   â”‚   â”‚   â”œâ”€â”€ storage.py           # SupabaseStorageProvider
â”‚   â”‚   â”‚   â””â”€â”€ unit_of_work.py      # SupabaseUnitOfWork
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ sqlalchemy/              # --- SQLAlchemy adapter (future swap) ---
â”‚   â”‚   â”‚   â””â”€â”€ ...                  # Same structure, different implementation
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ color_engines/           # --- Color engine strategies ---
â”‚   â”‚       â”œâ”€â”€ __init__.py
â”‚   â”‚       â”œâ”€â”€ nearest_neighbor.py  # NearestNeighborEngine
â”‚   â”‚       â”œâ”€â”€ kubelka_munk.py      # KubelkaMunkEngine
â”‚   â”‚       â””â”€â”€ interpolation.py     # LAB interpolation (simple fallback)
â”‚   â”‚
â”‚   â”œâ”€â”€ entrypoints/                 # API ROUTES (thin, delegate to services)
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ router.py               # Main router aggregating all sub-routers
â”‚   â”‚   â”œâ”€â”€ auth_routes.py
â”‚   â”‚   â”œâ”€â”€ profile_routes.py
â”‚   â”‚   â”œâ”€â”€ recipe_routes.py
â”‚   â”‚   â”œâ”€â”€ formulation_routes.py
â”‚   â”‚   â”œâ”€â”€ directory_routes.py
â”‚   â”‚   â””â”€â”€ image_routes.py
â”‚   â”‚
â”‚   â””â”€â”€ schemas/                     # Pydantic request/response DTOs
â”‚       â”œâ”€â”€ __init__.py
â”‚       â”œâ”€â”€ auth.py
â”‚       â”œâ”€â”€ profile.py
â”‚       â”œâ”€â”€ recipe.py
â”‚       â”œâ”€â”€ formulation.py
â”‚       â”œâ”€â”€ directory.py
â”‚       â””â”€â”€ image.py
â”‚
â”œâ”€â”€ tests/
â”‚   â”œâ”€â”€ unit/                        # Test services with FakeRepository
â”‚   â”œâ”€â”€ integration/                 # Test adapters against real Supabase
â”‚   â””â”€â”€ e2e/                         # Test full API flow
â”‚
â”œâ”€â”€ .env                             # Environment configuration
â”œâ”€â”€ .env.example
â”œâ”€â”€ requirements.txt
â”œâ”€â”€ Dockerfile
â””â”€â”€ README.md
```

### Frontend

```
frontend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ core/                        # Singleton services & guards
â”‚   â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ auth.service.ts       # Abstract (InjectionToken)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ supabase-auth.service.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ auth.provider.ts      # Factory that picks implementation
â”‚   â”‚   â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ api.service.ts        # HTTP client wrapper
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ api.interceptor.ts    # JWT interceptor
â”‚   â”‚   â”‚   â”œâ”€â”€ storage/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ storage.service.ts     # Abstract
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ supabase-storage.service.ts
â”‚   â”‚   â”‚   â””â”€â”€ color/
â”‚   â”‚   â”‚       â”œâ”€â”€ color-converter.service.ts  # RGBâ†”LABâ†”Hex (culori)
â”‚   â”‚   â”‚       â””â”€â”€ color-converter.provider.ts
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ features/                    # Lazy-loaded feature modules
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard.component.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ dashboard.routes.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ profile-settings/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ profile-settings.component.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ base-dye-editor/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ profile-settings.routes.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ color-formulator/        # THE MAIN PAGE
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ color-formulator.component.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ color-wheel/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ color-wheel.component.ts  # iro.js wrapper
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ color-sliders/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ color-sliders.component.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ formulation-result/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ formulation-result.component.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-picker/        # IMAGE DROPPER FEATURE
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-picker.component.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dropper-canvas.component.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ zoom-loupe.component.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ color-formulator.routes.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ recipe-directory/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ recipe-directory.component.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ recipe-detail/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ recipe-directory.routes.ts
â”‚   â”‚   â”‚   â””â”€â”€ auth/
â”‚   â”‚   â”‚       â”œâ”€â”€ login.component.ts
â”‚   â”‚   â”‚       â””â”€â”€ auth.routes.ts
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ shared/                      # Reusable UI components
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ color-swatch/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dye-quantity-bar/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ batch-size-input/
â”‚   â”‚   â”‚   â”œâ”€â”€ pipes/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ color-format.pipe.ts
â”‚   â”‚   â”‚   â””â”€â”€ directives/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ app.component.ts
â”‚   â”‚   â”œâ”€â”€ app.config.ts                # bootstrapApplication providers
â”‚   â”‚   â””â”€â”€ app.routes.ts                # Top-level lazy routes
â”‚   â”‚
â”‚   â”œâ”€â”€ environments/
â”‚   â”‚   â”œâ”€â”€ environment.ts
â”‚   â”‚   â””â”€â”€ environment.prod.ts
â”‚   â”œâ”€â”€ styles/
â”‚   â”œâ”€â”€ manifest.webmanifest
â”‚   â””â”€â”€ index.html
â”‚
â”œâ”€â”€ angular.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ package.json
â”œâ”€â”€ Dockerfile
â””â”€â”€ README.md
```

---

## Step-by-Step Build Order

### Step 1 â€” Project Setup & Tooling (Day 1-2)

1. Create the monorepo root with `backend/` and `frontend/` directories, plus `docker-compose.yml`
2. **Backend**: `python -m venv venv`, install Flask, Gunicorn, pydantic-settings, supabase-py, colour-science, scipy, python-multipart, pytest
3. **Frontend**: `ng new frontend --standalone --style=scss --routing`, add `@angular/pwa`, install `iro.js`, `culori`, `@supabase/supabase-js`
4. **Supabase**: Create project at supabase.com, note the URL, anon key, and service role key
5. Create `.env` / `.env.example` with all config keys
6. Set up `app/config.py` with Pydantic `BaseSettings` reading from `.env`

### Step 2 â€” Domain Models (Day 2-3)

1. Define all domain entities as **plain Python dataclasses** (no ORM, no Supabase imports):
   - `Color` value object with `lab_l`, `lab_a`, `lab_b`, `hex`, `rgb` fields + conversion methods
   - `Tenant`, `User`, `Profile`, `BaseDye`, `Recipe`, `RecipeIngredient`, `UploadedImage`, `DirectoryEntry`
2. Define domain exceptions: `ColorOutOfGamutError`, `RecipeNotFoundError`, `ProfileNotFoundError`, `UnauthorizedError`
3. These models are the **core** â€” everything else depends on them, they depend on nothing

### Step 3 â€” Ports (Abstract Interfaces) (Day 3-4)

1. Define **repository ports** using `abc.ABC`:
   - `AbstractProfileRepository` â€” `create()`, `get_by_id()`, `list_by_user()`, `update()`, `delete()`
   - `AbstractBaseDyeRepository` â€” `create()`, `get_by_id()`, `list_by_profile()`, `update()`, `delete()`
   - `AbstractRecipeRepository` â€” `create()`, `get_by_id()`, `list_by_profile()`, `search_by_color()`, `delete()`, `bulk_import()`
   - `AbstractImageRepository` â€” `create()`, `list_by_profile()`, `delete()`
   - `AbstractDirectoryRepository` â€” `create()`, `list_by_profile()`, `search()`, `delete()`
2. Define **service ports**:
   - `AbstractAuthProvider` â€” `verify_token()`, `get_user_id()`, `signup()`, `login()`
   - `AbstractStorageProvider` â€” `upload_file()`, `get_url()`, `delete_file()`
   - `AbstractColorEngine` â€” `formulate(target_color, base_dyes, batch_size) â†’ list[RecipeIngredient]` and `find_closest_recipe(target_color, recipes) â†’ Recipe | None`
3. Define `AbstractUnitOfWork` â€” context manager exposing all repository instances + `commit()` / `rollback()`

### Step 4 â€” Supabase Adapters (Day 4-7)

1. Create `adapters/supabase/client.py` â€” singleton Supabase client from `supabase-py`
2. Implement each repository port:
   - Each method translates domain operations to Supabase query builder calls (`.from_("profiles").select("*").eq("user_id", uid).execute()`)
   - Convert Supabase response dicts back to domain entities
   - Handle Supabase-specific errors and wrap them in domain exceptions
3. Implement `SupabaseAuthProvider`:
   - `verify_token()` â€” decode Supabase JWT using the JWT secret
   - `signup()` â€” `supabase.auth.sign_up()`
   - `login()` â€” `supabase.auth.sign_in_with_password()`
4. Implement `SupabaseStorageProvider`:
   - `upload_file()` â€” `supabase.storage.from_("images").upload(path, file)`
   - `get_url()` â€” `supabase.storage.from_("images").get_public_url(path)`
   - `delete_file()` â€” `supabase.storage.from_("images").remove([path])`
5. Implement `SupabaseUnitOfWork` â€” wraps all Supabase repos; for MVP, commit/rollback can be passthrough since Supabase auto-commits, but the interface is maintained for future adapter compatibility

### Step 5 â€” Database Schema in Supabase (Day 5)

1. Run the SQL migration in Supabase SQL Editor:

```sql
-- Tenants (organizations/businesses)
CREATE TABLE tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (linked to Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (workspaces per user)
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    name TEXT NOT NULL,
    dye_form TEXT DEFAULT 'powder' CHECK (dye_form IN ('powder', 'liquid')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Base dyes configured per profile
CREATE TABLE base_dyes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    color_lab JSONB NOT NULL,          -- {"L": 50.0, "a": 20.5, "b": -14.2}
    form TEXT DEFAULT 'powder' CHECK (form IN ('powder', 'liquid')),
    concentration_g_per_l NUMERIC,     -- for liquid: grams per liter
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved recipes
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_color_hex TEXT NOT NULL,
    target_color_lab JSONB NOT NULL,
    total_batch_weight_mg NUMERIC NOT NULL,
    notes TEXT,
    source_image_url TEXT,             -- if recipe came from image dropper
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Recipe ingredients (composition)
CREATE TABLE recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    base_dye_id UUID REFERENCES base_dyes(id) NOT NULL,
    quantity_mg NUMERIC NOT NULL,
    quantity_ml NUMERIC,               -- auto-calculated for liquid
    percentage NUMERIC NOT NULL
);

-- Color directory (bookmarks/favorites)
CREATE TABLE color_directory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    recipe_id UUID REFERENCES recipes(id),
    color_hex TEXT NOT NULL,
    color_lab JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded images
CREATE TABLE uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,         -- path in Supabase Storage
    url TEXT NOT NULL,                  -- public/signed URL
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (enforces tenant isolation)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_dyes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own tenant's profiles
CREATE POLICY "Users see own tenant profiles" ON profiles
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    );
-- (Similar policies needed for all other tables)
```

2. Enable RLS on all tables
3. Create RLS policies for tenant isolation
4. Create Supabase Storage bucket `images` with per-user path policies
5. Test RLS works: insert test data, verify isolation

### Step 6 â€” Color Engine Adapters (Day 7-10)

1. **`NearestNeighborEngine`** (first, simplest):
   - Takes target CIELAB + list of existing recipes
   - Computes Î”Eâ‚€â‚€ (CIE 2000) for each using `colour-science`
   - Returns the closest recipe if Î”E < threshold, else `None`
2. **`LABInterpolationEngine`** (MVP formulation):
   - Takes target CIELAB + list of base dyes (each with their CIELAB)
   - Sets up a constrained optimization: minimize Î”Eâ‚€â‚€ between weighted CIELAB mix and target
   - Constraints: concentrations â‰¥ 0, sum = batch_size
   - Uses `scipy.optimize.minimize(method='SLSQP')`
   - Returns list of `RecipeIngredient` with quantities
3. **`KubelkaMunkEngine`** (better accuracy, later):
   - Requires K/S calibration data per base dye
   - Linear mixing in K/S space â†’ reflectance â†’ CIELAB
   - More accurate but needs spectral data (can be approximated from CIELAB using `colour-science`'s reflectance recovery)
4. All three implement the same `AbstractColorEngine` port

### Step 7 â€” Service Layer (Day 8-11)

1. **`FormulationService`** â€” the core:
   - Receives target color + profile_id
   - Loads profile's base dyes via UoW
   - First tries `engine.find_closest_recipe()` against existing recipes
   - If no close match, calls `engine.formulate()` with base dyes
   - Applies powderâ†”liquid conversion based on profile's `dye_form`
   - Returns the computed recipe
2. **`ProfileService`** â€” CRUD for profiles and base dyes
3. **`RecipeService`** â€” CRUD for recipes, bulk import, color-based search
4. **`ImageService`** â€” upload to storage, save metadata, list, delete
5. **`DirectoryService`** â€” bookmark colors, search by name or Î”E proximity
6. **`AuthService`** â€” signup/login orchestration, tenant creation

Each service takes the UoW and relevant ports via constructor (injected by Flask's provider/factory wiring).

### Step 8 â€” Dependencies & Wiring (Day 11-12)

1. Create `dependencies.py` with factory functions:
   - `get_settings()` â†’ cached `Settings` instance
   - `get_supabase_client()` â†’ singleton client
   - `get_unit_of_work()` â†’ reads `settings.db_backend` env var â†’ returns `SupabaseUnitOfWork` (or `SqlAlchemyUnitOfWork` in future)
   - `get_auth_provider()` â†’ reads `settings.auth_provider` â†’ returns `SupabaseAuthProvider`
   - `get_storage_provider()` â†’ returns `SupabaseStorageProvider`
   - `get_color_engine()` â†’ reads `settings.color_engine` â†’ returns the configured engine
   - `get_current_user()` â†’ validates JWT via auth provider, returns user entity
2. Define type aliases: `UowDep = Annotated[AbstractUnitOfWork, Depends(get_unit_of_work)]`
3. The `.env` file controls which adapter is active:
   ```
   DB_BACKEND=supabase          # or "sqlalchemy", "mongodb"
   AUTH_PROVIDER=supabase       # or "auth0", "firebase"
   STORAGE_PROVIDER=supabase    # or "s3", "local"
   COLOR_ENGINE=interpolation   # or "nearest_neighbor", "kubelka_munk"
   ```

### Step 9 â€” API Routes (Day 12-14)

1. Build thin route handlers in `entrypoints/`. Each route:
   - Receives request DTO (Pydantic schema)
   - Calls the appropriate service method
   - Returns response DTO
   - Example: `POST /profiles/{id}/formulate` â†’ calls `formulation_service.formulate(target_color, profile_id)` â†’ returns `FormulationResponse`
2. All routes depend on `get_current_user()` for auth
3. CORS middleware for Angular dev server
4. Register all routers in `main.py`

### Step 10 â€” Frontend Core (Day 14-17)

1. Set up Angular `app.config.ts` with providers (auth, API, storage â€” swappable via environment)
2. Build `core/api/api.service.ts` â€” typed HTTP client wrapping `HttpClient` + JWT interceptor
3. Build `core/auth/supabase-auth.service.ts` â€” login, signup, session management using `@supabase/supabase-js`
4. Build `core/color/color-converter.service.ts` â€” wraps `culori` for instant RGBâ†”CIELABâ†”Hex conversions
5. Set up routing with lazy-loaded features

### Step 11 â€” Frontend Features (Day 17-25)

1. **Auth pages** â€” Login/Signup using Supabase Auth
2. **Dashboard** â€” Profile list, create new profile
3. **Profile Settings** â€” Edit profile, manage base dyes with inline color pickers
4. **Color Formulator** (most complex):
   - `color-wheel.component.ts` â€” wraps `iro.js`, emits selected color on change
   - `color-sliders.component.ts` â€” L*, C*, hÂ°, warmth, tint sliders, each updating the target CIELAB via `color-converter.service`
   - `formulation-result.component.ts` â€” displays recipe ingredients, quantities, percentages with visual bars
   - Batch size input + powder/liquid toggle
   - "Formulate" button â†’ calls backend API â†’ displays result
   - Real-time color preview swatch
5. **Image Picker** (dropper feature):
   - `image-picker.component.ts` â€” drag-and-drop + file upload â†’ calls backend to store in Supabase Storage â†’ displays image
   - `dropper-canvas.component.ts` â€” renders image on `<canvas>`, captures pixel RGB on click using `getImageData()`
   - `zoom-loupe.component.ts` â€” a magnifying circle following cursor, rendering zoomed canvas region
   - On pick â†’ converts RGB to CIELAB â†’ feeds into color formulator
6. **Recipe Directory** â€” searchable table with color swatches, click-to-view detail
7. **Recipe Detail** â€” full composition view, pie chart, "re-formulate" button

### Step 12 â€” PWA Setup (Day 25-26)

1. Configure `ngsw-config.json` for caching app shell + API responses (recipes)
2. Create `manifest.webmanifest` with app name, icons, theme color
3. Service worker caches recipe directory for offline viewing
4. Test installability on mobile Chrome

### Step 13 â€” Testing (Day 26-29)

1. **Backend unit tests**: Create `FakeRepository` and `FakeUnitOfWork` implementations (in-memory). Test every service method without touching Supabase.
2. **Color engine tests**: Feed known recipes (from the 100 existing ones) as targets. Verify the engine returns matching compositions within Â±5%.
3. **Backend integration tests**: Test Supabase adapters against real (test) Supabase project.
4. **Frontend unit tests**: Jasmine/Karma for services and components with mocked API.
5. **E2E tests**: Playwright â€” full flow: login â†’ create profile â†’ add base dyes â†’ pick color â†’ formulate â†’ save recipe â†’ find in directory.

### Step 14 â€” Deployment (Day 29-30)

1. Dockerize backend (Flask + Gunicorn) and frontend (Angular build + Nginx)
2. `docker-compose.yml` for local development
3. Deploy backend to Railway/Render, frontend to Vercel
4. Connect to production Supabase project
5. GitHub Actions CI/CD: lint â†’ test â†’ build â†’ deploy on push to main

---

## How Swapping Works (The Modularity Promise)

| Want to swap...                        | What you do                                                                                                  | What you DON'T touch                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Database** (Supabase â†’ SQLAlchemy)   | Create `adapters/sqlalchemy/` with new repo implementations. Set `DB_BACKEND=sqlalchemy` in `.env`           | Domain models, services, routes, frontend     |
| **Auth** (Supabase â†’ Auth0)            | Create `adapters/auth0/auth.py` implementing `AbstractAuthProvider`. Set `AUTH_PROVIDER=auth0`               | Everything else                               |
| **Storage** (Supabase â†’ S3)            | Create `adapters/s3/storage.py` implementing `AbstractStorageProvider`. Set `STORAGE_PROVIDER=s3`            | Everything else                               |
| **Color engine** (interpolation â†’ ML)  | Create `adapters/color_engines/ml_model.py` implementing `AbstractColorEngine`. Set `COLOR_ENGINE=ml`        | Everything else                               |
| **Frontend framework** (Angular â†’ React)| Rebuild `frontend/` â€” backend API is untouched                                                              | Entire backend                                |

---

## Verification Checklist

1. **Modularity test**: Write one `FakeUnitOfWork` with in-memory repos. Run ALL service-layer tests with it. If they pass, your architecture is correctly decoupled.
2. **Color accuracy test**: Import 10 known recipes â†’ use their target colors as input â†’ verify engine output matches within Î”Eâ‚€â‚€ < 3.0.
3. **Tenant isolation test**: Create 2 users â†’ add recipes to each â†’ verify neither can see the other's data via API.
4. **Image dropper test**: Upload a solid-color image â†’ pick pixel â†’ verify extracted CIELAB matches the known color.
5. **PWA audit**: Run Lighthouse â†’ target PWA score > 90.

---

## Key Decisions

- **Hexagonal Architecture over layered MVC**: Enables the modularity requirement. More upfront structure, but every adapter is independently replaceable.
- **ABC over Protocol for ports**: Runtime enforcement prevents accidentally missing a method. Since we control all interfaces, ABC is clearer.
- **Gunicorn kept**: It's just the server runner â€” not a framework. Zero learning curve. Building a custom HTTP server would take months for no benefit.
- **Supabase for all three concerns (DB + Auth + Storage)**: Simplifies Phase 1. The modular architecture means any piece can be swapped later.
- **Color engine as Strategy pattern**: Allows starting with simple interpolation, graduating to K-M or ML without touching the rest of the system.
- **Client-side image color picking**: Canvas API extracts pixels instantly in the browser â€” no need to send images to the backend for pixel analysis.

---

## Wireframe Prompt (for AI wireframe tools)

Design a responsive web application wireframe for a dye formulation SaaS tool. The app helps dye traders create color shade recipes by mixing base dyes.

**Pages needed:**

1. **Login page** â€” clean, minimal, with "Sign in" button and company branding area.

2. **Dashboard** â€” shows a list of user's profiles as cards (each card shows profile name, number of recipes, dye form: powder/liquid). A "Create New Profile" button. Top nav bar with user avatar, notifications bell, and logout.

3. **Profile Settings** â€” form to edit profile name, select dye form (powder/liquid toggle). Below that, a "Base Dyes" section: a table/list of 3â€“4 base dyes, each row showing a color swatch, dye name, and for liquid: concentration (g/L). Add/edit/delete base dye buttons. Each base dye has a small color picker to set its color.

4. **Color Formulator (MAIN PAGE)** â€” this is the hero screen. Layout:
   - **Left**: A large color wheel (hue ring with saturation/brightness triangle or square inside). Below the wheel: hex input field, RGB inputs, and CIELAB (L*, a*, b*) numeric inputs.
   - **Center**: Vertical stack of 5 sliders with labels: "Lightness", "Chroma/Saturation", "Hue", "Warmth", "Tint". Each slider has a gradient track showing the color change. A large color preview swatch at the top showing the currently selected color.
   - **Right**: "Formulation Result" panel â€” a card titled "Recipe". Input field at top: "Batch size: ___ grams". Below: a list of base dyes, each showing: color swatch, dye name, quantity (e.g., "12.5 mg" or "2.3 mL"), and a horizontal bar showing percentage. At the bottom: "Save Recipe" button and "Add to Directory" button.
   - **Top bar**: Profile selector dropdown, powder/liquid toggle.

5. **Recipe Directory** â€” a searchable data table with columns: Color (swatch), Recipe Name, Date Created, Batch Size, Actions (view/edit/delete). A search bar at top with color-based search (pick a color and find closest recipes). Clicking a row opens...

6. **Recipe Detail** â€” shows the target color as a large swatch, the full ingredient list with quantities, a pie chart of proportions, and an "Adjust & Re-formulate" button that takes the user back to the Formulator with this color pre-loaded.

7. **Image Color Picker** â€” accessible from the Color Formulator page via a "Pick from Image" button. Layout:
   - **Top**: Drag-and-drop zone with text "Upload an image or drop it here" and a file browse button. Shows recent uploads as thumbnails below.
   - **Center**: The uploaded image displayed at full width with a crosshair cursor. A circular magnifying loupe (3x zoom) follows the cursor showing individual pixels. On click, the pixel color is captured.
   - **Bottom-left**: Preview of the picked color as a large swatch, with hex, RGB, and CIELAB values displayed.
   - **Bottom-right**: "Use this color" button that sends the picked color to the Color Formulator page (pre-fills the color wheel and sliders). "Adjust before formulating" option.
   - The image should support pinch-to-zoom on mobile and scroll-wheel zoom on desktop for precise picking from thread/fabric photos.

**Design system**: Modern, clean, dark theme option. Use a neutral background with vibrant color swatches. Sans-serif font. Card-based layout. Mobile responsive â€” on small screens, the Formulator page stacks vertically (wheel â†’ sliders â†’ result).

