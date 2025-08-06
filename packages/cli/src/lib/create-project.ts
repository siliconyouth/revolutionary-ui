import { ensureDir, writeFile, copyFile, fileExists } from '@revolutionary-ui/cli-core';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectOptions {
  name: string;
  path: string;
  framework: string;
  styling: string;
  features: string[];
  packageManager: string;
}

export async function createProject(options: ProjectOptions): Promise<void> {
  const { name, path: projectPath, framework, styling, features } = options;
  
  // Create project directory
  await ensureDir(projectPath);
  
  // Create basic structure
  await createProjectStructure(projectPath, framework);
  
  // Create package.json
  await createPackageJson(projectPath, name, framework, styling, features);
  
  // Create configuration files
  await createConfigFiles(projectPath, framework, styling, features);
  
  // Create source files
  await createSourceFiles(projectPath, framework, styling);
  
  // Create gitignore
  await createGitignore(projectPath);
  
  // Create README
  await createReadme(projectPath, name, framework);
}

async function createProjectStructure(projectPath: string, framework: string): Promise<void> {
  const directories = [
    'src',
    'src/components',
    'src/components/ui',
    'src/lib',
    'src/hooks',
    'src/styles',
    'public',
  ];
  
  // Add framework-specific directories
  if (framework === 'nextjs') {
    directories.push('src/app', 'src/app/api');
  } else if (framework === 'vue' || framework === 'angular') {
    directories.push('src/assets', 'src/views');
  }
  
  for (const dir of directories) {
    await ensureDir(path.join(projectPath, dir));
  }
}

async function createPackageJson(
  projectPath: string,
  name: string,
  framework: string,
  styling: string,
  features: string[]
): Promise<void> {
  const packageJson: any = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {},
    dependencies: {
      '@revolutionary-ui/factory': '^3.3.0',
    },
    devDependencies: {},
  };
  
  // Add framework-specific dependencies and scripts
  switch (framework) {
    case 'react':
      packageJson.scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      };
      packageJson.dependencies['react'] = '^18.2.0';
      packageJson.dependencies['react-dom'] = '^18.2.0';
      packageJson.devDependencies['@vitejs/plugin-react'] = '^4.2.1';
      packageJson.devDependencies['vite'] = '^5.0.12';
      break;
      
    case 'nextjs':
      packageJson.scripts = {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      };
      packageJson.dependencies['next'] = '^14.1.0';
      packageJson.dependencies['react'] = '^18.2.0';
      packageJson.dependencies['react-dom'] = '^18.2.0';
      break;
      
    case 'vue':
      packageJson.scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      };
      packageJson.dependencies['vue'] = '^3.4.15';
      packageJson.devDependencies['@vitejs/plugin-vue'] = '^5.0.3';
      packageJson.devDependencies['vite'] = '^5.0.12';
      break;
      
    case 'angular':
      // Angular uses angular.json instead of package.json scripts
      packageJson.scripts = {
        ng: 'ng',
        start: 'ng serve',
        build: 'ng build',
        test: 'ng test',
        lint: 'ng lint',
      };
      break;
      
    case 'svelte':
      packageJson.scripts = {
        dev: 'vite dev',
        build: 'vite build',
        preview: 'vite preview',
      };
      packageJson.dependencies['svelte'] = '^4.2.9';
      packageJson.devDependencies['@sveltejs/vite-plugin-svelte'] = '^3.0.1';
      packageJson.devDependencies['vite'] = '^5.0.12';
      break;
      
    case 'solid':
      packageJson.scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      };
      packageJson.dependencies['solid-js'] = '^1.8.11';
      packageJson.devDependencies['vite-plugin-solid'] = '^2.8.2';
      packageJson.devDependencies['vite'] = '^5.0.12';
      break;
  }
  
  // Add styling dependencies
  switch (styling) {
    case 'tailwind':
      packageJson.devDependencies['tailwindcss'] = '^3.4.1';
      packageJson.devDependencies['postcss'] = '^8.4.33';
      packageJson.devDependencies['autoprefixer'] = '^10.4.17';
      break;
      
    case 'styled-components':
      packageJson.dependencies['styled-components'] = '^6.1.8';
      if (features.includes('typescript')) {
        packageJson.devDependencies['@types/styled-components'] = '^5.1.34';
      }
      break;
      
    case 'emotion':
      packageJson.dependencies['@emotion/react'] = '^11.11.3';
      packageJson.dependencies['@emotion/styled'] = '^11.11.0';
      break;
  }
  
  // Add TypeScript if selected
  if (features.includes('typescript')) {
    packageJson.devDependencies['typescript'] = '^5.3.3';
    packageJson.devDependencies['@types/node'] = '^20.11.0';
    
    if (framework === 'react' || framework === 'nextjs') {
      packageJson.devDependencies['@types/react'] = '^18.2.48';
      packageJson.devDependencies['@types/react-dom'] = '^18.2.18';
    }
  }
  
  // Add linting if selected
  if (features.includes('eslint')) {
    packageJson.devDependencies['eslint'] = '^8.56.0';
    
    if (framework === 'react' || framework === 'nextjs') {
      packageJson.devDependencies['eslint-plugin-react'] = '^7.33.2';
      packageJson.devDependencies['eslint-plugin-react-hooks'] = '^4.6.0';
    }
  }
  
  // Add prettier if selected
  if (features.includes('prettier')) {
    packageJson.devDependencies['prettier'] = '^3.2.4';
  }
  
  // Add testing if selected
  if (features.includes('testing')) {
    packageJson.devDependencies['vitest'] = '^1.2.0';
    packageJson.devDependencies['@testing-library/react'] = '^14.1.2';
    packageJson.devDependencies['@testing-library/jest-dom'] = '^6.2.0';
    packageJson.scripts.test = 'vitest';
  }
  
  await writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

