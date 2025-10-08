'use client'

import { useState, useEffect } from 'react'

interface LiveTranscriptionProps {
  currentText: string
  isFinal: boolean
  isActive: boolean
}

export function LiveTranscription({
  currentText,
  isFinal,
  isActive
}: LiveTranscriptionProps) {
  const [displayText, setDisplayText] = useState('')
  const [finalizedText, setFinalizedText] = useState<string[]>([])

  useEffect(() => {
    if (isFinal && currentText) {
      // Add to finalized text
      setFinalizedText(prev => [...prev, currentText])
      setDisplayText('')
    } else {
      setDisplayText(currentText)
    }
  }, [currentText, isFinal])

  // Clear when inactive
  useEffect(() => {
    if (!isActive) {
      setDisplayText('')
      setFinalizedText([])
    }
  }, [isActive])

  if (!isActive && finalizedText.length === 0 && !displayText) {
    return (
      <div className="text-center text-gray-400 py-4 italic">
        Start speaking to see live transcription...
      </div>
    )
  }

  return (
    <div className="min-h-[80px] p-4 bg-white rounded-lg border border-gray-200">
      <div className="space-y-2">
        {/* Finalized text */}
        {finalizedText.map((text, idx) => (
          <p key={idx} className="text-gray-900">
            {text}
          </p>
        ))}

        {/* Current (interim) text */}
        {displayText && (
          <p className="text-gray-500 italic">
            {displayText}
            <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse" />
          </p>
        )}
      </div>
    </div>
  )
}
