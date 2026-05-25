# Requirements Document â€” DyeMix: Dye Formulation SaaS Platform

## Document Info

| Field        | Value                                 |
| ------------ | ------------------------------------- |
| Project Name | DyeMix (working title)                |
| Version      | 1.0                                   |
| Phase        | Phase 1 â€” Core Formulation Engine     |
| Date         | 2026-03-23                            |
| Status       | Draft                                 |

---

## 1. Project Overview

### 1.1 Business Context

DyeMix is a SaaS application for the dye trading industry. The operator buys base color dyes (powder form) from manufacturers, then mixes them to create custom shades based on client requirements. Currently, recipe formulation is done manually through experience and trial-and-error.

### 1.2 Problem Statement

- Manual dye mixing is time-consuming and error-prone.
- Recipes exist only in the operator's memory or scattered notes.
- No systematic way to reproduce a shade consistently.
- Client requests a specific shade â†’ operator must guess proportions â†’ multiple physical trials.
- Liquid dye preparation lacks standardized guidance.
- No way to extract exact color from a physical sample (thread, fabric photo) digitally.

### 1.3 Solution

A web-based application that:

1. Allows users to visually select a target color via a color wheel, manual input, or by picking from an uploaded image.
2. Computes the exact quantities of base dyes needed to reproduce that color.
3. Stores recipes in a searchable, per-user database.
4. Supports both powder (mg) and liquid (mL) dye forms.
5. Allows picking colors directly from uploaded images (dropper tool).
6. Is fully modular â€” every external dependency (database, auth, storage, color engine) can be swapped independently.

### 1.4 Phase Roadmap

| Phase   | Scope                                                                | Status  |
| ------- | -------------------------------------------------------------------- | ------- |
| Phase 1 | Color formulation engine, recipe CRUD, image dropper, multi-tenancy  | Current |
| Phase 2 | Hardware sensor integration (thread color scanning)                  | Planned |
| Phase 3 | Advanced ML-based formulation, analytics, reporting                  | Planned |

### 1.5 Target Users

- Dye traders who buy base dyes from manufacturers and mix custom shades.
- Multiple businesses (tenants) can use the platform independently.
- Each tenant can have multiple users (owner, admin, member roles).

---

## 2. Functional Requirements

### 2.1 User Management & Multi-Tenancy

| ID     | Requirement                                                                      | Priority |
| ------ | -------------------------------------------------------------------------------- | -------- |
| UM-001 | Users can sign up with email and password                                        | P0       |
| UM-002 | Users can log in and receive a JWT session                                       | P0       |
| UM-003 | Each signup creates a new tenant (organization/business)                         | P0       |
| UM-004 | Users within the same tenant share data; cross-tenant data is completely hidden  | P0       |
| UM-005 | User roles: owner, admin, member (owner created on signup; others invited later) | P1       |
| UM-006 | Password reset via email                                                         | P1       |
| UM-007 | Session persistence (stay logged in across browser restarts)                     | P1       |
| UM-008 | Tenant isolation enforced at both application layer AND database layer (RLS)     | P0       |

### 2.2 Profiles

| ID     | Requirement                                                                                  | Priority |
| ------ | -------------------------------------------------------------------------------------------- | -------- |
| PR-001 | A user can create multiple profiles (workspaces)                                             | P0       |
| PR-002 | Each profile has a name and a dye form setting (powder or liquid)                            | P0       |
| PR-003 | Each profile contains its own set of base dyes (typically 3â€“4)                               | P0       |
| PR-004 | Profiles are scoped to the user within a tenant                                              | P0       |
| PR-005 | User can switch between profiles from any page via a dropdown                                | P0       |
| PR-006 | Deleting a profile cascades: deletes all associated base dyes, recipes, directory entries, and uploaded images | P0 |

### 2.3 Base Dye Configuration

| ID     | Requirement                                                                                    | Priority |
| ------ | ---------------------------------------------------------------------------------------------- | -------- |
| BD-001 | User can add base dyes to a profile (name + color)                                             | P0       |
| BD-002 | Each base dye has a color value stored as CIELAB (L\*, a\*, b\*) and displayed as hex/sRGB     | P0       |
| BD-003 | Each base dye has a form (powder/liquid) matching the profile default, overridable per dye      | P0       |
| BD-004 | For liquid dyes: concentration field (grams per liter) must be specified                        | P0       |
| BD-005 | User can edit or delete individual base dyes                                                    | P0       |
| BD-006 | A profile should support 2â€“8 base dyes                                                          | P0       |
| BD-007 | Default base dye presets available (CMYK-like: Cyan, Magenta, Yellow, Black)                    | P1       |

### 2.4 Color Selection & Adjustment

| ID     | Requirement                                                                                | Priority |
| ------ | ------------------------------------------------------------------------------------------ | -------- |
| CS-001 | Interactive color wheel/circle for selecting a target color                                 | P0       |
| CS-002 | Manual hex input field for precise color entry                                              | P0       |
| CS-003 | Manual RGB input fields (R, G, B)                                                          | P0       |
| CS-004 | Manual CIELAB input fields (L\*, a\*, b\*)                                                 | P0       |
| CS-005 | Lightness slider (maps to L\* in CIELAB, range 0â€“100)                                      | P0       |
| CS-006 | Chroma/Saturation slider (maps to C\* in LCh, range 0â€“150)                                 | P0       |
| CS-007 | Hue slider (maps to hÂ° in LCh, range 0Â°â€“360Â°)                                             | P0       |
| CS-008 | Warmth slider (shifts b\* axis: blue â†” yellow, range -128 to +128)                         | P1       |
| CS-009 | Tint slider (shifts a\* axis: green â†” red, range -128 to +128)                             | P1       |
| CS-010 | All inputs and sliders are bidirectionally synchronized (change one â†’ all update instantly)  | P0       |
| CS-011 | Real-time color preview swatch showing the currently selected color                         | P0       |
| CS-012 | Out-of-gamut warning when selected CIELAB color cannot be accurately displayed in sRGB      | P1       |

