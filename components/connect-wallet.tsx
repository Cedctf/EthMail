"use client"

import { useState, useEffect } from 'react'

export function ConnectWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState('')
  const [balance, setBalance] = useState('')
  const [hasMetamask, setHasMetamask] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkIfMetamaskIsInstalled()
  }, [])

  // Check if Metamask is installed
  const checkIfMetamaskIsInstalled = () => {
    const { ethereum } = window as any
    setHasMetamask(Boolean(ethereum && ethereum.isMetaMask))
  }

  // Connect to Metamask
  const connectWallet = async () => {
    try {
      const { ethereum } = window as any
      if (!ethereum) {
        alert('Please install Metamask')
        return
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      setIsConnected(true)

      // Get chain ID and format it properly
      const chainIdHex = await ethereum.request({ method: 'eth_chainId' })
      const networkName = getNetworkName(parseInt(chainIdHex, 16))
      setChainId(networkName)

      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      })
      
      // Convert balance from wei to ETH
      const etherValue = parseInt(balance, 16) / 1e18
      setBalance(etherValue.toFixed(4))

      // Setup listeners
      setupEventListeners()
    } catch (error) {
      console.error("Error connecting to wallet:", error)
    }
  }

  // Setup event listeners for account and chain changes
  const setupEventListeners = () => {
    const { ethereum } = window as any
    if (!ethereum) return

    // Handle account changes
    ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setIsConnected(false)
        setAccount('')
        setBalance('')
      } else {
        // Account changed
        setAccount(accounts[0])
        
        // Update balance
        const balance = await ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        })
        
        // Convert balance from wei to ETH
        const etherValue = parseInt(balance, 16) / 1e18
        setBalance(etherValue.toFixed(4))
      }
    })

    // Handle chain changes
    ethereum.on('chainChanged', (chainIdHex: string) => {
      const networkName = getNetworkName(parseInt(chainIdHex, 16))
      setChainId(networkName)
      
      // Update balance after chain change
      connectWallet()
    })
  }

  // Helper function to get network name from chain ID
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 5:
        return 'Goerli Testnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 137:
        return 'Polygon'
      case 80001:
        return 'Mumbai Testnet'
      case 56:
        return 'BSC Mainnet'
      case 97:
        return 'BSC Testnet'
      case 42161:
        return 'Arbitrum One'
      case 10:
        return 'Optimism'
      default:
        return `Chain ID: ${chainId}`
    }
  }

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="relative">
      {!isConnected ? (
        <button 
          onClick={connectWallet}
          disabled={!hasMetamask}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 h-8 px-3 py-1 text-sm rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M18.2 7.8c.4.5.6 1.1.6 1.7v10c0 1.7-1.3 3-3 3H6c-1.7 0-3-1.3-3-3V9.5c0-.6.2-1.2.6-1.7L6 4h12l2.2 3.8ZM2 19.5h20M15 14h2"></path>
          </svg>
          {hasMetamask ? 'Connect Wallet' : 'Install Metamask'}
        </button>
      ) : (
        <>
          <button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100 text-blue-600 hover:text-blue-700 flex items-center gap-2 h-8 px-3 py-1 text-sm rounded-md"
            onClick={() => setShowDetails(!showDetails)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18.2 7.8c.4.5.6 1.1.6 1.7v10c0 1.7-1.3 3-3 3H6c-1.7 0-3-1.3-3-3V9.5c0-.6.2-1.2.6-1.7L6 4h12l2.2 3.8ZM2 19.5h20M15 14h2"></path>
            </svg>
            {formatAddress(account)}
          </button>
          
          {showDetails && (
            <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white z-10 border border-gray-200">
              <div className="p-4">
                <div className="text-sm font-bold text-black mb-2">Wallet Connected</div>
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Address:</span>
                    <span className="font-mono text-black">{formatAddress(account)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Network:</span>
                    <span className="text-black">{chainId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">Balance:</span>
                    <span className="text-black">{balance} ETH</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="flex flex-col space-y-2">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium"
                    onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                  >
                    View on Etherscan
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => {
                      setIsConnected(false)
                      setShowDetails(false)
                      setAccount('')
                      setChainId('')
                      setBalance('')
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}