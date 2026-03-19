import { Settings as SettingsIcon, Key, Database, Bell } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* AI Provider Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">AI Provider</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Provider</label>
            <select className="input">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label className="label">API Key</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your API key"
            />
          </div>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>

      {/* Classification Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Classification</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-classify on import</p>
              <p className="text-sm text-gray-600">
                Automatically classify transactions when importing
              </p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div>
            <label className="label">Confidence Threshold</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">
              Transactions below this threshold will require review
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tax optimization alerts</p>
              <p className="text-sm text-gray-600">
                Get notified about potential tax savings
              </p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Classification review reminders</p>
              <p className="text-sm text-gray-600">
                Remind when transactions need review
              </p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  )
}
