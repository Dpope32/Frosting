import { useEffect } from 'react';

/**
 * useAutoFocus
 *
 * Usage:
 *   const inputRef = useRef<any>(null);
 *   useAutoFocus(inputRef, 1000, isVisible);
 *
 * @param ref - React ref to the input component
 * @param delay - Delay in ms before focusing (default: 750)
 * @param enabled - Only focus if true (default: true)
 */
export function useAutoFocus<T extends { focus?: () => void }>(ref: React.RefObject<T>, delay: number = 750, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      ref.current?.focus && ref.current.focus();
    }, delay);
    return () => clearTimeout(timer);
  }, [ref, delay, enabled]);
} 