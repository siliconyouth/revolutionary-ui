/**
 * Automated Code Reviewer - Reviews and validates generated components
 */

import type {
  GeneratedComponent,
  ReviewResult,
  ReviewSection,
  Issue,
  Suggestion,
} from './types';

interface PerformanceMetrics {
  renderComplexity: number;
  stateComplexity: number;
  effectComplexity: number;
  bundleSizeEstimate: number;
}

export class AutomatedCodeReviewer {
  /**
   * Review a generated component
   */
  async reviewComponent(
    component: GeneratedComponent,
    documentation?: any
  ): Promise<ReviewResult> {
    console.log('🔍 Reviewing generated component...');

    // Run all reviews in parallel
    const reviews = await Promise.all([
      this.reviewTypeScript(component.code),
      this.reviewPerformance(component.code, component.framework),
      this.reviewAccessibility(component.code),
      this.reviewSecurity(component.code),
      this.reviewBestPractices(component.code, component.framework, documentation),
      this.reviewDependencies(component.dependencies || []),
      this.reviewCodeQuality(component.code),
      this.reviewStyling(component.code),
    ]);

    // Aggregate results
    const aggregatedReview = this.aggregateReviews(reviews);

    console.log(`✅ Review complete - Score: ${aggregatedReview.score}/100`);
    console.log(`   Issues: ${aggregatedReview.issues.length} (${aggregatedReview.issues.filter(i => i.severity === 'error').length} errors)`);
    console.log(`   Suggestions: ${aggregatedReview.suggestions.length}`);

    return {
      score: aggregatedReview.score,
      passed: aggregatedReview.score >= 80 && aggregatedReview.issues.filter(i => i.severity === 'error').length === 0,
      issues: aggregatedReview.issues,
      suggestions: aggregatedReview.suggestions,
      autoFixAvailable: this.canAutoFix(aggregatedReview.issues),
    };
  }

