import { execa } from 'execa';
import { fileExists } from './fs.js';
import path from 'path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export async function detectPackageManager(cwd: string = process.cwd()): Promise<PackageManager> {
  // Check for lockfiles
  if (await fileExists(path.join(cwd, 'bun.lockb'))) return 'bun';
  if (await fileExists(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fileExists(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (await fileExists(path.join(cwd, 'package-lock.json'))) return 'npm';

  // Check for workspace files
  if (await fileExists(path.join(cwd, 'pnpm-workspace.yaml'))) return 'pnpm';

  // Check user agent from npm config
  try {
    const { stdout } = await execa('npm', ['config', 'get', 'user-agent'], { cwd });
    if (stdout.includes('bun')) return 'bun';
    if (stdout.includes('pnpm')) return 'pnpm';
    if (stdout.includes('yarn')) return 'yarn';
  } catch {}

  // Default to npm
  return 'npm';
}

export function getInstallCommand(packageManager: PackageManager, dev: boolean = false): string[] {
  const commands: Record<PackageManager, string[]> = {
    npm: ['install', dev ? '--save-dev' : '--save'],
    yarn: ['add', dev ? '--dev' : ''],
    pnpm: ['add', dev ? '--save-dev' : ''],
    bun: ['add', dev ? '--dev' : ''],
  };

  return commands[packageManager].filter(Boolean);
}

export function getExecCommand(packageManager: PackageManager): string[] {
  const commands: Record<PackageManager, string[]> = {
    npm: ['run'],
    yarn: ['run'],
    pnpm: ['run'],
    bun: ['run'],
  };

  return commands[packageManager];
}

export function getGlobalInstallCommand(packageManager: PackageManager): string[] {
  const commands: Record<PackageManager, string[]> = {
    npm: ['install', '--global'],
    yarn: ['global', 'add'],
    pnpm: ['add', '--global'],
    bun: ['add', '--global'],
  };

  return commands[packageManager];
}

export async function installDependencies(
  cwd: string = process.cwd(),
  packageManager?: PackageManager
): Promise<void> {
  const pm = packageManager || (await detectPackageManager(cwd));
  await execa(pm, ['install'], { cwd, stdio: 'inherit' });
}

export async function addDependency(
  packageName: string,
  options: {
    cwd?: string;
    dev?: boolean;
    packageManager?: PackageManager;
  } = {}
): Promise<void> {
  const { cwd = process.cwd(), dev = false, packageManager } = options;
  const pm = packageManager || (await detectPackageManager(cwd));
  const installCmd = getInstallCommand(pm, dev);
  
  await execa(pm, [...installCmd, packageName], { cwd, stdio: 'inherit' });
}

export async function removeDependency(
  packageName: string,
  options: {
    cwd?: string;
    packageManager?: PackageManager;
  } = {}
): Promise<void> {
  const { cwd = process.cwd(), packageManager } = options;
  const pm = packageManager || (await detectPackageManager(cwd));
  
  const removeCommands: Record<PackageManager, string[]> = {
    npm: ['uninstall'],
    yarn: ['remove'],
    pnpm: ['remove'],
    bun: ['remove'],
  };

  await execa(pm, [...removeCommands[pm], packageName], { cwd, stdio: 'inherit' });
}

export async function runScript(
  scriptName: string,
  options: {
    cwd?: string;
    packageManager?: PackageManager;
  } = {}
): Promise<void> {
  const { cwd = process.cwd(), packageManager } = options;
  const pm = packageManager || (await detectPackageManager(cwd));
  const execCmd = getExecCommand(pm);
  
  await execa(pm, [...execCmd, scriptName], { cwd, stdio: 'inherit' });
}