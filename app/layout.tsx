import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import './globals.css'

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
// @ts-expect-error - "vietnamese" is a valid Google Fonts subset but missing from the type definitions
const dmSans = DM_Sans({ subsets: ["latin", "vietnamese"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: 'Daniel - Social Platform',
  description: 'Connect, share, and discover with Daniel - your modern social media platform',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/Logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Logo.png',
        type: 'image/png',
      },
    ],
    apple: '/Logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2b7de9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}