### 2.5 Color Formulation (Core Feature)

| ID     | Requirement                                                                                                      | Priority |
| ------ | ---------------------------------------------------------------------------------------------------------------- | -------- |
| CF-001 | Given a target color and a profile's base dyes, compute the recipe (quantities of each base dye)                 | P0       |
| CF-002 | User specifies total batch size in grams (powder) or milliliters (liquid)                                        | P0       |
| CF-003 | Output shows each base dye's quantity in milligrams (powder) or milliliters (liquid)                             | P0       |
| CF-004 | Output shows percentage contribution of each base dye                                                            | P0       |
| CF-005 | Visual horizontal bars showing proportions of each dye                                                           | P1       |
| CF-006 | If a close recipe already exists in the database (Î”Eâ‚€â‚€ < configurable threshold), suggest it before computing   | P0       |
| CF-007 | Color engine uses CIELAB color space for all matching and computation                                            | P0       |
| CF-008 | Powder-to-liquid conversion: `quantity_ml = quantity_mg / concentration_g_per_l`                                  | P0       |
| CF-009 | Formulation algorithm is pluggable (nearest-neighbor, CIELAB interpolation, Kubelka-Munk) via Strategy pattern   | P0       |
| CF-010 | Active algorithm is configurable via environment variable without code changes                                    | P0       |
| CF-011 | Show predicted output color swatch alongside the target for visual comparison                                    | P1       |
| CF-012 | Show Î”Eâ‚€â‚€ value between predicted output and target color                                                        | P1       |

### 2.6 Recipe Management

| ID     | Requirement                                                                                      | Priority |
| ------ | ------------------------------------------------------------------------------------------------ | -------- |
| RM-001 | Save a formulation result as a named recipe                                                      | P0       |
| RM-002 | List all recipes for a profile in a searchable, sortable, paginated table                        | P0       |
| RM-003 | View recipe detail: target color swatch, full ingredient list with quantities, proportions        | P0       |
| RM-004 | Edit recipe name and notes                                                                       | P0       |
| RM-005 | Delete a recipe                                                                                  | P0       |
| RM-006 | Search recipes by target color (find closest match by Î”Eâ‚€â‚€)                                     | P1       |
| RM-007 | Search recipes by name (text search)                                                             | P0       |
| RM-008 | Bulk import recipes from CSV or JSON file                                                        | P1       |
| RM-009 | Recipes are scoped to a profile and visible only to the owning tenant's users                    | P0       |
| RM-010 | "Re-formulate" button on recipe detail: loads the target color into the formulator for adjustment | P1       |

### 2.7 Color Directory

| ID     | Requirement                                                                              | Priority |
| ------ | ---------------------------------------------------------------------------------------- | -------- |
| CD-001 | Users can bookmark/save colors to a directory with a name and optional category           | P1       |
| CD-002 | Directory is browsable and searchable by name or category                                | P1       |
| CD-003 | Clicking a directory entry loads its linked recipe composition instantly                  | P1       |
| CD-004 | Directory entries are scoped to a profile                                                | P1       |

### 2.8 Image Upload & Color Dropper

| ID     | Requirement                                                                                          | Priority |
| ------ | ---------------------------------------------------------------------------------------------------- | -------- |
| IM-001 | User can upload images (JPEG, PNG, WebP) up to 10 MB                                                 | P0       |
| IM-002 | Uploaded images are stored in cloud storage (Supabase Storage initially, swappable to S3 etc.)        | P0       |
| IM-003 | Uploaded images are listed per profile with thumbnails                                                | P0       |
| IM-004 | User can delete uploaded images                                                                      | P0       |
| IM-005 | Uploaded image is rendered on a `<canvas>` element for interactive color picking                      | P0       |
| IM-006 | Dropper tool: click on any pixel in the image to extract its RGB color                                | P0       |
| IM-007 | Zoom loupe: a magnifying circle (3â€“5x zoom) follows the cursor for precise pixel selection            | P0       |
| IM-008 | Pinch-to-zoom on mobile, scroll-wheel zoom on desktop for navigating large images                    | P1       |
| IM-009 | Extracted color is displayed as a preview swatch with hex, RGB, and CIELAB values                     | P0       |
| IM-010 | "Use this color" button sends the extracted color to the color formulator (pre-fills wheel + sliders) | P0       |
| IM-011 | Optionally link the source image to a saved recipe for traceability                                   | P1       |
| IM-012 | Color extraction happens entirely on the frontend (Canvas API `getImageData`) â€” no server round-trip  | P0       |
| IM-013 | Drag-and-drop file upload supported alongside file browse button                                     | P0       |

### 2.9 Powder-to-Liquid Guidance

