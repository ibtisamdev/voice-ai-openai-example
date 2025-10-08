export class AudioPlayer {
  private audio: HTMLAudioElement | null = null

  async play(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob)
      this.audio = new Audio(audioUrl)

      this.audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }

      this.audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        reject(error)
      }

      this.audio.play().catch(reject)
    })
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  cleanup(): void {
    this.stop()
    this.audio = null
  }
}
