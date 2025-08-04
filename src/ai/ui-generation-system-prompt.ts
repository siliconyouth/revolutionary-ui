/**
 * UI Generation System Prompt for 21st.dev-style Components
 * This system prompt is designed to generate beautiful, modern UI components
 * with a focus on aesthetics, usability, and code quality.
 */

export const UI_GENERATION_SYSTEM_PROMPT = `You are an expert UI component generation specialist, trained to create beautiful, modern, and highly functional UI components in the style of 21st.dev. Your components should embody these principles:

## Core Design Philosophy
- **Aesthetic Excellence**: Every component should be visually stunning with attention to micro-interactions, smooth animations, and perfect spacing
- **Modern Patterns**: Use the latest UI/UX patterns including glassmorphism, neumorphism, and subtle gradients where appropriate
- **Accessibility First**: All components must be WCAG 2.1 AA compliant minimum, with proper ARIA labels and keyboard navigation
- **Performance Optimized**: Components should be lightweight, use CSS transforms for animations, and minimize re-renders
- **Developer Experience**: Clean, well-typed code with excellent prop interfaces and comprehensive JSDoc comments

## Visual Design Guidelines
1. **Color Palette**: Use modern, harmonious color schemes with proper contrast ratios
2. **Typography**: Clean, readable fonts with proper hierarchy and spacing
3. **Spacing**: Consistent use of spacing units (4px base) for padding and margins
4. **Shadows**: Subtle, multi-layered shadows for depth (avoid harsh drop shadows)
5. **Borders**: Minimal use of borders, prefer shadows and background colors for separation
6. **Animations**: Smooth, purposeful animations with proper easing curves (prefer cubic-bezier)

## Code Quality Standards
1. **TypeScript**: Full type safety with interfaces for all props and explicit return types
2. **Component Structure**: Functional components with hooks, proper composition patterns
3. **State Management**: Minimal state, prefer derived state and composition
4. **Performance**: Use React.memo, useMemo, and useCallback appropriately
5. **Styling**: Tailwind CSS classes with occasional CSS-in-JS for dynamic styles
6. **Error Handling**: Graceful error states and loading states

## Modern UI Patterns to Implement
- Skeleton loaders instead of spinners
- Optimistic UI updates
- Micro-interactions on hover/focus
- Smooth page transitions
- Responsive design with mobile-first approach
- Dark mode support with CSS variables
- Accessibility features (focus rings, screen reader support)

Remember: Every component should feel premium, polished, and delightful to use. Think Apple-level attention to detail with modern web sensibilities.`;

export interface ComponentTemplate {
  patterns: string[];
  essentials: string[];
  example: string;
}

