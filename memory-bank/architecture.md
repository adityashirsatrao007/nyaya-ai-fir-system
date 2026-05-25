# Nyaya AI — Architecture

## Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS + NextUI + Framer Motion + GSAP + Three.js (react-three-fiber)
- **Backend:** Python FastAPI (uvicorn)
- **Database:** PostgreSQL (`nyaya_fir`)
- **Auth:** JWT-based (handled by backend `/auth/*` endpoints)

## Ports
- Frontend dev server: `:5174`
- Backend API server: `:8001`
- Database: `:5432`

## Frontend Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Hero, features, audience sections, CTA |
| `/login` | `Login` | Glass card auth form |
| `/signup` | `Signup` | Registration with role selector |
| `/search` | `LegalSearch` | IPC/BNS semantic search |
| `/app` | `Dashboard` | Protected — FIR analysis wizard |

## Key Components
- `NavBar.jsx` — Floating pill navbar with scroll morph (glass on scroll)
- `Court3D.jsx` — 3D interactive justice scale (Three.js)
- `Footer.jsx` — Dark luxury footer

## Design Tokens (Tailwind)
- `bg-background`: `#0A0A0A`
- `bg-surface`: `#111113`
- `bg-elevated`: `#1C1C1E`
- `nyaya-500`: `#0A84FF` (primary accent)
- `amber-500`: `#D4AF37` (gold accent)
- Fonts: `Outfit` (display), `Plus Jakarta Sans` (heading), `Cormorant Garamond` (dramatic)
- CSS noise overlay via SVG feTurbulence at 0.035 opacity

## Backend Endpoints
| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Health check |
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login |
| `/legal/search` | POST | IPC/BNS vector search |
| `/legal/categories` | GET | List search categories |
| `/analyze` | POST | FIR + evidence analysis |
| `/cases` | GET | List user cases |

## Persisting Learning
Key learnings from mistakes should be logged in `decisions.md` so future sessions don't repeat them.