| ID     | Requirement                                                                              | Priority |
| ------ | ---------------------------------------------------------------------------------------- | -------- |
| PL-001 | In-app guidance section on dissolving powder dyes into liquid form                        | P1       |
| PL-002 | Guidance covers: concentration, solvent (water), temperature, filtration, shelf life      | P1       |
| PL-003 | Warning for reactive dyes: liquid stock shelf life is 2â€“4 weeks                          | P1       |
| PL-004 | Recommendation to use standardized concentrations for consistent volumetric dosing        | P1       |
| PL-005 | Preservative recommendation for liquid stocks stored > 1 week                            | P2       |
| PL-006 | Filtration reminder: filter dissolved dye through fine mesh to remove undissolved particles| P2       |

---

## 3. Non-Functional Requirements

### 3.1 Architecture â€” Modularity

| ID     | Requirement                                                                                                     | Priority |
| ------ | --------------------------------------------------------------------------------------------------------------- | -------- |
| AR-001 | **Hexagonal Architecture (Ports & Adapters)** â€” domain and services depend only on abstract interfaces (ports)  | P0       |
| AR-002 | Every external dependency (database, auth, storage, color engine) is behind an abstract port                    | P0       |
| AR-003 | Swapping any adapter requires only: (a) new adapter class implementing the port, (b) env var change. Zero changes to domain, services, or routes. | P0 |
| AR-004 | **Repository Pattern** for all data access â€” abstract repository interfaces with concrete implementations       | P0       |
| AR-005 | **Unit of Work Pattern** for atomic database operations â€” abstract UoW with concrete implementations            | P0       |
| AR-006 | **Strategy Pattern** for color engine â€” algorithm is pluggable without changing calling code                     | P0       |
| AR-007 | **Dependency Injection** via Flask's provider/factory wiring with factory functions that read env vars to select adapters  | P0       |
| AR-008 | Frontend services are injectable and swappable via Angular DI (`InjectionToken` + factory providers)            | P0       |
| AR-009 | Domain models are plain Python dataclasses with zero infrastructure imports                                     | P0       |
| AR-010 | Configuration via Pydantic `BaseSettings` reading from `.env` file                                              | P0       |

### 3.2 Technology Stack

| Component         | Technology                            | Swappable With                         |
| ----------------- | ------------------------------------- | -------------------------------------- |
| Frontend          | Angular 17+ (standalone, PWA)         | React, Vue (backend API unchanged)     |
| UI Color Picker   | iro.js                                | Any color picker library               |
| Client Color Math | culori (npm)                          | colorjs.io, chroma.js                  |
| Backend Framework | Flask (Python 3.11+)                | Django REST, Flask                     |
| Server Runner     | Gunicorn (WSGI server)                 | Hypercorn, Daphne                      |
| Color Engine      | colour-science + scipy                | Custom ML model, external API          |
| Database          | Supabase (PostgreSQL)                 | Raw PostgreSQL, MongoDB, Firebase      |
| Auth              | Supabase Auth                         | Auth0, Firebase Auth, custom JWT       |
| File Storage      | Supabase Storage                      | AWS S3, GCS, local filesystem          |
| Hosting (Backend) | Railway / Render                      | AWS, GCP, self-hosted VPS              |
| Hosting (Frontend)| Vercel                                | Netlify, Cloudflare Pages              |
| CI/CD             | GitHub Actions                        | GitLab CI, CircleCI                    |

### 3.3 Performance

| ID     | Requirement                                    | Target     |
| ------ | ---------------------------------------------- | ---------- |
| PF-001 | Color formulation API response time             | < 2 sec    |
| PF-002 | Page load time (first contentful paint)         | < 1.5 sec  |
| PF-003 | Color picker / slider interaction latency       | < 50 ms    |
| PF-004 | Image upload (10 MB file)                       | < 5 sec    |
| PF-005 | Recipe directory search                         | < 500 ms   |
| PF-006 | Client-side color space conversions             | < 5 ms     |

### 3.4 Security

| ID     | Requirement                                                                                 |
| ------ | ------------------------------------------------------------------------------------------- |
| SC-001 | All API endpoints (except signup/login) require valid JWT authentication                    |
| SC-002 | Multi-tenant data isolation enforced at database level via Row Level Security (RLS)         |
| SC-003 | Multi-tenant data isolation enforced at application level via `tenant_id` filtering         |
| SC-004 | File uploads validated: type whitelist (JPEG, PNG, WebP only), max size 10 MB               |
| SC-005 | CORS restricted to allowed frontend origins only                                            |
| SC-006 | Environment secrets (API keys, JWT secrets) never committed to version control              |
| SC-007 | HTTPS enforced in production                                                                |
| SC-008 | Uploaded images stored in per-tenant storage paths with access policies                     |

### 3.5 Scalability & Maintainability

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| SM-001 | Stateless backend â€” horizontally scalable behind a load balancer                       |
| SM-002 | Database connection pooling via Supabase's built-in pooler (PgBouncer)                 |
| SM-003 | Frontend lazy-loads feature modules â€” initial bundle < 200 KB gzipped                  |
| SM-004 | Comprehensive test suite: unit, integration, E2E                                       |
| SM-005 | CI/CD pipeline: lint â†’ test â†’ build â†’ deploy on every push to main                    |
| SM-006 | Docker containerized for consistent local dev and deployment                           |

### 3.6 PWA Requirements

