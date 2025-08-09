import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:19006',
    headless: true,
  },
  webServer: {
    command: 'echo "Assume Expo already running on 19006"',
    port: 19006,
    reuseExistingServer: true,
  },
}); 