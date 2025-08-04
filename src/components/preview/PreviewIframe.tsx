import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface PreviewIframeProps {
  url: string;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export default function PreviewIframe({
  url,
  height = 400,
  className = '',
  onLoad,
  onError
}: PreviewIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    const err = new Error(`Failed to load preview from ${url}`);
    setError(err.message);
    onError?.(err);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setError(null);
      iframeRef.current.src = url;
    }
  };

  // Security: Only allow specific domains for iframe embedding
  const isAllowedDomain = (url: string) => {
    const allowedDomains = [
      'codesandbox.io',
      'stackblitz.com',
      'codepen.io',
      'storybook.js.org',
      'localhost',
      // Add your own domain
      process.env.NEXT_PUBLIC_APP_URL
    ].filter(Boolean);

    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  };

  if (!isAllowedDomain(url)) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">
            Preview not available from this source
          </p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Open in new tab →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`preview-iframe-container relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center p-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">Failed to load preview</p>
            <Button onClick={handleReload} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0 rounded-lg"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-write"
        title="Component Preview"
      />
    </div>
  );
}