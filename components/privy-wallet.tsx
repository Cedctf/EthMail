"use client"

import { usePrivy, useWallets, ConnectedWallet } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'

export default function PrivyWallet() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const [activeWallet, setActiveWallet] = useState<ConnectedWallet | null>(null)
  const [balance, setBalance] = useState('')
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    if (wallets && wallets.length > 0) {
      setActiveWallet(wallets[0])
    }
  }, [wallets])

  useEffect(() => {
    if (activeWallet) {
      const fetchWalletInfo = async () => {
        try {
          setWalletAddress(activeWallet.address)
          // Use provider to get balance instead of direct method
          const provider = await activeWallet.getEthereumProvider()
          const balance = await provider.request({
            method: 'eth_getBalance',
            params: [activeWallet.address, 'latest']
          })
          // Convert from wei to ETH
          const balanceInEth = Number(BigInt(balance) / BigInt(10**15)) / 1000
          setBalance(`${balanceInEth.toFixed(4)} ETH`)
        } catch (err) {
          console.error("Error fetching wallet info:", err)
        }
      }
      
      fetchWalletInfo()
    }
  }, [activeWallet])

  if (!ready) {
    return (
      <div className="p-4 bg-zinc-900 rounded-lg shadow-xl w-72 text-white">
        <p className="text-center">Loading wallet...</p>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="p-4 bg-zinc-900 rounded-lg shadow-xl w-72 text-white">
        <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
        <button 
          onClick={login} 
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
        >
          Sign In with Privy
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg shadow-xl w-72 text-white">
      <h2 className="text-xl font-bold mb-4">Your Wallet</h2>
      
      <div className="mb-4">
        <p className="text-sm text-zinc-400">Connected as</p>
        <p className="font-medium truncate">{user?.email?.address || 'Anonymous'}</p>
      </div>
      
      {activeWallet && (
        <div className="space-y-2 mb-4">
          <div>
            <p className="text-sm text-zinc-400">Wallet Address</p>
            <p className="font-mono text-sm truncate">{walletAddress}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Balance</p>
            <p className="font-medium">{balance || 'Loading...'}</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-2">
        <button 
          onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
        >
          Get Test ETH
        </button>
        <button 
          onClick={logout} 
          className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
} 