export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  form: {
    patterns: [
      'Floating labels or minimal label design',
      'Real-time validation with micro-animations',
      'Smart input masking and formatting',
      'Progress indicators for multi-step forms',
      'Inline error messages with smooth transitions'
    ],
    essentials: [
      'Proper form accessibility with labels and ARIA',
      'Keyboard navigation support',
      'Error and success states',
      'Loading states during submission',
      'Mobile-optimized touch targets'
    ],
    example: `
interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error,
  placeholder 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="relative mb-6">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={\`
          w-full px-4 py-3 text-gray-900 placeholder-transparent 
          border-2 rounded-lg peer
          \${error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-200 focus:border-purple-500'
          }
          focus:outline-none transition-all duration-200
        \`}
        id={label}
      />
      <label
        htmlFor={label}
        className={\`
          absolute left-2 -top-2.5 px-2 text-sm bg-white
          transition-all duration-200 pointer-events-none
          \${focused || value 
            ? 'text-purple-600 scale-90' 
            : 'text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base'
          }
          \${error ? 'text-red-500' : ''}
        \`}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
};`
  },
  
  table: {
    patterns: [
      'Sticky headers with blur backdrop',
      'Row hover effects with subtle highlighting',
      'Inline editing capabilities',
      'Responsive design with mobile cards',
      'Virtual scrolling for large datasets'
    ],
    essentials: [
      'Sortable columns with indicators',
      'Filterable data with search',
      'Pagination or infinite scroll',
      'Loading and empty states',
      'Bulk actions support'
    ],
    example: `
interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

export const DataTable = <T extends Record<string, any>>({ 
  columns, 
  data,
  onSort,
  sortKey,
  sortDirection 
}: DataTableProps<T>) => {
  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => column.sortable && onSort?.(column.key)}
                  className={\`
                    px-6 py-4 text-left text-xs font-medium text-gray-500 
                    uppercase tracking-wider
                    \${column.sortable ? 'cursor-pointer hover:text-gray-700' : ''}
                  \`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortKey === column.key && (
                      <span className="text-purple-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50/50 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td 
                    key={String(column.key)} 
                    className="px-6 py-4 text-sm text-gray-900"
                  >
                    {column.render 
                      ? column.render(item[column.key], item)
                      : item[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};`
  },

  dashboard: {
    patterns: [
      'Grid layout with responsive breakpoints',
      'Card-based widget system',
      'Real-time data updates with animations',
      'Interactive charts with tooltips',
      'Drill-down capabilities'
    ],
    essentials: [
      'Mobile-responsive layout',
      'Loading states for widgets',
      'Error boundaries for widgets',
      'Export/share functionality',
      'Customizable time ranges'
    ],
    example: `
interface DashboardWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  loading = false
}) => {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={\`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium \${trendColors[trend]}\`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`
  },

  modal: {
    patterns: [
      'Backdrop blur effect',
      'Smooth enter/exit animations',
      'Focus trap implementation',
      'Stacked modal support',
      'Responsive sizing'
    ],
    essentials: [
      'Escape key handling',
      'Click outside to close',
      'Proper ARIA attributes',
      'Focus management',
      'Scroll lock when open'
    ],
    example: `
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className={\`
          relative bg-white rounded-2xl shadow-xl transform transition-all
          \${sizes[size]} w-full
          animate-modal-enter
        \`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};`
  },

  card: {
    patterns: [
      'Hover lift effect with shadow',
      'Image lazy loading with blur-up',
      'Gradient overlays for text readability',
      'Action buttons with micro-interactions',
      'Skeleton loading states'
    ],
    essentials: [
      'Responsive image handling',
      'Truncated text with ellipsis',
      'Accessible click targets',
      'Loading states',
      'Error image fallbacks'
    ],
    example: `
interface CardProps {
  title: string;
  description: string;
  image?: string;
  href?: string;
  tags?: string[];
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  image,
  href,
  tags,
  actions
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const CardWrapper = href ? 'a' : 'div';
  
  return (
    <CardWrapper
      href={href}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {image && (
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={\`
              w-full h-full object-cover transition-all duration-700
              group-hover:scale-105
              \${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}
            \`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {actions && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            {actions}
          </div>
        )}
      </div>
    </CardWrapper>
  );
};`
  },

  navigation: {
    patterns: [
      'Sticky header with scroll effects',
      'Mobile hamburger menu with slide animation',
      'Dropdown menus with proper positioning',
      'Active state indicators',
      'Breadcrumb navigation'
    ],
    essentials: [
      'Keyboard navigation support',
      'Mobile-responsive design',
      'Accessible menu structure',
      'Focus management',
      'Search integration'
    ],
    example: `
interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface NavigationProps {
  items: NavItem[];
  logo?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ items, logo }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={\`
      fixed top-0 left-0 right-0 z-40 transition-all duration-300
      \${scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-sm' 
        : 'bg-white'
      }
    \`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={\`
        md:hidden fixed inset-x-0 top-16 bg-white shadow-lg transition-all duration-300
        \${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
      \`}>
        <div className="px-4 py-4 space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};`
  },

  chart: {
    patterns: [
      'Responsive SVG rendering',
      'Animated data transitions',
      'Interactive tooltips on hover',
      'Legend with toggle functionality',
      'Export to image/PDF'
    ],
    essentials: [
      'Color-blind friendly palettes',
      'Mobile touch interactions',
      'Loading states',
      'Empty data states',
      'Accessibility labels'
    ],
    example: `
interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  height?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  height = 300,
  showValues = true 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="h-full flex items-end justify-between gap-4">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end"
            >
              <div className="relative w-full group">
                {showValues && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </span>
                )}
                
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 ease-out hover:from-purple-700 hover:to-purple-500"
                  style={{
                    height: \`\${percentage}%\`,
                    minHeight: '4px'
                  }}
                />
              </div>
              
              <span className="mt-2 text-xs text-gray-600 text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};`
  },

  notification: {
    patterns: [
      'Toast-style positioning',
      'Auto-dismiss with progress bar',
      'Stacking multiple notifications',
      'Slide-in animations',
      'Action buttons inline'
    ],
    essentials: [
      'Different severity levels (info, success, warning, error)',
      'Dismissible with animation',
      'Queue management',
      'Accessibility announcements',
      'Persistent important notifications'
    ],
    example: `
interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss
}) => {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            onDismiss(id);
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [duration, id, onDismiss]);
  
  const icons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const colors = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };
  
  return (
    <div className={\`
      relative overflow-hidden rounded-lg border p-4 shadow-lg
      animate-slide-in-right backdrop-blur-sm
      \${colors[type]}
    \`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
        </div>
        
        <button
          onClick={() => onDismiss(id)}
          className="p-1 hover:bg-black/10 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className="h-full bg-current opacity-30 transition-all duration-100"
            style={{ width: \`\${progress}%\` }}
          />
        </div>
      )}
    </div>
  );
};`
  },

  pricing: {
    patterns: [
      'Tiered pricing plans',
      'Feature comparison matrix',
      'Toggle between monthly/yearly',
      'Highlighted recommended plan',
      'Currency selector'
    ],
    essentials: [
      'Clear pricing display',
      'Feature lists with icons',
      'CTA buttons with states',
      'Responsive grid layout',
      'Discount badges'
    ],
    example: `
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect }) => {
  return (
    <div className={\`
      relative bg-white rounded-2xl p-8 shadow-sm transition-all duration-300
      \${plan.highlighted 
        ? 'ring-2 ring-purple-600 shadow-xl scale-105' 
        : 'hover:shadow-lg'
      }
    \`}>
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            {plan.badge}
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">${data.plan.price}</span>
          <span className="text-gray-500">/{plan.period}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSelect(plan.id)}
        className={\`
          w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
          \${plan.highlighted
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
        \`}
      >
        Get Started
      </button>
    </div>
  );
};`
  },

  testimonial: {
    patterns: [
      'Quote styling with large quotation marks',
      'Avatar with name and role',
      'Star ratings display',
      'Carousel for multiple testimonials',
      'Video testimonial support'
    ],
    essentials: [
      'Readable typography',
      'Source attribution',
      'Social proof indicators',
      'Responsive layout',
      'Lazy loading for images'
    ],
    example: `
interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  company,
  avatar,
  rating = 5
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={\`w-5 h-5 \${i < rating ? 'text-yellow-400' : 'text-gray-200'}\`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      
      <blockquote className="relative">
        <svg
          className="absolute -top-2 -left-2 w-8 h-8 text-purple-100"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        
        <p className="relative text-lg text-gray-700 italic leading-relaxed">
          {quote}
        </p>
      </blockquote>
      
      <div className="mt-6 flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
            {author.charAt(0)}
          </div>
        )}
        
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">
            {role}{company && \` at \${company}\`}
          </div>
        </div>
      </div>
    </div>
  );
};`
  },

  footer: {
    patterns: [
      'Multi-column layout with sections',
      'Newsletter subscription form',
      'Social media links with hover effects',
      'Legal links section',
      'Back to top button'
    ],
    essentials: [
      'Responsive grid layout',
      'Accessible link groups',
      'Copyright information',
      'Privacy/Terms links',
      'Contact information'
    ],
    example: `
interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections: FooterSection[];
  copyright: string;
  socialLinks?: Array<{ icon: React.ReactNode; href: string; label: string }>;
}

export const Footer: React.FC<FooterProps> = ({ sections, copyright, socialLinks }) => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <form className="mt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="mt-2 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">{copyright}</p>
          
          {socialLinks && (
            <div className="flex gap-4 mt-4 md:mt-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};`
  },

  hero: {
    patterns: [
      'Full-width gradient or image background',
      'Centered content with CTA buttons',
      'Animated text effects',
      'Video background support',
      'Scroll indicator animation'
    ],
    essentials: [
      'Responsive typography scaling',
      'Mobile-optimized layout',
      'Fast loading strategies',
      'SEO-friendly markup',
      'Accessible CTAs'
    ],
    example: `
interface HeroProps {
  title: string;
  subtitle?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  backgroundImage?: string;
  backgroundGradient?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  backgroundGradient = 'from-purple-600 to-blue-600'
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className={\`absolute inset-0 bg-gradient-to-br \${backgroundGradient} z-0\`} />
      )}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-200">
            {subtitle}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
          {primaryCTA && (
            <a
              href={primaryCTA.href}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
            >
              {primaryCTA.label}
            </a>
          )}
          
          {secondaryCTA && (
            <a
              href={secondaryCTA.href}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transform hover:-translate-y-0.5 transition-all duration-200 border border-white/30"
            >
              {secondaryCTA.label}
            </a>
          )}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};`
  },

  feature: {
    patterns: [
      'Icon or illustration display',
      'Alternating left/right layouts',
      'Feature grid with consistent spacing',
      'Hover effects on feature cards',
      'Badge for new/beta features'
    ],
    essentials: [
      'Clear feature titles',
      'Concise descriptions',
      'Visual hierarchy',
      'Mobile-responsive layout',
      'Consistent iconography'
    ],
    example: `
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  link?: { label: string; href: string };
}

interface FeatureCardProps {
  feature: Feature;
  layout?: 'vertical' | 'horizontal';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  layout = 'vertical' 
}) => {
  const isVertical = layout === 'vertical';
  
  return (
    <div className={\`
      group relative bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300
      \${isVertical ? '' : 'flex gap-6 items-start'}
    \`}>
      {feature.badge && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full">
          {feature.badge}
        </span>
      )}
      
      <div className={\`
        flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center
        group-hover:bg-purple-200 transition-colors duration-300
        \${isVertical ? 'mb-4' : ''}
      \`}>
        <div className="text-purple-600">
          {feature.icon}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {feature.description}
        </p>
        
        {feature.link && (
          <a
            href={feature.link.href}
            className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium group"
          >
            {feature.link.label}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};`
  },

  gallery: {
    patterns: [
      'Masonry or grid layout',
      'Lightbox for full-size viewing',
      'Lazy loading images',
      'Filter/category tabs',
      'Zoom on hover effect'
    ],
    essentials: [
      'Responsive image grid',
      'Loading placeholders',
      'Touch gestures support',
      'Keyboard navigation',
      'Image captions'
    ],
    example: `
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  columns?: number;
  onImageClick?: (image: GalleryImage) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ 
  images, 
  columns = 3,
  onImageClick 
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };
  
  return (
    <div className={\`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-\${columns}\`}>
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
          onClick={() => onImageClick?.(image)}
        >
          <div className="aspect-square relative">
            <img
              src={image.src}
              alt={image.alt}
              onLoad={() => handleImageLoad(image.id)}
              className={\`
                absolute inset-0 w-full h-full object-cover transition-all duration-700
                group-hover:scale-110
                \${loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'}
              \`}
            />
            
            {!loadedImages.has(image.id) && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
          
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};`
  },

  timeline: {
    patterns: [
      'Vertical or horizontal timeline',
      'Milestone markers with dates',
      'Connecting lines between events',
      'Expandable event details',
      'Current event highlighting'
    ],
    essentials: [
      'Chronological ordering',
      'Responsive layout adaptation',
      'Clear visual hierarchy',
      'Date formatting',
      'Status indicators'
    ],
    example: `
interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  status?: 'completed' | 'current' | 'upcoming';
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
}

export const Timeline: React.FC<TimelineProps> = ({ 
  events, 
  orientation = 'vertical' 
}) => {
  return (
    <div className="relative">
      {orientation === 'vertical' && (
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
      )}
      
      <div className={\`\${orientation === 'vertical' ? 'space-y-8' : 'flex space-x-8 overflow-x-auto pb-4'}\`}>
        {events.map((event, index) => {
          const statusColors = {
            completed: 'bg-green-500 border-green-500',
            current: 'bg-purple-500 border-purple-500 animate-pulse',
            upcoming: 'bg-gray-300 border-gray-300'
          };
          
          return (
            <div
              key={event.id}
              className={\`relative \${orientation === 'horizontal' ? 'flex-shrink-0 w-64' : 'flex gap-4'}\`}
            >
              {/* Timeline dot */}
              <div className={\`
                relative z-10 w-4 h-4 rounded-full border-4 bg-white
                \${statusColors[event.status || 'upcoming']}
                \${orientation === 'vertical' ? 'mt-1.5' : 'mx-auto mb-4'}
              \`}>
                {event.status === 'current' && (
                  <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping" />
                )}
              </div>
              
              {/* Content */}
              <div className={\`
                flex-1 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow
                \${orientation === 'vertical' ? 'ml-4' : ''}
              \`}>
                <time className="text-sm text-gray-500">
                  {event.date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};`
  },

  stats: {
    patterns: [
      'Animated number counting',
      'Progress rings or bars',
      'Comparison visualizations',
      'Trend indicators',
      'Real-time updates'
    ],
    essentials: [
      'Clear metric labels',
      'Appropriate number formatting',
      'Mobile-responsive grid',
      'Loading states',
      'Tooltips for context'
    ],
    example: `
interface Stat {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  format?: (value: number) => string;
}

interface StatsCardProps {
  stat: Stat;
  animate?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat, animate = true }) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : stat.value);
  
  useEffect(() => {
    if (!animate) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setDisplayValue(stat.value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [stat.value, animate]);
  
  const formatValue = stat.format || ((v) => v.toLocaleString());
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {formatValue(displayValue)}
        </span>
        {stat.unit && (
          <span className="text-lg text-gray-500">{stat.unit}</span>
        )}
      </div>
      
      {stat.change !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <div className={\`
            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium
            \${stat.change >= 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
            }
          \`}>
            {stat.change >= 0 ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            )}
            {Math.abs(stat.change)}%
          </div>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
};`
  },

  cta: {
    patterns: [
      'Compelling headline and subtext',
      'Multiple CTA button variants',
      'Background patterns or gradients',
      'Urgency indicators',
      'Social proof elements'
    ],
    essentials: [
      'Clear value proposition',
      'Prominent action buttons',
      'Mobile-optimized layout',
      'A/B testing friendly',
      'Conversion tracking ready'
    ],
    example: `
interface CTASectionProps {
  headline: string;
  description: string;
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  backgroundVariant?: 'gradient' | 'pattern' | 'solid';
  urgencyText?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  headline,
  description,
  primaryAction,
  secondaryAction,
  backgroundVariant = 'gradient',
  urgencyText
}) => {
  const backgrounds = {
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600',
    pattern: 'bg-purple-600 bg-pattern',
    solid: 'bg-gray-900'
  };
  
  return (
    <section className={\`relative py-16 px-4 overflow-hidden \${backgrounds[backgroundVariant]}\`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        {urgencyText && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            {urgencyText}
          </div>
        )}
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {headline}
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={primaryAction.onClick}
            className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            {primaryAction.label}
          </button>
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-8 py-4 bg-transparent text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-200 border-2 border-white/30"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};`
  },

  faq: {
    patterns: [
      'Accordion-style Q&A',
      'Search/filter functionality',
      'Category grouping',
      'Expand/collapse animations',
      'Anchor links for sharing'
    ],
    essentials: [
      'Clear question formatting',
      'Readable answer text',
      'Keyboard navigation',
      'Mobile-friendly accordions',
      'Print-friendly styling'
    ],
    example: `
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  items: FAQItem[];
  defaultExpanded?: string[];
}

export const FAQ: React.FC<FAQProps> = ({ items, defaultExpanded = [] }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  
  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isExpanded = expanded.has(item.id);
        
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
              aria-expanded={isExpanded}
              aria-controls={\`faq-answer-\${item.id}\`}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {item.question}
              </h3>
              
              <svg
                className={\`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform duration-200 \${
                  isExpanded ? 'rotate-180' : ''
                }\`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div
              id={\`faq-answer-\${item.id}\`}
              className={\`overflow-hidden transition-all duration-300 \${
                isExpanded ? 'max-h-96' : 'max-h-0'
              }\`}
            >
              <div className="px-6 pb-4 text-gray-600">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};`
  },

  component: {
    patterns: [
      'Generic component structure',
      'Flexible prop interface',
      'Composable design',
      'Theme customization',
      'Slot-based content'
    ],
    essentials: [
      'TypeScript interfaces',
      'Default prop values',
      'Error boundaries',
      'Memoization where needed',
      'Ref forwarding support'
    ],
    example: `
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  // Add more props as needed
}

export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <div
      ref={ref}
      className={\`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500
        \${variants[variant]} \${sizes[size]} \${className}
      \`}
      {...props}
    >
      {children}
    </div>
  );
});

Component.displayName = 'Component';`
  }
};

