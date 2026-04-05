import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c577b79e68f04d0b9a68e82aa0f9f38c',
  appName: 'Phone Manager Pro',
  webDir: 'dist',
  server: {
    url: 'https://c577b79e-68f0-4d0b-9a68-e82aa0f9f38c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      iosScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    SafeArea: {
      offset: 0
    }
  }
};

export default config;
