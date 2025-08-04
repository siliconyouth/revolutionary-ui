import { BaseFactory } from './base-factory'

export class FactoryRegistry {
  private static instance: FactoryRegistry
  private factories: Map<string, typeof BaseFactory>

  private constructor() {
    this.factories = new Map()
    this.registerDefaultFactories()
  }

  static getInstance(): FactoryRegistry {
    if (!FactoryRegistry.instance) {
      FactoryRegistry.instance = new FactoryRegistry()
    }
    return FactoryRegistry.instance
  }

  register(type: string, factory: typeof BaseFactory): void {
    this.factories.set(type.toLowerCase(), factory)
  }

  getFactory(type: string): BaseFactory | null {
    const FactoryClass = this.factories.get(type.toLowerCase())
    if (!FactoryClass) {
      return null
    }
    return new (FactoryClass as any)()
  }

  listFactories(): string[] {
    return Array.from(this.factories.keys())
  }

  hasFactory(type: string): boolean {
    return this.factories.has(type.toLowerCase())
  }

  private registerDefaultFactories(): void {
    // These would be imported from actual factory implementations
    // For now, we'll just register the names
    const defaultFactories = [
      'form',
      'table',
      'dashboard',
      'chart',
      'card',
      'navigation',
      'modal',
      'landing',
      'game-ui',
      'pricing',
      'auth',
      'admin-panel',
      'analytics',
      'calendar',
      'kanban',
      'timeline',
      'wizard',
      'gallery',
      'carousel',
      'accordion'
    ]

    // In a real implementation, each would map to an actual factory class
    defaultFactories.forEach(type => {
      // this.register(type, require(`../factories/${type}-factory`).default)
    })
  }
}