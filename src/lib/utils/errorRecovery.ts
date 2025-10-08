/**
 * Error recovery utilities
 */

export class ErrorRecoveryManager {
  private maxRetries = 3
  private retryDelay = 1000

  async retry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`)
        await this.delay(this.retryDelay)
        return this.retry(operation, retries - 1)
      }
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutError = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
      ),
    ])
  }
}
