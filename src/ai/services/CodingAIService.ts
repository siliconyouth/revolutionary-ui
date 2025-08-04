import { AI_MODELS_CONFIG, getCodingModels, getModelsByContextSize, AIModelDetails } from '../models/AIModelsConfig';
import chalk from 'chalk';
import ora from 'ora';

export interface CodingTaskOptions {
  provider?: string;
  model?: string;
  language?: string;
  framework?: string;
  style?: 'functional' | 'oop' | 'mixed';
  comments?: boolean;
  tests?: boolean;
  documentation?: boolean;
  optimization?: 'performance' | 'readability' | 'size';
}

export interface CodeGenerationRequest {
  task: string;
  context?: string;
  examples?: string[];
  constraints?: string[];
  options?: CodingTaskOptions;
}

export interface CodeReviewRequest {
  code: string;
  language: string;
  focus?: Array<'security' | 'performance' | 'style' | 'bugs' | 'best-practices'>;
  severity?: 'all' | 'critical' | 'major' | 'minor';
}

export interface RefactoringRequest {
  code: string;
  goal: string;
  preserveLogic?: boolean;
  targetPatterns?: string[];
  framework?: string;
}

export interface CodeResult {
  provider: string;
  model: string;
  timestamp: number;
  code: string;
  language: string;
  explanation?: string;
  dependencies?: string[];
  setup?: string;
  tests?: string;
  documentation?: string;
  metadata?: {
    linesOfCode: number;
    complexity?: number;
    estimatedTime?: string;
  };
}

export interface CodeReviewResult {
  provider: string;
  model: string;
  timestamp: number;
  summary: string;
  issues: Array<{
    severity: 'critical' | 'major' | 'minor' | 'info';
    type: string;
    line?: number;
    description: string;
    suggestion: string;
    code?: string;
  }>;
  positives: string[];
  metrics?: {
    maintainability: number;
    reliability: number;
    security: number;
    performance: number;
  };
}

export class CodingAIService {
  private codingModels = getCodingModels();
  private largeContextModels = getModelsByContextSize(100000);
  
  async generateCode(request: CodeGenerationRequest): Promise<CodeResult> {
    const spinner = ora('Generating code...').start();
    
    try {
      const { provider, model } = this.selectCodingModel(request);
      
      spinner.text = `Using ${provider} - ${model.name} for code generation`;
      
      const prompt = this.buildCodeGenerationPrompt(request);
      
      // Simulate API call - in real implementation, call actual provider
      const result = await this.callCodingModel(provider, model, prompt, request.options);
      
      spinner.succeed('Code generated successfully');
      
      return result;
    } catch (error: any) {
      spinner.fail('Code generation failed');
      throw error;
    }
  }
  
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    const spinner = ora('Reviewing code...').start();
    
