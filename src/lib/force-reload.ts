/**
 * Force the browser to reload the page
 * This is used to ensure all cached modules are refreshed
 */
export function forceReload() {
  if (typeof window !== 'undefined') {
    console.log('Forcing page reload to clear cache...');
    window.location.reload();
  }
}

/**
 * Add this flag to localStorage to indicate we need a fresh load
 */
export function markForReload() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('force_reload_timestamp', Date.now().toString());
  }
}

/**
 * Check if we need to reload based on the flag
 */
export function checkNeedsReload() {
  if (typeof window !== 'undefined') {
    const lastReload = localStorage.getItem('force_reload_timestamp');
    if (lastReload) {
      const now = Date.now();
      const lastReloadTime = parseInt(lastReload, 10);
      // If the last reload was more than 10 seconds ago, do another reload
      if (now - lastReloadTime > 10000) {
        localStorage.removeItem('force_reload_timestamp');
        forceReload();
      }
    }
  }
} 