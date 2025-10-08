'use client'

interface VoiceActivityIndicatorProps {
  isActive: boolean
  isSpeaking: boolean
}

export function VoiceActivityIndicator({
  isActive,
  isSpeaking
}: VoiceActivityIndicatorProps) {
  if (!isActive) return null

  return (
    <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
      {/* User Speaking */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
        }`} />
        <span className="text-sm text-gray-700">You</span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300" />

      {/* AI Speaking */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          !isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
        }`} />
        <span className="text-sm text-gray-700">AI</span>
      </div>
    </div>
  )
}
