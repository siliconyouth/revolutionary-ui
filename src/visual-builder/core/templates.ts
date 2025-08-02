import { ComponentNode } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  preview?: string;
  components: ComponentNode[];
}

export const layoutTemplates: LayoutTemplate[] = [
  // Landing Page Templates
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Classic hero section with heading, description, and CTA',
    category: 'Landing Page',
    icon: '🏔️',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        name: 'Hero Container',
        props: {
          padding: '64px',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          textAlign: 'center'
        },
        children: [
          {
            id: uuidv4(),
            type: 'heading',
            name: 'Hero Title',
            props: {
              text: 'Welcome to Revolutionary UI',
              level: 1,
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#111827'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'text',
            name: 'Hero Description',
            props: {
              text: 'Build amazing UI components with 60-95% less code. Start creating beautiful interfaces today.',
              fontSize: '20px',
              color: '#6b7280',
              lineHeight: 1.6
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'container',
            name: 'Button Group',
            props: {
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            },
            children: [
              {
                id: uuidv4(),
                type: 'button',
                name: 'Get Started',
                props: {
                  text: 'Get Started',
                  variant: 'primary',
                  size: 'large'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'button',
                name: 'Learn More',
                props: {
                  text: 'Learn More',
                  variant: 'outline',
                  size: 'large'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    description: '3-column feature grid with icons',
    category: 'Landing Page',
    icon: '⚡',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        name: 'Features Section',
        props: {
          padding: '64px',
          backgroundColor: 'transparent'
        },
        children: [
          {
            id: uuidv4(),
            type: 'heading',
            name: 'Features Title',
            props: {
              text: 'Features',
              level: 2,
              fontSize: '36px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#111827'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'grid',
            name: 'Feature Grid',
            props: {
              columns: 3,
              gap: '32px',
              padding: '32px 0'
            },
            children: [
              {
                id: uuidv4(),
                type: 'card',
                name: 'Feature 1',
                props: {
                  title: 'Fast Development',
                  description: 'Build components 60-95% faster with our factory system',
                  shadow: true,
                  padding: '24px'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'card',
                name: 'Feature 2',
                props: {
                  title: 'Framework Agnostic',
                  description: 'Works with React, Vue, Angular, and more',
                  shadow: true,
                  padding: '24px'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'card',
                name: 'Feature 3',
                props: {
                  title: 'AI Powered',
                  description: 'Generate components from natural language',
                  shadow: true,
                  padding: '24px'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },

  // Form Templates
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    category: 'Forms',
    icon: '📧',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        name: 'Form Container',
        props: {
          padding: '32px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          shadow: true,
          maxWidth: '500px',
          margin: '0 auto'
        },
        children: [
          {
            id: uuidv4(),
            type: 'heading',
            name: 'Form Title',
            props: {
              text: 'Contact Us',
              level: 2,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'container',
            name: 'Form Fields',
            props: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px 0'
            },
            children: [
              {
                id: uuidv4(),
                type: 'input',
                name: 'Name Input',
                props: {
                  label: 'Name',
                  placeholder: 'Your name',
                  type: 'text',
                  required: true
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'input',
                name: 'Email Input',
                props: {
                  label: 'Email',
                  placeholder: 'your@email.com',
                  type: 'email',
                  required: true
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'input',
                name: 'Message Input',
                props: {
                  label: 'Message',
                  placeholder: 'Your message...',
                  type: 'text',
                  required: true
                },
                children: []
              }
            ]
          },
          {
            id: uuidv4(),
            type: 'button',
            name: 'Submit Button',
            props: {
              text: 'Send Message',
              variant: 'primary',
              size: 'medium',
              fullWidth: true
            },
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'login-form',
    name: 'Login Form',
    description: 'User login form with email and password',
    category: 'Forms',
    icon: '🔐',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        name: 'Login Container',
        props: {
          padding: '32px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          shadow: true,
          maxWidth: '400px',
          margin: '0 auto'
        },
        children: [
          {
            id: uuidv4(),
            type: 'heading',
            name: 'Login Title',
            props: {
              text: 'Sign In',
              level: 2,
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#111827'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'container',
            name: 'Form Fields',
            props: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px 0'
            },
            children: [
              {
                id: uuidv4(),
                type: 'input',
                name: 'Email Input',
                props: {
                  label: 'Email',
                  placeholder: 'your@email.com',
                  type: 'email',
                  required: true
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'input',
                name: 'Password Input',
                props: {
                  label: 'Password',
                  placeholder: '••••••••',
                  type: 'password',
                  required: true
                },
                children: []
              }
            ]
          },
          {
            id: uuidv4(),
            type: 'button',
            name: 'Login Button',
            props: {
              text: 'Sign In',
              variant: 'primary',
              size: 'medium',
              fullWidth: true
            },
            children: []
          }
        ]
      }
    ]
  },

  // Dashboard Templates
  {
    id: 'stats-cards',
    name: 'Stats Cards',
    description: 'Dashboard statistics cards',
    category: 'Dashboard',
    icon: '📊',
    components: [
      {
        id: uuidv4(),
        type: 'grid',
        name: 'Stats Grid',
        props: {
          columns: 4,
          gap: '24px',
          padding: '0'
        },
        children: [
          {
            id: uuidv4(),
            type: 'card',
            name: 'Stat Card 1',
            props: {
              title: 'Total Users',
              description: '12,345',
              shadow: true,
              padding: '24px',
              borderRadius: '8px'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'card',
            name: 'Stat Card 2',
            props: {
              title: 'Revenue',
              description: '$54,321',
              shadow: true,
              padding: '24px',
              borderRadius: '8px'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'card',
            name: 'Stat Card 3',
            props: {
              title: 'Growth',
              description: '+23.5%',
              shadow: true,
              padding: '24px',
              borderRadius: '8px'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'card',
            name: 'Stat Card 4',
            props: {
              title: 'Active Now',
              description: '1,234',
              shadow: true,
              padding: '24px',
              borderRadius: '8px'
            },
            children: []
          }
        ]
      }
    ]
  },

  // Navigation Templates
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Horizontal navigation with logo and links',
    category: 'Navigation',
    icon: '🧭',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        name: 'Navbar',
        props: {
          padding: '16px 32px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        children: [
          {
            id: uuidv4(),
            type: 'heading',
            name: 'Logo',
            props: {
              text: 'Your Logo',
              level: 3,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#111827'
            },
            children: []
          },
          {
            id: uuidv4(),
            type: 'container',
            name: 'Nav Links',
            props: {
              display: 'flex',
              gap: '32px',
              alignItems: 'center'
            },
            children: [
              {
                id: uuidv4(),
                type: 'text',
                name: 'Home Link',
                props: {
                  text: 'Home',
                  fontSize: '16px',
                  color: '#374151'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'text',
                name: 'About Link',
                props: {
                  text: 'About',
                  fontSize: '16px',
                  color: '#374151'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'text',
                name: 'Contact Link',
                props: {
                  text: 'Contact',
                  fontSize: '16px',
                  color: '#374151'
                },
                children: []
              },
              {
                id: uuidv4(),
                type: 'button',
                name: 'CTA Button',
                props: {
                  text: 'Get Started',
                  variant: 'primary',
                  size: 'small'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
];

export function getTemplatesByCategory(category: string): LayoutTemplate[] {
  return layoutTemplates.filter(template => template.category === category);
}

export function getTemplateCategories(): string[] {
  return Array.from(new Set(layoutTemplates.map(template => template.category)));
}

export function getTemplateById(id: string): LayoutTemplate | undefined {
  return layoutTemplates.find(template => template.id === id);
}