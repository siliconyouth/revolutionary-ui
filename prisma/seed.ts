import { PrismaClient } from '@prisma/client';
import { seedAIProviders } from './seed-ai-providers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Data Display',
        slug: 'data-display',
        description: 'Components for displaying data and content',
        icon: '📊',
        sortOrder: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Data Entry',
        slug: 'data-entry',
        description: 'Components for user input and form controls',
        icon: '✏️',
        sortOrder: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Navigation',
        slug: 'navigation',
        description: 'Components for app navigation and routing',
        icon: '🧭',
        sortOrder: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Feedback',
        slug: 'feedback',
        description: 'Components for user feedback and notifications',
        icon: '💬',
        sortOrder: 4
      }
    }),
    prisma.category.create({
      data: {
        name: 'Layout',
        slug: 'layout',
        description: 'Components for page structure and layout',
        icon: '📐',
        sortOrder: 5
      }
    })
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create resource types
  const resourceTypes = await Promise.all([
    prisma.resourceType.create({
      data: {
        name: 'Component',
        slug: 'component',
        description: 'Reusable UI components'
      }
    }),
    prisma.resourceType.create({
      data: {
        name: 'Hook',
        slug: 'hook',
        description: 'React hooks and composables'
      }
    }),
    prisma.resourceType.create({
      data: {
        name: 'Utility',
        slug: 'utility',
        description: 'Helper functions and utilities'
      }
    }),
    prisma.resourceType.create({
      data: {
        name: 'Pattern',
        slug: 'pattern',
        description: 'Design patterns and best practices'
      }
    })
  ]);

  console.log(`✅ Created ${resourceTypes.length} resource types`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.create({ data: { name: 'Responsive', slug: 'responsive' } }),
    prisma.tag.create({ data: { name: 'Accessible', slug: 'accessible' } }),
    prisma.tag.create({ data: { name: 'Dark Mode', slug: 'dark-mode' } }),
    prisma.tag.create({ data: { name: 'Animated', slug: 'animated' } }),
    prisma.tag.create({ data: { name: 'Form', slug: 'form' } }),
    prisma.tag.create({ data: { name: 'Table', slug: 'table' } }),
    prisma.tag.create({ data: { name: 'Chart', slug: 'chart' } }),
    prisma.tag.create({ data: { name: 'Modal', slug: 'modal' } }),
    prisma.tag.create({ data: { name: 'Dashboard', slug: 'dashboard' } })
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create submission guidelines
  const guidelines = await Promise.all([
    prisma.submissionGuideline.create({
      data: {
        category: 'general',
        title: 'Component Quality Standards',
        content: 'All submitted components must follow our quality standards including clean code, proper documentation, and accessibility best practices.',
        isRequired: true,
        sortOrder: 1
      }
    }),
    prisma.submissionGuideline.create({
      data: {
        category: 'code',
        title: 'Code Style Guide',
        content: 'Use consistent naming conventions, proper indentation, and meaningful variable names. ESLint and Prettier configurations are recommended.',
        isRequired: true,
        sortOrder: 2
      }
    }),
    prisma.submissionGuideline.create({
      data: {
        category: 'documentation',
        title: 'Documentation Requirements',
        content: 'Include a comprehensive README with installation instructions, usage examples, API documentation, and prop descriptions.',
        isRequired: true,
        sortOrder: 3
      }
    }),
    prisma.submissionGuideline.create({
      data: {
        category: 'testing',
        title: 'Testing Guidelines',
        content: 'Components should include unit tests with at least 80% code coverage. Integration tests and visual regression tests are encouraged.',
        isRequired: false,
        sortOrder: 4
      }
    }),
    prisma.submissionGuideline.create({
      data: {
        category: 'licensing',
        title: 'License Policy',
        content: 'Components must be submitted under an open-source license (MIT, Apache 2.0, or BSD). All dependencies must have compatible licenses.',
        isRequired: true,
        sortOrder: 5
      }
    }),
    prisma.submissionGuideline.create({
      data: {
        category: 'security',
        title: 'Security Requirements',
        content: 'No hardcoded secrets, API keys, or sensitive data. Follow OWASP guidelines for web security. Sanitize all user inputs.',
        isRequired: true,
        sortOrder: 6
      }
    })
  ]);

  console.log(`✅ Created ${guidelines.length} submission guidelines`);

  // Create users
  let demoUser, adminUser, creatorUser;
  
  try {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@revolutionary-ui.com',
        name: 'Demo User',
        role: 'USER'
      }
    });
    console.log('✅ Created demo user');

    adminUser = await prisma.user.create({
      data: {
        email: 'admin@revolutionary-ui.com',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    console.log('✅ Created admin user');

    creatorUser = await prisma.user.create({
      data: {
        email: 'creator@revolutionary-ui.com',
        name: 'Creator User',
        role: 'CREATOR'
      }
    });
    console.log('✅ Created creator user');

    // Create a team
    const team = await prisma.team.create({
      data: {
        name: 'Revolutionary Team',
        slug: 'revolutionary-team',
        description: 'The core team building Revolutionary UI',
        avatarUrl: 'https://example.com/team-avatar.png',
        websiteUrl: 'https://revolutionary-ui.com',
        billingEmail: 'billing@revolutionary-ui.com',
        members: {
          create: [
            {
              userId: adminUser.id,
              role: 'OWNER'
            },
            {
              userId: creatorUser.id,
              role: 'ADMIN'
            },
            {
              userId: demoUser.id,
              role: 'MEMBER'
            }
          ]
        }
      }
    });
    console.log('✅ Created team with members');

    // Create a project
    const project = await prisma.project.create({
      data: {
        teamId: team.id,
        name: 'Revolutionary Dashboard',
        slug: 'revolutionary-dashboard',
        description: 'A comprehensive dashboard built with Revolutionary UI',
        framework: 'react',
        language: 'typescript',
        styling: 'tailwind',
        components: {
          create: [
            {
              name: 'DashboardLayout',
              type: 'generated',
              sourceCode: `export const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};`,
              framework: 'react',
              generatedFrom: 'LayoutFactory',
              generationConfig: {
                type: 'dashboard',
                sidebar: true,
                header: true
              }
            }
          ]
        }
      }
    });
    console.log('✅ Created project with components');

    // Create a sample resource
    const sampleResource = await prisma.resource.create({
      data: {
        name: 'Advanced Data Table',
        slug: 'advanced-data-table',
        description: 'A feature-rich data table component with sorting, filtering, and pagination',
        longDescription: 'This advanced data table component provides a complete solution for displaying and managing tabular data with built-in sorting, filtering, pagination, and export capabilities.',
        categoryId: categories[0].id, // Data Display
        resourceTypeId: resourceTypes[0].id, // Component
        authorId: creatorUser.id,
        publisherId: adminUser.id,
        frameworks: ['react', 'vue', 'angular'],
        license: 'MIT',
        hasTypescript: true,
        hasTests: true,
        isResponsive: true,
        isAccessible: true,
        supportsDarkMode: true,
        bundleSizeKb: 45,
        codeQualityScore: 95,
        documentationScore: 90,
        designScore: 88,
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
        githubUrl: 'https://github.com/revolutionary-ui/data-table',
        npmPackage: '@revolutionary-ui/data-table',
        demoUrl: 'https://revolutionary-ui.com/demos/data-table',
        sourceCode: `import React from 'react';

export const DataTable = ({ data, columns }) => {
  // Implementation here
  return <table>...</table>;
};`,
        documentation: '# Advanced Data Table\n\n## Installation\n\n```bash\nnpm install @revolutionary-ui/data-table\n```\n\n## Usage\n\n```jsx\nimport { DataTable } from "@revolutionary-ui/data-table";\n\nconst columns = [\n  { key: "id", label: "ID" },\n  { key: "name", label: "Name" },\n  { key: "email", label: "Email" }\n];\n\nconst data = [\n  { id: 1, name: "John Doe", email: "john@example.com" },\n  { id: 2, name: "Jane Smith", email: "jane@example.com" }\n];\n\n<DataTable data={data} columns={columns} />\n```',
        tags: {
          connect: [
            { id: tags.find(t => t.slug === 'typescript')!.id },
            { id: tags.find(t => t.slug === 'responsive')!.id },
            { id: tags.find(t => t.slug === 'accessible')!.id },
            { id: tags.find(t => t.slug === 'table')!.id }
          ]
        },
        teamResources: {
          create: {
            teamId: team.id,
            addedBy: adminUser.id
          }
        }
      }
    });

    // Create a preview for the sample resource
    await prisma.preview.create({
      data: {
        resourceId: sampleResource.id,
        previewType: 'LIVE',
        exampleCode: `<DataTable 
  data={sampleData} 
  columns={columns}
  sortable
  filterable
  paginated
  pageSize={10}
/>`,
        exampleFramework: 'react',
        exampleDependencies: {
          "react": "^19.0.0",
          "react-dom": "^19.0.0"
        },
        isInteractive: true,
        isResponsive: true,
        supportsThemes: true
      }
    });

    console.log('✅ Created sample resource with preview');

    // Create a featured submission
    await prisma.featuredSubmission.create({
      data: {
        resourceId: sampleResource.id,
        featuredReason: 'Excellent implementation of advanced table features with great performance',
        featuredBy: adminUser.id,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        position: 1,
        isActive: true
      }
    });

    console.log('✅ Created featured submission');

    // Create feature flags
    await prisma.featureFlag.create({
      data: {
        key: 'marketplace_enabled',
        name: 'Marketplace Feature',
        description: 'Enable the component marketplace',
        isEnabled: true,
        rolloutPercentage: 100
      }
    });

    await prisma.featureFlag.create({
      data: {
        key: 'ai_generation_enabled',
        name: 'AI Generation',
        description: 'Enable AI-powered component generation',
        isEnabled: true,
        rolloutPercentage: 100
      }
    });

    await prisma.featureFlag.create({
      data: {
        key: 'team_collaboration',
        name: 'Team Collaboration',
        description: 'Enable team features',
        isEnabled: true,
        rolloutPercentage: 50,
        enabledForTeams: [team.id]
      }
    });

    console.log('✅ Created feature flags');

    // Create system configuration
    await prisma.systemConfig.create({
      data: {
        key: 'platform_settings',
        value: {
          platformName: 'Revolutionary UI',
          platformVersion: '3.0.0',
          maintenanceMode: false,
          allowRegistration: true,
          maxTeamSize: 10,
          platformFeePercentage: 15
        },
        description: 'Core platform settings'
      }
    });

    console.log('✅ Created system configuration');

    // Seed AI providers
    await seedAIProviders();

  } catch (error) {
    console.log('⚠️  Skipped some seeding (data may already exist):', error);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });