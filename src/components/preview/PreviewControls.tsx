import React, { useState, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Select } from '../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { PlaygroundTemplate, PropControl } from '../../types/preview';
import CodeEditor from './CodeEditor';
import PreviewIframe from './PreviewIframe';
import { Play, Code, Settings, RefreshCw } from 'lucide-react';

interface PreviewControlsProps {
  template: PlaygroundTemplate;
  onCodeChange?: (code: string) => void;
}

export default function PreviewControls({ 
  template, 
  onCodeChange 
}: PreviewControlsProps) {
  const [code, setCode] = useState(template.baseCode);
  const [props, setProps] = useState(template.baseProps || {});
  const [styles, setStyles] = useState(template.baseStyles || '');
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'props' | 'code' | 'styles'>('props');

  const handlePropChange = useCallback((propName: string, value: any) => {
    setProps(prev => ({ ...prev, [propName]: value }));
    regenerateCode();
  }, []);

  const regenerateCode = useCallback(() => {
    // Generate new code based on current props and template
    const newCode = generateCodeFromTemplate(template.baseCode, props, styles);
    setCode(newCode);
    onCodeChange?.(newCode);
    setPreviewKey(prev => prev + 1); // Force preview refresh
  }, [template.baseCode, props, styles, onCodeChange]);

  const renderPropControl = (propName: string, control: PropControl) => {
    const value = props[propName] ?? control.defaultValue;

    switch (control.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            placeholder={control.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handlePropChange(propName, Number(e.target.value))}
            min={control.min}
            max={control.max}
            step={control.step}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => handlePropChange(propName, checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handlePropChange(propName, val)}
          >
            {control.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'slider':
        return (
          <div className="flex items-center gap-3">
            <Slider
              value={[value]}
              onValueChange={([val]) => handlePropChange(propName, val)}
              min={control.min}
              max={control.max}
              step={control.step}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-12 text-right">
              {value}
            </span>
          </div>
        );

      case 'color':
        return (
          <input
            type="color"
            value={value}
            onChange={(e) => handlePropChange(propName, e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="playground-controls">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="controls-panel">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Component Controls</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={regenerateCode}
              >
                <RefreshCw size={16} className="mr-2" />
                Reset
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="props">
                  <Settings size={16} className="mr-2" />
                  Props
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code size={16} className="mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="styles">
                  <Play size={16} className="mr-2" />
                  Styles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="props" className="space-y-4 mt-4">
                {template.propControls && Object.entries(template.propControls).map(([propName, control]) => (
                  <div key={propName} className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>{control.label || propName}</span>
                      {control.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </Label>
                    {control.description && (
                      <p className="text-sm text-gray-500">{control.description}</p>
                    )}
                    {renderPropControl(propName, control)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <CodeEditor
                  code={code}
                  language={template.language || 'typescript'}
                  onChange={(newCode) => {
                    setCode(newCode);
                    onCodeChange?.(newCode);
                  }}
                  height={400}
                />
              </TabsContent>

              <TabsContent value="styles" className="mt-4">
                <CodeEditor
                  code={styles}
                  language="css"
                  onChange={(newStyles) => {
                    setStyles(newStyles);
                    regenerateCode();
                  }}
                  height={300}
                />
              </TabsContent>
            </Tabs>

            {template.themeOptions && template.themeOptions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Label>Theme</Label>
                <Select
                  value={props.theme || template.themeOptions[0].value}
                  onValueChange={(theme) => handlePropChange('theme', theme)}
                  className="mt-2"
                >
                  {template.themeOptions.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </Card>
        </div>

        <div className="preview-panel">
          <Card className="p-4">
            <h4 className="text-lg font-semibold mb-4">Live Preview</h4>
            <div className="preview-container bg-gray-50 rounded-lg p-4">
              <LivePreview
                key={previewKey}
                code={code}
                styles={styles}
                dependencies={template.requiredPackages}
                framework={template.framework}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate code from template
function generateCodeFromTemplate(
  baseCode: string,
  props: Record<string, any>,
  styles: string
): string {
  let code = baseCode;

  // Replace prop placeholders in the template
  Object.entries(props).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const replacement = typeof value === 'string' ? `"${value}"` : String(value);
    code = code.replace(new RegExp(placeholder, 'g'), replacement);
  });

  // Inject styles if needed
  if (styles) {
    code = code.replace('{{styles}}', styles);
  }

  return code;
}

// Live preview component
function LivePreview({ 
  code, 
  styles, 
  dependencies, 
  framework 
}: {
  code: string;
  styles: string;
  dependencies?: Record<string, string>;
  framework?: string;
}) {
  // In a real implementation, this would compile and render the code
  // For now, we'll show a placeholder
  return (
    <div className="live-preview">
      <div className="bg-white rounded p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500">
          Live preview would render here
        </p>
      </div>
      {styles && (
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      )}
    </div>
  );
}