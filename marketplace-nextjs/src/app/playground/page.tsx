'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { componentRegistry } from '@/config/factory-resources'
import { Code, Copy, Settings, Eye } from 'lucide-react'

// Dynamically import the JSON editor to avoid SSR issues
const JSONEditor = dynamic(() => import('react-json-editor-ajrm'), { ssr: false });
import locale from 'react-json-editor-ajrm/locale/en';


const FRAMEWORKS = [
  { id: 'react', name: 'React' },
  { id: 'vue', name: 'Vue' },
  { id: 'angular', name: 'Angular' },
  { id: 'svelte', name: 'Svelte' }
];

export default function PlaygroundPage() {
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [selectedComponentId, setSelectedComponentId] = useState(componentRegistry[0].id);
  const [config, setConfig] = useState({});
  const [generatedCode, setGeneratedCode] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedComponent = useMemo(() => {
    return componentRegistry.find(c => c.id === selectedComponentId) || componentRegistry[0];
  }, [selectedComponentId]);

  useEffect(() => {
    const newConfig = selectedComponent.defaultConfig;
    setConfig(newConfig);
    generateComponentCode(selectedFramework, selectedComponent, newConfig);
  }, [selectedComponent, selectedFramework]);

  const handleConfigChange = (newConfig: any) => {
    if (newConfig.jsObject) {
      setConfig(newConfig.jsObject);
      generateComponentCode(selectedFramework, selectedComponent, newConfig.jsObject);
    }
  };

  const generateComponentCode = (framework: string, component: any, currentConfig: any) => {
    const componentName = component.name.replace(/\s/g, '');
    const configString = JSON.stringify(currentConfig, null, 2)
      .slice(1, -1) // remove brackets
      .trim()
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n');

    let code = '';
    switch (framework) {
      case 'react':
        code = `import { setup } from 'revolutionary-ui';\n\nconst ui = setup();\n\nexport const ${componentName} = () => {\n  return ui.create${componentName}({\n${configString}\n  });\n};`;
        break;
      case 'vue':
        code = `<template>\n  <component :is="generatedComponent" />\n</template>\n\n<script setup>\nimport { shallowRef } from 'vue';\nimport { setup } from 'revolutionary-ui';\n\nconst ui = setup({ framework: 'vue' });\n\nconst generatedComponent = shallowRef(ui.create${componentName}({\n${configString}\n}));\n</script>`;
        break;
      case 'angular':
        code = `import { Component } from '@angular/core';\nimport { setup } from 'revolutionary-ui';\n\n@Component({\n  selector: 'app-${component.id}',\n  template: '<div id="container"></div>',\n})\nexport class ${componentName}Component {\n  ngAfterViewInit() {\n    const ui = setup({ framework: 'angular' });\n    const container = document.getElementById('container');\n    if (container) {\n      ui.create${componentName}({\n${configString}\n      }, container);\n    }\n  }\n}`;
        break;
      case 'svelte':
        code = `<script>\n  import { onMount } from 'svelte';\n  import { setup } from 'revolutionary-ui';\n\n  let container;\n  onMount(() => {\n    const ui = setup({ framework: 'svelte' });\n    ui.create${componentName}({\n${configString}\n    }, container);\n  });\n</script>\n\n<div bind:this={container}></div>`;
        break;
      default:
        code = 'Select a framework to see the code.';
    }
    setGeneratedCode(code);
  };
  
  const metrics = useMemo(() => {
    const factoryLines = generatedCode.split('\n').length;
    const traditional = selectedComponent.traditionalLines || 500;
    const reduction = Math.round(((traditional - factoryLines) / traditional) * 100);
    return { traditional, factory: factoryLines, reduction };
  }, [generatedCode, selectedComponent]);

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Interactive Playground</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Visually build components and generate production-ready code instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Settings className="mr-2" />Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium">Component</label>
                <Select value={selectedComponentId} onValueChange={setSelectedComponentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a component" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentRegistry.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-medium">Framework</label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAMEWORKS.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {isClient && (
                <JSONEditor
                  id="config-editor"
                  locale={locale}
                  placeholder={config}
                  onChange={handleConfigChange}
                  height="300px"
                  width="100%"
                  theme="light_mitsuketa_tribute"
                  colors={{
                    primitive: '#1E90FF', // DodgerBlue
                    string: '#3CB371', // MediumSeaGreen
                    number: '#DAA520', // GoldenRod
                    boolean: '#FF69B4', // HotPink
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Code & Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center"><Code className="mr-2" />Generated Code</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(generatedCode)}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <SyntaxHighlighter
                language={selectedFramework === 'vue' ? 'vue' : 'typescript'}
                style={vscDarkPlus}
                customStyle={{ borderRadius: '0.5rem', margin: 0 }}
                wrapLines={true}
                showLineNumbers={true}
              >
                {generatedCode}
              </SyntaxHighlighter>
              <div className="mt-4 text-sm text-center bg-secondary text-secondary-foreground p-2 rounded-md">
                <span className="font-bold text-lg">{metrics.reduction}%</span> Code Reduction ({metrics.traditional} lines vs {metrics.factory} lines)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2" />Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-4 min-h-[300px] bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p className="font-semibold">Live Preview Area</p>
                  <p className="text-sm">Component will be rendered here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}