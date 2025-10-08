'use client'

import { Message } from '@/lib/types'

interface TranscriptDisplayProps {
  messages: Message[]
}

export function TranscriptDisplay({ messages }: TranscriptDisplayProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No conversation yet. Press the button to start talking!
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <div className="text-xs opacity-70 mb-1">
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div>{message.content}</div>
            <div className="text-xs opacity-50 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
