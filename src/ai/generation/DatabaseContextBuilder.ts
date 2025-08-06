/**
 * Database Context Builder - Queries Prisma/Supabase for context
 */

import { PrismaClient } from '@prisma/client';
import type {
  GenerationRequest,
  DatabaseContext,
  CategoryPattern,
  FrameworkConvention,
} from './types';

export class DatabaseContextBuilder {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Build comprehensive database context for generation
   */
  async buildContext(request: GenerationRequest): Promise<DatabaseContext> {
    const inferredCategory = this.inferCategory(request.prompt);
    const framework = request.framework || 'react';

    // Run all queries in parallel for performance
    const [
      similarComponents,
      popularTags,
      designSystems
    ] = await Promise.all([
      this.findSimilarComponents(inferredCategory, framework),
      this.getPopularTags(inferredCategory, framework),
      this.getDesignSystems(framework)
    ]);

    // Get patterns based on category
    const categoryPatterns = this.getCategoryPatterns(inferredCategory);
    const frameworkConventions = this.getFrameworkConventions(framework);

    return {
      similarComponents,
      categoryPatterns,
      frameworkConventions,
      popularTags,
      designSystems
    };
  }

  /**
   * Find similar components by category and framework
   */
  private async findSimilarComponents(category: string, framework: string) {
    try {
      const components = await this.prisma.resource.findMany({
        where: {
          category: {
            name: category
          },
          frameworks: {
            has: framework
          },
          isPublished: true,
          rating: { gte: 4.0 }
        },
        include: {
          category: true,
          tags: true,
          author: true,
          reviews: {
            orderBy: { rating: 'desc' },
            take: 5
          },
          _count: {
            select: {
              downloads: true,
              favorites: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { downloads: { _count: 'desc' } }
        ],
        take: 10
      });

      return components;
    } catch (error) {
      console.warn('Error fetching similar components:', error);
      return [];
    }
  }

  /**
   * Get popular tags for this category and framework
   */
  private async getPopularTags(category: string, framework: string) {
    try {
      const tags = await this.prisma.tag.findMany({
        where: {
          resources: {
            some: {
              category: { name: category },
              frameworks: { has: framework }
            }
          }
        },
        include: {
          _count: {
            select: { resources: true }
          }
        },
        orderBy: {
          resources: { _count: 'desc' }
        },
        take: 20
      });

      return tags;
    } catch (error) {
      console.warn('Error fetching popular tags:', error);
      return [];
    }
  }

  /**
   * Get design systems compatible with framework
   */
  private async getDesignSystems(framework: string) {
    // Since we don't have a design systems table yet, we'll return mock data
    // In production, this would query the actual design systems table
    return [
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        frameworks: ['react', 'vue', 'angular', 'svelte'],
        colorPalettes: [
          {
            name: 'default',
            colors: {
              primary: '#3b82f6',
              secondary: '#6366f1',
              accent: '#8b5cf6',
              neutral: '#6b7280',
              success: '#10b981',
              warning: '#f59e0b',
              error: '#ef4444'
            }
          }
        ],
        typographyScales: [
          {
            name: 'default',
            sizes: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem',
              '4xl': '2.25rem',
              '5xl': '3rem'
            },
            lineHeights: {
              tight: '1.25',
              normal: '1.5',
              relaxed: '1.75'
            },
            fontWeights: {
              normal: '400',
              medium: '500',
              semibold: '600',
              bold: '700'
            }
          }
        ],
        spacingSystems: [
          {
            base: 4,
            scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
          }
        ],
        componentTokens: []
      }
    ];
  }

  /**
   * Get category-specific patterns
   */
  private getCategoryPatterns(category: string): CategoryPattern[] {
    const patterns: Record<string, CategoryPattern> = {
      'Forms & Inputs': {
        category: 'Forms & Inputs',
        patterns: [
          'validation',
          'error-handling',
          'accessibility',
          'field-grouping',
          'progressive-disclosure'
        ],
        requiredFeatures: [
          'keyboard-navigation',
          'aria-labels',
          'error-states',
          'success-states',
          'loading-states'
        ]
      },
      'Data Display': {
        category: 'Data Display',
        patterns: [
          'pagination',
          'sorting',
          'filtering',
          'responsive-tables',
          'virtualization'
        ],
        requiredFeatures: [
          'loading-states',
          'empty-states',
          'error-boundaries',
          'data-formatting',
          'export-functionality'
        ]
      },
      'Navigation': {
        category: 'Navigation',
        patterns: [
          'mobile-responsive',
          'keyboard-shortcuts',
          'breadcrumbs',
          'active-states',
          'smooth-transitions'
        ],
        requiredFeatures: [
          'active-indicators',
          'hover-states',
          'focus-management',
          'aria-navigation',
          'mobile-menu'
        ]
      },
      'Marketing': {
        category: 'Marketing',
        patterns: [
          'animations',
          'cta-buttons',
          'social-proof',
          'hero-sections',
          'testimonials'
        ],
        requiredFeatures: [
          'seo-friendly',
          'performance-optimized',
          'conversion-focused',
          'responsive-images',
          'lazy-loading'
        ]
      },
      'Admin & Dashboard': {
        category: 'Admin & Dashboard',
        patterns: [
          'data-visualization',
          'real-time-updates',
          'filters',
          'exports',
          'role-based-ui'
        ],
        requiredFeatures: [
          'responsive-grid',
          'widget-system',
          'data-refresh',
          'notifications',
          'settings-panel'
        ]
      }
    };

    return [patterns[category] || this.getDefaultPattern(category)];
  }

