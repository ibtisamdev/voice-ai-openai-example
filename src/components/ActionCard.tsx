'use client'

export interface Action {
  id: string
  description: string
  status: 'completed' | 'pending' | 'failed'
  timestamp?: Date
}

interface ActionCardProps {
  actions: Action[]
}

export function ActionCard({ actions }: ActionCardProps) {
  if (actions.length === 0) return null

  return (
    <div className="bg-success-50 border-l-4 border-success-500 rounded-lg p-4 animate-slide-up">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-lg">📋</span>
        <h3 className="text-sm font-semibold text-success-900">Actions Taken:</h3>
      </div>
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5">
              {action.status === 'completed' && '✓'}
              {action.status === 'pending' && '⏳'}
              {action.status === 'failed' && '❌'}
            </span>
            <span className={`flex-1 ${
              action.status === 'completed' ? 'text-success-800' :
              action.status === 'pending' ? 'text-warning-700' :
              'text-error-700'
            }`}>
              {action.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
