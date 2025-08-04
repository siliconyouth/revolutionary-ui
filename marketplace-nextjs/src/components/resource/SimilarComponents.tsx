'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SimilarResource {
  id: string;
  score: number;
  resource: {
    id: string;
    name: string;
    slug: string;
    description: string;
    framework?: string;
    category?: string;
    tags: string[];
    author: {
      name: string;
      image?: string;
    };
    downloads: number;
    reviews: number;
  };
}

interface SimilarComponentsProps {
  resourceId: string;
  limit?: number;
}

export function SimilarComponents({ resourceId, limit = 5 }: SimilarComponentsProps) {
  const [similar, setSimilar] = useState<SimilarResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resources/${resourceId}/similar?limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setSimilar(data.similar || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resourceId, limit]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        Similar Components
      </h3>

      <div className="space-y-3">
        {similar.map((item) => (
          <Link
            key={item.id}
            href={`/catalog/${item.resource.slug}`}
            className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1">
                  {item.resource.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {item.resource.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {item.resource.framework && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {item.resource.framework}
                    </span>
                  )}
                  <span>{item.resource.downloads} downloads</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {Math.round(item.score * 100)}% similar
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/search"
        className="block mt-4 text-center text-sm text-purple-600 dark:text-purple-400 hover:underline"
      >
        Discover more with AI search →
      </Link>
    </div>
  );
}