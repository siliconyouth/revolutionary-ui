export interface FactoryConfig {
  name: string
  framework: string
  typescript?: boolean
  styleSystem?: string
  [key: string]: any
}

export interface FactoryMetrics {
  traditionalLines: number
  factoryLines: number
  reductionPercentage: number
  timeSaved: number
}

export abstract class BaseFactory {
  protected config: FactoryConfig | null = null
  protected metrics: FactoryMetrics = {
    traditionalLines: 0,
    factoryLines: 0,
    reductionPercentage: 0,
    timeSaved: 0
  }

  abstract get name(): string
  abstract get description(): string
  abstract get version(): string

  configure(config: FactoryConfig): void {
    this.config = config
    this.validateConfig()
  }

  abstract generate(config?: FactoryConfig): string

  getMetrics(): FactoryMetrics {
    return this.metrics
  }

  protected validateConfig(): void {
    if (!this.config) {
      throw new Error('Configuration is required')
    }

    if (!this.config.name) {
      throw new Error('Component name is required')
    }

    if (!this.config.framework) {
      throw new Error('Framework is required')
    }
  }

  protected calculateMetrics(generatedCode: string): void {
    // Calculate lines of generated code
    this.metrics.factoryLines = generatedCode.split('\n').length

    // Estimate traditional lines (this would be more sophisticated in reality)
    this.metrics.traditionalLines = Math.floor(this.metrics.factoryLines * 3.5)

    // Calculate reduction percentage
    this.metrics.reductionPercentage = Math.round(
      ((this.metrics.traditionalLines - this.metrics.factoryLines) / this.metrics.traditionalLines) * 100
    )

    // Estimate time saved (minutes)
    this.metrics.timeSaved = Math.round(this.metrics.traditionalLines * 0.5)
  }
}