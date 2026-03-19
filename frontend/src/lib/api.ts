import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api

// Entity API
export const entityApi = {
  list: () => api.get<Entity[]>('/entities'),
  get: (id: number) => api.get<Entity>(`/entities/${id}`),
  create: (data: Partial<Entity>) => api.post<Entity>('/entities', data),
  update: (id: number, data: Partial<Entity>) => api.patch<Entity>(`/entities/${id}`, data),
  delete: (id: number) => api.delete(`/entities/${id}`),
}

// Transaction API
export const transactionApi = {
  list: (entityId: number, params?: Record<string, unknown>) =>
    api.get<Transaction[]>('/transactions', { params: { entity_id: entityId, ...params } }),
  get: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  importFile: (entityId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<TransactionImport>('/transactions/import/file', formData, {
      params: { entity_id: entityId },
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  importData: (entityId: number, data: unknown) =>
    api.post<TransactionImport>('/transactions/import/data', data, {
      params: { entity_id: entityId },
    }),
  classify: (id: number) => api.post<Transaction>(`/transactions/${id}/classify`),
  classifyPending: (entityId: number, limit?: number) =>
    api.post('/transactions/classify/pending', null, {
      params: { entity_id: entityId, limit },
    }),
  reclassify: (id: number, category: string, taxCategory: string) =>
    api.post<Transaction>(`/transactions/${id}/reclassify`, {
      category,
      tax_category: taxCategory,
    }),
  summary: (entityId: number, taxYear?: number) =>
    api.get<TransactionSummary>(`/transactions/summary/${entityId}`, {
      params: { tax_year: taxYear },
    }),
}

// Tax API
export const taxApi = {
  calculate: (entityId: number, taxYear?: number) =>
    api.post<TaxCalculation>(`/tax/calculate/${entityId}`, null, {
      params: { tax_year: taxYear },
    }),
  generateForm: (entityId: number, taxYear?: number) =>
    api.post<GeneratedForm>(`/tax/forms/generate/${entityId}`, null, {
      params: { tax_year: taxYear },
    }),
  getForm: (formId: number) => api.get<GeneratedForm>(`/tax/forms/${formId}`),
  generatePdf: (formId: number) => api.post(`/tax/forms/${formId}/pdf`),
  generateXml: (formId: number) => api.post(`/tax/forms/${formId}/xml`),
  reviewForm: (formId: number, notes?: string) =>
    api.post(`/tax/forms/${formId}/review`, null, { params: { notes } }),
  approveForm: (formId: number) => api.post(`/tax/forms/${formId}/approve`),
}

// Types
export interface Entity {
  id: number
  name: string
  entity_type: string
  ein: string | null
  tax_year: number
  business_name: string | null
  default_tax_form: string
}

export interface Transaction {
  id: number
  transaction_date: string
  amount: number
  direction: 'income' | 'expense'
  raw_description: string | null
  category: string | null
  tax_category: string | null
  classification_status: string
  confidence_score: number | null
}

export interface TransactionImport {
  id: number
  source: string
  status: string
  transactions_imported: number
  import_summary: {
    extracted: {
      total_income: number
      total_expenses: number
      transaction_count: number
    }
    confidence: number
  } | null
}

export interface TransactionSummary {
  entity_id: number
  gross_income: number
  total_expenses: number
  net_income: number
  transaction_count: number
  by_category: Record<string, number>
}

export interface GeneratedForm {
  id: number
  entity_id: number
  form_type: string
  tax_year: number
  status: string
  form_data: Record<string, unknown> | null
}

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
