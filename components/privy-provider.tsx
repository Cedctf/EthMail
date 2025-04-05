"use client"

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

export function PrivyProvider({ children }: { children: ReactNode }) {
  // Make sure your Privy dashboard has:
  // 1. Google enabled as a login method
  // 2. 'http://localhost:3000' added to the allowed origins 
  // 3. In Google Cloud Console, add these redirect URIs:
  //    - https://auth.privy.io/api/v1/oauth/google
  //    - https://auth.privy.io/api/v1/oauth/google/callback
  return (
    <PrivyAuthProvider 
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm94engp200bwjq0lc0ixidn9"}
      config={{
        "appearance": {
          "accentColor": "#6A6FF5",
          "theme": "#FFFFFF",
          "showWalletLoginFirst": false,
          "logo": "https://auth.privy.io/logos/privy-logo.png",
          "walletChainType": "ethereum-only",
          "walletList": [
            "metamask",
            "coinbase_wallet",
            "wallet_connect"
          ]
        },
        "loginMethods": [
          "google",
          "email"
        ],
        "embeddedWallets": {
          "requireUserPasswordOnCreate": false,
          "showWalletUIs": true,
          "ethereum": {
            "createOnLogin": "users-without-wallets"
          }
        },
        "mfa": {
          "noPromptOnMfaRequired": false
        }
      }}
    >
      {children}
    </PrivyAuthProvider>
  )
} 