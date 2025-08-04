// API Route: Check usage limit
// Returns current usage and limit for a specific metric

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { SubscriptionService } from '../../../../../src/services/subscription-service';
import { TierLimits } from '../../../../../src/types/subscription';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { metric } = req.query;
    
    if (!metric || typeof metric !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Metric parameter is required'
      });
    }
    
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Check usage limit
    const limitCheck = await SubscriptionService.checkLimit(
      session.user.id,
      metric as keyof TierLimits
    );
    
    res.status(200).json(limitCheck);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check usage limit'
    });
  }
}