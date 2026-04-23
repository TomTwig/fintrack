import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.meinefinanzapp',
  appName: 'FinTrack',
  webDir: 'dist/fintrack/browser',
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      androidIsEncryption: false,
    },
  },
  android: {
    // App Shortcuts werden in android/app/src/main/res/xml/shortcuts.xml definiert
    intentFilters: [
      {
        action: 'android.intent.action.VIEW',
        data: [
          {
            scheme: 'fintrack',
            host: 'app',
          },
        ],
        categories: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
      },
    ],
  },
};

export default config;
