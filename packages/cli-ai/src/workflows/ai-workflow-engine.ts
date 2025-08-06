import { EventEmitter } from 'events';
import { createLogger } from '@revolutionary-ui/cli-core';
import { AIProvider } from '../providers/base-provider.js';
import { z } from 'zod';
import chalk from 'chalk';

// Workflow step schema
const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['generate', 'validate', 'optimize', 'review', 'transform', 'analyze']),
  description: z.string().optional(),
  prompt: z.string(),
  inputSchema: z.any().optional(),
  outputSchema: z.any().optional(),
  retries: z.number().default(3),
  timeout: z.number().default(60000),
  dependencies: z.array(z.string()).default([]),
  condition: z.function().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// Workflow schema
const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string().default('1.0.0'),
  steps: z.array(WorkflowStepSchema),
  context: z.record(z.any()).default({}),
  options: z.object({
    maxIterations: z.number().default(5),
    autoApprove: z.boolean().default(false),
    saveIntermediateResults: z.boolean().default(true),
    parallelExecution: z.boolean().default(false),
  }).default({}),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

export interface WorkflowResult {
  success: boolean;
  outputs: Record<string, any>;
  errors: Array<{ step: string; error: Error }>;
  duration: number;
  iterations: number;
  artifacts: Array<{
    step: string;
    type: string;
    content: any;
    timestamp: string;
  }>;
}

export interface WorkflowProgress {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  iteration: number;
  message: string;
}

export class AIWorkflowEngine extends EventEmitter {
  private logger = createLogger();
  private aiProvider: AIProvider;
  private runningWorkflows = new Map<string, AbortController>();

  constructor(aiProvider: AIProvider) {
    super();
    this.aiProvider = aiProvider;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    initialInput: any = {}
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const workflowId = `${workflow.id}-${Date.now()}`;
    const abortController = new AbortController();
    this.runningWorkflows.set(workflowId, abortController);

    const result: WorkflowResult = {
      success: true,
      outputs: {},
      errors: [],
      duration: 0,
      iterations: 0,
      artifacts: [],
    };

    try {
      // Validate workflow
      const validatedWorkflow = WorkflowSchema.parse(workflow);
      
      this.emit('workflow:start', {
        workflow: validatedWorkflow,
        workflowId,
      });

      // Initialize context with initial input
      const context = {
        ...validatedWorkflow.context,
        input: initialInput,
        outputs: {} as Record<string, any>,
      };

      // Execute workflow with iteration support
      let iteration = 0;
      let continueExecution = true;

      while (continueExecution && iteration < validatedWorkflow.options.maxIterations) {
        iteration++;
        result.iterations = iteration;

        this.emit('workflow:iteration:start', {
          workflowId,
          iteration,
        });

        // Execute steps
        const stepResults = await this.executeSteps(
          validatedWorkflow.steps,
          context,
          workflowId,
          abortController.signal
        );

        // Update context with outputs
        Object.assign(context.outputs, stepResults.outputs);
        result.outputs = context.outputs;
        result.artifacts.push(...stepResults.artifacts);

        // Check for errors
        if (stepResults.errors.length > 0) {
          result.errors.push(...stepResults.errors);
          
          // Ask if should retry or abort
          if (!validatedWorkflow.options.autoApprove) {
            const shouldRetry = await this.promptRetry(stepResults.errors);
            if (!shouldRetry) {
              continueExecution = false;
              result.success = false;
            }
          } else {
            continueExecution = false;
            result.success = false;
          }
        } else {
          // Check if workflow is complete
          const isComplete = await this.checkCompletion(
            validatedWorkflow,
            context,
            iteration
          );

          if (isComplete) {
            continueExecution = false;
          } else if (!validatedWorkflow.options.autoApprove) {
            // Ask if should continue
            const shouldContinue = await this.promptContinue(context.outputs);
            continueExecution = shouldContinue;
          }
        }

        this.emit('workflow:iteration:end', {
          workflowId,
          iteration,
          outputs: context.outputs,
        });
      }

      result.duration = Date.now() - startTime;

      this.emit('workflow:complete', {
        workflowId,
        result,
      });

      return result;
    } catch (error: any) {
      result.success = false;
      result.errors.push({ step: 'workflow', error });
      result.duration = Date.now() - startTime;

      this.emit('workflow:error', {
        workflowId,
        error,
      });

      return result;
    } finally {
      this.runningWorkflows.delete(workflowId);
    }
  }

