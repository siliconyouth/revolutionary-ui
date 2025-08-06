import { useState, useEffect } from 'react';

interface TerminalSize {
  columns: number;
  rows: number;
}

export const useTerminalSize = (): TerminalSize => {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24
      });
    };

    process.stdout.on('resize', handleResize);
    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);

  return size;
};