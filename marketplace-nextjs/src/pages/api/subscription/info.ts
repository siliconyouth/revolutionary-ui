// API Route: Get subscription information
// Returns user's tier, features, limits, and current usage

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { SubscriptionService } from '../../../../../src/services/subscription-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Get subscription info
    const subscriptionInfo = await SubscriptionService.getUserAccessSummary(
      session.user.id
    );
    
    res.status(200).json(subscriptionInfo);
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch subscription information'
    });
  }
}