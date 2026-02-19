import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { cn } from '@/lib/utils'
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EcoLearn',
  description: 'AI-powered environmental impact assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground antialiased")}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
