/**
 * Audio streaming utilities for real-time processing
 */

export class AudioStreamProcessor {
  private audioContext: AudioContext
  private bufferSize = 4096
  private sampleRate = 24000

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate })
  }

  /**
   * Convert Float32Array to PCM16 format
   */
  floatToPCM16(float32Array: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Array.length)

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp values to [-1, 1] range
      const clamped = Math.max(-1, Math.min(1, float32Array[i]))
      // Convert to 16-bit integer
      pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF
    }

    return pcm16
  }

  /**
   * Convert PCM16 to Float32Array
   */
  pcm16ToFloat(pcm16: Int16Array): Float32Array {
    const float32 = new Float32Array(pcm16.length)

    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF)
    }

    return float32
  }

  /**
   * Resample audio data
   */
  async resample(
    audioBuffer: AudioBuffer,
    targetSampleRate: number
  ): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    )

    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(offlineContext.destination)
    source.start()

    return await offlineContext.startRendering()
  }

  /**
   * Calculate audio amplitude for visualization
   */
  calculateAmplitude(audioData: Float32Array): number {
    let sum = 0
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i])
    }
    return sum / audioData.length
  }

  /**
   * Apply noise gate (remove quiet audio)
   */
  applyNoiseGate(audioData: Float32Array, threshold = 0.01): Float32Array {
    const output = new Float32Array(audioData.length)

    for (let i = 0; i < audioData.length; i++) {
      output[i] = Math.abs(audioData[i]) > threshold ? audioData[i] : 0
    }

    return output
  }

  cleanup(): void {
    this.audioContext.close()
  }
}

/**
 * Voice Activity Detection (VAD)
 */
export class VoiceActivityDetector {
  private threshold: number
  private energyHistory: number[] = []
  private historySize = 10

  constructor(threshold = 0.02) {
    this.threshold = threshold
  }

  /**
   * Detect if audio contains speech
   */
  isSpeech(audioData: Float32Array): boolean {
    const energy = this.calculateEnergy(audioData)

    this.energyHistory.push(energy)
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift()
    }

    // Use average energy with some smoothing
    const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length

    return avgEnergy > this.threshold
  }

  private calculateEnergy(audioData: Float32Array): number {
    let sum = 0
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i]
    }
    return Math.sqrt(sum / audioData.length)
  }

  reset(): void {
    this.energyHistory = []
  }
}

/**
 * Circular audio buffer for streaming
 */
export class CircularAudioBuffer {
  private buffer: Float32Array
  private writeIndex = 0
  private readIndex = 0
  private size: number

  constructor(size: number) {
    this.size = size
    this.buffer = new Float32Array(size)
  }

  write(data: Float32Array): void {
    for (let i = 0; i < data.length; i++) {
      this.buffer[this.writeIndex] = data[i]
      this.writeIndex = (this.writeIndex + 1) % this.size
    }
  }

  read(length: number): Float32Array | null {
    const available = this.available()
    if (available < length) {
      return null
    }

    const output = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      output[i] = this.buffer[this.readIndex]
      this.readIndex = (this.readIndex + 1) % this.size
    }

    return output
  }

  available(): number {
    if (this.writeIndex >= this.readIndex) {
      return this.writeIndex - this.readIndex
    }
    return this.size - this.readIndex + this.writeIndex
  }

  clear(): void {
    this.writeIndex = 0
    this.readIndex = 0
    this.buffer.fill(0)
  }
}
