import { 
  MarketplaceComponent, 
  MarketplaceFilter, 
  MarketplaceSort,
  ComponentReview,
  ComponentVersion,
  UserLibrary,
  PublishOptions
} from '../types';
import { ComponentNode } from '../../visual-builder/core/types';

export class MarketplaceService {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string = '/api/marketplace', apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Search and filter marketplace components
   */
  async searchComponents(
    filter: MarketplaceFilter = {},
    sort: MarketplaceSort = { field: 'downloads', direction: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    components: MarketplaceComponent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params: Record<string, string> = {
      sortField: sort.field,
      sortDirection: sort.direction,
      page: page.toString(),
      limit: limit.toString(),
    };

    if (filter.category) params.category = filter.category;
    if (filter.framework) params.framework = filter.framework;
    if (filter.styling) params.styling = filter.styling;
    if (filter.priceRange) {
      params.priceRangeMin = filter.priceRange.min.toString();
      params.priceRangeMax = filter.priceRange.max.toString();
    }
    if (filter.rating) params.rating = filter.rating.toString();
    if (filter.author) params.author = filter.author;
    if (filter.premium) params.premium = filter.premium.toString();
    if (filter.search) params.search = filter.search;

    const response = await this.fetch(`${this.apiUrl}/components?${new URLSearchParams(params)}`);
    return response.json();
  }

  /**
   * Get a specific component by ID
   */
  async getComponent(componentId: string): Promise<MarketplaceComponent> {
    const response = await this.fetch(`${this.apiUrl}/components/${componentId}`);
    return response.json();
  }

  /**
   * Get component reviews
   */
  async getComponentReviews(
    componentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: ComponentReview[];
    total: number;
  }> {
    const response = await this.fetch(
      `${this.apiUrl}/components/${componentId}/reviews?page=${page}&limit=${limit}`
    );
    return response.json();
  }

  /**
   * Add a review to a component
   */
  async addReview(
    componentId: string,
    rating: number,
    comment: string
  ): Promise<ComponentReview> {
    const response = await this.fetch(
      `${this.apiUrl}/components/${componentId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      }
    );
    return response.json();
  }

  /**
   * Get component version history
   */
  async getComponentVersions(componentId: string): Promise<ComponentVersion[]> {
    const response = await this.fetch(
      `${this.apiUrl}/components/${componentId}/versions`
    );
    return response.json();
  }

  /**
   * Download/purchase a component
   */
  async downloadComponent(componentId: string): Promise<{
    component: ComponentNode;
    license: string;
  }> {
    const response = await this.fetch(
      `${this.apiUrl}/components/${componentId}/download`,
      { method: 'POST' }
    );
    return response.json();
  }

  /**
   * Publish a component to the marketplace
   */
  async publishComponent(
    component: ComponentNode,
    options: PublishOptions
  ): Promise<MarketplaceComponent> {
    const response = await this.fetch(`${this.apiUrl}/components/publish`, {
      method: 'POST',
      body: JSON.stringify({ component, ...options }),
    });
    return response.json();
  }

  /**
   * Update a published component
   */
  async updateComponent(
    componentId: string,
    component: ComponentNode,
    changelog: string
  ): Promise<MarketplaceComponent> {
    const response = await this.fetch(
      `${this.apiUrl}/components/${componentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ component, changelog }),
      }
    );
    return response.json();
  }

  /**
   * Get user's library (purchased, favorites, published)
   */
  async getUserLibrary(): Promise<UserLibrary> {
    const response = await this.fetch(`${this.apiUrl}/user/library`);
    return response.json();
  }

  /**
   * Add component to favorites
   */
  async addToFavorites(componentId: string): Promise<void> {
    await this.fetch(`${this.apiUrl}/user/favorites/${componentId}`, {
      method: 'POST',
    });
  }

  /**
   * Remove component from favorites
   */
  async removeFromFavorites(componentId: string): Promise<void> {
    await this.fetch(`${this.apiUrl}/user/favorites/${componentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get featured components
   */
  async getFeaturedComponents(): Promise<MarketplaceComponent[]> {
    const response = await this.fetch(`${this.apiUrl}/components/featured`);
    return response.json();
  }

  /**
   * Get trending components
   */
  async getTrendingComponents(
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<MarketplaceComponent[]> {
    const response = await this.fetch(
      `${this.apiUrl}/components/trending?period=${period}`
    );
    return response.json();
  }

  /**
   * Get component categories
   */
  async getCategories(): Promise<Array<{
    id: string;
    name: string;
    count: number;
    icon: string;
  }>> {
    const response = await this.fetch(`${this.apiUrl}/categories`);
    return response.json();
  }

  /**
   * Helper method for authenticated fetch
   */
  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Marketplace API error: ${response.statusText}`);
    }

    return response;
  }
}

// Singleton instance
let marketplaceService: MarketplaceService | null = null;

export function getMarketplaceService(apiKey?: string): MarketplaceService {
  if (!marketplaceService) {
    marketplaceService = new MarketplaceService('/api/marketplace', apiKey);
  }
  return marketplaceService;
}