import { z } from 'zod';
import semver from 'semver';

// Common validation schemas
export const ComponentNameSchema = z
  .string()
  .min(1, 'Component name cannot be empty')
  .regex(/^[a-zA-Z][a-zA-Z0-9-_]*$/, 'Component name must start with a letter and contain only letters, numbers, hyphens, and underscores');

export const ProjectNameSchema = z
  .string()
  .min(1, 'Project name cannot be empty')
  .regex(/^[a-z][a-z0-9-]*$/, 'Project name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens');

export const EmailSchema = z.string().email('Invalid email format');

export const URLSchema = z.string().url('Invalid URL format');

export const VersionSchema = z.string().refine(
  (val) => semver.valid(val) !== null,
  'Invalid semantic version format'
);

export const FrameworkSchema = z.enum([
  'react',
  'vue',
  'angular',
  'svelte',
  'solid',
  'preact',
  'lit',
  'alpine',
  'qwik',
  'astro',
]);

export const StylingSystemSchema = z.enum([
  'css',
  'scss',
  'sass',
  'less',
  'stylus',
  'tailwind',
  'css-modules',
  'styled-components',
  'emotion',
  'vanilla-extract',
  'stitches',
  'uno',
]);

export const ComponentTypeSchema = z.enum([
  'button',
  'input',
  'select',
  'textarea',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'form',
  'table',
  'card',
  'modal',
  'drawer',
  'tabs',
  'accordion',
  'menu',
  'navbar',
  'sidebar',
  'footer',
  'hero',
  'grid',
  'list',
  'chart',
  'dashboard',
  'calendar',
  'datepicker',
  'timepicker',
  'upload',
  'avatar',
  'badge',
  'chip',
  'progress',
  'spinner',
  'skeleton',
  'toast',
  'tooltip',
  'popover',
  'dropdown',
  'breadcrumb',
  'pagination',
  'stepper',
  'timeline',
  'tree',
  'kanban',
  'custom',
]);

// Validation functions
export function validateComponentName(name: string): boolean {
  try {
    ComponentNameSchema.parse(name);
    return true;
  } catch {
    return false;
  }
}

export function validateProjectName(name: string): boolean {
  try {
    ProjectNameSchema.parse(name);
    return true;
  } catch {
    return false;
  }
}

export function validateEmail(email: string): boolean {
  try {
    EmailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateURL(url: string): boolean {
  try {
    URLSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function validateVersion(version: string): boolean {
  try {
    VersionSchema.parse(version);
    return true;
  } catch {
    return false;
  }
}

// Path validation
export function validatePath(path: string): boolean {
  // Basic path validation - no null bytes, must not be empty
  if (!path || path.includes('\0')) {
    return false;
  }
  
  // Check for common invalid patterns
  const invalidPatterns = [
    /\.\./,  // Parent directory traversal
    /^~/,    // Home directory (should be expanded first)
    /[\x00-\x1f\x7f]/,  // Control characters
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(path));
}

// File name validation
export function validateFileName(fileName: string): boolean {
  // Check for empty or invalid characters
  if (!fileName || fileName.includes('\0')) {
    return false;
  }
  
  // Check for reserved names on Windows
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ];
  
  const nameWithoutExt = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  return !invalidChars.test(fileName);
}

// Create a custom validator function
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (value: unknown): { valid: boolean; data?: T; error?: string } => {
    try {
      const data = schema.parse(value);
      return { valid: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message };
      }
      return { valid: false, error: 'Validation failed' };
    }
  };
}