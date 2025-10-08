'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { WebSocketClient } from '@/lib/websocket/client'
import { StreamingAudioPlayer } from '@/lib/audio/streamingPlayer'
import { ContextManager } from '@/lib/conversation/contextManager'
import { AudioStreamProcessor, VoiceActivityDetector } from '@/lib/audio/streaming'
import type {
  RealtimeStatus,
  ConversationTurn,
  StreamingTranscription
} from '@/lib/types'

interface UseRealtimeVoiceOptions {
  onTranscription?: (transcription: StreamingTranscription) => void
  onAIResponse?: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}) {
  const [status, setStatus] = useState<RealtimeStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [amplitude, setAmplitude] = useState(0)
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])

  const wsClient = useRef<WebSocketClient | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const audioProcessor = useRef<AudioStreamProcessor | null>(null)
  const vadDetector = useRef<VoiceActivityDetector | null>(null)
  const streamingPlayer = useRef<StreamingAudioPlayer | null>(null)
  const contextManager = useRef<ContextManager | null>(null)
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null)
  const mediaSource = useRef<MediaStreamAudioSourceNode | null>(null)

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    try {
      setStatus('connecting')
      setError(null)

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'

      wsClient.current = new WebSocketClient({
        url: wsUrl,
        reconnectAttempts: 5,
        reconnectDelay: 2000,
      })

      // Initialize streaming player
      if (!streamingPlayer.current) {
        streamingPlayer.current = new StreamingAudioPlayer(24000)
      }

      // Initialize context manager
      if (!contextManager.current) {
        contextManager.current = new ContextManager(5)
      }

      // Set up event listeners
      wsClient.current.on('connect', () => {
        console.log('Connected to WebSocket')
        setIsConnected(true)
        setStatus('connected')

        // Send session start configuration
        wsClient.current?.send({
          type: 'start_session',
          data: {
            config: {
              instructions: 'You are a helpful voice assistant. Keep responses concise and natural.',
              voice: 'alloy',
            },
          },
          timestamp: Date.now(),
        })
      })

      wsClient.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket')
        setIsConnected(false)
        setStatus('disconnected')
      })

      wsClient.current.on('error', (err: Error) => {
        console.error('WebSocket error:', err)
        setError(err.message)
        setStatus('error')
        options.onError?.(err)
      })

      wsClient.current.on('transcription', (data: any) => {
        options.onTranscription?.(data)
      })

      wsClient.current.on('ai_response', (data: any) => {
        options.onAIResponse?.(data.text, data.isFinal)
      })

      wsClient.current.on('tts_chunk', async (data: any) => {
        if (streamingPlayer.current) {
          await streamingPlayer.current.addChunkFromBase64(data.audio)
          setStatus('speaking')
        }
      })

      wsClient.current.on('response_complete', () => {
        setStatus('connected')
      })

      await wsClient.current.connect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setStatus('error')
    }
  }, [options])

  // Start listening
  const startListening = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Not connected to server')
    }

    try {
      setStatus('listening')

      // Initialize processors
      if (!audioProcessor.current) {
        audioProcessor.current = new AudioStreamProcessor(24000)
      }
      if (!vadDetector.current) {
        vadDetector.current = new VoiceActivityDetector(0.02)
      }

      // Initialize audio context
      if (!audioContext.current) {
        audioContext.current = new AudioContext({ sampleRate: 24000 })
      }

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
        },
      })

      // Create audio nodes for processing
      const source = audioContext.current.createMediaStreamSource(stream)
      const processor = audioContext.current.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)

        // Calculate amplitude for visualization
        const amp = audioProcessor.current?.calculateAmplitude(inputData) || 0
        setAmplitude(amp)

        // Voice activity detection
        const isSpeech = vadDetector.current?.isSpeech(inputData) || false

        if (isSpeech && wsClient.current?.isConnected()) {
          // Convert to PCM16
          const pcm16 = audioProcessor.current?.floatToPCM16(inputData)

          if (pcm16) {
            // Send to server
            wsClient.current.sendBinary(pcm16.buffer)
          }
        }
      }

      source.connect(processor)
      processor.connect(audioContext.current.destination)

      scriptProcessor.current = processor
      mediaSource.current = source

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start listening')
      setStatus('error')
      throw err
    }
  }, [isConnected])

  // Stop listening
  const stopListening = useCallback(() => {
    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect()
      scriptProcessor.current = null
    }
    if (mediaSource.current) {
      mediaSource.current.disconnect()
      mediaSource.current = null
    }
    if (audioContext.current?.state === 'running') {
      // Don't close the context, just disconnect nodes
    }
    setStatus('connected')
  }, [])

  // Mute/unmute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
    if (mediaSource.current?.mediaStream) {
      mediaSource.current.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
  }, [isMuted])

  // Disconnect
  const disconnect = useCallback(() => {
    stopListening()
    if (streamingPlayer.current) {
      streamingPlayer.current.cleanup()
      streamingPlayer.current = null
    }
    if (wsClient.current) {
      wsClient.current.disconnect()
      wsClient.current = null
    }
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close()
      audioContext.current = null
    }
    setStatus('idle')
    setIsConnected(false)
  }, [stopListening])

  // Add to conversation history
  const addToHistory = useCallback((turn: ConversationTurn) => {
    setConversationHistory(prev => {
      const newHistory = [...prev, turn]
      // Keep only last 5 turns
      return newHistory.slice(-5)
    })
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    contextManager.current?.clear()
    setConversationHistory([])
    wsClient.current?.send({
      type: 'clear_history',
      data: {},
      timestamp: Date.now(),
    })
  }, [])

  // Get context
  const getContext = useCallback(() => {
    return contextManager.current?.getContextForLLM() || []
  }, [])

  // Export conversation
  const exportConversation = useCallback((format: 'text' | 'json' = 'text') => {
    if (!contextManager.current) return ''
    return format === 'text'
      ? contextManager.current.exportAsText()
      : contextManager.current.exportAsJSON()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup without calling disconnect to avoid dependency loop
      if (scriptProcessor.current) {
        scriptProcessor.current.disconnect()
        scriptProcessor.current = null
      }
      if (mediaSource.current) {
        mediaSource.current.disconnect()
        mediaSource.current = null
      }
      if (streamingPlayer.current) {
        streamingPlayer.current.cleanup()
        streamingPlayer.current = null
      }
      if (wsClient.current) {
        wsClient.current.disconnect()
        wsClient.current = null
      }
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close()
        audioContext.current = null
      }
    }
  }, [])

  return {
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
    addToHistory,
    clearHistory,
    getContext,
    exportConversation,
  }
}
