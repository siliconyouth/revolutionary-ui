import { BaseFactory, FactoryConfig } from '../core/base-factory'

export class ComponentFactory extends BaseFactory {
  get name(): string {
    return 'Component Factory'
  }

  get description(): string {
    return 'Base factory for generating UI components'
  }

  get version(): string {
    return '1.0.0'
  }

  generate(config?: FactoryConfig): string {
    const finalConfig = config || this.config
    if (!finalConfig) {
      throw new Error('Configuration is required')
    }

    // This is a simplified example - real implementation would be much more sophisticated
    const code = this.generateReactComponent(finalConfig)
    
    this.calculateMetrics(code)
    
    return code
  }

  private generateReactComponent(config: FactoryConfig): string {
    const { name, typescript = true } = config
    
    if (typescript) {
      return `import React from 'react'

interface ${name}Props {
  // Add props here
}

export const ${name}: React.FC<${name}Props> = (props) => {
  return (
    <div className="${this.camelToKebab(name)}">
      {/* Component content */}
    </div>
  )
}

export default ${name}`
    } else {
      return `import React from 'react'

export const ${name} = (props) => {
  return (
    <div className="${this.camelToKebab(name)}">
      {/* Component content */}
    </div>
  )
}

export default ${name}`
    }
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}