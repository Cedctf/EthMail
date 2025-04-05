"use client"

import { useState, useEffect } from "react"
import { Archive, Mail, Star, Trash, MailPlus, Filter, RefreshCw } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { EmailDetail } from "@/components/email-detail"
import { ComposeEmail } from "@/components/compose-email"
import { fetchEmails, getEmailsByCategory } from "@/lib/gmail"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

interface Email {
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
  date: Date
  labels?: string[]
}

interface EmailListProps {
  onUnreadCountChange?: (count: number) => void;
  category?: string; // 'inbox', 'sent', 'drafts', etc.
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'finance', label: 'Finance' },
  { id: 'updates', label: 'Updates' },
  { id: 'social', label: 'Social' },
  { id: 'promotions', label: 'Promotions' },
]

export default function EmailList({ onUnreadCountChange, category = 'inbox' }: EmailListProps) {
  const { isLoggedIn } = useAuth()
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // Load emails based on the current category prop
  useEffect(() => {
    const loadEmails = async () => {
      if (!isLoggedIn) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        let data;
        if (category === 'all') {
          data = await fetchEmails(20);
        } else {
          data = await getEmailsByCategory(category, 20);
        }
        
        setEmails(data)
        
        // Only count unread emails for inbox
        if (category === 'inbox') {
          const newUnreadCount = data.filter(email => !email.read).length
          setUnreadCount(newUnreadCount)
          onUnreadCountChange?.(newUnreadCount)
        }
      } catch (err) {
        console.error(`Error loading ${category} emails:`, err)
        setError(`Failed to load ${category} emails. Please try again.`)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEmails()
  }, [isLoggedIn, onUnreadCountChange, category])

  const handleRefresh = async () => {
    if (!isLoggedIn) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      let data;
      if (category === 'all') {
        data = await fetchEmails(20);
      } else {
        data = await getEmailsByCategory(category, 20);
      }
      
      setEmails(data)
      
      // Only count unread emails for inbox
      if (category === 'inbox') {
        const newUnreadCount = data.filter(email => !email.read).length
        setUnreadCount(newUnreadCount)
        onUnreadCountChange?.(newUnreadCount)
      }
    } catch (err) {
      console.error(`Error refreshing ${category} emails:`, err)
      setError(`Failed to refresh ${category} emails. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelectEmail = (id: string) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  const selectAllEmails = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(emails.map((email) => email.id))
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      })
    }

    const isThisYear = date.getFullYear() === now.getFullYear()
    if (isThisYear) {
      return date.toLocaleDateString('en-US', { 
        month: "short", 
        day: "numeric" 
      })
    }

    return date.toLocaleDateString('en-US', { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    })
  }

  const handleEmailOpen = (email: Email) => {
    if (!email.read) {
      // Update the email's read status
      const updatedEmails = emails.map(e => {
        if (e.id === email.id) {
          return { ...e, read: true }
        }
        return e
      })
      setEmails(updatedEmails)
      
      // Only update unread count for inbox
      if (category === 'inbox') {
        const newUnreadCount = Math.max(0, unreadCount - 1)
        setUnreadCount(newUnreadCount)
        onUnreadCountChange?.(newUnreadCount)
      }
    }
    setSelectedEmail(email)
  }

  // Get display name for current category
  const getCategoryDisplayName = () => {
    const firstLetter = category.charAt(0).toUpperCase()
    const rest = category.slice(1).toLowerCase()
    return `${firstLetter}${rest}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex flex-col border-b border-gray-800 bg-[#0B0E14]">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedEmails.length === emails.length && emails.length > 0}
              onCheckedChange={selectAllEmails}
              aria-label="Select all emails"
              className="h-4 w-4 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            {selectedEmails.length > 0 ? (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Mark as read</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </>
            )}
          </div>
          <div className="text-sm font-medium text-white">
            {getCategoryDisplayName()}
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "text-sm font-medium transition-colors whitespace-nowrap",
                activeCategory === cat.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-800/50">
          {emails.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <Mail className="mx-auto mb-4 h-8 w-8 opacity-50" />
              <p className="text-sm">No emails found in {getCategoryDisplayName()}</p>
            </div>
          ) : (
            emails.map((email) => (
              <Sheet key={email.id}>
                <SheetTrigger asChild>
                  <div
                    className={cn(
                      "flex cursor-pointer items-center gap-2 p-4 transition-colors",
                      !email.read ? "bg-gray-800/40" : "hover:bg-gray-800/20",
                      selectedEmails.includes(email.id) && "bg-gray-800/60"
                    )}
                    onClick={() => handleEmailOpen(email)}
                  >
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedEmails.includes(email.id)}
                        onCheckedChange={() => toggleSelectEmail(email.id)}
                        aria-label={`Select email from ${email.sender.name}`}
                        className="h-4 w-4 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle star
                        }}
                      >
                        <Star className={cn("h-4 w-4", email.starred && "fill-yellow-400 text-yellow-400")} />
                        <span className="sr-only">Star</span>
                      </Button>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={email.sender.avatar} alt={email.sender.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {email.sender.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 gap-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("truncate text-sm", !email.read && "font-semibold text-white")}>
                          {email.sender.name}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(email.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn("truncate text-sm", !email.read && "font-semibold text-white")}>
                          {email.subject}
                        </span>
                        {email.labels && email.labels.length > 0 && (
                          <span
                            className={cn(
                              "ml-2 h-2 w-2 shrink-0 rounded-full",
                              email.labels.includes("INBOX")
                                ? "bg-blue-500"
                                : email.labels.includes("SENT")
                                  ? "bg-green-500"
                                  : email.labels.includes("DRAFT")
                                    ? "bg-yellow-500"
                                    : "bg-purple-500"
                            )}
                          />
                        )}
                      </div>
                      <span className="truncate text-sm text-gray-400">{email.snippet}</span>
                    </div>
                  </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-xl border-t border-gray-800 bg-[#0B0E14] p-0">
                  {selectedEmail && (
                    <>
                      <SheetTitle className="sr-only">Email Details</SheetTitle>
                      <EmailDetail email={selectedEmail} />
                    </>
                  )}
                </SheetContent>
              </Sheet>
            ))
          )}
        </div>
      </div>
      <ComposeEmail open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </div>
  )
}

