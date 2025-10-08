export class AudioCapture {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
    } catch (error) {
      throw new Error('Microphone access denied')
    }
  }

  startRecording(onDataAvailable?: (blob: Blob) => void): void {
    if (!this.stream) {
      throw new Error('Audio stream not initialized')
    }

    this.audioChunks = []

    // Use WebM or MP4 format depending on browser support
    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4'

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: mimeType })
      if (onDataAvailable) {
        onDataAvailable(audioBlob)
      }
    }

    this.mediaRecorder.start()
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    this.mediaRecorder = null
    this.audioChunks = []
  }
}
