import fs from 'fs-extra';
import path from 'path';
import { glob, type GlobOptions } from 'glob';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  return fs.readFile(filePath, encoding);
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readJson<T = any>(filePath: string): Promise<T> {
  return fs.readJson(filePath);
}

export async function writeJson(filePath: string, data: any, options?: fs.WriteOptions): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2, ...options });
}

export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

export async function removeFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

export async function findFiles(pattern: string, options?: GlobOptions): Promise<string[]> {
  const results = await glob(pattern, options || {});
  return results.map(r => typeof r === 'string' ? r : r.toString());
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}

export function joinPath(...paths: string[]): string {
  return path.join(...paths);
}

export function getBasename(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

export function getExtname(filePath: string): string {
  return path.extname(filePath);
}