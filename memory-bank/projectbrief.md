# Project Brief: AI Tax Engine

## Overview

AI-native tax automation platform that ingests financial data, classifies transactions using AI, calculates taxes, and generates editable IRS-ready forms.

## Core Requirements

1. **Multi-Entity Support**: Handle different business types (Sole Prop, LLC, S-Corp, C-Corp, Partnership)
2. **AI-Powered Data Ingestion**: Extract transactions from any format (CSV, XLSX, PDF, JSON)
3. **Intelligent Classification**: Hybrid rule + AI classification with confidence scoring
4. **Tax Calculation**: Schedule C, Form 1120, Form 1065 support
5. **Form Generation**: PDF and IRS e-file XML outputs
6. **Multi-Tenancy**: SaaS-ready architecture

## Goals

- Automate 90%+ of tax preparation workflow
- Reduce manual bookkeeping through AI classification
- Generate audit-ready tax forms
- Support future expansion to full ERP

## Scope

### In Scope (Phase 1)
- Transaction import and classification
- Tax calculation for common business types
- PDF/XML form generation
- User authentication and multi-tenancy

### Out of Scope (Phase 1)
- Full ERP functionality (inventory, payroll, HR)
- State tax calculations
- Real bank integrations (Plaid, QuickBooks)
- E-filing with IRS

## Success Criteria

- Import transactions from CSV/XLSX successfully
- Classify transactions with >80% confidence
- Generate accurate Schedule C forms
- Output valid IRS XML format
