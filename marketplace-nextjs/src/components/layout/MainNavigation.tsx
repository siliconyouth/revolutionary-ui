'use client';

import { useAuth } from '@/contexts/AuthContext';
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

// Initialize the factory. In a real app, this might be done in a provider.
const ui = setup({ framework: 'react' });

export function MainNavigation() {
  const { user } = useAuth();

  const navItems = [
    { label: 'Components', href: '/components' },
    { label: 'Playground', href: '/playground' },
    { label: 'AI Playground', href: '/playground/ai' },
    { label: 'Analyzer', href: '/analyzer' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs/getting-started' }
  ];

  const rightContent = user
    ? { type: 'button', label: 'Dashboard', href: '/dashboard' }
    : { type: 'button', label: 'Sign In', href: '/auth/signin' };

  // Generate the Navbar using the Revolutionary UI Factory
  const Navbar = ui.createNavbar({
    logo: {
      type: 'image',
      src: '/logo.svg', // Assuming a logo file exists
      alt: 'Revolutionary UI Factory Logo',
      href: '/',
    },
    navItems: navItems,
    rightContent: [
        rightContent,
        {
            type: 'icon',
            icon: 'github', // Assuming the factory can resolve this to a GitHub icon
            href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system',
            ariaLabel: 'GitHub Repository'
        }
    ],
    isSticky: true,
    withGlassmorphism: true,
  });

  return <Navbar />;
}
