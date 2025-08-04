import { NextRequest, NextResponse } from 'next/server';
import { R2MonitoringService } from '@/services/r2-monitoring-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const monitoringService = R2MonitoringService.getInstance();

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'dashboard';

    let data;
    switch (type) {
      case 'storage':
        data = await monitoringService.getStorageMetrics();
        break;
      case 'access':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        data = await monitoringService.getAccessMetrics(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      case 'health':
        data = await monitoringService.checkHealth();
        break;
      case 'alerts':
        data = await monitoringService.checkAlerts();
        break;
      case 'dashboard':
      default:
        data = await monitoringService.getDashboardData();
        break;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to get monitoring data' },
      { status: 500 }
    );
  }
}