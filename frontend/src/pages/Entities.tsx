import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Building2, Trash2, ArrowRight, X, FileText, Pencil } from 'lucide-react'
import { entityApi } from '../lib/api'
import { useToast } from '../components/ToastProvider'
import { Loading, LoadingButton } from '../components/Loading'

const ENTITY_TYPES = [
  // Individual types
  { value: 'individual', label: 'Individual', form: 'Form 1040', category: 'individual' },
  { value: 'individual_with_business', label: 'Individual with Business', form: 'Form 1040 + Schedule C', category: 'individual' },
  // Business types
  { value: 'sole_proprietorship', label: 'Sole Proprietorship', form: 'Schedule C', category: 'business' },
  { value: 'single_member_llc', label: 'Single Member LLC', form: 'Schedule C', category: 'business' },
  { value: 'partnership', label: 'Partnership', form: 'Form 1065', category: 'business' },
  { value: 's_corp', label: 'S-Corp', form: 'Form 1120-S', category: 'business' },
  { value: 'c_corp', label: 'C-Corp', form: 'Form 1120', category: 'business' },
  { value: 'llc_partnership', label: 'LLC (Partnership)', form: 'Form 1065', category: 'business' },
  { value: 'llc_s_corp', label: 'LLC (S-Corp)', form: 'Form 1120-S', category: 'business' },
  { value: 'llc_c_corp', label: 'LLC (C-Corp)', form: 'Form 1120', category: 'business' },
]

export default function Entities() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
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
  const toast = useToast()

  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => entityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      setShowForm(false)
      setEditingId(null)
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
      toast.showToast(editingId ? 'Entity updated successfully' : 'Entity created successfully', 'success')
    },
    onError: (error: any) => {
      toast.showToast(error.response?.data?.detail || 'Failed to save entity', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) => entityApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      setShowForm(false)
      setEditingId(null)
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
      toast.showToast('Entity updated successfully', 'success')
    },
    onError: (error: any) => {
      toast.showToast(error.response?.data?.detail || 'Failed to update entity', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => entityApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] })
      toast.showToast('Entity deleted', 'success')
    },
    onError: (error: any) => {
      toast.showToast(error.response?.data?.detail || 'Failed to delete entity', 'error')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (entity: any) => {
    setEditingId(entity.id)
    setFormData({
      name: entity.name,
      entity_type: entity.entity_type,
      ein: entity.ein || '',
      tax_year: entity.tax_year,
      business_name: entity.business_name || '',
      business_code: entity.business_code || '',
      address: entity.address || '',
      city: entity.city || '',
      state: entity.state || '',
      zip_code: entity.zip_code || '',
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
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
  }

  const selectedType = ENTITY_TYPES.find(t => t.value === formData.entity_type)

  if (isLoading) {
    return <Loading message="Loading entities..." />
  }

  const entityCount = entities?.data?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entityCount} {entityCount === 1 ? 'entity' : 'entities'} configured
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Entity
        </button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Entity' : 'Create New Entity'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingId ? 'Update entity details' : 'Add an individual or business entity for tax tracking'}
                </p>
              </div>
              <button
                onClick={() => handleCloseForm()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Entity Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Entity Type</label>
                
                {/* Individual Types */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Individual</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ENTITY_TYPES.filter(t => t.category === 'individual').map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, entity_type: type.value })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          formData.entity_type === type.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{type.form}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Business Types */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Business</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ENTITY_TYPES.filter(t => t.category === 'business').map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, entity_type: type.value })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          formData.entity_type === type.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{type.form}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'Full Name' : 'Entity Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'e.g., John Smith' : 'e.g., My Business LLC'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'SSN (optional)' : 'Business Name (DBA)'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder={ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'XXX-XX-XXXX' : 'Doing Business As'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'SSN' : 'EIN'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    placeholder={ENTITY_TYPES.find(t => t.value === formData.entity_type)?.category === 'individual' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Year</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.tax_year}
                    onChange={(e) => setFormData({ ...formData, tax_year: parseInt(e.target.value) })}
                  >
                    <option>2024</option>
                    <option>2023</option>
                    <option>2022</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NAICS Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.business_code}
                    onChange={(e) => setFormData({ ...formData, business_code: e.target.value })}
                    placeholder="6-digit code"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="12345"
                  />
                </div>
              </div>

              {/* Form Preview */}
              <div className="bg-indigo-50 rounded-lg p-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Default Tax Form</p>
                  <p className="text-sm text-indigo-700">{selectedType?.form}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  onClick={() => handleCloseForm()}
                >
                  Cancel
                </button>
                <LoadingButton loading={createMutation.isPending || updateMutation.isPending} disabled={!formData.name}>
                  {editingId ? 'Update Entity' : 'Create Entity'}
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entities List */}
      {entityCount === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No entities yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first business entity to start tracking transactions and generating tax forms.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Entity
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {entities?.data?.map((entity) => (
              <Link
                key={entity.id}
                to={`/entities/${entity.id}/transactions`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entity.name}</p>
                    <p className="text-sm text-gray-500">
                      {entity.entity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {entity.default_tax_form}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-900">Tax Year {entity.tax_year}</p>
                    <p className="text-xs text-gray-500">EIN: {entity.ein || 'Not set'}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(entity)
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      if (confirm('Delete this entity?')) {
                        deleteMutation.mutate(entity.id)
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
