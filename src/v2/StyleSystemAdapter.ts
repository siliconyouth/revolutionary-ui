/**
 * Style System Adapter
 * Allows different CSS approaches to work with Revolutionary UI Factory
 */

export interface StyleSystemAdapter {
  name: string;
  
  // Generate styles for a component
  generateStyles(component: string, config: any, theme?: any): {
    className?: string;
    style?: Record<string, any>;
    css?: string;
  };
  
  // Extract critical CSS
  extractCSS(): string;
  
  // Theme management
  createTheme(theme: any): any;
  useTheme(theme: any): void;
  
  // Responsive utilities
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  
  // Media query helper
  media(breakpoint: string, styles: any): any;
  
  // Animation utilities
  keyframes(name: string, frames: any): string;
  
  // CSS variables
  cssVar(name: string, value?: any): string;
  
  // Utility class generation
  generateUtilities?(config: any): Record<string, any>;
}

// CSS-in-JS Adapter (Emotion/Styled Components style)
export const CSSinJSAdapter: StyleSystemAdapter = {
  name: 'css-in-js',
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  generateStyles(component, config, theme) {
    const styles: Record<string, any> = {};
    
    // Base styles
    switch (component) {
      case 'Button':
        styles.base = {
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          outline: 'none',
          position: 'relative',
          overflow: 'hidden',
        };
        
        // Variant styles
        const variants: Record<string, any> = {
          primary: {
            backgroundColor: theme?.colors?.primary || '#0969da',
            color: 'white',
            '&:hover': {
              backgroundColor: theme?.colors?.primaryDark || '#0860ca',
            },
          },
          secondary: {
            backgroundColor: theme?.colors?.secondary || '#e1e4e8',
            color: theme?.colors?.text || '#24292e',
            '&:hover': {
              backgroundColor: theme?.colors?.secondaryDark || '#d1d4d8',
            },
          },
          danger: {
            backgroundColor: theme?.colors?.danger || '#d73a49',
            color: 'white',
            '&:hover': {
              backgroundColor: theme?.colors?.dangerDark || '#cb2431',
            },
          },
        };
        
        // Size styles
        const sizes: Record<string, any> = {
          xs: { padding: '4px 8px', fontSize: '12px' },
          sm: { padding: '6px 12px', fontSize: '13px' },
          md: { padding: '8px 16px', fontSize: '14px' },
          lg: { padding: '10px 20px', fontSize: '16px' },
          xl: { padding: '12px 24px', fontSize: '18px' },
        };
        
        Object.assign(styles, styles.base, variants[config.variant], sizes[config.size]);
        break;
        
      case 'DataTable':
        styles.container = {
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        };
        styles.table = {
          width: '100%',
          borderCollapse: 'collapse',
        };
        styles.th = {
          padding: '12px',
          textAlign: 'left',
          fontWeight: 600,
          backgroundColor: '#f6f8fa',
          borderBottom: '1px solid #e1e4e8',
        };
        styles.td = {
          padding: '12px',
          borderBottom: '1px solid #e1e4e8',
        };
        break;
        
      // Add more component styles...
    }
    
    return { style: styles };
  },
  
  extractCSS() {
    // Extract critical CSS for SSR
    return '';
  },
  
  createTheme(theme) {
    return {
      colors: {
        primary: '#0969da',
        secondary: '#e1e4e8',
        success: '#28a745',
        danger: '#d73a49',
        warning: '#ffd33d',
        info: '#0969da',
        ...theme.colors,
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        ...theme.spacing,
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          xs: '12px',
          sm: '14px',
          md: '16px',
          lg: '18px',
          xl: '20px',
          ...theme.typography?.fontSize,
        },
        ...theme.typography,
      },
      ...theme,
    };
  },
  
  useTheme(theme) {
    // Apply theme
  },
  
  media(breakpoint, styles) {
    return {
      [`@media (min-width: ${this.breakpoints[breakpoint]})`]: styles,
    };
  },
  
  keyframes(name, frames) {
    const keyframeRules = Object.entries(frames)
      .map(([key, value]) => `${key} { ${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('; ')} }`)
      .join(' ');
    return `@keyframes ${name} { ${keyframeRules} }`;
  },
  
  cssVar(name, value) {
    if (value !== undefined) {
      return `var(--${name}, ${value})`;
    }
    return `var(--${name})`;
  },
};

