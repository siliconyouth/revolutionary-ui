'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Code, Maximize2, Minimize2, RefreshCw, Copy, Check, Settings, Download } from 'lucide-react';
import { transform } from '@babel/standalone';
import { useR2Resource } from '@/hooks/useR2Resource';
import { createMultiFrameworkSandbox } from './MultiFrameworkSandbox';

interface ComponentPreviewSandboxProps {
  resourceId: string;
  initialCode?: string;
  framework?: 'react' | 'vue' | 'angular' | 'svelte';
  height?: number;
  editable?: boolean;
  showControls?: boolean;
}

interface PreviewError {
  message: string;
  line?: number;
  column?: number;
}

export function ComponentPreviewSandbox({
  resourceId,
  initialCode,
  framework: initialFramework = 'react',
  height = 400,
  editable = true,
  showControls = true,
}: ComponentPreviewSandboxProps) {
  const [code, setCode] = useState(initialCode || '');
  const [framework, setFramework] = useState(initialFramework);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(editable);
  const [error, setError] = useState<PreviewError | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch code from R2 if not provided
  const { resource, loading } = useR2Resource(resourceId);

  useEffect(() => {
    if (!initialCode && resource?.code) {
      setCode(resource.code);
    }
  }, [initialCode, resource]);

  // Transform code for preview
  const transformedCode = useMemo(() => {
    if (!code) return '';
    
    try {
      // Only transform for React
      if (framework === 'react') {
        const result = transform(code, {
          presets: ['react'],
          filename: 'component.jsx',
        });
        return result.code || '';
      }
      
      // Other frameworks handle transformation differently
      return code;
    } catch (err: any) {
      setError({
        message: err.message,
        line: err.loc?.line,
        column: err.loc?.column,
      });
      return '';
    }
  }, [code, framework]);

  // Create sandbox HTML
  const sandboxHtml = useMemo(() => {
    // Use multi-framework sandbox
    return createMultiFrameworkSandbox(framework, transformedCode, 'light');
  }, [framework, transformedCode]);

  // Update iframe content
  useEffect(() => {
    if (iframeRef.current && sandboxHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(sandboxHtml);
        doc.close();
      }
    }
  }, [sandboxHtml]);

  // Handle code copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setError(null);
    
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(sandboxHtml);
            doc.close();
          }
        }
        setIsRefreshing(false);
      }, 100);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-${resourceId}.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                showCode 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Code className="h-4 w-4 inline mr-1" />
              Code
            </button>
            
            <button
              onClick={() => setShowCode(false)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                !showCode 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Play className="h-4 w-4 inline mr-1" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Framework selector */}
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value as any)}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="react">React</option>
              <option value="vue">Vue 3</option>
              <option value="angular">Angular</option>
              <option value="svelte">Svelte</option>
              <option value="vanilla">Vanilla JS</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Download component"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Error {error.line ? `on line ${error.line}` : ''}:
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1 font-mono">
            {error.message}
          </p>
        </div>
      )}

      {/* Content area */}
      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : height }}>
        {/* Code editor */}
        {showCode && (
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
              spellCheck={false}
              placeholder="// Enter your component code here..."
              readOnly={!editable}
            />
          </div>
        )}

        {/* Preview iframe */}
        <div className={showCode ? 'w-1/2' : 'w-full'}>
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Component Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}