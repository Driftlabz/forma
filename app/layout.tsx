import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forma — AI Website Builder by Driftlabs',
  description: 'AI-powered website design and build platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
