'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  isActive: boolean
  amplitude?: number
  color?: string
}

export function WaveformVisualizer({
  isActive,
  amplitude = 0,
  color = '#3B82F6'
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const dataPoints = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Animation loop
    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!isActive) {
        // Draw flat line when inactive
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
        return
      }

      // Add new data point
      dataPoints.current.push(amplitude)
      const maxPoints = Math.floor(width / 3)
      if (dataPoints.current.length > maxPoints) {
        dataPoints.current.shift()
      }

      // Draw waveform
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.8
      ctx.beginPath()

      const step = width / maxPoints
      const amplitudeScale = height * 0.4

      for (let i = 0; i < dataPoints.current.length; i++) {
        const x = i * step
        const y = height / 2 + (dataPoints.current[i] * amplitudeScale)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Draw mirror (bottom half)
      ctx.beginPath()
      for (let i = 0; i < dataPoints.current.length; i++) {
        const x = i * step
        const y = height / 2 - (dataPoints.current[i] * amplitudeScale)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, amplitude, color])

  // Reset when inactive
  useEffect(() => {
    if (!isActive) {
      dataPoints.current = []
    }
  }, [isActive])

  const statusText = isActive ? 'Listening...' : 'Ready'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Waveform Visualization
        </span>
        <span className={`text-sm font-semibold ${isActive ? 'text-primary-600 animate-pulse' : 'text-gray-400'}`}>
          {statusText}
        </span>
      </div>
      <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}
