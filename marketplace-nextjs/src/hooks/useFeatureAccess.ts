// React Hook: useFeatureAccess
// Check feature access and usage limits on the client side

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FeatureFlag } from '../../../src/types/subscription';

interface FeatureAccessState {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
  reason?: string;
}

interface UsageLimitState {
  current: number;
  max: number;
  isWithinLimit: boolean;
  percentageUsed: number;
  loading: boolean;
  error: string | null;
}

interface SubscriptionInfo {
  tier: string | null;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  usage: Record<string, number>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeatureAccess(feature: FeatureFlag): FeatureAccessState {
  const { data: session, status } = useSession();
  const [state, setState] = useState<FeatureAccessState>({
    hasAccess: false,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    async function checkAccess() {
      if (status === 'loading') {
        return;
      }
      
      if (!session?.user) {
        setState({
          hasAccess: false,
          loading: false,
          error: null,
          reason: 'Not authenticated'
        });
        return;
      }
      
      try {
        const response = await fetch(`/api/subscription/check-feature?feature=${feature}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to check feature access');
        }
        
        setState({
          hasAccess: data.hasAccess,
          loading: false,
          error: null,
          reason: data.reason
        });
      } catch (error: any) {
        setState({
          hasAccess: false,
          loading: false,
          error: error.message,
          reason: 'Error checking feature access'
        });
      }
    }
    
    checkAccess();
  }, [feature, session, status]);
  
  return state;
}

/**
 * Hook to check usage limits
 */
export function useUsageLimit(metric: string): UsageLimitState {
  const { data: session, status } = useSession();
  const [state, setState] = useState<UsageLimitState>({
    current: 0,
    max: 0,
    isWithinLimit: true,
    percentageUsed: 0,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    async function checkLimit() {
      if (status === 'loading') {
        return;
      }
      
      if (!session?.user) {
        setState({
          current: 0,
          max: 0,
          isWithinLimit: false,
          percentageUsed: 0,
          loading: false,
          error: 'Not authenticated'
        });
        return;
      }
      
      try {
        const response = await fetch(`/api/subscription/check-limit?metric=${metric}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to check usage limit');
        }
        
        setState({
          current: data.current,
          max: data.max,
          isWithinLimit: data.isWithinLimit,
          percentageUsed: data.percentageUsed,
          loading: false,
          error: null
        });
      } catch (error: any) {
        setState({
          current: 0,
          max: 0,
          isWithinLimit: false,
          percentageUsed: 0,
          loading: false,
          error: error.message
        });
      }
    }
    
    checkLimit();
  }, [metric, session, status]);
  
  return state;
}

/**
 * Hook to get complete subscription information
 */
export function useSubscription(): SubscriptionInfo {
  const { data: session, status } = useSession();
  const [state, setState] = useState<SubscriptionInfo>({
    tier: null,
    features: {},
    limits: {},
    usage: {},
    loading: true,
    error: null
  });
  
  useEffect(() => {
    async function fetchSubscription() {
      if (status === 'loading') {
        return;
      }
      
      if (!session?.user) {
        setState({
          tier: null,
          features: {},
          limits: {},
          usage: {},
          loading: false,
          error: null
        });
        return;
      }
      
      try {
        const response = await fetch('/api/subscription/info');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch subscription info');
        }
        
        setState({
          tier: data.tier,
          features: data.features,
          limits: data.limits,
          usage: data.usage,
          loading: false,
          error: null
        });
      } catch (error: any) {
        setState({
          tier: null,
          features: {},
          limits: {},
          usage: {},
          loading: false,
          error: error.message
        });
      }
    }
    
    fetchSubscription();
  }, [session, status]);
  
  return state;
}

/**
 * Hook to check if user can perform an action
 */
export function useCanPerformAction(
  feature: FeatureFlag,
  metric?: string
): {
  canPerform: boolean;
  loading: boolean;
  error: string | null;
  reason?: string;
} {
  const featureAccess = useFeatureAccess(feature);
  const usageLimit = metric ? useUsageLimit(metric) : null;
  
  const loading = featureAccess.loading || (usageLimit?.loading ?? false);
  const error = featureAccess.error || usageLimit?.error || null;
  
  let canPerform = featureAccess.hasAccess;
  let reason = featureAccess.reason;
  
  if (canPerform && usageLimit && !usageLimit.isWithinLimit) {
    canPerform = false;
    reason = `Usage limit exceeded (${usageLimit.current}/${usageLimit.max})`;
  }
  
  return {
    canPerform,
    loading,
    error,
    reason
  };
}