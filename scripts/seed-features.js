#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const features = [
  // Core Features
  {
    name: 'Factory Components',
    slug: 'factory_components',
    description: 'Access to pre-built factory components',
    category: 'core',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Custom Factories',
    slug: 'custom_factories',
    description: 'Create custom component factories',
    category: 'core',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Component Export',
    slug: 'component_export',
    description: 'Export generated components',
    category: 'core',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  
  // AI Features
  {
    name: 'AI Code Generation',
    slug: 'ai_code_generation',
    description: 'Generate components using AI',
    category: 'ai',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'AI Component Analysis',
    slug: 'ai_component_analysis',
    description: 'Analyze and optimize components with AI',
    category: 'ai',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Custom AI Providers',
    slug: 'custom_ai_providers',
    description: 'Use your own AI API keys',
    category: 'ai',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  
  // Collaboration Features
  {
    name: 'Team Workspaces',
    slug: 'team_workspaces',
    description: 'Collaborative team workspaces',
    category: 'collaboration',
    tiers: ['company', 'enterprise'],
  },
  {
    name: 'Component Sharing',
    slug: 'component_sharing',
    description: 'Share components with team members',
    category: 'collaboration',
    tiers: ['company', 'enterprise'],
  },
  {
    name: 'Role-Based Access Control',
    slug: 'rbac',
    description: 'Advanced permission management',
    category: 'collaboration',
    tiers: ['enterprise'],
  },
  
  // Enterprise Features
  {
    name: 'Single Sign-On',
    slug: 'sso',
    description: 'SSO authentication',
    category: 'enterprise',
    tiers: ['enterprise'],
  },
  {
    name: 'Audit Logs',
    slug: 'audit_logs',
    description: 'Comprehensive audit logging',
    category: 'enterprise',
    tiers: ['enterprise'],
  },
  {
    name: 'SLA Support',
    slug: 'sla_support',
    description: 'Guaranteed response times',
    category: 'enterprise',
    tiers: ['enterprise'],
  },
  
  // Marketplace Features
  {
    name: 'Marketplace Access',
    slug: 'marketplace_access',
    description: 'Browse and download components',
    category: 'marketplace',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Publish Components',
    slug: 'publish_components',
    description: 'Publish components to marketplace',
    category: 'marketplace',
    tiers: ['personal', 'company', 'enterprise'],
  },
  {
    name: 'Premium Components',
    slug: 'premium_components',
    description: 'Access to premium marketplace components',
    category: 'marketplace',
    tiers: ['company', 'enterprise'],
  },
  
  // Advanced Features
  {
    name: 'Private Registry',
    slug: 'private_registry',
    description: 'Private npm registry for components',
    category: 'advanced',
    tiers: ['company', 'enterprise'],
  },
  {
    name: 'CI/CD Integration',
    slug: 'cicd_integration',
    description: 'Integrate with CI/CD pipelines',
    category: 'advanced',
    tiers: ['company', 'enterprise'],
  },
  {
    name: 'API Access',
    slug: 'api_access',
    description: 'Programmatic API access',
    category: 'advanced',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Webhook Support',
    slug: 'webhook_support',
    description: 'Webhook notifications',
    category: 'advanced',
    tiers: ['company', 'enterprise'],
  },
  
  // Analytics Features
  {
    name: 'Component Analytics',
    slug: 'component_analytics',
    description: 'Component usage analytics',
    category: 'analytics',
    tiers: ['beta_tester', 'early_bird', 'personal', 'company', 'enterprise'],
  },
  {
    name: 'Performance Metrics',
    slug: 'performance_metrics',
    description: 'Advanced performance tracking',
    category: 'analytics',
    tiers: ['company', 'enterprise'],
  },
  {
    name: 'Export Analytics',
    slug: 'export_analytics',
    description: 'Export analytics data',
    category: 'analytics',
    tiers: ['company', 'enterprise'],
  }
];

async function seedFeatures() {
  console.log('🌱 Seeding features...\n');
  
  for (const feature of features) {
    try {
      const created = await prisma.feature.upsert({
        where: { slug: feature.slug },
        update: feature,
        create: feature,
      });
      console.log(`✅ ${created.name} (${created.tiers.join(', ')})`);
    } catch (error) {
      console.error(`❌ Failed to seed ${feature.name}:`, error.message);
    }
  }
  
  const count = await prisma.feature.count();
  console.log(`\n🎉 Seeded ${count} features total!`);
  
  await prisma.$disconnect();
}

seedFeatures();