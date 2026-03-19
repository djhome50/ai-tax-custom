import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, Check, Plus, Layers } from 'lucide-react'
import { useEntity } from '../contexts/EntityContext'

export function EntitySelector() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { currentEntity, setCurrentEntity, entities } = useEntity()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectEntity = (entity: typeof currentEntity) => {
    if (entity) {
      setCurrentEntity(entity)
      navigate(`/entities/${entity.id}/transactions`)
    }
    setIsOpen(false)
  }

  const handleViewAll = () => {
    setCurrentEntity(null)
    navigate('/entities')
    setIsOpen(false)
  }

  if (entities.length === 0) {
    return (
      <Link
        to="/entities"
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium">Add Entity</span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors min-w-[180px]"
      >
        {currentEntity ? (
          <>
            <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="font-medium text-gray-900 truncate flex-1 text-left">
              {currentEntity.name}
            </span>
          </>
        ) : (
          <>
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Select Entity</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Your Entities
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => handleSelectEntity(entity)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">{entity.name}</p>
                  <p className="text-xs text-gray-500">
                    {entity.entity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                {currentEntity?.id === entity.id && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Layers className="w-4 h-4" />
              View All Entities
            </button>
            <Link
              to="/entities"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Entity
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
