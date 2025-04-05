"use client"

import { useState } from "react"
import { Minimize2, X, Paperclip, Image, Link2, Smile, Send, Loader2, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { sendEmail } from "@/lib/gmail"

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
      return
    }
    
    setIsSending(true)
    setStatusMessage({ type: 'none', message: '' })
    
    try {
      await sendEmail(to, subject, body)
      
      // Set success message
      setStatusMessage({
        type: 'success',
        message: `Email to ${to} sent successfully!`
      })
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setTo("")
        setSubject("")
        setBody("")
        setErrors({})
        onOpenChange(false)
        setStatusMessage({ type: 'none', message: '' })
      }, 2000)
      
    } catch (error) {
      console.error("Failed to send email:", error)
      setStatusMessage({
        type: 'error',
        message: "Failed to send email. Please try again."
      })
      setIsSending(false)
    }
  }
  
  const resetForm = () => {
    setTo("")
    setSubject("")
    setBody("")
    setErrors({})
    setStatusMessage({ type: 'none', message: '' })
  }
  
  const handleClose = () => {
    if (to || subject || body) {
      // Only ask for confirmation if there's content
      if (window.confirm("Discard this message?")) {
        resetForm()
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => {
        if (!isOpen && (to || subject || body)) {
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
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
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

