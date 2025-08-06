import chalk from 'chalk';

export interface CLIErrorOptions {
  code: string;
  message: string;
  suggestion?: string;
  docs?: string;
  details?: string | string[];
  exitCode?: number;
}

export class CLIError extends Error {
  code: string;
  suggestion?: string;
  docs?: string;
  details?: string | string[];
  exitCode: number;

  constructor(options: CLIErrorOptions) {
    super(options.message);
    this.name = 'CLIError';
    this.code = options.code;
    this.suggestion = options.suggestion;
    this.docs = options.docs;
    this.details = options.details;
    this.exitCode = options.exitCode || 1;
  }

  format(): string {
    const parts: string[] = [];
    
    // Error header
    parts.push(`${chalk.red.bold('Error:')} ${chalk.red(`[${this.code}]`)} ${this.message}`);
    
    // Details
    if (this.details) {
      parts.push('');
      if (Array.isArray(this.details)) {
        this.details.forEach(detail => {
          parts.push(chalk.gray(`  • ${detail}`));
        });
      } else {
        parts.push(chalk.gray(`  ${this.details}`));
      }
    }
    
    // Suggestion
    if (this.suggestion) {
      parts.push('');
      parts.push(`${chalk.yellow('💡 Suggestion:')} ${this.suggestion}`);
    }
    
    // Documentation link
    if (this.docs) {
      parts.push('');
      parts.push(`${chalk.cyan('📚 Learn more:')} ${chalk.underline(this.docs)}`);
    }
    
    return parts.join('\n');
  }
}

// Common error codes
export const ErrorCodes = {
  // Authentication
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  
  // Configuration
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',
  
  // Component
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  COMPONENT_EXISTS: 'COMPONENT_EXISTS',
  COMPONENT_INVALID: 'COMPONENT_INVALID',
  
  // Project
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_INVALID: 'PROJECT_INVALID',
  PROJECT_EXISTS: 'PROJECT_EXISTS',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // File system
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_EXISTS: 'FILE_EXISTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Dependencies
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  PACKAGE_MANAGER_ERROR: 'PACKAGE_MANAGER_ERROR',
  
  // AI
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_INVALID_PROMPT: 'AI_INVALID_PROMPT',
} as const;

