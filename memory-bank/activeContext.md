# Active Context: AI Tax Engine

## Current Focus

**Phase 1 Completion**: Finalizing the core tax engine for initial testing.

## Recent Changes

1. Created monorepo structure with git submodules
2. Built complete backend services:
   - AI ingestion service (CSV, XLSX, PDF, JSON)
   - Classification service (rules + AI)
   - Tax calculation (Schedule C complete)
   - Form generation (PDF + XML)
3. Created React frontend with all pages
4. Added Docker configuration
5. Created development plan (PLAN.md)

## Next Steps

### Immediate (This Session)
- [ ] Install frontend dependencies
- [ ] Add JWT authentication system
- [ ] Add user management endpoints
- [ ] Test the full flow

### Short Term
- [ ] Run database migrations
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write unit tests

### Medium Term
- [ ] Add QuickBooks/Xero integrations
- [ ] Add Plaid bank connections
- [ ] Expand tax forms

## Active Decisions

1. **Custom vs Frappe**: Chose Custom build for AI-native architecture
2. **ERP Later**: Will add ERP as Phase 4, not now
3. **Auth Strategy**: JWT-based, will add OAuth later
4. **AI Provider**: OpenAI primary, Anthropic fallback

## Known Issues

- Frontend lint errors (will resolve after npm install)
- No database migrations yet
- Authentication is placeholder
- No tests written

## Context from Design Document

The system design calls for:
- Universal financial ingestion API
- AI classification with feedback loop
- Hybrid tax engine (deterministic + AI)
- IRS-ready form generation

See `ChatGPT-AI_Tax_System_Design.md` for full design.
