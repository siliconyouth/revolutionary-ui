import { BaseCommand, type CLIContext, createLogger, select, input, confirm, withSpinner } from '@revolutionary-ui/cli-core';
import { AIWorkflowEngine } from '../workflows/ai-workflow-engine.js';
import { getWorkflow, listWorkflows } from '../workflows/predefined-workflows.js';
import { getProvider } from '../providers/index.js';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export class WorkflowCommand extends BaseCommand {
  name = 'workflow [workflow-id]';
  description = 'Run AI-powered workflows for component development';
  alias = ['wf', 'flow'];
  
  options = [
    { flags: '-l, --list', description: 'List available workflows' },
    { flags: '-i, --input <path>', description: 'Input file for workflow' },
    { flags: '-o, --output <path>', description: 'Output directory for artifacts' },
    { flags: '--auto-approve', description: 'Auto-approve all workflow steps' },
    { flags: '--max-iterations <n>', description: 'Maximum workflow iterations', defaultValue: '5' },
    { flags: '-p, --provider <name>', description: 'AI provider to use' },
  ];

  async action(workflowId: string | undefined, options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🤖 AI Workflow Engine\n'));

    try {
      // List workflows if requested
      if (options.list) {
        this.listWorkflows();
        return;
      }

      // Get workflow
      let workflow;
      if (workflowId) {
        workflow = getWorkflow(workflowId);
        if (!workflow) {
          logger.error(`Unknown workflow: ${workflowId}`);
          this.listWorkflows();
          return;
        }
      } else {
        // Interactive selection
        workflow = await this.selectWorkflow();
        if (!workflow) return;
      }

      logger.info(`Selected workflow: ${chalk.cyan(workflow.name)}`);
      logger.info(chalk.gray(workflow.description));
      logger.info('');

      // Get input for workflow
      const workflowInput = await this.getWorkflowInput(workflow, options);
      
      // Configure workflow options
      if (options.autoApprove) {
        workflow.options.autoApprove = true;
      }
      if (options.maxIterations) {
        workflow.options.maxIterations = parseInt(options.maxIterations);
      }

      // Initialize AI provider
      const provider = await getProvider(context.config, options.provider);
      const engine = new AIWorkflowEngine(provider);

      // Set up event listeners
      this.setupEventListeners(engine, workflow);

      // Execute workflow
      const result = await engine.executeWorkflow(workflow, workflowInput);

      // Handle results
      await this.handleResults(result, workflow, options);

    } catch (error: any) {
      logger.error('Workflow failed:', error.message);
    }
  }

  private listWorkflows(): void {
    const logger = createLogger();
    const workflows = listWorkflows();
    
    logger.info(chalk.bold('Available Workflows:\n'));
    
    workflows.forEach(wf => {
      logger.info(`  ${chalk.cyan(wf.id.padEnd(20))} ${wf.name}`);
      logger.info(`  ${chalk.gray(' '.repeat(20))} ${chalk.gray(wf.description)}\n`);
    });
  }

  private async selectWorkflow(): Promise<any> {
    const workflows = listWorkflows();
    
    const selected = await select('Select a workflow:', 
      workflows.map(wf => ({
        name: wf.name,
        value: wf.id,
        description: wf.description,
      }))
    );

    return getWorkflow(selected);
  }

  private async getWorkflowInput(workflow: any, options: any): Promise<any> {
    const logger = createLogger();
    let input: any = {};

    // Read from file if provided
    if (options.input) {
      try {
        const content = await readFile(options.input, 'utf-8');
        input = JSON.parse(content);
        logger.info(`Loaded input from ${options.input}`);
      } catch (error) {
        logger.error(`Failed to read input file: ${error}`);
      }
    }

    // Get additional input based on workflow
    switch (workflow.id) {
      case 'component-prd':
        if (!input.description) {
          input.description = await input('Describe the component you want to build:');
        }
        break;

      case 'component-generation':
        if (!input.name) {
          input.name = await input('Component name:');
        }
        if (!input.description) {
          input.description = await input('Component description:');
        }
        if (!input.framework) {
          input.framework = await select('Framework:', [
            { name: 'React', value: 'react' },
            { name: 'Vue', value: 'vue' },
            { name: 'Angular', value: 'angular' },
            { name: 'Svelte', value: 'svelte' },
          ]);
        }
        if (!input.features) {
          input.features = await input('Features (comma-separated):', '').then(f => f.split(',').map(s => s.trim()));
        }
        break;

      case 'design-system':
        if (!input.name) {
          input.name = await input('Component name:');
        }
        break;

      case 'code-review':
        if (!input.code) {
          const filePath = await input('Path to code file:');
          try {
            input.code = await readFile(filePath, 'utf-8');
          } catch (error) {
            logger.error(`Failed to read code file: ${error}`);
          }
        }
        break;

      case 'api-endpoint':
        if (!input.description) {
          input.description = await input('Describe the API endpoint:');
        }
        break;

      case 'migration':
        if (!input.sourceCode) {
          const filePath = await input('Path to source code:');
          try {
            input.sourceCode = await readFile(filePath, 'utf-8');
          } catch (error) {
            logger.error(`Failed to read source file: ${error}`);
          }
        }
        if (!input.sourceFramework) {
          input.sourceFramework = await input('Source framework:');
        }
        if (!input.targetFramework) {
          input.targetFramework = await input('Target framework:');
        }
        break;
    }

    return input;
  }

  private setupEventListeners(engine: AIWorkflowEngine, workflow: any): void {
    const logger = createLogger();
    let currentSpinner: any;

    engine.on('workflow:start', ({ workflowId }) => {
      logger.info(chalk.bold('\n🚀 Starting workflow...\n'));
    });

    engine.on('workflow:iteration:start', ({ iteration }) => {
      logger.info(chalk.yellow(`\n📍 Iteration ${iteration}\n`));
    });

    engine.on('step:start', ({ step, name }) => {
      currentSpinner = withSpinner(`${name}...`, async () => {
        // Spinner will be stopped by step:complete or step:error
        await new Promise(() => {}); // Never resolves, spinner controlled externally
      }).catch(() => {}); // Ignore cancellation
    });

    engine.on('step:complete', ({ step, output }) => {
      if (currentSpinner) {
        currentSpinner.succeed(`✓ ${step} completed`);
        currentSpinner = null;
      }
      
      // Show preview of output
      if (typeof output === 'string' && output.length > 200) {
        logger.debug(chalk.gray(output.substring(0, 200) + '...'));
      } else if (typeof output === 'object') {
        logger.debug(chalk.gray(JSON.stringify(output, null, 2).substring(0, 200) + '...'));
      }
    });

    engine.on('step:error', ({ step, error }) => {
      if (currentSpinner) {
        currentSpinner.fail(`✗ ${step} failed: ${error.message}`);
        currentSpinner = null;
      }
    });

    engine.on('workflow:complete', ({ result }) => {
      logger.info(chalk.bold('\n✨ Workflow completed!\n'));
      
      logger.info(`Duration: ${chalk.gray(this.formatDuration(result.duration))}`);
      logger.info(`Iterations: ${chalk.gray(result.iterations)}`);
      logger.info(`Artifacts: ${chalk.gray(result.artifacts.length)}`);
    });

    engine.on('workflow:error', ({ error }) => {
      logger.error(chalk.red('\n❌ Workflow failed:'), error.message);
    });
  }

  private async handleResults(result: any, workflow: any, options: any): Promise<void> {
    const logger = createLogger();
    
    if (!result.success) {
      logger.error('\nWorkflow completed with errors:');
      result.errors.forEach((e: any) => {
        logger.error(`  ${chalk.red('•')} ${e.step}: ${e.error.message}`);
      });
      return;
    }

    // Save artifacts if output directory specified
    if (options.output) {
      await this.saveArtifacts(result.artifacts, options.output, workflow.id);
    }

    // Show key outputs
    logger.info(chalk.bold('\n📋 Workflow Outputs:\n'));
    
    Object.entries(result.outputs).forEach(([key, value]) => {
      logger.info(chalk.cyan(`${key}:`));
      
      if (typeof value === 'string') {
        // For long strings, save to file
        if (value.length > 500) {
          const filename = `${key}.${this.getFileExtension(value)}`;
          logger.info(`  ${chalk.gray(`[Saved to ${filename}]`)}`);
          if (options.output) {
            this.saveOutput(value, join(options.output, filename));
          }
        } else {
          logger.info(`  ${value}`);
        }
      } else {
        logger.info(`  ${JSON.stringify(value, null, 2)}`);
      }
      logger.info('');
    });

    // Offer to save all outputs
    if (!options.output) {
      const shouldSave = await confirm('\nSave workflow outputs to files?', true);
      if (shouldSave) {
        const outputDir = await input('Output directory:', `./${workflow.id}-output`);
        await this.saveArtifacts(result.artifacts, outputDir, workflow.id);
        logger.success(`\nOutputs saved to ${outputDir}`);
      }
    }
  }

  private async saveArtifacts(artifacts: any[], outputDir: string, workflowId: string): Promise<void> {
    const { ensureDir } = await import('@revolutionary-ui/cli-core');
    await ensureDir(outputDir);

    for (const artifact of artifacts) {
      const filename = `${artifact.step}.${this.getFileExtension(artifact.content)}`;
      const filepath = join(outputDir, filename);
      
      if (typeof artifact.content === 'string') {
        await writeFile(filepath, artifact.content);
      } else {
        await writeFile(filepath, JSON.stringify(artifact.content, null, 2));
      }
    }

    // Save metadata
    const metadata = {
      workflow: workflowId,
      timestamp: new Date().toISOString(),
      artifacts: artifacts.map(a => ({
        step: a.step,
        type: a.type,
        timestamp: a.timestamp,
      })),
    };
    
    await writeFile(
      join(outputDir, 'workflow-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  private async saveOutput(content: string, filepath: string): Promise<void> {
    const { ensureDir } = await import('@revolutionary-ui/cli-core');
    await ensureDir(join(filepath, '..'));
    await writeFile(filepath, content);
  }

  private getFileExtension(content: string): string {
    // Try to detect file type from content
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return 'json';
    }
    if (content.includes('```') || content.includes('#')) {
      return 'md';
    }
    if (content.includes('import') || content.includes('export') || content.includes('function')) {
      return 'ts';
    }
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      return 'html';
    }
    return 'txt';
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}