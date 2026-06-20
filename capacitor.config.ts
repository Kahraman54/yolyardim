import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tulpar.assist',
  appName: 'Tulpar Assist',
  webDir: 'out',
  server: {
    url: 'https://www.tulparassist.com',
    cleartext: false
  }
};

export default config;
