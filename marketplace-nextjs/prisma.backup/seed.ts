import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      image: 'https://avatar.vercel.sh/demo',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      image: 'https://avatar.vercel.sh/admin',
    },
  });

  // Create sample components
  const components = [
    {
      name: 'Modern Dashboard',
      description: 'A comprehensive dashboard component with charts, stats, and widgets',
      category: 'layout',
      tags: ['dashboard', 'analytics', 'admin', 'responsive'],
      version: '1.0.0',
      price: 0,
      premium: false,
      framework: ['react', 'vue', 'angular'],
      styling: ['tailwind', 'css'],
      downloads: 1250,
      rating: 4.8,
      authorId: user1.id,
      componentData: {
        type: 'dashboard',
        props: {
          title: 'Analytics Dashboard',
          theme: 'light',
        },
        children: [],
      },
    },
    {
      name: 'Advanced Data Table',
      description: 'Feature-rich data table with sorting, filtering, and pagination',
      category: 'data-display',
      tags: ['table', 'data', 'grid', 'sortable'],
      version: '2.1.0',
      price: 29.99,
      premium: true,
      framework: ['react'],
      styling: ['tailwind', 'styled-components'],
      downloads: 850,
      rating: 4.9,
      authorId: user1.id,
      componentData: {
        type: 'table',
        props: {
          columns: [],
          data: [],
          sortable: true,
          filterable: true,
        },
        children: [],
      },
    },
    {
      name: 'Contact Form Pro',
      description: 'Professional contact form with validation and email integration',
      category: 'forms',
      tags: ['form', 'contact', 'validation', 'email'],
      version: '1.5.0',
      price: 0,
      premium: false,
      framework: ['react', 'vue'],
      styling: ['tailwind'],
      downloads: 3200,
      rating: 4.7,
      authorId: user2.id,
      componentData: {
        type: 'form',
        props: {
          fields: [],
          validation: true,
          submitUrl: '',
        },
        children: [],
      },
    },
    {
      name: 'E-commerce Product Card',
      description: 'Beautiful product card component for e-commerce sites',
      category: 'ecommerce',
      tags: ['product', 'card', 'shop', 'ecommerce'],
      version: '1.2.0',
      price: 19.99,
      premium: true,
      framework: ['react', 'vue', 'angular', 'svelte'],
      styling: ['tailwind', 'css'],
      downloads: 620,
      rating: 4.6,
      authorId: user2.id,
      componentData: {
        type: 'card',
        props: {
          title: '',
          price: 0,
          image: '',
          description: '',
        },
        children: [],
      },
    },
    {
      name: 'Responsive Navigation',
      description: 'Mobile-first navigation component with hamburger menu',
      category: 'navigation',
      tags: ['nav', 'menu', 'responsive', 'mobile'],
      version: '3.0.0',
      price: 0,
      premium: false,
      framework: ['react'],
      styling: ['tailwind'],
      downloads: 5600,
      rating: 4.9,
      authorId: user1.id,
      featured: true,
      componentData: {
        type: 'navigation',
        props: {
          items: [],
          logo: '',
          theme: 'light',
        },
        children: [],
      },
    },
  ];

  for (const component of components) {
    await prisma.marketplaceComponent.create({
      data: component,
    });
  }

  // Create some sample reviews
  const allComponents = await prisma.marketplaceComponent.findMany();
  
  for (const component of allComponents) {
    // Add 2-3 reviews per component
    const reviewCount = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < reviewCount; i++) {
      await prisma.componentReview.create({
        data: {
          componentId: component.id,
          userId: i % 2 === 0 ? user1.id : user2.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: [
            'Great component! Easy to integrate and customize.',
            'Exactly what I needed for my project. Well documented.',
            'High quality code and excellent design. Highly recommended!',
            'Works perfectly. The author is very responsive to questions.',
          ][Math.floor(Math.random() * 4)],
          helpful: Math.floor(Math.random() * 20),
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });