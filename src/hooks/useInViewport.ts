import { useEffect, useRef, useState } from 'react';

interface UseInViewportOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInViewport<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewportOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0, rootMargin = '0px' } = options;
  const ref = useRef<T>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return [ref, isInViewport];
}