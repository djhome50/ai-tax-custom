import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Plus, 
  Upload, 
  Calculator,
  ArrowRight,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { entityApi, transactionApi } from '../lib/api'

export default function Dashboard() {
  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  const entityCount = entities?.data?.length || 0
  const firstEntity = entities?.data?.[0]

  // Fetch summary for first entity if available
  const { data: summaryResponse } = useQuery({
    queryKey: ['summary', firstEntity?.id],
    queryFn: () => transactionApi.summary(firstEntity!.id),
    enabled: !!firstEntity,
  })
  const summary = summaryResponse?.data

  // Fetch recent transactions
  const { data: transactionsResponse } = useQuery({
    queryKey: ['transactions', firstEntity?.id],
    queryFn: () => transactionApi.list(firstEntity!.id, { limit: 5 }),
    enabled: !!firstEntity,
  })
  const recentTransactions = transactionsResponse?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const pendingCount = recentTransactions?.filter(t => t.classification_status === 'pending').length || 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to AI Tax Engine</h1>
        <p className="text-indigo-100 mb-4">
          {entityCount === 0 
            ? "Get started by creating your first business entity"
            : `You have ${entityCount} ${entityCount === 1 ? 'entity' : 'entities'} set up`
          }
        </p>
        <div className="flex gap-3">
          <Link
            to="/entities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entity
          </Link>
          {entityCount > 0 && (
            <Link
              to="/entities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-400 transition-colors"
            >
              View All
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entities</p>
              <p className="text-2xl font-bold text-gray-900">{entityCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.gross_income) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary ? formatCurrency(summary.total_expenses) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${summary?.net_income && summary.net_income >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {summary ? formatCurrency(summary.net_income) : '$0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to={firstEntity ? `/entities/${firstEntity.id}/transactions` : '/entities'}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Import Transactions</h3>
              <p className="text-sm text-gray-600">Upload CSV, XLSX, or PDF files</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Link>

        <Link
          to={firstEntity ? `/entities/${firstEntity.id}/forms` : '/entities'}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Generate Tax Forms</h3>
              <p className="text-sm text-gray-600">Create Schedule C, 1120, 1065</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Link>

        <Link
          to={firstEntity ? `/entities/${firstEntity.id}/tax` : '/entities'}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Calculate Taxes</h3>
              <p className="text-sm text-gray-600">AI-powered tax estimation</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Calculator className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Entities List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Entities</h2>
            {entityCount > 0 && (
              <Link to="/entities" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all
              </Link>
            )}
          </div>
        </div>
        
        {entityCount === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No entities yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create your first business entity to start tracking transactions
            </p>
            <Link
              to="/entities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Entity
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entities?.data?.slice(0, 5).map((entity) => (
              <Link
                key={entity.id}
                to={`/entities/${entity.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entity.name}</p>
                    <p className="text-sm text-gray-500">
                      {entity.entity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {entity.default_tax_form}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Tax Year {entity.tax_year}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              {firstEntity && (
                <Link to={`/entities/${firstEntity.id}/transactions`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all
                </Link>
              )}
            </div>
          </div>
          
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="p-6">
              <div className="flex items-center gap-4 text-gray-500">
                <Clock className="w-5 h-5" />
                <p className="text-sm">No transactions yet. Import your first file to get started.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${txn.direction === 'income' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {txn.direction === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {txn.raw_description || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(txn.transaction_date)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${txn.direction === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.direction === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Classifications */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Classification Status</h2>
          </div>
          
          {pendingCount > 0 ? (
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">{pendingCount} transactions need classification</p>
                  <p className="text-sm text-amber-700">AI will categorize them automatically</p>
                </div>
              </div>
              {firstEntity && (
                <Link
                  to={`/entities/${firstEntity.id}/transactions`}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Review transactions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-4 text-gray-500">
                <Clock className="w-5 h-5" />
                <p className="text-sm">
                  {summary?.transaction_count 
                    ? `All ${summary.transaction_count} transactions classified`
                    : 'No transactions to classify'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
