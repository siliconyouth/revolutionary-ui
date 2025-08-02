/**
 * FactoryRegistry stub for testing
 * This is a simplified version for npm testing without TypeScript compilation
 */

class FactoryRegistry {
  static instance = null;

  constructor() {
    this.factories = new Map();
    this.frameworkFactories = new Map();
  }

  static getInstance() {
    if (!FactoryRegistry.instance) {
      FactoryRegistry.instance = new FactoryRegistry();
    }
    return FactoryRegistry.instance;
  }

  register(id, framework, factory) {
    const key = `${framework}:${id}`;
    this.factories.set(key, factory);
    
    if (!this.frameworkFactories.has(framework)) {
      this.frameworkFactories.set(framework, new Set());
    }
    this.frameworkFactories.get(framework).add(id);
  }

  get(id, framework) {
    const key = `${framework}:${id}`;
    return this.factories.get(key);
  }

  getAll(framework) {
    const factoryIds = this.frameworkFactories.get(framework) || new Set();
    return Array.from(factoryIds).map(id => this.get(id, framework));
  }

  getStats() {
    const frameworks = Array.from(this.frameworkFactories.keys());
    const totalFactories = this.factories.size;
    
    const byFramework = {};
    for (const [fw, ids] of this.frameworkFactories) {
      byFramework[fw] = ids.size;
    }
    
    return {
      totalFactories,
      frameworks,
      byFramework
    };
  }

  clear() {
    this.factories.clear();
    this.frameworkFactories.clear();
  }
}

module.exports = { FactoryRegistry };