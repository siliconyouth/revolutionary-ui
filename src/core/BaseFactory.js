/**
 * BaseFactory stub for testing
 * This is a simplified version for npm testing without TypeScript compilation
 */

class BaseFactory {
  constructor(id, framework) {
    this.id = id;
    this.framework = framework;
    this.initialized = false;
    this.cache = new Map();
    this.metrics = {
      componentsGenerated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      generationTime: 0
    };
  }

  initialize() {
    if (!this.initialized) {
      this.initializeFramework();
      this.initialized = true;
    }
  }

  cleanup() {
    if (this.initialized) {
      this.cleanupFramework();
      this.cache.clear();
      this.initialized = false;
    }
  }

  generate(type, config, cacheKey) {
    const startTime = Date.now();
    
    if (cacheKey && this.cache.has(cacheKey)) {
      this.metrics.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    this.metrics.cacheMisses++;
    const component = this.createComponent(type, config);
    this.metrics.componentsGenerated++;
    
    if (cacheKey) {
      this.cache.set(cacheKey, component);
    }
    
    this.metrics.generationTime += Date.now() - startTime;
    return component;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      averageGenerationTime: this.metrics.componentsGenerated > 0 
        ? this.metrics.generationTime / this.metrics.componentsGenerated 
        : 0
    };
  }

  // Abstract methods - must be implemented by subclasses
  initializeFramework() {
    throw new Error('initializeFramework must be implemented');
  }

  cleanupFramework() {
    throw new Error('cleanupFramework must be implemented');
  }

  createComponent(type, config) {
    throw new Error('createComponent must be implemented');
  }

  renderComponent(component, props) {
    throw new Error('renderComponent must be implemented');
  }

  getComponentWrapper() {
    throw new Error('getComponentWrapper must be implemented');
  }
}

module.exports = { BaseFactory };