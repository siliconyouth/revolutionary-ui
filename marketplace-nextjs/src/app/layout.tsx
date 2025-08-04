import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Revolutionary UI - Test',
  description: 'Testing the app',
}

import { ClientProviders } from '@/components/providers/ClientProviders'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <main>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  )
}