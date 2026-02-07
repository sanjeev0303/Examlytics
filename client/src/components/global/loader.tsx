
import React from 'react'

export const LoaderSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
  )
}
