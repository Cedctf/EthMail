"use client"

import { useState, useEffect } from 'react'
import styles from './metamask-button.module.css'

export default function MetaMaskConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
  }
  
  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    
    try {
      setIsConnecting(true)
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      })
      
      // Convert from wei to ETH
      const balanceInEth = Number(BigInt(balance) / BigInt(10**15)) / 1000
      setBalance(`${balanceInEth.toFixed(4)} ETH`)
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
    } finally {
      setIsConnecting(false)
    }
  }
  
  // Disconnect from MetaMask
  const disconnectMetaMask = () => {
    setAccount(null)
    setBalance('')
  }
  
  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled() && account) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected from MetaMask
          setAccount(null)
          setBalance('')
        } else if (accounts[0] !== account) {
          // User switched accounts
          setAccount(accounts[0])
        }
      }
      
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [account])
  
  if (!account) {
    return (
      <button
        onClick={connectMetaMask}
        disabled={isConnecting}
        className={`${styles.button} flex items-center justify-center gap-2 w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium transition-colors`}
      >
        {isConnecting ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
              <path d="M20.6182 8.96031L16.6969 2.52531C16.2313 1.75281 15.1782 1.76156 14.7219 2.52531L10.7532 8.96031H3.75942C3.08442 8.96031 2.71254 9.77531 3.17629 10.2997L11.5251 20.0541C12.2094 20.8359 13.4438 20.0003 13.0626 19.0228L11.9407 15.6591L15.3188 10.5872L17.5688 16.9922C17.7938 17.5953 18.5688 17.6953 19.0032 17.2078L21.4407 14.2953L22.4313 18.7078C22.6188 19.5678 23.7688 19.5678 23.9563 18.7078L24.9375 14.4822C25.0563 14.0078 24.8407 13.5072 24.4219 13.2347L21.1969 10.9678L21.0938 9.37531C21.0656 9.19031 21.0281 9.00531 20.6182 8.96031Z" fill="white"/>
              <path d="M2.95068 11.2131L7.97568 12.2475C8.13193 12.2831 8.25693 12.3994 8.29881 12.555L9.32443 16.98C9.45693 17.5462 8.79068 17.9719 8.34818 17.6175L1.52443 12.0544C1.05005 11.67 1.33131 10.9312 1.95068 10.9312C2.28193 10.9312 2.63818 11.0381 2.95068 11.2131Z" fill="white"/>
            </svg>
            Connect MetaMask
          </>
        )}
      </button>
    )
  }
  
  return (
    <div className="p-4 bg-zinc-900 rounded-lg shadow-xl w-72 text-white">
      <h2 className="text-xl font-bold mb-4">MetaMask Connected</h2>
      
      <div className="space-y-2 mb-4">
        <div>
          <p className="text-sm text-zinc-400">Wallet Address</p>
          <p className="font-mono text-sm truncate">{account}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-400">Balance</p>
          <p className="font-medium">{balance || 'Loading...'}</p>
        </div>
      </div>
      
      <button 
        onClick={disconnectMetaMask} 
        className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
} 