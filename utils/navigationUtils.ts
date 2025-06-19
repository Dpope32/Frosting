
import { debounce } from 'lodash';
import { router } from 'expo-router';

// Create a map to store path-specific debounced functions
const debouncedNavigationMap = new Map<string, ReturnType<typeof debounce>>();

/**
 * Debounced navigation to prevent multiple rapid taps from opening multiple modals
 * Each path gets its own debounced function to allow navigation between different routes
 */
export const debouncedNavigate = (path: string) => {
  if (!debouncedNavigationMap.has(path)) {
    // Create a new debounced function for this specific path
    const debouncedFn = debounce(() => {
      console.log(`📱 DEBOUNCED NAVIGATE: Navigating to ${path} at ${Date.now()}`);
      router.push(path as any);
    }, 300, {
      leading: true,
      trailing: false
    });
    debouncedNavigationMap.set(path, debouncedFn);
  }
  
  // Call the path-specific debounced function
  const debouncedFn = debouncedNavigationMap.get(path)!;
  debouncedFn();
};

// Let's also create a wrapper to log when the function is called
export const debouncedNavigateWithLogs = (path: string) => {
  console.log(`📱 DEBOUNCED NAVIGATE: Called with path ${path} at ${Date.now()}`);
  return debouncedNavigate(path);
};

/**
 * Debounced modal dismiss to prevent multiple rapid dismissals
 */
export const debouncedDismiss = debounce(() => {
  router.dismiss();
}, 300, {
  leading: true,
  trailing: false
});

/**
 * Debounced router back to prevent multiple rapid back navigations
 */
export const debouncedBack = debounce(() => {
  router.back();
}, 300, {
  leading: true,
  trailing: false
}); 