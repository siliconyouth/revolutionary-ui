/**
 * Documentation Integration - Fetches and processes framework documentation
 */

import type {
  FrameworkDoc,
  BestPractice,
  APIReference,
  CodeExample,
} from './types';

interface DocumentationResult {
  framework: string;
  topic: string;
  sections: DocumentationSection[];
  codeExamples: CodeExample[];
  bestPractices: BestPractice[];
  apiReferences: APIReference[];
}

interface DocumentationSection {
  title: string;
  content: string;
  url?: string;
  examples?: CodeExample[];
}

interface DocUrls {
  base: string;
  patterns?: string;
  hooks?: string;
  components?: string;
  performance?: string;
  composition?: string;
  [key: string]: string | undefined;
}

export class DocumentationIntegration {
  private documentationUrls: Record<string, DocUrls> = {
    react: {
      base: 'https://react.dev',
      patterns: 'https://react.dev/learn',
      hooks: 'https://react.dev/reference/react',
      components: 'https://react.dev/learn/your-first-component',
      performance: 'https://react.dev/learn/render-and-commit',
    },
    vue: {
      base: 'https://vuejs.org',
      patterns: 'https://vuejs.org/guide',
      composition: 'https://vuejs.org/guide/extras/composition-api-faq',
      components: 'https://vuejs.org/guide/essentials/component-basics',
      performance: 'https://vuejs.org/guide/best-practices/performance',
    },
    angular: {
      base: 'https://angular.io',
      patterns: 'https://angular.io/guide',
      components: 'https://angular.io/guide/component-overview',
      performance: 'https://angular.io/guide/performance',
    },
    svelte: {
      base: 'https://svelte.dev',
      patterns: 'https://svelte.dev/docs',
      components: 'https://svelte.dev/docs/svelte-components',
      performance: 'https://svelte.dev/docs/svelte-compiler',
    },
  };

  /**
   * Fetch framework documentation for a specific topic
   */
  async fetchFrameworkDocs(
    framework: string,
    topic: string
  ): Promise<DocumentationResult> {
    console.log(`📚 Fetching ${framework} documentation for ${topic}...`);

    try {
      const docUrls = this.getDocumentationUrls(framework);
      
      // Since we can't actually use Firecrawl (it would need to be imported),
      // we'll simulate the documentation fetching with structured data
      const sections = await this.fetchDocumentationSections(framework, topic, docUrls);
      const codeExamples = this.extractCodeExamples(sections);
      const bestPractices = this.extractBestPractices(framework, topic, sections);
      const apiReferences = this.extractAPIReferences(framework, topic);

      console.log(`   Found ${sections.length} documentation sections`);
      console.log(`   Extracted ${codeExamples.length} code examples`);
      console.log(`   Found ${bestPractices.length} best practices`);

      return {
        framework,
        topic,
        sections,
        codeExamples,
        bestPractices,
        apiReferences,
      };
    } catch (error) {
      console.warn('Error fetching documentation:', error);
      return this.getFallbackDocumentation(framework, topic);
    }
  }

  /**
   * Get documentation URLs for a framework
   */
  private getDocumentationUrls(framework: string): DocUrls {
    return this.documentationUrls[framework.toLowerCase()] || this.documentationUrls.react;
  }

  /**
   * Fetch documentation sections
   */
  private async fetchDocumentationSections(
    framework: string,
    topic: string,
    urls: DocUrls
  ): Promise<DocumentationSection[]> {
    // In a real implementation, this would use Firecrawl to fetch actual documentation
    // For now, we'll provide comprehensive documentation based on the topic
    const sections: DocumentationSection[] = [];

    // Component-specific documentation
    if (topic.includes('form')) {
      sections.push(...this.getFormDocumentation(framework));
    } else if (topic.includes('table')) {
      sections.push(...this.getTableDocumentation(framework));
    } else if (topic.includes('modal')) {
      sections.push(...this.getModalDocumentation(framework));
    } else if (topic.includes('navigation')) {
      sections.push(...this.getNavigationDocumentation(framework));
    } else {
      sections.push(...this.getGeneralDocumentation(framework));
    }

    return sections;
  }

