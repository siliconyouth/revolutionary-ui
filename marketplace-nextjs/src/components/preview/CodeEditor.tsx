"use client"

import React from 'react'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  height?: string
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'typescript',
  readOnly = false,
  height = '400px'
}: CodeEditorProps) {
  return (
    <div className="relative w-full">
      <pre className="overflow-auto rounded-md bg-gray-900 p-4 text-sm">
        <code className="text-gray-300">{value}</code>
      </pre>
    </div>
  )
}