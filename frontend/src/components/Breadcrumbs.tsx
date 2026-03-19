import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useEntity } from '../contexts/EntityContext'

interface BreadcrumbItem {
  label: string
  path?: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  entities: 'Entities',
  transactions: 'Transactions',
  forms: 'Tax Forms',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const location = useLocation()
  const { currentEntity } = useEntity()

  const pathSegments = location.pathname.split('/').filter(Boolean)

  // Build breadcrumb items
  const items: BreadcrumbItem[] = []
  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Handle entity ID in path
    if (segment.match(/^\d+$/) && index > 0 && pathSegments[index - 1] === 'entities') {
      // This is an entity ID, show entity name
      items.push({
        label: currentEntity?.name || 'Entity',
        path: currentPath,
      })
    } else if (routeLabels[segment]) {
      items.push({
        label: routeLabels[segment],
        path: currentPath,
      })
    }
  })

  if (items.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.path && index < items.length - 1 ? (
            <Link
              to={item.path}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
