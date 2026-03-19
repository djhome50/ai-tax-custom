# System Patterns: AI Tax Engine

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React + TypeScript + TailwindCSS + React Query             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  FastAPI + SQLAlchemy (async) + PostgreSQL                  │
├─────────────────────────────────────────────────────────────┤
│  Services Layer:                                            │
│  - Ingestion Service (AI extraction)                        │
│  - Classification Service (rules + AI)                      │
│  - Tax Calculation Service                                  │
│  - Form Generation Service (PDF/XML)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│  - OpenAI / Anthropic (AI)                                  │
│  - PostgreSQL (Database)                                    │
│  - Redis (Caching/Queues)                                   │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Async-First
- All database operations use async SQLAlchemy
- FastAPI with async endpoints
- Non-blocking AI API calls

### 2. Service Layer Pattern
- Business logic isolated in service classes
- API routes are thin controllers
- Models are pure data structures

### 3. Multi-Tenancy
- All entities scoped to user
- Row-level security via API dependencies
- No cross-tenant data access

### 4. AI Provider Abstraction
- Support OpenAI and Anthropic
- Configurable via environment
- Easy to add new providers

### 5. Hybrid Classification
- Rule-based for known patterns (fast, free)
- AI for ambiguous cases (accurate, costs money)
- Confidence scoring for human review

## Data Model

```
User
  │
  └── Entity (business)
        │
        ├── Transaction (financial records)
        │     └── ClassificationFeedback
        │
        ├── TransactionImport (upload batch)
        │
        ├── TaxCalculation (computed tax)
        │
        └── GeneratedForm (PDF/XML output)
```

## API Structure

```
/api/v1
├── /auth          - Authentication endpoints
├── /entities      - CRUD for business entities
├── /transactions  - Import, list, classify
├── /tax           - Calculate, generate forms
└── /integrations  - External connections (future)
```

## Security Patterns

- JWT-based authentication
- Password hashing with bcrypt
- API key encryption at rest
- CORS configured for frontend origin
- Rate limiting (planned)
