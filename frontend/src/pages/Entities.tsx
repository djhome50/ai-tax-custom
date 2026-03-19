import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Building2, Trash2, Edit } from 'lucide-react'
import { entityApi } from '../lib/api'

const ENTITY_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'single_member_llc', label: 'Single Member LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 's_corp', label: 'S-Corp' },
  { value: 'c_corp', label: 'C-Corp' },
  { value: 'llc_partnership', label: 'LLC (Partnership)' },
  { value: 'llc_s_corp', label: 'LLC (S-Corp)' },
  { value: 'llc_c_corp', label: 'LLC (C-Corp)' },
]

export default function Entities() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    entity_type: 'sole_proprietorship',
    ein: '',
    tax_year: 2024,
    business_name: '',
    business_code: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  })

  const queryClient = useQueryClient()

  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => entityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      setShowForm(false)
      setFormData({
        name: '',
        entity_type: 'sole_proprietorship',
        ein: '',
        tax_year: 2024,
        business_name: '',
        business_code: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => entityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entities</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entity
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Create Entity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Entity Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Entity Type</label>
                <select
                  className="input"
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">EIN</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="label">Tax Year</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.tax_year}
                    onChange={(e) => setFormData({ ...formData, tax_year: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Business Name (DBA)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entities list */}
      <div className="space-y-4">
        {entities?.data?.map((entity) => (
          <div key={entity.id} className="card">
            <div className="flex items-center justify-between">
              <Link
                to={`/entities/${entity.id}/transactions`}
                className="flex items-center gap-4 flex-1"
              >
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-sm text-gray-600">
                    {entity.entity_type.replace('_', ' ')} • {entity.default_tax_form}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Tax Year {entity.tax_year}</span>
                <button
                  onClick={() => deleteMutation.mutate(entity.id)}
                  className="p-2 text-gray-400 hover:text-danger-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
