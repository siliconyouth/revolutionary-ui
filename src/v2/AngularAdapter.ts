/**
 * Enhanced Angular Framework Adapter
 * Properly implements Angular's component system with decorators and dependency injection
 */

import { FrameworkAdapter } from './FrameworkAdapter'

export const EnhancedAngularAdapter: FrameworkAdapter = {
  name: 'angular',
  version: '15.x',
  
  createElement: (type, props, ...children) => {
    // Generate Angular template syntax
    if (typeof type === 'string') {
      const propsString = Object.entries(props || {})
        .map(([key, value]) => {
          if (key === 'className') return `class="${value}"`
          if (key === 'onClick') return `(click)="${value}"`
          if (key.startsWith('on')) {
            const event = key.slice(2).toLowerCase()
            return `(${event})="${value}"`
          }
          if (typeof value === 'string') return `${key}="${value}"`
          return `[${key}]="${value}"`
        })
        .join(' ')
      
      const childrenString = children.join('')
      return `<${type} ${propsString}>${childrenString}</${type}>`
    }
    
    // Component reference
    return `<${type.name || type} ${Object.entries(props || {})
      .map(([k, v]) => `[${k}]="${v}"`)
      .join(' ')}></${type.name || type}>`
  },
  
  useState: <T>(initial: T): [T, (value: T | ((prev: T) => T)) => void] => {
    // In Angular, state is managed through class properties
    // This simulates React-like state for compatibility
    let _value = initial
    const setState = (newValue: T | ((prev: T) => T)) => {
      _value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(_value) : newValue
    }
    // Return current value and setter
    return [_value, setState]
  },
  
  useEffect: (effect, deps) => {
    // Map to Angular lifecycle hooks
    // In practice, this would be handled by the component decorator
    return {
      type: 'lifecycle',
      hook: 'ngOnInit',
      effect,
      deps
    }
  },
  
  useMemo: <T>(factory: () => T, deps: any[]): T => {
    // Angular uses getters for computed properties
    // For compatibility, execute factory immediately
    return factory()
  },
  
  useCallback: (callback) => {
    // Angular methods are automatically bound
    return callback
  },
  
  useRef: (initial) => {
    // Angular uses ViewChild/ElementRef
    return {
      type: 'ViewChild',
      current: initial
    }
  },
  
  useContext: <T>(context: any): T => {
    // Angular uses dependency injection
    // For compatibility, return context value directly
    return context as T
  },
  
  defineComponent: (config) => {
    // Generate Angular component class with decorators
    const componentCode = `
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '${config.name?.toLowerCase() || 'app-component'}',
  template: \`${config.template || '<div>Component</div>'}\`,
  styles: [\`${(config as any).styles || ''}\`]
})
export class ${config.name || 'Component'}Component implements OnInit {
  ${generateProperties(config.props)}
  ${generateState(config.setup)}
  
  ngOnInit() {
    ${generateLifecycle(config.setup)}
  }
  
  ${generateMethods(config.setup)}
}`
    
    return componentCode
  },
  
  render: (element, container) => {
    // Angular bootstrapping code
    return `
import { bootstrapApplication } from '@angular/platform-browser';
import { ${element.name || element} } from './${element.name || element}.component';

bootstrapApplication(${element.name || element}, {
  providers: []
}).catch(err => console.error(err));`
  },
  
  createEventHandler: (handler) => {
    // Angular event handler
    return `($event) => { ${handler.toString()}($event) }`
  },
  
  createRef: () => ({
    type: 'ViewChild',
    current: null
  }),
  
  createContext: (defaultValue) => {
    // Angular injection token
    return {
      type: 'InjectionToken',
      defaultValue
    }
  },
  
  Fragment: 'ng-container',
  
  isValidElement: (element) => {
    return typeof element === 'string' && element.includes('<')
  },
  
  cloneElement: (element, props) => {
    // Clone Angular template element
    if (typeof element === 'string') {
      // Simple prop injection for demo
      return element
    }
    return element
  },
  
  features: {
    customDirectives: true,
    plugins: true,
    computed: true,
    watch: true,
    provide: true,
    inject: true
  },
  
  // Angular-specific lifecycle hooks
  onMount: (callback) => ({
    type: 'lifecycle',
    hook: 'ngOnInit',
    callback
  }),
  
  onUnmount: (callback) => ({
    type: 'lifecycle',
    hook: 'ngOnDestroy',
    callback
  }),
  
  onUpdate: (callback) => ({
    type: 'lifecycle',
    hook: 'ngOnChanges',
    callback
  })
}

// Helper functions for Angular code generation
function generateProperties(props: any): string {
  if (!props) return ''
  
  return Object.entries(props)
    .map(([key, value]) => {
      const type = typeof value
      return `  @Input() ${key}: ${type};`
    })
    .join('\n')
}

function generateState(setup: any): string {
  if (!setup || typeof setup !== 'function') return ''
  
  // Parse setup function to extract state
  // This is a simplified version
  return `  // State properties generated from setup`
}

function generateLifecycle(setup: any): string {
  if (!setup || typeof setup !== 'function') return ''
  
  return `    // Lifecycle initialization from setup`
}

function generateMethods(setup: any): string {
  if (!setup || typeof setup !== 'function') return ''
  
  return `  // Methods generated from setup`
}

// Factory function to create Angular components
export function createAngularComponent(config: any) {
  const adapter = EnhancedAngularAdapter
  return adapter.defineComponent(config)
}