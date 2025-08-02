export class MarketplaceApp {
    constructor(container, registry, router) {
        this.container = container;
        this.registry = registry;
        this.router = router;
        this.state = {
            searchQuery: '',
            selectedCategory: 'all',
            selectedFramework: 'all',
            sortBy: 'popular',
            viewMode: 'grid'
        };
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.router.on('route', () => this.handleRouteChange());
    }

    render() {
        this.container.innerHTML = `
            <div class="marketplace-app">
                ${this.renderHeader()}
                ${this.renderHero()}
                ${this.renderFilters()}
                <main class="marketplace-content">
                    <div class="container">
                        ${this.renderContent()}
                    </div>
                </main>
                ${this.renderFooter()}
            </div>
        `;
    }

    renderHeader() {
        return `
            <header class="marketplace-header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">
                            <span class="logo-icon">🏭</span>
                            <span class="logo-text">Revolutionary UI</span>
                            <span class="logo-version">v2.0</span>
                        </div>
                        <nav class="main-nav">
                            <a href="#/" class="nav-link ${this.router.currentPath === '/' ? 'active' : ''}">Browse</a>
                            <a href="#/categories" class="nav-link ${this.router.currentPath === '/categories' ? 'active' : ''}">Categories</a>
                            <a href="#/frameworks" class="nav-link ${this.router.currentPath === '/frameworks' ? 'active' : ''}">Frameworks</a>
                            <a href="#/docs" class="nav-link">Docs</a>
                            <a href="https://github.com/siliconyouth/revolutionary-ui-factory-system" class="nav-link" target="_blank">GitHub</a>
                        </nav>
                        <div class="header-actions">
                            <button class="btn btn-primary">Get Started</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    renderHero() {
        const stats = this.registry.getStats();
        return `
            <section class="hero">
                <div class="container">
                    <h1 class="hero-title">Component Marketplace</h1>
                    <p class="hero-subtitle">
                        Browse ${stats.totalComponents}+ UI components with ${stats.averageReduction}% average code reduction
                    </p>
                    <div class="hero-stats">
                        <div class="stat-card">
                            <div class="stat-value">${stats.totalComponents}+</div>
                            <div class="stat-label">Components</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.frameworks}+</div>
                            <div class="stat-label">Frameworks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.averageReduction}%</div>
                            <div class="stat-label">Avg. Reduction</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.categories}</div>
                            <div class="stat-label">Categories</div>
                        </div>
                    </div>
                    <div class="hero-search">
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="Search components... (e.g., Dashboard, Kanban, Form)"
                            value="${this.state.searchQuery}"
                            id="component-search"
                        >
                        <button class="search-btn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </section>
        `;
    }

    renderFilters() {
        const categories = this.registry.getCategories();
        const frameworks = this.registry.getFrameworks();
        
        return `
            <section class="filters">
                <div class="container">
                    <div class="filter-row">
                        <div class="filter-group">
                            <label class="filter-label">Category</label>
                            <select class="filter-select" id="category-filter">
                                <option value="all">All Categories</option>
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${this.state.selectedCategory === cat.id ? 'selected' : ''}>
                                        ${cat.name} (${cat.count})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Framework</label>
                            <select class="filter-select" id="framework-filter">
                                <option value="all">All Frameworks</option>
                                ${frameworks.map(fw => `
                                    <option value="${fw.id}" ${this.state.selectedFramework === fw.id ? 'selected' : ''}>
                                        ${fw.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Sort By</label>
                            <select class="filter-select" id="sort-filter">
                                <option value="popular" ${this.state.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
                                <option value="reduction" ${this.state.sortBy === 'reduction' ? 'selected' : ''}>Highest Reduction</option>
                                <option value="name" ${this.state.sortBy === 'name' ? 'selected' : ''}>Name (A-Z)</option>
                                <option value="newest" ${this.state.sortBy === 'newest' ? 'selected' : ''}>Recently Added</option>
                            </select>
                        </div>
                        <div class="filter-group filter-actions">
                            <button class="view-toggle ${this.state.viewMode === 'grid' ? 'active' : ''}" data-view="grid">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <rect x="1" y="1" width="7" height="7" />
                                    <rect x="11" y="1" width="7" height="7" />
                                    <rect x="1" y="11" width="7" height="7" />
                                    <rect x="11" y="11" width="7" height="7" />
                                </svg>
                            </button>
                            <button class="view-toggle ${this.state.viewMode === 'list' ? 'active' : ''}" data-view="list">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <rect x="1" y="2" width="18" height="3" />
                                    <rect x="1" y="8" width="18" height="3" />
                                    <rect x="1" y="14" width="18" height="3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderContent() {
        const route = this.router.currentPath;
        
        switch (route) {
            case '/':
                return this.renderComponentGrid();
            case '/categories':
                return this.renderCategoriesPage();
            case '/frameworks':
                return this.renderFrameworksPage();
            default:
                if (route.startsWith('/component/')) {
                    const componentId = route.split('/')[2];
                    return this.renderComponentDetail(componentId);
                }
                return this.renderComponentGrid();
        }
    }

    renderComponentGrid() {
        const components = this.registry.getFilteredComponents(
            this.state.searchQuery,
            this.state.selectedCategory,
            this.state.selectedFramework,
            this.state.sortBy
        );

        if (components.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No components found</h3>
                    <p>Try adjusting your filters or search query</p>
                </div>
            `;
        }

        return `
            <div class="components-grid ${this.state.viewMode}">
                ${components.map(component => this.renderComponentCard(component)).join('')}
            </div>
        `;
    }

    renderComponentCard(component) {
        const reductionClass = component.reduction >= 90 ? 'high' : 
                              component.reduction >= 80 ? 'medium' : 'normal';
        
        return `
            <article class="component-card" data-component-id="${component.id}">
                <div class="component-preview">
                    <div class="preview-placeholder">
                        <span class="preview-icon">${component.icon}</span>
                    </div>
                    <div class="component-badges">
                        <span class="badge badge-reduction ${reductionClass}">
                            ${component.reduction}% reduction
                        </span>
                    </div>
                </div>
                <div class="component-info">
                    <h3 class="component-name">${component.name}</h3>
                    <p class="component-description">${component.description}</p>
                    <div class="component-meta">
                        <span class="meta-item">
                            <span class="meta-icon">📏</span>
                            ${component.traditionalLines} → ${component.factoryLines} lines
                        </span>
                        <span class="meta-item">
                            <span class="meta-icon">📁</span>
                            ${component.category}
                        </span>
                    </div>
                    <div class="component-frameworks">
                        ${component.frameworks.slice(0, 3).map(fw => `
                            <span class="framework-tag">${fw}</span>
                        `).join('')}
                        ${component.frameworks.length > 3 ? `
                            <span class="framework-tag">+${component.frameworks.length - 3}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="component-actions">
                    <a href="#/component/${component.id}" class="btn btn-outline">View Details</a>
                    <button class="btn btn-primary btn-small">Copy Code</button>
                </div>
            </article>
        `;
    }

    renderComponentDetail(componentId) {
        const component = this.registry.getComponent(componentId);
        if (!component) {
            return '<div class="error">Component not found</div>';
        }

        return `
            <div class="component-detail">
                <div class="detail-header">
                    <a href="#/" class="back-link">← Back to components</a>
                    <h1 class="detail-title">
                        <span class="detail-icon">${component.icon}</span>
                        ${component.name}
                    </h1>
                    <p class="detail-description">${component.description}</p>
                    <div class="detail-stats">
                        <div class="stat">
                            <span class="stat-label">Code Reduction</span>
                            <span class="stat-value">${component.reduction}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Traditional</span>
                            <span class="stat-value">${component.traditionalLines} lines</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Factory</span>
                            <span class="stat-value">${component.factoryLines} lines</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Category</span>
                            <span class="stat-value">${component.category}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-content">
                    <div class="code-examples">
                        <h2>Code Examples</h2>
                        <div class="framework-tabs">
                            ${component.frameworks.map((fw, index) => `
                                <button class="tab ${index === 0 ? 'active' : ''}" data-framework="${fw}">
                                    ${fw}
                                </button>
                            `).join('')}
                        </div>
                        <div class="code-container">
                            <pre><code class="language-javascript">${this.getComponentCode(component, component.frameworks[0])}</code></pre>
                            <button class="copy-btn">Copy Code</button>
                        </div>
                    </div>

                    <div class="component-features">
                        <h2>Features</h2>
                        <ul class="features-list">
                            ${component.features.map(feature => `
                                <li>${feature}</li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="component-usage">
                        <h2>Usage</h2>
                        <div class="usage-steps">
                            <div class="step">
                                <span class="step-number">1</span>
                                <div class="step-content">
                                    <h3>Install the package</h3>
                                    <pre><code>npm install @vladimirdukelic/revolutionary-ui</code></pre>
                                </div>
                            </div>
                            <div class="step">
                                <span class="step-number">2</span>
                                <div class="step-content">
                                    <h3>Import and setup</h3>
                                    <pre><code>import { setup } from '@vladimirdukelic/revolutionary-ui';
const ui = setup();</code></pre>
                                </div>
                            </div>
                            <div class="step">
                                <span class="step-number">3</span>
                                <div class="step-content">
                                    <h3>Create your component</h3>
                                    <pre><code>${this.getComponentCode(component, 'react')}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoriesPage() {
        const categories = this.registry.getCategoriesDetailed();
        
        return `
            <div class="categories-page">
                <h1>Component Categories</h1>
                <p class="page-subtitle">Explore our 15 categories with 150+ components</p>
                
                <div class="categories-grid">
                    ${categories.map(category => `
                        <div class="category-card">
                            <div class="category-icon">${category.icon}</div>
                            <h2 class="category-name">${category.name}</h2>
                            <p class="category-description">${category.description}</p>
                            <div class="category-stats">
                                <span>${category.componentCount} components</span>
                                <span>${category.avgReduction}% avg reduction</span>
                            </div>
                            <div class="category-components">
                                ${category.topComponents.slice(0, 5).map(comp => `
                                    <a href="#/component/${comp.id}" class="component-link">${comp.name}</a>
                                `).join('')}
                            </div>
                            <a href="#/?category=${category.id}" class="btn btn-outline">Browse Category</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFrameworksPage() {
        const frameworks = this.registry.getFrameworksDetailed();
        
        return `
            <div class="frameworks-page">
                <h1>Supported Frameworks</h1>
                <p class="page-subtitle">Revolutionary UI Factory works with any framework</p>
                
                <div class="frameworks-grid">
                    ${frameworks.map(framework => `
                        <div class="framework-card">
                            <div class="framework-header">
                                <img src="${framework.logo}" alt="${framework.name}" class="framework-logo">
                                <h2 class="framework-name">${framework.name}</h2>
                            </div>
                            <p class="framework-description">${framework.description}</p>
                            <div class="framework-stats">
                                <div class="stat">
                                    <span class="stat-value">${framework.componentCount}</span>
                                    <span class="stat-label">Components</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${framework.avgReduction}%</span>
                                    <span class="stat-label">Avg Reduction</span>
                                </div>
                            </div>
                            <div class="framework-example">
                                <h3>Quick Example</h3>
                                <pre><code>${framework.example}</code></pre>
                            </div>
                            <a href="#/?framework=${framework.id}" class="btn btn-primary">Browse ${framework.name} Components</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFooter() {
        return `
            <footer class="marketplace-footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>Revolutionary UI</h3>
                            <p>Generate ANY UI component for ANY framework with 60-95% code reduction.</p>
                            <div class="social-links">
                                <a href="https://github.com/siliconyouth/revolutionary-ui-factory-system" target="_blank">GitHub</a>
                                <a href="https://www.npmjs.com/package/@vladimirdukelic/revolutionary-ui" target="_blank">npm</a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h3>Resources</h3>
                            <ul class="footer-links">
                                <li><a href="#/docs">Documentation</a></li>
                                <li><a href="#/examples">Examples</a></li>
                                <li><a href="#/tutorials">Tutorials</a></li>
                                <li><a href="#/api">API Reference</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Community</h3>
                            <ul class="footer-links">
                                <li><a href="https://github.com/siliconyouth/revolutionary-ui-factory-system/discussions" target="_blank">Discussions</a></li>
                                <li><a href="https://github.com/siliconyouth/revolutionary-ui-factory-system/issues" target="_blank">Issues</a></li>
                                <li><a href="#/contribute">Contribute</a></li>
                                <li><a href="#/showcase">Showcase</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h3>Stay Updated</h3>
                            <p>Get notified about new components and updates</p>
                            <form class="newsletter-form">
                                <input type="email" placeholder="your@email.com" class="newsletter-input">
                                <button type="submit" class="btn btn-primary">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 Vladimir Dukelic. MIT License.</p>
                    </div>
                </div>
            </footer>
        `;
    }

    getComponentCode(component, framework) {
        // Return framework-specific code examples
        const examples = component.codeExamples || {};
        return examples[framework] || examples.react || '// Code example coming soon';
    }

    attachEventListeners() {
        // Search functionality
        this.container.addEventListener('input', (e) => {
            if (e.target.id === 'component-search') {
                this.state.searchQuery = e.target.value;
                this.renderContent();
            }
        });

        // Filter changes
        this.container.addEventListener('change', (e) => {
            if (e.target.id === 'category-filter') {
                this.state.selectedCategory = e.target.value;
                this.render();
            } else if (e.target.id === 'framework-filter') {
                this.state.selectedFramework = e.target.value;
                this.render();
            } else if (e.target.id === 'sort-filter') {
                this.state.sortBy = e.target.value;
                this.render();
            }
        });

        // View mode toggle
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.view-toggle')) {
                const viewMode = e.target.closest('.view-toggle').dataset.view;
                this.state.viewMode = viewMode;
                this.render();
            }
        });

        // Copy code functionality
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn') || e.target.textContent === 'Copy Code') {
                const codeBlock = e.target.previousElementSibling.querySelector('code');
                if (codeBlock) {
                    navigator.clipboard.writeText(codeBlock.textContent);
                    e.target.textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.textContent = 'Copy Code';
                    }, 2000);
                }
            }
        });
    }

    handleRouteChange() {
        this.render();
    }
}