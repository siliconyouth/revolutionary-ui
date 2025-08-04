/**
 * Framework configurations for Revolutionary UI Factory
 * All major JavaScript frameworks with latest versions
 */

export interface FrameworkConfig {
  id: string
  name: string
  version: string
  icon: string
  color: string
  description: string
  packageName: string
  buildTool?: string
  documentation: string
}

export const FRAMEWORK_CONFIGS: FrameworkConfig[] = [
  // Core React Ecosystem
  {
    id: 'react',
    name: 'React',
    version: '19.0.0',
    icon: '⚛️',
    color: '#61DAFB',
    description: 'A JavaScript library for building user interfaces',
    packageName: 'react',
    buildTool: 'vite',
    documentation: 'https://react.dev'
  },
  {
    id: 'next',
    name: 'Next.js',
    version: '15.1.6',
    icon: '▲',
    color: '#000000',
    description: 'The React Framework for Production',
    packageName: 'next',
    documentation: 'https://nextjs.org'
  },

  // Vue Ecosystem
  {
    id: 'vue',
    name: 'Vue',
    version: '3.5.18',
    icon: '🟢',
    color: '#42b883',
    description: 'The Progressive JavaScript Framework',
    packageName: 'vue',
    buildTool: '@vitejs/plugin-vue',
    documentation: 'https://vuejs.org'
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    version: '3.x',
    icon: '🟩',
    color: '#00DC82',
    description: 'The Intuitive Vue Framework',
    packageName: 'nuxt',
    documentation: 'https://nuxt.com'
  },

  // Angular
  {
    id: 'angular',
    name: 'Angular',
    version: '20.1.4',
    icon: '🔴',
    color: '#DD0031',
    description: 'Platform for building mobile and desktop web applications',
    packageName: '@angular/core',
    documentation: 'https://angular.io'
  },

  // Svelte
  {
    id: 'svelte',
    name: 'Svelte',
    version: '5.37.2',
    icon: '🟠',
    color: '#FF3E00',
    description: 'Cybernetically enhanced web apps',
    packageName: 'svelte',
    buildTool: '@sveltejs/vite-plugin-svelte',
    documentation: 'https://svelte.dev'
  },

  // SolidJS
  {
    id: 'solid',
    name: 'SolidJS',
    version: '1.9.7',
    icon: '⚡',
    color: '#2C4F7C',
    description: 'Simple and performant reactivity for building user interfaces',
    packageName: 'solid-js',
    buildTool: 'vite-plugin-solid',
    documentation: 'https://www.solidjs.com'
  },

  // Qwik
  {
    id: 'qwik',
    name: 'Qwik',
    version: '1.15.0',
    icon: '⚡',
    color: '#AC7FF4',
    description: 'Instant-loading web apps, without effort',
    packageName: '@builder.io/qwik',
    documentation: 'https://qwik.builder.io'
  },

  // Preact
  {
    id: 'preact',
    name: 'Preact',
    version: '10.27.0',
    icon: '🟣',
    color: '#673AB8',
    description: 'Fast 3kB alternative to React with the same modern API',
    packageName: 'preact',
    buildTool: '@preact/preset-vite',
    documentation: 'https://preactjs.com'
  },

  // Lit
  {
    id: 'lit',
    name: 'Lit',
    version: '3.3.1',
    icon: '🔥',
    color: '#325CFF',
    description: 'Simple. Fast. Web Components.',
    packageName: 'lit',
    documentation: 'https://lit.dev'
  },

  // Alpine.js
  {
    id: 'alpine',
    name: 'Alpine.js',
    version: '3.14.9',
    icon: '🏔️',
    color: '#8BC0D0',
    description: 'Your new, lightweight, JavaScript framework',
    packageName: 'alpinejs',
    documentation: 'https://alpinejs.dev'
  },

  // Ember
  {
    id: 'ember',
    name: 'Ember.js',
    version: '6.6.0',
    icon: '🔥',
    color: '#E04E39',
    description: 'A framework for ambitious web developers',
    packageName: 'ember-source',
    documentation: 'https://emberjs.com'
  },

  // Vanilla JavaScript
  {
    id: 'vanilla',
    name: 'Vanilla JS',
    version: 'ES2024',
    icon: '🟨',
    color: '#F7DF1E',
    description: 'Plain JavaScript without any framework',
    packageName: 'none',
    documentation: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
  },

  // Web Components
  {
    id: 'webcomponents',
    name: 'Web Components',
    version: 'Native',
    icon: '🧩',
    color: '#29ABE2',
    description: 'Native browser APIs for creating custom elements',
    packageName: 'none',
    documentation: 'https://developer.mozilla.org/en-US/docs/Web/Web_Components'
  }
]

// Helper functions
export const getFrameworkById = (id: string): FrameworkConfig | undefined => {
  return FRAMEWORK_CONFIGS.find(fw => fw.id === id)
}

export const getFrameworksByBuildTool = (buildTool: string): FrameworkConfig[] => {
  return FRAMEWORK_CONFIGS.filter(fw => fw.buildTool === buildTool)
}

export const getSupportedFrameworkIds = (): string[] => {
  return FRAMEWORK_CONFIGS.map(fw => fw.id)
}

// Export for use in components
export const frameworkIcons: Record<string, string> = FRAMEWORK_CONFIGS.reduce((acc, fw) => {
  acc[fw.id] = fw.icon
  return acc
}, {} as Record<string, string>)

export const frameworkColors: Record<string, string> = FRAMEWORK_CONFIGS.reduce((acc, fw) => {
  acc[fw.id] = fw.color
  return acc
}, {} as Record<string, string>)