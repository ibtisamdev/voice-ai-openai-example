'use client'

import { Button } from './ui/Button'

interface ConversationControlsProps {
  onClear: () => void
  onExport: (format: 'text' | 'json') => string
  onToggleMute: () => void
  isMuted: boolean
  isListening: boolean
  conversationLength: number
}

export function ConversationControls({
  onClear,
  onExport,
  onToggleMute,
  isMuted,
  isListening,
  conversationLength,
}: ConversationControlsProps) {
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          {conversationLength} turn{conversationLength !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex space-x-2">
        {/* Mute Toggle */}
        <Button
          onClick={onToggleMute}
          disabled={!isListening}
          variant="secondary"
          size="sm"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </Button>

        {/* Export Dropdown */}
        <div className="relative group">
          <Button variant="secondary" size="sm">
            📥 Export
          </Button>
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => {
                const content = onExport('text')
                handleDownload(content, `conversation-${Date.now()}.txt`)
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
            >
              As Text
            </button>
            <button
              onClick={() => {
                const content = onExport('json')
                handleDownload(content, `conversation-${Date.now()}.json`)
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-lg"
            >
              As JSON
            </button>
          </div>
        </div>

        {/* Clear */}
        <Button
          onClick={() => {
            if (confirm('Clear conversation history?')) {
              onClear()
            }
          }}
          variant="danger"
          size="sm"
        >
          🗑️ Clear
        </Button>
      </div>
    </div>
  )
}
