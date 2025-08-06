import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class DatabaseServiceClass {
  private prisma: PrismaClient | null = null;
  private initialized = false;
  private cache: any = {};

  async initialize(): Promise<boolean> {
    try {
      // Try to connect to database
      this.prisma = new PrismaClient();
      await this.prisma.$connect();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Database connection failed, using fallback data:', error);
      // Load fallback data from cache
      await this.loadCachedData();
      return false;
    }
  }

  private async loadCachedData() {
    try {
      const cacheFile = path.join(os.homedir(), '.revolutionary-ui', 'db-cache.json');
      const data = await fs.readFile(cacheFile, 'utf-8');
      this.cache = JSON.parse(data);
    } catch {
      // Use hardcoded fallback if cache doesn't exist
      this.cache = this.getDefaultData();
    }
  }

  async getFrameworks() {
    if (this.prisma && this.initialized) {
      try {
        const frameworks = await this.prisma.framework.findMany({
          orderBy: { name: 'asc' }
        });
        return frameworks;
      } catch (error) {
        console.error('Error fetching frameworks:', error);
      }
    }
    
    return this.cache.frameworks || this.getDefaultData().frameworks;
  }

  async getUILibraries() {
    if (this.prisma && this.initialized) {
      try {
        const libraries = await this.prisma.resource.findMany({
          where: {
            type: { name: 'Library' },
            category: { name: { in: ['UI Libraries', 'Component Libraries'] } }
          },
          include: {
            frameworks: true
          },
          orderBy: { downloads: 'desc' },
          take: 20
        });
        return libraries.map(lib => ({
          name: lib.name,
          description: lib.description,
          framework: lib.frameworks[0]?.name || 'any'
        }));
      } catch (error) {
        console.error('Error fetching UI libraries:', error);
      }
    }
    
    return this.cache.uiLibraries || this.getDefaultData().uiLibraries;
  }

  async getCSSFrameworks() {
    if (this.prisma && this.initialized) {
      try {
        const cssFrameworks = await this.prisma.tag.findMany({
          where: {
            category: 'Styling',
            resources: { some: {} }
          },
          orderBy: { name: 'asc' }
        });
        return cssFrameworks.map(css => ({
          name: css.name,
          description: css.description || `${css.name} styling approach`
        }));
      } catch (error) {
        console.error('Error fetching CSS frameworks:', error);
      }
    }
    
    return this.cache.cssFrameworks || this.getDefaultData().cssFrameworks;
  }

  async getBuildTools() {
    if (this.prisma && this.initialized) {
      try {
        const tools = await this.prisma.resource.findMany({
          where: {
            type: { name: 'Tool' },
            category: { name: 'Build Tools' }
          },
          orderBy: { stars: 'desc' }
        });
        return tools.map(tool => ({
          name: tool.name,
          description: tool.description
        }));
      } catch (error) {
        console.error('Error fetching build tools:', error);
      }
    }
    
    return this.cache.buildTools || this.getDefaultData().buildTools;
  }

  async getTestingFrameworks() {
    if (this.prisma && this.initialized) {
      try {
        const frameworks = await this.prisma.resource.findMany({
          where: {
            type: { name: 'Tool' },
            category: { name: { in: ['Testing', 'Testing Tools'] } }
          },
          orderBy: { downloads: 'desc' }
        });
        return frameworks.map(fw => ({
          name: fw.name,
          description: fw.description
        }));
      } catch (error) {
        console.error('Error fetching testing frameworks:', error);
      }
    }
    
    return this.cache.testingFrameworks || this.getDefaultData().testingFrameworks;
  }

  async searchComponents(query: string, filters?: any) {
    if (this.prisma && this.initialized) {
      try {
        const components = await this.prisma.resource.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } }
                ]
              },
              filters?.category && { category: { name: filters.category } },
              filters?.framework && { frameworks: { some: { name: filters.framework } } }
            ].filter(Boolean)
          },
          include: {
            category: true,
            frameworks: true,
            tags: true
          },
          take: 50
        });
        return components;
      } catch (error) {
        console.error('Error searching components:', error);
      }
    }
    
    // Fallback search
    const allComponents = this.cache.components || [];
    return allComponents.filter((comp: any) => 
      comp.name.toLowerCase().includes(query.toLowerCase()) ||
      comp.description?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 50);
  }

  async getCategories() {
    if (this.prisma && this.initialized) {
      try {
        const categories = await this.prisma.category.findMany({
          include: {
            _count: { select: { resources: true } }
          },
          orderBy: { name: 'asc' }
        });
        return categories;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    
    return this.cache.categories || this.getDefaultData().categories;
  }

  async getTags() {
    if (this.prisma && this.initialized) {
      try {
        const tags = await this.prisma.tag.findMany({
          include: {
            _count: { select: { resources: true } }
          },
          orderBy: { name: 'asc' },
          take: 100
        });
        return tags;
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }
    
    return this.cache.tags || this.getDefaultData().tags;
  }

  private getDefaultData() {
    return {
      frameworks: [
        { name: 'React', description: 'A JavaScript library for building user interfaces' },
        { name: 'Vue', description: 'The Progressive JavaScript Framework' },
        { name: 'Angular', description: 'Platform for building mobile and desktop web applications' },
        { name: 'Svelte', description: 'Cybernetically enhanced web apps' },
        { name: 'Solid', description: 'A declarative, efficient, and flexible JavaScript library' },
        { name: 'Preact', description: 'Fast 3kB alternative to React with the same modern API' },
        { name: 'Lit', description: 'Simple. Fast. Web Components.' },
        { name: 'Alpine.js', description: 'A rugged, minimal framework for composing JavaScript behavior' },
        { name: 'Astro', description: 'Build faster websites with less client-side JavaScript' },
        { name: 'Qwik', description: 'The HTML-first framework' },
        { name: 'Next.js', description: 'The React Framework for Production' },
        { name: 'Nuxt', description: 'The Intuitive Vue Framework' }
      ],
      uiLibraries: [
        { name: 'Material-UI', description: 'React components for faster and easier web development', framework: 'React' },
        { name: 'Ant Design', description: 'A design language for background applications', framework: 'React' },
        { name: 'Chakra UI', description: 'A simple, modular and accessible component library', framework: 'React' },
        { name: 'Tailwind UI', description: 'Beautiful UI components built with Tailwind CSS', framework: 'any' },
        { name: 'Vuetify', description: 'Material Design component framework for Vue.js', framework: 'Vue' },
        { name: 'Element Plus', description: 'A Vue 3 based component library', framework: 'Vue' },
        { name: 'Angular Material', description: 'Material Design components for Angular', framework: 'Angular' },
        { name: 'PrimeNG', description: 'The Most Complete Angular UI Component Library', framework: 'Angular' },
        { name: 'Headless UI', description: 'Completely unstyled, fully accessible UI components', framework: 'any' },
        { name: 'Arco Design', description: 'A comprehensive React UI components library', framework: 'React' },
        { name: 'Semantic UI', description: 'User Interface is the language of the web', framework: 'any' },
        { name: 'Bootstrap', description: 'The most popular CSS framework', framework: 'any' },
        { name: 'Bulma', description: 'Modern CSS framework based on Flexbox', framework: 'any' },
        { name: 'Mantine', description: 'Full featured React components library', framework: 'React' },
        { name: 'NextUI', description: 'Beautiful, fast and modern React UI library', framework: 'React' },
        { name: 'React Suite', description: 'A suite of React components', framework: 'React' }
      ],
      cssFrameworks: [
        { name: 'Tailwind CSS', description: 'A utility-first CSS framework' },
        { name: 'styled-components', description: 'CSS-in-JS styling for React' },
        { name: 'Emotion', description: 'CSS-in-JS library designed for high performance' },
        { name: 'CSS Modules', description: 'Locally scoped CSS' },
        { name: 'Sass/SCSS', description: 'CSS extension language' },
        { name: 'Less', description: 'Dynamic CSS' },
        { name: 'PostCSS', description: 'A tool for transforming CSS' },
        { name: 'Vanilla CSS', description: 'Plain CSS without frameworks' },
        { name: 'UnoCSS', description: 'The instant on-demand atomic CSS engine' },
        { name: 'Stitches', description: 'CSS-in-JS with near-zero runtime' }
      ],
      buildTools: [
        { name: 'Vite', description: 'Next Generation Frontend Tooling' },
        { name: 'Webpack', description: 'A static module bundler' },
        { name: 'Parcel', description: 'The zero configuration build tool' },
        { name: 'Rollup', description: 'JavaScript module bundler' },
        { name: 'esbuild', description: 'An extremely fast JavaScript bundler' },
        { name: 'Turbopack', description: 'The successor to Webpack' }
      ],
      testingFrameworks: [
        { name: 'Vitest', description: 'A Vite-native test framework' },
        { name: 'Jest', description: 'Delightful JavaScript Testing' },
        { name: 'Playwright', description: 'Web Testing and Automation' },
        { name: 'Cypress', description: 'JavaScript End to End Testing' },
        { name: 'Testing Library', description: 'Simple and complete testing utilities' },
        { name: 'Mocha', description: 'The fun, simple, flexible JavaScript test framework' }
      ],
      categories: [
        { name: 'Forms', _count: { resources: 45 } },
        { name: 'Tables', _count: { resources: 38 } },
        { name: 'Charts', _count: { resources: 52 } },
        { name: 'Navigation', _count: { resources: 41 } },
        { name: 'Layout', _count: { resources: 33 } },
        { name: 'Data Display', _count: { resources: 67 } },
        { name: 'Feedback', _count: { resources: 29 } },
        { name: 'Overlays', _count: { resources: 25 } }
      ],
      tags: [
        { name: 'typescript', _count: { resources: 156 } },
        { name: 'react', _count: { resources: 142 } },
        { name: 'vue', _count: { resources: 89 } },
        { name: 'responsive', _count: { resources: 134 } },
        { name: 'accessible', _count: { resources: 98 } },
        { name: 'dark-mode', _count: { resources: 76 } },
        { name: 'animation', _count: { resources: 64 } },
        { name: 'forms', _count: { resources: 45 } }
      ],
      components: []
    };
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

export const DatabaseService = new DatabaseServiceClass();