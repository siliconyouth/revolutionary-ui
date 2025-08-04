export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateComponentName(name: string): boolean {
  // Component names must be PascalCase
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/
  return pascalCaseRegex.test(name)
}

export function validatePackageName(name: string): boolean {
  // NPM package name rules
  const packageNameRegex = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  return packageNameRegex.test(name)
}

export function validateFramework(framework: string): boolean {
  const validFrameworks = [
    'react', 'vue', 'angular', 'svelte', 'solid',
    'preact', 'alpine', 'lit', 'vanilla', 'next',
    'nuxt', 'gatsby', 'remix', 'astro', 'qwik'
  ]
  return validFrameworks.includes(framework.toLowerCase())
}

export function validateStyleSystem(style: string): boolean {
  const validStyles = [
    'tailwind', 'css', 'scss', 'sass', 'less',
    'styled-components', 'emotion', 'css-modules',
    'vanilla-extract', 'stitches', 'panda-css'
  ]
  return validStyles.includes(style.toLowerCase())
}

export function validateAIProvider(provider: string): boolean {
  const validProviders = ['openai', 'anthropic', 'google', 'mistral']
  return validProviders.includes(provider.toLowerCase())
}

export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateGitHubRepo(repo: string): boolean {
  // Format: owner/repo
  const repoRegex = /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/
  return repoRegex.test(repo)
}

export function validateSemver(version: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  return semverRegex.test(version)
}

export function validatePrice(price: number): boolean {
  return price >= 0 && price <= 999.99 && Number.isFinite(price)
}

export function validateTeamRole(role: string): boolean {
  const validRoles = ['owner', 'admin', 'developer', 'viewer']
  return validRoles.includes(role.toLowerCase())
}

export function sanitizeFilename(filename: string): string {
  // Remove invalid characters for filenames
  return filename.replace(/[<>:"/\\|?*]/g, '-')
}

export function sanitizeComponentCode(code: string): string {
  // Basic XSS prevention
  return code
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}