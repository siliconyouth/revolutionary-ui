/**
 * UI Component Libraries Configuration for Revolutionary UI Factory
 * Comprehensive list of all installed UI libraries and design systems
 */

export interface UILibraryConfig {
  id: string
  name: string
  version: string
  category: 'component-library' | 'design-system' | 'utility' | 'css-framework'
  description: string
  documentation: string
  packageName: string
  frameworks?: string[]
  features: string[]
  icon?: string
}

export const UI_LIBRARIES: UILibraryConfig[] = [
  // Material Design
  {
    id: 'mui',
    name: 'Material-UI (MUI)',
    version: '7.2.0',
    category: 'design-system',
    description: 'React components that implement Google\'s Material Design',
    documentation: 'https://mui.com',
    packageName: '@mui/material',
    frameworks: ['react'],
    features: ['Theming', 'Icons', 'Grid System', 'Accessibility', 'Dark Mode'],
    icon: '🎨'
  },
  
  // Ant Design
  {
    id: 'antd',
    name: 'Ant Design',
    version: '5.26.7',
    category: 'design-system',
    description: 'Enterprise-class UI design language and React components',
    documentation: 'https://ant.design',
    packageName: 'antd',
    frameworks: ['react'],
    features: ['Form Builder', 'Data Display', 'Layout', 'Navigation', 'Pro Components'],
    icon: '🐜'
  },
  
  // Chakra UI
  {
    id: 'chakra',
    name: 'Chakra UI',
    version: '3.24.0',
    category: 'component-library',
    description: 'Modular and accessible component library',
    documentation: 'https://chakra-ui.com',
    packageName: '@chakra-ui/react',
    frameworks: ['react'],
    features: ['Themeable', 'Composable', 'Accessible', 'Dark Mode', 'RTL Support'],
    icon: '⚡'
  },
  
  // Mantine
  {
    id: 'mantine',
    name: 'Mantine',
    version: '8.2.2',
    category: 'component-library',
    description: 'Full-featured React components library',
    documentation: 'https://mantine.dev',
    packageName: '@mantine/core',
    frameworks: ['react'],
    features: ['100+ Components', 'Hooks', 'Form Management', 'Date Pickers', 'Notifications'],
    icon: '🎯'
  },
  
  // Radix UI
  {
    id: 'radix',
    name: 'Radix UI',
    version: '1.x',
    category: 'component-library',
    description: 'Low-level UI primitives for building high-quality design systems',
    documentation: 'https://www.radix-ui.com',
    packageName: '@radix-ui/react-*',
    frameworks: ['react'],
    features: ['Unstyled', 'Accessible', 'Composable', 'Keyboard Navigation'],
    icon: '🔷'
  },
  
  // Headless UI
  {
    id: 'headlessui',
    name: 'Headless UI',
    version: '2.2.7',
    category: 'component-library',
    description: 'Unstyled, fully accessible UI components',
    documentation: 'https://headlessui.com',
    packageName: '@headlessui/react',
    frameworks: ['react', 'vue'],
    features: ['Unstyled', 'Accessible', 'Tailwind Compatible', 'TypeScript'],
    icon: '🎭'
  },
  
  // Arco Design
  {
    id: 'arco',
    name: 'Arco Design',
    version: '2.66.2',
    category: 'design-system',
    description: 'Comprehensive design system from ByteDance',
    documentation: 'https://arco.design',
    packageName: '@arco-design/web-react',
    frameworks: ['react'],
    features: ['Design Tokens', 'Internationalization', 'Theme Editor', 'Pro Components'],
    icon: '🎪'
  },
  
  // Blueprint
  {
    id: 'blueprint',
    name: 'Blueprint',
    version: '6.1.0',
    category: 'design-system',
    description: 'React-based UI toolkit for desktop applications',
    documentation: 'https://blueprintjs.com',
    packageName: '@blueprintjs/core',
    frameworks: ['react'],
    features: ['Desktop Focus', 'Data Tables', 'Date/Time', 'Complex Forms'],
    icon: '🏗️'
  },
  
  // PrimeReact
  {
    id: 'primereact',
    name: 'PrimeReact',
    version: '10.9.6',
    category: 'component-library',
    description: 'Rich set of UI components for React',
    documentation: 'https://primereact.org',
    packageName: 'primereact',
    frameworks: ['react'],
    features: ['80+ Components', 'Themes', 'Icons', 'Charts', 'Form Validation'],
    icon: '🎁'
  },
  
  // Bootstrap
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    version: '5.3.7',
    category: 'css-framework',
    description: 'The world\'s most popular CSS framework',
    documentation: 'https://getbootstrap.com',
    packageName: 'bootstrap',
    frameworks: ['vanilla', 'react', 'vue', 'angular'],
    features: ['Grid System', 'Utilities', 'Components', 'Responsive', 'Customizable'],
    icon: '🅱️'
  },
  
  // Tailwind CSS
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    version: '4.1.11',
    category: 'css-framework',
    description: 'Utility-first CSS framework',
    documentation: 'https://tailwindcss.com',
    packageName: 'tailwindcss',
    frameworks: ['all'],
    features: ['Utility Classes', 'JIT Compiler', 'Plugins', 'Dark Mode', 'Responsive'],
    icon: '🌊'
  },
  
  // Styled Components
  {
    id: 'styled-components',
    name: 'Styled Components',
    version: '6.1.19',
    category: 'utility',
    description: 'CSS-in-JS styling library',
    documentation: 'https://styled-components.com',
    packageName: 'styled-components',
    frameworks: ['react'],
    features: ['CSS-in-JS', 'Dynamic Styling', 'Theming', 'Server-Side Rendering'],
    icon: '💅'
  },
  
  // Emotion
  {
    id: 'emotion',
    name: 'Emotion',
    version: '11.14.0',
    category: 'utility',
    description: 'CSS-in-JS library designed for high performance',
    documentation: 'https://emotion.sh',
    packageName: '@emotion/react',
    frameworks: ['react'],
    features: ['CSS-in-JS', 'Performance', 'Small Bundle', 'SSR Support'],
    icon: '👩‍🎤'
  },
  
  // Vanilla Extract
  {
    id: 'vanilla-extract',
    name: 'Vanilla Extract',
    version: '1.17.4',
    category: 'utility',
    description: 'Zero-runtime CSS-in-TypeScript',
    documentation: 'https://vanilla-extract.style',
    packageName: '@vanilla-extract/css',
    frameworks: ['all'],
    features: ['Type-Safe', 'Zero Runtime', 'Framework Agnostic', 'CSS Variables'],
    icon: '🍦'
  },
  
  // Stitches
  {
    id: 'stitches',
    name: 'Stitches',
    version: '1.2.11',
    category: 'utility',
    description: 'CSS-in-JS with best-in-class developer experience',
    documentation: 'https://stitches.dev',
    packageName: 'stitches',
    frameworks: ['react'],
    features: ['CSS-in-JS', 'Variants', 'Themes', 'Utils', 'TypeScript'],
    icon: '🧵'
  }
]

// Helper functions
export const getUILibraryById = (id: string): UILibraryConfig | undefined => {
  return UI_LIBRARIES.find(lib => lib.id === id)
}

export const getUILibrariesByCategory = (category: string): UILibraryConfig[] => {
  return UI_LIBRARIES.filter(lib => lib.category === category)
}

export const getUILibrariesByFramework = (framework: string): UILibraryConfig[] => {
  return UI_LIBRARIES.filter(lib => 
    lib.frameworks?.includes(framework) || lib.frameworks?.includes('all')
  )
}