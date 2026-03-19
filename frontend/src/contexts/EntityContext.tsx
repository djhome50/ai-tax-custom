import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { entityApi, Entity } from '../lib/api'

interface EntityContextType {
  currentEntity: Entity | null
  setCurrentEntity: (entity: Entity | null) => void
  entities: Entity[]
  isLoading: boolean
}

const EntityContext = createContext<EntityContextType | undefined>(undefined)

export function EntityProvider({ children }: { children: ReactNode }) {
  const [currentEntity, setCurrentEntity] = useState<Entity | null>(() => {
    const stored = localStorage.getItem('currentEntity')
    return stored ? JSON.parse(stored) : null
  })

  const { data: entitiesData, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: entityApi.list,
  })

  const entities = entitiesData?.data || []

  // Persist current entity to localStorage
  useEffect(() => {
    if (currentEntity) {
      localStorage.setItem('currentEntity', JSON.stringify(currentEntity))
    } else {
      localStorage.removeItem('currentEntity')
    }
  }, [currentEntity])

  // Auto-select first entity if none selected
  useEffect(() => {
    if (!currentEntity && entities.length > 0) {
      setCurrentEntity(entities[0])
    }
  }, [entities, currentEntity])

  return (
    <EntityContext.Provider value={{ currentEntity, setCurrentEntity, entities, isLoading }}>
      {children}
    </EntityContext.Provider>
  )
}

export function useEntity() {
  const context = useContext(EntityContext)
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider')
  }
  return context
}
