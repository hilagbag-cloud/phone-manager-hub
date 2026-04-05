import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c577b79e68f04d0b9a68e82aa0f9f38c',
  appName: 'Phone Manager Pro',
  webDir: 'dist',
  server: {
    url: 'https://phone-central-hub.lovable.app/',
    cleartext: false
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