| ID     | Requirement                                                          |
| ------ | -------------------------------------------------------------------- |
| PW-001 | Installable on mobile and desktop (manifest.webmanifest + service worker) |
| PW-002 | Offline access to cached recipe directory (read-only)                |
| PW-003 | App shell caching for instant repeat visits                          |
| PW-004 | Lighthouse PWA score > 90                                            |
| PW-005 | Responsive layout: mobile-first, stacks vertically on small screens  |

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
Tenant (1) â”€â”€â”€â”€â”€â”€â”€â”€ (N) User
User   (1) â”€â”€â”€â”€â”€â”€â”€â”€ (N) Profile
Profile (1) â”€â”€â”€â”€â”€â”€â”€ (N) BaseDye
Profile (1) â”€â”€â”€â”€â”€â”€â”€ (N) Recipe
Profile (1) â”€â”€â”€â”€â”€â”€â”€ (N) DirectoryEntry
Profile (1) â”€â”€â”€â”€â”€â”€â”€ (N) UploadedImage
Recipe  (1) â”€â”€â”€â”€â”€â”€â”€ (N) RecipeIngredient
RecipeIngredient (N) â”€â”€ (1) BaseDye
DirectoryEntry   (N) â”€â”€ (0..1) Recipe
Recipe           (N) â”€â”€ (0..1) UploadedImage (source)
```

### 4.2 Entity Specifications

#### Tenant

| Field      | Type      | Constraints       | Description              |
| ---------- | --------- | ----------------- | ------------------------ |
| id         | UUID      | PK, auto-gen      | Unique identifier        |
| name       | string    | NOT NULL           | Organization name        |
| created_at | timestamp | DEFAULT now()      | Creation timestamp       |

#### User

| Field        | Type   | Constraints                      | Description                    |
| ------------ | ------ | -------------------------------- | ------------------------------ |
| id           | UUID   | PK, matches Supabase Auth UID   | Unique identifier              |
| tenant_id    | UUID   | FK â†’ Tenant, NOT NULL            | Owning organization            |
| email        | string | NOT NULL                          | Email address                  |
| display_name | string | nullable                          | Display name                   |
| role         | enum   | owner / admin / member            | Role within tenant             |
| created_at   | timestamp | DEFAULT now()                  | Creation timestamp             |

#### Profile

| Field      | Type   | Constraints                 | Description                      |
| ---------- | ------ | --------------------------- | -------------------------------- |
| id         | UUID   | PK, auto-gen                | Unique identifier                |
| tenant_id  | UUID   | FK â†’ Tenant, NOT NULL        | Owning organization              |
| user_id    | UUID   | FK â†’ User, NOT NULL          | Owning user                      |
| name       | string | NOT NULL                     | Profile/workspace name           |
| dye_form   | enum   | powder / liquid              | Default dye form for this profile|
| created_at | timestamp | DEFAULT now()             | Creation timestamp               |

#### BaseDye

| Field                | Type    | Constraints                           | Description                              |
| -------------------- | ------- | ------------------------------------- | ---------------------------------------- |
| id                   | UUID    | PK, auto-gen                          | Unique identifier                        |
| profile_id           | UUID    | FK â†’ Profile, CASCADE, NOT NULL        | Parent profile                           |
| name                 | string  | NOT NULL                               | Dye name (e.g., "Cyan", "Magenta")       |
| color_hex            | string  | NOT NULL                               | Hex color code (e.g., "#00FFFF")         |
| color_lab            | JSON    | NOT NULL, `{L, a, b}`                 | CIELAB color values                      |
| form                 | enum    | powder / liquid                        | Physical form of this dye                |
| concentration_g_per_l| decimal | nullable, required if form = liquid    | Concentration in grams per liter         |
| created_at           | timestamp | DEFAULT now()                        | Creation timestamp                       |

#### Recipe

| Field                  | Type    | Constraints                      | Description                                  |
| ---------------------- | ------- | -------------------------------- | -------------------------------------------- |
| id                     | UUID    | PK, auto-gen                     | Unique identifier                            |
| profile_id             | UUID    | FK â†’ Profile, CASCADE, NOT NULL   | Parent profile                               |
| name                   | string  | NOT NULL                          | Recipe name                                  |
| target_color_hex       | string  | NOT NULL                          | Target color hex code                        |
| target_color_lab       | JSON    | NOT NULL, `{L, a, b}`            | Target color in CIELAB                       |
| total_batch_weight_mg  | decimal | NOT NULL                          | Total batch size in milligrams               |
| notes                  | text    | nullable                          | User notes about this recipe                 |
| source_image_url       | string  | nullable                          | If recipe originated from image dropper      |
| created_at             | timestamp | DEFAULT now()                   | Creation timestamp                           |

#### RecipeIngredient

| Field        | Type    | Constraints                         | Description                               |
| ------------ | ------- | ----------------------------------- | ----------------------------------------- |
| id           | UUID    | PK, auto-gen                        | Unique identifier                         |
| recipe_id    | UUID    | FK â†’ Recipe, CASCADE, NOT NULL       | Parent recipe                             |
| base_dye_id  | UUID    | FK â†’ BaseDye, NOT NULL               | Which base dye                            |
| quantity_mg  | decimal | NOT NULL                             | Amount in milligrams                      |
| quantity_ml  | decimal | nullable, auto-calculated for liquid | Amount in milliliters                     |
| percentage   | decimal | NOT NULL                             | Percentage of total batch                 |

#### DirectoryEntry

| Field      | Type    | Constraints                        | Description                      |
| ---------- | ------- | ---------------------------------- | -------------------------------- |
| id         | UUID    | PK, auto-gen                       | Unique identifier                |
| profile_id | UUID    | FK â†’ Profile, CASCADE, NOT NULL     | Parent profile                   |
| name       | string  | NOT NULL                            | Color/entry name                 |
| category   | string  | nullable                            | User-defined category            |
| recipe_id  | UUID    | FK â†’ Recipe, nullable               | Linked recipe (optional)         |
| color_hex  | string  | NOT NULL                            | Color hex code                   |
| color_lab  | JSON    | NOT NULL, `{L, a, b}`              | Color in CIELAB                  |
| created_at | timestamp | DEFAULT now()                     | Creation timestamp               |

#### UploadedImage

| Field        | Type    | Constraints                        | Description                         |
| ------------ | ------- | ---------------------------------- | ----------------------------------- |
| id           | UUID    | PK, auto-gen                       | Unique identifier                   |
| profile_id   | UUID    | FK â†’ Profile, CASCADE, NOT NULL     | Parent profile                      |
| file_name    | string  | NOT NULL                            | Original file name                  |
| storage_path | string  | NOT NULL                            | Path in cloud storage bucket        |
| url          | string  | NOT NULL                            | Public or signed URL for access     |
| created_at   | timestamp | DEFAULT now()                     | Upload timestamp                    |

---

## 5. API Specification

### 5.1 Authentication

| Method | Endpoint       | Description                | Auth Required |
| ------ | -------------- | -------------------------- | ------------- |
| POST   | /auth/signup   | Register new user + tenant | No            |
| POST   | /auth/login    | Login, returns JWT         | No            |
| POST   | /auth/logout   | Invalidate session         | Yes           |
| POST   | /auth/refresh  | Refresh JWT token          | Yes           |

### 5.2 Profiles

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| GET    | /profiles        | List user's profiles   |
| POST   | /profiles        | Create a new profile   |
| GET    | /profiles/{id}   | Get profile details    |
| PUT    | /profiles/{id}   | Update profile         |
| DELETE | /profiles/{id}   | Delete profile (cascades) |

### 5.3 Base Dyes

| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | /profiles/{id}/base-dyes         | List base dyes for profile |
| POST   | /profiles/{id}/base-dyes         | Add a base dye             |
| PUT    | /profiles/{id}/base-dyes/{dye_id}| Update a base dye          |
| DELETE | /profiles/{id}/base-dyes/{dye_id}| Delete a base dye          |

### 5.4 Formulation

| Method | Endpoint                     | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| POST   | /profiles/{id}/formulate    | Compute recipe for target color     |

**Request body:**

```json
{
  "target_color_hex": "#A0522D",
  "target_color_lab": { "L": 43.8, "a": 29.4, "b": 35.7 },
  "batch_size_mg": 1000,
  "dye_form": "powder"
}
```

**Response body:**

```json
{
  "target_color": {
    "hex": "#A0522D",
    "lab": { "L": 43.8, "a": 29.4, "b": 35.7 }
  },
  "closest_existing_recipe": null,
  "formulation": {
    "ingredients": [
      { "base_dye_id": "uuid", "name": "Magenta", "quantity_mg": 350, "quantity_ml": null, "percentage": 35.0 },
      { "base_dye_id": "uuid", "name": "Yellow", "quantity_mg": 500, "quantity_ml": null, "percentage": 50.0 },
      { "base_dye_id": "uuid", "name": "Cyan", "quantity_mg": 100, "quantity_ml": null, "percentage": 10.0 },
      { "base_dye_id": "uuid", "name": "Black", "quantity_mg": 50, "quantity_ml": null, "percentage": 5.0 }
    ],
    "total_mg": 1000,
    "predicted_color": { "hex": "#A2542F", "lab": { "L": 44.1, "a": 29.0, "b": 35.2 } },
    "delta_e": 1.2
  }
}
```

### 5.5 Recipes

| Method | Endpoint                                  | Description                     |
| ------ | ----------------------------------------- | ------------------------------- |
| GET    | /profiles/{id}/recipes                   | List recipes (paginated)        |
| POST   | /profiles/{id}/recipes                   | Save a new recipe               |
| GET    | /profiles/{id}/recipes/{recipe_id}       | Get recipe detail               |
| PUT    | /profiles/{id}/recipes/{recipe_id}       | Update recipe (name, notes)     |
| DELETE | /profiles/{id}/recipes/{recipe_id}       | Delete recipe                   |
| POST   | /profiles/{id}/recipes/search-color      | Find closest recipes by Î”Eâ‚€â‚€   |
| POST   | /profiles/{id}/recipes/import            | Bulk import from CSV/JSON       |

### 5.6 Color Directory

| Method | Endpoint                                  | Description                 |
| ------ | ----------------------------------------- | --------------------------- |
| GET    | /profiles/{id}/directory                 | List directory entries      |
| POST   | /profiles/{id}/directory                 | Add to directory            |
| DELETE | /profiles/{id}/directory/{entry_id}      | Remove from directory       |
| GET    | /profiles/{id}/directory/search          | Search by name/category     |

### 5.7 Images

| Method | Endpoint                                  | Description              |
| ------ | ----------------------------------------- | ------------------------ |
| POST   | /profiles/{id}/images/upload             | Upload image (multipart) |
| GET    | /profiles/{id}/images                    | List uploaded images     |
| DELETE | /profiles/{id}/images/{image_id}         | Delete image             |

---

## 6. Color Science Specification

### 6.1 Color Spaces

| Space  | Purpose                                       | Used In          |
| ------ | --------------------------------------------- | ---------------- |
| sRGB   | Display on screen, user input/output          | Frontend (culori)|
| CIELAB | Internal storage, comparison, formulation     | Backend (colour-science) |
| LCh    | Slider mapping (Lightness, Chroma, Hue angle) | Backend (colour-science) |
| Hex    | User-friendly display and input               | Both             |

### 6.2 Color Difference Metric

- Primary metric: **Î”Eâ‚€â‚€ (CIE 2000)** â€” perceptually uniform and the textile industry standard.
- Thresholds:
  - Î”Eâ‚€â‚€ < 1.0 â†’ imperceptible to the human eye (exact match).
  - Î”Eâ‚€â‚€ < 3.0 â†’ acceptable in the textile industry (close match).
  - Î”Eâ‚€â‚€ > 5.0 â†’ noticeably different.
- The "close match" threshold should be configurable per profile.

### 6.3 Conversion Pipeline

```
RGB (sRGB, screen) 
  â†’ linearize (remove gamma) 
  â†’ XYZ (via sRGB â†’ XYZ matrix, D65 illuminant) 
  â†’ CIELAB (via nonlinear f(t) transformation)
  â†” LCh (cylindrical form: L*, C*, hÂ°)

