
import { debounce } from 'lodash';
import { router } from 'expo-router';

/**
 * Debounced navigation to prevent multiple rapid taps from opening multiple modals
 */
export const debouncedNavigate = debounce((path: string) => {
  router.push(path as any);
}, 300, {
  leading: true,
  trailing: false
});

// Let's also create a wrapper to log when the function is called
const originalDebouncedNavigate = debouncedNavigate;
export const debouncedNavigateWithLogs = (path: string) => {
  console.log(`📱 DEBOUNCED NAVIGATE: Called with path ${path} at ${Date.now()}`);
  return originalDebouncedNavigate(path);
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