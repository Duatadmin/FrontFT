import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to detect if the current viewport is mobile-sized with debounced resize handling for better performance
 * @param breakpoint The width threshold in pixels (default: 768)
 * @returns boolean indicating if the viewport is smaller than the breakpoint
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  // Initialize with a function to handle SSR (where window is undefined)
  const [isMobile, setIsMobile] = useState(() => {
    // Check if window is defined (browser environment)
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    // Default to false for SSR
    return false;
  });
  
  // Force an update on client side after mount
  useEffect(() => {
    // Immediate check on mount to ensure correct initial state
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < breakpoint);
    }
  }, [breakpoint]);
  
  // Debounced check with useCallback to prevent recreating on each render
  const debouncedCheck = useCallback(() => {
    let timeout: number;
    return () => {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          setIsMobile(window.innerWidth < breakpoint);
        }, 100); // 100ms debounce period
      }
    };
  }, [breakpoint]);
  
  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;
    
    // Get debounced handler
    const handleResize = debouncedCheck();
    
    // Add event listener for resize with debounce
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint, debouncedCheck]);
  
  return isMobile;
}

export default useIsMobile;
