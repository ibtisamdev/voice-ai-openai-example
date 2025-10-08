'use client'

import { EventEmitter } from 'eventemitter3'
import type { WebSocketMessage } from '@/lib/types'

export interface WebSocketClientOptions {
  url: string
  reconnectAttempts?: number
  reconnectDelay?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts: number
  private reconnectDelay: number
  private currentAttempt = 0
  private isIntentionallyClosed = false

  constructor(options: WebSocketClientOptions) {
    super()
    this.url = options.url
    this.reconnectAttempts = options.reconnectAttempts || 5
    this.reconnectDelay = options.reconnectDelay || 2000

    if (options.onConnect) this.on('connect', options.onConnect)
    if (options.onDisconnect) this.on('disconnect', options.onDisconnect)
    if (options.onError) this.on('error', options.onError)
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.currentAttempt = 0
          this.emit('connect')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.emit('message', message)
            this.emit(message.type, message.data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', new Error('WebSocket connection error'))
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.emit('disconnect')

          if (!this.isIntentionallyClosed && this.currentAttempt < this.reconnectAttempts) {
            this.attemptReconnect()
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect(): void {
    this.currentAttempt++
    console.log(`Reconnecting... Attempt ${this.currentAttempt}/${this.reconnectAttempts}`)

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, this.reconnectDelay)
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
      this.emit('error', new Error('WebSocket not connected'))
    }
  }

  sendBinary(data: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    } else {
      console.error('WebSocket is not connected')
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null
  }
}
