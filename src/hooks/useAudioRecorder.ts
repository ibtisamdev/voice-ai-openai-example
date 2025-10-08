'use client'

import { useState, useRef, useCallback } from 'react'
import { AudioCapture } from '@/lib/audio/capture'
import { AudioPlayer } from '@/lib/audio/playback'
import type { RecordingStatus } from '@/lib/types'

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const captureRef = useRef<AudioCapture | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)

  const initialize = useCallback(async () => {
    try {
      captureRef.current = new AudioCapture()
      await captureRef.current.initialize()
      playerRef.current = new AudioPlayer()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize audio')
      setStatus('error')
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setError(null)

      // Initialize if not already done
      if (!captureRef.current) {
        await initialize()
      }

      // Ensure initialization completed successfully
      if (!captureRef.current) {
        throw new Error('Failed to initialize audio capture')
      }

      setStatus('recording')
      captureRef.current.startRecording()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setStatus('error')
      throw err
    }
  }, [initialize])

  const stopRecording = useCallback(async () => {
    try {
      const blob = await captureRef.current?.stopRecording()
      if (blob) {
        setAudioBlob(blob)
        setStatus('idle')
        return blob
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
      setStatus('error')
    }
    return null
  }, [])

  const playAudio = useCallback(async (blob: Blob) => {
    try {
      setStatus('playing')
      await playerRef.current?.play(blob)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio')
      setStatus('error')
    }
  }, [])

  const cleanup = useCallback(() => {
    captureRef.current?.cleanup()
    playerRef.current?.cleanup()
  }, [])

  return {
    status,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    playAudio,
    cleanup,
  }
}
