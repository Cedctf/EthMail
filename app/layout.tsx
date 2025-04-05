"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/landing'

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {isLandingPage ? (
          children
        ) : (
            <AuthProvider>{children}</AuthProvider>
        )}
      </body>
    </html>
  )
}
