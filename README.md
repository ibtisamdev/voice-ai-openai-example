# 🎙️ Voice AI Assistant

A real-time voice AI assistant built with Next.js and OpenAI.

## Features

- 🎤 Press-to-talk voice input
- 🧠 GPT-4o powered responses
- 🔊 Natural voice output
- 💬 Conversation history
- 📱 Mobile-friendly

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local`:
   ```bash
   OPENAI_API_KEY=your-key-here
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Click "Press to Talk" button
2. Speak your message
3. Click "Stop Recording"
4. Wait for AI response
5. Listen to voice reply

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (Whisper, GPT-4o, TTS)

## Week 1 Deliverable

✅ Working press-to-talk interface
✅ Speech-to-text transcription
✅ AI conversation
✅ Text-to-speech playback
✅ Full pipeline integration

## Next Steps (Week 2)

- Real-time streaming
- WebSocket connections
- Lower latency
- Advanced UI features

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy
```

## Project Structure

```
voice-play/
├── src/
│   ├── app/
│   │   ├── api/voice/          # API routes
│   │   │   ├── transcribe/     # Speech-to-text
│   │   │   ├── chat/           # LLM conversation
│   │   │   └── synthesize/     # Text-to-speech
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── VoiceRecorder.tsx   # Main component
│   │   ├── TranscriptDisplay.tsx
│   │   └── ui/                 # UI components
│   ├── lib/
│   │   ├── audio/              # Audio utilities
│   │   ├── api/                # API clients
│   │   └── types/              # TypeScript types
│   └── hooks/
│       └── useAudioRecorder.ts # Audio recording hook
└── public/
```

## License

MIT
