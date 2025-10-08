/**
 * Monitor end-to-end latency
 */
export class LatencyMonitor {
  private measurements: { [key: string]: number[] } = {}

  record(metric: string, duration: number): void {
    if (!this.measurements[metric]) {
      this.measurements[metric] = []
    }
    this.measurements[metric].push(duration)

    // Keep last 100 measurements
    if (this.measurements[metric].length > 100) {
      this.measurements[metric].shift()
    }
  }

  getAverage(metric: string): number {
    const values = this.measurements[metric]
    if (!values || values.length === 0) return 0

    const sum = values.reduce((a, b) => a + b, 0)
    return sum / values.length
  }

  getStats(metric: string) {
    const values = this.measurements[metric]
    if (!values || values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 }
    }

    return {
      avg: this.getAverage(metric),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  }

  getAllStats() {
    const stats: any = {}
    for (const metric in this.measurements) {
      stats[metric] = this.getStats(metric)
    }
    return stats
  }

  clear(): void {
    this.measurements = {}
  }
}
