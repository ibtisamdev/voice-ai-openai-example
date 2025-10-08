'use client'

import { useState } from 'react'

interface DevToolsProps {
  latencyStats?: any
  connectionStatus?: string
  audioQueueLength?: number
}

export function DevTools({
  latencyStats,
  connectionStatus,
  audioQueueLength
}: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDevelopment] = useState(process.env.NODE_ENV === 'development')

  // Only show in development
  if (!isDevelopment) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Developer Tools"
      >
        🔧
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-gray-900 text-white rounded-lg shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Dev Tools</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Connection Info */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Connection</h4>
            <p className="text-sm">Status: {connectionStatus || 'Unknown'}</p>
          </div>

          {/* Latency Stats */}
          {latencyStats && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Latency (ms)</h4>
              {Object.entries(latencyStats).map(([key, stats]: [string, any]) => (
                <div key={key} className="text-xs mb-1">
                  <span className="text-gray-400">{key}:</span>
                  <span className="ml-2">
                    avg: {stats.avg.toFixed(0)} |
                    min: {stats.min.toFixed(0)} |
                    max: {stats.max.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Audio Queue */}
          {audioQueueLength !== undefined && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Audio Queue</h4>
              <p className="text-sm">Chunks: {audioQueueLength}</p>
            </div>
          )}

          {/* Performance */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Performance</h4>
            <p className="text-xs">
              Memory: {(performance.memory as any)?.usedJSHeapSize
                ? `${((performance.memory as any).usedJSHeapSize / 1048576).toFixed(1)} MB`
                : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
