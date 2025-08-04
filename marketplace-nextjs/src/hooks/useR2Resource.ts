import { useState, useEffect } from 'react';

interface R2Resource {
  id: string;
  name: string;
  slug: string;
  description: string;
  sourceCode?: string;
  documentation?: string;
  codeStorage?: {
    url: string;
    size: number;
    contentType: string;
  };
  docsStorage?: {
    url: string;
    size: number;
    contentType: string;
  };
}

interface DownloadUrls {
  codeUrl?: string;
  docsUrl?: string;
  assetUrls?: Record<string, string>;
}

export function useR2Resource(resourceId: string | null) {
  const [resource, setResource] = useState<R2Resource | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;

    const fetchResource = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) throw new Error('Failed to fetch resource');
        
        const data = await response.json();
        setResource(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const getDownloadUrls = async () => {
    if (!resourceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resources/${resourceId}/download`);
      if (!response.ok) throw new Error('Failed to get download URLs');
      
      const data = await response.json();
      setDownloadUrls(data.download);
      return data.download;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadResource = async (type: 'code' | 'docs' = 'code') => {
    const urls = downloadUrls || await getDownloadUrls();
    if (!urls) return;

    const url = type === 'code' ? urls.codeUrl : urls.docsUrl;
    if (url) {
      window.open(url, '_blank');
    } else if (resource) {
      // Fallback to inline content
      const content = type === 'code' ? resource.sourceCode : resource.documentation;
      if (content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${resource.slug}.${type === 'code' ? 'tsx' : 'md'}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      }
    }
  };

  return {
    resource,
    downloadUrls,
    loading,
    error,
    getDownloadUrls,
    downloadResource,
  };
}