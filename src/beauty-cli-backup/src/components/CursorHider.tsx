import { useEffect } from 'react';

export const CursorHider: React.FC = () => {
  useEffect(() => {
    // Hide cursor on mount
    process.stdout.write('\x1B[?25l');
    
    // Show cursor on unmount
    return () => {
      process.stdout.write('\x1B[?25h');
    };
  }, []);

  return null;
};