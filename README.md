# AI Tax Engine

A modern, AI-powered tax automation system built from scratch with a clean architecture.

## Features

- **AI-Powered Data Ingestion**: Extract transactions from any format (CSV, XLSX, PDF, JSON) using LLMs
- **Intelligent Classification**: Hybrid rule + AI classification with confidence scoring
- **Multi-Entity Support**: Handle different business types (Sole Prop, LLC, S-Corp, C-Corp, Partnership)
- **Tax Calculation Engine**: Calculate Schedule C, Form 1120, Form 1065
- **Form Generation**: Generate PDF and IRS e-file XML formats
- **Modern Stack**: FastAPI + React + PostgreSQL

## Architecture

```
Custom/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # REST API routes
│   │   ├── core/           # Config, database
│   │   ├── models/         # SQLAlchemy models
│   │   └── services/       # Business logic
│   │       ├── ingestion/  # AI data extraction
│   │       ├── classification/ # Transaction classification
│   │       ├── tax/         # Tax calculations
│   │       └── forms/       # PDF/XML generation
│   └── pyproject.toml
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- OpenAI or Anthropic API key

### Run with Docker

```bash
# Clone and navigate
cd /Users/david/Projects/AITaxSoftware/Custom

# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/v1/docs

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Entities
- `GET /api/v1/entities` - List all entities
- `POST /api/v1/entities` - Create entity
- `GET /api/v1/entities/{id}` - Get entity
- `PATCH /api/v1/entities/{id}` - Update entity
- `DELETE /api/v1/entities/{id}` - Delete entity

### Transactions
- `POST /api/v1/transactions/import/file` - Import from file (AI extraction)
- `POST /api/v1/transactions/import/data` - Import from raw data
- `GET /api/v1/transactions` - List transactions
- `POST /api/v1/transactions/{id}/classify` - Classify single transaction
- `POST /api/v1/transactions/classify/pending` - Classify all pending
- `POST /api/v1/transactions/{id}/reclassify` - Reclassify with feedback

### Tax
- `POST /api/v1/tax/calculate/{entity_id}` - Calculate tax liability
- `POST /api/v1/tax/forms/generate/{entity_id}` - Generate tax form
- `POST /api/v1/tax/forms/{form_id}/pdf` - Generate PDF
- `POST /api/v1/tax/forms/{form_id}/xml` - Generate IRS XML

## Entity Types Supported

| Entity Type | Tax Form |
|-------------|----------|
| Sole Proprietorship | Schedule C |
| Single-Member LLC | Schedule C |
| Partnership | Form 1065 |
| S-Corp | Form 1120-S |
| C-Corp | Form 1120 |
| LLC (Partnership) | Form 1065 |
| LLC (S-Corp) | Form 1120-S |
| LLC (C-Corp) | Form 1120 |

## AI Classification

The system uses a hybrid approach:

1. **Rule-based**: Fast pattern matching for known vendors/categories
2. **AI-powered**: LLM classification for ambiguous transactions
3. **Confidence scoring**: Low-confidence items flagged for review
4. **Feedback loop**: User corrections improve future classifications

## Tech Stack

**Backend:**
- FastAPI (async Python web framework)
- SQLAlchemy 2.0 (async ORM)
- PostgreSQL (database)
- OpenAI/Anthropic (AI)
- ReportLab (PDF generation)
- lxml (XML generation)

**Frontend:**
- React 18
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Lucide Icons

## License

MIT