// Pre-defined error factories
export const errors = {
  auth: {
    notAuthenticated: () => new CLIError({
      code: ErrorCodes.AUTH_REQUIRED,
      message: 'You must be authenticated to perform this action',
      suggestion: 'Run "rui auth login" to authenticate',
      docs: 'https://revolutionary-ui.com/docs/auth',
    }),
    
    invalidCredentials: () => new CLIError({
      code: ErrorCodes.AUTH_FAILED,
      message: 'Invalid email or password',
      suggestion: 'Check your credentials and try again. Forgot your password? Visit https://revolutionary-ui.com/forgot-password',
    }),
    
    sessionExpired: () => new CLIError({
      code: ErrorCodes.AUTH_EXPIRED,
      message: 'Your session has expired',
      suggestion: 'Run "rui auth login" to authenticate again',
    }),
  },
  
  component: {
    notFound: (name: string) => new CLIError({
      code: ErrorCodes.COMPONENT_NOT_FOUND,
      message: `Component "${name}" not found`,
      suggestion: 'Run "rui search" to find available components or "rui browse" to explore the marketplace',
      docs: 'https://revolutionary-ui.com/docs/components',
    }),
    
    alreadyExists: (name: string, path: string) => new CLIError({
      code: ErrorCodes.COMPONENT_EXISTS,
      message: `Component "${name}" already exists at ${path}`,
      suggestion: 'Use --overwrite to replace the existing component or choose a different name',
    }),
    
    invalid: (name: string, reason: string) => new CLIError({
      code: ErrorCodes.COMPONENT_INVALID,
      message: `Invalid component "${name}"`,
      details: reason,
      suggestion: 'Check the component name and try again',
    }),
  },
  
  config: {
    notFound: () => new CLIError({
      code: ErrorCodes.CONFIG_NOT_FOUND,
      message: 'No configuration file found',
      suggestion: 'Run "rui init" to create a configuration file',
      docs: 'https://revolutionary-ui.com/docs/configuration',
    }),
    
    invalid: (error: string) => new CLIError({
      code: ErrorCodes.CONFIG_INVALID,
      message: 'Invalid configuration',
      details: error,
      suggestion: 'Check your configuration file for syntax errors',
      docs: 'https://revolutionary-ui.com/docs/configuration',
    }),
    
    parseError: (file: string, error: string) => new CLIError({
      code: ErrorCodes.CONFIG_PARSE_ERROR,
      message: `Failed to parse configuration file: ${file}`,
      details: error,
      suggestion: 'Ensure the file is valid JSON, YAML, or JavaScript',
    }),
  },
  
  project: {
    notFound: () => new CLIError({
      code: ErrorCodes.PROJECT_NOT_FOUND,
      message: 'Not in a Revolutionary UI project',
      suggestion: 'Run "rui init" to initialize a new project or navigate to an existing project',
      docs: 'https://revolutionary-ui.com/docs/getting-started',
    }),
    
    invalid: (reason: string) => new CLIError({
      code: ErrorCodes.PROJECT_INVALID,
      message: 'Invalid project structure',
      details: reason,
      suggestion: 'Run "rui doctor" to diagnose and fix project issues',
    }),
    
    alreadyExists: (name: string) => new CLIError({
      code: ErrorCodes.PROJECT_EXISTS,
      message: `Project "${name}" already exists`,
      suggestion: 'Choose a different name or use --force to overwrite',
    }),
  },
  
  network: {
    connectionFailed: (url: string) => new CLIError({
      code: ErrorCodes.NETWORK_ERROR,
      message: `Failed to connect to ${url}`,
      suggestion: 'Check your internet connection and try again',
      details: 'If you\'re behind a proxy, configure HTTP_PROXY and HTTPS_PROXY environment variables',
    }),
    
    apiError: (status: number, message: string) => new CLIError({
      code: ErrorCodes.API_ERROR,
      message: `API request failed with status ${status}`,
      details: message,
      suggestion: status === 401 ? 'Run "rui auth login" to authenticate' : 
                 status === 403 ? 'Check your permissions for this resource' :
                 status === 429 ? 'Rate limit exceeded. Please wait and try again' :
                 'Try again later or contact support if the issue persists',
    }),
    
    timeout: (operation: string) => new CLIError({
      code: ErrorCodes.TIMEOUT,
      message: `Operation timed out: ${operation}`,
      suggestion: 'Check your internet connection or try again with --timeout flag',
    }),
  },
  
  file: {
    notFound: (path: string) => new CLIError({
      code: ErrorCodes.FILE_NOT_FOUND,
      message: `File not found: ${path}`,
      suggestion: 'Check the file path and try again',
    }),
    
    exists: (path: string) => new CLIError({
      code: ErrorCodes.FILE_EXISTS,
      message: `File already exists: ${path}`,
      suggestion: 'Use --overwrite to replace the existing file',
    }),
    
    permissionDenied: (path: string) => new CLIError({
      code: ErrorCodes.PERMISSION_DENIED,
      message: `Permission denied: ${path}`,
      suggestion: 'Check file permissions or run with appropriate privileges',
    }),
  },
  
  dependency: {
    installFailed: (pkg: string, error: string) => new CLIError({
      code: ErrorCodes.DEPENDENCY_ERROR,
      message: `Failed to install ${pkg}`,
      details: error,
      suggestion: 'Try running the package manager install command manually',
    }),
    
    packageManagerNotFound: (pm: string) => new CLIError({
      code: ErrorCodes.PACKAGE_MANAGER_ERROR,
      message: `Package manager "${pm}" not found`,
      suggestion: `Install ${pm} or use a different package manager with --package-manager flag`,
      docs: 'https://revolutionary-ui.com/docs/package-managers',
    }),
  },
  
  ai: {
    providerError: (provider: string, error: string) => new CLIError({
      code: ErrorCodes.AI_PROVIDER_ERROR,
      message: `AI provider "${provider}" error`,
      details: error,
      suggestion: 'Check your API key and provider configuration',
      docs: 'https://revolutionary-ui.com/docs/ai-providers',
    }),
    
    quotaExceeded: (provider: string) => new CLIError({
      code: ErrorCodes.AI_QUOTA_EXCEEDED,
      message: `AI quota exceeded for ${provider}`,
      suggestion: 'Upgrade your plan or wait for quota reset',
      docs: 'https://revolutionary-ui.com/docs/ai-quotas',
    }),
    
    invalidPrompt: (reason: string) => new CLIError({
      code: ErrorCodes.AI_INVALID_PROMPT,
      message: 'Invalid AI prompt',
      details: reason,
      suggestion: 'Provide more context or rephrase your prompt',
      docs: 'https://revolutionary-ui.com/docs/ai-prompts',
    }),
  },
};