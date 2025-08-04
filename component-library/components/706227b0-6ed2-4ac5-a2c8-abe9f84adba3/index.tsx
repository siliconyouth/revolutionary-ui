import React from 'react';
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
};