import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { FileText, Download, CheckCircle, Clock, FileCheck } from 'lucide-react'
import { taxApi, entityApi } from '../lib/api'

const STATUS_COLORS: Record<string, string> = {
  generated: 'bg-gray-100 text-gray-700',
  reviewed: 'bg-primary-50 text-primary-600',
  approved: 'bg-success-50 text-success-600',
  filed: 'bg-success-50 text-success-600',
}

export default function TaxForms() {
  const { entityId } = useParams<{ entityId: string }>()
  const queryClient = useQueryClient()

  const { data: entity } = useQuery({
    queryKey: ['entity', entityId],
    queryFn: () => entityApi.get(Number(entityId)),
    enabled: !!entityId,
  })

  const generateFormMutation = useMutation({
    mutationFn: () => taxApi.generateForm(Number(entityId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', entityId] })
    },
  })

  const generatePdfMutation = useMutation({
    mutationFn: (formId: number) => taxApi.generatePdf(formId),
  })

  const reviewMutation = useMutation({
    mutationFn: (formId: number) => taxApi.reviewForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', entityId] })
    },
  })

  const approveMutation = useMutation({
    mutationFn: (formId: number) => taxApi.approveForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', entityId] })
    },
  })

  const calculateTaxMutation = useMutation({
    mutationFn: () => taxApi.calculate(Number(entityId)),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleGenerateForm = () => {
    generateFormMutation.mutate()
  }

  const handleCalculateTax = () => {
    calculateTaxMutation.mutate()
  }

  const form = generateFormMutation.data?.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{entity?.data?.name}</h1>
          <p className="text-gray-600">Tax Year {entity?.data?.tax_year}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCalculateTax}
            className="btn btn-secondary"
            disabled={calculateTaxMutation.isPending}
          >
            Calculate Tax
          </button>
          <button
            onClick={handleGenerateForm}
            className="btn btn-primary"
            disabled={generateFormMutation.isPending}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Form
          </button>
        </div>
      </div>

      {/* Tax calculation */}
      {calculateTaxMutation.data?.data && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Tax Calculation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Gross Income</p>
              <p className="text-xl font-bold">
                {formatCurrency(calculateTaxMutation.data.data.gross_income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-xl font-bold">
                {formatCurrency(calculateTaxMutation.data.data.total_expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className="text-xl font-bold">
                {formatCurrency(calculateTaxMutation.data.data.net_income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Tax</p>
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(calculateTaxMutation.data.data.estimated_tax)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Self-Employment Tax</span>
              <span className="font-medium">
                {formatCurrency(calculateTaxMutation.data.data.self_employment_tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Effective Rate</span>
              <span className="font-medium">
                {(calculateTaxMutation.data.data.effective_rate * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Generated form */}
      {form && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {form.form_type.toUpperCase().replace('_', ' ')}
            </h2>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                STATUS_COLORS[form.status]
              }`}
            >
              {form.status}
            </span>
          </div>

          {/* Form data preview */}
          {form.form_data && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Gross Receipts</p>
                  <p className="font-medium">{formatCurrency((form.form_data as Record<string, unknown>).line_1 as number || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Expenses</p>
                  <p className="font-medium">{formatCurrency((form.form_data as Record<string, unknown>).line_28 as number || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Net Profit</p>
                  <p className="font-medium">{formatCurrency((form.form_data as Record<string, unknown>).line_31 as number || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">SE Tax</p>
                  <p className="font-medium">
                    {formatCurrency((form.form_data as Record<string, unknown>).self_employment_tax as number || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => generatePdfMutation.mutate(form.id)}
              className="btn btn-secondary"
              disabled={generatePdfMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            {form.status === 'generated' && (
              <button
                onClick={() => reviewMutation.mutate(form.id)}
                className="btn btn-secondary"
                disabled={reviewMutation.isPending}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark Reviewed
              </button>
            )}
            {form.status === 'reviewed' && (
              <button
                onClick={() => approveMutation.mutate(form.id)}
                className="btn btn-primary"
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
