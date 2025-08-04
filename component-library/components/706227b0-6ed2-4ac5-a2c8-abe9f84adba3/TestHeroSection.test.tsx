import { render, screen, fireEvent } from '@testing-library/react';
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
});