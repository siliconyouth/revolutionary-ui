// API Route: Check feature access
// Returns whether user has access to a specific feature

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { SubscriptionService } from '../../../../../src/services/subscription-service';
import { FeatureFlag } from '../../../../../src/types/subscription';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { feature } = req.query;
    
    if (!feature || typeof feature !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Feature parameter is required'
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
    
    // Check feature access
    const access = await SubscriptionService.hasFeatureAccess(
      session.user.id,
      feature as FeatureFlag
    );
    
    res.status(200).json(access);
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check feature access'
    });
  }
}