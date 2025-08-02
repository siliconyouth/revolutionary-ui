export interface Component {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  reduction: number;
  traditionalLines: number;
  factoryLines: number;
  frameworks: string[];
  features: string[];
  codeExamples: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  componentCount?: number;
}

export interface Framework {
  id: string;
  name: string;
  logo: string;
  description: string;
  example: string;
}

export const components: Component[] = [
  // Data Visualization
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'data-visualization',
    icon: '📊',
    description: 'Comprehensive dashboard with widgets, charts, and real-time data',
    reduction: 96,
    traditionalLines: 1000,
    factoryLines: 40,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
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
});`
    }
  },
  {
    id: 'chart',
    name: 'Chart',
    category: 'data-visualization',
    icon: '📈',
    description: 'Interactive charts with multiple visualization types',
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
    }
  },
  {
    id: 'data-table',
    name: 'DataTable',
    category: 'data-visualization',
    icon: '📋',
    description: 'Feature-rich data table with sorting, filtering, and pagination',
    reduction: 94,
    traditionalLines: 500,
    factoryLines: 30,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Advanced sorting',
      'Column filtering',
      'Pagination',
      'Row selection',
      'Export to CSV/Excel',
      'Column resizing',
      'Virtual scrolling'
    ],
    codeExamples: {
      react: `const UserTable = ui.createDataTable({
  columns: [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'status', header: 'Status', accessorKey: 'status' }
  ],
  data: users,
  sortable: true,
  searchable: true,
  pagination: true,
  selectable: true
});`
    }
  },
  {
    id: 'stats-card',
    name: 'StatsCard',
    category: 'data-visualization',
    icon: '🎯',
    description: 'Metric display card with trend indicators',
    reduction: 90,
    traditionalLines: 200,
    factoryLines: 20,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'preact'],
    features: [
      'Animated counters',
      'Trend arrows',
      'Sparkline support',
      'Custom icons',
      'Loading states'
    ],
    codeExamples: {
      react: `const RevenueCard = ui.createStatsCard({
  value: monthlyRevenue,
  label: 'Monthly Revenue',
  trend: 'up',
  change: 15.3,
  sparkline: revenueHistory,
  icon: '💰'
});`
    }
  },

  // Forms & Inputs
  {
    id: 'form',
    name: 'Form',
    category: 'forms-inputs',
    icon: '📝',
    description: 'Dynamic form with validation and error handling',
    reduction: 94,
    traditionalLines: 400,
    factoryLines: 24,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Schema-based validation',
      'Async validation',
      'Field dependencies',
      'Error messages',
      'Submit handling',
      'Reset functionality'
    ],
    codeExamples: {
      react: `const ContactForm = ui.createForm({
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    message: z.string().min(10, 'Message too short')
  }),
  fields: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'message', label: 'Message', type: 'textarea' }
  ],
  onSubmit: async (data) => {
    await sendEmail(data);
  }
});`
    }
  },
  {
    id: 'input',
    name: 'Input',
    category: 'forms-inputs',
    icon: '✏️',
    description: 'Flexible input component with built-in validation',
    reduction: 85,
    traditionalLines: 100,
    factoryLines: 15,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid', 'preact'],
    features: [
      'Multiple input types',
      'Built-in validation',
      'Error states',
      'Icons support',
      'Clear button'
    ],
    codeExamples: {
      react: `const EmailInput = ui.createInput({
  type: 'email',
  label: 'Email Address',
  placeholder: 'your@email.com',
  validation: z.string().email(),
  icon: '✉️',
  clearable: true
});`
    }
  },

  // Navigation
  {
    id: 'command-palette',
    name: 'CommandPalette',
    category: 'navigation',
    icon: '🎮',
    description: 'Spotlight-style command palette for quick actions',
    reduction: 95,
    traditionalLines: 500,
    factoryLines: 25,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
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
    }
  },
  {
    id: 'navbar',
    name: 'Navbar',
    category: 'navigation',
    icon: '🧭',
    description: 'Responsive navigation bar with mobile menu',
    reduction: 89,
    traditionalLines: 300,
    factoryLines: 33,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Responsive design',
      'Mobile menu',
      'Dropdown support',
      'Active states',
      'Search integration'
    ],
    codeExamples: {
      react: `const MainNav = ui.createNavbar({
  logo: { text: 'Revolutionary UI', icon: '🏭' },
  links: [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Docs', href: '/docs' }
  ],
  actions: [
    { label: 'GitHub', icon: '🐙', href: '/github' }
  ]
});`
    }
  },

  // Productivity
  {
    id: 'kanban',
    name: 'Kanban Board',
    category: 'productivity',
    icon: '📌',
    description: 'Drag-and-drop Kanban board for project management',
    reduction: 95,
    traditionalLines: 600,
    factoryLines: 30,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Drag & drop',
      'Custom columns',
      'Card templates',
      'Swimlanes',
      'WIP limits',
      'Filters'
    ],
    codeExamples: {
      react: `const ProjectKanban = ui.createKanban({
  columns: [
    { id: 'todo', title: 'To Do', items: todoTasks },
    { id: 'progress', title: 'In Progress', items: progressTasks },
    { id: 'done', title: 'Done', items: doneTasks }
  ],
  onDragEnd: (result) => updateTaskStatus(result),
  cardRenderer: (task) => <TaskCard {...task} />
});`
    }
  },
  {
    id: 'calendar',
    name: 'Calendar',
    category: 'productivity',
    icon: '📅',
    description: 'Full-featured calendar with event management',
    reduction: 96,
    traditionalLines: 800,
    factoryLines: 35,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Month/week/day views',
      'Event creation',
      'Drag to reschedule',
      'Recurring events',
      'Reminders',
      'Multiple calendars'
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
    }
  },

  // Real-time
  {
    id: 'chat',
    name: 'Chat Interface',
    category: 'real-time',
    icon: '💬',
    description: 'Real-time chat with typing indicators and reactions',
    reduction: 92,
    traditionalLines: 700,
    factoryLines: 56,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Real-time messaging',
      'Typing indicators',
      'Read receipts',
      'Emoji reactions',
      'File attachments',
      'Message threads'
    ],
    codeExamples: {
      react: `const ChatInterface = ui.createChat({
  messages: chatMessages,
  currentUser: user,
  onSendMessage: (message) => sendMessage(message),
  features: {
    typing: true,
    reactions: true,
    attachments: true,
    threads: true
  }
});`
    }
  },

  // E-commerce
  {
    id: 'product-card',
    name: 'ProductCard',
    category: 'e-commerce',
    icon: '🛍️',
    description: 'E-commerce product card with quick actions',
    reduction: 89,
    traditionalLines: 350,
    factoryLines: 39,
    frameworks: ['react', 'vue', 'angular', 'svelte', 'solid'],
    features: [
      'Image carousel',
      'Quick add to cart',
      'Wishlist toggle',
      'Price display',
      'Rating stars',
      'Sale badges'
    ],
    codeExamples: {
      react: `const ProductCard = ui.createProductCard({
  product: {
    name: productName,
    price: productPrice,
    images: productImages,
    rating: 4.5,
    onSale: true
  },
  onAddToCart: () => addToCart(product),
  onToggleWishlist: () => toggleWishlist(product)
});`
    }
  },

  // Mobile
  {
    id: 'bottom-sheet',
    name: 'BottomSheet',
    category: 'mobile',
    icon: '📱',
    description: 'Swipeable bottom sheet for mobile interfaces',
    reduction: 90,
    traditionalLines: 350,
    factoryLines: 35,
    frameworks: ['react', 'vue', 'angular', 'svelte'],
    features: [
      'Swipe gestures',
      'Multiple snap points',
      'Backdrop',
      'Handle indicator',
      'Smooth animations'
    ],
    codeExamples: {
      react: `const MobileSheet = ui.createBottomSheet({
  snapPoints: ['25%', '50%', '90%'],
  initialSnap: 1,
  backdrop: true,
  onClose: () => setSheetOpen(false),
  children: <SheetContent />
});`
    }
  },

  // Enterprise
  {
    id: 'workflow',
    name: 'Workflow Builder',
    category: 'enterprise',
    icon: '⚙️',
    description: 'Visual workflow designer with node connections',
    reduction: 92,
    traditionalLines: 750,
    factoryLines: 60,
    frameworks: ['react', 'vue', 'angular'],
    features: [
      'Drag & drop nodes',
      'Connection lines',
      'Validation',
      'Export/import',
      'Zoom & pan'
    ],
    codeExamples: {
      react: `const WorkflowDesigner = ui.createWorkflow({
  nodes: workflowNodes,
  connections: nodeConnections,
  onNodeAdd: (node) => addNode(node),
  onConnectionCreate: (connection) => createConnection(connection),
  validation: workflowRules
});`
    }
  }
];

export const categories: Category[] = [
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    icon: '📊',
    description: 'Charts, graphs, and data display components'
  },
  {
    id: 'forms-inputs',
    name: 'Forms & Inputs',
    icon: '📝',
    description: 'Form controls and input components'
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: '🧭',
    description: 'Navigation and wayfinding components'
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: '💡',
    description: 'User feedback and notification components'
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: '🎨',
    description: 'Layout and container components'
  },
  {
    id: 'media',
    name: 'Media',
    icon: '🖼️',
    description: 'Media display and manipulation components'
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    icon: '🛍️',
    description: 'Shopping and commerce components'
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    description: 'Task and project management components'
  },
  {
    id: 'real-time',
    name: 'Real-time',
    icon: '🔄',
    description: 'Live updates and collaboration components'
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'Messaging and communication components'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    description: 'Game-related UI components'
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    icon: '🛠️',
    description: 'Code editors and development tools'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: '♿',
    description: 'Accessibility-focused components'
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: '📱',
    description: 'Mobile-specific UI components'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '🏢',
    description: 'Business and enterprise components'
  }
];

export const frameworks: Framework[] = [
  {
    id: 'react',
    name: 'React',
    logo: '/logos/react.svg',
    description: 'Build user interfaces with components',
    example: `const ui = setup('react');
