// Enhanced component registry with GitHub links and metadata
export interface Component {
  id: string
  name: string
  description: string
  category: string
  icon: string
  reduction: number
  traditionalLines: number
  factoryLines: number
  frameworks: string[]
  features: string[]
  codeExamples: Record<string, string>
  githubPath: string
  dateAdded: number
  author: string
  tags: string[]
  demoUrl?: string
  documentationUrl?: string
  popularity?: number
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  componentCount?: number
}

export interface Framework {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  documentationUrl?: string
}

// GitHub repository base
const GITHUB_BASE = 'https://github.com/siliconyouth/revolutionary-ui-factory-system/tree/main'

// Helper to generate GitHub links
export function getGitHubLink(type: 'component' | 'framework' | 'docs', path: string) {
  const folders = {
    component: 'src/components',
    framework: 'src/frameworks',
    docs: 'docs'
  }
  return `${GITHUB_BASE}/${folders[type]}/${path}`
}

// Enhanced frameworks with icons and colors (like 21st.dev)
export const frameworks: Framework[] = [
  { id: 'react', name: 'React', icon: '⚛️', color: '#61DAFB', documentationUrl: '/docs/frameworks/react' },
  { id: 'vue', name: 'Vue', icon: '💚', color: '#4FC08D', documentationUrl: '/docs/frameworks/vue' },
  { id: 'angular', name: 'Angular', icon: '🅰️', color: '#DD0031', documentationUrl: '/docs/frameworks/angular' },
  { id: 'svelte', name: 'Svelte', icon: '🔥', color: '#FF3E00', documentationUrl: '/docs/frameworks/svelte' },
  { id: 'solid', name: 'Solid', icon: '⚡', color: '#2C4F7C', documentationUrl: '/docs/frameworks/solid' },
  { id: 'preact', name: 'Preact', icon: '🦾', color: '#673AB8', documentationUrl: '/docs/frameworks/preact' },
  { id: 'alpine', name: 'Alpine.js', icon: '🏔️', color: '#8BC0D0', documentationUrl: '/docs/frameworks/alpine' },
  { id: 'lit', name: 'Lit', icon: '🔥', color: '#324FFF', documentationUrl: '/docs/frameworks/lit' },
  { id: 'qwik', name: 'Qwik', icon: '⚡', color: '#18B6F6', documentationUrl: '/docs/frameworks/qwik' },
  { id: 'astro', name: 'Astro', icon: '🚀', color: '#FF5D01', documentationUrl: '/docs/frameworks/astro' },
  { id: 'nextjs', name: 'Next.js', icon: '▲', color: '#000000', documentationUrl: '/docs/frameworks/nextjs' },
  { id: 'nuxt', name: 'Nuxt', icon: '💚', color: '#00DC82', documentationUrl: '/docs/frameworks/nuxt' },
  { id: 'remix', name: 'Remix', icon: '💿', color: '#121212', documentationUrl: '/docs/frameworks/remix' },
  { id: 'sveltekit', name: 'SvelteKit', icon: '🔥', color: '#FF3E00', documentationUrl: '/docs/frameworks/sveltekit' },
  { id: 'gatsby', name: 'Gatsby', icon: '🟣', color: '#663399', documentationUrl: '/docs/frameworks/gatsby' }
]