  /**
   * Get form-specific documentation
   */
  private getFormDocumentation(framework: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    switch (framework.toLowerCase()) {
      case 'react':
        sections.push({
          title: 'Controlled Components',
          content: `In React, form elements typically use controlled components where form data is handled by React state.`,
          url: 'https://react.dev/reference/react-dom/components/input',
          examples: [{
            code: `const [value, setValue] = useState('');
<input value={value} onChange={(e) => setValue(e.target.value)} />`,
            language: 'tsx',
            description: 'Controlled input example',
          }],
        });
        sections.push({
          title: 'Form Validation',
          content: `Implement validation using state and conditional rendering for error messages.`,
          examples: [{
            code: `const [errors, setErrors] = useState({});
const validate = (values) => {
  const errors = {};
  if (!values.email) errors.email = 'Required';
  return errors;
};`,
            language: 'tsx',
            description: 'Basic validation pattern',
          }],
        });
        break;

      case 'vue':
        sections.push({
          title: 'v-model for Two-Way Binding',
          content: `Vue provides v-model directive for easy two-way data binding on form elements.`,
          url: 'https://vuejs.org/guide/essentials/forms',
          examples: [{
            code: `<template>
  <input v-model="message" />
</template>
<script setup>
import { ref } from 'vue'
const message = ref('')
</script>`,
            language: 'vue',
            description: 'v-model example',
          }],
        });
        break;

      case 'angular':
        sections.push({
          title: 'Reactive Forms',
          content: `Angular's reactive forms provide a model-driven approach to handling form inputs.`,
          url: 'https://angular.io/guide/reactive-forms',
          examples: [{
            code: `import { FormBuilder, Validators } from '@angular/forms';
profileForm = this.fb.group({
  firstName: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});`,
            language: 'ts',
            description: 'Reactive form example',
          }],
        });
        break;
    }

    return sections;
  }

  /**
   * Get table-specific documentation
   */
  private getTableDocumentation(framework: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    sections.push({
      title: 'Data Table Best Practices',
      content: `Tables should be responsive, accessible, and performant. Consider virtualization for large datasets.`,
      examples: [{
        code: `// Use semantic HTML
<table role="table">
  <thead>
    <tr role="row">
      <th role="columnheader">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">Data</td>
    </tr>
  </tbody>
</table>`,
        language: 'html',
        description: 'Accessible table structure',
      }],
    });

    if (framework === 'react') {
      sections.push({
        title: 'Optimizing Table Performance',
        content: `For large datasets, use virtualization libraries like react-window or react-virtualized.`,
        examples: [{
          code: `import { FixedSizeList } from 'react-window';
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>`,
          language: 'tsx',
          description: 'Virtual scrolling example',
        }],
      });
    }

    return sections;
  }

  /**
   * Get modal-specific documentation
   */
  private getModalDocumentation(framework: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    sections.push({
      title: 'Modal Accessibility',
      content: `Modals require careful attention to accessibility including focus management, keyboard navigation, and ARIA attributes.`,
      examples: [{
        code: `// Focus trap example
useEffect(() => {
  const previousFocus = document.activeElement;
  modalRef.current?.focus();
  
  return () => {
    previousFocus?.focus();
  };
}, []);`,
        language: 'tsx',
        description: 'Focus management pattern',
      }],
    });

    sections.push({
      title: 'Portal Pattern',
      content: `Render modals outside the DOM hierarchy to avoid z-index issues.`,
      examples: [{
        code: framework === 'react' 
          ? `import { createPortal } from 'react-dom';
return createPortal(
  <div className="modal">{children}</div>,
  document.body
);`
          : `// Vue example
<Teleport to="body">
  <div class="modal">{{ content }}</div>
</Teleport>`,
        language: framework === 'react' ? 'tsx' : 'vue',
        description: 'Portal/Teleport pattern',
      }],
    });

    return sections;
  }

  /**
   * Get navigation-specific documentation
   */
  private getNavigationDocumentation(framework: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    sections.push({
      title: 'Navigation Accessibility',
      content: `Navigation components should be keyboard accessible and properly marked up with ARIA landmarks.`,
      examples: [{
        code: `<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <a href="/" aria-current="page">Home</a>
    </li>
  </ul>
</nav>`,
        language: 'html',
        description: 'Accessible navigation markup',
      }],
    });

    return sections;
  }

  /**
   * Get general component documentation
   */
  private getGeneralDocumentation(framework: string): DocumentationSection[] {
    const sections: DocumentationSection[] = [];

    sections.push({
      title: 'Component Best Practices',
      content: `Follow framework conventions for component structure, naming, and organization.`,
      url: this.documentationUrls[framework]?.components,
    });

    sections.push({
      title: 'Performance Optimization',
      content: `Optimize rendering performance using framework-specific techniques.`,
      url: this.documentationUrls[framework]?.performance,
    });

    return sections;
  }

  /**
   * Extract code examples from sections
   */
  private extractCodeExamples(sections: DocumentationSection[]): CodeExample[] {
    const examples: CodeExample[] = [];

    sections.forEach(section => {
      if (section.examples) {
        examples.push(...section.examples);
      }
    });

    return examples;
  }

