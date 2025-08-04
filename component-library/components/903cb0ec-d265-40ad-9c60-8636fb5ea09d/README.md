# TestHeroSection

A modern hero section component with gradient background and call-to-action button.

## Usage

```jsx
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
```

## Props

- **title** (string, required): Main heading text
- **subtitle** (string, optional): Secondary heading text
- **ctaText** (string, optional): Button text (default: "Get Started")
- **onCtaClick** (function, optional): Button click handler