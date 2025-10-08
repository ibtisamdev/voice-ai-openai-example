'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/types'
import { ActionCard } from './ActionCard'

interface TranscriptDisplayProps {
  messages: Message[]
}

export function TranscriptDisplay({ messages }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-base font-medium">No conversation yet</p>
        <p className="text-sm mt-1">Start speaking to begin your voice conversation</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="space-y-4 max-h-[500px] overflow-y-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm scroll-smooth"
    >
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in`}
        >
          <div
            className={`max-w-[85%] md:max-w-[75%] ${
              message.role === 'user' ? 'order-2' : 'order-1'
            }`}
          >
            {/* Message Bubble */}
            <div
              className={`rounded-lg px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-primary-600 text-white'
              }`}
            >
              {/* Header with icon and role */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {message.role === 'user' ? '👤' : '🤖'}
                </span>
                <span className="text-xs font-semibold opacity-90">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="text-xs opacity-70 ml-auto">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Message Content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Audio Status */}
              {message.role === 'assistant' && (
                <div className="mt-2 text-xs opacity-75">
                  {message.isPlaying ? '🔊 Playing...' : message.hasPlayed ? '✓ Played' : ''}
                </div>
              )}
            </div>

            {/* Action Cards (only for assistant messages) */}
            {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
              <div className="mt-3">
                <ActionCard actions={message.actions} />
              </div>
            )}
          </div>

          {/* Icon Column */}
          <div
            className={`flex items-start pt-3 ${
              message.role === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                message.role === 'user'
                  ? 'bg-gray-200'
                  : 'bg-primary-100'
              }`}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div className="h-1" />
    </div>
  )
}