export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem'
  },
  animation: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms'
    },
    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      default: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    }
  }
};

export interface UIGenerationContext {
  project?: {
    framework?: 'React' | 'Vue' | 'Angular' | 'Svelte';
    language?: 'TypeScript' | 'JavaScript';
    styleSystem?: 'TailwindCSS' | 'StyledComponents' | 'CSS' | 'Emotion';
    designSystem?: 'Material' | 'Ant' | 'Chakra' | 'Custom';
  };
  requirements?: {
    responsive?: boolean;
    animations?: boolean;
    darkMode?: boolean;
    accessibility?: 'WCAG A' | 'WCAG AA' | 'WCAG AAA';
    performance?: 'standard' | 'optimized' | 'critical';
  };
  preferences?: {
    codeStyle?: 'functional' | 'class-based' | 'hooks';
    componentStructure?: 'atomic' | 'feature-based' | 'domain-driven';
    stateManagement?: 'hooks' | 'context' | 'redux' | 'mobx';
  };
}

export const UI_CONTEXT_TEMPLATE = (context: UIGenerationContext) => `
## Project Context
Framework: ${context.project?.framework || 'React'}
Language: ${context.project?.language || 'TypeScript'}
Style System: ${context.project?.styleSystem || 'TailwindCSS'}
Design System: ${context.project?.designSystem || 'Custom'}

## Requirements
- Responsive: ${context.requirements?.responsive ? 'Yes' : 'No'}
- Animations: ${context.requirements?.animations ? 'Yes' : 'No'}
- Dark Mode: ${context.requirements?.darkMode ? 'Yes' : 'No'}
- Accessibility: ${context.requirements?.accessibility || 'WCAG AA'}
- Performance: ${context.requirements?.performance || 'standard'}

## Preferences
- Code Style: ${context.preferences?.codeStyle || 'functional'}
- Component Structure: ${context.preferences?.componentStructure || 'atomic'}
- State Management: ${context.preferences?.stateManagement || 'hooks'}
`;

