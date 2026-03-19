# Technical Context: AI Tax Engine

## Technologies

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI (async web framework)
- **ORM**: SQLAlchemy 2.0 (async mode)
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Validation**: Pydantic v2

### Frontend
- **Language**: TypeScript 5
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3
- **Data Fetching**: TanStack Query v5
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios

### AI/ML
- **Primary**: OpenAI (GPT-4o-mini, GPT-4o)
- **Alternative**: Anthropic (Claude 3 Haiku, Sonnet)
- **Extraction**: LLM-based structured extraction
- **Classification**: Hybrid (regex rules + LLM)

### Form Generation
- **PDF**: ReportLab
- **XML**: lxml (IRS e-file format)

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Database Migrations**: Alembic (planned)
- **Process Manager**: Uvicorn

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15
- Redis 7
- Docker (optional)

### Environment Variables
See `backend/.env.example` for all configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: AI provider
- `SECRET_KEY`: JWT signing key

### Running Locally

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -e .
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Running with Docker

```bash
docker-compose up -d
```

## Dependencies

### Backend (pyproject.toml)
- fastapi
- uvicorn[standard]
- sqlalchemy[asyncio]
- asyncpg
- redis
- pydantic
- pydantic-settings
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
- openai
- anthropic
- reportlab
- lxml
- aiofiles
- httpx

### Frontend (package.json)
- react
- react-dom
- react-router-dom
- @tanstack/react-query
- axios
- lucide-react
- tailwindcss
- typescript

## Technical Constraints

1. **Async Required**: All I/O operations must be async
2. **PostgreSQL Only**: Uses PostgreSQL-specific features
3. **AI API Costs**: Classification costs money, use rules first
4. **IRS XML Schema**: Must conform to IRS specifications
5. **No E-Filing Yet**: Forms generated but not submitted to IRS

## Deployment Targets

- Development: Docker Compose
- Production: Docker Swarm or Kubernetes (planned)
- Database: Managed PostgreSQL (AWS RDS, etc.)
- Cache: Managed Redis (AWS ElastiCache, etc.)
