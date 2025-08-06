import { execa } from 'execa';
import { fileExists } from './fs.js';
import path from 'path';

export async function isGitRepository(cwd: string = process.cwd()): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--git-dir'], { cwd });
    return true;
  } catch {
    return false;
  }
}

export async function hasUncommittedChanges(cwd: string = process.cwd()): Promise<boolean> {
  try {
    const { stdout } = await execa('git', ['status', '--porcelain'], { cwd });
    return stdout.length > 0;
  } catch {
    return false;
  }
}

export async function getCurrentBranch(cwd: string = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function getRemoteUrl(cwd: string = process.cwd(), remote: string = 'origin'): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['remote', 'get-url', remote], { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function initGitRepository(cwd: string = process.cwd()): Promise<void> {
  await execa('git', ['init'], { cwd });
}

export async function addFiles(files: string[] = ['.'], cwd: string = process.cwd()): Promise<void> {
  await execa('git', ['add', ...files], { cwd });
}

export async function commit(message: string, cwd: string = process.cwd()): Promise<void> {
  await execa('git', ['commit', '-m', message], { cwd });
}

export async function getGitUser(cwd: string = process.cwd()): Promise<{ name?: string; email?: string }> {
  const user: { name?: string; email?: string } = {};
  
  try {
    const { stdout: name } = await execa('git', ['config', 'user.name'], { cwd });
    user.name = name.trim();
  } catch {}
  
  try {
    const { stdout: email } = await execa('git', ['config', 'user.email'], { cwd });
    user.email = email.trim();
  } catch {}
  
  return user;
}

export async function hasGitignore(cwd: string = process.cwd()): Promise<boolean> {
  return fileExists(path.join(cwd, '.gitignore'));
}

export async function getLastCommitMessage(cwd: string = process.cwd()): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['log', '-1', '--pretty=%B'], { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}