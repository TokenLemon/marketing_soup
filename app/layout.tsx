import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vymo Agent — Adaptive Outreach Engine',
  description: 'AI-powered marketing and sales intelligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}