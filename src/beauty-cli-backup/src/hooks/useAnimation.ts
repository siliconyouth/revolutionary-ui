import { useState, useEffect } from 'react';

export const useAnimation = (duration: number, reverse = false) => {
  const [progress, setProgress] = useState(reverse ? 1 : 0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(reverse ? 1 - newProgress : newProgress);
      
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [duration, reverse]);

  return progress;
};

export const useFadeIn = (duration = 1000) => {
  const progress = useAnimation(duration);
  return {
    opacity: progress,
    display: progress > 0 ? 'flex' : 'none'
  };
};