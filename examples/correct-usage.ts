/**
 * Correct Usage Examples for Revolutionary UI Factory
 * This shows how to properly use the factory to avoid syntax errors
 */

import { setup, createFactory } from '@vladimirdukelic/revolutionary-ui-factory';

// ========== CORRECT: Using the setup function ==========
// This automatically binds all methods correctly
export const ui = setup('react', 'tailwind');

// Now all methods are available directly on ui object:
const navbar = ui.createNavbar({ /* config */ });
const sidebar = ui.createSidebar({ /* config */ });
const tableOfContents = ui.createTableOfContents({ /* config */ });

// ========== CORRECT: Using factory instance ==========
// This ensures all methods are properly part of the factory
const factory = createFactory('react');
const dashboard = factory.createDashboard({ /* config */ });

// ========== INCORRECT: Manual mock (error-prone) ==========
// DON'T DO THIS - it can lead to syntax errors like missing commas
/*
export const ui = {
  createNavbar: () => { ... },
  createSidebar: () => { ... }
  // Missing comma above causes syntax error!
  createTableOfContents: () => { ... }
}
*/

// ========== CORRECT: If you must create a mock ==========
// Use proper object syntax with all commas
export const mockUI = {
  createNavbar: (config: any) => { /* implementation */ },
  createSidebar: (config: any) => { /* implementation */ }, // <-- Note the comma
  createTableOfContents: (config: any) => { /* implementation */ },
  createPageHeader: (config: any) => { /* implementation */ }
  // All methods inside the object with proper commas
};

// ========== BEST PRACTICE: Use the actual package ==========
// For production websites, always use the real package:
import * as RevolutionaryUI from '@vladimirdukelic/revolutionary-ui-factory';

// This gives you all the benefits:
// - Type safety
// - No syntax errors
// - Automatic updates
// - Full functionality
export const productionUI = RevolutionaryUI.setup();

// ========== For development without the package ==========
// If developing without the npm package installed,
// use the factory pattern correctly:

class MockFactory {
  createNavbar(config: any) { return () => null; }
  createSidebar(config: any) { return () => null; }
  createTableOfContents(config: any) { return () => null; }
  // Methods as class methods, no syntax issues
}

export const devUI = new MockFactory();

// ========== Example: Complete mock implementation ==========
// This shows the correct structure to avoid errors

interface UIFactory {
  [key: string]: (config: any) => any;
}

export const correctMockUI: UIFactory = {
  // All methods must be inside the object
  // with proper comma separation
  createLayout: (config: any) => { /* impl */ },
  createNavbar: (config: any) => { /* impl */ },
  createSidebar: (config: any) => { /* impl */ },
  createTableOfContents: (config: any) => { /* impl */ },
  createPageHeader: (config: any) => { /* impl */ },
  createSection: (config: any) => { /* impl */ },
  // ... more methods
};

// ========== TypeScript Best Practice ==========
// Define the interface to catch errors at compile time

interface RevolutionaryUIInterface {
  createLayout: (config: any) => any;
  createNavbar: (config: any) => any;
  createSidebar: (config: any) => any;
  createTableOfContents: (config: any) => any;
  createPageHeader: (config: any) => any;
  // ... all other methods
}

// TypeScript will catch missing commas or syntax errors
export const typeSafeUI: RevolutionaryUIInterface = {
  createLayout: (config) => null,
  createNavbar: (config) => null,
  createSidebar: (config) => null,
  createTableOfContents: (config) => null,
  createPageHeader: (config) => null,
};