  /**
   * Extract best practices
   */
  private extractBestPractices(
    framework: string,
    topic: string,
    sections: DocumentationSection[]
  ): BestPractice[] {
    const practices: BestPractice[] = [];

    // Framework-specific best practices
    switch (framework.toLowerCase()) {
      case 'react':
        practices.push(
          {
            title: 'Use Functional Components',
            description: 'Prefer functional components with hooks over class components',
            framework: 'react',
            category: topic,
            examples: ['const MyComponent = () => { ... }'],
          },
          {
            title: 'Optimize Re-renders',
            description: 'Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders',
            framework: 'react',
            category: topic,
            examples: ['const MemoizedComponent = React.memo(MyComponent)'],
          }
        );
        break;

      case 'vue':
        practices.push(
          {
            title: 'Use Composition API',
            description: 'Prefer Composition API for better TypeScript support and code organization',
            framework: 'vue',
            category: topic,
            examples: ['<script setup>...</script>'],
          },
          {
            title: 'Computed Properties',
            description: 'Use computed properties for derived state instead of methods',
            framework: 'vue',
            category: topic,
            examples: ['const fullName = computed(() => firstName.value + lastName.value)'],
          }
        );
        break;

      case 'angular':
        practices.push(
          {
            title: 'OnPush Change Detection',
            description: 'Use OnPush change detection strategy for better performance',
            framework: 'angular',
            category: topic,
            examples: ['changeDetection: ChangeDetectionStrategy.OnPush'],
          },
          {
            title: 'TrackBy Functions',
            description: 'Always use trackBy functions with *ngFor for better performance',
            framework: 'angular',
            category: topic,
            examples: ['*ngFor="let item of items; trackBy: trackByFn"'],
          }
        );
        break;
    }

    // Topic-specific best practices
    if (topic.includes('form')) {
      practices.push({
        title: 'Form Validation',
        description: 'Implement both client-side and server-side validation',
        framework,
        category: 'form',
        examples: ['Validate on blur and submit'],
      });
    }

    if (topic.includes('table')) {
      practices.push({
        title: 'Virtual Scrolling',
        description: 'Use virtual scrolling for tables with many rows',
        framework,
        category: 'table',
        examples: ['Implement windowing for performance'],
      });
    }

    return practices;
  }

  /**
   * Extract API references
   */
  private extractAPIReferences(framework: string, topic: string): APIReference[] {
    const references: APIReference[] = [];

    // Add framework-specific API references
    switch (framework.toLowerCase()) {
      case 'react':
        if (topic.includes('form')) {
          references.push({
            name: 'onChange',
            description: 'Event handler for input changes',
            parameters: [{
              name: 'event',
              type: 'React.ChangeEvent<HTMLInputElement>',
              description: 'The change event',
              required: true,
            }],
            returnType: 'void',
            examples: ['onChange={(e) => setValue(e.target.value)}'],
          });
        }
        break;

      case 'vue':
        if (topic.includes('form')) {
          references.push({
            name: 'v-model',
            description: 'Two-way data binding directive',
            parameters: [{
              name: 'value',
              type: 'any',
              description: 'The bound value',
              required: true,
            }],
            returnType: 'void',
            examples: ['<input v-model="message">'],
          });
        }
        break;
    }

    return references;
  }

  /**
   * Get fallback documentation if fetching fails
   */
  private getFallbackDocumentation(framework: string, topic: string): DocumentationResult {
    return {
      framework,
      topic,
      sections: [{
        title: 'Component Guidelines',
        content: `Follow ${framework} best practices for ${topic} components.`,
      }],
      codeExamples: [],
      bestPractices: [{
        title: 'Use TypeScript',
        description: 'Always use TypeScript for type safety',
        framework,
        examples: [],
      }],
      apiReferences: [],
    };
  }

  /**
   * Search documentation for specific patterns
   */
  async searchDocumentationPatterns(
    framework: string,
    pattern: string
  ): Promise<DocumentationSection[]> {
    // This would use Firecrawl's search functionality
    console.log(`🔍 Searching ${framework} docs for pattern: ${pattern}`);
    
    // Return relevant sections based on pattern
    return [];
  }

  /**
   * Get performance optimization documentation
   */
  async getPerformanceDocumentation(framework: string): Promise<DocumentationResult> {
    return this.fetchFrameworkDocs(framework, 'performance');
  }

  /**
   * Get accessibility documentation
   */
  async getAccessibilityDocumentation(framework: string): Promise<DocumentationResult> {
    return this.fetchFrameworkDocs(framework, 'accessibility');
  }
}