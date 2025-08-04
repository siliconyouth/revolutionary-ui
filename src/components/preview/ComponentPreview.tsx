import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Code, 
  Play, 
  Copy, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  Download,
  Eye,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { ComponentPreviewType, PreviewVariation } from '../../types/preview';
import PreviewIframe from './PreviewIframe';
import CodeBlock from './CodeBlock';
import PreviewControls from './PreviewControls';
import { usePreviewAnalytics } from '../../hooks/usePreviewAnalytics';

interface ComponentPreviewProps {
  preview: ComponentPreviewType;
  resourceName: string;
  onOpenSandbox?: () => void;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

const viewModeConfig = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone }
};

export default function ComponentPreview({ 
  preview, 
  resourceName,
  onOpenSandbox 
}: ComponentPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'playground'>('preview');
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    preview.variations?.find(v => v.isDefault)?.id || null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isCopied, setIsCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { trackView, trackInteraction, trackCopy } = usePreviewAnalytics(preview.id);

  useEffect(() => {
    trackView();
  }, [preview.id]);

  const handleCopyCode = async () => {
    const code = getActiveCode();
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    trackCopy();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenSandbox = () => {
    trackInteraction('sandbox_open');
    onOpenSandbox?.();
  };

  const getActiveCode = () => {
    if (selectedVariation) {
      const variation = preview.variations?.find(v => v.id === selectedVariation);
      return variation?.codeSnippet || preview.exampleCode || '';
    }
    return preview.exampleCode || '';
  };

  const getPreviewUrl = () => {
    if (selectedVariation) {
      const variation = preview.variations?.find(v => v.id === selectedVariation);
      if (variation?.screenshotUrl) return variation.screenshotUrl;
    }
    return preview.previewUrl;
  };

  return (
    <Card className={`component-preview ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="preview-header p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{resourceName}</h3>
            <Badge variant="outline">{preview.exampleFramework}</Badge>
            {preview.isInteractive && <Badge variant="secondary">Interactive</Badge>}
          </div>
          
          <div className="flex items-center gap-2">
            {preview.variations && preview.variations.length > 1 && (
              <select 
                value={selectedVariation || ''}
                onChange={(e) => setSelectedVariation(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="">Default</option>
                {preview.variations.map(variation => (
                  <option key={variation.id} value={variation.id}>
                    {variation.name}
                  </option>
                ))}
              </select>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="w-4 h-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger value="playground">
            <Play className="w-4 h-4 mr-2" />
            Playground
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-0">
          <div className="preview-viewport" ref={previewRef}>
            {preview.isResponsive && (
              <div className="viewport-controls p-3 border-b bg-gray-50 flex items-center gap-2">
                {Object.entries(viewModeConfig).map(([mode, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(mode as ViewMode)}
                    >
                      <Icon size={16} />
                    </Button>
                  );
                })}
              </div>
            )}
            
            <div 
              className="preview-container p-4 bg-gray-100 flex justify-center"
              style={{ minHeight: `${preview.previewHeight}px` }}
            >
              <div 
                className="preview-frame bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                style={{ 
                  width: viewModeConfig[viewMode].width,
                  maxWidth: '100%'
                }}
              >
                {preview.previewType === 'live' || preview.previewType === 'sandbox' ? (
                  <PreviewIframe
                    url={getPreviewUrl() || ''}
                    height={preview.previewHeight}
                    onLoad={() => trackInteraction('preview_load')}
                  />
                ) : preview.previewType === 'static' ? (
                  <img 
                    src={preview.screenshotUrl || ''} 
                    alt={`${resourceName} preview`}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Preview not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-0">
          <div className="code-view">
            <div className="code-toolbar p-3 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge>{preview.exampleFramework}</Badge>
                {preview.bundleSizeKb && (
                  <span className="text-sm text-gray-500">
                    Bundle size: {preview.bundleSizeKb}KB
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                >
                  <Copy size={16} className="mr-2" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
                
                {preview.sandboxTemplate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenSandbox}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open in Sandbox
                  </Button>
                )}
              </div>
            </div>
            
            <div className="code-content">
              <CodeBlock
                code={getActiveCode()}
                language={preview.exampleFramework}
                showLineNumbers
              />
              
              {preview.exampleDependencies && (
                <div className="dependencies p-4 border-t bg-gray-50">
                  <h4 className="text-sm font-semibold mb-2">Dependencies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(preview.exampleDependencies).map(([pkg, version]) => (
                      <Badge key={pkg} variant="outline">
                        {pkg}@{version}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="playground" className="mt-0">
          <div className="playground-view p-4">
            {preview.playgroundTemplate ? (
              <PreviewControls
                template={preview.playgroundTemplate}
                onCodeChange={(code) => trackInteraction('playground_edit')}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Play size={48} className="mx-auto mb-4 opacity-50" />
                <p>Interactive playground not available for this component</p>
                {preview.sandboxTemplate && (
                  <Button
                    className="mt-4"
                    onClick={handleOpenSandbox}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open in External Sandbox
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}