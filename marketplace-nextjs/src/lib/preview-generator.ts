import { ComponentNode } from '@/../../../../src/visual-builder/core/types';
import { FactoryExporter } from '@/../../../../src/visual-builder/exporters/factory-exporter';

export class PreviewGenerator {
  private exporter: FactoryExporter;

  constructor() {
    this.exporter = new FactoryExporter();
  }

  /**
   * Generate a preview HTML for a component
   */
  generatePreviewHTML(component: ComponentNode): string {
    const code = this.exporter.export([component], {
      format: 'code',
      framework: 'react',
      styling: 'tailwind',
      typescript: false,
      prettier: false,
      includeImports: false,
    });

    // Wrap in a basic HTML template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
    }
    #root {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      padding: 20px;
      min-height: 200px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    
    const App = () => {
      return <GeneratedComponent />;
    };
    
    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
    `;
  }

  /**
   * Generate a static preview image URL (placeholder)
   * In production, this would use a headless browser to capture screenshots
   */
  generatePreviewImage(component: ComponentNode): string {
    // For now, return a placeholder
    // In production, use Puppeteer or similar to generate actual screenshots
    const params = new URLSearchParams({
      title: component.name || 'Component',
      subtitle: component.type,
      theme: 'light',
      pattern: 'dots',
    });
    
    return `https://og-image.vercel.app/**${encodeURIComponent(component.name || 'Component')}**.png?${params}`;
  }

  /**
   * Generate component documentation
   */
  generateDocumentation(component: ComponentNode): string {
    const props = component.props || {};
    const propList = Object.entries(props)
      .map(([key, value]) => `- **${key}**: ${typeof value} (default: ${JSON.stringify(value)})`)
      .join('\n');

    return `# ${component.name || 'Component'}

## Description
${component.description || 'A reusable UI component.'}

## Type
\`${component.type}\`

## Props
${propList || 'No configurable props.'}

## Usage
\`\`\`jsx
import { ${component.name || 'Component'} } from '@your-library/components';

<${component.name || 'Component'} />
\`\`\`

## Customization
This component can be customized using the following methods:
- Props: Pass different prop values to change behavior
- Styling: Override CSS classes or use CSS-in-JS
- Composition: Wrap or extend the component

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
`;
  }

  /**
   * Generate component metadata for SEO and sharing
   */
  generateMetadata(component: ComponentNode) {
    return {
      title: component.name || 'UI Component',
      description: component.description || 'A reusable UI component for modern web applications',
      keywords: [
        component.type,
        'ui component',
        'react component',
        'vue component',
        'web component',
        ...(component.tags || [])
      ],
      author: component.author?.name || 'Anonymous',
      image: this.generatePreviewImage(component),
      type: 'software.component',
      price: component.price || 0,
      currency: 'USD',
    };
  }
}