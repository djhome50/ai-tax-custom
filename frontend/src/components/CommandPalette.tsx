import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Command,
  LayoutDashboard, 
  Building2, 
  Settings, 
  FileText,
  Upload,
  Calculator,
  Plus,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'

interface Command {
  id: string
  label: string
  shortcut?: string
  icon: typeof LayoutDashboard
  action: () => void
  category: 'navigation' | 'actions' | 'settings'
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const commands: Command[] = [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), category: 'navigation' },
    { id: 'entities', label: 'Go to Entities', icon: Building2, action: () => navigate('/entities'), category: 'navigation' },
    { id: 'settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings'), category: 'navigation' },
    // Actions
    { id: 'new-entity', label: 'Create New Entity', shortcut: 'N', icon: Plus, action: () => navigate('/entities'), category: 'actions' },
    { id: 'import', label: 'Import Transactions', icon: Upload, action: () => navigate('/entities'), category: 'actions' },
    { id: 'calculate', label: 'Calculate Taxes', icon: Calculator, action: () => navigate('/entities'), category: 'actions' },
    { id: 'forms', label: 'Generate Tax Forms', icon: FileText, action: () => navigate('/entities'), category: 'actions' },
    // Settings
    { id: 'profile', label: 'Profile Settings', icon: Settings, action: () => navigate('/settings'), category: 'settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, action: () => navigate('/settings'), category: 'settings' },
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  )

  // Group commands by category
  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    actions: filteredCommands.filter(c => c.category === 'actions'),
    settings: filteredCommands.filter(c => c.category === 'settings'),
  }

  // Open/close with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault()
      filteredCommands[selectedIndex].action()
      setIsOpen(false)
    }
  }, [filteredCommands, selectedIndex])

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const handleSelect = (command: Command) => {
    command.action()
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">esc</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              <>
                {groupedCommands.navigation.length > 0 && (
                  <CommandGroup
                    title="Navigation"
                    commands={groupedCommands.navigation}
                    selectedIndex={selectedIndex}
                    offset={0}
                    onSelect={handleSelect}
                    onHover={setSelectedIndex}
                  />
                )}
                {groupedCommands.actions.length > 0 && (
                  <CommandGroup
                    title="Actions"
                    commands={groupedCommands.actions}
                    selectedIndex={selectedIndex}
                    offset={groupedCommands.navigation.length}
                    onSelect={handleSelect}
                    onHover={setSelectedIndex}
                  />
                )}
                {groupedCommands.settings.length > 0 && (
                  <CommandGroup
                    title="Settings"
                    commands={groupedCommands.settings}
                    selectedIndex={selectedIndex}
                    offset={groupedCommands.navigation.length + groupedCommands.actions.length}
                    onSelect={handleSelect}
                    onHover={setSelectedIndex}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono">↑↓</kbd>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono">↵</kbd>
                <span>select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <kbd className="px-1.5 py-0.5 bg-white border rounded font-mono">K</kbd>
              <span>toggle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommandGroup({
  title,
  commands,
  selectedIndex,
  offset,
  onSelect,
  onHover,
}: {
  title: string
  commands: Command[]
  selectedIndex: number
  offset: number
  onSelect: (cmd: Command) => void
  onHover: (index: number) => void
}) {
  return (
    <div className="py-1">
      <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      {commands.map((cmd, i) => {
        const globalIndex = offset + i
        const isSelected = selectedIndex === globalIndex
        const Icon = cmd.icon

        return (
          <button
            key={cmd.id}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => onHover(globalIndex)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
              isSelected ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className="flex-1 font-medium">{cmd.label}</span>
            {cmd.shortcut && (
              <kbd className={`px-1.5 py-0.5 text-xs rounded font-mono ${
                isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {cmd.shortcut}
              </kbd>
            )}
            {isSelected && <ArrowRight className="w-4 h-4 text-indigo-400" />}
          </button>
        )
      })}
    </div>
  )
}
