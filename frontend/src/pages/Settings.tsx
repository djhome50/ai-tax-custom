import { useState, useRef, useEffect } from 'react'
import { 
  User, 
  Shield, 
  Key, 
  Database, 
  Bell, 
  CreditCard, 
  Link2, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { useToast } from '../components/ToastProvider'
import { LoadingButton } from '../components/Loading'

const settingsSections = [
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    description: 'Personal information and preferences' 
  },
  { 
    id: 'account', 
    label: 'Account', 
    icon: Shield, 
    description: 'Security and account settings' 
  },
  { 
    id: 'ai', 
    label: 'AI Provider', 
    icon: Key, 
    description: 'Configure AI classification provider' 
  },
  { 
    id: 'tax', 
    label: 'Tax Preferences', 
    icon: FileText, 
    description: 'Default tax settings and forms' 
  },
  { 
    id: 'notifications', 
    label: 'Notifications', 
    icon: Bell, 
    description: 'Email and push notifications' 
  },
  { 
    id: 'integrations', 
    label: 'Integrations', 
    icon: Link2, 
    description: 'Connect external services' 
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: CreditCard, 
    description: 'Subscription and payment methods' 
  },
  { 
    id: 'help', 
    label: 'Help & Support', 
    icon: HelpCircle, 
    description: 'Documentation and support' 
  },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setIsMobileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings user={user} />
      case 'account':
        return <AccountSettings />
      case 'ai':
        return <AIProviderSettings />
      case 'tax':
        return <TaxPreferencesSettings />
      case 'notifications':
        return <NotificationSettings />
      case 'integrations':
        return <IntegrationsSettings />
      case 'billing':
        return <BillingSettings />
      case 'help':
        return <HelpSettings />
      default:
        return <ProfileSettings user={user} />
    }
  }

  const activeSectionData = settingsSections.find(s => s.id === activeSection)

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsMobileDropdownOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Dropdown Navigation */}
        <div className="lg:hidden" ref={mobileDropdownRef}>
          <button
            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              {activeSectionData && (
                <>
                  <activeSectionData.icon className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">{activeSectionData.label}</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMobileDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isActive ? 'text-indigo-900' : ''}`}>
                        {section.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{section.description}</p>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isActive ? 'text-indigo-900' : ''}`}>
                      {section.label}
                    </p>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {activeSectionData && (
                  <>
                    <activeSectionData.icon className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {activeSectionData.label}
                      </h2>
                      <p className="text-sm text-gray-500">{activeSectionData.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Section Content */}
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Settings Component
function ProfileSettings({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [email, setEmail] = useState(user.email || '')
  const toast = useToast()

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-2xl font-medium text-white">
            {(fullName || email).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Change avatar
          </button>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>America/New_York (EST)</option>
            <option>America/Chicago (CST)</option>
            <option>America/Denver (MST)</option>
            <option>America/Los_Angeles (PST)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <LoadingButton loading={false} onClick={() => toast.showToast('Profile updated', 'success')}>
          Save Changes
        </LoadingButton>
      </div>
    </div>
  )
}

// Account Settings Component
function AccountSettings() {
  return (
    <div className="space-y-6">
      {/* Password */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Password</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Update Password
        </button>
      </div>

      {/* Two-Factor Auth */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Enable 2FA</p>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// AI Provider Settings Component
function AIProviderSettings() {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const toast = useToast()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="local">Local Model</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Select the AI provider for transaction classification</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">Your API key is encrypted and stored securely</p>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-4">Classification Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto-classify on import</p>
              <p className="text-sm text-gray-500">Automatically classify transactions when importing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Threshold: 70%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              defaultValue="70"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Transactions below this threshold will require manual review</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <LoadingButton loading={false} onClick={() => toast.showToast('AI settings saved', 'success')}>
          Save Settings
        </LoadingButton>
      </div>
    </div>
  )
}

// Tax Preferences Settings Component
function TaxPreferencesSettings() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Year</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>Single</option>
            <option>Married Filing Jointly</option>
            <option>Married Filing Separately</option>
            <option>Head of Household</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State for Tax Filing</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option>California</option>
          <option>New York</option>
          <option>Texas</option>
          <option>Florida</option>
        </select>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-4">Tax Categories</h3>
        <p className="text-sm text-gray-500 mb-4">Customize tax category mappings for your business</p>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          Manage Categories
        </button>
      </div>
    </div>
  )
}

// Notification Settings Component
function NotificationSettings() {
  return (
    <div className="space-y-4">
      {[
        { title: 'Tax optimization alerts', desc: 'Get notified about potential tax savings' },
        { title: 'Classification review reminders', desc: 'Remind when transactions need review' },
        { title: 'Weekly summary emails', desc: 'Receive a weekly summary of your tax status' },
        { title: 'Deadline reminders', desc: 'Get reminded about upcoming tax deadlines' },
        { title: 'New feature announcements', desc: 'Learn about new features and improvements' },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      ))}
    </div>
  )
}

// Integrations Settings Component
function IntegrationsSettings() {
  const integrations = [
    { name: 'QuickBooks Online', icon: '📊', connected: false },
    { name: 'Xero', icon: '📈', connected: false },
    { name: 'Plaid', icon: '🏦', connected: false },
    { name: 'Stripe', icon: '💳', connected: false },
  ]

  return (
    <div className="space-y-4">
      {integrations.map((int, i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{int.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{int.name}</p>
              <p className="text-sm text-gray-500">
                {int.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            int.connected
              ? 'border border-gray-300 hover:bg-gray-100'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
            {int.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      ))}
    </div>
  )
}

// Billing Settings Component
function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-indigo-900">Current Plan: Free</p>
            <p className="text-sm text-indigo-700">Upgrade to unlock more features</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500">No payment method added</p>
          <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Add Payment Method
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Billing History</h3>
        <p className="text-sm text-gray-500">No billing history available</p>
      </div>
    </div>
  )
}

// Help Settings Component
function HelpSettings() {
  return (
    <div className="space-y-4">
      {[
        { title: 'Documentation', desc: 'Learn how to use AI Tax Engine', icon: FileText },
        { title: 'Video Tutorials', desc: 'Watch step-by-step guides', icon: Database },
        { title: 'Contact Support', desc: 'Get help from our team', icon: HelpCircle },
        { title: 'Report a Bug', desc: 'Let us know about issues', icon: Shield },
      ].map((item, i) => {
        const Icon = item.icon
        return (
          <button key={i} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left">
            <Icon className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
        )
      })}
    </div>
  )
}
