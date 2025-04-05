"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Archive, 
  File, 
  Inbox, 
  Info, 
  Mail, 
  MailPlus, 
  MoreHorizontal, 
  PenSquare, 
  Send, 
  Star, 
  Trash, 
  Clock,
  AlertOctagon,
  Zap,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WalletInfo {
  balance: number;
  value: number;
  tokenPrice: number;
  priceChange: number;
  priceHistory: number[];
}

interface SidebarProps {
  onCompose: () => void;
  unreadCount?: number;
  currentCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function Sidebar({ 
  onCompose, 
  unreadCount = 0, 
  currentCategory = 'inbox',
  onCategoryChange 
}: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [walletInfo] = useState<WalletInfo>({
    balance: 250.75,
    value: 1030.58,
    tokenPrice: 4.11,
    priceChange: 2.8,
    priceHistory: [3.85, 3.92, 4.01, 3.98, 4.05, 4.08, 4.11] // Last 7 days
  })

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const navItems = [
    {
      label: 'Inbox',
      icon: Inbox,
      category: 'inbox',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      label: 'Starred',
      icon: Star,
      category: 'starred',
    },
    {
      label: 'Snoozed',
      icon: Clock,
      category: 'snoozed',
    },
    {
      label: 'Sent',
      icon: Send,
      category: 'sent',
    },
    {
      label: 'Drafts',
      icon: File,
      category: 'drafts',
    },
    {
      label: 'Trash',
      icon: Trash,
      category: 'trash',
    },
  ]

  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  }

  const renderPriceChart = () => {
    const max = Math.max(...walletInfo.priceHistory)
    const min = Math.min(...walletInfo.priceHistory)
    const range = max - min
    const height = 32 // Chart height in pixels
    
    return (
      <div className="mt-3 flex items-end gap-0.5 h-8">
        {walletInfo.priceHistory.map((price, i) => {
          const normalizedHeight = ((price - min) / range) * height
          const isPositive = i > 0 && price >= walletInfo.priceHistory[i - 1]
          return (
            <div
              key={i}
              className={cn(
                "w-full rounded-sm",
                isPositive ? "bg-green-500" : "bg-red-500"
              )}
              style={{ height: `${normalizedHeight}px` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col border-r border-gray-800 bg-[#0B0E14] transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center p-4">
        <Button 
          onClick={onCompose}
          className={cn(
            "flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
            expanded ? "w-full justify-start px-4" : "w-12 justify-center px-0"
          )}
        >
          <MailPlus className="h-4 w-4" />
          {expanded && <span>Compose</span>}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = currentCategory === item.category;
          
          return (
            <button
              key={item.category}
              onClick={() => handleCategoryClick(item.category)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors text-left",
                isActive ? "bg-gray-800/50 font-medium text-white" : "hover:bg-gray-800/30",
                !expanded && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4" />
              {expanded && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {expanded && (
        <div className="border-t border-gray-800 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-white">Flow Wallet</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4 rounded-lg bg-gray-800/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Balance:</span>
              <span className="font-medium text-white">{walletInfo.balance.toFixed(2)} FLOW</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Value:</span>
              <span className="font-medium text-white">${walletInfo.value.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-400">${walletInfo.tokenPrice} per token</span>
              <div className="flex items-center gap-1">
                {walletInfo.priceChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                <span className={walletInfo.priceChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {walletInfo.priceChange >= 0 ? "+" : ""}{walletInfo.priceChange}%
                </span>
              </div>
            </div>
            {renderPriceChart()}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full border-gray-700 bg-transparent text-white hover:bg-gray-800">
              Send
            </Button>
            <Button variant="outline" className="w-full border-gray-700 bg-transparent text-white hover:bg-gray-800">
              Receive
            </Button>
          </div>
          <Button 
            variant="ghost" 
            className="mt-2 w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Token
          </Button>
        </div>
      )}
    </div>
  )
} 