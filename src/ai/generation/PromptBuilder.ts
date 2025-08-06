/**
 * Prompt Builder - Builds enhanced prompts for AI generation
 */

import type {
  GenerationRequest,
  EnhancedGenerationContext,
  DatabaseContext,
  SearchContext,
  CodeContext,
  DocumentationContext,
} from './types';

export class PromptBuilder {
  /**
   * Build enhanced prompt with full context
   */
  buildEnhancedPrompt(fullContext: {
    request: GenerationRequest;
    context: EnhancedGenerationContext;
    similarComponents: any[];
    documentation: any;
    codePatterns: any[];
  }): string {
    const { request, context, similarComponents, documentation, codePatterns } = fullContext;

    const sections: string[] = [];

    // 1. Core request
    sections.push(this.buildCoreRequest(request));

    // 2. Similar components context
    if (similarComponents.length > 0) {
      sections.push(this.buildSimilarComponentsSection(similarComponents));
    }

    // 3. Code patterns context
    if (codePatterns.length > 0) {
      sections.push(this.buildCodePatternsSection(codePatterns));
    }

    // 4. Documentation context
    if (documentation) {
      sections.push(this.buildDocumentationSection(documentation));
    }

    // 5. Database insights
    sections.push(this.buildDatabaseInsights(context.database));

    // 6. Requirements and constraints
    sections.push(this.buildRequirementsSection(request));

    // 7. Quality standards
    sections.push(this.buildQualityStandards());

    return sections.join('\n\n---\n\n');
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context: EnhancedGenerationContext): string {
    const { database, search, code, documentation } = context;

    return `You are an advanced UI component generation specialist with access to a comprehensive knowledge base.

## Your Context:
- **Database**: ${database.similarComponents.length} similar components analyzed
- **Search**: ${search.vectorMatches.length} semantic matches, ${search.keywordMatches.length} keyword matches
- **Code Repository**: ${code.templates.length} templates available
- **Documentation**: ${documentation.officialDocs.length} documentation pages loaded

## Core Capabilities:
1. Generate production-ready components with TypeScript
2. Follow framework-specific best practices
3. Implement accessibility (WCAG 2.1 AA) by default
4. Apply performance optimizations automatically
5. Use design system tokens when available

## Generation Philosophy:
- **Data-Driven**: Base decisions on analyzed patterns from ${database.similarComponents.length} similar components
- **Framework-Native**: Follow ${documentation.officialDocs[0]?.framework || 'framework'} conventions strictly
- **Performance-First**: Apply optimizations from top-rated components
- **Accessibility-Complete**: Include all necessary ARIA attributes and keyboard support
- **Type-Safe**: Full TypeScript with no 'any' types

## Code Quality Standards:
- Strict TypeScript typing
- Comprehensive error handling
- Loading and error states
- Responsive design
- Clean, maintainable code
- Proper component composition

## Popular Patterns in This Category:
${database.categoryPatterns.map(p => `- ${p.patterns.join(', ')}`).join('\n')}

## Framework Conventions:
${database.frameworkConventions.map(c => `- ${c.framework}: ${c.conventions.join(', ')}`).join('\n')}

Remember to:
1. Match the style of high-rated components
2. Use established patterns from the codebase
3. Include all required features for the category
4. Follow the design system if specified
5. Optimize for both performance and maintainability`;
  }

  // Section builders

  private buildCoreRequest(request: GenerationRequest): string {
    return `## Component Request

**Prompt**: ${request.prompt}
**Framework**: ${request.framework || 'React'}
**Category**: ${request.category || 'General'}
${request.designSystem ? `**Design System**: ${request.designSystem}` : ''}

Please generate a ${request.framework || 'React'} component that fulfills this request.`;
  }

  private buildSimilarComponentsSection(components: any[]): string {
    const topComponents = components.slice(0, 3);
    
    return `## Similar High-Rated Components

Based on analysis of ${components.length} similar components, here are the top patterns:

${topComponents.map((comp, i) => `
### Example ${i + 1}: ${comp.title || comp.name} (Score: ${comp.score.toFixed(2)})
- **Tags**: ${(comp.tags || []).join(', ')}
- **Downloads**: ${comp.metadata?.downloads || 'N/A'}
- **Rating**: ${comp.metadata?.rating || 'N/A'}/5
- **Key Features**: ${this.extractKeyFeatures(comp)}
`).join('\n')}

Incorporate the best practices from these highly-rated components.`;
  }

  private buildCodePatternsSection(patterns: any[]): string {
    return `## Relevant Code Patterns

Found ${patterns.length} relevant templates and patterns:

${patterns.slice(0, 3).map((pattern, i) => `
### Pattern ${i + 1}: ${pattern.metadata?.description || 'Template'}
- **Framework**: ${pattern.metadata?.framework}
- **Category**: ${pattern.metadata?.category}
- **Dependencies**: ${(pattern.metadata?.dependencies || []).join(', ') || 'None'}

Key implementation details to consider from this pattern.
`).join('\n')}`;
  }

