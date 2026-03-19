import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Building2, TrendingUp, TrendingDown, FileText, Plus } from 'lucide-react'
import { entityApi } from '../lib/api'

export default function Dashboard() {
  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/entities" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Entity
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entities</p>
              <p className="text-2xl font-bold">{entities?.data?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entities list */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Your Entities</h2>
        {entities?.data?.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No entities yet</p>
            <Link to="/entities" className="btn btn-primary">
              Create your first entity
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entities?.data?.map((entity) => (
              <Link
                key={entity.id}
                to={`/entities/${entity.id}/transactions`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-sm text-gray-600">
                    {entity.entity_type.replace('_', ' ')} • {entity.default_tax_form}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Tax Year {entity.tax_year}</span>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
