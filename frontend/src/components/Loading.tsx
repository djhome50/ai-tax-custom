import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = 'Loading...', className = '' }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="mt-3 text-sm text-gray-500">{message}</p>
    </div>
  )
}

export function LoadingOverlay({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function LoadingButton({ 
  children, 
  loading, 
  disabled = false,
  className = '' 
}: { 
  children: React.ReactNode
  loading: boolean
  disabled?: boolean
  className?: string 
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}
