import { NextRequest, NextResponse } from 'next/server'
import { openai, OPENAI_CONFIG } from '@/lib/api/openai'

const SYSTEM_PROMPT = `You are a helpful, friendly AI voice assistant.
Keep your responses concise and conversational since they will be spoken aloud.
Aim for 2-3 sentences maximum unless asked for more detail.`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      )
    }

    // Build messages array
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ]

    // Get response from GPT-4o
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: messages,
      max_tokens: 150, // Keep responses concise for voice
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from GPT-4o')
    }

    return NextResponse.json({
      message: assistantMessage,
      model: OPENAI_CONFIG.model,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get chat response' },
      { status: 500 }
    )
  }
}
