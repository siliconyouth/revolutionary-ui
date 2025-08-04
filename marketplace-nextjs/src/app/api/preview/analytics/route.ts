import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AnalyticsEvent {
  previewId: string;
  eventType: 'view' | 'interaction' | 'copy' | 'sandbox_open' | 'preview_load' | 'playground_edit';
  metadata?: Record<string, any>;
  timestamp: Date;
}

// POST /api/preview/analytics - Track analytics events
export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();
    
    // Validate event
    if (!event.previewId || !event.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's analytics record
    const analytics = await prisma.previewAnalytics.upsert({
      where: {
        previewId_date: {
          previewId: event.previewId,
          date: today
        }
      },
      create: {
        previewId: event.previewId,
        date: today,
        viewCount: event.eventType === 'view' ? 1 : 0,
        interactionCount: event.eventType === 'interaction' ? 1 : 0,
        copyCount: event.eventType === 'copy' ? 1 : 0,
        sandboxOpens: event.eventType === 'sandbox_open' ? 1 : 0
      },
      update: {
        viewCount: event.eventType === 'view' 
          ? { increment: 1 } 
          : undefined,
        interactionCount: event.eventType === 'interaction' 
          ? { increment: 1 } 
          : undefined,
        copyCount: event.eventType === 'copy' 
          ? { increment: 1 } 
          : undefined,
        sandboxOpens: event.eventType === 'sandbox_open' 
          ? { increment: 1 } 
          : undefined
      }
    });

    // Handle specific event types
    if (event.eventType === 'preview_load' && event.metadata?.loadTime) {
      // Update average load time
      await updateAverageLoadTime(event.previewId, today, event.metadata.loadTime);
    }

    if (event.eventType === 'interaction' && event.metadata?.type === 'time_spent') {
      // Update average time spent
      await updateAverageTimeSpent(event.previewId, today, event.metadata.seconds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// GET /api/preview/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const previewId = searchParams.get('previewId');
    const resourceId = searchParams.get('resourceId');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where: any = {
      date: { gte: startDate }
    };

    if (previewId) {
      where.previewId = previewId;
    } else if (resourceId) {
      where.preview = { resourceId };
    }

    const analytics = await prisma.previewAnalytics.findMany({
      where,
      include: {
        preview: {
          select: {
            id: true,
            previewType: true,
            exampleFramework: true,
            resource: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Group by preview if multiple previews
    const grouped = analytics.reduce((acc, record) => {
      const key = record.previewId;
      if (!acc[key]) {
        acc[key] = {
          preview: record.preview,
          data: [],
          totals: {
            views: 0,
            interactions: 0,
            copies: 0,
            sandboxOpens: 0
          }
        };
      }
      
      acc[key].data.push(record);
      acc[key].totals.views += record.viewCount;
      acc[key].totals.interactions += record.interactionCount;
      acc[key].totals.copies += record.copyCount;
      acc[key].totals.sandboxOpens += record.sandboxOpens;
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      analytics: Object.values(grouped),
      period: { start: startDate, end: new Date(), days }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper functions
async function updateAverageLoadTime(previewId: string, date: Date, loadTime: number) {
  const current = await prisma.previewAnalytics.findUnique({
    where: { previewId_date: { previewId, date } }
  });

  if (current) {
    const newAvg = current.avgLoadTimeMs
      ? (current.avgLoadTimeMs + loadTime) / 2
      : loadTime;

    await prisma.previewAnalytics.update({
      where: { id: current.id },
      data: { avgLoadTimeMs: Math.round(newAvg) }
    });
  }
}

async function updateAverageTimeSpent(previewId: string, date: Date, seconds: number) {
  const current = await prisma.previewAnalytics.findUnique({
    where: { previewId_date: { previewId, date } }
  });

  if (current) {
    const newAvg = current.avgTimeSpentSeconds
      ? (current.avgTimeSpentSeconds + seconds) / 2
      : seconds;

    await prisma.previewAnalytics.update({
      where: { id: current.id },
      data: { avgTimeSpentSeconds: Math.round(newAvg) }
    });
  }
}