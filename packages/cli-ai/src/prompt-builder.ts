import type { ComponentSpec } from './types.js';

export class PromptBuilder {
  static buildComponentPrompt(
    userPrompt: string,
    framework: string = 'react',
    additionalContext?: Record<string, any>
  ): string {
    const frameworkGuide = this.getFrameworkGuide(framework);
    const bestPractices = this.getBestPractices(framework);

    return `You are an expert ${framework} developer creating a UI component based on the following request:

"${userPrompt}"

Framework: ${framework}
${frameworkGuide}

Please generate a complete, production-ready component following these requirements:

1. Component Structure:
   - Use TypeScript for type safety
   - Include proper prop types and interfaces
   - Export the component as default
   - Use modern ${framework} patterns and best practices

2. Styling:
   - Use Tailwind CSS for styling (unless specified otherwise)
   - Ensure responsive design
   - Follow accessibility best practices

3. Code Quality:
   - Include helpful comments for complex logic
   - Use meaningful variable and function names
   - Keep the component focused and reusable

${bestPractices}

Additional Context:
${additionalContext ? JSON.stringify(additionalContext, null, 2) : 'None'}

Generate the complete component code:`;
  }

  static buildFactoryPrompt(
    userPrompt: string,
    factoryType: string,
    framework: string = 'react'
  ): string {
    return `You are an expert UI developer using the Revolutionary UI Factory System.

User Request: "${userPrompt}"

Factory Type: ${factoryType}
Framework: ${framework}

Generate a factory configuration that fulfills the user's request. The configuration should:

1. Use the ${factoryType} factory pattern
2. Be compatible with ${framework}
3. Include all necessary properties and options
4. Follow Revolutionary UI factory conventions
5. Be production-ready and fully functional

Provide the factory configuration as a JSON object:`;
  }

  static buildAnalysisPrompt(code: string): string {
    return `Analyze the following code and provide insights:

\`\`\`
${code}
\`\`\`

Please provide:
1. Component purpose and functionality
2. Props and their types
3. Dependencies used
4. Potential improvements
5. Accessibility considerations
6. Performance optimizations
7. Security considerations`;
  }

  static buildRefactorPrompt(code: string, improvements: string[]): string {
    return `Refactor the following component based on these improvement suggestions:

Current Code:
\`\`\`
${code}
\`\`\`

Requested Improvements:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

Generate the refactored code maintaining the same functionality while implementing the improvements:`;
  }

  static buildConversionPrompt(
    code: string,
    fromFramework: string,
    toFramework: string
  ): string {
    const conversionGuide = this.getConversionGuide(fromFramework, toFramework);

    return `Convert the following ${fromFramework} component to ${toFramework}:

\`\`\`
${code}
\`\`\`

${conversionGuide}

Generate the converted component maintaining the same functionality and styling:`;
  }

  private static getFrameworkGuide(framework: string): string {
    const guides: Record<string, string> = {
      react: `React Guidelines:
- Use functional components with hooks
- Prefer composition over inheritance
- Use React.memo for performance optimization when needed
- Handle events properly with synthetic events`,
      
      vue: `Vue Guidelines:
- Use Composition API with <script setup>
- Define props with proper types
- Use reactive and ref appropriately
- Emit events for parent communication`,
      
      angular: `Angular Guidelines:
- Use standalone components when possible
- Implement OnInit for initialization logic
- Use Input/Output decorators for component communication
- Follow Angular style guide conventions`,
      
      svelte: `Svelte Guidelines:
- Use reactive declarations with $:
- Export props directly
- Use on: directives for event handling
- Leverage Svelte's built-in reactivity`,
      
      solid: `SolidJS Guidelines:
- Use createSignal for reactive state
- Leverage fine-grained reactivity
- Use Show/For components for conditionals and lists
- Avoid destructuring props`,
    };

    return guides[framework] || 'Follow framework best practices.';
  }

  private static getBestPractices(framework: string): string {
    return `
Best Practices:
- Write clean, maintainable code
- Include error boundaries or error handling
- Make the component accessible (ARIA labels, keyboard navigation)
- Optimize for performance (lazy loading, memoization where appropriate)
- Use semantic HTML elements
- Include loading and error states where applicable
- Make the component responsive and mobile-friendly`;
  }

  private static getConversionGuide(from: string, to: string): string {
    const key = `${from}-${to}`;
    const guides: Record<string, string> = {
      'react-vue': `Key Conversion Points:
- Convert useState to ref/reactive
- Convert useEffect to onMounted/watch
- Convert props destructuring to defineProps
- Convert event handlers to Vue event syntax
- Adjust JSX to Vue template syntax`,
      
      'react-angular': `Key Conversion Points:
- Convert functional component to class component
- Convert hooks to lifecycle methods
- Convert props to @Input decorators
- Convert state to class properties
- Adjust JSX to Angular template syntax`,
      
      'vue-react': `Key Conversion Points:
- Convert ref/reactive to useState
- Convert lifecycle hooks to useEffect
- Convert defineProps to function parameters
- Convert template to JSX
- Adjust event handling syntax`,
      
      // Add more conversion guides as needed
    };

    return guides[key] || `
General Conversion Guidelines:
- Maintain the same functionality
- Adapt to target framework's idioms
- Preserve styling and layout
- Update event handling syntax
- Convert state management appropriately`;
  }
}