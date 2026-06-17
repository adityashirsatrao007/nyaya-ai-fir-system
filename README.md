# ⚖️ Nyaya AI — Intelligent FIR Digitization & Legal Analysis Platform

**Python 3.11** · **FastAPI** · **React 19** · **EasyOCR** · **PostgreSQL** · **Docker**

> 🏆 1st Runner Up — National Hackathon (800+ teams)

---

## Overview

Nyaya AI digitizes and analyzes **First Information Report (FIR)** documents from Indian police stations using AI-powered OCR and legal statute mapping. It converts scanned FIR images (handwritten and printed, English and Hindi) into structured digital cases, extracts IPC sections, and provides legal search and evidence forensics.

### Key Capabilities

| Capability | Description |
|---|---|
| **OCR** | Extracts text from scanned FIR images — handwritten & printed, English & Hindi via EasyOCR |
| **IPC Section Detection** | Regex + TF-IDF mapping to Indian Penal Code database |
| **Legal Statute Search** | Full-text search across 500+ IPC sections with relevance ranking |
| **Evidence Forensics** | Deepfake detection and tamper analysis via HuggingFace models |
| **Case Management** | Secure CRUD with JWT auth and PostgreSQL persistence |
| **Multi-language** | Automatic language detection + Deep-Translator pipeline for regional languages |

---

## Architecture

```
nyaya-ai-fir-system/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # API entry point, route registration
│   ├── ipc_mapping.py          # IPC section ↔ legal code mapping
│   ├── app/
│   │   ├── routes/             # auth.py, fir.py, legal_search.py
│   │   ├── services/           # ocr_service.py, ipc_extractor.py, evidence_forensics.py
│   │   └── models/             # Pydantic schemas
│   ├── data/                   # IPC sections DB, crime statistics
│   ├── ml/                     # Knowledge base builders
│   └── scripts/                # Utility scripts
├── frontend/                   # React 19 + Vite dashboard
│   └── src/
│       ├── pages/              # Dashboard, Login, Search, CaseDetail
│       └── components/         # Reusable UI components
├── datasets/                   # Training data (FIR images + YOLO labels)
├── demo_firs/                  # Sample FIR documents
└── docs/                       # Supplemental documentation
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **OCR** | EasyOCR (English + Hindi), TrOCR (optional) |
| **ML** | HuggingFace Transformers, YOLO (Ultralytics), OpenCV |
| **Database** | PostgreSQL (Neon), psycopg2 |
| **Auth** | JWT-based authentication |
| **Frontend** | React 19, Vite, NextUI, TailwindCSS |
| **Visualization** | Three.js, Framer Motion |
| **Infra** | Docker, GitHub Actions CI |

---

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL (local or [Neon](https://neon.tech))
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set your DATABASE_URL
python main.py
```

The API starts at **http://localhost:8000**.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard starts at **http://localhost:5173**.

### 3. Seed Demo Accounts

```bash
cd backend
python seed_demo_accounts.py
```

Demo credentials: `analyst@nyaya.ai` / `demo@nyaya.ai` / `officer@nyaya.ai`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | User login (returns JWT) |
| `POST` | `/auth/register` | User registration |
| `POST` | `/analyze` | Upload & analyze FIR/evidence document |
| `POST` | `/api/v1/fir/process` | OCR extraction + IPC mapping |
| `GET` | `/api/v1/legal/search` | Search IPC sections by query |
| `GET` | `/cases` | List all cases (filterable by `?email=`) |
| `POST` | `/cases` | Create a new case |
| `PUT` | `/cases/{id}` | Update existing case |
| `DELETE` | `/cases/{id}` | Delete a case |

### Example: Analyze an FIR

```bash
curl -X POST http://localhost:8000/analyze \
  -F "file=@demo_firs/sample_fir_1.jpg" \
  -F "context=fir"
```

### Example: Search IPC Sections

```bash
curl "http://localhost:8000/api/v1/legal/search?q=theft&top_k=3"
```

---

## Docker Deployment

```bash
docker-compose up --build
```

This builds the backend image, loads `.env` variables, and exposes port **8000**.

---

## Project Structure

```
backend/
├── main.py                      # FastAPI server entry
├── ipc_mapping.py               # IPC legal code map
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Production container
├── app/
│   ├── routes/
│   │   ├── auth.py              # JWT login/register
│   │   ├── fir.py               # FIR processing endpoints
│   │   └── legal_search.py      # IPC section search
│   ├── services/
│   │   ├── ocr_service.py       # EasyOCR + TrOCR pipeline
│   │   ├── ipc_extractor.py     # IPC regex + ML extraction
│   │   └── evidence_forensics.py# Deepfake/tamper detection
│   └── models/
│       └── schemas.py           # Pydantic response models
├── data/
│   ├── ipc_sections.json        # 500+ IPC sections
│   ├── ipc_full_data.json       # Enriched IPC knowledge base
│   └── crime_statistics.json    # Crime stats dataset
├── ml/
│   ├── build_ipc_knowledge_base.py
│   └── dataset_builder.py
├── scripts/
│   └── convert_ipc_kaggle.py
├── static/                      # Uploaded FIR images
└── tests/                       # Test suite

frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── CaseDetail.jsx
│   │   └── LegalSearch.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── CaseCard.jsx
│   └── services/
│       └── api.js               # Axios API client
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## CI/CD

GitHub Actions runs on every push/PR to `main`:

- **lint** — Ruff checks on `backend/`
- **test** — pytest execution (once tests are added)
- **docker** — Verifies Docker image builds

---

## License

MIT © 2026 Aditya Shirsatrao
