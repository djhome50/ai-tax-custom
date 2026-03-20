import { useQuery } from '@tanstack/react-query'
import { useParams, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { 
  Building2, 
  FileText, 
  Upload, 
  Calculator, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit,
  Settings,
} from 'lucide-react'
import { entityApi, transactionApi } from '../lib/api'
import { useEntity } from '../contexts/EntityContext'

const TABS = [
  { path: '', label: 'Overview', icon: Building2 },
  { path: 'transactions', label: 'Transactions', icon: FileText },
  { path: 'forms', label: 'Tax Forms', icon: Calculator },
  { path: 'settings', label: 'Settings', icon: Settings },
]

export default function EntityDetails() {
  const { entityId } = useParams<{ entityId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { setCurrentEntity } = useEntity()
  const hasRedirected = useRef(false)
  
  const { data: entityResponse, isLoading, error } = useQuery({
    queryKey: ['entity', entityId],
    queryFn: () => entityApi.get(Number(entityId)),
    enabled: !!entityId,
    retry: false,
  })
  const entity = entityResponse?.data

  // Handle entity not found
  useEffect(() => {
    if (!hasRedirected.current && (error || (!isLoading && !entity && entityId))) {
      hasRedirected.current = true
      // Clear stale entity from context
      setCurrentEntity(null)
      // Redirect to entities list
      navigate('/entities', { replace: true })
    }
  }, [error, entity, isLoading, entityId, navigate, setCurrentEntity])

  // Update current entity in context when loaded
  useEffect(() => {
    if (entity) {
      setCurrentEntity(entity)
    }
  }, [entity, setCurrentEntity])

  const { data: summaryResponse } = useQuery({
    queryKey: ['summary', entityId],
    queryFn: () => transactionApi.summary(Number(entityId)),
    enabled: !!entityId,
  })
  const summary = summaryResponse?.data

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Entity not found</h2>
        <Link to="/entities" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to entities
        </Link>
      </div>
    )
  }

  // Determine active tab
  const currentPath = location.pathname.split(`/entities/${entityId}/`)[1] || ''
  const activeTab = TABS.find(t => t.path === currentPath) || TABS[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{entity.name}</h1>
              <p className="text-gray-500">
                {entity.entity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>Tax Year {entity.tax_year}</span>
                <span>•</span>
                <span>{entity.default_tax_form}</span>
                {entity.ein && (
                  <>
                    <span>•</span>
                    <span>EIN: {entity.ein}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link
            to={`/entities/${entityId}/settings`}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Gross Income</p>
              <p className="text-lg font-bold text-gray-900">
                {summary ? formatCurrency(summary.gross_income) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Expenses</p>
              <p className="text-lg font-bold text-gray-900">
                {summary ? formatCurrency(summary.total_expenses) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Income</p>
              <p className={`text-lg font-bold ${summary?.net_income && summary.net_income >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {summary ? formatCurrency(summary.net_income) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-lg font-bold text-gray-900">
                {summary?.transaction_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab.path === tab.path
            const to = tab.path ? `/entities/${entityId}/${tab.path}` : `/entities/${entityId}`
            
            return (
              <Link
                key={tab.path}
                to={to}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab.path === '' ? (
          <OverviewTab entity={entity} summary={summary} entityId={entityId!} />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}

function OverviewTab({ entity, summary, entityId }: { entity: any; summary: any; entityId: string }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/entities/${entityId}/transactions`}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Import Transactions</p>
              <p className="text-sm text-gray-500">Upload CSV, XLSX, or PDF</p>
            </div>
          </Link>

          <Link
            to={`/entities/${entityId}/forms`}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calculator className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Generate Tax Forms</p>
              <p className="text-sm text-gray-500">{entity.default_tax_form}</p>
            </div>
          </Link>

          <Link
            to={`/entities/${entityId}/settings`}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Settings className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Entity Settings</p>
              <p className="text-sm text-gray-500">Edit details</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Expense Breakdown */}
      {summary?.by_category && Object.keys(summary.by_category).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Expense Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(summary.by_category)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 10)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 capitalize">{category.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(amount as number)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Entity Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Entity Information</h3>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-gray-500">Entity Type</dt>
            <dd className="text-sm font-medium text-gray-900 capitalize">
              {entity.entity_type.replace(/_/g, ' ')}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Tax Form</dt>
            <dd className="text-sm font-medium text-gray-900">{entity.default_tax_form}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Tax Year</dt>
            <dd className="text-sm font-medium text-gray-900">{entity.tax_year}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">EIN</dt>
            <dd className="text-sm font-medium text-gray-900">{entity.ein || 'Not set'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