Reverse: CIELAB â†’ XYZ â†’ linear RGB â†’ sRGB (apply gamma)
```

### 6.4 Formulation Algorithms (Pluggable via Strategy Pattern)

#### Algorithm 1: CIELAB Nearest Neighbor

- Search existing recipe database for smallest Î”Eâ‚€â‚€ distance to the target color.
- Returns an existing recipe if Î”Eâ‚€â‚€ < threshold.
- Fast and simple, but depends on having a comprehensive recipe database.
- Best as a "first pass" before computing a new formulation.

#### Algorithm 2: CIELAB Weighted Interpolation (MVP Default)

- Constrained optimization: minimize Î”Eâ‚€â‚€ between the weighted average of base dye CIELAB values and the target.
- Constraints: all weights â‰¥ 0, sum of weights = 1.
- Solver: `scipy.optimize.minimize(method='SLSQP')`.
- Less physically accurate than Kubelka-Munk but functional without spectral calibration data.
- Suitable for MVP with 3â€“4 base dyes.

#### Algorithm 3: Kubelka-Munk (Advanced, Phase 1 stretch goal)

- Physics-based subtractive color mixing model.
- Uses K/S (absorption/scattering) coefficients per base dye, which are linear in concentration.
- Mixing: $\frac{K}{S}_{mix} = \sum c_i \cdot \frac{K}{S}_i$
- Requires spectral calibration data per base dye (reflectance curves at known concentrations).
- Can approximate calibration from CIELAB using `colour-science`'s reflectance recovery (Jakob 2019).
- Most accurate for real-world dye mixing prediction.

### 6.5 Slider-to-CIELAB Mapping

| Slider    | Parameter    | Range        | Visual Effect               |
| --------- | ------------ | ------------ | --------------------------- |
| Lightness | L*           | 0 â€“ 100      | Darker â†” Lighter            |
| Chroma    | C* (in LCh)  | 0 â€“ 150      | Muted/Gray â†” Vivid/Pure     |
| Hue       | hÂ° (in LCh)  | 0Â° â€“ 360Â°    | Rotate through color wheel  |
| Warmth    | b*           | -128 to +128 | Cool (blue) â†” Warm (yellow) |
| Tint      | a*           | -128 to +128 | Green â†” Red                 |

### 6.6 Powder-to-Liquid Conversion Formula

When a profile is set to "liquid" mode and base dyes have concentration specified:

```
quantity_ml = quantity_mg / concentration_g_per_l
```

Where `concentration_g_per_l` is grams of powder per liter of solvent (e.g., 50 g/L means 50 mg/mL).

---

## 7. User Interface Specification

### 7.1 Pages

| #  | Page               | Description                                                     |
| -- | ------------------ | --------------------------------------------------------------- |
| 1  | Login / Signup     | Auth forms via Supabase Auth                                    |
| 2  | Dashboard          | Profile cards, quick stats, create new profile                  |
| 3  | Profile Settings   | Edit profile, manage base dyes with inline color pickers        |
| 4  | Color Formulator   | **Main page** â€” color wheel + sliders + formulation result      |
| 5  | Image Color Picker | Upload image, dropper tool, zoom loupe, use picked color        |
| 6  | Recipe Directory   | Searchable table of saved recipes with color swatches           |
| 7  | Recipe Detail      | Full composition, proportions chart, re-formulate button        |

### 7.2 Color Formulator Page Layout (Desktop)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [Profile: â–¼ My Profile]  [Batch: 100g]  [â— Powder â—‹ Liquid]     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  FORMULATION RESULT          â”‚
â”‚   COLOR WHEEL    â”‚  â”‚  Preview   â”‚  â”‚                              â”‚
â”‚   (iro.js)       â”‚  â”‚  Swatch    â”‚  â”‚  Magenta  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  350 mg   â”‚
â”‚                  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  Yellow   â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 500mg â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚                  â”‚  Cyan     â–ˆâ–ˆâ–ˆâ–ˆ  100 mg       â”‚
â”‚  â”‚ Hex: #A052 â”‚  â”‚  Lightness â”â”â”  â”‚  Black    â–ˆâ–ˆ  50 mg          â”‚
â”‚  â”‚ R:160 G:82  â”‚  â”‚  Chroma    â”â”â”  â”‚                              â”‚
â”‚  â”‚ B:45        â”‚  â”‚  Hue       â”â”â”  â”‚  Total: 1000 mg              â”‚
â”‚  â”‚ L:43.8      â”‚  â”‚  Warmth    â”â”â”  â”‚  Î”Eâ‚€â‚€: 1.2                  â”‚
â”‚  â”‚ a:29.4      â”‚  â”‚  Tint      â”â”â”  â”‚                              â”‚
â”‚  â”‚ b:35.7      â”‚  â”‚                  â”‚  [Save Recipe] [Add to Dir] â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  [Pick from      â”‚                              â”‚
â”‚                  â”‚   Image ðŸ“·]      â”‚                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
Mobile: stacks vertically (wheel â†’ sliders â†’ result)
```

