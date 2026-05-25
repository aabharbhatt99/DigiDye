# Product Requirements Document (PRD): DyeMix - Dye Formulation SaaS Platform (Phase 1)

## Document Info

| Field           | Value                                              |
| --------------- | -------------------------------------------------- |
| Project Name    | DyeMix                                             |
| Version         | 2.0                                                |
| Phase           | Phase 1 - Core Formulation Engine                  |
| Date            | 2026-04-05                                         |
| Status          | Final Draft                                        |
| Implementation  | Step 1: Recipe Directory -> Step 2: Color Engine    |

---

## 1. Overview

### 1.1 Purpose

DyeMix is a SaaS platform for the textile dye trading industry. Operators buy base CMYK dyes (powder form) from manufacturers, then mix them to create custom shades for clients. Currently, recipe formulation is done manually through trial-and-error, taking 1-2 days and 4-5 physical trials per shade. DyeMix aims to:

- Replace manual trial-and-error color matching with software-calculated recipes.
- Digitize and centralize the 500-600 recipes currently stored in physical diaries.
- Enable consistent shade reproduction across batches and operators.
- Reduce first-try matching from 4-5 trials to a single software-calculated recipe with 95% accuracy.

### 1.2 Scope

Phase 1 covers the complete foundation of the DyeMix platform, implemented in two sequential steps:

| Step   | Name                  | Scope                                                                                     |
| ------ | --------------------- | ----------------------------------------------------------------------------------------- |
| Step 1 | **Recipe Directory**  | Auth, multi-tenancy, profiles, base dye config, recipe CRUD, color directory, bulk import |
| Step 2 | **Color Engine**      | Color selection UI, formulation engine, image dropper, powder-to-liquid guidance, PWA      |

This document covers **both steps** of Phase 1. Step 1 is the immediate build target. Step 2 follows upon Step 1 completion.

### 1.3 Phase Roadmap (Full Project)

| Phase   | Scope                                                                                      | Status    |
| ------- | ------------------------------------------------------------------------------------------ | --------- |
| Phase 1 | Recipe directory, color formulation engine, image dropper, multi-tenancy (this document)   | **Current** |
| Phase 2 | Hardware sensor integration (spectrophotometer for thread color scanning)                   | Planned   |
| Phase 3 | Advanced ML-based formulation, analytics, reporting, automated dispensing                   | Planned   |
| Phase 4 | Large-scale manufacturing (gram -> kilogram scale)                                          | Planned   |
| Phase 5 | Global expansion - proprietary dyeing houses, "Color Creation Agency" model                | Planned   |

### 1.4 Target Users

- **Dye Traders**: Buy base dyes from manufacturers and mix custom shades for clients (e.g., APN Enterprise).
- **Dye Masters**: Experienced operators who perform color matching and recipe formulation.
- **Multiple Businesses (Tenants)**: Each organization uses the platform independently with complete data isolation.
- **Roles per Tenant**: Owner (created on signup), Admin (invited), Member (invited).

### 1.5 Core Business & Scientific Principles

- **Subtractive Color Mixing**: All dye mixing uses subtractive color theory. The software operates on CMYK (Cyan, Magenta, Yellow, Key/Black) base dyes.
- **Material Dependency**: Dye recipes are strictly tied to the material being dyed. Different materials require different chemical dye families (e.g., Acid dyes for wool/silk, Reactive for cotton, Disperse for polyester).
- **4-Primary Base System**: Transitioning from hundreds of pre-mixed dyes to a 4-Primary (CMYK) system for all new color creation.
- **CIELAB Color Space**: All internal color matching, storage, and computation uses CIELAB (L\*a\*b\*) - the perceptually uniform, textile-industry-standard color space.
- **CI (Color Index) Numbers**: Base dyes are identified by standardized CI numbers for global compatibility, independent of manufacturer or brand.

---

## 2. Functional Requirements - Step 1: Recipe Directory

Step 1 delivers the data foundation: authentication, organizational structure, and the complete recipe management system including bulk import of historical recipes.

### 2.1 User Management & Multi-Tenancy

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| UM-1.1  | Users can register with email, password, and organization name.                                      | P0       |
| UM-1.2  | Users can log in and log out securely. Login returns a JWT session token.                             | P0       |
| UM-1.3  | Each signup creates a new tenant (organization/business). The signing-up user becomes the owner.     | P0       |
| UM-1.4  | Users within the same tenant share data; cross-tenant data is completely invisible.                  | P0       |
| UM-1.5  | Support role-based access within a tenant:                                                           | P1       |
|         | - **Owner**: Full access, manage users, created on signup.                                           |          |
|         | - **Admin**: Manage profiles, recipes, users (invited by owner).                                     |          |
|         | - **Member**: Create/view/edit own recipes and profiles (invited by owner/admin).                    |          |
| UM-1.6  | Password recovery via email with a secure reset link (expires in 24 hours).                          | P1       |
| UM-1.7  | Session persistence - stay logged in across browser restarts using refresh tokens.                   | P1       |
| UM-1.8  | Tenant isolation enforced at both application layer (tenant_id filtering) AND database layer (RLS).  | P0       |
| UM-1.9  | Owner can invite new users to the tenant via email invitation.                                       | P1       |
| UM-1.10 | Account deletion with data anonymization after 30 days.                                              | P2       |

### 2.2 Profiles (Workspaces)

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| PR-2.1  | A user can create multiple profiles (workspaces) within their tenant.                                | P0       |
| PR-2.2  | Each profile has a name, a default dye form setting (powder or liquid), and a material type.         | P0       |
| PR-2.3  | Supported material types: Wool, Silk, Cotton, Polyester, Viscose, Nylon, Blended (custom text).      | P0       |
| PR-2.4  | Each profile contains its own set of base dyes (typically 3-4, max 8).                               | P0       |
| PR-2.5  | Profiles are scoped to the user within a tenant.                                                     | P0       |
| PR-2.6  | User can switch between profiles from any page via a global dropdown in the navigation bar.          | P0       |
| PR-2.7  | Deleting a profile cascades: deletes all associated base dyes, recipes, directory entries, and uploaded images. | P0 |
| PR-2.8  | Profile list is displayed as cards on the dashboard showing: name, material, recipe count, dye form. | P0       |
| PR-2.9  | Default profile auto-selected on login (last active or first created).                               | P1       |

### 2.3 Base Dye Configuration

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| BD-3.1  | User can add base dyes to a profile (name + color + CI number).                                      | P0       |
| BD-3.2  | Each base dye has a CI (Color Index) number field for global chemical identification.                | P0       |
| BD-3.3  | Each base dye has a color value stored as CIELAB (L\*, a\*, b\*) and displayed as hex/sRGB.          | P0       |
| BD-3.4  | Each base dye has a form (powder/liquid) matching the profile default, overridable per dye.           | P0       |
| BD-3.5  | For liquid dyes: concentration field (grams per liter) must be specified.                             | P0       |
| BD-3.6  | User can edit or delete individual base dyes.                                                        | P0       |
| BD-3.7  | A profile supports 2-8 base dyes.                                                                    | P0       |
| BD-3.8  | Default base dye presets available (CMYK: Cyan, Magenta, Yellow, Black) with standard CI numbers.    | P1       |
| BD-3.9  | Each base dye has an optional manufacturer and SKU field for traceability.                            | P1       |
| BD-3.10 | Base dye color can be set via hex input or color picker widget.                                      | P0       |

