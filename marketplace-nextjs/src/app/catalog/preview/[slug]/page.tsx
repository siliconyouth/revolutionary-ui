'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ComponentPreview from '@/components/preview/ComponentPreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Package, 
  Globe,
  Book,
  Star,
  Download,
  Code2
} from 'lucide-react';
import Link from 'next/link';
import { ComponentPreviewType } from '@/types/preview';

interface ResourceWithPreviews {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: {
    name: string;
    slug: string;
  };
  resourceType: {
    name: string;
  };
  githubUrl?: string;
  npmPackage?: string;
  websiteUrl?: string;
  documentationUrl?: string;
  githubStars: number;
  npmDownloads: number;
  isTypescript: boolean;
  license?: string;
  author?: string;
  previews: ComponentPreviewType[];
}

export default function CatalogPreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [resource, setResource] = useState<ResourceWithPreviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  useEffect(() => {
    fetchResource();
  }, [slug]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/catalog/resources/${slug}`);
      if (!response.ok) throw new Error('Resource not found');
      const data = await response.json();
      setResource(data);
      
      // Set default framework if previews exist
      if (data.previews.length > 0) {
        setSelectedFramework(data.previews[0].exampleFramework);
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInSandbox = async (preview: ComponentPreviewType) => {
    // Create sandbox based on preview type
    if (preview.sandboxTemplate === 'codesandbox') {
      const sandboxUrl = await createCodeSandbox(preview);
      window.open(sandboxUrl, '_blank');
    } else if (preview.sandboxTemplate === 'stackblitz') {
      const sandboxUrl = await createStackBlitz(preview);
      window.open(sandboxUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Component not found</h1>
        <Link href="/catalog">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const frameworks = [...new Set(resource.previews.map(p => p.exampleFramework))];
  const filteredPreviews = selectedFramework === 'all' 
    ? resource.previews 
    : resource.previews.filter(p => p.exampleFramework === selectedFramework);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/catalog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{resource.name}</h1>
            <p className="text-gray-600 text-lg mb-4">{resource.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{resource.category.name}</Badge>
              <Badge variant="secondary">{resource.resourceType.name}</Badge>
              {resource.isTypescript && <Badge className="bg-blue-500">TypeScript</Badge>}
              {resource.license && <Badge variant="outline">{resource.license}</Badge>}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              {resource.githubStars > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {resource.githubStars.toLocaleString()} stars
                </div>
              )}
              {resource.npmDownloads > 0 && (
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {resource.npmDownloads.toLocaleString()} downloads/month
                </div>
              )}
              {resource.author && (
                <div>By {resource.author}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {resource.githubUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={resource.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {resource.npmPackage && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://npmjs.com/package/${resource.npmPackage}`} target="_blank" rel="noopener noreferrer">
                  <Package className="w-4 h-4 mr-2" />
                  npm
                </a>
              </Button>
            )}
            {resource.websiteUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={resource.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            {resource.documentationUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={resource.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <Book className="w-4 h-4 mr-2" />
                  Docs
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Long Description */}
      {resource.longDescription && (
        <Card className="p-6 mb-8">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: resource.longDescription }} />
        </Card>
      )}

      {/* Framework Filter */}
      {frameworks.length > 1 && (
        <div className="mb-6">
          <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
            <TabsList>
              <TabsTrigger value="all">All Frameworks</TabsTrigger>
              {frameworks.map(framework => (
                <TabsTrigger key={framework} value={framework}>
                  {framework}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Previews */}
      <div className="space-y-6">
        {filteredPreviews.length > 0 ? (
          filteredPreviews.map(preview => (
            <ComponentPreview
              key={preview.id}
              preview={preview}
              resourceName={resource.name}
              onOpenSandbox={() => openInSandbox(preview)}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No previews available for this component yet.</p>
            {resource.githubUrl && (
              <Button variant="outline" className="mt-4" asChild>
                <a href={resource.githubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper functions for creating sandboxes
async function createCodeSandbox(preview: ComponentPreviewType) {
  const files = preview.sandboxFiles || [{
    name: 'App.tsx',
    content: preview.exampleCode || ''
  }];

  const sandbox = {
    files: files.reduce((acc, file) => ({
      ...acc,
      [file.name]: { content: file.content }
    }), {}),
    dependencies: preview.exampleDependencies || {},
    template: preview.sandboxTemplate || 'react-ts'
  };

  const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sandbox)
  });

  const data = await response.json();
  return `https://codesandbox.io/s/${data.sandbox_id}`;
}

async function createStackBlitz(preview: ComponentPreviewType) {
  // Implementation for StackBlitz
  // This would use StackBlitz SDK to create a project
  return 'https://stackblitz.com/edit/react-ts';
}