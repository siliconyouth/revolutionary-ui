import { BaseCommand, type CLIContext, input, select, multiselect, confirm, withSpinner } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import path from 'path';

export class NewCommand extends BaseCommand {
  name = 'new <project-name>';
  description = 'Create a new Revolutionary UI project';
  alias = ['create'];
  
  options = [
    { flags: '-t, --template <name>', description: 'Use a specific template' },
    { flags: '--no-git', description: 'Skip git initialization' },
    { flags: '--no-install', description: 'Skip dependency installation' },
    { flags: '-p, --package-manager <pm>', description: 'Package manager to use (npm, yarn, pnpm, bun)' },
  ];

  async action(projectName: string, options: any, context: CLIContext): Promise<void> {
    const { createLogger } = await import('@revolutionary-ui/cli-core');
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🚀 Creating a new Revolutionary UI project\n'));

    // Validate project name
    const { validateProjectName, errors } = await import('@revolutionary-ui/cli-core');
    if (!validateProjectName(projectName)) {
      throw errors.project.invalid('Project name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens.');
    }

    // Check if directory exists
    const projectPath = path.resolve(process.cwd(), projectName);
    const { fileExists } = await import('@revolutionary-ui/cli-core');
    if (await fileExists(projectPath)) {
      const overwrite = await confirm(`Directory ${projectName} already exists. Overwrite?`, false);
      if (!overwrite) {
        throw errors.project.alreadyExists(projectName);
      }
    }

    // Interactive prompts for project configuration
    const framework = await select('Which framework would you like to use?', [
      { name: 'Next.js', value: 'nextjs', description: 'Full-stack React framework' },
      { name: 'React', value: 'react', description: 'Library for web and native UIs' },
      { name: 'Vue', value: 'vue', description: 'Progressive JavaScript framework' },
      { name: 'Angular', value: 'angular', description: 'Platform for building web apps' },
      { name: 'Svelte', value: 'svelte', description: 'Cybernetically enhanced web apps' },
      { name: 'Solid', value: 'solid', description: 'Simple and performant reactivity' },
    ]);

    const styling = await select('Which styling system would you like to use?', [
      { name: 'Tailwind CSS', value: 'tailwind', description: 'Utility-first CSS framework' },
      { name: 'CSS Modules', value: 'css-modules', description: 'Locally scoped CSS' },
      { name: 'Styled Components', value: 'styled-components', description: 'CSS-in-JS styling' },
      { name: 'Emotion', value: 'emotion', description: 'CSS-in-JS library' },
      { name: 'Vanilla CSS', value: 'css', description: 'Plain CSS files' },
    ]);

    const features = await multiselect('Which features would you like to include?', [
      { name: 'TypeScript', value: 'typescript', description: 'Type-safe JavaScript' },
      { name: 'ESLint', value: 'eslint', description: 'Code linting' },
      { name: 'Prettier', value: 'prettier', description: 'Code formatting' },
      { name: 'Testing', value: 'testing', description: 'Unit and integration tests' },
      { name: 'Authentication', value: 'auth', description: 'User authentication' },
      { name: 'Database', value: 'database', description: 'Database integration' },
      { name: 'AI Integration', value: 'ai', description: 'AI-powered features' },
    ]);

    // Detect or use specified package manager
    const { detectPackageManager } = await import('@revolutionary-ui/cli-core');
    const packageManager = options.packageManager || await detectPackageManager();

    // Show configuration summary
    logger.info(chalk.bold('\n📋 Project Configuration:\n'));
    logger.info(`  ${chalk.gray('Name:')}        ${projectName}`);
    logger.info(`  ${chalk.gray('Framework:')}   ${framework}`);
    logger.info(`  ${chalk.gray('Styling:')}     ${styling}`);
    logger.info(`  ${chalk.gray('Features:')}    ${features.join(', ') || 'None'}`);
    logger.info(`  ${chalk.gray('Package Manager:')} ${packageManager}`);
    
    const proceed = await confirm('\nProceed with this configuration?', true);
    if (!proceed) {
      logger.info('Operation cancelled.');
      return;
    }

    // Create project
    await withSpinner('Creating project structure', async () => {
      const { createProject } = await import('../lib/create-project.js');
      await createProject({
        name: projectName,
        path: projectPath,
        framework,
        styling,
        features,
        packageManager,
      });
    });

    // Initialize git repository
    if (options.git !== false) {
      await withSpinner('Initializing git repository', async () => {
        const { initGitRepository, addFiles, commit } = await import('@revolutionary-ui/cli-core');
        await initGitRepository(projectPath);
        await addFiles(['.'], projectPath);
        await commit('Initial commit from Revolutionary UI', projectPath);
      });
    }

    // Install dependencies
    if (options.install !== false) {
      await withSpinner(`Installing dependencies with ${packageManager}`, async () => {
        const { installDependencies } = await import('@revolutionary-ui/cli-core');
        await installDependencies(projectPath, packageManager);
      });
    }

    // Success message
    logger.success(chalk.green.bold('\n✨ Project created successfully!\n'));
    logger.info('Next steps:');
    logger.info(chalk.cyan(`  cd ${projectName}`));
    if (options.install === false) {
      logger.info(chalk.cyan(`  ${packageManager} install`));
    }
    logger.info(chalk.cyan(`  ${packageManager} ${packageManager === 'npm' ? 'run ' : ''}dev`));
    logger.info('\nHappy coding! 🎉\n');
  }
}