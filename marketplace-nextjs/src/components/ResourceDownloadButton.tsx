'use client';

import React from 'react';
import { Download, Code, FileText, Loader2 } from 'lucide-react';
import { useR2Resource } from '@/hooks/useR2Resource';

interface ResourceDownloadButtonProps {
  resourceId: string;
  variant?: 'code' | 'docs' | 'both';
  className?: string;
}

export function ResourceDownloadButton({ 
  resourceId, 
  variant = 'code',
  className = ''
}: ResourceDownloadButtonProps) {
  const { resource, loading, error, downloadResource } = useR2Resource(resourceId);

  if (loading) {
    return (
      <button className={`inline-flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed ${className}`} disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </button>
    );
  }

  if (error || !resource) {
    return (
      <button className={`inline-flex items-center px-4 py-2 rounded-md bg-red-100 text-red-600 cursor-not-allowed ${className}`} disabled>
        <Download className="w-4 h-4 mr-2" />
        Error loading
      </button>
    );
  }

  const handleDownload = async (type: 'code' | 'docs') => {
    await downloadResource(type);
  };

  if (variant === 'both') {
    return (
      <div className={`inline-flex gap-2 ${className}`}>
        <button
          onClick={() => handleDownload('code')}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Code className="w-4 h-4 mr-2" />
          Download Code
        </button>
        <button
          onClick={() => handleDownload('docs')}
          className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download Docs
        </button>
      </div>
    );
  }

  const icon = variant === 'code' ? Code : FileText;
  const label = variant === 'code' ? 'Download Code' : 'Download Docs';
  const bgColor = variant === 'code' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';

  return (
    <button
      onClick={() => handleDownload(variant)}
      className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors ${bgColor} ${className}`}
    >
      {React.createElement(icon, { className: "w-4 h-4 mr-2" })}
      {label}
    </button>
  );
}