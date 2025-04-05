import { useState } from 'react'
import { Archive, ArrowLeft, Delete, Forward, MoreVertical, Reply, ReplyAll, Star, Paperclip, Coins, Plus, ChevronDown } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Token {
  symbol: string
  name: string
  balance: number
  value: number
  icon?: string
}

interface EmailDetailProps {
  email: {
    id: string
    read: boolean
    starred: boolean
    sender: {
      name: string
      email: string
      avatar?: string
    }
    subject: string
    snippet: string
    body?: string
    date: Date
    labels?: string[]
  }
}

export function EmailDetail({ email }: EmailDetailProps) {
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([])
  
  const availableTokens: Token[] = [
    {
      symbol: "FLOW",
      name: "Flow",
      balance: 250.75,
      value: 1030.58,
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

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
    return date.toLocaleString('en-US', options)
  }

  const toggleToken = (token: Token) => {
    setSelectedTokens(prev => {
      const exists = prev.find(t => t.symbol === token.symbol)
      if (exists) {
        return prev.filter(t => t.symbol !== token.symbol)
      }
      return [...prev, token]
    })
  }

  return (
    <div className="flex h-full flex-col bg-[#0B0E14]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-[#0B0E14] p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
            <Forward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
            <Star className={cn("h-4 w-4", email.starred && "fill-yellow-400 text-yellow-400")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="mb-6 text-2xl font-bold text-white">{email.subject}</h1>
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
              <AvatarFallback className="bg-blue-600 text-white">
                {email.sender.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{email.sender.name}</span>
                <span className="text-sm text-gray-400">&lt;{email.sender.email}&gt;</span>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                {formatDate(email.date)}
              </div>
            </div>
          </div>
        </div>
        <div className="prose prose-invert max-w-none">
          {email.body || email.snippet}
        </div>
      </div>
      <div className="sticky bottom-0 border-t border-gray-800 bg-[#0B0E14] p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-gray-700 bg-transparent text-white hover:bg-gray-800"
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
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
            Reply
          </Button>
        </div>
        {selectedTokens.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTokens.map(token => (
              <div 
                key={token.symbol}
                className="flex items-center gap-2 rounded-full bg-gray-800/50 px-3 py-1.5 text-sm text-white"
              >
                <span>{token.icon}</span>
                <span>{token.symbol}</span>
                <span className="text-gray-400">
                  ({token.balance.toLocaleString()} available)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={isTokenSheetOpen} onOpenChange={setIsTokenSheetOpen}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-xl border-t border-gray-800 bg-[#0B0E14]">
          <SheetHeader className="px-4 pb-4">
            <SheetTitle className="text-white">Select Tokens to Attach</SheetTitle>
            <SheetDescription className="text-gray-400">
              Choose the tokens you want to attach to your reply
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
    </div>
  )
}