// Tailwind CSS Adapter
export const TailwindAdapter: StyleSystemAdapter = {
  name: 'tailwind',
  
  breakpoints: {
    mobile: 'sm',
    tablet: 'md',
    desktop: 'lg',
    wide: 'xl',
  },
  
  generateStyles(component: string, config: any, theme?: any): { className?: string; style?: Record<string, any>; css?: string; } {
    const classes: string[] = [];
    
    switch (component) {
      case 'Button':
        // Base classes
        classes.push('inline-flex', 'items-center', 'justify-center', 'font-medium', 
                    'rounded', 'transition-colors', 'focus:outline-none', 'focus:ring-2');
        
        // Variant classes
        const variantClasses: Record<string, string[]> = {
          primary: ['bg-blue-600', 'text-white', 'hover:bg-blue-700', 'focus:ring-blue-500'],
          secondary: ['bg-gray-200', 'text-gray-900', 'hover:bg-gray-300', 'focus:ring-gray-500'],
          danger: ['bg-red-600', 'text-white', 'hover:bg-red-700', 'focus:ring-red-500'],
          success: ['bg-green-600', 'text-white', 'hover:bg-green-700', 'focus:ring-green-500'],
        };
        
        // Size classes
        const sizeClasses: Record<string, string[]> = {
          xs: ['px-2', 'py-1', 'text-xs'],
          sm: ['px-3', 'py-1.5', 'text-sm'],
          md: ['px-4', 'py-2', 'text-base'],
          lg: ['px-5', 'py-2.5', 'text-lg'],
          xl: ['px-6', 'py-3', 'text-xl'],
        };
        
        classes.push(...(variantClasses[config.variant] || variantClasses.primary));
        classes.push(...(sizeClasses[config.size] || sizeClasses.md));
        
        if (config.fullWidth) classes.push('w-full');
        if (config.disabled) classes.push('opacity-50', 'cursor-not-allowed');
        break;
        
      case 'DataTable':
        // For DataTable, return a className string instead of object
        return {
          className: 'w-full bg-white rounded-lg shadow overflow-hidden',
          style: {
            // Can include inline styles if needed
          }
        };
        
      // Add more component mappings...
    }
    
    return { className: classes.join(' ') };
  },
  
  extractCSS() {
    // Tailwind handles this via PostCSS
    return '';
  },
  
  createTheme(theme) {
    // Tailwind config
    return theme;
  },
  
  useTheme(theme) {
    // Apply via tailwind.config.js
  },
  
  media(breakpoint, styles) {
    // Tailwind uses responsive prefixes
    return Object.entries(styles).reduce((acc, [key, value]) => {
      acc[`${breakpoint}:${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
  },
  
  keyframes(name, frames) {
    // Define in tailwind.config.js
    return name;
  },
  
  cssVar(name, value) {
    // CSS variables in Tailwind
    return `var(--${name}${value ? `, ${value}` : ''})`;
  },
  
  generateUtilities(config) {
    // Generate Tailwind utility classes
    return {
      '.btn': {
        '@apply': 'inline-flex items-center justify-center font-medium rounded transition-colors',
      },
      // More utilities...
    };
  },
};

// CSS Modules Adapter
export const CSSModulesAdapter: StyleSystemAdapter = {
  name: 'css-modules',
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  generateStyles(component, config) {
    // CSS Modules class names
    const moduleClasses: Record<string, string> = {
      button: 'button',
      [`button--${config.variant}`]: config.variant,
      [`button--${config.size}`]: config.size,
      'button--full': config.fullWidth,
      'button--disabled': config.disabled,
    };
    
    return {
      className: Object.entries(moduleClasses)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(' '),
    };
  },
  
  extractCSS() {
    // Handled by build tool
    return '';
  },
  
  createTheme(theme) {
    return theme;
  },
  
  useTheme(theme) {
    // CSS variables or theme file
  },
  
  media(breakpoint, styles) {
    return `@media (min-width: ${this.breakpoints[breakpoint]}) { ${styles} }`;
  },
  
  keyframes(name, frames) {
    return `@keyframes ${name} { ${frames} }`;
  },
  
  cssVar(name, value) {
    return `var(--${name}${value ? `, ${value}` : ''})`;
  },
};

// Vanilla CSS Adapter
export const VanillaCSSAdapter: StyleSystemAdapter = {
  name: 'vanilla-css',
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  generateStyles(component, config) {
    const classes = [
      `rf-${component.toLowerCase()}`,
      config.variant && `rf-${component.toLowerCase()}--${config.variant}`,
      config.size && `rf-${component.toLowerCase()}--${config.size}`,
      config.className,
    ].filter(Boolean).join(' ');
    
    return { className: classes };
  },
  
  extractCSS() {
    // Return global CSS
    return `
      .rf-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .rf-button--primary {
        background-color: #0969da;
        color: white;
      }
      
      .rf-button--primary:hover {
        background-color: #0860ca;
      }
      
      /* More styles... */
    `;
  },
  
  createTheme(theme) {
    // Generate CSS variables
    const cssVars: string[] = [];
    
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        cssVars.push(`--color-${key}: ${value};`);
      });
    }
    
    return `:root { ${cssVars.join(' ')} }`;
  },
  
  useTheme(theme) {
    // Inject theme CSS
  },
  
  media(breakpoint, styles) {
    return `@media (min-width: ${this.breakpoints[breakpoint]}) { ${styles} }`;
  },
  
  keyframes(name, frames) {
    const rules = Object.entries(frames)
      .map(([key, value]) => `${key} { ${value} }`)
      .join(' ');
    return `@keyframes ${name} { ${rules} }`;
  },
  
  cssVar(name, value) {
    return `var(--${name}${value ? `, ${value}` : ''})`;
  },
};

// Custom Style System Creator
export const createCustomStyleAdapter = (config: {
  name: string;
  implementation: Partial<StyleSystemAdapter>;
}): StyleSystemAdapter => {
  const defaultAdapter: StyleSystemAdapter = {
    name: config.name,
    breakpoints: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px',
    },
    generateStyles: () => ({ className: '', style: {} }),
    extractCSS: () => '',
    createTheme: (theme) => theme,
    useTheme: () => {},
    media: () => '',
    keyframes: () => '',
    cssVar: (name) => `var(--${name})`,
  };
  
  return { ...defaultAdapter, ...config.implementation };
};

// Style system detection
export const detectStyleSystem = (): string => {
  if (typeof window !== 'undefined') {
    // Check for Tailwind
    if (document.querySelector('[class*="bg-"]') || 
        document.querySelector('[class*="text-"]')) {
      return 'tailwind';
    }
    
    // Check for CSS modules
    if (document.querySelector('[class*="_"]')) {
      return 'css-modules';
    }
  }
  
  // Default to CSS-in-JS
  return 'css-in-js';
};