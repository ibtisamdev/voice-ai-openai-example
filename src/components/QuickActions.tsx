'use client'

interface QuickActionsProps {
  onAction: (action: string) => void
  disabled?: boolean
}

export function QuickActions({ onAction, disabled = false }: QuickActionsProps) {
  const actions = [
    { id: 'track', icon: '📦', label: 'Track Order' },
    { id: 'return', icon: '↩️', label: 'Return' },
    { id: 'issue', icon: '🔧', label: 'Issue' },
    { id: 'help', icon: '💬', label: 'Help' },
  ]

  return (
    <div className="w-full">
      <p className="text-sm text-gray-600 mb-3 font-medium">Quick Actions:</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={disabled}
            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
