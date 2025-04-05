"use client"

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface DebugInfoProps {
  error: string | null
  details?: Record<string, any>
}

export default function DebugInfo({ error, details }: DebugInfoProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!error) return null

  return (
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
        <div className="w-full">
          <h3 className="font-medium text-red-500">Error</h3>
          <p className="text-red-400 text-sm">{error}</p>
          
          {details && (
            <div className="mt-2">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                {showDetails ? 'Hide details' : 'Show technical details'}
              </button>
              
              {showDetails && (
                <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-800/30 text-red-300 text-xs overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {Object.entries(details).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 