  /**
   * Review TypeScript usage
   */
  private async reviewTypeScript(code: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for any types
    const anyMatches = code.matchAll(/:\s*any\b/g);
    for (const match of anyMatches) {
      const line = this.getLineNumber(code, match.index!);
      issues.push({
        severity: 'warning',
        message: 'Avoid using "any" type',
        line,
        suggestion: 'Use specific types or "unknown"',
      });
    }

    // Check for missing return types
    const functionRegex = /(?:export\s+)?(?:const|function)\s+(\w+)\s*=?\s*(?:\([^)]*\)|[^=]+)\s*=>\s*(?:\{|[^{])/g;
    const functions = code.matchAll(functionRegex);
    
    for (const match of functions) {
      const functionName = match[1];
      const functionDeclaration = match[0];
      
      // Check if return type is specified
      if (!functionDeclaration.includes(':') || functionDeclaration.indexOf(':') > functionDeclaration.indexOf('=>')) {
        suggestions.push({
          type: 'enhancement',
          message: `Add explicit return type for function "${functionName}"`,
          priority: 'medium',
        });
      }
    }

    // Check for interface definitions for props
    const componentRegex = /export\s+(?:const|function)\s+(\w+).*?(?:props|Props)/g;
    const components = code.matchAll(componentRegex);
    
    for (const match of components) {
      const componentName = match[1];
      const propsInterfaceName = `${componentName}Props`;
      
      if (!code.includes(`interface ${propsInterfaceName}`) && !code.includes(`type ${propsInterfaceName}`)) {
        issues.push({
          severity: 'error',
          message: `Missing props interface for component "${componentName}"`,
          suggestion: `Define interface ${propsInterfaceName}`,
        });
      }
    }

    // Check for proper typing of event handlers
    const eventHandlerRegex = /on\w+\s*=\s*{?\s*\([^)]*\)\s*=>/g;
    const eventHandlers = code.matchAll(eventHandlerRegex);
    
    for (const match of eventHandlers) {
      if (!match[0].includes(':')) {
        suggestions.push({
          type: 'enhancement',
          message: 'Add proper typing for event handlers',
          priority: 'low',
        });
      }
    }

    // Check for nullable types handling
    if (code.includes('!') && !code.includes('!.')) {
      suggestions.push({
        type: 'enhancement',
        message: 'Consider using optional chaining (?.) instead of non-null assertion (!)',
        priority: 'low',
      });
    }

    return {
      category: 'TypeScript',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review performance aspects
   */
  private async reviewPerformance(code: string, framework: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];
    const metrics = this.analyzePerformanceMetrics(code);

    // Framework-specific performance checks
    switch (framework.toLowerCase()) {
      case 'react':
        // Check for missing memoization
        const hasExpensiveComputations = code.includes('.map(') || code.includes('.filter(') || code.includes('.reduce(');
        const hasUseMemo = code.includes('useMemo');
        
        if (hasExpensiveComputations && !hasUseMemo) {
          suggestions.push({
            type: 'performance',
            message: 'Consider using useMemo for expensive computations',
            priority: 'medium',
          });
        }

        // Check for inline functions in render
        const inlineFunctionRegex = /(?:onClick|onChange|onSubmit)\s*=\s*{\s*(?:\([^)]*\)|[^}])\s*=>/g;
        const inlineFunctions = code.matchAll(inlineFunctionRegex);
        
        for (const match of inlineFunctions) {
          issues.push({
            severity: 'warning',
            message: 'Inline functions cause unnecessary re-renders',
            line: this.getLineNumber(code, match.index!),
            suggestion: 'Use useCallback for event handlers',
          });
        }

        // Check for missing React.memo
        if (!code.includes('React.memo') && !code.includes('memo(')) {
          suggestions.push({
            type: 'performance',
            message: 'Consider wrapping component with React.memo',
            priority: 'low',
          });
        }

        // Check for large lists without virtualization
        const listRegex = /\.map\s*\([^)]+\)\s*(?:=>|{)/g;
        const lists = code.matchAll(listRegex);
        let listCount = 0;
        
        for (const _ of lists) {
          listCount++;
        }
        
        if (listCount > 2 && !code.includes('virtualized') && !code.includes('window')) {
          suggestions.push({
            type: 'performance',
            message: 'Consider using virtualization for large lists',
            priority: 'medium',
          });
        }
        break;

      case 'vue':
        // Check for computed properties
        if (code.includes('{{') && (code.includes('.filter') || code.includes('.map'))) {
          issues.push({
            severity: 'warning',
            message: 'Use computed properties instead of inline expressions in templates',
            suggestion: 'Move complex logic to computed properties',
          });
        }
        break;

      case 'angular':
        // Check for OnPush change detection
        if (!code.includes('ChangeDetectionStrategy.OnPush')) {
          suggestions.push({
            type: 'performance',
            message: 'Consider using OnPush change detection strategy',
            priority: 'medium',
          });
        }

        // Check for trackBy in *ngFor
        if (code.includes('*ngFor') && !code.includes('trackBy')) {
          issues.push({
            severity: 'warning',
            message: 'Missing trackBy function in *ngFor',
            suggestion: 'Add trackBy function for better performance',
          });
        }
        break;
    }

    // General performance checks
    // Check for bundle size
    if (code.includes('import *')) {
      issues.push({
        severity: 'warning',
        message: 'Avoid importing entire libraries',
        suggestion: 'Use named imports to reduce bundle size',
      });
    }

    // Check for heavy operations in render
    if (metrics.renderComplexity > 10) {
      issues.push({
        severity: 'warning',
        message: 'Complex operations detected in render method',
        suggestion: 'Move heavy computations outside render or memoize them',
      });
    }

    return {
      category: 'Performance',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review accessibility
   */
  private async reviewAccessibility(code: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for missing alt text on images
    const imgRegex = /<img[^>]+>/g;
    const images = code.matchAll(imgRegex);
    
    for (const match of images) {
      if (!match[0].includes('alt=')) {
        issues.push({
          severity: 'error',
          message: 'Missing alt attribute on image',
          line: this.getLineNumber(code, match.index!),
          suggestion: 'Add descriptive alt text',
        });
      }
    }

    // Check for form labels
    const inputRegex = /<input[^>]+>/g;
    const inputs = code.matchAll(inputRegex);
    
    for (const match of inputs) {
      const inputTag = match[0];
      if (!inputTag.includes('aria-label') && !inputTag.includes('id=')) {
        issues.push({
          severity: 'warning',
          message: 'Input element missing label',
          line: this.getLineNumber(code, match.index!),
          suggestion: 'Add label or aria-label',
        });
      }
    }

    // Check for button text
    const buttonRegex = /<button[^>]*>([^<]*)<\/button>/g;
    const buttons = code.matchAll(buttonRegex);
    
    for (const match of buttons) {
      const buttonContent = match[1].trim();
      if (!buttonContent && !match[0].includes('aria-label')) {
        issues.push({
          severity: 'error',
          message: 'Button missing accessible text',
          line: this.getLineNumber(code, match.index!),
          suggestion: 'Add button text or aria-label',
        });
      }
    }

    // Check for keyboard navigation
    const clickableRegex = /onClick\s*=/g;
    const clickables = code.matchAll(clickableRegex);
    let clickableCount = 0;
    
    for (const _ of clickables) {
      clickableCount++;
    }
    
    const keyHandlerRegex = /onKey(?:Down|Press|Up)\s*=/g;
    const keyHandlers = code.matchAll(keyHandlerRegex);
    let keyHandlerCount = 0;
    
    for (const _ of keyHandlers) {
      keyHandlerCount++;
    }
    
    if (clickableCount > 0 && keyHandlerCount === 0) {
      suggestions.push({
        type: 'accessibility',
        message: 'Consider adding keyboard event handlers for interactive elements',
        priority: 'high',
      });
    }

    // Check for ARIA roles
    if (code.includes('<nav') && !code.includes('role=')) {
      suggestions.push({
        type: 'accessibility',
        message: 'Consider adding appropriate ARIA roles',
        priority: 'low',
      });
    }

    // Check for focus management
    if ((code.includes('modal') || code.includes('dialog')) && !code.includes('focus')) {
      issues.push({
        severity: 'warning',
        message: 'Modal/dialog missing focus management',
        suggestion: 'Implement focus trap and return focus on close',
      });
    }

    // Check for color contrast (basic check)
    if (code.includes('color:') && (code.includes('#fff') || code.includes('white'))) {
      suggestions.push({
        type: 'accessibility',
        message: 'Ensure sufficient color contrast ratios (WCAG AA: 4.5:1 for normal text)',
        priority: 'medium',
      });
    }

    return {
      category: 'Accessibility',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review security aspects
   */
  private async reviewSecurity(code: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for dangerouslySetInnerHTML
    if (code.includes('dangerouslySetInnerHTML')) {
      issues.push({
        severity: 'error',
        message: 'Avoid using dangerouslySetInnerHTML',
        suggestion: 'Use safe alternatives or sanitize content',
      });
    }

    // Check for eval usage
    if (code.includes('eval(')) {
      issues.push({
        severity: 'error',
        message: 'Never use eval() - serious security risk',
        suggestion: 'Use safer alternatives like JSON.parse',
      });
    }

    // Check for innerHTML
    if (code.includes('innerHTML')) {
      issues.push({
        severity: 'error',
        message: 'Avoid direct innerHTML manipulation',
        suggestion: 'Use framework-specific safe methods',
      });
    }

    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
      /password\s*[:=]\s*["'][^"']+["']/gi,
      /secret\s*[:=]\s*["'][^"']+["']/gi,
      /token\s*[:=]\s*["'][^"']+["']/gi,
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(code)) {
        issues.push({
          severity: 'error',
          message: 'Hardcoded secrets detected',
          suggestion: 'Use environment variables',
        });
      }
    }

    // Check for URL validation
    if (code.includes('http://') || code.includes('https://')) {
      suggestions.push({
        type: 'security',
        message: 'Validate and sanitize URLs before use',
        priority: 'medium',
      });
    }

    // Check for input sanitization
    if (code.includes('<input') || code.includes('textarea')) {
      suggestions.push({
        type: 'security',
        message: 'Ensure proper input validation and sanitization',
        priority: 'high',
      });
    }

    return {
      category: 'Security',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review best practices
   */
  private async reviewBestPractices(
    code: string,
    framework: string,
    documentation?: any
  ): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for error handling
    if (!code.includes('try') && !code.includes('catch') && !code.includes('.catch')) {
      suggestions.push({
        type: 'enhancement',
        message: 'Add error handling for async operations',
        priority: 'high',
      });
    }

    // Check for loading states
    if ((code.includes('fetch') || code.includes('async')) && !code.includes('loading')) {
      suggestions.push({
        type: 'enhancement',
        message: 'Add loading states for async operations',
        priority: 'medium',
      });
    }

    // Check for proper component structure
    if (!code.includes('export')) {
      issues.push({
        severity: 'error',
        message: 'Component must be exported',
        suggestion: 'Add export statement',
      });
    }

    // Framework-specific best practices
    switch (framework.toLowerCase()) {
      case 'react':
        // Check for proper hooks usage
        if (code.includes('useState') || code.includes('useEffect')) {
          const hooksInConditionals = /if\s*\([^)]*\)\s*{[^}]*use[A-Z]/;
          if (hooksInConditionals.test(code)) {
            issues.push({
              severity: 'error',
              message: 'Hooks cannot be called conditionally',
              suggestion: 'Move hooks to top level of component',
            });
          }
        }

        // Check for key prop in lists
        if (code.includes('.map(') && !code.includes('key=')) {
          issues.push({
            severity: 'warning',
            message: 'Missing key prop in list items',
            suggestion: 'Add unique key prop to list items',
          });
        }
        break;

      case 'vue':
        // Check for proper data function
        if (code.includes('data:') && !code.includes('data()')) {
          issues.push({
            severity: 'warning',
            message: 'Data should be a function',
            suggestion: 'Use data() { return { ... } }',
          });
        }
        break;
    }

    // Check for console logs
    if (code.includes('console.log')) {
      issues.push({
        severity: 'warning',
        message: 'Remove console.log statements',
        suggestion: 'Use proper logging library or remove',
      });
    }

    // Check for TODO comments
    if (code.includes('TODO') || code.includes('FIXME')) {
      issues.push({
        severity: 'info',
        message: 'Unresolved TODO/FIXME comments',
        suggestion: 'Address TODO items before production',
      });
    }

    return {
      category: 'Best Practices',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review dependencies
   */
  private async reviewDependencies(dependencies: string[]): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for known problematic packages
    const problematicPackages = ['moment', 'lodash'];
    
    for (const dep of dependencies) {
      if (problematicPackages.includes(dep)) {
        suggestions.push({
          type: 'enhancement',
          message: `Consider lighter alternatives to ${dep}`,
          priority: 'low',
        });
      }
    }

    // Check for missing peer dependencies
    if (dependencies.length > 0) {
      suggestions.push({
        type: 'enhancement',
        message: 'Verify all peer dependencies are satisfied',
        priority: 'low',
      });
    }

    return {
      category: 'Dependencies',
      score: 100 - (suggestions.length * 5),
      issues,
      suggestions,
    };
  }

  /**
   * Review code quality
   */
  private async reviewCodeQuality(code: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for code complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    if (cyclomaticComplexity > 10) {
      issues.push({
        severity: 'warning',
        message: 'High cyclomatic complexity detected',
        suggestion: 'Break down complex functions into smaller ones',
      });
    }

    // Check for long functions
    const functionBodies = code.matchAll(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g);
    for (const match of functionBodies) {
      const lines = match[1].split('\n').length;
      if (lines > 50) {
        suggestions.push({
          type: 'enhancement',
          message: 'Consider breaking down long functions',
          priority: 'medium',
        });
      }
    }

    // Check for naming conventions
    const camelCaseViolations = code.matchAll(/(?:const|let|var)\s+([a-z]+_[a-z]+)/g);
    for (const match of camelCaseViolations) {
      issues.push({
        severity: 'info',
        message: `Use camelCase for variable names: ${match[1]}`,
        suggestion: 'Follow JavaScript naming conventions',
      });
    }

    // Check for commented code
    const commentedCodeRegex = /\/\/.*(?:const|let|var|function|class|if|for|while)/g;
    if (commentedCodeRegex.test(code)) {
      suggestions.push({
        type: 'enhancement',
        message: 'Remove commented-out code',
        priority: 'low',
      });
    }

    return {
      category: 'Code Quality',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  /**
   * Review styling approach
   */
  private async reviewStyling(code: string): Promise<ReviewSection> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Check for inline styles
    const inlineStyleCount = (code.match(/style\s*=\s*{{/g) || []).length;
    if (inlineStyleCount > 3) {
      suggestions.push({
        type: 'enhancement',
        message: 'Consider moving inline styles to CSS classes',
        priority: 'low',
      });
    }

    // Check for responsive design
    if (!code.includes('@media') && !code.includes('breakpoint') && !code.includes('sm:') && !code.includes('md:')) {
      suggestions.push({
        type: 'enhancement',
        message: 'Consider adding responsive design support',
        priority: 'medium',
      });
    }

    // Check for CSS-in-JS best practices
    if (code.includes('styled.') || code.includes('css`')) {
      if (!code.includes('theme')) {
        suggestions.push({
          type: 'enhancement',
          message: 'Consider using theme variables for consistency',
          priority: 'low',
        });
      }
    }

    return {
      category: 'Styling',
      score: this.calculateSectionScore(issues, suggestions),
      issues,
      suggestions,
    };
  }

  // Helper methods

  private aggregateReviews(reviews: ReviewSection[]): {
    score: number;
    issues: Issue[];
    suggestions: Suggestion[];
  } {
    let totalScore = 0;
    const allIssues: Issue[] = [];
    const allSuggestions: Suggestion[] = [];

    for (const review of reviews) {
      totalScore += review.score;
      allIssues.push(...review.issues);
      allSuggestions.push(...review.suggestions);
    }

    const averageScore = Math.round(totalScore / reviews.length);

    // Sort issues by severity
    allIssues.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Sort suggestions by priority
    allSuggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return {
      score: averageScore,
      issues: allIssues,
      suggestions: allSuggestions,
    };
  }

  private calculateSectionScore(issues: Issue[], suggestions: Suggestion[]): number {
    let score = 100;

    // Deduct points for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 2;
          break;
      }
    }

    // Deduct points for suggestions (less severe)
    for (const suggestion of suggestions) {
      switch (suggestion.priority) {
        case 'high':
          score -= 3;
          break;
        case 'medium':
          score -= 2;
          break;
        case 'low':
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }

  private canAutoFix(issues: Issue[]): boolean {
    // Check if any issues have auto-fix suggestions
    return issues.some(issue => issue.suggestion !== undefined);
  }

  private getLineNumber(code: string, index: number): number {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }

  private analyzePerformanceMetrics(code: string): PerformanceMetrics {
    // Simple complexity analysis
    const renderComplexity = (code.match(/\.map\s*\(/g) || []).length +
                           (code.match(/\.filter\s*\(/g) || []).length +
                           (code.match(/\.reduce\s*\(/g) || []).length;

    const stateComplexity = (code.match(/useState/g) || []).length +
                          (code.match(/useReducer/g) || []).length;

    const effectComplexity = (code.match(/useEffect/g) || []).length +
                           (code.match(/useLayoutEffect/g) || []).length;

    const bundleSizeEstimate = code.length / 1000; // KB estimate

    return {
      renderComplexity,
      stateComplexity,
      effectComplexity,
      bundleSizeEstimate,
    };
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simplified cyclomatic complexity calculation
    let complexity = 1;

    const controlStructures = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /else\s*{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /do\s*{/g,
      /switch\s*\(/g,
      /case\s+/g,
      /\?\s*.*\s*:/g, // ternary
      /&&/g,
      /\|\|/g,
    ];

    for (const pattern of controlStructures) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Generate auto-fix suggestions
   */
  async generateAutoFixes(issues: Issue[]): Promise<Map<Issue, string>> {
    const fixes = new Map<Issue, string>();

    for (const issue of issues) {
      if (issue.suggestion) {
        // Generate specific fixes based on issue type
        if (issue.message.includes('any type')) {
          fixes.set(issue, 'unknown');
        } else if (issue.message.includes('key prop')) {
          fixes.set(issue, 'key={item.id}');
        } else if (issue.message.includes('alt attribute')) {
          fixes.set(issue, 'alt=""');
        }
      }
    }

    return fixes;
  }
}