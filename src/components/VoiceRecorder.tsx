'use client'

import { useState } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Button } from '@/components/ui/Button'
import { TranscriptDisplay } from '@/components/TranscriptDisplay'
import type { Message } from '@/lib/types'

export function VoiceRecorder() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    status,
    error,
    startRecording,
    stopRecording,
    playAudio,
  } = useAudioRecorder()

  const handleRecordClick = async () => {
    if (status === 'recording') {
      // Stop recording and process
      const audioBlob = await stopRecording()
      if (audioBlob) {
        await processAudio(audioBlob)
      }
    } else {
      // Start recording
      await startRecording()
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      // Step 1: Transcribe audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcribeRes = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!transcribeRes.ok) {
        throw new Error('Transcription failed')
      }

      const { text: transcribedText } = await transcribeRes.json()

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcribedText,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, userMessage])

      // Step 2: Get AI response
      const chatRes = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcribedText,
          conversationHistory: messages.slice(-4).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!chatRes.ok) {
        throw new Error('Chat failed')
      }

      const { message: aiResponse } = await chatRes.json()

      // Add AI message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])

      // Step 3: Convert to speech and play
      const ttsRes = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiResponse }),
      })

      if (!ttsRes.ok) {
        throw new Error('TTS failed')
      }

      const audioData = await ttsRes.blob()
      await playAudio(audioData)

    } catch (err) {
      console.error('Processing error:', err)
      alert(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const getButtonText = () => {
    if (isProcessing) return 'Processing...'
    if (status === 'recording') return '🔴 Stop Recording'
    if (status === 'playing') return '🔊 Playing...'
    return '🎤 Press to Talk'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Voice AI Assistant</h1>
        <p className="text-gray-600">Press the button and start speaking</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <TranscriptDisplay messages={messages} />

      <div className="flex justify-center">
        <Button
          onClick={handleRecordClick}
          disabled={isProcessing || status === 'playing'}
          variant={status === 'recording' ? 'danger' : 'primary'}
          size="lg"
          className="w-64"
        >
          {getButtonText()}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        {status === 'recording' && '🎙️ Listening...'}
        {isProcessing && '⚙️ Processing your request...'}
        {status === 'playing' && '🔊 AI is speaking...'}
      </div>
    </div>
  )
}
