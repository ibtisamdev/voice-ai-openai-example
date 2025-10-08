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
