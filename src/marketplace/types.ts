import { ComponentNode } from '../visual-builder/core/types';

export interface MarketplaceComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  price: number; // 0 for free
  premium: boolean;
  framework: string[];
  styling: string[];
  responsive: boolean;
  accessibility: boolean;
  thumbnail?: string;
  preview?: string;
  component: ComponentNode;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilter {
  category?: string;
  framework?: string;
  styling?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  author?: string;
  premium?: boolean;
  search?: string;
}

export interface MarketplaceSort {
  field: 'downloads' | 'rating' | 'price' | 'date' | 'name';
  direction: 'asc' | 'desc';
}

export interface ComponentReview {
  id: string;
  componentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  changelog: string;
  component: ComponentNode;
  createdAt: string;
}

export interface UserLibrary {
  userId: string;
  purchased: string[]; // Component IDs
  favorites: string[]; // Component IDs
  published: string[]; // Component IDs
}

export interface PublishOptions {
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  price: number;
  framework: string[];
  styling: string[];
  license: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'Proprietary';
  documentation?: string;
  demoUrl?: string;
}