    try {
      // For code review, prefer models with strong analysis capabilities
      const { provider, model } = this.selectReviewModel(request);
      
      spinner.text = `Using ${provider} - ${model.name} for code review`;
      
      const prompt = this.buildCodeReviewPrompt(request);
      
      const result = await this.performCodeReview(provider, model, prompt, request);
      
      spinner.succeed('Code review complete');
      
      return result;
    } catch (error: any) {
      spinner.fail('Code review failed');
      throw error;
    }
  }
  
  async refactorCode(request: RefactoringRequest): Promise<CodeResult> {
    const spinner = ora('Refactoring code...').start();
    
    try {
      // For refactoring, prefer models with good code understanding
      const { provider, model } = this.selectRefactoringModel(request);
      
      spinner.text = `Using ${provider} - ${model.name} for refactoring`;
      
      const prompt = this.buildRefactoringPrompt(request);
      
      const result = await this.callCodingModel(provider, model, prompt);
      
      spinner.succeed('Refactoring complete');
      
      return result;
    } catch (error: any) {
      spinner.fail('Refactoring failed');
      throw error;
    }
  }
  
  async debugCode(
    code: string,
    error: string,
    language: string,
    context?: string
  ): Promise<{
    diagnosis: string;
    fixes: Array<{ description: string; code: string }>;
    explanation: string;
    preventionTips: string[];
  }> {
    console.log(chalk.cyan('🐛 Debugging code...'));
    
    const prompt = `
Debug this ${language} code that's producing the following error:

Error: ${error}

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ''}

Please provide:
1. Root cause diagnosis
2. Multiple fix options with code
3. Detailed explanation
4. Tips to prevent similar issues`;
    
    // Use a model good at debugging
    const debugModels = this.codingModels.filter(m => 
      m.model.strengths.some(s => s.toLowerCase().includes('debug'))
    );
    
    const { provider, model } = debugModels[0] || this.codingModels[0];
    
    // Simulate the debugging process
    return {
      diagnosis: 'Analyzed root cause of the error',
      fixes: [
        { description: 'Primary fix', code: '// Fixed code here' },
        { description: 'Alternative approach', code: '// Alternative code' }
      ],
      explanation: 'Detailed explanation of the issue',
      preventionTips: ['Use TypeScript', 'Add input validation', 'Write tests']
    };
  }
  
  async explainCode(
    code: string,
    language: string,
    targetAudience: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
  ): Promise<{
    summary: string;
    lineByLine: Array<{ line: number; code: string; explanation: string }>;
    concepts: string[];
    complexity: string;
    suggestions: string[];
  }> {
    console.log(chalk.cyan('📖 Explaining code...'));
    
    const prompt = `
Explain this ${language} code for a ${targetAudience} developer:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Overall summary
2. Line-by-line explanation
3. Key concepts used
4. Complexity analysis
5. Improvement suggestions`;
    
    // Use a model good at explanations
    const { provider, model } = this.selectExplanationModel();
    
    // Simulate the explanation
    return {
      summary: 'This code implements...',
      lineByLine: [
        { line: 1, code: 'const example = ...', explanation: 'This line...' }
      ],
      concepts: ['Closures', 'Async/Await', 'Error Handling'],
      complexity: 'Medium - uses advanced patterns but readable',
      suggestions: ['Consider adding error handling', 'Could be optimized for performance']
    };
  }
  
  private selectCodingModel(request: CodeGenerationRequest): { provider: string; model: AIModelDetails } {
    // If specific provider/model requested
    if (request.options?.provider && request.options?.model) {
      const providerConfig = AI_MODELS_CONFIG.find(p => p.id === request.options!.provider);
      const modelConfig = providerConfig?.models.find(m => m.id === request.options!.model);
      
      if (modelConfig?.capabilities.coding) {
        return { provider: request.options.provider, model: modelConfig };
      }
    }
    
    // Auto-select based on task complexity and requirements
    const taskComplexity = this.assessTaskComplexity(request.task);
    
    if (taskComplexity === 'high') {
      // For complex tasks, use the most capable models
      const preferredModels = [
        'claude-3-5-sonnet-20241022',
        'gpt-4-turbo-preview',
        'deepseek-coder'
      ];
      
      for (const modelId of preferredModels) {
        const found = this.codingModels.find(m => m.model.id === modelId);
        if (found) return found;
      }
    }
    
    // For specific language optimizations
    if (request.options?.language === 'python') {
      const pythonModel = this.codingModels.find(m => 
        m.model.name.toLowerCase().includes('python')
      );
      if (pythonModel) return pythonModel;
    }
    
    // For code completion tasks
    if (request.task.toLowerCase().includes('complete') || 
        request.task.toLowerCase().includes('fill')) {
      const completionModels = this.codingModels.filter(m =>
        m.model.strengths.some(s => s.toLowerCase().includes('completion'))
      );
      if (completionModels.length > 0) return completionModels[0];
    }
    
    // Default to the best general coding model
    return this.codingModels[0];
  }
  
  private selectReviewModel(request: CodeReviewRequest): { provider: string; model: AIModelDetails } {
    // For security reviews, prefer models known for security analysis
    if (request.focus?.includes('security')) {
      const securityModels = this.codingModels.filter(m =>
        m.model.bestFor.some(use => use.toLowerCase().includes('security'))
      );
      if (securityModels.length > 0) return securityModels[0];
    }
    
    // For large codebases, use models with large context
    const codeLines = request.code.split('\n').length;
    if (codeLines > 500) {
      return this.largeContextModels[0];
    }
    
    // Default to Claude for thorough analysis
    const claude = this.codingModels.find(m => 
      m.model.id === 'claude-3-opus-20240229'
    );
    
    return claude || this.codingModels[0];
  }
  
  private selectRefactoringModel(request: RefactoringRequest): { provider: string; model: AIModelDetails } {
    // For framework-specific refactoring
    if (request.framework) {
      const frameworkModels = this.codingModels.filter(m =>
        m.model.bestFor.some(use => 
          use.toLowerCase().includes(request.framework!.toLowerCase())
        )
      );
      if (frameworkModels.length > 0) return frameworkModels[0];
    }
    
    // Prefer models good at understanding and maintaining logic
    const refactoringModels = this.codingModels.filter(m =>
      m.model.bestFor.some(use => 
        use.toLowerCase().includes('refactor') ||
        use.toLowerCase().includes('optimization')
      )
    );
    
    return refactoringModels[0] || this.codingModels[0];
  }
  
  private selectExplanationModel(): { provider: string; model: AIModelDetails } {
    // For explanations, prefer models known for clear communication
    const explanationModels = this.codingModels.filter(m =>
      m.model.strengths.some(s => 
        s.toLowerCase().includes('documentation') ||
        s.toLowerCase().includes('explanation')
      )
    );
    
    return explanationModels[0] || this.codingModels[0];
  }
  
  private assessTaskComplexity(task: string): 'low' | 'medium' | 'high' {
    const complexIndicators = [
      'architecture', 'system', 'full', 'complete', 'enterprise',
      'microservice', 'distributed', 'scalable', 'production'
    ];
    
    const simpleIndicators = [
      'simple', 'basic', 'example', 'demo', 'test',
      'snippet', 'function', 'method', 'utility'
    ];
    
    const taskLower = task.toLowerCase();
    
    if (complexIndicators.some(ind => taskLower.includes(ind))) {
      return 'high';
    }
    
    if (simpleIndicators.some(ind => taskLower.includes(ind))) {
      return 'low';
    }
    
    return 'medium';
  }
  
  private buildCodeGenerationPrompt(request: CodeGenerationRequest): string {
    const parts: string[] = [];
    
    parts.push(`Task: ${request.task}`);
    
    if (request.context) {
      parts.push(`\nContext: ${request.context}`);
    }
    
    if (request.options) {
      parts.push('\nRequirements:');
      if (request.options.language) parts.push(`- Language: ${request.options.language}`);
      if (request.options.framework) parts.push(`- Framework: ${request.options.framework}`);
      if (request.options.style) parts.push(`- Style: ${request.options.style}`);
      if (request.options.comments) parts.push('- Include detailed comments');
      if (request.options.tests) parts.push('- Include unit tests');
      if (request.options.documentation) parts.push('- Include documentation');
      if (request.options.optimization) parts.push(`- Optimize for: ${request.options.optimization}`);
    }
    
    if (request.examples && request.examples.length > 0) {
      parts.push('\nExamples to follow:');
      request.examples.forEach((ex, i) => {
        parts.push(`Example ${i + 1}:\n${ex}`);
      });
    }
    
    if (request.constraints && request.constraints.length > 0) {
      parts.push('\nConstraints:');
      request.constraints.forEach(constraint => {
        parts.push(`- ${constraint}`);
      });
    }
    
    parts.push('\nProvide clean, production-ready code with explanations.');
    
    return parts.join('\n');
  }
  
  private buildCodeReviewPrompt(request: CodeReviewRequest): string {
    const parts: string[] = [];
    
    parts.push(`Review this ${request.language} code:`);
    parts.push(`\`\`\`${request.language}\n${request.code}\n\`\`\``);
    
    if (request.focus && request.focus.length > 0) {
      parts.push(`\nFocus areas: ${request.focus.join(', ')}`);
    }
    
    if (request.severity) {
      parts.push(`\nReport issues of severity: ${request.severity}`);
    }
    
    parts.push('\nProvide:');
    parts.push('1. Executive summary');
    parts.push('2. Detailed issues with line numbers');
    parts.push('3. Positive aspects');
    parts.push('4. Metrics scores (0-100)');
    parts.push('5. Actionable improvements');
    
    return parts.join('\n');
  }
  
  private buildRefactoringPrompt(request: RefactoringRequest): string {
    const parts: string[] = [];
    
    parts.push(`Refactor this code with the goal: ${request.goal}`);
    parts.push(`\`\`\`\n${request.code}\n\`\`\``);
    
    if (request.preserveLogic) {
      parts.push('\nIMPORTANT: Preserve exact functionality and behavior');
    }
    
    if (request.targetPatterns && request.targetPatterns.length > 0) {
      parts.push(`\nApply these patterns: ${request.targetPatterns.join(', ')}`);
    }
    
    if (request.framework) {
      parts.push(`\nOptimize for ${request.framework} best practices`);
    }
    
    parts.push('\nProvide:');
    parts.push('1. Refactored code');
    parts.push('2. Explanation of changes');
    parts.push('3. Benefits of the refactoring');
    
    return parts.join('\n');
  }
  
  private async callCodingModel(
    provider: string,
    model: AIModelDetails,
    prompt: string,
    options?: CodingTaskOptions
  ): Promise<CodeResult> {
    // Simulate API call
    console.log(chalk.dim(`Calling ${provider} API with model ${model.id}...`));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    const mockCode = `// Generated by ${model.name}
    
${options?.language === 'typescript' ? `interface ExampleProps {
  title: string;
  description?: string;
  onAction: () => void;
}

export const ExampleComponent: React.FC<ExampleProps> = ({ title, description, onAction }) => {
  return (
    <div className="example-component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <button onClick={onAction}>Click me</button>
    </div>
  );
};` : `def example_function(title, description=None):
    """Example function generated by AI"""
    print(f"Title: {title}")
    if description:
        print(f"Description: {description}")
    return {"title": title, "description": description}`}`;
    
    return {
      provider,
      model: model.id,
      timestamp: Date.now(),
      code: mockCode,
      language: options?.language || 'typescript',
      explanation: 'This code implements the requested functionality...',
      dependencies: options?.framework === 'react' ? ['react', 'react-dom'] : [],
      setup: 'npm install dependencies',
      metadata: {
        linesOfCode: mockCode.split('\n').length,
        complexity: 5,
        estimatedTime: '5 minutes'
      }
    };
  }
  
  private async performCodeReview(
    provider: string,
    model: AIModelDetails,
    prompt: string,
    request: CodeReviewRequest
  ): Promise<CodeReviewResult> {
    // Simulate API call
    console.log(chalk.dim(`Performing code review with ${model.name}...`));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock review result
    return {
      provider,
      model: model.id,
      timestamp: Date.now(),
      summary: 'Overall, the code is well-structured with minor improvements needed.',
      issues: [
        {
          severity: 'minor',
          type: 'style',
          line: 5,
          description: 'Function name could be more descriptive',
          suggestion: 'Consider renaming to be more specific about its purpose',
          code: 'function processUserData() { ... }'
        },
        {
          severity: 'major',
          type: 'security',
          line: 12,
          description: 'Potential SQL injection vulnerability',
          suggestion: 'Use parameterized queries',
          code: 'db.query(sql, [userId])'
        }
      ],
      positives: [
        'Good separation of concerns',
        'Proper error handling',
        'Clear variable naming'
      ],
      metrics: {
        maintainability: 78,
        reliability: 85,
        security: 65,
        performance: 82
      }
    };
  }
  
  // Get model recommendations for specific coding tasks
  getRecommendations(
    task: 'generation' | 'review' | 'debugging' | 'refactoring' | 'completion'
  ): Array<{ provider: string; model: AIModelDetails; reason: string }> {
    const recommendations: Array<{ provider: string; model: AIModelDetails; reason: string }> = [];
    
    switch (task) {
      case 'generation':
        recommendations.push({
          provider: 'anthropic',
          model: AI_MODELS_CONFIG.find(p => p.id === 'anthropic')!.models.find(m => m.id === 'claude-3-5-sonnet-20241022')!,
          reason: 'Best overall code generation with clean, idiomatic output'
        });
        recommendations.push({
          provider: 'deepseek',
          model: AI_MODELS_CONFIG.find(p => p.id === 'deepseek')!.models.find(m => m.id === 'deepseek-coder')!,
          reason: 'Specialized for coding with support for 338 languages'
        });
        break;
        
      case 'review':
        recommendations.push({
          provider: 'anthropic',
          model: AI_MODELS_CONFIG.find(p => p.id === 'anthropic')!.models.find(m => m.id === 'claude-3-opus-20240229')!,
          reason: 'Exceptional at thorough code analysis and security review'
        });
        recommendations.push({
          provider: 'openai',
          model: AI_MODELS_CONFIG.find(p => p.id === 'openai')!.models.find(m => m.id === 'gpt-4-turbo-preview')!,
          reason: 'Strong reasoning for identifying subtle bugs and improvements'
        });
        break;
        
      case 'debugging':
        recommendations.push({
          provider: 'openai',
          model: AI_MODELS_CONFIG.find(p => p.id === 'openai')!.models.find(m => m.id === 'gpt-4-turbo-preview')!,
          reason: 'Excellent at understanding error contexts and providing fixes'
        });
        break;
        
      case 'refactoring':
        recommendations.push({
          provider: 'anthropic',
          model: AI_MODELS_CONFIG.find(p => p.id === 'anthropic')!.models.find(m => m.id === 'claude-3-5-sonnet-20241022')!,
          reason: 'Maintains code logic while improving structure and readability'
        });
        break;
        
      case 'completion':
        recommendations.push({
          provider: 'mistral',
          model: AI_MODELS_CONFIG.find(p => p.id === 'mistral')!.models.find(m => m.id === 'codestral-latest')!,
          reason: 'Optimized for code completion with fill-in-the-middle capability'
        });
        recommendations.push({
          provider: 'groq',
          model: AI_MODELS_CONFIG.find(p => p.id === 'groq')!.models.find(m => m.id === 'llama-3.1-70b-versatile')!,
          reason: 'Ultra-fast inference for real-time code completion'
        });
        break;
    }
    
    return recommendations;
  }
}