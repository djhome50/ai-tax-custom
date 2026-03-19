# Project Roadmap: AI Tax Engine

## Timeline Overview

```
Phase 1: Core Engine        [████████░░] 80%  (Mar-Apr 2026)
Phase 2: Integrations       [░░░░░░░░░░] 0%   (May-Jun 2026)
Phase 3: Enhanced Tax       [░░░░░░░░░░] 0%   (Jul-Aug 2026)
Phase 4: ERP Add-on         [░░░░░░░░░░] 0%   (2027)
```

## Phase 1: AI Tax Core (Current)

**Duration**: 8 weeks
**Status**: 80% complete

### Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Backend services built | Week 4 | ✅ Done |
| Frontend UI built | Week 5 | ✅ Done |
| Authentication | Week 6 | 🔄 In Progress |
| Database migrations | Week 6 | ⏳ Pending |
| Testing | Week 7 | ⏳ Pending |
| MVP Release | Week 8 | ⏳ Pending |

### Sprint Breakdown

**Sprint 1-2**: Backend foundation ✅
- Database models
- API routes
- Service layer

**Sprint 3-4**: AI Services ✅
- Ingestion service
- Classification service
- Tax calculation

**Sprint 5**: Frontend ✅
- React setup
- All pages
- API integration

**Sprint 6**: Auth & Security 🔄
- JWT authentication
- User management
- Multi-tenancy

**Sprint 7**: Testing ⏳
- Unit tests
- Integration tests
- E2E tests

**Sprint 8**: Polish & Deploy ⏳
- Error handling
- Documentation
- Deployment

## Phase 2: External Integrations

**Duration**: 6 weeks
**Start**: After Phase 1 release

### Deliverables
- QuickBooks Online integration
- Xero integration
- Plaid bank connections
- Stripe/PayPal imports

## Phase 3: Enhanced Tax Features

**Duration**: 8 weeks
**Start**: After Phase 2

### Deliverables
- State tax calculations (50 states)
- Form 941, 1099 generation
- Depreciation tracking
- Tax planning tools

## Phase 4: ERP Add-on

**Duration**: 12+ weeks
**Start**: TBD

### Options
- Build custom ERP modules
- Integrate ERPNext as submodule

## Dependencies

### External
- OpenAI/Anthropic API access
- PostgreSQL hosting
- Redis hosting

### Internal
- Phase 1 complete before Phase 2
- User authentication before integrations
- Testing before production

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI API costs | Use rules first, cache results |
| IRS form changes | Modular form templates |
| Security vulnerabilities | Audit, pen testing |
| Scope creep | Strict phase boundaries |
