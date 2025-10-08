import { NextRequest, NextResponse } from 'next/server'
import { openai, OPENAI_CONFIG } from '@/lib/api/openai'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: OPENAI_CONFIG.ttsModel,
      voice: OPENAI_CONFIG.ttsVoice,
      input: text,
      response_format: 'mp3',
      speed: 1.0,
    })

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    )
  }
}
