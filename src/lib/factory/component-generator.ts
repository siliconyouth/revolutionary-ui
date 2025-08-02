/**
 * Component Generator for Revolutionary UI Factory
 * Generates framework-specific components with massive code reduction
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import chalk from 'chalk'

export interface ComponentOptions {
  name: string
  type: ComponentType
  framework?: Framework
  styling?: StylingSystem
  typescript?: boolean
  outputDir?: string
  props?: Record<string, any>
  features?: string[]
}

export type ComponentType = 
  | 'button' | 'form' | 'table' | 'card' | 'modal'
  | 'dashboard' | 'kanban' | 'calendar' | 'chart'
  | 'list' | 'grid' | 'tabs' | 'accordion' | 'menu'
  | 'navbar' | 'sidebar' | 'footer' | 'hero' | 'pricing'

export type Framework = 
  | 'react' | 'vue' | 'angular' | 'svelte' | 'solid'
  | 'preact' | 'alpine' | 'lit' | 'qwik' | 'astro'

export type StylingSystem = 
  | 'tailwind' | 'css-modules' | 'styled-components' 
  | 'emotion' | 'css' | 'scss' | 'sass'

export class ComponentGenerator {
  private templates: Map<string, ComponentTemplate> = new Map()
  
  constructor() {
    this.initializeTemplates()
  }
  
  /**
   * Generate a component based on options
   */
  async generate(options: ComponentOptions): Promise<GenerationResult> {
    // Validate options
    const validation = this.validateOptions(options)
    if (!validation.valid) {
      throw new Error(`Invalid options: ${validation.errors.join(', ')}`)
    }
    
    // Get template
    const templateKey = `${options.framework}-${options.type}`
    const template = this.templates.get(templateKey) || this.templates.get(`generic-${options.type}`)
    
    if (!template) {
      throw new Error(`No template found for ${options.type} component`)
    }
    
    // Generate component code
    const code = await this.generateCode(template, options)
    
    // Generate additional files (styles, tests, etc.)
    const files: GeneratedFile[] = [
      {
        filename: this.getFilename(options),
        content: code.component,
        type: 'component'
      }
    ]
    
    if (code.styles) {
      files.push({
        filename: this.getStyleFilename(options),
        content: code.styles,
        type: 'styles'
      })
    }
    
    if (code.test) {
      files.push({
        filename: this.getTestFilename(options),
        content: code.test,
        type: 'test'
      })
    }
    
    if (code.story) {
      files.push({
        filename: this.getStoryFilename(options),
        content: code.story,
        type: 'story'
      })
    }
    
    // Calculate metrics
    const metrics = this.calculateMetrics(code.component, options.type)
    
    return {
      files,
      metrics,
      preview: code.component.substring(0, 500) + '...',
      instructions: this.getUsageInstructions(options)
    }
  }
  
  /**
   * Save generated files to disk
   */
  async saveFiles(result: GenerationResult, baseDir: string): Promise<void> {
    for (const file of result.files) {
      const filePath = path.join(baseDir, file.filename)
      const dir = path.dirname(filePath)
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true })
      
      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8')
      
      console.log(chalk.green(`✅ Created ${file.filename}`))
    }
  }
  
  /**
   * Initialize component templates
   */
  private initializeTemplates() {
    // React templates
    this.templates.set('react-button', {
      generate: (opts) => this.generateReactButton(opts)
    })
    
    this.templates.set('react-form', {
      generate: (opts) => this.generateReactForm(opts)
    })
    
    this.templates.set('react-table', {
      generate: (opts) => this.generateReactTable(opts)
    })
    
    this.templates.set('react-dashboard', {
      generate: (opts) => this.generateReactDashboard(opts)
    })
    
    // Vue templates
    this.templates.set('vue-button', {
      generate: (opts) => this.generateVueButton(opts)
    })
    
    this.templates.set('vue-form', {
      generate: (opts) => this.generateVueForm(opts)
    })
    
    // Add more framework-specific templates...
    
    // Generic templates (framework-agnostic)
    this.templates.set('generic-button', {
      generate: (opts) => this.generateGenericButton(opts)
    })
  }
  
  /**
   * Generate code using template
   */
  private async generateCode(template: ComponentTemplate, options: ComponentOptions): Promise<GeneratedCode> {
    return await template.generate(options)
  }
  
  /**
   * React Button Generator
   */
  private async generateReactButton(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript, styling, props = {} } = options
    const ext = typescript ? 'tsx' : 'jsx'
    
    let imports = `import React from 'react';\n`
    let styles = ''
    let componentCode = ''
    
    if (styling === 'tailwind') {
      componentCode = `
${typescript ? `interface ${name}Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}` : ''}

export const ${name}${typescript ? ': React.FC<' + name + 'Props>' : ''} = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabledClasses} \${className}\`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};`
    } else if (styling === 'styled-components') {
      imports += `import styled from 'styled-components';\n`
      
      componentCode = `
const StyledButton = styled.button<{ $variant: string; $size: string }>\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
  
  \${props => props.$variant === 'primary' && \`
    background-color: #2563eb;
    color: white;
    &:hover { background-color: #1d4ed8; }
  \`}
  
  \${props => props.$variant === 'secondary' && \`
    background-color: #e5e7eb;
    color: #111827;
    &:hover { background-color: #d1d5db; }
  \`}
  
  \${props => props.$size === 'sm' && \`
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  \`}
  
  \${props => props.$size === 'md' && \`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  \`}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
\`;

export const ${name} = ({ variant = 'primary', size = 'md', ...props }) => {
  return <StyledButton $variant={variant} $size={size} {...props} />;
};`
    }
    
    const component = imports + componentCode
    
    // Generate test
    const test = `
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders children correctly', () => {
    render(<${name}>Click me</${name}>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<${name} onClick={handleClick}>Click me</${name}>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<${name} disabled>Click me</${name}>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});`
    
    // Generate Storybook story
    const story = `
import React from 'react';
import { ${name} } from './${name}';

export default {
  title: 'Components/${name}',
  component: ${name},
};

export const Primary = () => <${name} variant="primary">Primary Button</${name}>;
export const Secondary = () => <${name} variant="secondary">Secondary Button</${name}>;
export const Danger = () => <${name} variant="danger">Danger Button</${name}>;

export const Sizes = () => (
  <div className="space-x-4">
    <${name} size="sm">Small</${name}>
    <${name} size="md">Medium</${name}>
    <${name} size="lg">Large</${name}>
  </div>
);

export const Loading = () => <${name} loading>Loading...</${name}>;
export const Disabled = () => <${name} disabled>Disabled</${name}>;`
    
    return { component, styles, test, story }
  }
  
  /**
   * React Form Generator
   */
  private async generateReactForm(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript, styling, props = {} } = options
    
    let imports = `import React, { useState } from 'react';\n`
    
    if (typescript) {
      imports += `
interface ${name}Data {
  name: string;
  email: string;
  message: string;
}

interface ${name}Props {
  onSubmit: (data: ${name}Data) => void;
  className?: string;
}`
    }
    
    const component = `${imports}

export const ${name}${typescript ? ': React.FC<' + name + 'Props>' : ''} = ({ onSubmit, className = '' }) => {
  const [formData, setFormData] = useState${typescript ? '<' + name + 'Data>' : ''}({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState${typescript ? '<Partial<' + name + 'Data>>' : ''}({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e${typescript ? ': React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>' : ''}) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors${typescript ? ': Partial<' + name + 'Data>' : ''} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e${typescript ? ': React.FormEvent' : ''}) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={\`space-y-4 \${className}\`}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 \${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }\`}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 \${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }\`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 \${
            errors.message ? 'border-red-500' : 'border-gray-300'
          }\`}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};`
    
    return { component }
  }
  
  /**
   * React Table Generator
   */
  private async generateReactTable(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript, features = [] } = options
    
    const hasSort = features.includes('sort')
    const hasFilter = features.includes('filter')
    const hasPagination = features.includes('pagination')
    const hasSelection = features.includes('selection')
    
    let imports = `import React, { useState, useMemo } from 'react';\n`
    
    if (typescript) {
      imports += `
interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface ${name}Props<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: T[]) => void;
  className?: string;
}`
    }
    
    const component = `${imports}

export const ${name} = ${typescript ? '<T extends Record<string, any>>' : ''}({ 
  data, 
  columns, 
  onRowClick, 
  onSelectionChange,
  className = '' 
}${typescript ? ': ' + name + 'Props<T>' : ''}) => {
  const [sortKey, setSortKey] = useState${typescript ? '<keyof T | null>' : ''}(null);
  const [sortOrder, setSortOrder] = useState${typescript ? '<"asc" | "desc">' : ''}('asc');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState${typescript ? '<T[]>' : ''}([]);
  
  const itemsPerPage = 10;
  
  // Filtering
  const filteredData = useMemo(() => {
    if (!filterValue) return data;
    
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }, [data, filterValue]);
  
  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);
  
  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);
  
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  const handleSort = (key${typescript ? ': keyof T' : ''}) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData);
    }
    onSelectionChange?.(selectedRows);
  };
  
  const handleSelectRow = (row${typescript ? ': T' : ''}) => {
    const isSelected = selectedRows.some(r => r === row);
    const newSelected = isSelected 
      ? selectedRows.filter(r => r !== row)
      : [...selectedRows, row];
    
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };
  
  return (
    <div className={\`\${className}\`}>
      ${hasFilter ? `<div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>` : ''}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              ${hasSelection ? `<th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>` : ''}
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className={\`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider \${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }\`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortKey === column.key && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={\`\${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}\`}
              >
                ${hasSelection ? `<td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRow(row);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>` : ''}
                {columns.map(column => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      ${hasPagination ? `<div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>` : ''}
    </div>
  );
};`
    
    return { component }
  }
  
  /**
   * React Dashboard Generator
   */
  private async generateReactDashboard(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript } = options
    
    const component = `import React from 'react';

${typescript ? `interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface ${name}Props {
  stats: StatCard[];
  className?: string;
}` : ''}

export const ${name}${typescript ? ': React.FC<' + name + 'Props>' : ''} = ({ stats, className = '' }) => {
  return (
    <div className={\`\${className}\`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.change !== undefined && (
                  <p className={\`text-sm mt-2 \${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </p>
                )}
              </div>
              {stat.icon && (
                <div className="text-gray-400">{stat.icon}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Activity items would go here */}
            <p className="text-gray-500">No recent activity</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create New
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              View Reports
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};`
    
    return { component }
  }
  
  /**
   * Vue Button Generator
   */
  private async generateVueButton(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript } = options
    
    const component = `<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script${typescript ? ' lang="ts"' : ''}>
${typescript ? `import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: '${name}',` : `export default {
  name: '${name}',`}
  props: {
    variant: {
      type: String${typescript ? ' as PropType<"primary" | "secondary" | "danger">' : ''},
      default: 'primary',
      validator: (value${typescript ? ': string' : ''}) => ['primary', 'secondary', 'danger'].includes(value)
    },
    size: {
      type: String${typescript ? ' as PropType<"sm" | "md" | "lg">' : ''},
      default: 'md',
      validator: (value${typescript ? ': string' : ''}) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
      
      const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      };
      
      const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      };
      
      const disabled = this.disabled || this.loading ? 'opacity-50 cursor-not-allowed' : '';
      
      return \`\${base} \${variants[this.variant]} \${sizes[this.size]} \${disabled}\`;
    }
  }
}${typescript ? ')' : ''};
</script>`
    
    return { component }
  }
  
  /**
   * Vue Form Generator
   */
  private async generateVueForm(options: ComponentOptions): Promise<GeneratedCode> {
    const { name, typescript } = options
    
    const component = `<template>
  <form @submit.prevent="handleSubmit" :class="className">
    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          :class="inputClasses(errors.name)"
          :disabled="isSubmitting"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>
      
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          :class="inputClasses(errors.email)"
          :disabled="isSubmitting"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>
      
      <div>
        <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          v-model="formData.message"
          rows="4"
          :class="inputClasses(errors.message)"
          :disabled="isSubmitting"
        />
        <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
      </div>
      
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </div>
  </form>
</template>

<script${typescript ? ' lang="ts"' : ''}>
${typescript ? `import { defineComponent, reactive, ref } from 'vue';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default defineComponent({
  name: '${name}',` : `import { reactive, ref } from 'vue';

export default {
  name: '${name}',`}
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const formData = reactive${typescript ? '<FormData>' : ''}({
      name: '',
      email: '',
      message: ''
    });
    
    const errors = reactive${typescript ? '<Partial<FormData>>' : ''}({});
    const isSubmitting = ref(false);
    
    const inputClasses = (error${typescript ? '?: string' : ''}) => {
      const base = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
      return \`\${base} \${error ? 'border-red-500' : 'border-gray-300'}\`;
    };
    
    const validate = () => {
      const newErrors${typescript ? ': Partial<FormData>' : ''} = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.message.trim()) {
        newErrors.message = 'Message is required';
      }
      
      Object.assign(errors, newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async () => {
      if (!validate()) return;
      
      isSubmitting.value = true;
      try {
        await emit('submit', { ...formData });
        // Reset form
        Object.assign(formData, { name: '', email: '', message: '' });
        Object.keys(errors).forEach(key => delete errors[key]);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        isSubmitting.value = false;
      }
    };
    
    return {
      formData,
      errors,
      isSubmitting,
      inputClasses,
      handleSubmit
    };
  }
}${typescript ? ')' : ''};
</script>`
    
    return { component }
  }
  
  /**
   * Generic Button Generator
   */
  private async generateGenericButton(options: ComponentOptions): Promise<GeneratedCode> {
    const { framework = 'react' } = options
    
    // For unknown frameworks, generate React by default
    return this.generateReactButton(options)
  }
  
  /**
   * Validate component options
   */
  private validateOptions(options: ComponentOptions): ValidationResult {
    const errors: string[] = []
    
    if (!options.name) {
      errors.push('Component name is required')
    }
    
    if (!options.type) {
      errors.push('Component type is required')
    }
    
    if (options.name && !/^[A-Z][a-zA-Z0-9]*$/.test(options.name)) {
      errors.push('Component name must start with capital letter and contain only letters and numbers')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Get filename for component
   */
  private getFilename(options: ComponentOptions): string {
    const { name, framework = 'react', typescript } = options
    const ext = this.getExtension(framework, typescript)
    return `${name}.${ext}`
  }
  
  /**
   * Get style filename
   */
  private getStyleFilename(options: ComponentOptions): string {
    const { name, styling = 'css' } = options
    const ext = styling === 'scss' || styling === 'sass' ? styling : 'css'
    return `${name}.${ext}`
  }
  
  /**
   * Get test filename
   */
  private getTestFilename(options: ComponentOptions): string {
    const { name, framework = 'react', typescript } = options
    const ext = typescript ? 'test.ts' : 'test.js'
    return `${name}.${ext}`
  }
  
  /**
   * Get story filename
   */
  private getStoryFilename(options: ComponentOptions): string {
    const { name, framework = 'react', typescript } = options
    const ext = typescript ? 'stories.tsx' : 'stories.jsx'
    return `${name}.${ext}`
  }
  
  /**
   * Get file extension based on framework and typescript
   */
  private getExtension(framework: Framework, typescript?: boolean): string {
    const extensions: Record<Framework, { ts: string; js: string }> = {
      react: { ts: 'tsx', js: 'jsx' },
      vue: { ts: 'vue', js: 'vue' },
      angular: { ts: 'ts', js: 'js' },
      svelte: { ts: 'svelte', js: 'svelte' },
      solid: { ts: 'tsx', js: 'jsx' },
      preact: { ts: 'tsx', js: 'jsx' },
      alpine: { ts: 'ts', js: 'js' },
      lit: { ts: 'ts', js: 'js' },
      qwik: { ts: 'tsx', js: 'jsx' },
      astro: { ts: 'astro', js: 'astro' }
    }
    
    const ext = extensions[framework] || { ts: 'ts', js: 'js' }
    return typescript ? ext.ts : ext.js
  }
  
  /**
   * Calculate code reduction metrics
   */
  private calculateMetrics(code: string, type: ComponentType): ComponentMetrics {
    const lines = code.split('\n').length
    
    // Estimated traditional lines based on component type
    const traditionalLines: Record<ComponentType, number> = {
      button: 150,
      form: 400,
      table: 800,
      card: 200,
      modal: 300,
      dashboard: 1000,
      kanban: 600,
      calendar: 800,
      chart: 500,
      list: 300,
      grid: 400,
      tabs: 250,
      accordion: 300,
      menu: 350,
      navbar: 400,
      sidebar: 450,
      footer: 200,
      hero: 300,
      pricing: 500
    }
    
    const traditional = traditionalLines[type] || 300
    const reduction = Math.round((1 - lines / traditional) * 100)
    
    return {
      linesGenerated: lines,
      linesTraditional: traditional,
      codeReduction: `${reduction}%`,
      timesSaved: `${Math.round(traditional / lines)}x faster`
    }
  }
  
  /**
   * Get usage instructions
   */
  private getUsageInstructions(options: ComponentOptions): string[] {
    const { name, framework = 'react' } = options
    
    const instructions: string[] = []
    
    if (framework === 'react') {
      instructions.push(`Import: import { ${name} } from './components/${name}'`)
      instructions.push(`Usage: <${name} />`)
    } else if (framework === 'vue') {
      instructions.push(`Import in script: import ${name} from './components/${name}.vue'`)
      instructions.push(`Register: components: { ${name} }`)
      instructions.push(`Usage: <${name} />`)
    }
    
    instructions.push(`Documentation: See ${name}.stories.js for examples`)
    instructions.push(`Tests: Run 'npm test ${name}.test.js'`)
    
    return instructions
  }
}

// Types
interface ComponentTemplate {
  generate: (options: ComponentOptions) => Promise<GeneratedCode>
}

interface GeneratedCode {
  component: string
  styles?: string
  test?: string
  story?: string
}

interface GeneratedFile {
  filename: string
  content: string
  type: 'component' | 'styles' | 'test' | 'story'
}

interface GenerationResult {
  files: GeneratedFile[]
  metrics: ComponentMetrics
  preview: string
  instructions: string[]
}

interface ComponentMetrics {
  linesGenerated: number
  linesTraditional: number
  codeReduction: string
  timesSaved: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}