### 7.3 Image Color Picker Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  Drop image here or [Browse Files]               â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚                                          (ðŸ”)    â”‚  â”‚
â”‚  â”‚          UPLOADED IMAGE                  Loupe   â”‚  â”‚
â”‚  â”‚          (rendered on <canvas>)          follows  â”‚  â”‚
â”‚  â”‚          click = pick pixel color       cursor   â”‚  â”‚
â”‚  â”‚                                                  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                        â”‚
â”‚  â”‚  Picked:   â”‚  Hex: #A0522D                          â”‚
â”‚  â”‚  [swatch]  â”‚  LAB: 43.8, 29.4, 35.7                â”‚
â”‚  â”‚            â”‚  RGB: 160, 82, 45                      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  [Use This Color â†’]                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.4 Design System

- Modern, clean aesthetic with optional dark theme.
- Neutral background with vibrant color swatches for contrast.
- Sans-serif font (Inter or system font stack).
- Card-based layout for profiles, recipes, and results.
- Mobile responsive â€” breakpoints at 768px (tablet) and 480px (phone).
- On small screens, the Color Formulator stacks vertically: wheel â†’ sliders â†’ result.

---

## 8. Architecture â€” Modularity Specification

### 8.1 Hexagonal Architecture Layers

| Layer        | Contains                                     | Depends On        | Depended By      |
| ------------ | -------------------------------------------- | ----------------- | ---------------- |
| Domain       | Entities, value objects, domain exceptions   | Nothing           | Everything       |
| Ports        | Abstract interfaces (ABC classes)            | Domain models     | Services, Adapters |
| Services     | Use-case orchestration, business logic       | Domain + Ports    | Entrypoints      |
| Adapters     | Concrete implementations (Supabase, etc.)    | Ports + Domain    | Dependencies.py  |
| Entrypoints  | API routes (thin controllers)                | Services + Schemas| External clients |
| Schemas      | Pydantic DTOs (request/response)             | Domain models     | Entrypoints      |

