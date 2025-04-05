"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "@/components/mobile-sidebar"

export function MobileNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-2">
        {isSearchOpen ? (
          <div className="flex w-full items-center gap-2">
            <Input placeholder="Search in emails" className="h-9" autoFocus onBlur={() => setIsSearchOpen(false)} />
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsSearchOpen(false)}>
              <span className="sr-only">Cancel</span>✕
            </Button>
          </div>
        ) : (
          <>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  fill="#4285F4"
                  d="M22.057 20H1.943C0.87 20 0 19.13 0 18.057V5.943C0 4.87 0.87 4 1.943 4h20.114C23.13 4 24 4.87 24 5.943v12.114C24 19.13 23.13 20 22.057 20z"
                />
                <path
                  fill="#FFFFFF"
                  d="M22.057 20H1.943C0.87 20 0 19.13 0 18.057V5.943C0 4.87 0.87 4 1.943 4h20.114C23.13 4 24 4.87 24 5.943v12.114C24 19.13 23.13 20 22.057 20zM1.943 4.943C1.4 4.943 0.943 5.4 0.943 5.943v12.114c0 0.543 0.457 1 1 1h20.114c0.543 0 1-0.457 1-1V5.943c0-0.543-0.457-1-1-1H1.943z"
                />
                <path
                  fill="#FFFFFF"
                  d="M12 13.5L0.6 5.3C0.3 5.1 0.3 4.7 0.5 4.4C0.7 4.1 1.1 4.1 1.4 4.3L12 11.8l10.6-7.5c0.3-0.2 0.7-0.2 0.9 0.1c0.2 0.3 0.2 0.7-0.1 0.9L12 13.5z"
                />
              </svg>
              <span>Gmail</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

