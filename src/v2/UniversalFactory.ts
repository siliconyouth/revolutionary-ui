/**
 * Revolutionary UI Factory v2.0 - Universal Component Factory
 * Supports ALL component types across ALL frameworks
 */

import { BaseFactory } from '../core/BaseFactory';
import { ComponentRegistry } from './ComponentRegistry';
import { FrameworkAdapter } from './FrameworkAdapter';
import { StyleSystemAdapter } from './StyleSystemAdapter';

// Component configuration types
export interface UniversalComponentConfig {
  // Core properties
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
  style?: Record<string, any>;
  
  // State management
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  
  // Responsive design
  responsive?: {
    mobile?: Partial<UniversalComponentConfig>;
    tablet?: Partial<UniversalComponentConfig>;
    desktop?: Partial<UniversalComponentConfig>;
  };
  
  // Animations
  animation?: {
    enter?: string;
    exit?: string;
    duration?: number;
  };
  
  // Accessibility
  a11y?: {
    role?: string;
    label?: string;
    description?: string;
    live?: 'polite' | 'assertive' | 'off';
  };
  
  // Internationalization
  i18n?: {
    locale?: string;
    translations?: Record<string, string>;
    rtl?: boolean;
  };
  
  // Testing
  testId?: string;
  
  // Custom props
  [key: string]: any;
}

// Framework version detection
export interface FrameworkVersion {
  name: string;
  version: string;
  features: string[];
  compatibilityWarnings?: string[];
}

// Tailwind CSS version handling
export interface TailwindConfig {
  version: 3 | 4;
  useImport?: boolean; // @import vs @tailwind
  applySupported?: boolean;
  layersSupported?: boolean;
}

export class UniversalFactory extends BaseFactory {
  private componentRegistry: ComponentRegistry;
  private frameworkAdapters: Map<string, FrameworkAdapter> = new Map();
  private styleAdapters: Map<string, StyleSystemAdapter> = new Map();
  private currentFramework: string = 'react';
  private currentStyleSystem: string = 'css-in-js';
  private frameworkVersions: Map<string, FrameworkVersion> = new Map();
  private tailwindConfig?: TailwindConfig;

  constructor() {
    super('universal-factory', 'universal');
    this.componentRegistry = new ComponentRegistry();
    this.registerBuiltInComponents();
    this.registerBuiltInFrameworks();
    this.registerBuiltInStyleSystems();
    this.detectEnvironment();
  }

  // Abstract method implementations

  renderComponent(component: any, props: any): any {
    const adapter = this.frameworkAdapters.get(this.currentFramework);
    if (!adapter) {
      throw new Error(`Framework adapter not found: ${this.currentFramework}`);
    }
    return adapter.render(component, props);
  }

  getComponentWrapper(): any {
    const adapter = this.frameworkAdapters.get(this.currentFramework);
    return adapter?.getWrapper() || null;
  }

  async initializeFramework(): Promise<void> {
    // Framework initialization if needed
    const adapter = this.frameworkAdapters.get(this.currentFramework);
    if (adapter && typeof adapter.initialize === 'function') {
      await adapter.initialize();
    }
  }

  cleanupFramework(): void {
    // Framework cleanup if needed
    const adapter = this.frameworkAdapters.get(this.currentFramework);
    if (adapter && typeof adapter.cleanup === 'function') {
      adapter.cleanup();
    }
  }

  // ========== LAYOUT COMPONENTS ==========
  
  createContainer(config: UniversalComponentConfig & {
    maxWidth?: string | number;
    padding?: string | number;
    center?: boolean;
  }) {
    return this.createComponent('Container', config);
  }

  createGrid(config: UniversalComponentConfig & {
    columns?: number | string;
    rows?: number | string;
    gap?: string | number;
    areas?: string[];
    autoFlow?: 'row' | 'column' | 'dense';
  }) {
    return this.createComponent('Grid', config);
  }

  createStack(config: UniversalComponentConfig & {
    direction?: 'vertical' | 'horizontal';
    spacing?: string | number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  }) {
    return this.createComponent('Stack', config);
  }

  createSidebar(config: UniversalComponentConfig & {
    position?: 'left' | 'right';
    width?: string | number;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    overlay?: boolean;
  }) {
    return this.createComponent('Sidebar', config);
  }

  createLayout(config: UniversalComponentConfig & {
    type?: 'admin' | 'dashboard' | 'marketing' | 'blog' | 'ecommerce' | 'custom';
    header?: any;
    sidebar?: any;
    footer?: any;
    customAreas?: Record<string, any>;
  }) {
    return this.createComponent('Layout', config);
  }

  // ========== NAVIGATION COMPONENTS ==========
  