### 8.2 Port Definitions

| Port                      | Methods                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `AbstractProfileRepository`  | `create()`, `get_by_id()`, `list_by_user()`, `update()`, `delete()`     |
| `AbstractBaseDyeRepository`  | `create()`, `get_by_id()`, `list_by_profile()`, `update()`, `delete()`  |
| `AbstractRecipeRepository`   | `create()`, `get_by_id()`, `list_by_profile()`, `search_by_color()`, `delete()`, `bulk_import()` |
| `AbstractImageRepository`    | `create()`, `list_by_profile()`, `delete()`                              |
| `AbstractDirectoryRepository`| `create()`, `list_by_profile()`, `search()`, `delete()`                  |
| `AbstractAuthProvider`       | `verify_token()`, `get_user_id()`, `signup()`, `login()`                |
| `AbstractStorageProvider`    | `upload_file()`, `get_url()`, `delete_file()`                            |
| `AbstractColorEngine`        | `formulate(target, base_dyes, batch_size)`, `find_closest_recipe(target, recipes)` |
| `AbstractUnitOfWork`         | `__enter__()`, `__exit__()`, `commit()`, `rollback()`, repository properties |

### 8.3 Adapter Swap Matrix

| Swap Scenario                  | Create                                                            | Change Env Var               | Don't Touch                       |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------- | --------------------------------- |
| Database: Supabase â†’ SQLAlchemy| `adapters/sqlalchemy/` (repos + UoW)                              | `DB_BACKEND=sqlalchemy`      | Domain, services, routes, frontend|
| Auth: Supabase â†’ Auth0         | `adapters/auth0/auth.py`                                          | `AUTH_PROVIDER=auth0`        | Everything else                   |
| Storage: Supabase â†’ S3         | `adapters/s3/storage.py`                                          | `STORAGE_PROVIDER=s3`        | Everything else                   |
| Color Engine: Interp â†’ ML      | `adapters/color_engines/ml_model.py`                              | `COLOR_ENGINE=ml`            | Everything else                   |
| Frontend: Angular â†’ React      | Rebuild `frontend/`                                               | N/A                          | Entire backend                    |

