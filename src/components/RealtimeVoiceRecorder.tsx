'use client'

import { useState, useEffect } from 'react'
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice'
import { Button } from '@/components/ui/Button'
import { WaveformVisualizer } from '@/components/WaveformVisualizer'
import { LiveTranscription } from '@/components/LiveTranscription'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { QuickActions } from '@/components/QuickActions'
import { StatusBar } from '@/components/StatusBar'
import type { Message, StreamingTranscription } from '@/lib/types'

export function RealtimeVoiceRecorder() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscription, setCurrentTranscription] = useState<StreamingTranscription>({
    text: '',
    isFinal: false,
    timestamp: Date.now(),
  })
  const [currentAIResponse, setCurrentAIResponse] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | undefined>()

  const {
    status,
    error,
    isConnected,
    isMuted,
    amplitude,
    conversationHistory,
    connect,
    disconnect,
    startListening,
    stopListening,
    toggleMute,
    clearHistory,
    exportConversation,
  } = useRealtimeVoice({
    onTranscription: (transcription) => {
      setCurrentTranscription(transcription)

      if (transcription.isFinal) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcription.text,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])
      }
    },
    onAIResponse: (text, isFinal) => {
      setCurrentAIResponse(text)
      setIsSpeaking(true)

      if (isFinal) {
        // Add AI message
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
        setCurrentAIResponse('')
        setIsSpeaking(false)
      }
    },
    onError: (err) => {
      console.error('Realtime voice error:', err)
    },
  })

  // Auto-connect on mount
  useEffect(() => {
    connect()
    // Cleanup is handled in the hook itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track session start time
  useEffect(() => {
    if (isConnected && !sessionStartTime) {
      setSessionStartTime(Date.now())
    } else if (!isConnected) {
      setSessionStartTime(undefined)
    }
  }, [isConnected, sessionStartTime])

  const handleToggleListening = async () => {
    if (status === 'listening') {
      stopListening()
    } else if (isConnected) {
      await startListening()
    }
  }

  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action)
    // In a real implementation, this would trigger specific conversation flows
    // For now, just log the action
  }

  return (
    <div className="w-full space-y-6">
      {/* Main Content Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Title Section */}
        <div className="text-center py-8 px-6 bg-gradient-to-br from-primary-50 to-blue-50 border-b border-gray-200">
          <div className="text-5xl mb-3" role="img" aria-label="microphone">🎤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Support Assistant</h1>
          <p className="text-gray-600">Get instant help with your orders</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 bg-error-50 border-l-4 border-error-500 p-4 rounded-lg animate-slide-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-error-800 font-semibold">Error</h3>
                <p className="text-error-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recording Control Panel */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Recording Status */}
            <div className="flex items-center gap-3">
              {status === 'listening' && (
                <div className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-error-500" />
                </div>
              )}
              <span className="text-sm font-semibold text-gray-700">
                {status === 'listening' ? '🔴 Recording...' : status === 'speaking' ? '🔊 AI Speaking...' : '⚪ Ready'}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                disabled={status !== 'listening'}
                variant="secondary"
                size="sm"
                className="min-w-[80px]"
              >
                {isMuted ? '🔇 Mute' : '🔊 Mute'}
              </Button>
              <Button
                onClick={handleToggleListening}
                disabled={!isConnected || status === 'connecting'}
                variant={status === 'listening' ? 'danger' : 'primary'}
                size="sm"
                className="min-w-[80px]"
              >
                {status === 'listening' ? '⏹ Stop' : '▶ Start'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Waveform Visualizer */}
          <WaveformVisualizer
            isActive={status === 'listening'}
            amplitude={amplitude || 0}
          />

          {/* Live Transcription */}
          {currentTranscription.text && (
            <LiveTranscription
              currentText={currentTranscription.text}
              isFinal={currentTranscription.isFinal}
              isActive={status === 'listening'}
            />
          )}

          {/* AI Response Preview */}
          {currentAIResponse && (
            <div className="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500 animate-fade-in">
              <p className="text-sm text-primary-700 mb-1 font-medium">AI is responding:</p>
              <p className="text-gray-900">{currentAIResponse}</p>
            </div>
          )}

          {/* Conversation History */}
          <TranscriptDisplay messages={messages} />

          {/* Export Controls */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => {
                const content = exportConversation('text')
                const blob = new Blob([content], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `conversation-${Date.now()}.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              variant="secondary"
              size="sm"
            >
              📤 Export Chat
            </Button>
            <Button
              onClick={() => {
                if (confirm('Clear conversation history?')) {
                  clearHistory()
                }
              }}
              variant="secondary"
              size="sm"
            >
              🗑️ Clear History
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} disabled={!isConnected} />

      {/* Status Bar */}
      <StatusBar
        isConnected={isConnected}
        latency={245} // TODO: Get actual latency from WebSocket
        sessionStartTime={sessionStartTime}
      />
    </div>
  )
}
