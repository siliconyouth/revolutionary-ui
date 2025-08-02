export class ComponentRegistry {
    constructor() {
        this.components = this.initializeComponents();
        this.categories = this.initializeCategories();
        this.frameworks = this.initializeFrameworks();
    }

    initializeComponents() {
        return [
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
            },
            {
                id: 'shopping-cart',
                name: 'ShoppingCart',
                category: 'e-commerce',
                icon: '🛒',
                description: 'Shopping cart with item management and checkout',
                reduction: 91,
                traditionalLines: 500,
                factoryLines: 45,
                frameworks: ['react', 'vue', 'angular', 'svelte'],
                features: [
                    'Item quantity',
                    'Price calculation',
                    'Discount codes',
                    'Save for later',
                    'Checkout flow'
                ]
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
                ]
            },

            // Enterprise
            {
                id: 'org-chart',
                name: 'OrgChart',
                category: 'enterprise',
                icon: '🏢',
                description: 'Hierarchical organization chart visualization',
                reduction: 93,
                traditionalLines: 700,
                factoryLines: 49,
                frameworks: ['react', 'vue', 'angular'],
                features: [
                    'Hierarchical layout',
                    'Expand/collapse',
                    'Search employees',
                    'Export to PDF',
                    'Custom node templates'
                ]
            },
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
                ]
            }
        ];
    }

    initializeCategories() {
        return [
            {
                id: 'data-visualization',
                name: 'Data Visualization',
                icon: '📊',
                description: 'Charts, graphs, and data display components',
                componentCount: 8
            },
            {
                id: 'forms-inputs',
                name: 'Forms & Inputs',
                icon: '📝',
                description: 'Form controls and input components',
                componentCount: 8
            },
            {
                id: 'navigation',
                name: 'Navigation',
                icon: '🧭',
                description: 'Navigation and wayfinding components',
                componentCount: 8
            },
            {
                id: 'feedback',
                name: 'Feedback',
                icon: '💡',
                description: 'User feedback and notification components',
                componentCount: 8
            },
            {
                id: 'layout',
                name: 'Layout',
                icon: '🎨',
                description: 'Layout and container components',
                componentCount: 8
            },
            {
                id: 'media',
                name: 'Media',
                icon: '🖼️',
                description: 'Media display and manipulation components',
                componentCount: 8
            },
            {
                id: 'e-commerce',
                name: 'E-commerce',
                icon: '🛍️',
                description: 'Shopping and commerce components',
                componentCount: 8
            },
            {
                id: 'productivity',
                name: 'Productivity',
                icon: '⚡',
                description: 'Task and project management components',
                componentCount: 8
            },
            {
                id: 'real-time',
                name: 'Real-time',
                icon: '🔄',
                description: 'Live updates and collaboration components',
                componentCount: 8
            },
            {
                id: 'communication',
                name: 'Communication',
                icon: '💬',
                description: 'Messaging and communication components',
                componentCount: 8
            },
            {
                id: 'gaming',
                name: 'Gaming',
                icon: '🎮',
                description: 'Game-related UI components',
                componentCount: 8
            },
            {
                id: 'developer-tools',
                name: 'Developer Tools',
                icon: '🛠️',
                description: 'Code editors and development tools',
                componentCount: 8
            },
            {
                id: 'accessibility',
                name: 'Accessibility',
                icon: '♿',
                description: 'Accessibility-focused components',
                componentCount: 6
            },
            {
                id: 'mobile',
                name: 'Mobile',
                icon: '📱',
                description: 'Mobile-specific UI components',
                componentCount: 7
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                icon: '🏢',
                description: 'Business and enterprise components',
                componentCount: 7
            }
        ];
    }

    initializeFrameworks() {
        return [
            {
                id: 'react',
                name: 'React',
                logo: '/assets/react-logo.svg',
                description: 'Build user interfaces with components',
                example: `const ui = setup('react');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'vue',
                name: 'Vue',
                logo: '/assets/vue-logo.svg',
                description: 'The progressive JavaScript framework',
                example: `const ui = setup('vue');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'angular',
                name: 'Angular',
                logo: '/assets/angular-logo.svg',
                description: 'Platform for building mobile and desktop apps',
                example: `const ui = setup('angular');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'svelte',
                name: 'Svelte',
                logo: '/assets/svelte-logo.svg',
                description: 'Cybernetically enhanced web apps',
                example: `const ui = setup('svelte');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'solid',
                name: 'Solid',
                logo: '/assets/solid-logo.svg',
                description: 'Simple and performant reactivity',
                example: `const ui = setup('solid');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'preact',
                name: 'Preact',
                logo: '/assets/preact-logo.svg',
                description: 'Fast 3kB alternative to React',
                example: `const ui = setup('preact');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'alpine',
                name: 'Alpine.js',
                logo: '/assets/alpine-logo.svg',
                description: 'Your new, lightweight JavaScript framework',
                example: `const ui = setup('alpine');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'lit',
                name: 'Lit',
                logo: '/assets/lit-logo.svg',
                description: 'Simple. Fast. Web Components.',
                example: `const ui = setup('lit');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'qwik',
                name: 'Qwik',
                logo: '/assets/qwik-logo.svg',
                description: 'Instant-loading web apps',
                example: `const ui = setup('qwik');
const Dashboard = ui.createDashboard({ ... });`
            },
            {
                id: 'astro',
                name: 'Astro',
                logo: '/assets/astro-logo.svg',
                description: 'Build faster websites',
                example: `const ui = setup('astro');
const Dashboard = ui.createDashboard({ ... });`
            }
        ];
    }

    getStats() {
        return {
            totalComponents: this.components.length,
            frameworks: this.frameworks.length,
            categories: this.categories.length,
            averageReduction: Math.round(
                this.components.reduce((sum, c) => sum + c.reduction, 0) / this.components.length
            )
        };
    }

    getCategories() {
        return this.categories.map(cat => ({
            ...cat,
            count: this.components.filter(c => c.category === cat.id).length
        }));
    }

    getCategoriesDetailed() {
        return this.categories.map(cat => {
            const categoryComponents = this.components.filter(c => c.category === cat.id);
            return {
                ...cat,
                componentCount: categoryComponents.length,
                avgReduction: Math.round(
                    categoryComponents.reduce((sum, c) => sum + c.reduction, 0) / categoryComponents.length
                ),
                topComponents: categoryComponents.slice(0, 5)
            };
        });
    }

    getFrameworks() {
        return this.frameworks;
    }

    getFrameworksDetailed() {
        return this.frameworks.map(fw => {
            const fwComponents = this.components.filter(c => c.frameworks.includes(fw.id));
            return {
                ...fw,
                componentCount: fwComponents.length,
                avgReduction: Math.round(
                    fwComponents.reduce((sum, c) => sum + c.reduction, 0) / fwComponents.length
                )
            };
        });
    }

    getComponent(id) {
        return this.components.find(c => c.id === id);
    }

    getFilteredComponents(search = '', category = 'all', framework = 'all', sortBy = 'popular') {
        let filtered = [...this.components];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchLower) ||
                c.description.toLowerCase().includes(searchLower) ||
                c.category.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (category !== 'all') {
            filtered = filtered.filter(c => c.category === category);
        }

        // Framework filter
        if (framework !== 'all') {
            filtered = filtered.filter(c => c.frameworks.includes(framework));
        }

        // Sorting
        switch (sortBy) {
            case 'reduction':
                filtered.sort((a, b) => b.reduction - a.reduction);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                // In a real app, we'd have timestamps
                filtered.reverse();
                break;
            case 'popular':
            default:
                // In a real app, we'd have usage stats
                filtered.sort((a, b) => b.reduction - a.reduction);
        }

        return filtered;
    }
}