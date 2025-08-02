import { ComponentNode, ExportOptions } from './types';
import { ComponentExporter as BaseExporter } from './exporter';

export class ComponentExporter {
  /**
   * Export components to code
   */
  exportToCode(components: ComponentNode[], options: ExportOptions): string {
    if (options.format === 'factory') {
      return BaseExporter.exportToFactory(components, options);
    } else if (options.format === 'json') {
      return BaseExporter.exportToJSON(components);
    } else {
      return BaseExporter.exportToCode(components, options);
    }
  }

  /**
   * Export a single component
   */
  export(components: ComponentNode[], options: ExportOptions): string {
    return this.exportToCode(components, options);
  }
}