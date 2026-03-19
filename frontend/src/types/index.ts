// Entity types
export interface Entity {
  id: number
  name: string
  entity_type: EntityType
  ein: string | null
  tax_year: number
  business_name: string | null
  default_tax_form: string
}

export type EntityType =
  | 'sole_proprietorship'
  | 'single_member_llc'
  | 'partnership'
  | 's_corp'
  | 'c_corp'
  | 'llc_partnership'
  | 'llc_s_corp'
  | 'llc_c_corp'

// Transaction types
export interface Transaction {
  id: number
  transaction_date: string
  amount: number
  direction: 'income' | 'expense'
  raw_description: string | null
  category: string | null
  tax_category: string | null
  classification_status: ClassificationStatus
  confidence_score: number | null
}

export type ClassificationStatus =
  | 'pending'
  | 'classified'
  | 'review_required'
  | 'confirmed'
  | 'pre_classified'

// Import types
export interface TransactionImport {
  id: number
  source: string
  status: ImportStatus
  transactions_imported: number
  import_summary: ImportSummary | null
}

export type ImportStatus = 'processing' | 'completed' | 'failed' | 'partial'

export interface ImportSummary {
  extracted: {
    total_income: number
    total_expenses: number
    net: number
    transaction_count: number
  }
  confidence: number
  notes?: string
}

// Tax form types
export interface GeneratedForm {
  id: number
  entity_id: number
  form_type: FormType
  tax_year: number
  status: FormStatus
  form_data: Record<string, unknown> | null
}

export type FormType = 'schedule_c' | 'form_1120' | 'form_1120_s' | 'form_1065'
export type FormStatus = 'generated' | 'reviewed' | 'approved' | 'filed'

// Tax calculation types
export interface TaxCalculation {
  id: number
  entity_id: number
  tax_year: number
  gross_income: number
  total_expenses: number
  net_income: number
  taxable_income: number
  estimated_tax: number
  self_employment_tax: number
  effective_rate: number
}

// Summary types
export interface TransactionSummary {
  entity_id: number
  tax_year: number | null
  gross_income: number
  total_expenses: number
  net_income: number
  transaction_count: number
  by_category: Record<string, number>
}
