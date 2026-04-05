/**
 * Capacitor Initialization Module
 * Initialise les plugins Capacitor au démarrage de l'application
 */

import { isNative } from './bridge';

export async function initializeCapacitor(): Promise<void> {
  if (!isNative()) {
    console.log('Running in browser mode - Capacitor not available');
    return;
  }

  try {
    // Initialize StatusBar
    await initializeStatusBar();

    // Hide SplashScreen after a short delay to ensure app is ready
    await hideSplashScreen();

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
}

async function initializeStatusBar(): Promise<void> {
  try {
    const { StatusBar } = (window as any).Capacitor.Plugins;
    if (!StatusBar) return;

    // Detect if dark mode is enabled
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set status bar style
    await StatusBar.setStyle({
      style: isDarkMode ? 'DARK' : 'LIGHT',
    });

    // Set status bar background color
    await StatusBar.setBackgroundColor({
      color: isDarkMode ? '#000000' : '#ffffff',
    });

    // Make status bar overlay transparent (optional)
    await StatusBar.setOverlaysWebView({
      overlay: false,
    });

    console.log('StatusBar initialized');
  } catch (error) {
    console.error('Error initializing StatusBar:', error);
  }
}

async function hideSplashScreen(): Promise<void> {
  try {
    const { SplashScreen } = (window as any).Capacitor.Plugins;
    if (!SplashScreen) return;

    // Hide splash screen after a short delay (2 seconds)
    setTimeout(async () => {
      try {
        await SplashScreen.hide();
        console.log('SplashScreen hidden');
      } catch (error) {
        console.error('Error hiding SplashScreen:', error);
      }
    }, 2000);
  } catch (error) {
    console.error('Error setting up SplashScreen:', error);
  }
}

/**
 * Listen for theme changes and update StatusBar accordingly
 */
export function setupThemeListener(): void {
  if (!isNative()) return;

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  darkModeQuery.addEventListener('change', async (e) => {
    try {
      const { StatusBar } = (window as any).Capacitor.Plugins;
      if (!StatusBar) return;

      await StatusBar.setStyle({
        style: e.matches ? 'DARK' : 'LIGHT',
      });

      await StatusBar.setBackgroundColor({
        color: e.matches ? '#000000' : '#ffffff',
      });

      console.log('StatusBar updated for theme change');
    } catch (error) {
      console.error('Error updating StatusBar:', error);
    }
  });
}

/**
 * Handle app pause/resume events
 */
export function setupAppLifecycle(): void {
  if (!isNative()) return;

  const { App } = (window as any).Capacitor.Plugins;
  if (!App) return;

  // Listen for app pause
  App.addListener('pause', () => {
    console.log('App paused');
  });

  // Listen for app resume
  App.addListener('resume', () => {
    console.log('App resumed');
  });

  // Listen for app destroy
  App.addListener('destroy', () => {
    console.log('App destroyed');
  });
}
