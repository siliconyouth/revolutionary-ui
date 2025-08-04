import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { exec } from 'child_process'
import { promisify } from 'util'
import { WizardConfig } from './configuration-wizard'

const execAsync = promisify(exec)

export interface ProjectTemplate {
  name: string
  description: string
  files: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

export class ProjectGenerator {
  private templatesDir = path.join(__dirname, '../../../templates')

  async generateProject(projectName: string, config: WizardConfig): Promise<string> {
    const projectPath = path.join(process.cwd(), projectName)
    
    // Check if directory already exists
    try {
      await fs.access(projectPath)
      throw new Error(`Directory ${projectName} already exists. Please choose a different name.`)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    const spinner = ora('Creating project directory...').start()

    try {
      // Create project directory
      await fs.mkdir(projectPath, { recursive: true })
      
      spinner.text = 'Generating project structure...'
      
      // Generate base structure
      await this.createBaseStructure(projectPath, config)
      
      spinner.text = 'Creating configuration files...'
      
      // Create config files
      await this.createConfigFiles(projectPath, config)
      
      spinner.text = 'Setting up package.json...'
      
      // Create package.json
      await this.createPackageJson(projectPath, projectName, config)
      
      spinner.text = 'Creating Revolutionary UI configuration...'
      
      // Create Revolutionary UI config
      await this.createRevolutionaryConfig(projectPath, config)
      
      spinner.text = 'Setting up components directory...'
      
      // Create components structure
      await this.createComponentsStructure(projectPath, config)
      
      spinner.text = 'Adding example components...'
      
      // Add example components
      await this.addExampleComponents(projectPath, config)
      
      spinner.text = 'Creating documentation...'
      
      // Create README and docs
      await this.createDocumentation(projectPath, projectName, config)
      
      spinner.text = 'Setting up Git repository...'
      
      // Initialize git
      await this.initializeGit(projectPath)
      
      spinner.succeed('Project created successfully!')
      
      return projectPath
    } catch (error) {
      spinner.fail('Failed to create project')
      // Clean up on failure
      try {
        await fs.rm(projectPath, { recursive: true, force: true })
      } catch {}
      throw error
    }
  }

  private async createBaseStructure(projectPath: string, config: WizardConfig): Promise<void> {
    const dirs = [
      'src',
      'src/components',
      'src/components/generated',
      'src/factories',
      'src/lib',
      'src/hooks',
      'src/utils',
      'src/styles',
      'src/types',
      'public',
      'tests',
      '.revolutionary-ui'
    ]

    // Add framework-specific directories
    if (config.project.framework === 'Next.js') {
      dirs.push('src/app', 'src/pages/api')
    } else if (config.project.framework === 'Vue') {
      dirs.push('src/views', 'src/router', 'src/store')
    } else if (config.project.framework === 'Angular') {
      dirs.push('src/app/services', 'src/app/modules')
    }

    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true })
    }
  }

  private async createConfigFiles(projectPath: string, config: WizardConfig): Promise<void> {
    // TypeScript config
    if (config.project.typescript) {
      const tsConfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          jsx: config.project.framework === 'React' || config.project.framework === 'Next.js' ? 'react-jsx' : 'preserve',
          moduleResolution: 'node',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          paths: {
            '@/*': ['./src/*'],
            '@components/*': ['./src/components/*'],
            '@factories/*': ['./src/factories/*']
          }
        },
        include: ['src'],
        exclude: ['node_modules']
      }
      
      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      )
    }

    // ESLint config
    const eslintConfig = {
      extends: [
        config.project.typescript ? 'eslint:recommended' : 'eslint:recommended',
        config.project.framework === 'React' ? 'plugin:react/recommended' : null,
        config.project.framework === 'Vue' ? 'plugin:vue/vue3-recommended' : null
      ].filter(Boolean),
      parser: config.project.typescript ? '@typescript-eslint/parser' : undefined,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: config.project.framework === 'React' ? { jsx: true } : undefined
      },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'warn'
      }
    }

    await fs.writeFile(
      path.join(projectPath, '.eslintrc.json'),
      JSON.stringify(eslintConfig, null, 2)
    )

    // Prettier config
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false
    }

    await fs.writeFile(
      path.join(projectPath, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    )

    // .gitignore
    const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
dist/
build/
out/

# Environment
.env
.env.local
.env.*.local

# Revolutionary UI
.revolutionary-ui.config.json
.revolutionary-ui/cache/
.revolutionary-ui/temp/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Next.js
.next/
*.next/

# Logs
logs/
*.log
`

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)

    // Style system config
    if (config.project.styleSystem === 'tailwind') {
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
`
      await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig)
    }
  }

  private async createPackageJson(projectPath: string, projectName: string, config: WizardConfig): Promise<void> {
    const packageJson: any = {
      name: projectName,
      version: '0.1.0',
      private: true,
      description: `${projectName} - Built with Revolutionary UI`,
      scripts: {
        'dev': this.getDevScript(config.project.framework),
        'build': this.getBuildScript(config.project.framework),
        'start': this.getStartScript(config.project.framework),
        'lint': 'eslint src --ext .js,.jsx,.ts,.tsx',
        'format': 'prettier --write "src/**/*.{js,jsx,ts,tsx,css,md}"',
        'rui': 'revolutionary-ui',
        'rui:generate': 'revolutionary-ui generate',
        'rui:catalog': 'revolutionary-ui catalog',
        'rui:analyze': 'revolutionary-ui analyze'
      },
      dependencies: {
        'revolutionary-ui': '^3.0.0',
        ...this.getFrameworkDependencies(config.project.framework),
        ...this.getStyleDependencies(config.project.styleSystem)
      },
      devDependencies: {
        ...this.getDevDependencies(config.project),
        ...this.getFrameworkDevDependencies(config.project.framework)
      }
    }

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
  }

  private async createRevolutionaryConfig(projectPath: string, config: WizardConfig): Promise<void> {
    const ruiConfig = {
      version: '3.0.0',
      project: config.project,
      preferences: config.preferences,
      features: config.features,
      advanced: config.advanced,
      createdAt: new Date().toISOString(),
      sessionId: this.generateSessionId()
    }

    await fs.writeFile(
      path.join(projectPath, '.revolutionary-ui', 'config.json'),
      JSON.stringify(ruiConfig, null, 2)
    )
  }

  private async createComponentsStructure(projectPath: string, config: WizardConfig): Promise<void> {
    // Create component directories
    const componentDirs = [
      'ui',
      'forms',
      'tables',
      'cards',
      'modals',
      'navigation',
      'layout',
      'feedback'
    ]

    for (const dir of componentDirs) {
      await fs.mkdir(path.join(projectPath, 'src/components', dir), { recursive: true })
    }

    // Create index files
    const indexContent = `// Revolutionary UI Components
export * from './ui'
export * from './forms'
export * from './tables'
export * from './cards'
export * from './modals'
export * from './navigation'
export * from './layout'
export * from './feedback'
`

    await fs.writeFile(
      path.join(projectPath, 'src/components/index.ts'),
      indexContent
    )
  }

  private async addExampleComponents(projectPath: string, config: WizardConfig): Promise<void> {
    // Add a sample Button component
    const ext = config.project.typescript ? 'tsx' : 'jsx'
    
    const buttonComponent = config.project.framework === 'React' || config.project.framework === 'Next.js' ? 
`import React from 'react'
${config.project.styleSystem === 'tailwind' ? '' : "import './Button.css'"}

${config.project.typescript ? 'interface ButtonProps {\n  children: React.ReactNode\n  onClick?: () => void\n  variant?: "primary" | "secondary"\n  disabled?: boolean\n}\n\n' : ''}
export const Button${config.project.typescript ? ': React.FC<ButtonProps>' : ''} = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      className={\`btn btn-\${variant}\${disabled ? ' btn-disabled' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
` : 
`<template>
  <button 
    :class="['btn', \`btn-\${variant}\`, { 'btn-disabled': disabled }]"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
`

    await fs.writeFile(
      path.join(projectPath, 'src/components/ui', `Button.${ext}`),
      buttonComponent
    )

    // Add example factory
    const formFactoryExample = `import { FormFactory } from 'revolutionary-ui'

// Example: Creating a login form with validation
export const LoginForm = FormFactory.create({
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      validation: {
        required: true,
        email: true
      }
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      validation: {
        required: true,
        minLength: 8
      }
    }
  ],
  submitLabel: 'Sign In',
  onSubmit: async (data) => {
    console.log('Login data:', data)
    // Handle login logic here
  }
})
`

    await fs.writeFile(
      path.join(projectPath, 'src/factories', `LoginForm.${config.project.typescript ? 'ts' : 'js'}`),
      formFactoryExample
    )
  }

  private async createDocumentation(projectPath: string, projectName: string, config: WizardConfig): Promise<void> {
    const readme = `# ${projectName}

Built with [Revolutionary UI](https://revolutionary-ui.com) - AI-Powered Component Generation

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
${config.project.packageManager} install

# Start development server
${config.project.packageManager} run dev

# Generate components with AI
${config.project.packageManager} run rui:generate
\`\`\`

## 📁 Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── components/      # UI components
│   │   ├── generated/   # AI-generated components
│   │   ├── ui/         # Base UI components
│   │   ├── forms/      # Form components
│   │   └── ...
│   ├── factories/      # Revolutionary UI factories
│   ├── lib/           # Utilities and helpers
│   └── types/         # TypeScript types
├── public/            # Static assets
├── tests/            # Test files
└── .revolutionary-ui/ # RUI configuration
\`\`\`

## 🎯 Revolutionary UI Features

- **AI Generation**: Generate components with natural language
- **Component Catalog**: Browse 10,000+ components
- **Factory System**: 60-95% code reduction
- **Framework**: ${config.project.framework}
- **Styling**: ${config.project.styleSystem}
- **Language**: ${config.project.language}

## 🤖 AI Commands

\`\`\`bash
# Generate a form component
${config.project.packageManager} run rui:generate form

# Generate a dashboard
${config.project.packageManager} run rui:generate dashboard

# Browse component catalog
${config.project.packageManager} run rui:catalog

# Analyze project for optimization
${config.project.packageManager} run rui:analyze
\`\`\`

## 📚 Component Factories

Revolutionary UI provides powerful factories for common UI patterns:

### Form Factory
\`\`\`${config.project.typescript ? 'typescript' : 'javascript'}
import { FormFactory } from 'revolutionary-ui'

const ContactForm = FormFactory.create({
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'message', type: 'textarea', label: 'Message', rows: 5 }
  ],
  onSubmit: async (data) => {
    // Handle form submission
  }
})
\`\`\`

### Table Factory
\`\`\`${config.project.typescript ? 'typescript' : 'javascript'}
import { TableFactory } from 'revolutionary-ui'

const UserTable = TableFactory.create({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', filterable: true }
  ],
  data: users,
  pagination: true,
  pageSize: 20
})
\`\`\`

## 🔧 Configuration

Your Revolutionary UI configuration is stored in \`.revolutionary-ui/config.json\`

### Enabled Features:
${Object.entries(config.features)
  .filter(([_, enabled]) => enabled)
  .map(([feature]) => `- ✅ ${feature}`)
  .join('\n')}

## 📖 Learn More

- [Revolutionary UI Documentation](https://revolutionary-ui.com/docs)
- [Component Catalog](https://revolutionary-ui.com/catalog)
- [API Reference](https://revolutionary-ui.com/api)
- [Examples](https://revolutionary-ui.com/examples)

## 🤝 Support

- GitHub: [https://github.com/siliconyouth/revolutionary-ui](https://github.com/siliconyouth/revolutionary-ui)
- Email: support@revolutionary-ui.com
- Discord: [Join our community](https://discord.gg/revolutionary-ui)

---

Created with ❤️ by Revolutionary UI v3.0
`

    await fs.writeFile(path.join(projectPath, 'README.md'), readme)
  }

  private async initializeGit(projectPath: string): Promise<void> {
    try {
      await execAsync('git init', { cwd: projectPath })
      await execAsync('git add .', { cwd: projectPath })
      await execAsync('git commit -m "Initial commit - Revolutionary UI project"', { cwd: projectPath })
    } catch (error) {
      // Git initialization is optional, don't throw
      console.log(chalk.yellow('\n⚠️  Git initialization skipped'))
    }
  }

  private getDevScript(framework: string): string {
    switch (framework) {
      case 'Next.js': return 'next dev'
      case 'React': return 'vite'
      case 'Vue': return 'vite'
      case 'Angular': return 'ng serve'
      case 'Svelte': return 'vite dev'
      default: return 'vite'
    }
  }

  private getBuildScript(framework: string): string {
    switch (framework) {
      case 'Next.js': return 'next build'
      case 'React': return 'vite build'
      case 'Vue': return 'vite build'
      case 'Angular': return 'ng build'
      case 'Svelte': return 'vite build'
      default: return 'vite build'
    }
  }

  private getStartScript(framework: string): string {
    switch (framework) {
      case 'Next.js': return 'next start'
      case 'Angular': return 'ng serve --prod'
      default: return 'vite preview'
    }
  }

  private getFrameworkDependencies(framework: string): Record<string, string> {
    switch (framework) {
      case 'React':
        return {
          'react': '^18.2.0',
          'react-dom': '^18.2.0'
        }
      case 'Next.js':
        return {
          'next': '^14.0.0',
          'react': '^18.2.0',
          'react-dom': '^18.2.0'
        }
      case 'Vue':
        return {
          'vue': '^3.3.0'
        }
      case 'Angular':
        return {
          '@angular/animations': '^17.0.0',
          '@angular/common': '^17.0.0',
          '@angular/compiler': '^17.0.0',
          '@angular/core': '^17.0.0',
          '@angular/forms': '^17.0.0',
          '@angular/platform-browser': '^17.0.0',
          '@angular/platform-browser-dynamic': '^17.0.0',
          '@angular/router': '^17.0.0',
          'rxjs': '^7.8.0',
          'tslib': '^2.6.0',
          'zone.js': '^0.14.0'
        }
      case 'Svelte':
        return {
          'svelte': '^4.0.0'
        }
      default:
        return {}
    }
  }

  private getFrameworkDevDependencies(framework: string): Record<string, string> {
    const base = {
      'vite': '^5.0.0'
    }

    switch (framework) {
      case 'React':
        return {
          ...base,
          '@vitejs/plugin-react': '^4.0.0',
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0'
        }
      case 'Vue':
        return {
          ...base,
          '@vitejs/plugin-vue': '^4.0.0',
          '@vue/compiler-sfc': '^3.3.0'
        }
      case 'Angular':
        return {
          '@angular-devkit/build-angular': '^17.0.0',
          '@angular/cli': '^17.0.0',
          '@angular/compiler-cli': '^17.0.0'
        }
      case 'Svelte':
        return {
          ...base,
          '@sveltejs/vite-plugin-svelte': '^3.0.0',
          'svelte-check': '^3.0.0'
        }
      default:
        return base
    }
  }

  private getStyleDependencies(styleSystem: string): Record<string, string> {
    switch (styleSystem) {
      case 'tailwind':
        return {
          'tailwindcss': '^3.3.0',
          'autoprefixer': '^10.4.0',
          'postcss': '^8.4.0'
        }
      case 'styled-components':
        return {
          'styled-components': '^6.0.0'
        }
      case 'emotion':
        return {
          '@emotion/react': '^11.11.0',
          '@emotion/styled': '^11.11.0'
        }
      case 'scss':
        return {
          'sass': '^1.69.0'
        }
      default:
        return {}
    }
  }

  private getDevDependencies(project: any): Record<string, string> {
    const deps: Record<string, string> = {
      'eslint': '^8.50.0',
      'prettier': '^3.0.0'
    }

    if (project.typescript) {
      deps['typescript'] = '^5.2.0'
      deps['@typescript-eslint/parser'] = '^6.0.0'
      deps['@typescript-eslint/eslint-plugin'] = '^6.0.0'
    }

    return deps
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `${timestamp}-${random}`
  }
}