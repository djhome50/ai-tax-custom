import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { transactionApi, entityApi, taxApi } from '../lib/api'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  classified: 'bg-success-50 text-success-600',
  review_required: 'bg-warning-50 text-warning-600',
  confirmed: 'bg-primary-50 text-primary-600',
  pre_classified: 'bg-success-50 text-success-600',
}

export default function Transactions() {
  const { entityId } = useParams<{ entityId: string }>()
  const [importing, setImporting] = useState(false)

  const queryClient = useQueryClient()

  const { data: entity } = useQuery({
    queryKey: ['entity', entityId],
    queryFn: () => entityApi.get(Number(entityId)),
    enabled: !!entityId,
  })

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', entityId],
    queryFn: () => transactionApi.list(Number(entityId)),
    enabled: !!entityId,
  })

  const { data: summary } = useQuery({
    queryKey: ['summary', entityId],
    queryFn: () => transactionApi.summary(Number(entityId)),
    enabled: !!entityId,
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => transactionApi.importFile(Number(entityId), file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', entityId] })
      queryClient.invalidateQueries({ queryKey: ['summary', entityId] })
      setImporting(false)
    },
    onError: () => {
      setImporting(false)
    },
  })

  const classifyMutation = useMutation({
    mutationFn: () => transactionApi.classifyPending(Number(entityId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', entityId] })
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setImporting(true)
        importMutation.mutate(acceptedFiles[0])
      }
    },
    [importMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
    },
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{entity?.data?.name}</h1>
          <p className="text-gray-600">{entity?.data?.default_tax_form}</p>
        </div>
        <button
          onClick={() => classifyMutation.mutate()}
          className="btn btn-secondary"
          disabled={classifyMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${classifyMutation.isPending ? 'animate-spin' : ''}`} />
          Classify Pending
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Gross Income</p>
          <p className="text-xl font-bold text-success-600">
            {formatCurrency(summary?.data?.gross_income || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-danger-600">
            {formatCurrency(summary?.data?.total_expenses || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Net Income</p>
          <p className="text-xl font-bold">
            {formatCurrency(summary?.data?.net_income || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-xl font-bold">{summary?.data?.transaction_count || 0}</p>
        </div>
      </div>

      {/* Import dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-4" />
        {importing ? (
          <p className="text-primary-600">Importing with AI...</p>
        ) : isDragActive ? (
          <p className="text-primary-600">Drop your file here...</p>
        ) : (
          <div>
            <p className="text-gray-600">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Supports CSV, XLSX, PDF - AI will extract transactions automatically
            </p>
          </div>
        )}
      </div>

      {/* Transactions table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions?.data?.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{formatDate(txn.transaction_date)}</td>
                <td className="px-4 py-3 text-sm">{txn.raw_description || '-'}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={`font-medium ${
                      txn.direction === 'income' ? 'text-success-600' : 'text-gray-900'
                    }`}
                  >
                    {txn.direction === 'income' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{txn.category || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[txn.classification_status]
                    }`}
                  >
                    {txn.classification_status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
