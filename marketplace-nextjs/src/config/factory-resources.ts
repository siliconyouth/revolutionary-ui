/**
 * Revolutionary UI Factory - Complete Resources Configuration
 * Master list of all frameworks, libraries, and tools available for component generation
 */

import { FRAMEWORK_CONFIGS } from './frameworks'
import { UI_LIBRARIES } from './ui-libraries'
import { ICON_LIBRARIES } from './icon-libraries'
import { DESIGN_TOOLS, COLOR_TOOLS, FONTS } from './design-tools'

export interface FactoryResourceStats {
  totalFrameworks: number
  totalUILibraries: number
  totalIconLibraries: number
  totalIcons: number
  totalDesignTools: number
  totalColorTools: number
  totalFonts: number
  totalPackages: number
}

export const getFactoryResourceStats = (): FactoryResourceStats => {
  const totalIcons = ICON_LIBRARIES.reduce((total, lib) => {
    const count = parseInt(lib.iconCount.replace(/[^0-9]/g, '')) || 0
    return total + count
  }, 0)

  return {
    totalFrameworks: FRAMEWORK_CONFIGS.length,
    totalUILibraries: UI_LIBRARIES.length,
    totalIconLibraries: ICON_LIBRARIES.length,
    totalIcons,
    totalDesignTools: DESIGN_TOOLS.length,
    totalColorTools: COLOR_TOOLS.length,
    totalFonts: FONTS.length,
    totalPackages: FRAMEWORK_CONFIGS.length + UI_LIBRARIES.length + ICON_LIBRARIES.length + 
                   DESIGN_TOOLS.length + COLOR_TOOLS.length + FONTS.length
  }
}

// Tailwind CSS Utilities
export const TAILWIND_UTILITIES = {
  plugins: [
    '@tailwindcss/forms',
    '@tailwindcss/typography',
    '@tailwindcss/aspect-ratio',
    '@tailwindcss/container-queries',
    'tailwindcss-animate'
  ],
  utilities: [
    'tailwind-merge',
    'class-variance-authority'
  ]
}

// CSS-in-JS Solutions
export const CSS_IN_JS_SOLUTIONS = [
  {
    id: 'styled-components',
    name: 'Styled Components',
    description: 'Visual primitives for the component age'
  },
  {
    id: 'emotion',
    name: 'Emotion',
    description: 'CSS-in-JS library designed for high performance'
  },
  {
    id: 'stitches',
    name: 'Stitches',
    description: 'CSS-in-JS with best-in-class developer experience'
  },
  {
    id: 'vanilla-extract',
    name: 'Vanilla Extract',
    description: 'Zero-runtime CSS-in-TypeScript'
  },
  {
    id: 'styled-system',
    name: 'Styled System',
    description: 'Style props for rapid UI development'
  }
]

// Complete Package Categories
export const PACKAGE_CATEGORIES = {
  // JavaScript Frameworks
  frameworks: {
    title: 'JavaScript Frameworks',
    description: 'Core frameworks for building web applications',
    packages: FRAMEWORK_CONFIGS.map(f => f.packageName)
  },
  
  // UI Component Libraries
  uiLibraries: {
    title: 'UI Component Libraries',
    description: 'Pre-built component libraries and design systems',
    packages: UI_LIBRARIES.map(lib => lib.packageName)
  },
  
  // Icon Libraries
  icons: {
    title: 'Icon Libraries',
    description: 'Comprehensive icon sets for every design need',
    packages: ICON_LIBRARIES.map(lib => lib.packageName)
  },
  
  // Design Tools
  designTools: {
    title: 'Design Tools & Converters',
    description: 'Import and convert designs from Figma, Sketch, and more',
    packages: DESIGN_TOOLS.map(tool => tool.packageName)
  },
  
  // Color & Style Tools
  styling: {
    title: 'Color & Styling Tools',
    description: 'Color manipulation and CSS-in-JS solutions',
    packages: [...COLOR_TOOLS.map(tool => tool.packageName), ...CSS_IN_JS_SOLUTIONS.map(s => s.id)]
  },
  
  // Typography
  typography: {
    title: 'Typography & Fonts',
    description: 'Beautiful fonts for every project',
    packages: FONTS.map(font => font.packageName)
  },
  
  // Utilities
  utilities: {
    title: 'Utilities & Helpers',
    description: 'Essential utilities for component development',
    packages: [
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'framer-motion',
      'zod'
    ]
  }
}

// Export all configurations
export {
  FRAMEWORK_CONFIGS,
  UI_LIBRARIES,
  ICON_LIBRARIES,
  DESIGN_TOOLS,
  COLOR_TOOLS,
  FONTS
}

// Feature Matrix - What each framework supports
export const FRAMEWORK_FEATURE_MATRIX = {
  react: {
    frameworks: ['next', 'gatsby', 'remix', 'vite'],
    uiLibraries: ['mui', 'antd', 'chakra', 'mantine', 'radix', 'headlessui'],
    styling: ['styled-components', 'emotion', 'tailwind', 'css-modules'],
    testing: ['jest', 'testing-library', 'cypress', 'playwright']
  },
  vue: {
    frameworks: ['nuxt', 'vitepress', 'quasar'],
    uiLibraries: ['vuetify', 'element-plus', 'naive-ui', 'headlessui'],
    styling: ['tailwind', 'css-modules', 'scss'],
    testing: ['vitest', 'cypress', 'playwright']
  },
  angular: {
    frameworks: ['ionic', 'ngrx'],
    uiLibraries: ['material', 'primeng', 'ng-bootstrap'],
    styling: ['tailwind', 'scss', 'css-modules'],
    testing: ['karma', 'jasmine', 'cypress']
  },
  svelte: {
    frameworks: ['sveltekit'],
    uiLibraries: ['carbon-components-svelte', 'smelte'],
    styling: ['tailwind', 'scss', 'postcss'],
    testing: ['vitest', 'playwright']
  }
}

// Revolutionary UI Factory Capabilities
export const FACTORY_CAPABILITIES = {
  componentGeneration: {
    frameworks: FRAMEWORK_CONFIGS.length,
    uiLibraries: UI_LIBRARIES.length,
    customization: 'Full theme and variant support',
    codeReduction: '60-95%'
  },
  designImport: {
    figma: true,
    sketch: true,
    adobe: false, // Coming soon
    penpot: false // Coming soon
  },
  aiFeatures: {
    naturalLanguage: true,
    codeGeneration: true,
    designToCode: true,
    optimization: true
  },
  export: {
    formats: ['React', 'Vue', 'Angular', 'Svelte', 'Web Components'],
    styling: ['Tailwind', 'CSS-in-JS', 'CSS Modules', 'Vanilla CSS'],
    typescript: true,
    testing: true
  }
}