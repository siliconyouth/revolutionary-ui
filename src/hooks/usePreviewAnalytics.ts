import { useCallback, useRef, useEffect } from 'react';

interface AnalyticsEvent {
  previewId: string;
  eventType: 'view' | 'interaction' | 'copy' | 'sandbox_open' | 'preview_load' | 'playground_edit';
  metadata?: Record<string, any>;
  timestamp: Date;
}

export function usePreviewAnalytics(previewId: string) {
  const startTimeRef = useRef<Date>(new Date());
  const viewTrackedRef = useRef(false);

  const sendAnalyticsEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/preview/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }, []);

  const trackView = useCallback(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    
    sendAnalyticsEvent({
      previewId,
      eventType: 'view',
      timestamp: new Date()
    });
  }, [previewId, sendAnalyticsEvent]);

  const trackInteraction = useCallback(
    debounce((interactionType: string) => {
      sendAnalyticsEvent({
        previewId,
        eventType: 'interaction',
        metadata: { type: interactionType },
        timestamp: new Date()
      });
    }, 1000),
    [previewId, sendAnalyticsEvent]
  );

  const trackCopy = useCallback(() => {
    sendAnalyticsEvent({
      previewId,
      eventType: 'copy',
      timestamp: new Date()
    });
  }, [previewId, sendAnalyticsEvent]);

  const trackTimeSpent = useCallback(() => {
    const timeSpent = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
    
    sendAnalyticsEvent({
      previewId,
      eventType: 'interaction',
      metadata: { 
        type: 'time_spent',
        seconds: timeSpent 
      },
      timestamp: new Date()
    });
  }, [previewId, sendAnalyticsEvent]);

  // Track time spent when component unmounts
  useEffect(() => {
    return () => {
      if (viewTrackedRef.current) {
        trackTimeSpent();
      }
    };
  }, [trackTimeSpent]);

  return {
    trackView,
    trackInteraction,
    trackCopy,
    trackTimeSpent
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}