// Categories organized like 21st.dev
export const categories: Category[] = [
  { id: 'layout', name: 'Layout', icon: '🏗️', description: 'Page layouts and containers' },
  { id: 'navigation', name: 'Navigation', icon: '🧭', description: 'Menus, tabs, and navigation' },
  { id: 'data-display', name: 'Data Display', icon: '📊', description: 'Tables, lists, and data views' },
  { id: 'data-entry', name: 'Data Entry', icon: '📝', description: 'Forms, inputs, and editors' },
  { id: 'data-visualization', name: 'Visualization', icon: '📈', description: 'Charts and graphs' },
  { id: 'feedback', name: 'Feedback', icon: '💬', description: 'Alerts, toasts, and modals' },
  { id: 'interactive', name: 'Interactive', icon: '🎮', description: 'Buttons, dropdowns, and controls' },
  { id: 'media', name: 'Media', icon: '🎨', description: 'Images, video, and audio' },
  { id: 'e-commerce', name: 'E-commerce', icon: '🛍️', description: 'Shopping and payment' },
  { id: 'social', name: 'Social', icon: '👥', description: 'Social media components' },
  { id: 'gaming', name: 'Gaming', icon: '🎯', description: 'Game-specific components' },
  { id: 'business', name: 'Business', icon: '💼', description: 'Business and enterprise' },
  { id: 'mobile', name: 'Mobile', icon: '📱', description: 'Mobile-specific patterns' },
  { id: 'ai-ml', name: 'AI/ML', icon: '🤖', description: 'AI and ML interfaces' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', description: 'Productivity tools' }
]

// Enhanced components with full metadata
export const components: Component[] = [
  // Layout Components
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Complete dashboard with widgets, charts, and stats',
    category: 'layout',
    icon: '📊',
    reduction: 96,
    traditionalLines: 1000,
    factoryLines: 40,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'nextjs', 'nuxt'],
    features: [
      'Responsive grid layout',
      'Real-time data updates',
      'Customizable widgets',
      'Export functionality',
      'Dark mode support'
    ],
    codeExamples: {
      react: `const AdminDashboard = ui.createDashboard({
  widgets: [
    { id: 'stats', type: 'stats', config: { 
      value: totalUsers, label: 'Total Users', trend: 'up', change: 12.5 
    }},
    { id: 'chart', type: 'chart', config: { 
      type: 'line', data: revenueData, height: '300px' 
    }},
    { id: 'table', type: 'dataTable', config: { 
      data: recentOrders, columns: orderColumns 
    }}
  ],
  layout: 'grid',
  refreshInterval: 30000
});`,
      vue: `<template>
  <Dashboard 
    :widgets="widgets" 
    layout="grid" 
    :refresh-interval="30000" 
  />
</template>

<script setup>
const Dashboard = ui.createDashboard({
  framework: 'vue'
});
</script>`,
      angular: `@Component({
  template: \`
    <revolutionary-dashboard 
      [widgets]="widgets" 
      layout="grid" 
      [refreshInterval]="30000">
    </revolutionary-dashboard>
  \`
})
export class AdminDashboard {
  Dashboard = ui.createDashboard({ framework: 'angular' });
}`
    },
    githubPath: getGitHubLink('component', 'Dashboard'),
    dateAdded: Date.now() - 30 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['admin', 'analytics', 'widgets', 'responsive', 'real-time'],
    demoUrl: '/demos/dashboard',
    documentationUrl: '/docs/components/dashboard',
    popularity: 98
  },
  
  // Navigation Components
  {
    id: 'command-palette',
    name: 'Command Palette',
    description: 'Searchable command palette like VS Code',
    category: 'navigation',
    icon: '🎯',
    reduction: 95,
    traditionalLines: 500,
    factoryLines: 25,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Fuzzy search',
      'Keyboard shortcuts',
      'Recent commands',
      'Categories',
      'Custom actions'
    ],
    codeExamples: {
      react: `const CommandPalette = ui.createCommandPalette({
  commands: [
    { id: 'new-file', label: 'New File', shortcut: 'Cmd+N', action: createNewFile },
    { id: 'search', label: 'Search', shortcut: 'Cmd+F', action: openSearch },
    { id: 'settings', label: 'Settings', shortcut: 'Cmd+,', action: openSettings }
  ],
  placeholder: 'Type a command or search...',
  hotkey: 'cmd+k'
});`
    },
    githubPath: getGitHubLink('component', 'CommandPalette'),
    dateAdded: Date.now() - 20 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['navigation', 'search', 'keyboard', 'productivity'],
    demoUrl: '/demos/command-palette',
    documentationUrl: '/docs/components/command-palette',
    popularity: 95
  },
  
  // Data Display Components
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Advanced data table with sorting, filtering, and pagination',
    category: 'data-display',
    icon: '📋',
    reduction: 94,
    traditionalLines: 800,
    factoryLines: 50,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'nextjs'],
    features: [
      'Server-side pagination',
      'Column sorting',
      'Advanced filtering',
      'Row selection',
      'Export to CSV/Excel',
      'Column resizing',
      'Virtual scrolling'
    ],
    codeExamples: {
      react: `const UserTable = ui.createDataTable({
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true },
    { id: 'role', header: 'Role', filterable: true },
    { id: 'status', header: 'Status', 
      cell: (user) => <StatusBadge status={user.status} /> }
  ],
  data: users,
  pagination: { pageSize: 25 },
  features: {
    search: true,
    export: true,
    selection: true
  }
});`
    },
    githubPath: getGitHubLink('component', 'DataTable'),
    dateAdded: Date.now() - 45 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['table', 'data', 'grid', 'pagination', 'sorting'],
    demoUrl: '/demos/data-table',
    documentationUrl: '/docs/components/data-table',
    popularity: 100
  },
  
  // Productivity Components
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'Drag-and-drop kanban board like Trello',
    category: 'productivity',
    icon: '📋',
    reduction: 95,
    traditionalLines: 600,
    factoryLines: 30,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Drag and drop',
      'Custom columns',
      'Card templates',
      'Swimlanes',
      'WIP limits'
    ],
    codeExamples: {
      react: `const ProjectKanban = ui.createKanban({
  columns: [
    { id: 'todo', title: 'To Do', items: todoTasks },
    { id: 'progress', title: 'In Progress', items: progressTasks },
    { id: 'review', title: 'Review', items: reviewTasks },
    { id: 'done', title: 'Done', items: doneTasks }
  ],
  onDragEnd: (result) => updateTaskStatus(result),
  cardRenderer: (task) => <TaskCard {...task} />
});`
    },
    githubPath: getGitHubLink('component', 'KanbanBoard'),
    dateAdded: Date.now() - 15 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['kanban', 'drag-drop', 'project', 'tasks', 'agile'],
    demoUrl: '/demos/kanban-board',
    documentationUrl: '/docs/components/kanban-board',
    popularity: 92
  },
  
  // Calendar Component
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Full-featured calendar with events and views',
    category: 'productivity',
    icon: '📅',
    reduction: 96,
    traditionalLines: 800,
    factoryLines: 35,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Multiple views (month, week, day)',
      'Event management',
      'Drag to reschedule',
      'Recurring events',
      'Timezone support'
    ],
    codeExamples: {
      react: `const EventCalendar = ui.createCalendar({
  events: calendarEvents,
  view: 'month',
  onDateClick: (date) => showCreateEvent(date),
  onEventClick: (event) => showEventDetails(event),
  features: {
    drag: true,
    resize: true,
    weekends: true
  }
});`
    },
    githubPath: getGitHubLink('component', 'Calendar'),
    dateAdded: Date.now() - 10 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['calendar', 'events', 'scheduling', 'date', 'time'],
    demoUrl: '/demos/calendar',
    documentationUrl: '/docs/components/calendar',
    popularity: 89
  },
  
  // Form Components
  {
    id: 'form-builder',
    name: 'Form Builder',
    description: 'Dynamic form builder with validation',
    category: 'data-entry',
    icon: '📝',
    reduction: 94,
    traditionalLines: 500,
    factoryLines: 30,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Drag-and-drop builder',
      'Field validation',
      'Conditional logic',
      'Multi-step forms',
      'Save/load templates'
    ],
    codeExamples: {
      react: `const ContactForm = ui.createForm({
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'message', type: 'textarea', label: 'Message', rows: 4 }
  ],
  onSubmit: async (data) => {
    await sendMessage(data);
  },
  validation: {
    mode: 'onChange',
    schema: contactSchema
  }
});`
    },
    githubPath: getGitHubLink('component', 'FormBuilder'),
    dateAdded: Date.now() - 25 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['form', 'validation', 'inputs', 'builder'],
    demoUrl: '/demos/form-builder',
    documentationUrl: '/docs/components/form-builder',
    popularity: 96
  },
  
  // Chart Component
  {
    id: 'chart',
    name: 'Chart',
    description: 'Interactive charts with multiple visualization types',
    category: 'data-visualization',
    icon: '📈',
    reduction: 93,
    traditionalLines: 450,
    factoryLines: 30,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Line, bar, pie, area charts',
      'Real-time updates',
      'Interactive tooltips',
      'Export to PNG/SVG',
      'Responsive sizing'
    ],
    codeExamples: {
      react: `const SalesChart = ui.createChart({
  type: 'line',
  data: {
    labels: months,
    datasets: [{
      label: 'Sales',
      data: salesData,
      borderColor: '#0969da',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});`
    },
    githubPath: getGitHubLink('component', 'Chart'),
    dateAdded: Date.now() - 35 * 24 * 60 * 60 * 1000,
    author: 'Vladimir Dukelic',
    tags: ['chart', 'graph', 'visualization', 'analytics'],
    demoUrl: '/demos/chart',
    documentationUrl: '/docs/components/chart',
    popularity: 94
  },
  
  // Add more components following the same enhanced pattern...
  // Each component now has:
  // - GitHub link
  // - Date added
  // - Author
  // - Tags
  // - Demo URL
  // - Documentation URL
  // - Popularity score
  // - Examples for multiple frameworks
]

// Helper functions
export function getComponentsByCategory(categoryId: string) {
  return components.filter(c => c.category === categoryId)
}

export function getComponentsByFramework(frameworkId: string) {
  return components.filter(c => c.frameworks.includes(frameworkId))
}

export function getComponentsByAuthor(author: string) {
  return components.filter(c => c.author === author)
}

export function searchComponents(query: string) {
  const q = query.toLowerCase()
  return components.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.tags.some(tag => tag.toLowerCase().includes(q))
  )
}

export function getStats() {
  const totalComponents = components.length
  const totalReduction = components.reduce((acc, c) => acc + c.reduction, 0)
  const avgReduction = Math.round(totalReduction / totalComponents)
  const totalFrameworks = frameworks.length
  
  return {
    totalComponents,
    avgReduction,
    frameworks: totalFrameworks,
    categories: categories.length,
    downloads: '50K+', // This would come from npm stats
    stars: '1.2K' // This would come from GitHub API
  }
}

export function getComponentById(id: string) {
  return components.find(c => c.id === id)
}