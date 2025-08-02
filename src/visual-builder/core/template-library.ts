import { ComponentNode } from './types';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'landing' | 'forms' | 'dashboard' | 'navigation' | 'content' | 'ecommerce' | 'social';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: ComponentNode[];
  preview?: string;
  author?: string;
  version?: string;
  frameworks?: string[];
  responsive?: boolean;
}

export const templateLibrary: Template[] = [
  // Landing Page Templates
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Classic hero section with heading, description, and CTA buttons',
    icon: '🏠',
    category: 'landing',
    tags: ['hero', 'landing', 'cta', 'marketing'],
    difficulty: 'beginner',
    responsive: true,
    components: [
      {
        id: 'hero-container',
        type: 'container',
        name: 'Hero Container',
        props: {
          padding: '80px 24px',
          backgroundColor: '#f9fafb',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        },
        children: [
          {
            id: 'hero-badge',
            type: 'badge',
            name: 'New Feature Badge',
            props: {
              text: '✨ New Feature',
              backgroundColor: '#ddd6fe',
              color: '#7c3aed',
              marginBottom: '24px'
            },
            children: []
          },
          {
            id: 'hero-title',
            type: 'heading',
            name: 'Hero Title',
            props: {
              text: 'Build Amazing Products Faster',
              level: 1,
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: '#111827'
            },
            children: []
          },
          {
            id: 'hero-description',
            type: 'text',
            name: 'Hero Description',
            props: {
              text: 'Create beautiful, responsive UI components with 60-95% less code. Join thousands of developers building better products.',
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '600px',
              marginBottom: '32px',
              lineHeight: '1.6'
            },
            children: []
          },
          {
            id: 'hero-buttons',
            type: 'container',
            name: 'Button Group',
            props: {
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            },
            children: [
              {
                id: 'primary-cta',
                type: 'button',
                name: 'Primary CTA',
                props: {
                  text: 'Get Started',
                  variant: 'primary',
                  size: 'large',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontWeight: '600'
                },
                children: []
              },
              {
                id: 'secondary-cta',
                type: 'button',
                name: 'Secondary CTA',
                props: {
                  text: 'View Demo',
                  variant: 'outline',
                  size: 'large',
                  borderColor: '#d1d5db',
                  color: '#374151',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontWeight: '600'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },

  // Feature Grid Template
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    description: '3-column feature showcase with icons and descriptions',
    icon: '🎯',
    category: 'landing',
    tags: ['features', 'grid', 'marketing', 'showcase'],
    difficulty: 'beginner',
    responsive: true,
    components: [
      {
        id: 'features-section',
        type: 'container',
        name: 'Features Section',
        props: {
          padding: '80px 24px',
          backgroundColor: 'white'
        },
        children: [
          {
            id: 'features-header',
            type: 'container',
            name: 'Section Header',
            props: {
              textAlign: 'center',
              marginBottom: '64px'
            },
            children: [
              {
                id: 'features-title',
                type: 'heading',
                name: 'Section Title',
                props: {
                  text: 'Everything you need',
                  level: 2,
                  fontSize: '36px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                },
                children: []
              },
              {
                id: 'features-subtitle',
                type: 'text',
                name: 'Section Subtitle',
                props: {
                  text: 'All the tools and features you need to build amazing products',
                  fontSize: '18px',
                  color: '#6b7280'
                },
                children: []
              }
            ]
          },
          {
            id: 'features-grid',
            type: 'grid',
            name: 'Features Grid',
            props: {
              columns: 3,
              gap: '32px',
              responsive: true
            },
            children: [
              {
                id: 'feature-1',
                type: 'card',
                name: 'Feature Card 1',
                props: {
                  padding: '32px',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-1-icon',
                    type: 'icon',
                    name: 'Feature Icon',
                    props: {
                      icon: '⚡',
                      size: '48px',
                      marginBottom: '16px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-1-title',
                    type: 'heading',
                    name: 'Feature Title',
                    props: {
                      text: 'Lightning Fast',
                      level: 3,
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-1-desc',
                    type: 'text',
                    name: 'Feature Description',
                    props: {
                      text: 'Build and deploy in seconds with our optimized workflow',
                      color: '#6b7280',
                      fontSize: '16px'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'feature-2',
                type: 'card',
                name: 'Feature Card 2',
                props: {
                  padding: '32px',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-2-icon',
                    type: 'icon',
                    name: 'Feature Icon',
                    props: {
                      icon: '🎨',
                      size: '48px',
                      marginBottom: '16px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-2-title',
                    type: 'heading',
                    name: 'Feature Title',
                    props: {
                      text: 'Beautiful Design',
                      level: 3,
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-2-desc',
                    type: 'text',
                    name: 'Feature Description',
                    props: {
                      text: 'Professional templates that look great on any device',
                      color: '#6b7280',
                      fontSize: '16px'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'feature-3',
                type: 'card',
                name: 'Feature Card 3',
                props: {
                  padding: '32px',
                  textAlign: 'center'
                },
                children: [
                  {
                    id: 'feature-3-icon',
                    type: 'icon',
                    name: 'Feature Icon',
                    props: {
                      icon: '🚀',
                      size: '48px',
                      marginBottom: '16px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-3-title',
                    type: 'heading',
                    name: 'Feature Title',
                    props: {
                      text: 'Scale Effortlessly',
                      level: 3,
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'feature-3-desc',
                    type: 'text',
                    name: 'Feature Description',
                    props: {
                      text: 'Handle millions of users without breaking a sweat',
                      color: '#6b7280',
                      fontSize: '16px'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Contact Form Template
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    icon: '✉️',
    category: 'forms',
    tags: ['form', 'contact', 'email', 'validation'],
    difficulty: 'intermediate',
    responsive: true,
    components: [
      {
        id: 'form-container',
        type: 'container',
        name: 'Form Container',
        props: {
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px 24px'
        },
        children: [
          {
            id: 'form-title',
            type: 'heading',
            name: 'Form Title',
            props: {
              text: 'Get in Touch',
              level: 2,
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textAlign: 'center'
            },
            children: []
          },
          {
            id: 'form-subtitle',
            type: 'text',
            name: 'Form Subtitle',
            props: {
              text: 'We\'d love to hear from you. Send us a message!',
              fontSize: '16px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '32px'
            },
            children: []
          },
          {
            id: 'form',
            type: 'form',
            name: 'Contact Form',
            props: {
              gap: '24px',
              display: 'flex',
              flexDirection: 'column'
            },
            children: [
              {
                id: 'name-group',
                type: 'container',
                name: 'Name Fields',
                props: {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                },
                children: [
                  {
                    id: 'first-name',
                    type: 'input',
                    name: 'First Name',
                    props: {
                      type: 'text',
                      label: 'First Name',
                      placeholder: 'John',
                      required: true
                    },
                    children: []
                  },
                  {
                    id: 'last-name',
                    type: 'input',
                    name: 'Last Name',
                    props: {
                      type: 'text',
                      label: 'Last Name',
                      placeholder: 'Doe',
                      required: true
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'email',
                type: 'input',
                name: 'Email',
                props: {
                  type: 'email',
                  label: 'Email Address',
                  placeholder: 'john@example.com',
                  required: true
                },
                children: []
              },
              {
                id: 'subject',
                type: 'input',
                name: 'Subject',
                props: {
                  type: 'text',
                  label: 'Subject',
                  placeholder: 'How can we help?',
                  required: true
                },
                children: []
              },
              {
                id: 'message',
                type: 'textarea',
                name: 'Message',
                props: {
                  label: 'Message',
                  placeholder: 'Tell us more...',
                  rows: 6,
                  required: true
                },
                children: []
              },
              {
                id: 'submit',
                type: 'button',
                name: 'Submit Button',
                props: {
                  text: 'Send Message',
                  variant: 'primary',
                  size: 'large',
                  fullWidth: true,
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },

  // Login Form Template
  {
    id: 'login-form',
    name: 'Login Form',
    description: 'Modern login form with social options',
    icon: '🔐',
    category: 'forms',
    tags: ['form', 'login', 'authentication', 'auth'],
    difficulty: 'beginner',
    responsive: true,
    components: [
      {
        id: 'login-container',
        type: 'container',
        name: 'Login Container',
        props: {
          maxWidth: '400px',
          margin: '0 auto',
          padding: '40px 24px'
        },
        children: [
          {
            id: 'login-card',
            type: 'card',
            name: 'Login Card',
            props: {
              padding: '40px',
              shadow: true,
              borderRadius: '12px'
            },
            children: [
              {
                id: 'login-title',
                type: 'heading',
                name: 'Login Title',
                props: {
                  text: 'Welcome Back',
                  level: 2,
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  textAlign: 'center'
                },
                children: []
              },
              {
                id: 'login-subtitle',
                type: 'text',
                name: 'Login Subtitle',
                props: {
                  text: 'Sign in to your account',
                  fontSize: '14px',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: '32px'
                },
                children: []
              },
              {
                id: 'login-form',
                type: 'form',
                name: 'Login Form',
                props: {
                  gap: '20px',
                  display: 'flex',
                  flexDirection: 'column'
                },
                children: [
                  {
                    id: 'email-input',
                    type: 'input',
                    name: 'Email',
                    props: {
                      type: 'email',
                      label: 'Email',
                      placeholder: 'you@example.com',
                      required: true
                    },
                    children: []
                  },
                  {
                    id: 'password-input',
                    type: 'input',
                    name: 'Password',
                    props: {
                      type: 'password',
                      label: 'Password',
                      placeholder: '••••••••',
                      required: true
                    },
                    children: []
                  },
                  {
                    id: 'remember-forgot',
                    type: 'container',
                    name: 'Remember & Forgot',
                    props: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    },
                    children: [
                      {
                        id: 'remember-me',
                        type: 'checkbox',
                        name: 'Remember Me',
                        props: {
                          label: 'Remember me',
                          fontSize: '14px'
                        },
                        children: []
                      },
                      {
                        id: 'forgot-password',
                        type: 'link',
                        name: 'Forgot Password',
                        props: {
                          text: 'Forgot password?',
                          href: '#',
                          fontSize: '14px',
                          color: '#7c3aed'
                        },
                        children: []
                      }
                    ]
                  },
                  {
                    id: 'login-button',
                    type: 'button',
                    name: 'Login Button',
                    props: {
                      text: 'Sign In',
                      variant: 'primary',
                      size: 'large',
                      fullWidth: true,
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '600'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'divider',
                type: 'divider',
                name: 'OR Divider',
                props: {
                  text: 'OR',
                  margin: '24px 0'
                },
                children: []
              },
              {
                id: 'social-login',
                type: 'container',
                name: 'Social Login',
                props: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                },
                children: [
                  {
                    id: 'google-login',
                    type: 'button',
                    name: 'Google Login',
                    props: {
                      text: 'Continue with Google',
                      variant: 'outline',
                      fullWidth: true,
                      icon: '🔍'
                    },
                    children: []
                  },
                  {
                    id: 'github-login',
                    type: 'button',
                    name: 'GitHub Login',
                    props: {
                      text: 'Continue with GitHub',
                      variant: 'outline',
                      fullWidth: true,
                      icon: '🐙'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'signup-link',
                type: 'text',
                name: 'Sign Up Link',
                props: {
                  text: 'Don\'t have an account? Sign up',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginTop: '24px',
                  color: '#6b7280'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },

  // Dashboard Stats Template
  {
    id: 'stats-dashboard',
    name: 'Stats Dashboard',
    description: 'Dashboard with key metrics cards',
    icon: '📊',
    category: 'dashboard',
    tags: ['dashboard', 'stats', 'metrics', 'analytics'],
    difficulty: 'intermediate',
    responsive: true,
    components: [
      {
        id: 'dashboard-container',
        type: 'container',
        name: 'Dashboard Container',
        props: {
          padding: '32px'
        },
        children: [
          {
            id: 'dashboard-header',
            type: 'container',
            name: 'Dashboard Header',
            props: {
              marginBottom: '32px'
            },
            children: [
              {
                id: 'dashboard-title',
                type: 'heading',
                name: 'Dashboard Title',
                props: {
                  text: 'Dashboard Overview',
                  level: 1,
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                },
                children: []
              },
              {
                id: 'dashboard-subtitle',
                type: 'text',
                name: 'Dashboard Subtitle',
                props: {
                  text: 'Welcome back! Here\'s what\'s happening today.',
                  fontSize: '16px',
                  color: '#6b7280'
                },
                children: []
              }
            ]
          },
          {
            id: 'stats-grid',
            type: 'grid',
            name: 'Stats Grid',
            props: {
              columns: 4,
              gap: '24px',
              responsive: true
            },
            children: [
              {
                id: 'stat-1',
                type: 'card',
                name: 'Revenue Card',
                props: {
                  padding: '24px',
                  shadow: true
                },
                children: [
                  {
                    id: 'stat-1-label',
                    type: 'text',
                    name: 'Stat Label',
                    props: {
                      text: 'Total Revenue',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-1-value',
                    type: 'heading',
                    name: 'Stat Value',
                    props: {
                      text: '$45,231',
                      level: 3,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-1-change',
                    type: 'badge',
                    name: 'Stat Change',
                    props: {
                      text: '+12.5%',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontSize: '12px'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'stat-2',
                type: 'card',
                name: 'Users Card',
                props: {
                  padding: '24px',
                  shadow: true
                },
                children: [
                  {
                    id: 'stat-2-label',
                    type: 'text',
                    name: 'Stat Label',
                    props: {
                      text: 'Active Users',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-2-value',
                    type: 'heading',
                    name: 'Stat Value',
                    props: {
                      text: '2,338',
                      level: 3,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-2-change',
                    type: 'badge',
                    name: 'Stat Change',
                    props: {
                      text: '+7.2%',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontSize: '12px'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'stat-3',
                type: 'card',
                name: 'Orders Card',
                props: {
                  padding: '24px',
                  shadow: true
                },
                children: [
                  {
                    id: 'stat-3-label',
                    type: 'text',
                    name: 'Stat Label',
                    props: {
                      text: 'Total Orders',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-3-value',
                    type: 'heading',
                    name: 'Stat Value',
                    props: {
                      text: '846',
                      level: 3,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-3-change',
                    type: 'badge',
                    name: 'Stat Change',
                    props: {
                      text: '-3.1%',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '12px'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'stat-4',
                type: 'card',
                name: 'Conversion Card',
                props: {
                  padding: '24px',
                  shadow: true
                },
                children: [
                  {
                    id: 'stat-4-label',
                    type: 'text',
                    name: 'Stat Label',
                    props: {
                      text: 'Conversion Rate',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-4-value',
                    type: 'heading',
                    name: 'Stat Value',
                    props: {
                      text: '24.8%',
                      level: 3,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    },
                    children: []
                  },
                  {
                    id: 'stat-4-change',
                    type: 'badge',
                    name: 'Stat Change',
                    props: {
                      text: '+2.3%',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontSize: '12px'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Navigation Bar Template
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Responsive navigation with logo and links',
    icon: '🧭',
    category: 'navigation',
    tags: ['navigation', 'navbar', 'header', 'menu'],
    difficulty: 'intermediate',
    responsive: true,
    components: [
      {
        id: 'navbar-container',
        type: 'container',
        name: 'Navbar Container',
        props: {
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: '0',
          zIndex: '50'
        },
        children: [
          {
            id: 'navbar-inner',
            type: 'container',
            name: 'Navbar Inner',
            props: {
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 24px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            },
            children: [
              {
                id: 'navbar-brand',
                type: 'container',
                name: 'Brand',
                props: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                },
                children: [
                  {
                    id: 'logo',
                    type: 'image',
                    name: 'Logo',
                    props: {
                      src: '/logo.svg',
                      alt: 'Logo',
                      width: '32px',
                      height: '32px'
                    },
                    children: []
                  },
                  {
                    id: 'brand-name',
                    type: 'heading',
                    name: 'Brand Name',
                    props: {
                      text: 'YourBrand',
                      level: 3,
                      fontSize: '20px',
                      fontWeight: '600'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'navbar-menu',
                type: 'navigation',
                name: 'Navigation Menu',
                props: {
                  display: 'flex',
                  gap: '32px',
                  alignItems: 'center'
                },
                children: [
                  {
                    id: 'nav-link-1',
                    type: 'link',
                    name: 'Home',
                    props: {
                      text: 'Home',
                      href: '/',
                      color: '#374151',
                      fontWeight: '500'
                    },
                    children: []
                  },
                  {
                    id: 'nav-link-2',
                    type: 'link',
                    name: 'Products',
                    props: {
                      text: 'Products',
                      href: '/products',
                      color: '#374151',
                      fontWeight: '500'
                    },
                    children: []
                  },
                  {
                    id: 'nav-link-3',
                    type: 'link',
                    name: 'About',
                    props: {
                      text: 'About',
                      href: '/about',
                      color: '#374151',
                      fontWeight: '500'
                    },
                    children: []
                  },
                  {
                    id: 'nav-link-4',
                    type: 'link',
                    name: 'Contact',
                    props: {
                      text: 'Contact',
                      href: '/contact',
                      color: '#374151',
                      fontWeight: '500'
                    },
                    children: []
                  }
                ]
              },
              {
                id: 'navbar-actions',
                type: 'container',
                name: 'Actions',
                props: {
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                },
                children: [
                  {
                    id: 'login-btn',
                    type: 'button',
                    name: 'Login Button',
                    props: {
                      text: 'Login',
                      variant: 'ghost',
                      color: '#374151'
                    },
                    children: []
                  },
                  {
                    id: 'signup-btn',
                    type: 'button',
                    name: 'Sign Up Button',
                    props: {
                      text: 'Sign Up',
                      variant: 'primary',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): Template[] {
  if (category === 'all') return templateLibrary;
  return templateLibrary.filter(t => t.category === category);
}

// Helper function to search templates
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return templateLibrary.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(templateLibrary.map(t => t.category)));
}

// Get all unique tags
export function getTags(): string[] {
  const allTags = templateLibrary.flatMap(t => t.tags);
  return Array.from(new Set(allTags));
}