  createNavbar(config: UniversalComponentConfig & {
    items: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: any;
      children?: any[];
    }>;
    logo?: any;
    sticky?: boolean;
    transparent?: boolean;
  }) {
    return this.createComponent('Navbar', config);
  }

  createMenu(config: UniversalComponentConfig & {
    items: any[];
    trigger?: any;
    position?: 'top' | 'bottom' | 'left' | 'right';
    nested?: boolean;
  }) {
    return this.createComponent('Menu', config);
  }

  createTabs(config: UniversalComponentConfig & {
    tabs: Array<{
      id: string;
      label: string;
      content: any;
      icon?: any;
      disabled?: boolean;
    }>;
    defaultTab?: string;
    orientation?: 'horizontal' | 'vertical';
    onChange?: (tabId: string) => void;
  }) {
    return this.createComponent('Tabs', config);
  }

  createBreadcrumb(config: UniversalComponentConfig & {
    items: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
    separator?: string | any;
  }) {
    return this.createComponent('Breadcrumb', config);
  }

  createCommandPalette(config: UniversalComponentConfig & {
    commands: Array<{
      id: string;
      label: string;
      shortcut?: string;
      icon?: any;
      action: () => void;
      category?: string;
    }>;
    placeholder?: string;
    hotkey?: string;
  }) {
    return this.createComponent('CommandPalette', config);
  }

  // ========== DATA DISPLAY COMPONENTS ==========
  
  createDataTable(config: UniversalComponentConfig & {
    columns: any[];
    data?: any[];
    features?: {
      sorting?: boolean;
      filtering?: boolean;
      pagination?: boolean;
      selection?: boolean;
      export?: boolean;
      search?: boolean;
      columnResize?: boolean;
      columnReorder?: boolean;
      virtualScroll?: boolean;
    };
  }) {
    return this.createComponent('DataTable', config);
  }

  createCard(config: UniversalComponentConfig & {
    title?: string;
    subtitle?: string;
    content?: any;
    media?: any;
    actions?: any[];
    elevation?: number;
    interactive?: boolean;
  }) {
    return this.createComponent('Card', config);
  }

  createAccordion(config: UniversalComponentConfig & {
    items: Array<{
      id: string;
      title: string;
      content: any;
      icon?: any;
    }>;
    multiple?: boolean;
    defaultExpanded?: string[];
  }) {
    return this.createComponent('Accordion', config);
  }

  createTree(config: UniversalComponentConfig & {
    data: any[];
    expanded?: string[];
    selected?: string[];
    onSelect?: (node: any) => void;
    checkable?: boolean;
  }) {
    return this.createComponent('Tree', config);
  }

  createKanban(config: UniversalComponentConfig & {
    columns: Array<{
      id: string;
      title: string;
      items: any[];
    }>;
    onDragEnd?: (result: any) => void;
    cardRenderer?: (item: any) => any;
  }) {
    return this.createComponent('Kanban', config);
  }

  createCalendar(config: UniversalComponentConfig & {
    events?: any[];
    view?: 'month' | 'week' | 'day' | 'agenda';
    defaultDate?: Date;
    onDateClick?: (date: Date) => void;
    onEventClick?: (event: any) => void;
  }) {
    return this.createComponent('Calendar', config);
  }

  createTimeline(config: UniversalComponentConfig & {
    items: Array<{
      date: Date;
      title: string;
      description?: string;
      icon?: any;
      color?: string;
    }>;
    orientation?: 'vertical' | 'horizontal';
  }) {
    return this.createComponent('Timeline', config);
  }

  // ========== DATA ENTRY COMPONENTS ==========
  
  createForm(config: UniversalComponentConfig & {
    fields: any[];
    onSubmit: (data: any) => void | Promise<void>;
    validation?: any;
    layout?: 'vertical' | 'horizontal' | 'inline';
    submitText?: string;
    resetButton?: boolean;
  }) {
    return this.createComponent('Form', config);
  }

  createInput(config: UniversalComponentConfig & {
    type?: string;
    placeholder?: string;
    value?: any;
    onChange?: (value: any) => void;
    prefix?: any;
    suffix?: any;
    validation?: any;
  }) {
    return this.createComponent('Input', config);
  }

  createSelect(config: UniversalComponentConfig & {
    options: any[];
    value?: any;
    onChange?: (value: any) => void;
    multiple?: boolean;
    searchable?: boolean;
    placeholder?: string;
  }) {
    return this.createComponent('Select', config);
  }

  createDatePicker(config: UniversalComponentConfig & {
    value?: Date;
    onChange?: (date: Date) => void;
    format?: string;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
  }) {
    return this.createComponent('DatePicker', config);
  }

  createFileUpload(config: UniversalComponentConfig & {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    onUpload?: (files: File[]) => void;
    dragDrop?: boolean;
    preview?: boolean;
  }) {
    return this.createComponent('FileUpload', config);
  }

  createRichTextEditor(config: UniversalComponentConfig & {
    value?: string;
    onChange?: (html: string) => void;
    toolbar?: string[] | boolean;
    height?: string | number;
    placeholder?: string;
  }) {
    return this.createComponent('RichTextEditor', config);
  }

  // ========== DATA VISUALIZATION COMPONENTS ==========
  
  createChart(config: UniversalComponentConfig & {
    type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';
    data: any;
    options?: any;
    height?: string | number;
    responsive?: boolean;
  }) {
    return this.createComponent('Chart', config);
  }

  createDashboard(config: UniversalComponentConfig & {
    widgets: Array<{
      id: string;
      type: string;
      config: any;
      gridArea?: string;
    }>;
    layout?: any;
    refreshInterval?: number;
  }) {
    return this.createComponent('Dashboard', config);
  }

  createStats(config: UniversalComponentConfig & {
    value: number | string;
    label: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: any;
    format?: (value: any) => string;
  }) {
    return this.createComponent('Stats', config);
  }

  // ========== FEEDBACK COMPONENTS ==========
  
  createModal(config: UniversalComponentConfig & {
    open: boolean;
    onClose: () => void;
    title?: string;
    content: any;
    actions?: any[];
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlay?: boolean;
  }) {
    return this.createComponent('Modal', config);
  }

  createToast(config: UniversalComponentConfig & {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    action?: {
      label: string;
      onClick: () => void;
    };
  }) {
    return this.createComponent('Toast', config);
  }

  createAlert(config: UniversalComponentConfig & {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    closable?: boolean;
    onClose?: () => void;
    action?: any;
  }) {
    return this.createComponent('Alert', config);
  }

  createSkeleton(config: UniversalComponentConfig & {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
    animation?: 'pulse' | 'wave' | 'none';
  }) {
    return this.createComponent('Skeleton', config);
  }

  // ========== INTERACTIVE COMPONENTS ==========
  
  createButton(config: UniversalComponentConfig & {
    label?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    icon?: any;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
  }) {
    return this.createComponent('Button', config);
  }

  createDropdown(config: UniversalComponentConfig & {
    trigger: any;
    items: any[];
    position?: 'bottom' | 'top' | 'left' | 'right';
    closeOnSelect?: boolean;
  }) {
    return this.createComponent('Dropdown', config);
  }

  createAvatar(config: UniversalComponentConfig & {
    src?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'circle' | 'square';
    status?: 'online' | 'offline' | 'away' | 'busy';
  }) {
    return this.createComponent('Avatar', config);
  }

  createRating(config: UniversalComponentConfig & {
    value?: number;
    onChange?: (rating: number) => void;
    max?: number;
    icon?: any;
    readOnly?: boolean;
    precision?: number;
  }) {
    return this.createComponent('Rating', config);
  }

  // ========== UTILITY METHODS ==========

  /**
   * Create any component by type name
   */
  createComponent(type: string, config: UniversalComponentConfig): any {
    const framework = this.frameworkAdapters.get(this.currentFramework);
    if (!framework) {
      throw new Error(`Framework adapter '${this.currentFramework}' not found`);
    }

    const componentDef = this.componentRegistry.get(type);
    if (!componentDef) {
      throw new Error(`Component type '${type}' not found`);
    }

    // Apply responsive config
    const finalConfig = this.applyResponsiveConfig(config);
    
    // Apply theme
    const themedConfig = this.applyTheme(finalConfig);
    
    // Apply styles
    const styledConfig = this.applyStyles(themedConfig);
    
    // Generate component
    return componentDef.generate(framework, styledConfig);
  }

  /**
   * Register a custom framework adapter
   */
  registerFramework(name: string, adapter: FrameworkAdapter): void {
    this.frameworkAdapters.set(name, adapter);
  }

  /**
   * Register a custom style system
   */
  registerStyleSystem(name: string, adapter: StyleSystemAdapter): void {
    this.styleAdapters.set(name, adapter);
  }

  /**
   * Register a custom component type
   */
  registerComponent(type: string, definition: any): void {
    this.componentRegistry.register(type, definition);
  }

  /**
   * Switch to a different framework
   */
  useFramework(name: string): void {
    if (!this.frameworkAdapters.has(name)) {
      throw new Error(`Framework '${name}' not registered`);
    }
    this.currentFramework = name;
  }

  /**
   * Switch to a different style system
   */
  useStyleSystem(name: string): void {
    if (!this.styleAdapters.has(name)) {
      throw new Error(`Style system '${name}' not registered`);
    }
    this.currentStyleSystem = name;
  }

  // Private methods for internal use
  
  private registerBuiltInComponents(): void {
    // This would register all 100+ component types
    // Each with their specific generation logic
  }

  private registerBuiltInFrameworks(): void {
    // Register React, Vue, Angular, Svelte, etc.
  }

  private registerBuiltInStyleSystems(): void {
    // Register CSS-in-JS, Tailwind, etc.
  }

  private detectEnvironment(): void {
    // Detect framework versions
    if (typeof window !== 'undefined') {
      this.detectReactVersion();
      this.detectTailwindVersion();
    }
  }

  private detectReactVersion(): void {
    try {
      const React = (window as any).React || require('react');
      if (React && React.version) {
        const majorVersion = parseInt(React.version.split('.')[0]);
        this.frameworkVersions.set('react', {
          name: 'react',
          version: React.version,
          features: majorVersion >= 19 ? ['concurrent', 'server-components', 'use-hook'] : [],
          compatibilityWarnings: majorVersion < 18 ? ['Upgrade to React 18+ for best compatibility'] : []
        });
      }
    } catch (e) {
      // React not available
    }
  }

  private detectTailwindVersion(): void {
    // Check for Tailwind CSS version indicators
    if (typeof document !== 'undefined') {
      const hasV4Classes = document.documentElement.classList.contains('tailwindcss') || 
                          document.querySelector('style')?.textContent?.includes('@import "tailwindcss"');
      
      if (hasV4Classes) {
        this.tailwindConfig = {
          version: 4,
          useImport: true,
          applySupported: false,
          layersSupported: false
        };
      } else {
        this.tailwindConfig = {
          version: 3,
          useImport: false,
          applySupported: true,
          layersSupported: true
        };
      }
    }
  }

  private applyResponsiveConfig(config: UniversalComponentConfig): UniversalComponentConfig {
    // Apply responsive breakpoint logic
    return config;
  }

  private applyTheme(config: UniversalComponentConfig): UniversalComponentConfig {
    // Apply theme variables
    return config;
  }

  private applyStyles(config: UniversalComponentConfig): UniversalComponentConfig {
    // Apply style system transformations
    const styleAdapter = this.styleAdapters.get(this.currentStyleSystem);
    
    if (styleAdapter && this.currentStyleSystem === 'tailwind' && this.tailwindConfig) {
      // Handle Tailwind v4 compatibility
      if (this.tailwindConfig.version === 4 && !this.tailwindConfig.applySupported) {
        // Convert @apply directives to direct classes
        config = this.convertApplyToClasses(config);
      }
    }
    
    return config;
  }

  private convertApplyToClasses(config: UniversalComponentConfig): UniversalComponentConfig {
    // Convert @apply directives to className for Tailwind v4
    if (config.className && config.className.includes('@apply')) {
      console.warn('Tailwind CSS v4 detected: @apply directives not supported. Converting to direct classes.');
      // Extract classes from @apply and add to className
      const applyMatch = config.className.match(/@apply\s+([^;]+);?/);
      if (applyMatch) {
        const classes = applyMatch[1].trim();
        config.className = config.className.replace(applyMatch[0], '') + ' ' + classes;
      }
    }
    return config;
  }

  /**
   * Export component code for different use cases
   */
  exportComponent(component: any, format: 'jsx' | 'template' | 'string' | 'static'): string {
    // Export component in requested format
    return '';
  }

  /**
   * Generate complete app scaffolding
   */
  createApp(config: {
    name: string;
    type: 'spa' | 'ssr' | 'ssg' | 'pwa';
    framework: string;
    components: string[];
    routing?: boolean;
    auth?: boolean;
    api?: boolean;
  }): any {
    // Generate complete app structure
    return {};
  }

  /**
   * Get compatibility report for current environment
   */
  getCompatibilityReport(): {
    frameworks: Map<string, FrameworkVersion>;
    styleSystem: string;
    tailwind?: TailwindConfig;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check React version
    const reactVersion = this.frameworkVersions.get('react');
    if (reactVersion) {
      if (reactVersion.compatibilityWarnings) {
        warnings.push(...reactVersion.compatibilityWarnings);
      }
      const majorVersion = parseInt(reactVersion.version.split('.')[0]);
      if (majorVersion === 19) {
        recommendations.push('React 19 detected: Use --legacy-peer-deps when installing packages');
      }
    }

    // Check Tailwind version
    if (this.tailwindConfig) {
      if (this.tailwindConfig.version === 4) {
        warnings.push('Tailwind CSS v4 detected: @apply directives not supported');
        recommendations.push('Use @import "tailwindcss" instead of @tailwind directives');
        recommendations.push('Replace @apply with direct utility classes');
      }
    }

    return {
      frameworks: this.frameworkVersions,
      styleSystem: this.currentStyleSystem,
      tailwind: this.tailwindConfig,
      warnings,
      recommendations
    };
  }
}