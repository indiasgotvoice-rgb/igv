import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.igv.app',
  appName: 'IGV',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
