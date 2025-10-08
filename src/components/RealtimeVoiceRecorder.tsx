'use client'

import { useState, useEffect } from 'react'
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice'
import { Button } from '@/components/ui/Button'
import { WaveformVisualizer } from '@/components/WaveformVisualizer'
import { LiveTranscription } from '@/components/LiveTranscription'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import { ConversationControls } from '@/components/ConversationControls'
import { VoiceActivityIndicator } from '@/components/VoiceActivityIndicator'
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

  const handleToggleListening = async () => {
    if (status === 'listening') {
      stopListening()
    } else if (isConnected) {
      await startListening()
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return '⏳ Connecting...'
      case 'connected': return '✓ Connected'
      case 'listening': return '🎤 Listening...'
      case 'speaking': return '🔊 AI Speaking...'
      case 'processing': return '⚙️ Processing...'
      case 'error': return '❌ Error'
      case 'disconnected': return '⚫ Disconnected'
      default: return '⚪ Idle'
    }
  }

  const getButtonText = () => {
    if (status === 'listening') return '⏸️ Stop Listening'
    if (isConnected) return '🎤 Start Listening'
    return '⏳ Connecting...'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Real-Time Voice AI</h1>
        <p className="text-gray-600">Speak naturally and get instant responses</p>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{getStatusText()}</span>
          {isMuted && <span className="text-sm text-red-600">🔇 Muted</span>}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={toggleMute}
            disabled={status !== 'listening'}
            variant="secondary"
            size="sm"
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </Button>
          <Button
            onClick={clearHistory}
            variant="secondary"
            size="sm"
          >
            🗑️ Clear
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Activity Indicator */}
      <VoiceActivityIndicator
        isActive={status === 'listening'}
        isSpeaking={!isSpeaking}
      />

      {/* Conversation Controls */}
      <ConversationControls
        onClear={clearHistory}
        onExport={exportConversation}
        onToggleMute={toggleMute}
        isMuted={isMuted}
        isListening={status === 'listening'}
        conversationLength={Math.floor(messages.length / 2)}
      />

      {/* Waveform Visualizer */}
      <WaveformVisualizer
        isActive={status === 'listening'}
        amplitude={amplitude || 0}
      />

      {/* Live Transcription */}
      <LiveTranscription
        currentText={currentTranscription.text}
        isFinal={currentTranscription.isFinal}
        isActive={status === 'listening'}
      />

      {/* AI Response Preview */}
      {currentAIResponse && (
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">AI is responding:</p>
          <p className="text-gray-900">{currentAIResponse}</p>
        </div>
      )}

      {/* Conversation History */}
      <TranscriptDisplay messages={messages} />

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleToggleListening}
          disabled={!isConnected || status === 'connecting'}
          variant={status === 'listening' ? 'danger' : 'primary'}
          size="lg"
          className="w-64"
        >
          {getButtonText()}
        </Button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-500">
        {isConnected ? (
          <span>Connected • Speak naturally for real-time responses</span>
        ) : (
          <span>Connecting to server...</span>
        )}
      </div>
    </div>
  )
}
