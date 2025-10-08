'use client'

import { useEffect, useState } from 'react'

interface StatusBarProps {
  isConnected: boolean
  latency?: number
  sessionStartTime?: number
}

export function StatusBar({ isConnected, latency, sessionStartTime }: StatusBarProps) {
  const [sessionDuration, setSessionDuration] = useState('0s')

  useEffect(() => {
    if (!sessionStartTime) {
      setSessionDuration('0s')
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = now - sessionStartTime
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        setSessionDuration(`${hours}h ${minutes % 60}m ${seconds % 60}s`)
      } else if (minutes > 0) {
        setSessionDuration(`${minutes}m ${seconds % 60}s`)
      } else {
        setSessionDuration(`${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStartTime])

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'} animate-pulse`} />
        <span className="font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {latency !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">|</span>
          <span>
            Latency: <span className={`font-medium ${latency < 300 ? 'text-success-600' : latency < 500 ? 'text-warning-600' : 'text-error-600'}`}>
              {latency}ms
            </span>
          </span>
        </div>
      )}

      {sessionStartTime && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">|</span>
          <span>
            Session: <span className="font-medium">{sessionDuration}</span>
          </span>
        </div>
      )}
    </div>
  )
}
