/**
 * @revolutionary-ui/factory-system
 * ReactFactory - React framework adapter for the Revolutionary UI Factory System
 * 
 * This adapter enables the Revolutionary Factory System to work seamlessly
 * with React applications, providing 60-80% code reduction.
 */

import React, { ComponentType, ReactNode, useMemo, useCallback } from 'react';
import { BaseFactory, FactoryOptions, BaseComponentProps } from '../../core/BaseFactory';
import { clsx } from 'clsx';

// =============================================================================
// React-Specific Types
// =============================================================================

export interface ReactComponentProps extends BaseComponentProps {
  children?: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
  onSubmit?: (event: React.FormEvent) => void;
}

export interface ReactFactoryConfig {
  component: string;
  props: ReactComponentProps;
  variants?: Record<string, Record<string, any>>;
  slots?: Record<string, ReactNode>;
  hooks?: {
    useState?: boolean;
    useEffect?: boolean;
    useMemo?: boolean;
    useCallback?: boolean;
  };
}

export interface DataTableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableConfig<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
}

export interface FormField {
  id: string;
  name: string; 
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: (value: any) => string | undefined;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  resetLabel?: string;
  validation?: (values: Record<string, any>) => Record<string, string>;
}

// =============================================================================
// React Factory Implementation
// =============================================================================

/**
 * React Factory - Revolutionary UI Factory for React applications
 * 
 * This factory provides React-specific component generation with built-in
 * optimizations, accessibility, and performance enhancements.
 */
export class ReactFactory extends BaseFactory<ComponentType<any>, ReactComponentProps> {
  
  constructor(id: string = 'react-factory', options: FactoryOptions = {}) {
    super(id, 'react', {
      accessibility: true,
      responsive: true,
      performance: 'optimized',
      ...options
    });
  }

  /**
   * Initialize React-specific resources
   */
  async initializeFramework(): Promise<void> {
    // React doesn't require special initialization
    // But we can set up global configuration here
    if (this.options.devMode) {
      console.log('🚀 React Factory initialized with Revolutionary UI patterns');
    }
  }

  /**
   * Cleanup React-specific resources
   */
  cleanupFramework(): void {
    // React cleanup is handled by React itself
    if (this.options.devMode) {
      console.log('🧹 React Factory cleaned up');
    }
  }

  /**
   * Create a React component based on configuration
   */
  createComponent(type: string, config: ReactFactoryConfig): ComponentType<any> {
    switch (type) {
      case 'data-table':
        return this.createDataTable(config as any);
      case 'form':
        return this.createForm(config as any);
      case 'button':
        return this.createButton(config);
      case 'card':
        return this.createCard(config);
      case 'layout':
        return this.createLayout(config);
      default:
        return this.createGenericComponent(config);
    }
  }

  /**
   * Render a component with given props
   */
  renderComponent(Component: ComponentType<any>, props: ReactComponentProps): ReactNode {
    return React.createElement(Component, props);
  }

  /**
   * Get React component wrapper
   */
  getComponentWrapper(): ComponentType<any> {
    return ({ children }: { children: ReactNode }) => React.createElement('div', null, children);
  }

  // =============================================================================
  // Revolutionary Component Generators
  // =============================================================================

