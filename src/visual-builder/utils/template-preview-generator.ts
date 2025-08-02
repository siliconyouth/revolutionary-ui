import React from 'react';
import { ComponentNode } from '../core/types';
import { Template } from '../core/template-library';

/**
 * Generates preview images for templates
 * In production, this would generate actual images using a headless browser
 * For now, it generates CSS-based representations
 */
export class TemplatePreviewGenerator {
  static generatePreviewStyle(template: Template): string {
    const { components } = template;
    if (!components.length) return '';

    // Generate a simple CSS representation based on component types
    const firstComponent = components[0];
    
    switch (template.category) {
      case 'landing':
        return this.generateLandingPreview(firstComponent);
      case 'forms':
        return this.generateFormPreview(firstComponent);
      case 'dashboard':
        return this.generateDashboardPreview(firstComponent);
      case 'navigation':
        return this.generateNavigationPreview(firstComponent);
      default:
        return this.generateDefaultPreview(firstComponent);
    }
  }

  private static generateLandingPreview(component: ComponentNode): string {
    return `
      background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
  }

  private static generateFormPreview(component: ComponentNode): string {
    return `
      background: white;
      display: flex;
      flex-direction: column;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    `;
  }

  private static generateDashboardPreview(component: ComponentNode): string {
    return `
      background: #f9fafb;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 10px;
    `;
  }

  private static generateNavigationPreview(component: ComponentNode): string {
    return `
      background: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      border-bottom: 1px solid #e5e7eb;
    `;
  }

  private static generateDefaultPreview(component: ComponentNode): string {
    return `
      background: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
  }

  /**
   * Generate miniature component representations
   */
  static generateMiniComponents(components: ComponentNode[]): React.ReactElement[] {
    return components.slice(0, 5).map((component, index) => {
      const opacity = 1 - (index * 0.15);
      
      switch (component.type) {
        case 'heading':
          return React.createElement('div', {
            key: index,
            style: {
              height: '6px',
              backgroundColor: '#374151',
              borderRadius: '2px',
              marginBottom: '4px',
              width: component.props.level === 1 ? '80%' : '60%',
              opacity
            }
          });
          
        case 'text':
          return React.createElement('div', {
            key: index,
            style: {
              height: '4px',
              backgroundColor: '#9ca3af',
              borderRadius: '2px',
              marginBottom: '3px',
              width: '100%',
              opacity
            }
          });
          
        case 'button':
          return React.createElement('div', {
            key: index,
            style: {
              height: '12px',
              width: '40px',
              backgroundColor: component.props.variant === 'primary' ? '#7c3aed' : '#e5e7eb',
              borderRadius: '4px',
              marginTop: '4px',
              opacity
            }
          });
          
        case 'card':
          return React.createElement('div', {
            key: index,
            style: {
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: 'white',
              opacity
            }
          });
          
        case 'input':
          return React.createElement('div', {
            key: index,
            style: {
              height: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
              backgroundColor: 'white',
              marginBottom: '3px',
              opacity
            }
          });
          
        case 'grid':
          return React.createElement('div', {
            key: index,
            style: {
              display: 'grid',
              gridTemplateColumns: `repeat(${component.props.columns || 3}, 1fr)`,
              gap: '3px',
              opacity
            },
            children: Array(component.props.columns || 3).fill(null).map((_, i) => React.createElement('div', {
              key: i,
              style: {
                height: '15px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px'
              }
            }))
          });
          
        case 'badge':
          return React.createElement('div', {
            key: index,
            style: {
              display: 'inline-block',
              height: '6px',
              width: '25px',
              backgroundColor: component.props.backgroundColor || '#ddd6fe',
              borderRadius: '3px',
              marginBottom: '3px',
              opacity
            }
          });
          
        case 'container':
          return React.createElement('div', {
            key: index,
            style: {
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '4px',
              marginBottom: '3px',
              opacity
            }
          });
          
        default:
          return React.createElement('div', {
            key: index,
            style: {
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              marginBottom: '3px',
              opacity
            }
          });
      }
    });
  }

  /**
   * Generate preview data URL (placeholder implementation)
   * In production, this would use a service to generate actual images
   */
  static async generatePreviewImage(template: Template): Promise<string> {
    // Placeholder implementation
    // In production, this would:
    // 1. Render the template components to a canvas
    // 2. Export as PNG/JPEG
    // 3. Return data URL or upload to storage
    
    const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='system-ui' font-size='16'%3E${template.name}%3C/text%3E%3C/svg%3E`;
    
    return placeholder;
  }
}