/**
 * Performance utilities for real-time voice processing
 */

/**
 * Debounce function for frequent updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request idle callback wrapper
 */
export function runWhenIdle(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Measure and log performance
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>()

  start(label: string): void {
    this.marks.set(label, performance.now())
  }

  end(label: string): number {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(label)

    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    return duration
  }

  clear(): void {
    this.marks.clear()
  }
}
