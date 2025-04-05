"use client"

import MagicWallet from '@/components/magic-wallet'

export default function MagicWalletTestPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-8">Magic Wallet Test</h1>
      <MagicWallet />
      
      <div className="mt-12 max-w-md text-zinc-400 text-sm">
        <h2 className="text-lg font-medium text-white mb-2">About Magic Wallet</h2>
        <p className="mb-4">
          This is a standalone implementation of the Magic SDK for Flow EVM. 
          It uses passwordless authentication and provides a seamless wallet experience.
        </p>
        <p>
          To get started, click "Connect with Magic" and enter your email address. 
          You'll receive a magic link to authenticate without passwords.
        </p>
      </div>
    </div>
  )
} 