### 8.4 Environment Configuration

```env
# .env â€” controls which adapters are active

# Database
DB_BACKEND=supabase                    # supabase | sqlalchemy | mongodb
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=super-secret-jwt-token

# Auth
AUTH_PROVIDER=supabase                 # supabase | auth0 | firebase

# Storage
STORAGE_PROVIDER=supabase              # supabase | s3 | local
STORAGE_BUCKET=images

# Color Engine
COLOR_ENGINE=interpolation             # nearest_neighbor | interpolation | kubelka_munk

# Application
APP_ENV=development                    # development | production
CORS_ORIGINS=http://localhost:4200
```

---

## 9. Deployment & Infrastructure

| Component         | Service               | Notes                                             |
| ----------------- | --------------------- | ------------------------------------------------- |
| Backend hosting   | Railway or Render      | Docker container running Flask + Gunicorn         |
| Frontend hosting  | Vercel                 | Angular build served via global CDN                |
| Database          | Supabase               | Managed PostgreSQL with RLS and connection pooling |
| Auth              | Supabase Auth          | JWT-based, email/password login                    |
| File Storage      | Supabase Storage       | `images` bucket with per-tenant path policies      |
| DNS + SSL         | Cloudflare             | Free tier, automatic HTTPS                         |
| CI/CD             | GitHub Actions         | lint â†’ test â†’ build â†’ deploy on push to main       |
| Containerization  | Docker + docker-compose| Local dev environment consistency                  |

---

## 10. Testing Strategy

| Level        | Tool            | Scope                                                                                  |
| ------------ | --------------- | -------------------------------------------------------------------------------------- |
| Unit         | pytest          | Domain models, service layer (using FakeRepository + FakeUnitOfWork â€” zero DB needed)  |
| Unit         | Jasmine / Karma | Angular services, components, pipes                                                    |
| Integration  | pytest          | Supabase adapters against a test Supabase project                                      |
| E2E          | Playwright      | Full user flows: login â†’ create profile â†’ formulate â†’ save â†’ search                   |
| Color Engine | pytest          | Validate formulation against 10+ known recipes; assert Î”Eâ‚€â‚€ < 3.0                     |
| Modularity   | pytest          | Run ALL service tests with FakeUnitOfWork â€” proves decoupling                          |
| PWA          | Lighthouse      | Score > 90 for PWA, Performance, Accessibility                                         |
| Security     | Manual + CI     | Tenant isolation: 2 users, verify data invisibility; file upload validation             |

---

## 11. Acceptance Criteria (Phase 1 Complete When...)

- [ ] A user can sign up, log in, and create a profile with 3â€“4 base dyes.
- [ ] The color formulator displays a color wheel with hex/RGB/CIELAB inputs and 5 sliders.
- [ ] All color inputs and sliders are bidirectionally synchronized in real-time.
- [ ] Clicking "Formulate" returns a recipe with quantities for each base dye.
- [ ] Recipes can be saved, listed, searched by name, and viewed in detail.
- [ ] Recipes are isolated per tenant â€” cross-tenant data is invisible.
- [ ] A user can upload an image, use the dropper tool to pick a color, and formulate from it.
- [ ] The zoom loupe works for precise pixel selection.
- [ ] Powder/liquid toggle correctly converts quantities (mg â†” mL).
- [ ] Bulk recipe import from CSV works with 100 records.
- [ ] The app is installable as a PWA on mobile and desktop.
- [ ] All service-layer tests pass with FakeUnitOfWork (proving modularity).
- [ ] The color engine returns formulations within Î”Eâ‚€â‚€ < 3.0 of known recipes.

---

## 12. Glossary

| Term              | Definition                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| CIELAB (L\*a\*b\*)| Perceptually uniform color space. L\*=lightness, a\*=greenâ†”red axis, b\*=blueâ†”yellow axis       |
| LCh               | Cylindrical form of CIELAB. L\*=lightness, C\*=chroma (saturation), hÂ°=hue angle               |
| Î”Eâ‚€â‚€              | CIE 2000 color difference formula. < 1.0 = imperceptible, < 3.0 = acceptable in textiles       |
| Kubelka-Munk      | Physics model for light interaction with pigmented materials. Foundation of industrial color matching |
| K/S               | Absorption-to-scattering ratio in Kubelka-Munk theory. Linear in dye concentration.            |
| sRGB              | Standard RGB color space used by monitors and the web                                           |
| Gamut             | The range of colors a device or color space can represent                                       |
| Port              | Abstract interface in hexagonal architecture â€” a contract that adapters implement               |
| Adapter           | Concrete implementation of a port (e.g., SupabaseRepository implements AbstractRepository)      |
| Tenant            | An organization/business using the SaaS platform. Data is isolated between tenants              |
| Profile           | A workspace within a tenant, configured with specific base dyes and containing its own recipes  |
| Base Dye          | A fundamental color dye (powder or liquid) used as an ingredient in mixing                      |
| Recipe            | A formula specifying quantities of base dyes needed to produce a target color                   |
| PWA               | Progressive Web App â€” installable, offline-capable web application                              |
| RLS               | Row Level Security â€” PostgreSQL feature enforcing data access rules at the database level       |
| JWT               | JSON Web Token â€” compact, signed token used for stateless authentication                        |
| UoW               | Unit of Work â€” pattern that groups database operations into an atomic transaction               |

