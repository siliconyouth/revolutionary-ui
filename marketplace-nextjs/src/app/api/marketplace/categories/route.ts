import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get categories with component counts
    const categories = await prisma.marketplaceComponent.groupBy({
      by: ['category'],
      where: {
        published: true
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    // Category metadata
    const categoryMetadata: Record<string, { name: string; icon: string }> = {
      'layout': { name: 'Layout', icon: '📐' },
      'navigation': { name: 'Navigation', icon: '🧭' },
      'forms': { name: 'Forms', icon: '📝' },
      'data-display': { name: 'Data Display', icon: '📊' },
      'feedback': { name: 'Feedback', icon: '💬' },
      'media': { name: 'Media', icon: '🖼️' },
      'ecommerce': { name: 'E-commerce', icon: '🛍️' },
      'social': { name: 'Social', icon: '👥' },
      'other': { name: 'Other', icon: '📦' }
    };

    // Transform data
    const transformedCategories = categories.map(cat => ({
      id: cat.category,
      name: categoryMetadata[cat.category]?.name || cat.category,
      icon: categoryMetadata[cat.category]?.icon || '📦',
      count: cat._count.category
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}