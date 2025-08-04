import { ComponentLibraryAPI } from './src/component-library/api/ComponentLibraryAPI';
import { GeneratedComponent } from './src/interactive/tools/EnhancedComponentGenerator';
import chalk from 'chalk';

async function testComponentLibrary() {
  console.log(chalk.cyan.bold('\n🧪 Testing Component Library Integration\n'));
  
  const api = new ComponentLibraryAPI();
  
  // Create a test component
  const testComponent: GeneratedComponent = {
    name: 'TestHeroSection',
    framework: 'react',
    files: {
      component: `import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const TestHeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText = 'Get Started',
  onCtaClick
}) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        <button className="hero-cta" onClick={onCtaClick}>
          {ctaText}
        </button>
      </div>
    </section>
  );
};`,
      styles: `.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
}

.hero-content {
  text-align: center;
  max-width: 800px;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.hero-cta {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.hero-cta:hover {
  transform: translateY(-2px);
}`,
      documentation: `# TestHeroSection

A modern hero section component with gradient background and call-to-action button.

## Usage

\`\`\`jsx
import { TestHeroSection } from '@/components/TestHeroSection';

function HomePage() {
  return (
    <TestHeroSection
      title="Welcome to Our Platform"
      subtitle="Build amazing things with our tools"
      ctaText="Start Building"
      onCtaClick={() => console.log('CTA clicked')}
    />
  );
}
\`\`\`

## Props

- **title** (string, required): Main heading text
- **subtitle** (string, optional): Secondary heading text
- **ctaText** (string, optional): Button text (default: "Get Started")
- **onCtaClick** (function, optional): Button click handler`,
      tests: `import { render, screen, fireEvent } from '@testing-library/react';
import { TestHeroSection } from './TestHeroSection';

describe('TestHeroSection', () => {
  it('renders title and subtitle', () => {
    render(
      <TestHeroSection
        title="Test Title"
        subtitle="Test Subtitle"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
  
  it('handles CTA click', () => {
    const handleClick = jest.fn();
    render(
      <TestHeroSection
        title="Test"
        onCtaClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Get Started'));
    expect(handleClick).toHaveBeenCalled();
  });
});`
    },
    structure: {
      imports: ['React'],
      props: ['title', 'subtitle', 'ctaText', 'onCtaClick'],
      state: [],
      methods: [],
      hooks: []
    }
  };
  
  try {
    // Add the component to the library
    console.log(chalk.cyan('Adding test component to library...'));
    const metadata = await api.addComponent(testComponent, {
      url: 'https://example.com/hero-section',
      extractionMethod: 'both'
    });
    
    console.log(chalk.green('✅ Component added successfully!'));
    console.log(chalk.dim(`   ID: ${metadata.id}`));
    console.log(chalk.dim(`   Name: ${metadata.displayName}`));
    console.log(chalk.dim(`   Category: ${metadata.category}`));
    console.log(chalk.dim(`   Type: ${metadata.type}`));
    console.log(chalk.dim(`   Quality Score: ${metadata.quality.score}/100`));
    
    // Search for the component
    console.log(chalk.cyan('\nSearching for hero components...'));
    const searchResults = await api.search({ query: 'hero' });
    console.log(chalk.green(`Found ${searchResults.length} hero component(s)`));
    
    // Get library stats
    console.log(chalk.cyan('\nGetting library statistics...'));
    const stats = await api.getStats();
    console.log(chalk.green('Library Stats:'));
    console.log(chalk.dim(`   Total Components: ${stats.totalComponents}`));
    console.log(chalk.dim(`   Average Quality: ${stats.averageQuality}/100`));
    
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
}

testComponentLibrary();