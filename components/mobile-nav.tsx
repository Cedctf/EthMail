"use client"

import { useState } from "react"
import Link from "next/link"
import { ConnectWallet } from "./connect-wallet"

export function MobileNav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <button className="shrink-0 bg-transparent hover:bg-gray-100 h-10 w-10 p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
            <span className="sr-only">Toggle menu</span>
          </button>
          
          {isSearchOpen ? (
            <div className="flex w-full items-center gap-2">
              <input 
                type="text" 
                placeholder="Search in emails" 
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                autoFocus 
                onBlur={() => setIsSearchOpen(false)} 
              />
              <button 
                className="shrink-0 bg-transparent hover:bg-gray-100 h-10 w-10 p-2 rounded-md"
                onClick={() => setIsSearchOpen(false)}
              >
                <span className="sr-only">Cancel</span>✕
              </button>
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
                <span>EthMail</span>
              </Link>
              <div className="flex-1"></div>
              <ConnectWallet />
              <button 
                className="shrink-0 bg-transparent hover:bg-gray-100 h-10 w-10 p-2 rounded-md"
                onClick={() => setIsSearchOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <span className="sr-only">Search</span>
              </button>
              <button className="shrink-0 bg-transparent hover:bg-gray-100 h-10 w-10 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="sr-only">Settings</span>
              </button>
            </>
          )}
        </header>
    )
} 