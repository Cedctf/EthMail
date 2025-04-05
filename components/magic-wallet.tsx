"use client"

import { useState, useEffect } from 'react'
import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth'
import { Web3 } from 'web3'
import { Wallet, ArrowUpDown, Copy, ExternalLink, ChevronDown, Check, AlertCircle, Settings } from "lucide-react"
import DebugInfo from './debug-info'
import { useRouter } from 'next/navigation'

// Create a standalone component that doesn't depend on your existing providers
export default function MagicWallet() {
  // State
  const [magic, setMagic] = useState<Magic<[OAuthExtension]> | null>(null)
  const [web3, setWeb3] = useState<any>(null)
  const [account, setAccount] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [debugDetails, setDebugDetails] = useState<Record<string, any>>({})
  const [copied, setCopied] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [sendStatus, setSendStatus] = useState<{loading: boolean, error: string | null, success: boolean}>({
    loading: false,
    error: null, 
    success: false
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [email, setEmail] = useState<string>('')
  const [showEmailLogin, setShowEmailLogin] = useState<boolean>(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [sendCustomEmail, setSendCustomEmail] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  // Initialize Magic and Web3
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return
    
    try {
      // Use the existing API key from env
      const apiKey = process.env.NEXT_PUBLIC_MAGIC_API_KEY || ''
      
      // Get Gmail user email if available from previous OAuth
      const gmailUserEmail = typeof window !== 'undefined' ? localStorage.getItem('gmail_user_email') : null
      
      // Collect debug information
      const debugInfo: Record<string, any> = {
        'Magic API Key': apiKey ? 'Present' : 'Missing',
        'FLOW RPC URL': process.env.NEXT_PUBLIC_FLOW_RPC_URL,
        'FLOW Chain ID': process.env.NEXT_PUBLIC_FLOW_CHAIN_ID,
        'Browser': navigator.userAgent,
        'URL': window.location.href,
        'Gmail User': gmailUserEmail
      }
      
      setDebugDetails(debugInfo)
      
      if (!apiKey) {
        throw new Error('Missing Magic API Key. Please check your environment variables.')
      }
      
      // Create Magic instance with OAuth extension
      console.log('Initializing Magic wallet with API key:', apiKey ? 'Present' : 'Missing')
      
      const magicInstance = new Magic(apiKey, {
        extensions: [new OAuthExtension()],
        network: {
          rpcUrl: process.env.NEXT_PUBLIC_FLOW_RPC_URL || 'https://testnet.evm.nodes.onflow.org',
          chainId: parseInt(process.env.NEXT_PUBLIC_FLOW_CHAIN_ID || '545'), // Flow EVM Testnet Chain ID
        }
      })
      
      setMagic(magicInstance)
      
      // Create Web3 instance
      const web3Instance = new Web3((magicInstance as any).rpcProvider)
      setWeb3(web3Instance)
      
      // Check if user is already logged in
      checkUserLoggedIn(magicInstance)
      
      // If we're on the callback page, try handling the callback
      if (window.location.pathname === '/auth/callback') {
        handleOAuthCallback(magicInstance)
      }
      
      // Auto-login with Gmail email if available and user is not already logged in
      const autoLoginWithGmail = async () => {
        try {
          const isLoggedIn = await magicInstance.user.isLoggedIn()
          
          // If not logged in and we have Gmail email, automatically log in
          if (!isLoggedIn && gmailUserEmail) {
            console.log('Attempting automatic login with Gmail:', gmailUserEmail)
            setEmail(gmailUserEmail)
            
            // Small delay to ensure UI is ready
            setTimeout(async () => {
              try {
                setIsLoading(true)
                await magicInstance.auth.loginWithMagicLink({ email: gmailUserEmail })
                
                // Check if login was successful
                const loggedIn = await magicInstance.user.isLoggedIn()
                setIsLoggedIn(loggedIn)
                
                if (loggedIn) {
                  await getUserInfo()
                  console.log('Auto-login with Gmail successful')
                }
                
                setIsLoading(false)
              } catch (autoLoginErr) {
                console.error('Auto-login error:', autoLoginErr)
                setIsLoading(false)
                // Don't set error - we'll let the user try manual login if auto fails
              }
            }, 1000)
          }
        } catch (checkLoginErr) {
          console.error('Error checking login status:', checkLoginErr)
        }
      }
      
      // Run auto-login after a short delay
      setTimeout(autoLoginWithGmail, 2000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('Error initializing Magic:', errorMessage)
      setError(`Failed to initialize wallet: ${errorMessage}`)
    }
  }, [])

  // Handle OAuth callback
  const handleOAuthCallback = async (magicInstance: Magic<[OAuthExtension]>) => {
    // Check if we're on the callback page for the authentication flow
    if (window.location.pathname === '/auth/callback') {
      try {
        // Get auth result from OAuth provider
        const result = await magicInstance.oauth.getRedirectResult()
        console.log('OAuth result:', result)
        
        // Check if login is successful
        if (result) {
          await getUserInfo()
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Failed to complete OAuth login')
      }
    }
  }

  // Check if user is logged in
  const checkUserLoggedIn = async (magicInstance: Magic<[OAuthExtension]>) => {
    try {
      const isLoggedIn = await magicInstance.user.isLoggedIn()
      setIsLoggedIn(isLoggedIn)
      
      if (isLoggedIn) {
        // Get user info and balance
        await getUserInfo()
      }
    } catch (err) {
      console.error('Error checking login status:', err)
    }
  }

  // Get user info and balance
  const getUserInfo = async () => {
    if (!magic || !web3) return
    
    try {
      setIsLoading(true)
      
      // Get user metadata
      const metadata = await magic.user.getInfo()
      const userAddress = metadata.publicAddress
      setAccount(userAddress || '')
      
      // Get balance
      if (userAddress && web3) {
        const balanceWei = await web3.eth.getBalance(userAddress)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether')
        setBalance(balanceEth)
      }
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error getting user info:', err)
      setError('Failed to load wallet data')
      setIsLoading(false)
    }
  }

  // Login with wallet UI
  const login = async () => {
    if (!magic) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Show Magic UI for login
      await magic.wallet.connectWithUI()
      
      // Check if login was successful
      const isLoggedIn = await magic.user.isLoggedIn()
      setIsLoggedIn(isLoggedIn)
      
      if (isLoggedIn) {
        await getUserInfo()
      }
      
      setIsLoading(false)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed')
      setIsLoading(false)
    }
  }

  // Generate a demo magic link for email preview
  const generateDemoMagicLink = (userEmail: string) => {
    // This is just a demo link structure, not a real magic link
    const timestamp = Date.now();
    const demoToken = btoa(`${userEmail}:${timestamp}`);
    return `${window.location.origin}/auth/magic?token=${demoToken}&email=${encodeURIComponent(userEmail)}`;
  };

  // Login with email using Magic Link
  const loginWithEmail = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Initialize Magic SDK if not already initialized
      const magicInstance = magic || new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY || '', {
        extensions: [new OAuthExtension()]
      })
      
      // This will send a magic link to the user's email directly from Magic
      // No need for your custom email sending API
      await magicInstance.auth.loginWithMagicLink({ 
        email,
        showUI: true // Keep the Magic SDK UI in your app
      })
      
      // Display a success message
      setSuccessMessage(`Magic link sent to ${email}. Please check your inbox.`)
      
      // The Magic SDK will handle the rest when the user clicks the link
    } catch (err) {
      console.error('Magic login error:', err)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    if (!magic) return
    
    try {
      setIsGoogleLoading(true)
      setError(null)
      
      // Use the full absolute URL with the protocol
      const redirectURI = `${window.location.protocol}//${window.location.host}/auth/callback`
      console.log('Using redirect URI:', redirectURI)
      
      // Login with Google OAuth with specific scopes
      await magic.oauth.loginWithRedirect({
        provider: 'google',
        redirectURI: redirectURI,
        scope: ['profile', 'email']  // Explicitly define required scopes
      })
      
      // Note: The flow will continue after redirect
      
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(err.message || 'Google login failed')
      setIsGoogleLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    if (!magic) return
    
    try {
      await magic.user.logout()
      setIsLoggedIn(false)
      setAccount('')
      setBalance('0')
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Show wallet UI
  const showWallet = async () => {
    if (!magic) return
    
    try {
      await magic.wallet.showUI()
    } catch (err) {
      console.error('Error showing wallet:', err)
    }
  }

  // Send transaction
  const sendTransaction = async () => {
    if (!web3 || !account || !recipient || !amount) {
      setSendStatus({...sendStatus, error: 'Please enter recipient address and amount'})
      return
    }
    
    try {
      setSendStatus({loading: true, error: null, success: false})
      
      // Convert amount to wei
      const amountWei = web3.utils.toWei(amount, 'ether')
      
      // Create transaction
      const tx = {
        from: account,
        to: recipient,
        value: amountWei,
        gas: 500000, // Higher gas limit for Flow EVM
      }
      
      // Send transaction
      const receipt = await web3.eth.sendTransaction(tx)
      
      // Update transactions list
      const newTx = {
        hash: receipt.transactionHash,
        value: amount,
        to: recipient,
        timestamp: Date.now()
      }
      
      setTransactions([newTx, ...transactions])
      setSendStatus({loading: false, error: null, success: true})
      
      // Reset form
      setRecipient('')
      setAmount('')
      
      // Refresh balance
      setTimeout(() => getUserInfo(), 2000)
    } catch (err: any) {
      console.error('Transaction error:', err)
      setSendStatus({loading: false, error: err.message || 'Transaction failed', success: false})
    }
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (!account) return
    
    navigator.clipboard.writeText(account)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  // Get explorer URL
  const getExplorerUrl = (type: 'address' | 'tx', value: string) => {
    return `https://testnet.flowscan.io/${type}/${value}`
  }

  // View component
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      {!isLoggedIn ? (
        <div className="w-full max-w-md flex flex-col gap-4 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Magic Wallet</h1>
          </div>
          
          <p className="text-zinc-400">Experience passwordless Web3 authentication</p>
          
          <div className="space-y-3">
            {!showEmailLogin ? (
              <>
                <button
                  onClick={() => setShowEmailLogin(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Login with Email
                    </>
                  )}
                </button>
                
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-zinc-500 text-sm">or</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>
                
                <button
                  onClick={login}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect with Magic Wallet
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                  />
                </div>
                
                {/* Advanced email options */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced options
                  </button>
                  
                  {showAdvancedOptions && (
                    <div className="mt-2 p-2 bg-zinc-800/50 rounded border border-zinc-700">
                      <label className="flex items-center text-xs text-white/70">
                        <input
                          type="checkbox"
                          checked={sendCustomEmail}
                          onChange={(e) => setSendCustomEmail(e.target.checked)}
                          className="mr-2 h-3 w-3"
                        />
                        Send custom Flow Mail email (along with Magic email)
                      </label>
                      <p className="text-xs text-zinc-500 mt-1">
                        You'll receive two emails: our custom Flow Mail email and Magic's official email
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={loginWithEmail}
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Link...
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </button>
                
                <button
                  onClick={() => setShowEmailLogin(false)}
                  className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm"
                >
                  Back
                </button>
              </div>
            )}
            
            {!showEmailLogin && (
              <button
                onClick={loginWithGoogle}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center py-2 px-4 bg-white hover:bg-gray-100 rounded-lg text-gray-800"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" className="mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mt-2 p-2 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-800">
                {error}
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="mt-2 p-2 bg-green-900/30 text-green-300 rounded-lg text-sm border border-green-800">
                {successMessage}
              </div>
            )}
            
            <DebugInfo error={error} details={debugDetails} />
          </div>
        </div>
      ) : (
        <>
          {/* Minimized Wallet Interface */}
          <div className="w-full max-w-xs border border-zinc-800 bg-zinc-950 rounded-xl shadow-lg">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-white" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {isLoading ? "Loading..." : formatAddress(account)}
                    </span>
                    <span className="text-xs text-white/70">
                      {isLoading ? "..." : Number(balance).toFixed(4)} FLOW
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-6 px-2 text-xs border border-zinc-700 bg-zinc-900 text-white rounded-full">
                    Flow Testnet
                  </span>
                  <button
                    className="h-8 w-8 text-white hover:text-white hover:bg-zinc-800 rounded-full flex items-center justify-center"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive buttons */}
          <div className="w-full max-w-xs flex gap-2 mt-2">
            <button
              onClick={showWallet}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium"
            >
              Show Magic Wallet
            </button>
            <button
              onClick={logout}
              className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Wallet Management Dialog */}
          {isDialogOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 text-white shadow-xl rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-white" />
                    <span className="font-medium">Magic Flow Wallet</span>
                  </div>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-800"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-white/70 mb-1">Address</div>
                    <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-sm font-medium text-white">
                        {formatAddress(account)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          className="h-8 w-8 flex items-center justify-center text-white hover:text-white hover:bg-zinc-800 rounded-full"
                          onClick={copyAddress}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          className="h-8 w-8 flex items-center justify-center text-white hover:text-white hover:bg-zinc-800 rounded-full"
                          onClick={() => window.open(getExplorerUrl('address', account), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-white/70 mb-1">Balance</div>
                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <div className="text-2xl font-bold text-white">
                        {Number(balance).toFixed(4)} FLOW
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-white/70 mb-1">Network</div>
                    <div className="flex items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Flow Testnet</span>
                      <span className="ml-2 text-xs text-white/50">(Chain ID: {process.env.NEXT_PUBLIC_FLOW_CHAIN_ID || '545'})</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-white/70 mb-1">Send FLOW</div>
                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-white/70 block mb-1">Recipient Address</label>
                          <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-white/70 block mb-1">Amount (FLOW)</label>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.01"
                            step="0.000001"
                            min="0"
                            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                          />
                        </div>
                        
                        {sendStatus.success && (
                          <div className="p-2 text-sm text-green-400 bg-green-900/20 border border-green-800/30 rounded-md">
                            Transaction sent successfully!
                          </div>
                        )}
                        
                        {sendStatus.error && (
                          <DebugInfo 
                            error={sendStatus.error} 
                            details={{
                              'Recipient': recipient,
                              'Amount': amount,
                              'Network': 'Flow Testnet',
                              'Chain ID': process.env.NEXT_PUBLIC_FLOW_CHAIN_ID || '545',
                              'Sender': account
                            }} 
                          />
                        )}
                        
                        <button
                          onClick={sendTransaction}
                          disabled={sendStatus.loading}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium flex items-center justify-center"
                        >
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          {sendStatus.loading ? "Sending..." : "Send FLOW"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-md text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 