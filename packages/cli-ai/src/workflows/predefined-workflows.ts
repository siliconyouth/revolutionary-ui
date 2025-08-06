import type { Workflow } from './ai-workflow-engine.js';
import { z } from 'zod';

// Component PRD Generation Workflow
export const componentPRDWorkflow: Workflow = {
  id: 'component-prd',
  name: 'Component PRD Generation',
  description: 'Generate a comprehensive PRD for a new component',
  version: '1.0.0',
  steps: [
    {
      id: 'gather-requirements',
      name: 'Gather Requirements',
      type: 'generate',
      prompt: `Based on the user input: {{input.description}}

Generate a comprehensive requirements analysis including:
1. User stories
2. Functional requirements
3. Non-functional requirements
4. Acceptance criteria
5. Dependencies

Format as JSON with these sections.`,
      outputSchema: z.object({
        userStories: z.array(z.string()),
        functionalRequirements: z.array(z.string()),
        nonFunctionalRequirements: z.array(z.string()),
        acceptanceCriteria: z.array(z.string()),
        dependencies: z.array(z.string()),
      }),
    },
    {
      id: 'design-component',
      name: 'Design Component Architecture',
      type: 'generate',
      dependencies: ['gather-requirements'],
      prompt: `Based on the requirements: {{outputs.gather-requirements}}

Design the component architecture including:
1. Component structure
2. Props interface
3. State management
4. Event handlers
5. Styling approach
6. Accessibility considerations

Format as detailed technical specification.`,
    },
    {
      id: 'generate-prd',
      name: 'Generate PRD Document',
      type: 'generate',
      dependencies: ['gather-requirements', 'design-component'],
      prompt: `Create a comprehensive PRD document based on:

Requirements: {{outputs.gather-requirements}}
Design: {{outputs.design-component}}

Include:
1. Executive Summary
2. Problem Statement
3. User Personas
4. Requirements (from analysis)
5. Technical Architecture (from design)
6. Implementation Plan
7. Success Metrics
8. Risks and Mitigations

Format as markdown document.`,
    },
    {
      id: 'review-prd',
      name: 'Review and Validate PRD',
      type: 'review',
      dependencies: ['generate-prd'],
      prompt: `Review the generated PRD: {{outputs.generate-prd}}

Check for:
1. Completeness
2. Clarity
3. Technical accuracy
4. Feasibility
5. Missing requirements`,
    },
  ],
  options: {
    maxIterations: 2,
    autoApprove: false,
    saveIntermediateResults: true,
  },
};

// Component Generation with Validation Loop
export const componentGenerationWorkflow: Workflow = {
  id: 'component-generation',
  name: 'Component Generation with Validation',
  description: 'Generate a component with iterative validation and optimization',
  version: '1.0.0',
  steps: [
    {
      id: 'generate-component',
      name: 'Generate Component Code',
      type: 'generate',
      prompt: `Generate a {{input.framework}} component based on:

Name: {{input.name}}
Description: {{input.description}}
Props: {{input.props}}
Features: {{input.features}}

Include:
1. Complete component code
2. TypeScript interfaces
3. Default props
4. Error boundaries
5. Loading states
6. Accessibility features`,
    },
    {
      id: 'generate-tests',
      name: 'Generate Tests',
      type: 'generate',
      dependencies: ['generate-component'],
      prompt: `Generate comprehensive tests for the component:

{{outputs.generate-component}}

Include:
1. Unit tests for all props
2. Integration tests for user interactions
3. Accessibility tests
4. Edge case tests
5. Snapshot tests`,
    },
    {
      id: 'validate-component',
      name: 'Validate Component',
      type: 'validate',
      dependencies: ['generate-component', 'generate-tests'],
      prompt: `Validate the generated component and tests for:

1. Code quality
2. Best practices
3. Performance
4. Accessibility compliance
5. Test coverage`,
      outputSchema: z.object({
        valid: z.boolean(),
        errors: z.array(z.string()),
        warnings: z.array(z.string()),
        suggestions: z.array(z.string()),
      }),
    },
    {
      id: 'optimize-component',
      name: 'Optimize Component',
      type: 'optimize',
      dependencies: ['validate-component'],
      prompt: `Optimize the component based on validation results:

{{outputs.validate-component}}

Focus on:
1. Fixing errors
2. Implementing suggestions
3. Performance improvements
4. Code reduction`,
      condition: async (context) => !context.outputs['validate-component']?.valid,
    },
  ],
  options: {
    maxIterations: 3,
    autoApprove: false,
    saveIntermediateResults: true,
  },
};

