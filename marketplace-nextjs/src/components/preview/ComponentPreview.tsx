"use client"

import React from 'react'

interface ComponentPreviewProps {
  children: React.ReactNode
  className?: string
}

export default function ComponentPreview({ children, className = '' }: ComponentPreviewProps) {
  return (
    <div className={`min-h-[200px] rounded-lg border bg-background p-4 ${className}`}>
      {children}
    </div>
  )
}