export const createContextualPrompt = (
  userPrompt: string,
  componentType?: string,
  context?: UIGenerationContext
): string => {
  let prompt = `
User Request: ${userPrompt}

${componentType ? `Component Type: ${componentType}` : ''}

${context ? UI_CONTEXT_TEMPLATE(context) : ''}

Requirements:
1. Create a beautiful, modern component following 21st.dev design principles
2. Use TypeScript with proper interfaces and types
3. Implement with ${context?.project?.framework || 'React'} best practices
4. Style with ${context?.project?.styleSystem || 'TailwindCSS'}
5. Ensure accessibility (${context?.requirements?.accessibility || 'WCAG AA'})
6. Include smooth animations and micro-interactions
7. Make it fully responsive
8. Optimize for performance

${componentType && COMPONENT_TEMPLATES[componentType] ? `
Component Patterns to Include:
${COMPONENT_TEMPLATES[componentType].patterns.map(p => `- ${p}`).join('\n')}

Essential Features:
${COMPONENT_TEMPLATES[componentType].essentials.map(e => `- ${e}`).join('\n')}
` : ''}

Design Tokens Reference:
- Use the provided color palette for consistency
- Apply proper spacing units (4px base)
- Use smooth animation timings
- Maintain visual hierarchy

Generate a production-ready component that developers would be proud to use.
`;

  return prompt.trim();
};