// Design System Component Workflow
export const designSystemWorkflow: Workflow = {
  id: 'design-system-component',
  name: 'Design System Component Creation',
  description: 'Create a component following design system guidelines',
  version: '1.0.0',
  steps: [
    {
      id: 'analyze-design-system',
      name: 'Analyze Design System',
      type: 'analyze',
      prompt: `Analyze the design system requirements for component: {{input.name}}

Consider:
1. Design tokens (colors, spacing, typography)
2. Component patterns
3. Accessibility standards
4. Animation guidelines
5. Responsive behavior`,
    },
    {
      id: 'generate-variants',
      name: 'Generate Component Variants',
      type: 'generate',
      dependencies: ['analyze-design-system'],
      prompt: `Generate all variants of the component based on design system:

{{outputs.analyze-design-system}}

Include variants for:
1. Sizes (small, medium, large)
2. States (default, hover, active, disabled)
3. Themes (light, dark)
4. Responsive breakpoints`,
    },
    {
      id: 'generate-stories',
      name: 'Generate Storybook Stories',
      type: 'generate',
      dependencies: ['generate-variants'],
      prompt: `Generate Storybook stories for all component variants:

{{outputs.generate-variants}}

Include:
1. Default story
2. All variants
3. Interactive controls
4. Documentation
5. Accessibility notes`,
    },
    {
      id: 'generate-docs',
      name: 'Generate Documentation',
      type: 'generate',
      dependencies: ['generate-variants', 'generate-stories'],
      prompt: `Generate comprehensive documentation including:

1. Component overview
2. Props documentation
3. Usage examples
4. Design guidelines
5. Accessibility guidelines
6. Migration guide`,
    },
  ],
  options: {
    maxIterations: 1,
    autoApprove: true,
    saveIntermediateResults: true,
  },
};

// Code Review Workflow
export const codeReviewWorkflow: Workflow = {
  id: 'code-review',
  name: 'AI Code Review',
  description: 'Comprehensive code review with actionable feedback',
  version: '1.0.0',
  steps: [
    {
      id: 'analyze-code',
      name: 'Analyze Code Structure',
      type: 'analyze',
      prompt: `Analyze the code structure and architecture:

{{input.code}}

Focus on:
1. Design patterns
2. Code organization
3. Dependency management
4. Separation of concerns
5. Scalability`,
    },
    {
      id: 'security-review',
      name: 'Security Review',
      type: 'review',
      prompt: `Perform security review of the code:

{{input.code}}

Check for:
1. Input validation
2. Authentication/authorization
3. Data sanitization
4. Secure communication
5. Dependency vulnerabilities`,
    },
    {
      id: 'performance-review',
      name: 'Performance Review',
      type: 'review',
      dependencies: ['analyze-code'],
      prompt: `Review code for performance issues:

{{input.code}}

Analyze:
1. Time complexity
2. Space complexity
3. Database queries
4. Caching opportunities
5. Bundle size impact`,
    },
    {
      id: 'best-practices-review',
      name: 'Best Practices Review',
      type: 'review',
      dependencies: ['analyze-code'],
      prompt: `Review code against best practices:

{{input.code}}

Check:
1. Naming conventions
2. Error handling
3. Testing coverage
4. Documentation
5. Code reusability`,
    },
    {
      id: 'generate-report',
      name: 'Generate Review Report',
      type: 'generate',
      dependencies: ['security-review', 'performance-review', 'best-practices-review'],
      prompt: `Generate comprehensive code review report based on:

Security: {{outputs.security-review}}
Performance: {{outputs.performance-review}}
Best Practices: {{outputs.best-practices-review}}

Format as actionable feedback with:
1. Critical issues (must fix)
2. Important issues (should fix)
3. Suggestions (nice to have)
4. Positive feedback
5. Learning resources`,
    },
  ],
  options: {
    maxIterations: 1,
    autoApprove: true,
    saveIntermediateResults: true,
    parallelExecution: true,
  },
};

