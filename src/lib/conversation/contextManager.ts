import type { ConversationTurn, ConversationContext } from '@/lib/types'

/**
 * Manages conversation context and history
 */
export class ContextManager {
  private context: ConversationContext
  private storageKey = 'voice_ai_context'

  constructor(maxTurns = 5) {
    this.context = {
      turns: [],
      maxTurns,
      sessionId: this.generateSessionId(),
    }

    // Load from localStorage if available
    this.loadFromStorage()
  }

  /**
   * Add a new conversation turn
   */
  addTurn(userInput: string, assistantResponse: string, audioUrl?: string): void {
    const turn: ConversationTurn = {
      id: `turn_${Date.now()}`,
      userInput,
      assistantResponse,
      timestamp: new Date(),
      audioUrl,
    }

    this.context.turns.push(turn)

    // Keep only last N turns
    if (this.context.turns.length > this.context.maxTurns) {
      this.context.turns.shift()
    }

    this.saveToStorage()
  }

  /**
   * Get conversation context for LLM
   */
  getContextForLLM(): Array<{ role: 'user' | 'assistant', content: string }> {
    const messages: Array<{ role: 'user' | 'assistant', content: string }> = []

    for (const turn of this.context.turns) {
      messages.push({ role: 'user', content: turn.userInput })
      messages.push({ role: 'assistant', content: turn.assistantResponse })
    }

    return messages
  }

  /**
   * Get all turns
   */
  getTurns(): ConversationTurn[] {
    return [...this.context.turns]
  }

  /**
   * Get last N turns
   */
  getLastNTurns(n: number): ConversationTurn[] {
    return this.context.turns.slice(-n)
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.context.turns = []
    this.context.sessionId = this.generateSessionId()
    this.saveToStorage()
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.context.sessionId
  }

  /**
   * Get total turn count
   */
  getTurnCount(): number {
    return this.context.turns.length
  }

  /**
   * Export conversation as text
   */
  exportAsText(): string {
    return this.context.turns
      .map(turn => {
        return `[${turn.timestamp.toLocaleString()}]\nUser: ${turn.userInput}\nAssistant: ${turn.assistantResponse}\n`
      })
      .join('\n---\n\n')
  }

  /**
   * Export conversation as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.context, null, 2)
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.context))
      } catch (error) {
        console.error('Failed to save context to storage:', error)
      }
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)

          // Convert timestamp strings back to Date objects
          parsed.turns = parsed.turns.map((turn: any) => ({
            ...turn,
            timestamp: new Date(turn.timestamp),
          }))

          this.context = parsed
        }
      } catch (error) {
        console.error('Failed to load context from storage:', error)
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
