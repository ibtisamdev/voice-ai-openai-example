interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
