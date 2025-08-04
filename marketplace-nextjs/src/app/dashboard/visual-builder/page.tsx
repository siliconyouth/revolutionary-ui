'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function VisualBuilderPage() {
  const { user } = useAuth()
  
  // Visual builder temporarily disabled for production build
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Visual Builder</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-gray-700 mb-4">
          The visual builder is currently being prepared for production release.
          Check back soon for drag-and-drop component creation!
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}