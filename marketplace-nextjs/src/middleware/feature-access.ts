// Revolutionary UI - Feature Access Middleware
// Protects API routes based on subscription tier and feature flags

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { SubscriptionService } from '../../../src/services/subscription-service';
import { FeatureFlag } from '../../../src/types/subscription';

export interface FeatureProtectedRequest extends NextApiRequest {
  userId?: string;
  hasFeature?: boolean;
  subscription?: any;
}

/**
 * Middleware to check if user has access to a specific feature
 */
export function requireFeature(feature: FeatureFlag) {
  return async (
    req: FeatureProtectedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    try {
      // Get user session
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Check feature access
      const access = await SubscriptionService.hasFeatureAccess(
        session.user.id,
        feature
      );
      
      if (!access.hasAccess) {
        return res.status(403).json({
          error: 'Feature not available',
          message: access.reason || 'This feature is not available in your current plan',
          requiredFeature: feature,
          upgradeUrl: '/pricing'
        });
      }
      
      // Add user info to request
      req.userId = session.user.id;
      req.hasFeature = true;
      
      // Continue to next handler
      next();
    } catch (error) {
      console.error('Feature access middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check feature access'
      });
    }
  };
}

/**
 * Middleware to check usage limits
 */
export function requireWithinLimit(limit: string) {
  return async (
    req: FeatureProtectedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    try {
      // Get user session
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Check limit
      const limitCheck = await SubscriptionService.checkLimit(
        session.user.id,
        limit as any
      );
      
      if (!limitCheck.isWithinLimit) {
        return res.status(429).json({
          error: 'Usage limit exceeded',
          message: `You have exceeded your ${limit} limit`,
          limit: limitCheck.max,
          current: limitCheck.current,
          percentageUsed: limitCheck.percentageUsed,
          upgradeUrl: '/pricing'
        });
      }
      
      // Add user info to request
      req.userId = session.user.id;
      
      // Continue to next handler
      next();
    } catch (error) {
      console.error('Limit check middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to check usage limit'
      });
    }
  };
}

/**
 * Middleware to track and increment usage
 */
export function trackUsage(metric: string, amount: number = 1) {
  return async (
    req: FeatureProtectedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    try {
      // Get user session
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Track usage
      try {
        await SubscriptionService.incrementUsage(
          session.user.id,
          metric as any,
          amount
        );
      } catch (error: any) {
        if (error.message.includes('Usage limit exceeded')) {
          return res.status(429).json({
            error: 'Usage limit exceeded',
            message: error.message,
            metric,
            upgradeUrl: '/pricing'
          });
        }
        throw error;
      }
      
      // Add user info to request
      req.userId = session.user.id;
      
      // Continue to next handler
      next();
    } catch (error) {
      console.error('Usage tracking middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to track usage'
      });
    }
  };
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(...middlewares: Function[]) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let index = 0;
    
    const next = async () => {
      if (index >= middlewares.length) return;
      
      const middleware = middlewares[index++];
      await middleware(req, res, next);
    };
    
    await next();
  };
}

/**
 * Helper to create protected API route handler
 */
export function withFeatureAccess(
  feature: FeatureFlag,
  handler: (req: FeatureProtectedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await requireFeature(feature)(req as FeatureProtectedRequest, res, async () => {
      await handler(req as FeatureProtectedRequest, res);
    });
  };
}

/**
 * Helper to create rate-limited API route handler
 */
export function withUsageTracking(
  metric: string,
  handler: (req: FeatureProtectedRequest, res: NextApiResponse) => Promise<void>,
  amount: number = 1
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await combineMiddleware(
      requireWithinLimit(metric),
      trackUsage(metric, amount),
      handler
    )(req, res);
  };
}