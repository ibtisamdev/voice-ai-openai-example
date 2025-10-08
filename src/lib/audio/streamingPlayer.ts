'use client'

/**
 * Streaming audio player that can play audio chunks as they arrive
 */
export class StreamingAudioPlayer {
  private audioContext: AudioContext
  private nextStartTime = 0
  private isPlaying = false
  private audioQueue: AudioBuffer[] = []
  private sampleRate: number

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate
    this.audioContext = new AudioContext({ sampleRate })
  }

  /**
   * Add an audio chunk to the playback queue
   */
  async addChunk(pcm16Data: Int16Array): Promise<void> {
    try {
      // Convert PCM16 to AudioBuffer
      const audioBuffer = this.createAudioBuffer(pcm16Data)
      this.audioQueue.push(audioBuffer)

      // Start playing if not already playing
      if (!this.isPlaying) {
        this.playNext()
      }
    } catch (error) {
      console.error('Error adding audio chunk:', error)
    }
  }

  /**
   * Add audio chunk from base64 string
   */
  async addChunkFromBase64(base64Audio: string): Promise<void> {
    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Convert to Int16Array (PCM16)
      const pcm16 = new Int16Array(bytes.buffer)
      await this.addChunk(pcm16)
    } catch (error) {
      console.error('Error decoding base64 audio:', error)
    }
  }

  /**
   * Create AudioBuffer from PCM16 data
   */
  private createAudioBuffer(pcm16Data: Int16Array): AudioBuffer {
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      pcm16Data.length,
      this.sampleRate
    )

    const channelData = audioBuffer.getChannelData(0)

    // Convert PCM16 to Float32
    for (let i = 0; i < pcm16Data.length; i++) {
      channelData[i] = pcm16Data[i] / (pcm16Data[i] < 0 ? 0x8000 : 0x7FFF)
    }

    return audioBuffer
  }

  /**
   * Play next chunk in queue
   */
  private playNext(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const audioBuffer = this.audioQueue.shift()!

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer

    // Schedule playback
    const currentTime = this.audioContext.currentTime
    const startTime = Math.max(currentTime, this.nextStartTime)

    source.connect(this.audioContext.destination)
    source.start(startTime)

    // Update next start time
    this.nextStartTime = startTime + audioBuffer.duration

    // Play next chunk when this one ends
    source.onended = () => {
      this.playNext()
    }
  }

  /**
   * Stop all playback and clear queue
   */
  stop(): void {
    this.audioQueue = []
    this.isPlaying = false
    this.nextStartTime = 0

    // Note: Can't stop already scheduled sources
    // They will finish playing but queue is cleared
  }

  /**
   * Check if currently playing
   */
  playing(): boolean {
    return this.isPlaying || this.audioQueue.length > 0
  }

  /**
   * Get current queue length
   */
  queueLength(): number {
    return this.audioQueue.length
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    this.stop()
    await this.audioContext.close()
  }
}
