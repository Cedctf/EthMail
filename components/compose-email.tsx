"use client"

import { useState } from "react"
import { Minimize2, X, Paperclip, Image, Link2, Smile, Send, Loader2, CheckCircle, Coins, ChevronDown, Edit, Check } from "lucide-react"
import { ethers } from "ethers"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetHeader, SheetDescription } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { sendEmail } from "@/lib/gmail"

// Contract ABI for the SimpleEmailPayment contract
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_receiver",
        "type": "address"
      }
    ],
    "name": "depositPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      }
    ],
    "name": "PaymentDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      }
    ],
    "name": "PaymentReleased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      }
    ],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      }
    ],
    "name": "getTransaction",
    "outputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "transactionCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "transactions",
    "outputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface Token {
  symbol: string
  name: string
  balance: number
  value: number
  icon?: string
  amount?: number // Added amount field
}

interface ComposeEmailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposeEmail({ open, onOpenChange }: ComposeEmailProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ 
    type: 'none', 
    message: '' 
  })
  const [errors, setErrors] = useState<{
    to?: string;
    subject?: string;
    body?: string;
  }>({})
  
  // Token attachment related states
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([])
  const [editingTokenIndex, setEditingTokenIndex] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState<string>("")
  
  // Available tokens for the user
  const availableTokens: Token[] = [
    {
      symbol: "CELO",
      name: "CELO",
      balance: 250.75,
      value: 75.58,
      icon: "🌊"
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: 1000,
      value: 1000,
      icon: "💵"
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: 0.5,
      value: 1250,
      icon: "💎"
    }
  ]
  
  // Crypto payment related states - for backwards compatibility
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null)
  const [paymentReceiverAddress, setPaymentReceiverAddress] = useState<string | null>(null)

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const validateForm = () => {
    const newErrors: {
      to?: string;
      subject?: string;
      body?: string;
    } = {}
    
    if (!to) {
      newErrors.to = "Recipient is required"
    } else if (!validateEmail(to)) {
      newErrors.to = "Please enter a valid email address"
    }
    
    if (!subject) {
      newErrors.subject = "Subject is required"
    }
    
    if (!body.trim()) {
      newErrors.body = "Message body is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSend = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSending(true);
    setStatusMessage({ type: 'none', message: '' });
    
    try {
      // If tokens are attached, include them in the email body
      let emailBody = body;
      
      if (selectedTokens.length > 0) {
        emailBody += "\n\n---\nAttached Tokens:\n";
        selectedTokens.forEach(token => {
          const tokenAmount = token.amount || token.balance;
          const tokenValue = (token.value / token.balance) * tokenAmount;
          emailBody += `${token.icon} ${token.symbol}: ${tokenAmount.toLocaleString()} (Value: $${tokenValue.toFixed(2)})\n`;
        });
      }
      
      // Try to send payment to contract
      let paymentSent = false;
      let transactionHash = '';
      try {
        // Send 0.01 CELO payment to the contract
        const txResult = await sendPaymentToContract();
        paymentSent = txResult.success;
        transactionHash = txResult.hash || '';
        
        // Add payment info with transaction hash to email body
        emailBody += "\n\n---\n🔄 Payment of 0.01 CELO has been sent via contract.";
        if (transactionHash) {
          // Add Celo explorer link for the transaction
          const celoExplorerUrl = `https://explorer.celo.org/mainnet/tx/${transactionHash}`;
          emailBody += `\nTransaction Hash: ${transactionHash}`;
          emailBody += `\nView on Explorer: ${celoExplorerUrl}`;
          emailBody += `\nReceiver Address: 0x8fdd8FF672BEf99e33A1F821ECDC57571391e9B5`;
        }
      } catch (paymentError) {
        console.error("Payment failed:", paymentError);
        emailBody += "\n\n---\n❌ Payment of 0.01 CELO failed to process.";
      }
      
      // Send the email with updated body
      await sendEmail(to, subject, emailBody);
      
      // Set success message
      let successMsg = `Email to ${to} sent successfully!`;
      if (selectedTokens.length > 0) {
        successMsg += ` ${selectedTokens.length} token${selectedTokens.length !== 1 ? 's' : ''} attached.`;
      }
      if (paymentSent) {
        successMsg += " Payment of 0.01 CELO sent.";
        if (transactionHash) {
          successMsg += ` TX: ${transactionHash.substring(0, 10)}...`;
        }
      }
      
      setStatusMessage({
        type: 'success',
        message: successMsg
      });
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error("Failed to send email:", error);
      setStatusMessage({
        type: 'error',
        message: "Failed to send email. Please try again."
      });
      setIsSending(false);
    }
  };
  
  const resetForm = () => {
    setTo("")
    setSubject("")
    setBody("")
    setErrors({})
    setStatusMessage({ type: 'none', message: '' })
    setSelectedTokens([])
    setPaymentAmount(null)
    setPaymentReceiverAddress(null)
    setShowPaymentForm(false)
    setEditingTokenIndex(null)
    setEditAmount("")
  }
  
  const handleClose = () => {
    if (to || subject || body || selectedTokens.length > 0 || paymentAmount) {
      // Only ask for confirmation if there's content
      if (window.confirm("Discard this message?")) {
        resetForm()
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }
  
  const toggleToken = (token: Token) => {
    setSelectedTokens(prev => {
      const exists = prev.find(t => t.symbol === token.symbol)
      if (exists) {
        return prev.filter(t => t.symbol !== token.symbol)
      }
      
      // If it's CELO, set default amount to 0.01, otherwise use full balance
      const defaultAmount = token.symbol === "CELO" ? 0.01 : token.balance;
      return [...prev, {...token, amount: defaultAmount}]
    })
  }
  
  const startEditTokenAmount = (index: number) => {
    const token = selectedTokens[index]
    setEditingTokenIndex(index)
    setEditAmount(token.amount?.toString() || token.balance.toString())
  }
  
  const saveTokenAmount = () => {
    if (editingTokenIndex === null) return
    
    const amount = parseFloat(editAmount)
    if (isNaN(amount) || amount <= 0) {
      // Invalid amount, reset to default
      setEditAmount("")
      return
    }
    
    const token = selectedTokens[editingTokenIndex]
    // Ensure amount doesn't exceed balance
    const validAmount = Math.min(amount, token.balance)
    
    setSelectedTokens(prev => {
      const updated = [...prev]
      updated[editingTokenIndex] = {
        ...updated[editingTokenIndex],
        amount: validAmount
      }
      return updated
    })
    
    setEditingTokenIndex(null)
    setEditAmount("")
  }
  
  const cancelEditTokenAmount = () => {
    setEditingTokenIndex(null)
    setEditAmount("")
  }
  
  // For backwards compatibility
  const handleTogglePaymentForm = () => {
    setShowPaymentForm(!showPaymentForm)
  }
  
  const handlePaymentAttached = (amount: string, receiverAddress: string | null) => {
    setPaymentAmount(amount)
    setPaymentReceiverAddress(receiverAddress)
    setShowPaymentForm(false)
  }

  // Send 0.01 CELO to the contract
  const sendPaymentToContract = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        throw new Error("Metamask is not installed");
      }
      
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Contract address from your query
      const contractAddress = "0x527482F7b3C9AA34A2B7d69646Bac38Dc4455dEf";
      const receiverAddress = "0x8fdd8FF672BEf99e33A1F821ECDC57571391e9B5";
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Convert 0.01 CELO to wei (1e16 wei = 0.01 ether)
      const amountInWei = ethers.parseEther("0.01");
      
      // Prepare transaction options with manual gas settings
      const txOptions = {
        value: amountInWei,
        gasLimit: 200000 // Manually set gas limit to avoid estimation errors
      };
      
      console.log("Sending transaction with options:", txOptions);
      
      try {
        // Call the depositPayment function with the receiver address and value
        const tx = await contract.depositPayment(receiverAddress, txOptions);
        
        console.log("Transaction hash:", tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        return { success: true, hash: tx.hash };
      } catch (txError) {
        console.error("Transaction failed:", txError);
        
        // Check if it's a user rejection
        if ((txError as any).code === 4001) {
          throw new Error("Transaction rejected by user");
        }
        
        // Try with higher gas limit if first attempt failed
        console.log("Retrying with higher gas limit...");
        txOptions.gasLimit = 500000;
        
        try {
          const tx = await contract.depositPayment(receiverAddress, txOptions);
          await tx.wait();
          return { success: true, hash: tx.hash };
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          throw new Error("Transaction failed after retry");
        }
      }
    } catch (error) {
      console.error("Error sending payment:", error);
      throw error;
    }
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen && (to || subject || body || selectedTokens.length > 0 || paymentAmount)) {
          // Only ask for confirmation if there's content
          if (window.confirm("Discard this message?")) {
            resetForm()
            onOpenChange(false)
          }
        } else if (!isOpen) {
          onOpenChange(false)
        }
      }}>
        <SheetContent 
          side="bottom" 
          className={cn(
            "rounded-t-xl border-t border-gray-800 bg-[#0B0E14] p-0",
            isMinimized ? "h-14" : "h-[85vh]"
          )}
        >
          <SheetTitle className="sr-only">Compose Email</SheetTitle>
          <div className="flex items-center justify-between border-b border-gray-800 bg-gray-800/30 p-3">
            <h3 className="text-sm font-medium text-white">New Message</h3>
            <div className="flex items-center gap-1">
              {isMinimized ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={handleMaximize}>
                  <Minimize2 className="h-4 w-4 rotate-180" />
                  <span className="sr-only">Maximize</span>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={handleMinimize}>
                  <Minimize2 className="h-4 w-4" />
                  <span className="sr-only">Minimize</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={handleClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="flex h-full flex-col">
              {statusMessage.type !== 'none' && (
                <div className={`p-2 text-sm ${statusMessage.type === 'success' ? 'bg-green-800/20 text-green-400' : 'bg-red-800/20 text-red-400'} flex items-center`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : null}
                  {statusMessage.message}
                </div>
              )}
              <div className="space-y-3 border-b border-gray-800 p-3">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="w-16 text-sm text-gray-400">To:</span>
                    <Input 
                      className="flex-1 border-0 bg-transparent text-white placeholder-gray-500 shadow-none focus-visible:ring-0"
                      placeholder="Recipients"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </div>
                  {errors.to && (
                    <div className="ml-16 mt-1 text-xs text-red-500">
                      {errors.to}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="w-16 text-sm text-gray-400">Subject:</span>
                    <Input 
                      className="flex-1 border-0 bg-transparent text-white placeholder-gray-500 shadow-none focus-visible:ring-0"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  {errors.subject && (
                    <div className="ml-16 mt-1 text-xs text-red-500">
                      {errors.subject}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Email Body */}
              <div className="flex-1 flex flex-col">
                <Textarea
                  className="flex-1 resize-none border-0 bg-transparent p-3 text-white placeholder-gray-500 shadow-none focus-visible:ring-0"
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                {errors.body && (
                  <div className="px-3 pb-1 text-xs text-red-500">
                    {errors.body}
                  </div>
                )}
              </div>
              
              {/* Selected Tokens Display */}
              {selectedTokens.length > 0 && (
                <div className="mt-0 border-t border-gray-800 p-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedTokens.map((token, index) => (
                      <div 
                        key={token.symbol}
                        className="flex items-center gap-2 rounded-full bg-gray-800/50 px-3 py-1.5 text-sm text-white"
                      >
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                        {editingTokenIndex === index ? (
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-6 w-20 border-0 bg-gray-700/50 px-2 text-white"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveTokenAmount()
                                } else if (e.key === 'Escape') {
                                  cancelEditTokenAmount()
                                }
                              }}
                              autoFocus
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-green-500"
                              onClick={saveTokenAmount}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500"
                              onClick={cancelEditTokenAmount}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">
                              ({token.amount?.toLocaleString() || token.balance.toLocaleString()})
                            </span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400"
                              onClick={() => startEditTokenAmount(index)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              

              
              <div className="flex items-center justify-between border-t border-gray-800 p-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <Image className="h-4 w-4" />
                    <span className="sr-only">Insert image</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <Link2 className="h-4 w-4" />
                    <span className="sr-only">Insert link</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                    <Smile className="h-4 w-4" />
                    <span className="sr-only">Insert emoji</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-gray-700 bg-transparent text-white hover:bg-gray-800 h-8 px-3 py-1 text-sm"
                    onClick={() => setIsTokenSheetOpen(true)}
                  >
                    <Coins className="h-4 w-4" />
                    {selectedTokens.length > 0 ? (
                      <span>
                        {selectedTokens.length} token{selectedTokens.length !== 1 ? 's' : ''} selected
                      </span>
                    ) : (
                      <span>Attach Tokens</span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  onClick={handleSend}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send with Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Token Selection Sheet */}
      <Sheet open={isTokenSheetOpen} onOpenChange={setIsTokenSheetOpen}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-xl border-t border-gray-800 bg-[#0B0E14]">
          <SheetHeader className="px-4 pb-4">
            <SheetTitle className="text-white">Select Tokens to Attach</SheetTitle>
            <SheetDescription className="text-gray-400">
              Choose the tokens you want to attach to your email
            </SheetDescription>
          </SheetHeader>
          <div className="divide-y divide-gray-800">
            {availableTokens.map(token => (
              <button
                key={token.symbol}
                className={cn(
                  "flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-800/30",
                  selectedTokens.some(t => t.symbol === token.symbol) && "bg-gray-800/50"
                )}
                onClick={() => toggleToken(token)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{token.icon}</div>
                  <div className="text-left">
                    <div className="font-medium text-white">{token.name}</div>
                    <div className="text-sm text-gray-400">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {token.balance.toLocaleString()} {token.symbol}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${token.value.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      {isMinimized && open && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-14 max-w-md cursor-pointer items-center justify-between rounded-t-lg border border-gray-800 bg-[#0B0E14] p-3 shadow-md"
          onClick={handleMaximize}
        >
          <h3 className="text-sm font-medium text-white">{subject ? subject : "New Message"}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      )}
    </>
  )
} 