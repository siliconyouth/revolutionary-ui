import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  color?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  delay = 50,
  color = 'white' 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, delay]);

  return <Text color={color}>{displayedText}</Text>;
};