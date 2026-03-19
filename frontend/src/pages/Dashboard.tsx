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
} from 'lucide-react'
import { entityApi } from '../lib/api'

export default function Dashboard() {
  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const entityCount = entities?.data?.length || 0

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
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
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/entities"
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
          to="/entities"
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
          to="/entities"
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
                to={`/entities/${entity.id}/transactions`}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-gray-500">
            <Clock className="w-5 h-5" />
            <p className="text-sm">No recent activity. Start by creating an entity or importing transactions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
