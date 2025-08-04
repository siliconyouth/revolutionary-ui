'use client';

import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useR2Resource } from '@/hooks/useR2Resource';

interface ResourceCodeViewerProps {
  resourceId: string;
  className?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function ResourceCodeViewer({ 
  resourceId,
  className = '',
  showLineNumbers = true,
  maxHeight = '500px'
}: ResourceCodeViewerProps) {
  const { resource, loading, error } = useR2Resource(resourceId);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    if (resource?.codeStorage?.url) {
      // Fetch code from R2 if available
      fetch(resource.codeStorage.url)
        .then(res => res.text())
        .then(setCode)
        .catch(() => {
          // Fallback to inline code
          if (resource.sourceCode) {
            setCode(resource.sourceCode);
          }
        });
    } else if (resource?.sourceCode) {
      setCode(resource.sourceCode);
    }
  }, [resource]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg p-8 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600">Failed to load code: {error || 'Resource not found'}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-gray-200">{resource.name}</h3>
          {resource.codeStorage && (
            <a
              href={resource.codeStorage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View on R2
            </a>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div style={{ maxHeight }} className="overflow-auto">
        <SyntaxHighlighter
          language="typescript"
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
        >
          {code || '// Loading...'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}