  /**
   * Create a revolutionary data table with 70%+ code reduction
   */
  createDataTable<T>(config: DataTableConfig<T>): ComponentType<{ className?: string }> {
    return ({ className }) => {
      const [sortColumn, setSortColumn] = React.useState<string | null>(null);
      const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
      const [searchTerm, setSearchTerm] = React.useState('');
      const [currentPage, setCurrentPage] = React.useState(1);
      const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

      // Memoized filtered and sorted data
      const processedData = useMemo(() => {
        let data = [...config.data];

        // Apply search filter
        if (config.searchable && searchTerm) {
          data = data.filter(row =>
            Object.values(row as any).some(value =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        }

        // Apply sorting
        if (sortColumn) {
          data.sort((a, b) => {
            const aValue = (a as any)[sortColumn];
            const bValue = (b as any)[sortColumn];
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return data;
      }, [config.data, searchTerm, sortColumn, sortDirection]);

      // Pagination
      const pageSize = config.pageSize || 10;
      const totalPages = Math.ceil(processedData.length / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedData = config.pagination 
        ? processedData.slice(startIndex, startIndex + pageSize)
        : processedData;

      const handleSort = useCallback((column: string) => {
        if (sortColumn === column) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
          setSortColumn(column);
          setSortDirection('asc');
        }
      }, [sortColumn]);

      return (
        <div className={clsx('revolutionary-data-table', className)}>
          {/* Search */}
          {config.searchable && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {config.selectable && (
                    <th className="border border-gray-300 px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(new Set(paginatedData.map((_, index) => startIndex + index)));
                          } else {
                            setSelectedRows(new Set());
                          }
                        }}
                      />
                    </th>
                  )}
                  {config.columns.map((column) => (
                    <th
                      key={column.id}
                      className={clsx(
                        'border border-gray-300 px-4 py-2 text-left font-medium',
                        { 'cursor-pointer hover:bg-gray-100': config.sortable && column.sortable }
                      )}
                      onClick={() => config.sortable && column.sortable && handleSort(column.id)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {config.sortable && column.sortable && sortColumn === column.id && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {config.selectable && (
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(startIndex + rowIndex)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedRows);
                            if (e.target.checked) {
                              newSelected.add(startIndex + rowIndex);
                            } else {
                              newSelected.delete(startIndex + rowIndex);
                            }
                            setSelectedRows(newSelected);
                          }}
                        />
                      </td>
                    )}
                    {config.columns.map((column) => (
                      <td
                        key={column.id}
                        className="border border-gray-300 px-4 py-2"
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.accessorKey 
                          ? String((row as any)[column.accessorKey])
                          : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {config.pagination && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };
  }

  /**
   * Create a revolutionary form with validation and 65%+ code reduction
   */
  createForm(config: FormConfig): ComponentType<{ className?: string }> {
    return ({ className }) => {
      const [values, setValues] = React.useState<Record<string, any>>({});
      const [errors, setErrors] = React.useState<Record<string, string>>({});
      const [isSubmitting, setIsSubmitting] = React.useState(false);

      const handleChange = useCallback((name: string, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }, [errors]);

      const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};

        // Field-level validation
        config.fields.forEach(field => {
          const value = values[field.name];
          
          if (field.required && (!value || value === '')) {
            newErrors[field.name] = `${field.label} is required`;
          }

          if (field.validation && value) {
            const error = field.validation(value);
            if (error) {
              newErrors[field.name] = error;
            }
          }
        });

        // Form-level validation
        if (config.validation) {
          const formErrors = config.validation(values);
          Object.assign(newErrors, formErrors);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      }, [values, config.fields, config.validation]);

      const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsSubmitting(true);
        try {
          await config.onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }, [values, validate, config.onSubmit]);

      return (
        <form onSubmit={handleSubmit} className={clsx('revolutionary-form space-y-4', className)}>
          {config.fields.map(field => (
            <div key={field.id} className="space-y-1">
              <label htmlFor={field.id} className="block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors[field.name] && 'border-red-500'
                  )}
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.id}
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors[field.name] && 'border-red-500'
                  )}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={field.id}
                    name={field.name}
                    checked={values[field.name] || false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{field.placeholder}</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors[field.name] && 'border-red-500'
                  )}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : (config.submitLabel || 'Submit')}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setValues({});
                setErrors({});
              }}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {config.resetLabel || 'Reset'}
            </button>
          </div>
        </form>
      );
    };
  }

  /**
   * Create a simple button component
   */
  private createButton(config: ReactFactoryConfig): ComponentType<any> {
    return ({ children, className, ...props }) => (
      <button
        className={clsx(
          'px-4 py-2 rounded-md font-medium transition-colors',
          'bg-blue-600 text-white hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  /**
   * Create a simple card component
   */
  private createCard(config: ReactFactoryConfig): ComponentType<any> {
    return ({ children, className, title, ...props }) => (
      <div
        className={clsx(
          'bg-white rounded-lg border shadow-sm',
          className
        )}
        {...props}
      >
        {title && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    );
  }

  /**
   * Create a layout component
   */
  private createLayout(config: ReactFactoryConfig): ComponentType<any> {
    return ({ children, className, sidebar, header, ...props }) => (
      <div className={clsx('min-h-screen bg-gray-50', className)} {...props}>
        {header && (
          <header className="bg-white border-b px-6 py-4">
            {header}
          </header>
        )}
        <div className="flex">
          {sidebar && (
            <aside className="w-64 bg-white border-r min-h-screen p-6">
              {sidebar}
            </aside>
          )}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  /**
   * Create a generic component
   */
  private createGenericComponent(config: ReactFactoryConfig): ComponentType<any> {
    return ({ children, className, ...props }) => (
      <div className={clsx('revolutionary-component', className)} {...props}>
        {children}
      </div>
    );
  }
}

// =============================================================================
// React Hooks for Factory Usage
// =============================================================================

/**
 * Hook to use the React Factory
 */
export function useReactFactory(options?: FactoryOptions): ReactFactory {
  return useMemo(() => {
    const factory = new ReactFactory('react-hook-factory', options);
    factory.initialize();
    return factory;
  }, [options]);
}

/**
 * Hook to create and cache components
 */
export function useFactoryComponent<T = any>(
  factory: ReactFactory,
  type: string,
  config: any,
  deps: React.DependencyList = []
): ComponentType<T> {
  return useMemo(() => {
    return factory.generate(type, config);
  }, [factory, type, config, ...deps]);
}

// =============================================================================
// Revolutionary Component Creators
// =============================================================================

/**
 * Create a revolutionary data table with minimal code
 */
export function createRevolutionaryDataTable<T>(config: DataTableConfig<T>) {
  const factory = new ReactFactory();
  return factory.createDataTable(config);
}

/**
 * Create a revolutionary form with minimal code
 */
export function createRevolutionaryForm(config: FormConfig) {
  const factory = new ReactFactory();
  return factory.createForm(config);
}