const Dashboard = ui.createDashboard({ ... });`
  },
  {
    id: 'vue',
    name: 'Vue',
    logo: '/logos/vue.svg',
    description: 'The progressive JavaScript framework',
    example: `const ui = setup('vue');
const Dashboard = ui.createDashboard({ ... });`
  },
  {
    id: 'angular',
    name: 'Angular',
    logo: '/logos/angular.svg',
    description: 'Platform for building mobile and desktop apps',
    example: `const ui = setup('angular');
const Dashboard = ui.createDashboard({ ... });`
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: '/logos/svelte.svg',
    description: 'Cybernetically enhanced web apps',
    example: `const ui = setup('svelte');
const Dashboard = ui.createDashboard({ ... });`
  },
  {
    id: 'solid',
    name: 'Solid',
    logo: '/logos/solid.svg',
    description: 'Simple and performant reactivity',
    example: `const ui = setup('solid');
const Dashboard = ui.createDashboard({ ... });`
  }
];

// Helper functions
export function getComponentsByCategory(categoryId: string): Component[] {
  return components.filter(c => c.category === categoryId);
}

export function getComponentById(id: string): Component | undefined {
  return components.find(c => c.id === id);
}

export function searchComponents(query: string): Component[] {
  const searchLower = query.toLowerCase();
  return components.filter(c => 
    c.name.toLowerCase().includes(searchLower) ||
    c.description.toLowerCase().includes(searchLower) ||
    c.category.toLowerCase().includes(searchLower)
  );
}

export function getStats() {
  const totalComponents = components.length;
  const avgReduction = Math.round(
    components.reduce((sum, c) => sum + c.reduction, 0) / totalComponents
  );
  
  return {
    totalComponents,
    totalCategories: categories.length,
    totalFrameworks: frameworks.length,
    avgReduction
  };
}