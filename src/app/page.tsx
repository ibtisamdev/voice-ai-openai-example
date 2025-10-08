import { RealtimeVoiceRecorder } from '@/components/RealtimeVoiceRecorder'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎧</span>
              <h1 className="text-xl font-bold text-gray-900">TechGear</h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors hidden sm:block"
              >
                Voice Assistant
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
              >
                <span role="img" aria-label="dashboard">📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-1"
                title="Settings"
              >
                <span role="img" aria-label="settings">⚙️</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <RealtimeVoiceRecorder />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by OpenAI • Real-time Voice AI Assistant
          </p>
        </div>
      </footer>
    </div>
  )
}
