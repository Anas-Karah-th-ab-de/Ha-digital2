import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.app',
  appName: 'HA-Digital',
  webDir: 'dist/ha-digital/browser',
  bundledWebRuntime: false,
  server: {
    url: 'https://localhost:4200',  // Lokale Server-URL
    cleartext: true,
  }
};

export default config;