async function createConfigFiles(
  projectPath: string,
  framework: string,
  styling: string,
  features: string[]
): Promise<void> {
  // Create TypeScript config if needed
  if (features.includes('typescript')) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: framework === 'react' || framework === 'nextjs' ? 'react-jsx' : 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }],
    };
    
    await writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }
  
  // Create Tailwind config if needed
  if (styling === 'tailwind') {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
    
    await writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
    
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
    
    await writeFile(path.join(projectPath, 'postcss.config.js'), postcssConfig);
  }
  
  // Create Vite config for applicable frameworks
  if (['react', 'vue', 'svelte', 'solid'].includes(framework)) {
    let viteConfig = `import { defineConfig } from 'vite'\n`;
    
    switch (framework) {
      case 'react':
        viteConfig += `import react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`;
        break;
      case 'vue':
        viteConfig += `import vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()],\n})`;
        break;
      case 'svelte':
        viteConfig += `import { svelte } from '@sveltejs/vite-plugin-svelte'\n\nexport default defineConfig({\n  plugins: [svelte()],\n})`;
        break;
      case 'solid':
        viteConfig += `import solid from 'vite-plugin-solid'\n\nexport default defineConfig({\n  plugins: [solid()],\n})`;
        break;
    }
    
    await writeFile(path.join(projectPath, 'vite.config.js'), viteConfig);
  }
  
  // Create .revolutionary-ui.json config
  const ruiConfig = {
    version: '3.3.0',
    framework,
    styling,
    features: {
      ai: features.includes('ai'),
      marketplace: true,
      cloudSync: true,
      analytics: true,
    },
    preferences: {
      componentStyle: 'composition',
      fileNaming: 'kebab-case',
      interactive: true,
      telemetry: true,
    },
  };
  
  await writeFile(
    path.join(projectPath, '.revolutionary-ui.json'),
    JSON.stringify(ruiConfig, null, 2)
  );
}

async function createSourceFiles(
  projectPath: string,
  framework: string,
  styling: string
): Promise<void> {
  // Create main entry file
  let mainContent = '';
  let appContent = '';
  
  switch (framework) {
    case 'react':
      mainContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
${styling === 'tailwind' ? "import './index.css'" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
      
      appContent = `import { ComponentFactory } from '@revolutionary-ui/factory'

function App() {
  const Button = ComponentFactory.create('button', {
    variant: 'primary',
    size: 'medium',
  })
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Revolutionary UI</h1>
      <p className="text-lg mb-6">
        Start building amazing UI components with 60-95% less code!
      </p>
      <Button onClick={() => alert('Hello Revolutionary UI!')}>Get Started</Button>
    </div>
  )
}

export default App
`;
      break;
      
    case 'vue':
      mainContent = `import { createApp } from 'vue'
import App from './App.vue'
${styling === 'tailwind' ? "import './style.css'" : ''}

createApp(App).mount('#app')
`;
      
      appContent = `<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-8">Welcome to Revolutionary UI</h1>
    <p class="text-lg mb-6">
      Start building amazing UI components with 60-95% less code!
    </p>
    <button @click="handleClick" class="btn-primary">Get Started</button>
  </div>
</template>

<script setup>
import { ComponentFactory } from '@revolutionary-ui/factory'

const handleClick = () => {
  alert('Hello Revolutionary UI!')
}
</script>
`;
      break;
  }
  
  // Write main files
  if (framework === 'react') {
    await writeFile(path.join(projectPath, 'src/main.tsx'), mainContent);
    await writeFile(path.join(projectPath, 'src/App.tsx'), appContent);
  } else if (framework === 'vue') {
    await writeFile(path.join(projectPath, 'src/main.ts'), mainContent);
    await writeFile(path.join(projectPath, 'src/App.vue'), appContent);
  }
  
  // Create index.html
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Revolutionary UI App</title>
  </head>
  <body>
    <div id="${framework === 'react' ? 'root' : 'app'}"></div>
    <script type="module" src="/src/main.${framework === 'react' ? 'tsx' : 'ts'}"></script>
  </body>
</html>
`;
  
  await writeFile(path.join(projectPath, 'index.html'), indexHtml);
  
  // Create CSS file if using Tailwind
  if (styling === 'tailwind') {
    const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
    
    await writeFile(
      path.join(projectPath, `src/${framework === 'react' ? 'index' : 'style'}.css`),
      cssContent
    );
  }
}

async function createGitignore(projectPath: string): Promise<void> {
  const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Revolutionary UI
.revolutionary-ui/cache
.revolutionary-ui/temp
`;
  
  await writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
}

async function createReadme(
  projectPath: string,
  name: string,
  framework: string
): Promise<void> {
  const readmeContent = `# ${name}

Built with [Revolutionary UI](https://revolutionary-ui.com) - The factory system that revolutionizes UI development.

## Features

- 🏭 Factory-based component generation
- 🚀 60-95% less code
- 🤖 AI-powered development
- 📦 Rich component marketplace
- ☁️ Cloud sync capabilities

## Getting Started

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

## Revolutionary UI CLI

### Generate Components

\`\`\`bash
rui generate button MyButton
\`\`\`

### Add from Marketplace

\`\`\`bash
rui add @revolutionary-ui/data-table
\`\`\`

### AI-Powered Generation

\`\`\`bash
rui generate --ai "Create a responsive dashboard with charts"
\`\`\`

## Learn More

- [Documentation](https://revolutionary-ui.com/docs)
- [Component Marketplace](https://revolutionary-ui.com/marketplace)
- [Factory System Guide](https://revolutionary-ui.com/guide/factory-system)
`;
  
  await writeFile(path.join(projectPath, 'README.md'), readmeContent);
}
