# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time voice AI assistant built with Next.js 15, OpenAI APIs (Whisper, GPT-4o, TTS), and WebSockets for low-latency voice interactions.

## Development Commands

### Running the Application

**Standard mode (HTTP-based):**
```bash
npm run dev          # Next.js dev server on port 3000
```

**Real-time mode (WebSocket-based):**
```bash
npm run dev:all      # Runs both Next.js and WebSocket server concurrently
```

Individual servers:
```bash
npm run dev          # Next.js dev server
npm run ws:dev       # WebSocket server with hot reload (port 8080)
```

### Building

```bash
npm run build        # Next.js production build
npm run ws:build     # TypeScript compilation for WebSocket server
```

### Production

```bash
npm start            # Next.js production server
npm run ws:start     # WebSocket production server
```

### Linting

```bash
npm run lint         # Next.js ESLint
```

## Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o          # Optional, default: gpt-4o
OPENAI_TTS_MODEL=tts-1        # Optional
OPENAI_TTS_VOICE=alloy        # Optional
WS_PORT=8080                  # Optional, default: 8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080  # Required for real-time mode
```

## Architecture

### Dual-Mode Design

The application supports two operational modes:

1. **HTTP Mode** (Week 1): Press-to-talk with sequential API calls
   - User records → Transcribe → Chat → TTS → Playback
   - Components: `VoiceRecorder`, `useAudioRecorder`
   - API Routes: `/api/voice/transcribe`, `/api/voice/chat`, `/api/voice/synthesize`

2. **Real-time Mode** (Week 2+): WebSocket-based streaming
   - Continuous bidirectional audio streaming
   - OpenAI Realtime API integration
   - Components: `RealtimeVoiceRecorder`, `useRealtimeVoice`
   - Server: `server/websocket.ts`

### Key Architectural Components

#### WebSocket Server (`server/websocket.ts`)
- **Session management**: Each client connection gets a unique session with conversation history
- **Dual WebSocket connections**: Maintains both client-to-server and server-to-OpenAI connections
- **Message routing**: Routes audio chunks, transcriptions, and TTS responses between client and OpenAI Realtime API
- **Server VAD**: Uses OpenAI's server-side Voice Activity Detection for turn-taking

#### WebSocket Client (`src/lib/websocket/client.ts`)
- Event-driven architecture using EventEmitter3
- Automatic reconnection with exponential backoff
- Supports both JSON messages and binary audio data
- Type-safe message handling

#### Real-time Audio Pipeline

**Input Flow:**
1. Browser captures microphone → `AudioContext` (24kHz, mono)
2. `ScriptProcessorNode` processes chunks (4096 samples)
3. `AudioStreamProcessor` converts Float32 → PCM16
4. `VoiceActivityDetector` filters non-speech
5. Binary audio sent via WebSocket → Server → OpenAI

**Output Flow:**
1. OpenAI sends base64-encoded PCM16 chunks
2. `StreamingAudioPlayer` buffers and queues chunks
3. `AudioContext` plays audio smoothly with minimal latency

#### Context Management (`src/lib/conversation/contextManager.ts`)
- Maintains conversation history (default: last 5 turns)
- Persists to localStorage for session recovery
- Provides formatted context for LLM prompts
- Export functionality (text/JSON)

#### Audio Processing Utilities

- **`src/lib/audio/streaming.ts`**:
  - `AudioStreamProcessor`: Float32 ↔ PCM16 conversion, amplitude calculation
  - `VoiceActivityDetector`: Energy-based speech detection

- **`src/lib/audio/streamingPlayer.ts`**:
  - Queue-based audio playback with automatic buffer management
  - Handles PCM16 → AudioBuffer conversion
  - Base64 decoding for WebSocket chunks

### Path Aliases

TypeScript paths are configured with `@/*` mapping to `src/*`:
```typescript
import { WebSocketClient } from '@/lib/websocket/client'
import type { Message } from '@/lib/types'
```

### Audio Formats

- **Recording**: 24kHz, mono, PCM16 (16-bit linear)
- **Browser**: Float32Array from Web Audio API
- **WebSocket**: PCM16 as ArrayBuffer or base64
- **OpenAI**: PCM16 format for both input/output

## Common Development Patterns

### Adding WebSocket Message Types

1. Define type in `src/lib/types/index.ts`:
   ```typescript
   export type WebSocketMessageType = 'new_type' | ...
   ```

2. Handle in server (`server/websocket.ts`):
   ```typescript
   function handleOpenAIMessage(session: Session, message: any) {
     case 'new_type':
       // Handle and forward to client
   }
   ```

3. Listen in client hook (`src/hooks/useRealtimeVoice.ts`):
   ```typescript
   wsClient.current.on('new_type', (data) => {
     // Handle message
   })
   ```

### Working with Audio

- Always use 24kHz sample rate for consistency with OpenAI Realtime API
- Use `AudioStreamProcessor` for format conversions
- Enable browser audio features: echo cancellation, noise suppression, auto gain control
- PCM16 format: 16-bit signed integers, little-endian

### Conversation History

The `ContextManager` automatically:
- Limits history to prevent token overflow
- Persists across page refreshes
- Formats for OpenAI chat completions API

When adding new conversation turns, use:
```typescript
contextManager.current?.addTurn(userInput, assistantResponse)
```

## Important Notes

- **WebSocket server runs separately** from Next.js - use `npm run dev:all` for full functionality
- **Two distinct UX paths**: HTTP-based (synchronous) and WebSocket-based (real-time streaming)
- **Audio context state**: Web Audio API requires user interaction to start (browser security)
- **VAD configuration**: Current threshold (0.02) and server VAD settings balance responsiveness vs false triggers
- **Session persistence**: Only conversation history persists; audio playback state is ephemeral
- **OpenAI Realtime API**: Currently uses `gpt-4o-mini-realtime-preview-2024-12-17` model

## Testing Real-time Features

1. Start both servers: `npm run dev:all`
2. Open browser to `http://localhost:3000`
3. Grant microphone permissions
4. Click "Connect" (real-time mode) or "Press to Talk" (HTTP mode)
5. Check browser console for WebSocket connection status
6. Monitor server logs for OpenAI API events

## Debugging

- **WebSocket connection issues**: Check `NEXT_PUBLIC_WS_URL` and firewall settings
- **No audio input**: Verify microphone permissions and audio context state
- **Choppy audio output**: Check `StreamingAudioPlayer` buffer size and network latency
- **Missing transcriptions**: Verify VAD threshold and audio levels
- **API errors**: Check OpenAI API key and rate limits in server logs
