export interface CLIContext {
  version: string;
  cwd: string;
  config: CLIConfig;
  flags: CLIFlags;
}

export interface CLIConfig {
  version: string;
  project?: ProjectConfig;
  features?: FeaturesConfig;
  preferences?: PreferencesConfig;
  team?: TeamConfig;
  auth?: AuthConfig;
}

export interface ProjectConfig {
  name: string;
  framework: string;
  styling: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export interface FeaturesConfig {
  ai: boolean;
  marketplace: boolean;
  cloudSync: boolean;
  analytics: boolean;
}

export interface PreferencesConfig {
  componentStyle: 'composition' | 'declaration';
  fileNaming: 'kebab-case' | 'camelCase' | 'PascalCase';
  interactive: boolean;
  telemetry: boolean;
}

export interface TeamConfig {
  id: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface AuthConfig {
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface CLIFlags {
  debug?: boolean;
  silent?: boolean;
  json?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

export interface CLICommand {
  name: string;
  description: string;
  alias?: string[];
  options?: CommandOption[];
  action: (...args: any[]) => Promise<void>;
  subcommands?: CLICommand[];
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
  required?: boolean;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

export interface Logger {
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  verbose: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  success: (message: string, ...args: any[]) => void;
}