### 2.4 Recipe Management

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| RM-4.1  | Save a formulation result as a named recipe, or create a recipe manually.                            | P0       |
| RM-4.2  | Each recipe stores:                                                                                  | P0       |
|         | - Recipe name (user-defined).                                                                        |          |
|         | - Target color (hex + CIELAB L\*a\*b\*).                                                             |          |
|         | - Material type (inherited from profile, overridable).                                               |          |
|         | - Total batch weight (milligrams for powder, milliliters for liquid).                                |          |
|         | - Thread/substrate weight (grams).                                                                   |          |
|         | - Liquor ratio (water-to-material ratio, e.g., 1:20).                                               |          |
|         | - Water volume (milliliters, auto-calculated from thread weight - liquor ratio).                     |          |
|         | - User notes (free text).                                                                            |          |
|         | - Source image URL (optional, if recipe originated from image dropper).                              |          |
|         | - Created date and last modified date.                                                               |          |
| RM-4.3  | Each recipe contains a list of **dye ingredients** (base dyes with quantities):                      | P0       |
|         | - Base dye reference (linked to profile's base dyes).                                                |          |
|         | - Quantity in milligrams (powder) or milliliters (liquid).                                           |          |
|         | - Percentage of total batch.                                                                         |          |
| RM-4.4  | Each recipe can contain a list of **auxiliary ingredients** (non-dye chemicals):                      | P0       |
|         | - Auxiliary name (e.g., "Salt", "Soda Ash", "Leveling Agent", "Acetic Acid").                        |          |
|         | - Quantity (grams or milliliters).                                                                   |          |
|         | - Purpose/role (free text, e.g., "fixation", "pH control", "leveling").                              |          |
| RM-4.5  | List all recipes for a profile in a searchable, sortable, paginated table.                           | P0       |
| RM-4.6  | Recipe list displays: color swatch, recipe name, material, date created, batch size.                 | P0       |
| RM-4.7  | View recipe detail: target color swatch, full dye ingredient list, auxiliary ingredient list,         | P0       |
|         | quantities, proportions, liquor ratio, water volume, thread weight, and notes.                       |          |
| RM-4.8  | Edit recipe: name, notes, ingredients (dye + auxiliary), batch size, thread weight, liquor ratio.     | P0       |
| RM-4.9  | Delete a recipe with confirmation dialog.                                                            | P0       |
| RM-4.10 | Search recipes by name (text search, case-insensitive).                                              | P0       |
| RM-4.11 | Search recipes by target color (find closest match by ?E00 distance).                               | P1       |
| RM-4.12 | Sort recipes by name, date created, batch size, or material type.                                    | P0       |
| RM-4.13 | Paginate recipe list: 20 recipes per page with page navigation.                                      | P0       |
| RM-4.14 | Recipes are scoped to a profile and visible only to the owning tenant's users.                       | P0       |
| RM-4.15 | "Re-formulate" button on recipe detail: loads the target color into the formulator for adjustment.    | P1       |
| RM-4.16 | Duplicate a recipe (create a copy with editable name).                                               | P1       |
| RM-4.17 | Export a single recipe as PDF (printable recipe card).                                                | P2       |

### 2.5 Bulk Import (Historical Recipe Digitization)

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| BI-5.1  | Bulk import recipes from CSV file (primary format for diary digitization from Excel).                | P0       |
| BI-5.2  | CSV template provided for download with all required columns:                                        | P0       |
|         | `recipe_name`, `target_color_hex`, `target_color_L`, `target_color_a`, `target_color_b`,            |          |
|         | `material`, `thread_weight_g`, `water_volume_ml`, `liquor_ratio`,                                    |          |
|         | `total_batch_weight_mg`, `dye_1_name`, `dye_1_ci_number`, `dye_1_quantity_mg`,                       |          |
|         | `dye_2_name`, `dye_2_ci_number`, `dye_2_quantity_mg`, ... (up to 8 dyes),                            |          |
|         | `aux_1_name`, `aux_1_quantity_g`, `aux_1_purpose`, ... (up to 5 auxiliaries), `notes`.               |          |
| BI-5.3  | Validate CSV before import:                                                                          | P0       |
|         | - Required fields present and non-empty.                                                             |          |
|         | - Numeric fields are valid numbers.                                                                  |          |
|         | - Color hex codes are valid format (#RRGGBB).                                                        |          |
|         | - Material type matches allowed values.                                                              |          |
| BI-5.4  | Display validation errors line-by-line with row number and field name.                               | P0       |
| BI-5.5  | Import supports partial success: valid rows are imported, invalid rows are reported.                 | P0       |
| BI-5.6  | Import summary displayed after completion: total rows, imported count, skipped count, error details. | P0       |
| BI-5.7  | Auto-create base dyes referenced in CSV if they don't exist in the profile (match by CI number).     | P1       |
| BI-5.8  | Handle imports of up to 1,000 recipes in a single file without timeout.                              | P0       |
| BI-5.9  | Duplicate detection: warn if a recipe with the same name already exists in the profile.              | P1       |
| BI-5.10 | Support JSON import as an alternative format (same fields as CSV).                                   | P2       |

### 2.6 Color Directory (Bookmarks)

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| CD-6.1  | Users can bookmark/save colors to a directory with a name and optional category.                     | P0       |
| CD-6.2  | Each directory entry stores: name, category, color (hex + CIELAB), optional linked recipe.           | P0       |
| CD-6.3  | Directory is browsable and searchable by name or category.                                           | P0       |
| CD-6.4  | Directory displays entries as a grid of color swatches with names, or as a sortable table.           | P0       |
| CD-6.5  | Clicking a directory entry with a linked recipe loads its composition instantly.                     | P0       |
| CD-6.6  | Clicking a directory entry without a linked recipe loads its color into the formulator (Step 2).     | P1       |
| CD-6.7  | Directory entries are scoped to a profile.                                                           | P0       |
| CD-6.8  | User can edit or delete directory entries.                                                            | P0       |
| CD-6.9  | User-defined categories for organizing colors (e.g., "Client X Colors", "Wedding Collection").       | P1       |
| CD-6.10 | Bulk add to directory from imported recipes.                                                          | P2       |

---

## 3. Functional Requirements - Step 2: Color Formulation Engine

Step 2 adds the color selection UI, computed formulation, image dropper, and PWA capabilities on top of the Step 1 foundation.

### 3.1 Color Selection & Adjustment

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| CS-7.1  | Interactive color wheel/circle for selecting a target color.                                         | P0       |
| CS-7.2  | Manual hex input field for precise color entry.                                                      | P0       |
| CS-7.3  | Manual RGB input fields (R, G, B - each 0-255).                                                     | P0       |
| CS-7.4  | Manual CIELAB input fields (L\*: 0-100, a\*: -128 to +128, b\*: -128 to +128).                      | P0       |
| CS-7.5  | Lightness slider (maps to L\* in CIELAB, range 0-100).                                              | P0       |
| CS-7.6  | Chroma/Saturation slider (maps to C\* in LCh, range 0-150).                                         | P0       |
| CS-7.7  | Hue slider (maps to h- in LCh, range 0--360-).                                                      | P0       |
| CS-7.8  | Warmth slider (shifts b\* axis: blue -> yellow, range -128 to +128).                                 | P1       |
| CS-7.9  | Tint slider (shifts a\* axis: green -> red, range -128 to +128).                                     | P1       |
| CS-7.10 | All inputs and sliders are bidirectionally synchronized (change one -> all update instantly).          | P0       |
| CS-7.11 | Real-time color preview swatch showing the currently selected color.                                 | P0       |
| CS-7.12 | Out-of-gamut warning when selected CIELAB color cannot be accurately displayed in sRGB.              | P1       |
| CS-7.13 | Slider gradient tracks visually show the color change across the range.                              | P1       |

### 3.2 Color Formulation (Core Feature)

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| CF-8.1  | Given a target color and a profile's base dyes, compute the recipe (quantities of each base dye).    | P0       |
| CF-8.2  | User specifies total batch size in grams (powder) or milliliters (liquid).                           | P0       |
| CF-8.3  | User specifies thread/substrate weight in grams.                                                     | P0       |
| CF-8.4  | User specifies liquor ratio (auto-calculates water volume).                                          | P0       |
| CF-8.5  | Output shows each base dye's quantity in milligrams (powder) or milliliters (liquid).                | P0       |
| CF-8.6  | Output shows percentage contribution of each base dye.                                               | P0       |
| CF-8.7  | Visual horizontal bars showing proportions of each dye.                                              | P1       |
| CF-8.8  | If a close recipe already exists in the database (?E00 < configurable threshold), suggest it before computing. | P0 |
| CF-8.9  | Color engine uses CIELAB color space for all matching and computation.                               | P0       |
| CF-8.10 | Powder-to-liquid conversion: `quantity_ml = quantity_mg / concentration_g_per_l`.                     | P0       |
| CF-8.11 | Formulation algorithm is pluggable (nearest-neighbor, CIELAB interpolation, Kubelka-Munk) via Strategy pattern. | P0 |
| CF-8.12 | Active algorithm is configurable via environment variable without code changes.                       | P0       |
| CF-8.13 | Show predicted output color swatch alongside the target for visual comparison.                       | P1       |
| CF-8.14 | Show ?E00 value between predicted output and target color.                                          | P1       |
| CF-8.15 | Formulation includes suggested auxiliary chemicals based on material type.                            | P1       |

### 3.3 Image Upload & Color Dropper

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| IM-9.1  | User can upload images (JPEG, PNG, WebP) up to 10 MB.                                                | P0       |
| IM-9.2  | Uploaded images are stored in cloud storage (Supabase Storage initially, swappable to S3 etc.).       | P0       |
| IM-9.3  | Uploaded images are listed per profile with thumbnails.                                               | P0       |
| IM-9.4  | User can delete uploaded images.                                                                     | P0       |
| IM-9.5  | Uploaded image is rendered on a `<canvas>` element for interactive color picking.                     | P0       |
| IM-9.6  | Dropper tool: click on any pixel in the image to extract its RGB color.                              | P0       |
| IM-9.7  | Zoom loupe: a magnifying circle (3-5x zoom) follows the cursor for precise pixel selection.          | P0       |
| IM-9.8  | Pinch-to-zoom on mobile, scroll-wheel zoom on desktop for navigating large images.                   | P1       |
| IM-9.9  | Extracted color is displayed as a preview swatch with hex, RGB, and CIELAB values.                   | P0       |
| IM-9.10 | "Use this color" button sends the extracted color to the color formulator (pre-fills wheel + sliders). | P0      |
| IM-9.11 | Optionally link the source image to a saved recipe for traceability.                                 | P1       |
| IM-9.12 | Color extraction happens entirely on the frontend (Canvas API `getImageData`) - no server round-trip. | P0      |
| IM-9.13 | Drag-and-drop file upload supported alongside file browse button.                                    | P0       |

### 3.4 Delta Calibration (Screen-to-Reality Correction)

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| DC-10.1 | Calibration page where users match a physical calibration sheet's colors against on-screen display.  | P1       |
| DC-10.2 | User adjusts sliders until the on-screen color matches the physical CMYK reference thread sample.    | P1       |
| DC-10.3 | Software calculates the per-user "Delta" (offset) for each primary color and saves to user's profile. | P1      |
| DC-10.4 | Saved delta is automatically applied to all subsequent color selections in the formulator.            | P1       |
| DC-10.5 | User can recalibrate at any time.                                                                    | P1       |
| DC-10.6 | Calibration is per-device - user can have different deltas for different displays.                    | P2       |

### 3.5 Powder-to-Liquid Guidance

| ID       | Requirement                                                                                          | Priority |
| -------- | ---------------------------------------------------------------------------------------------------- | -------- |
| PL-11.1  | In-app guidance section on dissolving powder dyes into liquid form.                                  | P1       |
| PL-11.2  | Guidance covers: concentration, solvent (water), temperature, filtration, shelf life.                | P1       |
| PL-11.3  | Warning for reactive dyes: liquid stock shelf life is 2-4 weeks.                                    | P1       |
| PL-11.4  | Recommendation to use standardized concentrations for consistent volumetric dosing.                  | P1       |
| PL-11.5  | Preservative recommendation for liquid stocks stored > 1 week.                                      | P2       |
| PL-11.6  | Filtration reminder: filter dissolved dye through fine mesh to remove undissolved particles.         | P2       |

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Architecture - Modularity

| ID      | Requirement                                                                                          | Priority |
| ------- | ---------------------------------------------------------------------------------------------------- | -------- |
| AR-1    | **Hexagonal Architecture (Ports & Adapters)** - domain and services depend only on abstract interfaces (ports). | P0 |
| AR-2    | Every external dependency (database, auth, storage, color engine) is behind an abstract port.        | P0       |
| AR-3    | Swapping any adapter requires only: (a) new adapter class implementing the port, (b) env var change. Zero changes to domain, services, or routes. | P0 |
| AR-4    | **Repository Pattern** for all data access - abstract repository interfaces with concrete implementations. | P0 |
| AR-5    | **Unit of Work Pattern** for atomic database operations - abstract UoW with concrete implementations. | P0      |
| AR-6    | **Strategy Pattern** for color engine - algorithm is pluggable without changing calling code.         | P0       |
| AR-7    | **Dependency Injection** via Flask app factory + provider/factory functions that read env vars to select adapters. | P0 |
| AR-8    | Frontend services are injectable and swappable via Angular DI (`InjectionToken` + factory providers). | P0       |
| AR-9    | Domain models are plain Python dataclasses with zero infrastructure imports.                         | P0       |
| AR-10   | Configuration via Pydantic `BaseSettings` reading from `.env` file.                                  | P0       |

### 4.2 Performance

| ID      | Requirement                                                | Target      |
| ------- | ---------------------------------------------------------- | ----------- |
| PF-1    | Color formulation API response time                        | < 2 sec     |
| PF-2    | Page load time (first contentful paint)                    | < 1.5 sec   |
| PF-3    | Color picker / slider interaction latency                  | < 50 ms     |
| PF-4    | Image upload (10 MB file)                                  | < 5 sec     |
| PF-5    | Recipe directory search (text search)                      | < 500 ms    |
| PF-6    | Client-side color space conversions                        | < 5 ms      |
| PF-7    | Recipe color search (?E00 similarity, 1000 recipes)        | < 2 sec     |
| PF-8    | Bulk CSV import (1000 rows)                                | < 30 sec    |
| PF-9    | Recipe list page rendering (20 items with swatches)        | < 1 sec     |

### 4.3 Security

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| SC-1    | All API endpoints (except signup/login) require valid JWT authentication.                            |
| SC-2    | Multi-tenant data isolation enforced at database level via Row Level Security (RLS).                 |
| SC-3    | Multi-tenant data isolation enforced at application level via `tenant_id` filtering on every query.  |
| SC-4    | File uploads validated: type whitelist (JPEG, PNG, WebP only), max size 10 MB.                       |
| SC-5    | CORS restricted to allowed frontend origins only.                                                    |
| SC-6    | Environment secrets (API keys, JWT secrets, Supabase keys) never committed to version control.       |
| SC-7    | HTTPS enforced in production.                                                                        |
| SC-8    | Uploaded images stored in per-tenant storage paths with access policies.                             |
| SC-9    | CSV import files validated and sanitized to prevent injection attacks.                                |
| SC-10   | Rate limiting on auth endpoints (signup, login, password reset) - max 10 requests/minute per IP.     |

### 4.4 Scalability & Maintainability

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| SM-1    | Stateless backend - horizontally scalable behind a load balancer.                                    |
| SM-2    | Database connection pooling via Supabase's built-in pooler (PgBouncer).                              |
| SM-3    | Frontend lazy-loads feature modules - initial bundle < 200 KB gzipped.                               |
| SM-4    | Comprehensive test suite: unit, integration, E2E.                                                    |
| SM-5    | CI/CD pipeline: lint -> test -> build -> deploy on every push to main.                                 |
| SM-6    | Docker containerized for consistent local dev and deployment.                                        |
| SM-7    | Database supports up to 100,000 recipes and 1,000 tenants without performance degradation.           |

### 4.5 Reliability

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| RL-1    | System uptime of 99.5% (excluding scheduled maintenance).                                           |
| RL-2    | Automatic database backups every 24 hours via Supabase's managed backup.                             |
| RL-3    | Data recovery within 1 hour of a failure event.                                                      |
| RL-4    | Graceful error handling - user-friendly error messages, no raw stack traces exposed.                 |

### 4.6 Usability

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| US-1    | Responsive design for mobile, tablet, and desktop devices.                                           |
| US-2    | Mobile-first layout - stacks vertically on small screens.                                            |
| US-3    | Breakpoints at 480px (phone), 768px (tablet), 1024px+ (desktop).                                    |
| US-4    | Key actions reachable within 3 clicks (e.g., create recipe, search, view detail).                    |
| US-5    | Dark theme support (optional toggle).                                                                |
| US-6    | Modern, clean aesthetic - neutral backgrounds with vibrant color swatches for contrast.              |
| US-7    | Sans-serif font (Inter or system font stack). Card-based layout.                                     |

### 4.7 PWA Requirements (Step 2)

| ID      | Requirement                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------- |
| PW-1    | Installable on mobile and desktop (manifest.webmanifest + service worker).                           |
| PW-2    | Offline access to cached recipe directory (read-only).                                               |
| PW-3    | App shell caching for instant repeat visits.                                                         |
| PW-4    | Lighthouse PWA score > 90.                                                                           |
| PW-5    | Responsive layout: mobile-first, stacks vertically on small screens.                                 |

---

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
Tenant (1) ------------ (N) User
User   (1) ------------ (N) Profile
Profile (1) ----------- (N) BaseDye
Profile (1) ----------- (N) Recipe
Profile (1) ----------- (N) DirectoryEntry
Profile (1) ----------- (N) UploadedImage
Recipe  (1) ----------- (N) RecipeIngredient
Recipe  (1) ----------- (N) RecipeAuxiliary
RecipeIngredient (N) --- (1) BaseDye
DirectoryEntry   (N) --- (0..1) Recipe
Recipe           (N) --- (0..1) UploadedImage (source)
```

### 5.2 Entity Specifications

#### Tenant

| Field      | Type      | Constraints       | Description                |
| ---------- | --------- | ----------------- | -------------------------- |
| id         | UUID      | PK, auto-gen      | Unique identifier          |
| name       | string    | NOT NULL           | Organization/business name |
| created_at | timestamp | DEFAULT now()      | Creation timestamp         |

#### User

| Field        | Type      | Constraints                      | Description                        |
| ------------ | --------- | -------------------------------- | ---------------------------------- |
| id           | UUID      | PK, matches Supabase Auth UID   | Unique identifier                  |
| tenant_id    | UUID      | FK -> Tenant, NOT NULL            | Owning organization                |
| email        | string    | NOT NULL, UNIQUE                 | Email address                      |
| display_name | string    | nullable                         | Display name                       |
| role         | enum      | owner / admin / member           | Role within tenant                 |
| created_at   | timestamp | DEFAULT now()                    | Creation timestamp                 |

#### Profile

| Field      | Type      | Constraints                 | Description                           |
| ---------- | --------- | --------------------------- | ------------------------------------- |
| id         | UUID      | PK, auto-gen                | Unique identifier                     |
| tenant_id  | UUID      | FK -> Tenant, NOT NULL       | Owning organization                   |
| user_id    | UUID      | FK -> User, NOT NULL         | Owning user                           |
| name       | string    | NOT NULL                    | Profile/workspace name                |
| dye_form   | enum      | powder / liquid             | Default dye form for this profile     |
| material   | string    | NOT NULL                    | Material type (Wool, Silk, Cotton, etc.) |
| created_at | timestamp | DEFAULT now()               | Creation timestamp                    |
| updated_at | timestamp | DEFAULT now(), ON UPDATE    | Last modified timestamp               |

#### BaseDye

| Field                 | Type      | Constraints                           | Description                                 |
| --------------------- | --------- | ------------------------------------- | ------------------------------------------- |
| id                    | UUID      | PK, auto-gen                          | Unique identifier                           |
| profile_id            | UUID      | FK -> Profile, CASCADE, NOT NULL       | Parent profile                              |
| name                  | string    | NOT NULL                              | Dye name (e.g., "Cyan", "Magenta")          |
| ci_number             | string    | nullable                              | CI (Color Index) number (e.g., "CI 74160")  |
| color_hex             | string    | NOT NULL                              | Hex color code (e.g., "#00FFFF")            |
| color_lab             | JSON      | NOT NULL, `{L, a, b}`                | CIELAB color values                         |
| form                  | enum      | powder / liquid                       | Physical form of this dye                   |
| concentration_g_per_l | decimal   | nullable, required if form = liquid   | Concentration in grams per liter            |
| manufacturer          | string    | nullable                              | Dye manufacturer name                       |
| sku                   | string    | nullable                              | Manufacturer SKU/product code               |
| created_at            | timestamp | DEFAULT now()                         | Creation timestamp                          |

#### Recipe

| Field                  | Type      | Constraints                      | Description                                      |
| ---------------------- | --------- | -------------------------------- | ------------------------------------------------ |
| id                     | UUID      | PK, auto-gen                     | Unique identifier                                |
| profile_id             | UUID      | FK -> Profile, CASCADE, NOT NULL  | Parent profile                                   |
| name                   | string    | NOT NULL                         | Recipe name                                      |
| target_color_hex       | string    | NOT NULL                         | Target color hex code                            |
| target_color_lab       | JSON      | NOT NULL, `{L, a, b}`           | Target color in CIELAB                           |
| material               | string    | NOT NULL                         | Material type for this specific recipe           |
| total_batch_weight_mg  | decimal   | NOT NULL                         | Total dye batch size in milligrams               |
| thread_weight_g        | decimal   | nullable                         | Substrate/thread weight in grams                 |
| liquor_ratio           | string    | nullable                         | Water-to-material ratio (e.g., "1:20")           |
| water_volume_ml        | decimal   | nullable                         | Water volume in milliliters                      |
| notes                  | text      | nullable                         | User notes about this recipe                     |
| source_image_url       | string    | nullable                         | If recipe originated from image dropper          |
| created_at             | timestamp | DEFAULT now()                    | Creation timestamp                               |
| updated_at             | timestamp | DEFAULT now(), ON UPDATE         | Last modified timestamp                          |

#### RecipeIngredient (Dye Ingredients)

| Field        | Type    | Constraints                         | Description                               |
| ------------ | ------- | ----------------------------------- | ----------------------------------------- |
| id           | UUID    | PK, auto-gen                        | Unique identifier                         |
| recipe_id    | UUID    | FK -> Recipe, CASCADE, NOT NULL      | Parent recipe                             |
| base_dye_id  | UUID    | FK -> BaseDye, NOT NULL              | Which base dye                            |
| quantity_mg  | decimal | NOT NULL                            | Amount in milligrams                      |
| quantity_ml  | decimal | nullable, auto-calculated for liquid| Amount in milliliters                     |
| percentage   | decimal | NOT NULL                            | Percentage of total dye batch             |

#### RecipeAuxiliary (Auxiliary Chemical Ingredients)

| Field        | Type    | Constraints                         | Description                               |
| ------------ | ------- | ----------------------------------- | ----------------------------------------- |
| id           | UUID    | PK, auto-gen                        | Unique identifier                         |
| recipe_id    | UUID    | FK -> Recipe, CASCADE, NOT NULL      | Parent recipe                             |
| name         | string  | NOT NULL                            | Chemical name (e.g., "Salt", "Soda Ash")  |
| quantity_g   | decimal | NOT NULL                            | Amount in grams                           |
| quantity_ml  | decimal | nullable                            | Amount in milliliters (for liquid aux)    |
| unit         | enum    | grams / milliliters                 | Measurement unit                          |
| purpose      | string  | nullable                            | Purpose (e.g., "fixation", "pH control")  |

#### DirectoryEntry

| Field      | Type      | Constraints                        | Description                      |
| ---------- | --------- | ---------------------------------- | -------------------------------- |
| id         | UUID      | PK, auto-gen                       | Unique identifier                |
| profile_id | UUID      | FK -> Profile, CASCADE, NOT NULL    | Parent profile                   |
| name       | string    | NOT NULL                           | Color/entry name                 |
| category   | string    | nullable                           | User-defined category            |
| recipe_id  | UUID      | FK -> Recipe, nullable              | Linked recipe (optional)         |
| color_hex  | string    | NOT NULL                           | Color hex code                   |
| color_lab  | JSON      | NOT NULL, `{L, a, b}`             | Color in CIELAB                  |
| created_at | timestamp | DEFAULT now()                      | Creation timestamp               |

#### UploadedImage

| Field        | Type      | Constraints                        | Description                         |
| ------------ | --------- | ---------------------------------- | ----------------------------------- |
| id           | UUID      | PK, auto-gen                       | Unique identifier                   |
| profile_id   | UUID      | FK -> Profile, CASCADE, NOT NULL    | Parent profile                      |
| file_name    | string    | NOT NULL                           | Original file name                  |
| storage_path | string    | NOT NULL                           | Path in cloud storage bucket        |
| url          | string    | NOT NULL                           | Public or signed URL for access     |
| created_at   | timestamp | DEFAULT now()                      | Upload timestamp                    |

---

## 6. API Specification

### 6.1 Authentication

| Method | Endpoint            | Description                      | Auth Required |
| ------ | ------------------- | -------------------------------- | ------------- |
| POST   | /auth/signup        | Register new user + tenant       | No            |
| POST   | /auth/login         | Login, returns JWT               | No            |
| POST   | /auth/logout        | Invalidate session               | Yes           |
| POST   | /auth/refresh       | Refresh JWT token                | Yes           |
| POST   | /auth/reset-password| Request password reset email     | No            |

### 6.2 Profiles

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | /profiles          | List user's profiles        |
| POST   | /profiles          | Create a new profile        |
| GET    | /profiles/{id}     | Get profile details         |
| PUT    | /profiles/{id}     | Update profile              |
| DELETE | /profiles/{id}     | Delete profile (cascades)   |

### 6.3 Base Dyes

| Method | Endpoint                            | Description                  |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | /profiles/{id}/base-dyes           | List base dyes for profile   |
| POST   | /profiles/{id}/base-dyes           | Add a base dye               |
| PUT    | /profiles/{id}/base-dyes/{dye_id}  | Update a base dye            |
| DELETE | /profiles/{id}/base-dyes/{dye_id}  | Delete a base dye            |

### 6.4 Recipes

| Method | Endpoint                                          | Description                          |
| ------ | ------------------------------------------------- | ------------------------------------ |
| GET    | /profiles/{id}/recipes                           | List recipes (paginated, sortable)   |
| POST   | /profiles/{id}/recipes                           | Create/save a new recipe             |
| GET    | /profiles/{id}/recipes/{recipe_id}               | Get recipe detail with ingredients   |
| PUT    | /profiles/{id}/recipes/{recipe_id}               | Update recipe                        |
| DELETE | /profiles/{id}/recipes/{recipe_id}               | Delete recipe                        |
| POST   | /profiles/{id}/recipes/search-color              | Find closest recipes by ?E00        |
| POST   | /profiles/{id}/recipes/import                    | Bulk import from CSV                 |
| GET    | /profiles/{id}/recipes/export-template           | Download CSV import template         |
| POST   | /profiles/{id}/recipes/{recipe_id}/duplicate     | Duplicate a recipe                   |

**Recipe Create/Update Request Body:**

```json
{
  "name": "Bright Ocean Blue",
  "target_color_hex": "#0077BE",
  "target_color_lab": { "L": 50.2, "a": -15.3, "b": -40.8 },
  "material": "Wool",
  "total_batch_weight_mg": 1000,
  "thread_weight_g": 10,
  "liquor_ratio": "1:20",
  "water_volume_ml": 200,
  "notes": "Client: ABC Textiles, Order #456",
  "ingredients": [
    { "base_dye_id": "uuid-cyan", "quantity_mg": 450, "percentage": 45.0 },
    { "base_dye_id": "uuid-magenta", "quantity_mg": 50, "percentage": 5.0 },
    { "base_dye_id": "uuid-yellow", "quantity_mg": 200, "percentage": 20.0 },
    { "base_dye_id": "uuid-black", "quantity_mg": 300, "percentage": 30.0 }
  ],
  "auxiliaries": [
    { "name": "Glauber Salt", "quantity_g": 5.0, "unit": "grams", "purpose": "leveling" },
    { "name": "Acetic Acid", "quantity_ml": 2.0, "unit": "milliliters", "purpose": "pH control" }
  ]
}
```

**Recipe Detail Response Body:**

```json
{
  "id": "uuid",
  "name": "Bright Ocean Blue",
  "target_color": {
    "hex": "#0077BE",
    "lab": { "L": 50.2, "a": -15.3, "b": -40.8 }
  },
  "material": "Wool",
  "total_batch_weight_mg": 1000,
  "thread_weight_g": 10,
  "liquor_ratio": "1:20",
  "water_volume_ml": 200,
  "notes": "Client: ABC Textiles, Order #456",
  "ingredients": [
    {
      "id": "uuid",
      "base_dye": {
        "id": "uuid-cyan",
        "name": "Cyan",
        "ci_number": "CI 74160",
        "color_hex": "#00FFFF"
      },
      "quantity_mg": 450,
      "quantity_ml": null,
      "percentage": 45.0
    }
  ],
  "auxiliaries": [
    {
      "id": "uuid",
      "name": "Glauber Salt",
      "quantity_g": 5.0,
      "quantity_ml": null,
      "unit": "grams",
      "purpose": "leveling"
    }
  ],
  "created_at": "2026-04-05T10:30:00Z",
  "updated_at": "2026-04-05T10:30:00Z"
}
```

### 6.5 Color Directory

| Method | Endpoint                                    | Description                 |
| ------ | ------------------------------------------- | --------------------------- |
| GET    | /profiles/{id}/directory                   | List directory entries      |
| POST   | /profiles/{id}/directory                   | Add to directory            |
| PUT    | /profiles/{id}/directory/{entry_id}        | Update directory entry      |
| DELETE | /profiles/{id}/directory/{entry_id}        | Remove from directory       |
| GET    | /profiles/{id}/directory/search            | Search by name/category     |

### 6.6 Formulation (Step 2)

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| POST   | /profiles/{id}/formulate         | Compute recipe for target color          |

**Request Body:**

```json
{
  "target_color_hex": "#A0522D",
  "target_color_lab": { "L": 43.8, "a": 29.4, "b": 35.7 },
  "batch_size_mg": 1000,
  "thread_weight_g": 10,
  "liquor_ratio": "1:20",
  "dye_form": "powder",
  "material": "Wool"
}
```

**Response Body:**

```json
{
  "target_color": { "hex": "#A0522D", "lab": { "L": 43.8, "a": 29.4, "b": 35.7 } },
  "closest_existing_recipe": null,
  "formulation": {
    "ingredients": [
      { "base_dye_id": "uuid", "name": "Magenta", "ci_number": "CI 73915", "quantity_mg": 350, "percentage": 35.0 },
      { "base_dye_id": "uuid", "name": "Yellow", "ci_number": "CI 47005", "quantity_mg": 500, "percentage": 50.0 },
      { "base_dye_id": "uuid", "name": "Cyan", "ci_number": "CI 74160", "quantity_mg": 100, "percentage": 10.0 },
      { "base_dye_id": "uuid", "name": "Black", "ci_number": "CI 20470", "quantity_mg": 50, "percentage": 5.0 }
    ],
    "suggested_auxiliaries": [
      { "name": "Glauber Salt", "quantity_g": 5.0, "purpose": "leveling" },
      { "name": "Acetic Acid", "quantity_ml": 1.5, "purpose": "pH control" }
    ],
    "total_mg": 1000,
    "water_volume_ml": 200,
    "predicted_color": { "hex": "#A2542F", "lab": { "L": 44.1, "a": 29.0, "b": 35.2 } },
    "delta_e": 1.2
  }
}
```

### 6.7 Images (Step 2)

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| POST   | /profiles/{id}/images/upload            | Upload image (multipart) |
| GET    | /profiles/{id}/images                   | List uploaded images     |
| DELETE | /profiles/{id}/images/{image_id}        | Delete image             |

---

## 7. Technology Stack

| Component           | Technology                      | Swappable With                          |
| ------------------- | ------------------------------- | --------------------------------------- |
| Frontend            | Angular 17+ (standalone, PWA)   | React, Vue (backend API unchanged)      |
| UI Color Picker     | iro.js                          | Any color picker library                |
| Client Color Math   | culori (npm)                    | colorjs.io, chroma.js                   |
| Backend Framework   | Flask (Python 3.11+)            | Flask, Django REST                    |
| Server Runner       | Gunicorn (WSGI server)          | Waitress, uWSGI                         |
| Color Engine        | colour-science + scipy          | Custom ML model, external API           |
| Database            | Supabase (PostgreSQL)           | Raw PostgreSQL, MongoDB, Firebase       |
| Auth                | Supabase Auth                   | Auth0, Firebase Auth, custom JWT        |
| File Storage        | Supabase Storage                | AWS S3, GCS, local filesystem           |
| Hosting (Backend)   | Railway / Render                | AWS, GCP, self-hosted VPS              |
| Hosting (Frontend)  | Vercel                          | Netlify, Cloudflare Pages               |
| CI/CD               | GitHub Actions                  | GitLab CI, CircleCI                     |
| Containerization    | Docker + docker-compose         | Podman                                  |

---

## 8. Color Science Specification

### 8.1 Color Spaces

| Space  | Purpose                                             | Used In                    |
| ------ | --------------------------------------------------- | -------------------------- |
| sRGB   | Display on screen, user input/output                | Frontend (culori)          |
| CIELAB | Internal storage, comparison, formulation           | Backend (colour-science)   |
| LCh    | Slider mapping (Lightness, Chroma, Hue angle)       | Frontend sliders           |
| Hex    | User-friendly display and input                     | Both                       |

### 8.2 Color Difference Metric

- Primary metric: **?E00 (CIE 2000)** - perceptually uniform and the textile industry standard.
- Thresholds:
  - ?E00 < 1.0 -> imperceptible to the human eye (exact match).
  - ?E00 < 3.0 -> acceptable in the textile industry (close match).
  - ?E00 > 5.0 -> noticeably different.
- The "close match" threshold is configurable per profile (default: 3.0).

### 8.3 Conversion Pipeline

```
RGB (sRGB, screen)
  -> linearize (remove gamma)
  -> XYZ (via sRGB -> XYZ matrix, D65 illuminant)
  -> CIELAB (via nonlinear f(t) transformation)
  -> LCh (cylindrical form: L*, C*, h-)

Reverse: CIELAB -> XYZ -> linear RGB -> sRGB (apply gamma)
```

### 8.4 Formulation Algorithms (Step 2, Pluggable via Strategy Pattern)

| Algorithm                    | Description                                                        | When Used               |
| ---------------------------- | ------------------------------------------------------------------ | ----------------------- |
| CIELAB Nearest Neighbor      | Search existing recipes for smallest ?E00 distance. Fast lookup.  | "First pass" before computing |
| CIELAB Weighted Interpolation| Constrained optimization minimizing ?E00 via scipy SLSQP.         | MVP default             |
| Kubelka-Munk                 | Physics-based mixing using K/S coefficients. Most accurate.        | Stretch goal            |

### 8.5 Powder-to-Liquid Conversion Formula

```
quantity_ml = quantity_mg / concentration_g_per_l
```

Where `concentration_g_per_l` is grams of powder per liter of solvent (e.g., 50 g/L = 50 mg/mL).

---

## 9. Database Schema (SQL Migration)

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
    email TEXT NOT NULL UNIQUE,
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
    material TEXT NOT NULL DEFAULT 'Wool',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Base dyes configured per profile
CREATE TABLE base_dyes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    ci_number TEXT,
    color_hex TEXT NOT NULL,
    color_lab JSONB NOT NULL,          -- {"L": 50.0, "a": 20.5, "b": -14.2}
    form TEXT DEFAULT 'powder' CHECK (form IN ('powder', 'liquid')),
    concentration_g_per_l NUMERIC,
    manufacturer TEXT,
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Saved recipes
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_color_hex TEXT NOT NULL,
    target_color_lab JSONB NOT NULL,
    material TEXT NOT NULL DEFAULT 'Wool',
    total_batch_weight_mg NUMERIC NOT NULL,
    thread_weight_g NUMERIC,
    liquor_ratio TEXT,
    water_volume_ml NUMERIC,
    notes TEXT,
    source_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recipe dye ingredients (composition)
CREATE TABLE recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    base_dye_id UUID REFERENCES base_dyes(id) NOT NULL,
    quantity_mg NUMERIC NOT NULL,
    quantity_ml NUMERIC,
    percentage NUMERIC NOT NULL
);

-- Recipe auxiliary ingredients (salt, ash, leveling agents, etc.)
CREATE TABLE recipe_auxiliaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity_g NUMERIC NOT NULL,
    quantity_ml NUMERIC,
    unit TEXT DEFAULT 'grams' CHECK (unit IN ('grams', 'milliliters')),
    purpose TEXT
);

-- Color directory (bookmarks/favorites)
CREATE TABLE color_directory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    color_hex TEXT NOT NULL,
    color_lab JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded images
CREATE TABLE uploaded_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_dyes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_auxiliaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users see only their own tenant's data
CREATE POLICY "tenant_isolation_users" ON users
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_profiles" ON profiles
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_base_dyes" ON base_dyes
    FOR ALL USING (profile_id IN (
        SELECT id FROM profiles WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "tenant_isolation_recipes" ON recipes
    FOR ALL USING (profile_id IN (
        SELECT id FROM profiles WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "tenant_isolation_recipe_ingredients" ON recipe_ingredients
    FOR ALL USING (recipe_id IN (
        SELECT r.id FROM recipes r
        JOIN profiles p ON r.profile_id = p.id
        WHERE p.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "tenant_isolation_recipe_auxiliaries" ON recipe_auxiliaries
    FOR ALL USING (recipe_id IN (
        SELECT r.id FROM recipes r
        JOIN profiles p ON r.profile_id = p.id
        WHERE p.tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "tenant_isolation_directory" ON color_directory
    FOR ALL USING (profile_id IN (
        SELECT id FROM profiles WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "tenant_isolation_images" ON uploaded_images
    FOR ALL USING (profile_id IN (
        SELECT id FROM profiles WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

-- Indexes for performance
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_base_dyes_profile ON base_dyes(profile_id);
CREATE INDEX idx_recipes_profile ON recipes(profile_id);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_material ON recipes(material);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_auxiliaries_recipe ON recipe_auxiliaries(recipe_id);
CREATE INDEX idx_directory_profile ON color_directory(profile_id);
CREATE INDEX idx_directory_category ON color_directory(category);
CREATE INDEX idx_images_profile ON uploaded_images(profile_id);
```

---

## 10. User Interface Specification

### 10.1 Pages

| #  | Page                 | Step | Description                                                          |
| -- | -------------------- | ---- | -------------------------------------------------------------------- |
| 1  | Login / Signup       | 1    | Auth forms via Supabase Auth                                         |
| 2  | Dashboard            | 1    | Profile cards, quick stats, create new profile                       |
| 3  | Profile Settings     | 1    | Edit profile, manage base dyes with inline color pickers             |
| 4  | Recipe Directory     | 1    | Searchable table of saved recipes with color swatches                |
| 5  | Recipe Detail        | 1    | Full composition, dye + auxiliary ingredients, re-formulate button   |
| 6  | Recipe Create/Edit   | 1    | Form to manually create or edit a recipe with all fields             |
| 7  | Bulk Import          | 1    | CSV upload page with validation, progress, and summary               |
| 8  | Color Directory      | 1    | Browsable grid/table of bookmarked colors                            |
| 9  | Color Formulator     | 2    | **Main page** - color wheel + sliders + formulation result           |
| 10 | Image Color Picker   | 2    | Upload image, dropper tool, zoom loupe, use picked color             |
| 11 | Calibration          | 2    | Delta calibration page for screen-to-reality correction              |

### 10.2 Recipe Directory Layout

```
+--------------------------------------------------------------------+
-  [Profile: -> Wool - APN]                  [+ New Recipe] [Import] -
+---------------------------------------------------------------------
-  Search: [_________________] [??]    Sort: [Name ?]  Material: [All ?] -
+---------------------------------------------------------------------
-  +----+  Bright Ocean Blue      Wool     1000 mg   Apr 05, 2026  -
-  ------  CI: 74160, 73915       10g / 1:20 / 200mL      [? Menu] -
-  +----+                                                            -
-  +----+  Deep Crimson Red       Silk     500 mg    Mar 28, 2026   -
-  ------  CI: 73915, 20470       10g / 1:20 / 200mL      [? Menu] -
-  +----+                                                            -
-  +----+  Forest Olive Green     Wool     2000 mg   Mar 15, 2026   -
-  ------  CI: 74160, 47005       10g / 1:20 / 200mL      [? Menu] -
-  +----+                                                            -
+---------------------------------------------------------------------
-  Page 1 of 30   [< Prev]  1  2  3  ...  30  [Next >]             -
+--------------------------------------------------------------------+
```

### 10.3 Recipe Detail Layout

```
+--------------------------------------------------------------------+
-  -> Back to Directory          [Edit] [Duplicate] [Re-formulate]   -
+---------------------------------------------------------------------
-                          -  Recipe: Bright Ocean Blue              -
-   +------------------+   -  Material: Wool                        -
-   -                  -   -  Target Color: #0077BE                  -
-   -  TARGET COLOR    -   -  CIELAB: L*50.2 a*-15.3 b*-40.8       -
-   -  SWATCH          -   -                                        -
-   -  #0077BE         -   -  Batch: 1000 mg | Thread: 10 g         -
-   -                  -   -  Liquor Ratio: 1:20 | Water: 200 mL    -
-   +------------------+   -                                        -
+---------------------------------------------------------------------
-  DYE INGREDIENTS                                                   -
-  +--------------------------------------------------------------+  -
-  - ---- Cyan (CI 74160)       450 mg   45.0%  ---------------- -  -
-  - ---- Yellow (CI 47005)     200 mg   20.0%  --------         -  -
-  - ---- Magenta (CI 73915)     50 mg    5.0%  --               -  -
-  - ---- Black (CI 20470)      300 mg   30.0%  ------------     -  -
-  +--------------------------------------------------------------+  -
-                                                                    -
-  AUXILIARY INGREDIENTS                                             -
-  +--------------------------------------------------------------+  -
-  - Glauber Salt         5.0 g       leveling                   -  -
-  - Acetic Acid          2.0 mL      pH control                 -  -
-  +--------------------------------------------------------------+  -
-                                                                    -
-  NOTES                                                             -
-  Client: ABC Textiles, Order #456                                  -
-                                                                    -
-  Created: Apr 05, 2026 | Modified: Apr 05, 2026                   -
+--------------------------------------------------------------------+
```

### 10.4 Color Formulator Layout (Step 2 - Desktop)

```
+--------------------------------------------------------------------+
-  [Profile: -> My Profile]  [Batch: 100g]  [? Powder -> Liquid]     -
-  [Thread: 10g]  [Liquor: 1:20]  [Water: auto 200mL]              -
+---------------------------------------------------------------------
-                  -  +------------+  -  FORMULATION RESULT          -
-   COLOR WHEEL    -  -  Preview   -  -                              -
-   (iro.js)       -  -  Swatch    -  -  Magenta  --------  350 mg   -
-                  -  +------------+  -  Yellow   ------------ 500mg -
-  +------------+  -                  -  Cyan     ----  100 mg       -
-  - Hex: #A052 -  -  Lightness ???  -  Black    --  50 mg          -
-  - R:160 G:82  -  -  Chroma    ???  -                              -
-  - B:45        -  -  Hue       ???  -  Total: 1000 mg              -
-  - L:43.8      -  -  Warmth    ???  -  ?E00: 1.2                  -
-  - a:29.4      -  -  Tint      ???  -                              -
-  - b:35.7      -  -                  -  Auxiliaries:                -
-  +------------+  -  [Pick from      -  Salt: 5g | Acid: 1.5mL     -
-                  -   Image ??]      -                              -
-                  -                  -  [Save Recipe] [Add to Dir]  -
+--------------------------------------------------------------------+
Mobile: stacks vertically (wheel -> sliders -> result)
```

---

## 11. Real-World Complexities

### 11.1 Historical Data Migration

- **C-1.1**: 500-600 recipes from physical diaries must be digitized into Excel then imported via CSV.
- **C-1.2**: Diary entries include thread weight, dye weights, auxiliary weights, and water volume - all must be preserved.
- **C-1.3**: CI numbers must be mapped to digital color fingerprints (CIELAB/hex) from existing dye databases.
- **C-1.4**: Some historical recipes use pre-mixed dyes (e.g., "Brown", "Olive") instead of CMYK primaries - import must support non-CMYK dye names.

### 11.2 Dye Chemistry Variability

- **C-2.1**: Different manufacturers of the same CI-numbered dye may vary in strength - recipes may need per-manufacturer calibration.
- **C-2.2**: Dye behavior varies by material (wool, silk, cotton require different auxiliaries and ratios).
- **C-2.3**: Liquid dye stocks have limited shelf life (2-4 weeks for reactive dyes) - system should warn but cannot enforce.

### 11.3 Screen-to-Physical Color Gap

- **C-3.1**: Colors displayed on screen (sRGB gamut) do not perfectly match physical dyed fabric.
- **C-3.2**: The Delta Calibration feature (Step 2) mitigates this, but users must understand that digital preview is approximate.
- **C-3.3**: Different monitors render colors differently - calibration is per-device.

### 11.4 Multi-Tenant Data Integrity

- **C-4.1**: All queries must be tenant-scoped. A bug exposing cross-tenant data is a critical severity defect.
- **C-4.2**: Tenant isolation must be enforced at both application (service layer) and database (RLS) level - defense in depth.
- **C-4.3**: Cascading deletes (profile -> recipes -> ingredients) must be atomic and complete.

---

## 12. Technical Constraints

| ID   | Constraint                                                                                    |
| ---- | --------------------------------------------------------------------------------------------- |
| TC-1 | Use the specified tech stack: Angular 17+, Flask (Python 3.11+), Supabase (PostgreSQL).       |
| TC-2 | Deploy backend on Railway/Render, frontend on Vercel.                                         |
| TC-3 | Use RESTful APIs for frontend-backend communication (GraphQL deferred to future consideration).|
| TC-4 | Implement CI/CD pipeline via GitHub Actions: lint -> test -> build -> deploy.                    |
| TC-5 | Use GitHub for version control.                                                               |
| TC-6 | Follow Hexagonal Architecture - all adapters swappable via env var.                           |
| TC-7 | Docker containerized for local development consistency.                                       |
| TC-8 | CIELAB is the canonical internal color space - all storage and computing in CIELAB.           |
| TC-9 | Client-side image pixel extraction (Canvas API) - no server round-trip for dropper.           |

---

## 13. Assumptions

| #  | Assumption                                                                                      |
| -- | ----------------------------------------------------------------------------------------------- |
| 1  | Supabase free/pro tier is sufficient for Phase 1 scale (< 1,000 tenants, < 100,000 recipes).   |
| 2  | Users have access to the physical diary data and can digitize recipes into Excel/CSV format.     |
| 3  | The 4-Primary CMYK base system is sufficient for new recipe creation.                           |
| 4  | Historical recipes may reference non-CMYK dyes and the system must accommodate them.            |
| 5  | APN Enterprise is the primary validation user for Phase 1.                                      |
| 6  | CI numbers for the chosen base dyes are known and available.                                    |
| 7  | Supabase provides sandbox environments for development and testing.                             |
| 8  | Users have modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions).                 |

---

## 14. Deliverables

### Step 1 Deliverables

| ID   | Deliverable                                                                              |
| ---- | ---------------------------------------------------------------------------------------- |
| D-1  | Authentication system with multi-tenant signup, login, JWT sessions, and RLS.            |
| D-2  | Profile management with material type, dye form, and base dye configuration.             |
| D-3  | Full recipe CRUD with dye ingredients, auxiliary ingredients, and all recipe metadata.    |
| D-4  | Bulk CSV import with validation, error reporting, and summary.                           |
| D-5  | Color directory with bookmark, search, and category support.                             |
| D-6  | Recipe directory UI: searchable, sortable, paginated table with color swatches.          |
| D-7  | Recipe detail page with full composition view.                                           |
| D-8  | Database schema deployed to Supabase with RLS policies and indexes.                      |
| D-9  | Backend API with all Step 1 endpoints, documented.                                       |
| D-10 | Source code on GitHub with README, API docs, and setup instructions.                     |
| D-11 | Test suite: unit tests for services, integration tests for adapters.                     |

### Step 2 Deliverables

| ID    | Deliverable                                                                              |
| ----- | ---------------------------------------------------------------------------------------- |
| D-12  | Color selection UI: wheel, sliders, hex/RGB/CIELAB inputs, bidirectional sync.           |
| D-13  | Formulation engine with pluggable algorithms (nearest-neighbor, interpolation, K-M).     |
| D-14  | Image upload with dropper tool, zoom loupe, and "Use this color" flow.                   |
| D-15  | Delta calibration page for screen-to-reality color correction.                           |
| D-16  | Powder-to-liquid guidance page.                                                          |
| D-17  | PWA configuration: installable, offline recipe access, Lighthouse > 90.                  |
| D-18  | E2E test suite covering full user flows.                                                 |
| D-19  | Cloud deployment with Docker, CI/CD, and auto-deploy on push to main.                   |

---

## 15. Success Criteria

| ID    | Criterion                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------- |
| SC-1  | **Step 1**: All 600 historical recipes successfully imported via CSV with zero data loss.       |
| SC-2  | **Step 1**: Recipe search returns results in < 500 ms for a directory of 1,000 recipes.        |
| SC-3  | **Step 1**: Multi-tenant isolation verified: 2 tenants, neither can see the other's data.      |
| SC-4  | **Step 1**: All recipe CRUD operations functional - create, read, update, delete, duplicate.    |
| SC-5  | **Step 2**: Color formulator returns a computed recipe within 2 seconds.                       |
| SC-6  | **Step 2**: Formulation engine produces results within ?E00 < 3.0 of 10 known test recipes.   |
| SC-7  | **Step 2**: Image dropper extracts correct pixel color from uploaded images.                    |
| SC-8  | **Step 2**: All color inputs/sliders are bidirectionally synchronized with < 50 ms latency.    |
| SC-9  | **Step 2**: App is installable as PWA on mobile/desktop with Lighthouse PWA score > 90.        |
| SC-10 | **Full Phase 1**: 95% first-try accuracy for 10 random historical recipe colors.               |
| SC-11 | **Full Phase 1**: All functional requirements implemented and tested.                          |
| SC-12 | **Full Phase 1**: All service-layer tests pass with FakeUnitOfWork (proving modularity).       |

---

## 16. Risks and Mitigations

| ID   | Risk                                                                 | Impact  | Mitigation                                                                       |
| ---- | -------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| R-1  | Historical diary data is inconsistent or incomplete.                 | High    | Define strict CSV template; provide validation with clear error messages.        |
| R-2  | CIELAB interpolation engine gives poor formulation accuracy.         | High    | Start with nearest-neighbor on historical data; iterate with Kubelka-Munk.       |
| R-3  | Screen colors diverge significantly from physical dye results.       | Medium  | Implement Delta Calibration; clearly label digital previews as "approximate."    |
| R-4  | Supabase RLS misconfiguration leaks cross-tenant data.               | Critical| Test tenant isolation with automated tests; defense-in-depth at application layer.|
| R-5  | CSV import fails on large files (1000+ recipes).                     | Medium  | Implement chunked processing; show progress indicator; handle partial failures.  |
| R-6  | Scope creep from advanced features bleeding into Phase 1.            | Medium  | Strict step 1/step 2 boundary enforcement; defer all P2 items.                  |
| R-7  | Different manufacturers' dyes with same CI number vary in strength.  | Medium  | Add manufacturer/SKU fields to base dyes; document in user guide.                |
| R-8  | Color picker libraries (iro.js/culori) have CIELAB conversion bugs.  | Low     | Validate library conversions against reference implementation; add unit tests.   |

---

## 17. Glossary

| Term                 | Definition                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| CIELAB (L\*a\*b\*)  | Perceptually uniform color space. L\*=lightness, a\*=green?red, b\*=blue?yellow.                 |
| LCh                  | Cylindrical form of CIELAB. L\*=lightness, C\*=chroma (saturation), h-=hue angle.                |
| ?E00                | CIE 2000 color difference formula. < 1.0 = imperceptible, < 3.0 = textile-acceptable.            |
| Kubelka-Munk         | Physics model for light interaction with pigmented materials. Foundation of industrial matching.   |
| K/S                  | Absorption-to-scattering ratio in Kubelka-Munk theory. Linear in dye concentration.              |
| CI Number            | Color Index number - globally standardized identifier for dye chemicals (e.g., CI 74160 = Cyan). |
| CMYK                 | Cyan, Magenta, Yellow, Key (Black) - the 4 primary base dyes used in the subtractive system.     |
| sRGB                 | Standard RGB color space used by monitors, cameras, and the web.                                  |
| Gamut                | The range of colors a device or color space can represent.                                        |
| Liquor Ratio         | Ratio of water weight to substrate weight in a dye bath (e.g., 1:20 = 200 mL for 10 g thread).  |
| Auxiliary Chemicals  | Non-dye chemicals required for dyeing (salt, soda ash, acids, leveling agents).                   |
| Acid Dyes            | Dye family used for wool and silk, requiring acidic conditions (acetic acid).                     |
| Reactive Dyes        | Dye family used for cotton, requiring alkali (soda ash) and salt.                                |
| Disperse Dyes        | Dye family used for polyester, requiring high temperature.                                        |
| Tenant               | An organization/business using the SaaS platform. Data is isolated between tenants.              |
| Profile              | A workspace configured with specific base dyes and material, containing its own recipes.          |
| Base Dye             | A fundamental color dye (powder or liquid) used as an ingredient in mixing.                       |
| Recipe               | A formula specifying dye + auxiliary quantities needed to produce a target color on a material.    |
| Port                 | Abstract interface in hexagonal architecture - a contract that adapters implement.                |
| Adapter              | Concrete implementation of a port (e.g., SupabaseRepository implements AbstractRepository).      |
| RLS                  | Row Level Security - PostgreSQL feature enforcing data access rules at the database level.        |
| JWT                  | JSON Web Token - compact, signed token for stateless authentication.                              |
| UoW                  | Unit of Work - pattern grouping database operations into an atomic transaction.                   |
| PWA                  | Progressive Web App - installable, offline-capable web application.                               |
| Delta Calibration    | Per-user offset to correct screen color display against physical dye thread samples.              |




