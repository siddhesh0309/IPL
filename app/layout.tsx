import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { PollProvider } from "@/contexts/poll-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IPL Prediction Portal",
  description: "Predict IPL match outcomes and vote for Man of the Match",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <PollProvider>
              {children}
              <Toaster />
            </PollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

