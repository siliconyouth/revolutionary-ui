import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans';

// ... (metadata remains the same)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={GeistSans.className}>
        <AuthProvider>
          <MainNavigation />
          <main className="pt-20">
            {children}
          </main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}