/**
 * Icon Libraries Configuration for Revolutionary UI Factory
 * Comprehensive list of all installed icon libraries
 */

export interface IconLibraryConfig {
  id: string
  name: string
  version: string
  description: string
  documentation: string
  packageName: string
  iconCount: string
  style: string[]
  license: string
  example?: string
}

export const ICON_LIBRARIES: IconLibraryConfig[] = [
  {
    id: 'lucide',
    name: 'Lucide Icons',
    version: '0.535.0',
    description: 'Beautiful & consistent icon toolkit',
    documentation: 'https://lucide.dev',
    packageName: 'lucide-react',
    iconCount: '1400+',
    style: ['line'],
    license: 'ISC',
    example: '<Home />'
  },
  {
    id: 'react-icons',
    name: 'React Icons',
    version: '5.5.0',
    description: 'Include popular icon libraries easily',
    documentation: 'https://react-icons.github.io/react-icons',
    packageName: 'react-icons',
    iconCount: '30000+',
    style: ['various'],
    license: 'MIT',
    example: '<FaGithub />'
  },
  {
    id: 'fontawesome',
    name: 'Font Awesome',
    version: '7.0.0',
    description: 'The internet\'s icon library',
    documentation: 'https://fontawesome.com',
    packageName: '@fortawesome/react-fontawesome',
    iconCount: '16000+',
    style: ['solid', 'regular', 'brands'],
    license: 'Pro/Free',
    example: '<FontAwesomeIcon icon={faHome} />'
  },
  {
    id: 'mui-icons',
    name: 'Material Icons',
    version: '7.2.0',
    description: 'Material Design icons by Google',
    documentation: 'https://mui.com/material-ui/material-icons/',
    packageName: '@mui/icons-material',
    iconCount: '2100+',
    style: ['filled', 'outlined', 'rounded', 'two-tone', 'sharp'],
    license: 'Apache 2.0',
    example: '<HomeIcon />'
  },
  {
    id: 'tabler',
    name: 'Tabler Icons',
    version: '3.34.1',
    description: 'Free and open source SVG icons',
    documentation: 'https://tabler.io/icons',
    packageName: '@tabler/icons-react',
    iconCount: '5000+',
    style: ['line', 'filled'],
    license: 'MIT',
    example: '<IconHome />'
  },
  {
    id: 'heroicons',
    name: 'Heroicons',
    version: '2.2.0',
    description: 'Beautiful hand-crafted SVG icons by Tailwind CSS',
    documentation: 'https://heroicons.com',
    packageName: '@heroicons/react',
    iconCount: '300+',
    style: ['outline', 'solid', 'mini'],
    license: 'MIT',
    example: '<HomeIcon />'
  },
  {
    id: 'phosphor',
    name: 'Phosphor Icons',
    version: '1.4.1',
    description: 'Flexible icon family for interfaces',
    documentation: 'https://phosphoricons.com',
    packageName: 'phosphor-react',
    iconCount: '7000+',
    style: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
    license: 'MIT',
    example: '<House />'
  },
  {
    id: 'feather',
    name: 'Feather Icons',
    version: '2.0.10',
    description: 'Simply beautiful open source icons',
    documentation: 'https://feathericons.com',
    packageName: 'react-feather',
    iconCount: '280+',
    style: ['line'],
    license: 'MIT',
    example: '<Home />'
  },
  {
    id: 'ant-icons',
    name: 'Ant Design Icons',
    version: '6.0.0',
    description: 'Semantic vector graphics by Ant Design',
    documentation: 'https://ant.design/components/icon',
    packageName: '@ant-design/icons',
    iconCount: '700+',
    style: ['outlined', 'filled', 'two-tone'],
    license: 'MIT',
    example: '<HomeOutlined />'
  },
  {
    id: 'chakra-icons',
    name: 'Chakra UI Icons',
    version: '2.2.4',
    description: 'Icons for Chakra UI components',
    documentation: 'https://chakra-ui.com/docs/components/icon',
    packageName: '@chakra-ui/icons',
    iconCount: '200+',
    style: ['line'],
    license: 'MIT',
    example: '<AddIcon />'
  },
  {
    id: 'blueprint-icons',
    name: 'Blueprint Icons',
    version: '6.0.0',
    description: 'Icons for Blueprint design system',
    documentation: 'https://blueprintjs.com/docs/#icons',
    packageName: '@blueprintjs/icons',
    iconCount: '500+',
    style: ['line'],
    license: 'Apache 2.0',
    example: '<Icon icon="home" />'
  },
  {
    id: 'primeicons',
    name: 'PrimeIcons',
    version: '7.0.0',
    description: 'Icons for PrimeReact components',
    documentation: 'https://primereact.org/icons',
    packageName: 'primeicons',
    iconCount: '280+',
    style: ['line'],
    license: 'MIT',
    example: '<i className="pi pi-home" />'
  }
]

// Icon categories
export const ICON_CATEGORIES = [
  'navigation',
  'action',
  'alert',
  'av',
  'communication',
  'content',
  'device',
  'editor',
  'file',
  'hardware',
  'image',
  'maps',
  'social',
  'toggle'
]

// Helper functions
export const getIconLibraryById = (id: string): IconLibraryConfig | undefined => {
  return ICON_LIBRARIES.find(lib => lib.id === id)
}

export const getIconLibrariesByStyle = (style: string): IconLibraryConfig[] => {
  return ICON_LIBRARIES.filter(lib => lib.style.includes(style))
}

export const getTotalIconCount = (): number => {
  return ICON_LIBRARIES.reduce((total, lib) => {
    const count = parseInt(lib.iconCount.replace(/[^0-9]/g, '')) || 0
    return total + count
  }, 0)
}