import { z } from 'zod';

export const ComponentMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }),
  category: z.enum([
    'form',
    'table',
    'chart',
    'dashboard',
    'navigation',
    'layout',
    'feedback',
    'data-display',
    'data-entry',
    'utility',
  ]),
  frameworks: z.array(z.enum(['react', 'vue', 'angular', 'svelte', 'solid', 'qwik'])),
  tags: z.array(z.string()),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  license: z.string().default('MIT'),
  repository: z.string().url().optional(),
  homepage: z.string().url().optional(),
  downloads: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().default(0),
  premium: z.boolean().default(false),
  price: z.number().optional(),
  preview: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  factoryConfig: z.any().optional(),
});

export type ComponentMetadata = z.infer<typeof ComponentMetadataSchema>;

export interface SearchOptions {
  query?: string;
  category?: string;
  framework?: string;
  tags?: string[];
  sort?: 'downloads' | 'rating' | 'newest' | 'name';
  limit?: number;
  offset?: number;
  premium?: boolean;
}

export interface SearchResult {
  components: ComponentMetadata[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceConfig {
  apiUrl: string;
  apiKey?: string;
  cacheDir?: string;
  timeout?: number;
}

export interface InstallOptions {
  path?: string;
  overwrite?: boolean;
  dependencies?: boolean;
  dev?: boolean;
  registry?: string;
  offline?: boolean;
}

export interface PublishOptions {
  access?: 'public' | 'private';
  tag?: string;
  dryRun?: boolean;
  otp?: string;
}

export interface MarketplaceStats {
  totalComponents: number;
  totalDownloads: number;
  totalAuthors: number;
  categories: Record<string, number>;
  frameworks: Record<string, number>;
  topComponents: ComponentMetadata[];
  recentComponents: ComponentMetadata[];
}