import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aiphonemaster.app',
  appName: 'AIPhoneMaster',
  webDir: 'dist/public',
  server: {
    url: 'https://cf08047cd6b7.ngrok-free.app', // point to backend
    // cleartext: false,                 // allow http (non-https)
    allowNavigation: ['https://cf08047cd6b7.ngrok-free.app'] // optional: allow navigating to that host
  }

};

export default config;
