/**
 * Validation utilities for Revolutionary UI Factory
 */

/**
 * Validates that a UI factory object has all methods properly defined
 * This helps prevent syntax errors in mock implementations
 */
export function validateUIFactory(factory: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!factory || typeof factory !== 'object') {
    errors.push('Factory must be an object');
    return { valid: false, errors };
  }
  
  // Check for common method names that should exist
  const expectedMethods = [
    'createLayout',
    'createNavbar',
    'createSidebar',
    'createContainer',
    'createGrid',
    'createForm',
    'createDataTable',
    'createCard',
    'createButton',
    'createModal'
  ];
  
  // Validate each method
  for (const methodName of expectedMethods) {
    if (!(methodName in factory)) {
      errors.push(`Missing method: ${methodName}`);
    } else if (typeof factory[methodName] !== 'function') {
      errors.push(`${methodName} must be a function`);
    }
  }
  
  // Check for methods that might be accidentally outside the object
  const allKeys = Object.keys(factory);
  const createMethods = allKeys.filter(key => key.startsWith('create'));
  
  if (createMethods.length === 0) {
    errors.push('No create* methods found - they might be outside the object');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates a validated UI factory mock
 * This ensures all methods are properly inside the object
 */
export function createValidatedMock(methods: Record<string, Function>): any {
  const validation = validateUIFactory(methods);
  
  if (!validation.valid) {
    console.warn('UI Factory validation failed:', validation.errors);
  }
  
  // Return a proxy that warns about undefined methods
  return new Proxy(methods, {
    get(target, prop: string) {
      if (prop.startsWith('create') && !(prop in target)) {
        console.error(`Method ${prop} not found in UI factory. It might be outside the object.`);
        return () => {
          throw new Error(`${prop} is not defined. Check if it's properly inside the UI object.`);
        };
      }
      return target[prop];
    }
  });
}

/**
 * TypeScript helper to ensure all methods are defined
 */
export type UIFactoryMethods = {
  // Layout
  createLayout: (config: any) => any;
  createContainer: (config: any) => any;
  createGrid: (config: any) => any;
  createStack: (config: any) => any;
  createSidebar: (config: any) => any;
  
  // Navigation
  createNavbar: (config: any) => any;
  createMenu: (config: any) => any;
  createTabs: (config: any) => any;
  createBreadcrumb: (config: any) => any;
  
  // Data Display
  createDataTable: (config: any) => any;
  createCard: (config: any) => any;
  createAccordion: (config: any) => any;
  createList: (config: any) => any;
  
  // Forms
  createForm: (config: any) => any;
  createInput: (config: any) => any;
  createSelect: (config: any) => any;
  createButton: (config: any) => any;
  
  // Feedback
  createModal: (config: any) => any;
  createToast: (config: any) => any;
  createAlert: (config: any) => any;
  
  // Documentation specific
  createTableOfContents?: (config: any) => any;
  createPageHeader?: (config: any) => any;
  createSection?: (config: any) => any;
  createCodeBlock?: (config: any) => any;
  
  // Allow additional methods
  [key: string]: ((config: any) => any) | undefined;
};

/**
 * Helper to create a type-safe mock
 */
export function createTypeSafeMock(implementation: Partial<UIFactoryMethods>): UIFactoryMethods {
  const defaultImpl = (name: string) => (config: any) => {
    console.warn(`${name} not implemented in mock`);
    return null;
  };
  
  // Create with all required methods
  const mock: UIFactoryMethods = {
    // Layout
    createLayout: implementation.createLayout || defaultImpl('createLayout'),
    createContainer: implementation.createContainer || defaultImpl('createContainer'),
    createGrid: implementation.createGrid || defaultImpl('createGrid'),
    createStack: implementation.createStack || defaultImpl('createStack'),
    createSidebar: implementation.createSidebar || defaultImpl('createSidebar'),
    
    // Navigation
    createNavbar: implementation.createNavbar || defaultImpl('createNavbar'),
    createMenu: implementation.createMenu || defaultImpl('createMenu'),
    createTabs: implementation.createTabs || defaultImpl('createTabs'),
    createBreadcrumb: implementation.createBreadcrumb || defaultImpl('createBreadcrumb'),
    
    // Data Display
    createDataTable: implementation.createDataTable || defaultImpl('createDataTable'),
    createCard: implementation.createCard || defaultImpl('createCard'),
    createAccordion: implementation.createAccordion || defaultImpl('createAccordion'),
    createList: implementation.createList || defaultImpl('createList'),
    
    // Forms
    createForm: implementation.createForm || defaultImpl('createForm'),
    createInput: implementation.createInput || defaultImpl('createInput'),
    createSelect: implementation.createSelect || defaultImpl('createSelect'),
    createButton: implementation.createButton || defaultImpl('createButton'),
    
    // Feedback
    createModal: implementation.createModal || defaultImpl('createModal'),
    createToast: implementation.createToast || defaultImpl('createToast'),
    createAlert: implementation.createAlert || defaultImpl('createAlert'),
    
    // Optional methods
    ...implementation
  };
  
  return mock;
}