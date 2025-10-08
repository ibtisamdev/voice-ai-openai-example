import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const PORT = process.env.WS_PORT || 8080

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Session management
interface Session {
  id: string
  ws: WebSocket
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
  openaiWs?: WebSocket
}

const sessions = new Map<string, Session>()

// Create HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket server running')
})

// Create WebSocket server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws: WebSocket) => {
  const sessionId = generateSessionId()
  console.log(`Client connected: ${sessionId}`)

  // Initialize session
  const session: Session = {
    id: sessionId,
    ws,
    conversationHistory: [],
  }
  sessions.set(sessionId, session)

  // Send session start message
  ws.send(JSON.stringify({
    type: 'session_start',
    data: { sessionId },
    timestamp: Date.now(),
  }))

  // Handle messages from client
  ws.on('message', async (message: Buffer) => {
    try {
      // Check if it's binary (audio) or text (control message)
      if (message instanceof Buffer && message.length > 100) {
        // Binary audio data
        await handleAudioChunk(session, message)
      } else {
        // Text control message
        const parsed = JSON.parse(message.toString())
        await handleControlMessage(session, parsed)
      }
    } catch (error) {
      console.error('Error handling message:', error)
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to process message' },
        timestamp: Date.now(),
      }))
    }
  })

  // Handle disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${sessionId}`)
    if (session.openaiWs) {
      session.openaiWs.close()
    }
    sessions.delete(sessionId)
  })

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for session ${sessionId}:`, error)
  })
})

async function handleControlMessage(session: Session, message: any) {
  switch (message.type) {
    case 'start_session':
      await initializeOpenAIRealtime(session, message.config)
      break
    case 'end_session':
      if (session.openaiWs) {
        session.openaiWs.close()
      }
      break
    case 'clear_history':
      session.conversationHistory = []
      break
    default:
      console.log('Unknown control message:', message.type)
  }
}

async function handleAudioChunk(session: Session, audioData: Buffer) {
  // Forward audio to OpenAI Realtime API
  if (session.openaiWs && session.openaiWs.readyState === WebSocket.OPEN) {
    // Send audio to OpenAI
    session.openaiWs.send(JSON.stringify({
      type: 'input_audio_buffer.append',
      audio: audioData.toString('base64'),
    }))
  }
}

async function initializeOpenAIRealtime(session: Session, config: any) {
  try {
    // Connect to OpenAI Realtime API
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17'

    session.openaiWs = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    })

    session.openaiWs.on('open', () => {
      console.log('Connected to OpenAI Realtime API')

      // Configure session
      session.openaiWs?.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: config?.instructions || 'You are a helpful voice assistant. Keep responses concise.',
          voice: config?.voice || 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      }))

      // Notify client
      session.ws.send(JSON.stringify({
        type: 'connection_status',
        data: { status: 'connected' },
        timestamp: Date.now(),
      }))
    })

    session.openaiWs.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        handleOpenAIMessage(session, message)
      } catch (error) {
        console.error('Error parsing OpenAI message:', error)
      }
    })

    session.openaiWs.on('error', (error) => {
      console.error('OpenAI WebSocket error:', error)
      session.ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'OpenAI connection error' },
        timestamp: Date.now(),
      }))
    })

    session.openaiWs.on('close', () => {
      console.log('Disconnected from OpenAI Realtime API')
    })
  } catch (error) {
    console.error('Failed to initialize OpenAI Realtime:', error)
    throw error
  }
}

function handleOpenAIMessage(session: Session, message: any) {
  switch (message.type) {
    case 'conversation.item.input_audio_transcription.completed':
      // User speech transcribed
      session.ws.send(JSON.stringify({
        type: 'transcription',
        data: {
          text: message.transcript,
          isFinal: true,
        },
        timestamp: Date.now(),
      }))

      // Store in history
      session.conversationHistory.push({
        role: 'user',
        content: message.transcript,
      })
      break

    case 'response.audio.delta':
      // Streaming audio response
      session.ws.send(JSON.stringify({
        type: 'tts_chunk',
        data: {
          audio: message.delta,
          sequenceId: message.response_id,
        },
        timestamp: Date.now(),
      }))
      break

    case 'response.audio_transcript.delta':
      // Text transcript of AI response
      session.ws.send(JSON.stringify({
        type: 'ai_response',
        data: {
          text: message.delta,
          isFinal: false,
        },
        timestamp: Date.now(),
      }))
      break

    case 'response.audio_transcript.done':
      // Complete AI response
      session.ws.send(JSON.stringify({
        type: 'ai_response',
        data: {
          text: message.transcript,
          isFinal: true,
        },
        timestamp: Date.now(),
      }))

      // Store in history
      session.conversationHistory.push({
        role: 'assistant',
        content: message.transcript,
      })
      break

    case 'response.done':
      // Response complete
      session.ws.send(JSON.stringify({
        type: 'response_complete',
        data: {},
        timestamp: Date.now(),
      }))
      break

    case 'error':
      session.ws.send(JSON.stringify({
        type: 'error',
        data: { message: message.error.message },
        timestamp: Date.now(),
      }))
      break

    default:
      // Log other message types for debugging
      console.log('OpenAI message:', message.type)
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  wss.close(() => {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
})
