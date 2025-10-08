// Message types
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  audioUrl?: string
}

// Audio types
export interface AudioRecordingState {
  isRecording: boolean
  isProcessing: boolean
  error: string | null
  audioBlob: Blob | null
}

// API Response types
export interface TranscriptionResponse {
  text: string
  duration: number
}

export interface ChatResponse {
  message: string
  model: string
}

export interface SynthesisResponse {
  audioUrl: string
  contentType: string
}

// Recording status
export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'playing' | 'error'

// WebSocket Message Types
export type WebSocketMessageType =
  | 'audio_chunk'
  | 'transcription'
  | 'ai_response'
  | 'tts_chunk'
  | 'error'
  | 'session_start'
  | 'session_end'
  | 'connection_status'

export interface WebSocketMessage {
  type: WebSocketMessageType
  data: any
  timestamp: number
  sessionId?: string
}

// Audio Streaming Types
export interface AudioChunk {
  data: ArrayBuffer
  timestamp: number
  sequenceId: number
  isLast?: boolean
}

export interface StreamingTranscription {
  text: string
  isFinal: boolean
  confidence?: number
  timestamp: number
}

export interface StreamingAudioResponse {
  chunk: ArrayBuffer
  sequenceId: number
  isComplete: boolean
}

// Session Types
export interface ConversationTurn {
  id: string
  userInput: string
  assistantResponse: string
  timestamp: Date
  audioUrl?: string
}

export interface ConversationContext {
  turns: ConversationTurn[]
  maxTurns: number
  sessionId: string
}

// Real-time Status
export type RealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'processing'
  | 'error'
  | 'disconnected'

export interface RealtimeState {
  status: RealtimeStatus
  isConnected: boolean
  isMuted: boolean
  error: string | null
  sessionId: string | null
}

// OpenAI Realtime API Types
export interface RealtimeSessionConfig {
  model: string
  voice: string
  instructions: string
  input_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  output_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  turn_detection: {
    type: 'server_vad' | 'none'
    threshold?: number
    prefix_padding_ms?: number
    silence_duration_ms?: number
  }
}

// Waveform Visualization
export interface WaveformData {
  amplitude: number
  timestamp: number
}