// API Endpoint Generation Workflow
export const apiEndpointWorkflow: Workflow = {
  id: 'api-endpoint',
  name: 'API Endpoint Generation',
  description: 'Generate complete API endpoint with validation and tests',
  version: '1.0.0',
  steps: [
    {
      id: 'design-api',
      name: 'Design API Specification',
      type: 'generate',
      prompt: `Design RESTful API specification for: {{input.description}}

Include:
1. Endpoint paths
2. HTTP methods
3. Request schemas
4. Response schemas
5. Error responses
6. Authentication requirements

Format as OpenAPI specification.`,
    },
    {
      id: 'generate-handler',
      name: 'Generate API Handler',
      type: 'generate',
      dependencies: ['design-api'],
      prompt: `Generate API handler implementation based on specification:

{{outputs.design-api}}

Include:
1. Request validation
2. Business logic
3. Error handling
4. Response formatting
5. Logging
6. Authentication checks`,
    },
    {
      id: 'generate-client',
      name: 'Generate API Client',
      type: 'generate',
      dependencies: ['design-api'],
      prompt: `Generate TypeScript API client based on specification:

{{outputs.design-api}}

Include:
1. Type-safe methods
2. Request/response types
3. Error handling
4. Retry logic
5. Authentication`,
    },
    {
      id: 'generate-tests',
      name: 'Generate API Tests',
      type: 'generate',
      dependencies: ['generate-handler'],
      prompt: `Generate comprehensive API tests:

{{outputs.generate-handler}}

Include:
1. Unit tests for handler
2. Integration tests
3. Error case tests
4. Authentication tests
5. Performance tests`,
    },
    {
      id: 'generate-docs',
      name: 'Generate API Documentation',
      type: 'generate',
      dependencies: ['design-api', 'generate-client'],
      prompt: `Generate API documentation including:

1. Overview
2. Authentication guide
3. Endpoint reference
4. Example requests/responses
5. Error codes
6. Rate limiting
7. Client SDK usage`,
    },
  ],
  options: {
    maxIterations: 1,
    autoApprove: false,
    saveIntermediateResults: true,
  },
};

// Migration Workflow
export const migrationWorkflow: Workflow = {
  id: 'migration',
  name: 'Code Migration Assistant',
  description: 'Migrate code between frameworks or versions',
  version: '1.0.0',
  steps: [
    {
      id: 'analyze-source',
      name: 'Analyze Source Code',
      type: 'analyze',
      prompt: `Analyze the source code for migration:

{{input.sourceCode}}

Identify:
1. Framework-specific patterns
2. Dependencies
3. Component structure
4. State management
5. Routing
6. API calls`,
    },
    {
      id: 'create-mapping',
      name: 'Create Migration Mapping',
      type: 'generate',
      dependencies: ['analyze-source'],
      prompt: `Create migration mapping from {{input.sourceFramework}} to {{input.targetFramework}}:

Source Analysis: {{outputs.analyze-source}}

Map:
1. Component patterns
2. Lifecycle methods
3. State management
4. Event handling
5. Styling approach
6. Dependencies`,
    },
    {
      id: 'generate-migrated',
      name: 'Generate Migrated Code',
      type: 'transform',
      dependencies: ['create-mapping'],
      prompt: `Transform the code using migration mapping:

{{outputs.create-mapping}}

Ensure:
1. Functional equivalence
2. Idiomatic target code
3. Performance optimization
4. Type safety
5. Best practices`,
    },
    {
      id: 'validate-migration',
      name: 'Validate Migration',
      type: 'validate',
      dependencies: ['generate-migrated'],
      prompt: `Validate the migrated code:

Original: {{input.sourceCode}}
Migrated: {{outputs.generate-migrated}}

Check:
1. Feature parity
2. Breaking changes
3. Performance impact
4. Type compatibility
5. Test coverage`,
    },
    {
      id: 'generate-migration-guide',
      name: 'Generate Migration Guide',
      type: 'generate',
      dependencies: ['validate-migration'],
      prompt: `Generate migration guide including:

1. Breaking changes
2. Manual steps required
3. Testing checklist
4. Rollback plan
5. Performance considerations
6. Gradual migration strategy`,
    },
  ],
  options: {
    maxIterations: 2,
    autoApprove: false,
    saveIntermediateResults: true,
  },
};

// Workflow registry
export const workflowRegistry = {
  'component-prd': componentPRDWorkflow,
  'component-generation': componentGenerationWorkflow,
  'design-system': designSystemWorkflow,
  'code-review': codeReviewWorkflow,
  'api-endpoint': apiEndpointWorkflow,
  'migration': migrationWorkflow,
};

// Helper to get workflow by ID
export function getWorkflow(id: string): Workflow | undefined {
  return workflowRegistry[id as keyof typeof workflowRegistry];
}

// Helper to list all workflows
export function listWorkflows(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(workflowRegistry).map(([id, workflow]) => ({
    id,
    name: workflow.name,
    description: workflow.description,
  }));
}