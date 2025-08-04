/**
 * Design Tools and Converters Configuration for Revolutionary UI Factory
 * Tools for importing and converting designs from various platforms
 */

export interface DesignToolConfig {
  id: string
  name: string
  version: string
  category: 'importer' | 'converter' | 'bridge' | 'utility'
  description: string
  documentation: string
  packageName: string
  supportedFormats: string[]
  features: string[]
}

export const DESIGN_TOOLS: DesignToolConfig[] = [
  {
    id: 'figma-js',
    name: 'Figma.js',
    version: '1.16.1',
    category: 'importer',
    description: 'Official Figma API client for importing designs',
    documentation: 'https://github.com/figma/figma-js',
    packageName: 'figma-js',
    supportedFormats: ['figma'],
    features: ['API Client', 'File Access', 'Comments', 'Version History', 'Team Access']
  },
  {
    id: 'figma-to-react',
    name: 'Figma to React',
    version: '1.0.0',
    category: 'converter',
    description: 'Convert Figma designs to React components',
    documentation: 'https://github.com/figma-to-react/figma-to-react',
    packageName: 'figma-to-react',
    supportedFormats: ['figma'],
    features: ['Component Generation', 'Style Extraction', 'Layout Preservation', 'Props Mapping']
  },
  {
    id: 'figma-code-connect',
    name: 'Figma Code Connect',
    version: '1.3.4',
    category: 'bridge',
    description: 'Official Figma tool for connecting designs to code',
    documentation: 'https://www.figma.com/developers/code-connect',
    packageName: '@figma/code-connect',
    supportedFormats: ['figma'],
    features: ['Design Tokens', 'Component Mapping', 'Live Sync', 'Documentation']
  },
  {
    id: 'react-figma',
    name: 'React Figma',
    version: '0.28.0',
    category: 'bridge',
    description: 'Render React components to Figma',
    documentation: 'https://react-figma.dev',
    packageName: 'react-figma',
    supportedFormats: ['figma'],
    features: ['React to Figma', 'Component Export', 'Style Sync', 'Plugin Development']
  },
  {
    id: 'sketch-js',
    name: 'Sketch.js',
    version: '1.1.3',
    category: 'importer',
    description: 'JavaScript library for working with Sketch files',
    documentation: 'https://github.com/sketch-hq/sketch-js',
    packageName: 'sketch-js',
    supportedFormats: ['sketch'],
    features: ['File Reading', 'Layer Access', 'Style Extraction', 'Asset Export']
  },
  {
    id: 'html-to-react',
    name: 'HTML to React Components',
    version: '1.6.6',
    category: 'converter',
    description: 'Convert HTML to React components',
    documentation: 'https://github.com/roman01la/html-to-react-components',
    packageName: 'html-to-react-components',
    supportedFormats: ['html'],
    features: ['HTML Parsing', 'Component Generation', 'Props Extraction', 'Style Preservation']
  }
]

// Color manipulation tools
export interface ColorToolConfig {
  id: string
  name: string
  version: string
  description: string
  documentation: string
  packageName: string
  features: string[]
}

export const COLOR_TOOLS: ColorToolConfig[] = [
  {
    id: 'chroma',
    name: 'Chroma.js',
    version: '3.1.2',
    description: 'JavaScript library for color conversions and scales',
    documentation: 'https://gka.github.io/chroma.js/',
    packageName: 'chroma-js',
    features: ['Color Conversion', 'Color Scales', 'Color Manipulation', 'Interpolation']
  },
  {
    id: 'tinycolor',
    name: 'TinyColor',
    version: '1.6.0',
    description: 'Fast, small color manipulation library',
    documentation: 'https://github.com/bgrins/TinyColor',
    packageName: 'tinycolor2',
    features: ['Color Parsing', 'Conversions', 'Manipulation', 'Validation']
  },
  {
    id: 'color',
    name: 'Color',
    version: '5.0.0',
    description: 'Color conversion and manipulation library',
    documentation: 'https://github.com/Qix-/color',
    packageName: 'color',
    features: ['Immutable API', 'Color Models', 'Manipulation', 'String Parsing']
  },
  {
    id: 'polished',
    name: 'Polished',
    version: '4.3.1',
    description: 'Toolset for styling with JavaScript',
    documentation: 'https://polished.js.org',
    packageName: 'polished',
    features: ['Color Functions', 'Typography', 'Layout', 'Mixins', 'Shorthands']
  }
]

// Font configurations
export interface FontConfig {
  id: string
  name: string
  version: string
  category: 'sans-serif' | 'serif' | 'monospace' | 'display'
  weights: number[]
  packageName: string
}

export const FONTS: FontConfig[] = [
  {
    id: 'inter',
    name: 'Inter',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/inter'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [100, 300, 400, 500, 700, 900],
    packageName: '@fontsource/roboto'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/poppins'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/nunito'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    packageName: '@fontsource/open-sans'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/montserrat'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    version: '5.2.6',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/raleway'
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    version: '5.2.6',
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    packageName: '@fontsource/playfair-display'
  }
]

// Helper functions
export const getDesignToolById = (id: string): DesignToolConfig | undefined => {
  return DESIGN_TOOLS.find(tool => tool.id === id)
}

export const getDesignToolsByCategory = (category: string): DesignToolConfig[] => {
  return DESIGN_TOOLS.filter(tool => tool.category === category)
}

export const getColorToolById = (id: string): ColorToolConfig | undefined => {
  return COLOR_TOOLS.find(tool => tool.id === id)
}

export const getFontById = (id: string): FontConfig | undefined => {
  return FONTS.find(font => font.id === id)
}

export const getFontsByCategory = (category: string): FontConfig[] => {
  return FONTS.filter(font => font.category === category)
}