  private buildDocumentationSection(documentation: any): string {
    const bestPractices = documentation.bestPractices || [];
    const examples = documentation.examples || [];

    return `## Official Documentation Guidance

### Best Practices:
${bestPractices.slice(0, 5).map((practice: any) => `- ${practice.title || practice}`).join('\n')}

### Code Examples:
${examples.length} relevant examples found in official documentation.

Follow these official guidelines and patterns in your implementation.`;
  }

  private buildDatabaseInsights(database: DatabaseContext): string {
    const topTags = database.popularTags.slice(0, 10);
    const patterns = database.categoryPatterns[0];

    return `## Database Insights

### Popular Tags in This Category:
${topTags.map((tag: any) => `- ${tag.name} (${tag._count?.resources || 0} components)`).join('\n')}

### Required Features for ${patterns?.category || 'this category'}:
${(patterns?.requiredFeatures || []).map(f => `- ${f}`).join('\n')}

### Common Patterns:
${(patterns?.patterns || []).map(p => `- ${p}`).join('\n')}`;
  }

  private buildRequirementsSection(request: GenerationRequest): string {
    const requirements = request.requirements || {};
    const features = requirements.features || [];

    return `## Requirements and Constraints

### Technical Requirements:
- **TypeScript**: ${requirements.typescript ? 'Required' : 'Optional'}
- **Accessibility**: ${requirements.accessibility || 'WCAG AA'}
- **Responsive**: ${requirements.responsive ? 'Required' : 'Optional'}
- **Animations**: ${requirements.animations ? 'Include smooth transitions' : 'Keep minimal'}

### Required Features:
${features.map(f => `- ${f}`).join('\n') || '- Standard features for this component type'}

${requirements.dataSource ? `### Data Integration:
- **Source**: ${requirements.dataSource}
- **Updates**: ${requirements.updateFrequency || 'On demand'}` : ''}`;
  }

  private buildQualityStandards(): string {
    return `## Quality Standards

Your generated component must:
1. ✅ Use strict TypeScript with proper interfaces
2. ✅ Include comprehensive error handling
3. ✅ Implement loading and error states
4. ✅ Be fully accessible (keyboard nav, ARIA labels)
5. ✅ Follow framework best practices
6. ✅ Be optimized for performance
7. ✅ Include helpful comments for complex logic
8. ✅ Use semantic HTML
9. ✅ Handle edge cases gracefully
10. ✅ Be production-ready

## Output Format

Generate a complete, working component with:
- All necessary imports
- TypeScript interfaces/types
- The main component implementation
- Any helper functions or sub-components
- Export statement

Do not include:
- Installation instructions
- Usage examples (unless specifically requested)
- Markdown formatting around the code
- Explanations (unless specifically requested)`;
  }

  // Helper methods

  private extractKeyFeatures(component: any): string {
    const features: string[] = [];

    if (component.metadata) {
      if (component.metadata.hasTypescript) features.push('TypeScript');
      if (component.metadata.hasTests) features.push('Tested');
      if (component.metadata.responsive) features.push('Responsive');
      if (component.metadata.accessible) features.push('Accessible');
    }

    return features.join(', ') || 'Standard features';
  }

  /**
   * Build a simplified prompt for quick generation
   */
  buildSimplePrompt(request: GenerationRequest): string {
    return `Generate a ${request.framework || 'React'} component: ${request.prompt}

Requirements:
- Use TypeScript
- Include proper error handling
- Make it accessible
- Follow best practices`;
  }

  /**
   * Build prompt for component translation
   */
  buildTranslationPrompt(
    sourceCode: string,
    sourceFramework: string,
    targetFramework: string
  ): string {
    return `Translate this ${sourceFramework} component to ${targetFramework}:

\`\`\`${this.getLanguageForFramework(sourceFramework)}
${sourceCode}
\`\`\`

Requirements:
1. Maintain all functionality
2. Use ${targetFramework} best practices
3. Preserve TypeScript types (adapt as needed)
4. Keep the same props/inputs interface
5. Maintain accessibility features
6. Use idiomatic ${targetFramework} patterns

Generate only the translated component code.`;
  }

  /**
   * Build prompt for variation generation
   */
  buildVariationPrompt(
    originalRequest: GenerationRequest,
    variationNumber: number
  ): string {
    const variations = [
      'with a different visual style',
      'with enhanced animations',
      'with a more compact layout',
      'with additional features',
      'optimized for mobile',
    ];

    const variation = variations[variationNumber % variations.length];

    return `${this.buildCoreRequest(originalRequest)}

Generate a variation of this component ${variation}.`;
  }

  private getLanguageForFramework(framework: string): string {
    const languages: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
    };
    return languages[framework.toLowerCase()] || 'typescript';
  }
}