  /**
   * Execute workflow steps
   */
  private async executeSteps(
    steps: WorkflowStep[],
    context: any,
    workflowId: string,
    signal: AbortSignal
  ): Promise<{
    outputs: Record<string, any>;
    errors: Array<{ step: string; error: Error }>;
    artifacts: Array<any>;
  }> {
    const outputs: Record<string, any> = {};
    const errors: Array<{ step: string; error: Error }> = [];
    const artifacts: Array<any> = [];

    // Build dependency graph
    const graph = this.buildDependencyGraph(steps);
    const executed = new Set<string>();

    // Execute steps in dependency order
    while (executed.size < steps.length && !signal.aborted) {
      const readySteps = steps.filter(step => 
        !executed.has(step.id) &&
        step.dependencies.every(dep => executed.has(dep))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected in workflow steps');
      }

      // Execute ready steps
      const executions = readySteps.map(async (step) => {
        try {
          // Check condition
          if (step.condition && !await step.condition(context)) {
            this.logger.debug(`Skipping step ${step.id} due to condition`);
            executed.add(step.id);
            return;
          }

          this.emit('step:start', {
            workflowId,
            step: step.id,
            name: step.name,
          });

          const stepResult = await this.executeStep(step, context, signal);
          
          outputs[step.id] = stepResult.output;
          artifacts.push({
            step: step.id,
            type: step.type,
            content: stepResult.output,
            timestamp: new Date().toISOString(),
          });

          executed.add(step.id);

          this.emit('step:complete', {
            workflowId,
            step: step.id,
            output: stepResult.output,
          });
        } catch (error: any) {
          errors.push({ step: step.id, error });
          
          this.emit('step:error', {
            workflowId,
            step: step.id,
            error,
          });

          // Stop execution on error
          throw error;
        }
      });

      await Promise.all(executions);
    }

    return { outputs, errors, artifacts };
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: any,
    signal: AbortSignal
  ): Promise<{ output: any }> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < step.retries; attempt++) {
      try {
        // Prepare prompt with context
        const prompt = this.interpolatePrompt(step.prompt, context);

        // Generate based on step type
        let output: any;

        switch (step.type) {
          case 'generate':
            output = await this.aiProvider.generate(prompt, {
              signal,
              timeout: step.timeout,
            });
            break;

          case 'validate':
            output = await this.validateOutput(prompt, context, step.outputSchema);
            break;

          case 'optimize':
            output = await this.optimizeOutput(prompt, context);
            break;

          case 'review':
            output = await this.reviewOutput(prompt, context);
            break;

          case 'transform':
            output = await this.transformOutput(prompt, context);
            break;

          case 'analyze':
            output = await this.analyzeOutput(prompt, context);
            break;

          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        // Validate output schema if provided
        if (step.outputSchema) {
          output = step.outputSchema.parse(output);
        }

        return { output };
      } catch (error: any) {
        lastError = error;
        
        if (attempt < step.retries - 1) {
          this.logger.debug(`Step ${step.id} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error(`Step ${step.id} failed after ${step.retries} attempts`);
  }

  /**
   * Interpolate prompt with context values
   */
  private interpolatePrompt(prompt: string, context: any): string {
    return prompt.replace(/\{\{(\w+)\.?(\w+)?\}\}/g, (match, obj, prop) => {
      if (prop) {
        return context[obj]?.[prop] || match;
      }
      return context[obj] || match;
    });
  }

  /**
   * Validate output using AI
   */
  private async validateOutput(prompt: string, context: any, schema?: any): Promise<any> {
    const validationPrompt = `
${prompt}

Context:
${JSON.stringify(context, null, 2)}

Please validate the output and return:
1. "valid": true/false
2. "errors": array of validation errors (if any)
3. "suggestions": array of improvement suggestions
`;

    const result = await this.aiProvider.generate(validationPrompt);
    return JSON.parse(result);
  }

  /**
   * Optimize output using AI
   */
  private async optimizeOutput(prompt: string, context: any): Promise<any> {
    const optimizationPrompt = `
${prompt}

Current Output:
${JSON.stringify(context.outputs, null, 2)}

Please optimize the output for:
1. Performance
2. Readability
3. Best practices
4. Code reduction

Return the optimized version.
`;

    return this.aiProvider.generate(optimizationPrompt);
  }

  /**
   * Review output using AI
   */
  private async reviewOutput(prompt: string, context: any): Promise<any> {
    const reviewPrompt = `
${prompt}

Output to Review:
${JSON.stringify(context.outputs, null, 2)}

Please provide a comprehensive review including:
1. Quality assessment
2. Potential issues
3. Improvement suggestions
4. Security considerations
`;

    return this.aiProvider.generate(reviewPrompt);
  }

  /**
   * Transform output using AI
   */
  private async transformOutput(prompt: string, context: any): Promise<any> {
    return this.aiProvider.generate(prompt);
  }

  /**
   * Analyze output using AI
   */
  private async analyzeOutput(prompt: string, context: any): Promise<any> {
    const analysisPrompt = `
${prompt}

Data to Analyze:
${JSON.stringify(context.outputs, null, 2)}

Provide detailed analysis including patterns, insights, and recommendations.
`;

    return this.aiProvider.generate(analysisPrompt);
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(steps: WorkflowStep[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    steps.forEach(step => {
      graph.set(step.id, new Set(step.dependencies));
    });

    return graph;
  }

  /**
   * Check if workflow is complete
   */
  private async checkCompletion(
    workflow: Workflow,
    context: any,
    iteration: number
  ): Promise<boolean> {
    // Default completion: all steps executed successfully
    return true;
  }

  /**
   * Prompt user to retry after errors
   */
  private async promptRetry(errors: Array<{ step: string; error: Error }>): Promise<boolean> {
    const { confirm } = await import('@revolutionary-ui/cli-core');
    
    this.logger.error('\nWorkflow encountered errors:');
    errors.forEach(({ step, error }) => {
      this.logger.error(`  ${chalk.red('✗')} ${step}: ${error.message}`);
    });

    return confirm('\nWould you like to retry?', true);
  }

  /**
   * Prompt user to continue workflow
   */
  private async promptContinue(outputs: Record<string, any>): Promise<boolean> {
    const { confirm } = await import('@revolutionary-ui/cli-core');
    
    this.logger.info('\nCurrent workflow outputs:');
    Object.entries(outputs).forEach(([key, value]) => {
      this.logger.info(`  ${chalk.cyan(key)}: ${JSON.stringify(value).substring(0, 100)}...`);
    });

    return confirm('\nContinue with next iteration?', true);
  }

  /**
   * Stop a running workflow
   */
  stopWorkflow(workflowId: string): void {
    const controller = this.runningWorkflows.get(workflowId);
    if (controller) {
      controller.abort();
      this.runningWorkflows.delete(workflowId);
    }
  }
}