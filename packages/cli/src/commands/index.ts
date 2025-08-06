import type { CLI } from '@revolutionary-ui/cli-core';
import { NewCommand } from './new.js';
import { GenerateCommand } from './generate.js';
import { AddCommand } from './add.js';
import { AuthCommands } from './auth/index.js';
import { ConfigCommands } from './config/index.js';
import { AICommand, WorkflowCommand, OptimizeCommand } from '@revolutionary-ui/cli-ai';
import { PublishCommand } from '@revolutionary-ui/cli-marketplace';
import { PushCommand, PullCommand, SyncCommand } from '@revolutionary-ui/cli-cloud';
import { AnalyzeCommand } from './analyze.js';
import { DoctorCommand } from './doctor.js';
import { BrowseCommand } from './browse.js';
import { BatchCommand } from './batch.js';
import { SyncRegistryCommand } from './sync-registry.js';

export async function registerCommands(cli: CLI): Promise<void> {
  // Register core commands
  const newCommand = new NewCommand();
  cli.registerCommand({
    name: newCommand.name,
    description: newCommand.description,
    alias: newCommand.alias,
    options: newCommand.options,
    action: newCommand.action.bind(newCommand)
  });

  // Component generation commands
  const generateCommand = new GenerateCommand();
  cli.registerCommand({
    name: generateCommand.name,
    description: generateCommand.description,
    alias: generateCommand.alias,
    options: generateCommand.options,
    action: generateCommand.action.bind(generateCommand)
  });

  const addCommand = new AddCommand();
  cli.registerCommand({
    name: addCommand.name,
    description: addCommand.description,
    alias: addCommand.alias,
    options: addCommand.options,
    action: addCommand.action.bind(addCommand)
  });

  // Auth commands
  await AuthCommands.register(cli);

  // Config commands
  await ConfigCommands.register(cli);

  // AI commands
  const aiCommand = new AICommand();
  cli.registerCommand({
    name: aiCommand.name,
    description: aiCommand.description,
    alias: aiCommand.alias,
    options: aiCommand.options,
    action: aiCommand.action.bind(aiCommand)
  });

  const workflowCommand = new WorkflowCommand();
  cli.registerCommand({
    name: workflowCommand.name,
    description: workflowCommand.description,
    alias: workflowCommand.alias,
    options: workflowCommand.options,
    action: workflowCommand.action.bind(workflowCommand)
  });

  const optimizeCommand = new OptimizeCommand();
  cli.registerCommand({
    name: optimizeCommand.name,
    description: optimizeCommand.description,
    alias: optimizeCommand.alias,
    options: optimizeCommand.options,
    action: optimizeCommand.action.bind(optimizeCommand)
  });

  // Browse command
  const browseCommand = new BrowseCommand();
  cli.registerCommand({
    name: browseCommand.name,
    description: browseCommand.description,
    alias: browseCommand.alias,
    options: browseCommand.options,
    action: browseCommand.action.bind(browseCommand)
  });

  const publishCommand = new PublishCommand();
  cli.registerCommand({
    name: publishCommand.name,
    description: publishCommand.description,
    alias: publishCommand.alias,
    options: publishCommand.options,
    action: publishCommand.action.bind(publishCommand)
  });

  // Analysis command
  const analyzeCommand = new AnalyzeCommand();
  cli.registerCommand({
    name: analyzeCommand.name,
    description: analyzeCommand.description,
    alias: analyzeCommand.alias,
    options: analyzeCommand.options,
    action: analyzeCommand.action.bind(analyzeCommand)
  });

  // Doctor command
  const doctorCommand = new DoctorCommand();
  cli.registerCommand({
    name: doctorCommand.name,
    description: doctorCommand.description,
    alias: doctorCommand.alias,
    options: doctorCommand.options,
    action: doctorCommand.action.bind(doctorCommand)
  });

  // Cloud sync commands
  const pushCommand = new PushCommand();
  cli.registerCommand({
    name: pushCommand.name,
    description: pushCommand.description,
    alias: pushCommand.alias,
    options: pushCommand.options,
    action: pushCommand.action.bind(pushCommand)
  });

  const pullCommand = new PullCommand();
  cli.registerCommand({
    name: pullCommand.name,
    description: pullCommand.description,
    alias: pullCommand.alias,
    options: pullCommand.options,
    action: pullCommand.action.bind(pullCommand)
  });

  const syncCommand = new SyncCommand();
  cli.registerCommand({
    name: syncCommand.name,
    description: syncCommand.description,
    alias: syncCommand.alias,
    options: syncCommand.options,
    action: syncCommand.action.bind(syncCommand)
  });

  // Batch operations command
  const batchCommand = new BatchCommand();
  cli.registerCommand({
    name: batchCommand.name,
    description: batchCommand.description,
    alias: batchCommand.alias,
    options: batchCommand.options,
    action: batchCommand.action.bind(batchCommand)
  });

  // Registry sync command
  const syncRegistryCommand = new SyncRegistryCommand();
  cli.registerCommand({
    name: syncRegistryCommand.name,
    description: syncRegistryCommand.description,
    alias: syncRegistryCommand.alias,
    options: syncRegistryCommand.options,
    action: syncRegistryCommand.action.bind(syncRegistryCommand)
  });
  
  // Add a default action for when no command is specified - launch interactive mode
  // But only if no other options like --version or --help are provided
  const program = cli.getProgram();
  
  // Override parse to handle default interactive mode
  const originalParse = program.parse.bind(program);
  program.parse = async function(argv?: string[]) {
    const args = argv || process.argv;
    
    // Check if only the program name is provided (no commands or options)
    if (args.length === 2 || (args.length === 3 && args[2] === '')) {
      const { interactiveMode } = await import('../lib/interactive-mode.js');
      await interactiveMode();
      return program;
    }
    
    // Otherwise use normal parsing
    return originalParse(argv);
  };
}