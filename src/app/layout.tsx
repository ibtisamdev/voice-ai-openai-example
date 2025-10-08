import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voice AI Assistant',
  description: 'Real-time conversational AI with voice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