  /**
   * Get framework-specific conventions
   */
  private getFrameworkConventions(framework: string): FrameworkConvention[] {
    const conventions: Record<string, FrameworkConvention> = {
      'react': {
        framework: 'react',
        conventions: [
          'functional-components',
          'hooks',
          'jsx',
          'props-interface',
          'memo-optimization'
        ],
        bestPractices: [
          'use-strict-typescript',
          'proper-key-props',
          'avoid-inline-functions',
          'use-semantic-html',
          'implement-error-boundaries'
        ]
      },
      'vue': {
        framework: 'vue',
        conventions: [
          'composition-api',
          'script-setup',
          'template-syntax',
          'reactive-refs',
          'computed-properties'
        ],
        bestPractices: [
          'use-typescript',
          'proper-v-key',
          'avoid-v-html',
          'component-naming',
          'prop-validation'
        ]
      },
      'angular': {
        framework: 'angular',
        conventions: [
          'component-decorator',
          'dependency-injection',
          'template-syntax',
          'reactive-forms',
          'observables'
        ],
        bestPractices: [
          'use-strict-typing',
          'unsubscribe-properly',
          'lazy-load-modules',
          'use-trackby',
          'avoid-any-type'
        ]
      },
      'svelte': {
        framework: 'svelte',
        conventions: [
          'reactive-declarations',
          'component-syntax',
          'stores',
          'actions',
          'transitions'
        ],
        bestPractices: [
          'use-typescript',
          'proper-bindings',
          'avoid-memory-leaks',
          'optimize-bundles',
          'accessibility-first'
        ]
      }
    };

    return [conventions[framework] || conventions['react']];
  }

  /**
   * Get default pattern for unknown categories
   */
  private getDefaultPattern(category: string): CategoryPattern {
    return {
      category,
      patterns: [
        'responsive-design',
        'accessibility',
        'performance',
        'user-experience',
        'modern-styling'
      ],
      requiredFeatures: [
        'mobile-first',
        'keyboard-support',
        'screen-reader-support',
        'loading-states',
        'error-handling'
      ]
    };
  }

  /**
   * Infer category from prompt
   */
  private inferCategory(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form') || lowercasePrompt.includes('input')) {
      return 'Forms & Inputs';
    }
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid') || lowercasePrompt.includes('list')) {
      return 'Data Display';
    }
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu') || lowercasePrompt.includes('breadcrumb')) {
      return 'Navigation';
    }
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog') || lowercasePrompt.includes('popup')) {
      return 'Overlays';
    }
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph') || lowercasePrompt.includes('analytics')) {
      return 'Data Visualization';
    }
    if (lowercasePrompt.includes('dashboard') || lowercasePrompt.includes('admin')) {
      return 'Admin & Dashboard';
    }
    if (lowercasePrompt.includes('hero') || lowercasePrompt.includes('landing') || lowercasePrompt.includes('cta')) {
      return 'Marketing';
    }
    
    return 'Layout';
  }

  /**
   * Analyze component patterns from database
   */
  async analyzeComponentPatterns(componentIds: string[]) {
    const components = await this.prisma.resource.findMany({
      where: {
        id: { in: componentIds }
      },
      include: {
        tags: true,
        category: true
      }
    });

    // Extract common patterns
    const tagFrequency = new Map<string, number>();
    const categoryFrequency = new Map<string, number>();

    components.forEach(component => {
      // Count tags
      component.tags.forEach(tag => {
        tagFrequency.set(tag.name, (tagFrequency.get(tag.name) || 0) + 1);
      });
      
      // Count categories
      categoryFrequency.set(
        component.category.name,
        (categoryFrequency.get(component.category.name) || 0) + 1
      );
    });

    return {
      commonTags: Array.from(tagFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag),
      commonCategories: Array.from(categoryFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category)
    };
  }

  /**
   * Get framework statistics
   */
  async getFrameworkStats(framework: string) {
    const stats = await this.prisma.resource.aggregate({
      where: {
        frameworks: { has: framework },
        isPublished: true
      },
      _count: true,
      _avg: {
        rating: true
      }
    });

    const topCategories = await this.prisma.category.findMany({
      where: {
        resources: {
          some: {
            frameworks: { has: framework },
            isPublished: true
          }
        }
      },
      include: {
        _count: {
          select: {
            resources: {
              where: {
                frameworks: { has: framework },
                isPublished: true
              }
            }
          }
        }
      },
      orderBy: {
        resources: {
          _count: 'desc'
        }
      },
      take: 5
    });

    return {
      totalComponents: stats._count,
      averageRating: stats._avg.rating || 0,
      topCategories: topCategories.map(cat => ({
        name: cat.name,
        count: cat._count.resources
      }))
    };
  }

  /**
   * Cleanup database connection
   */
  async cleanup() {
    await this.prisma.$disconnect();
  }
}