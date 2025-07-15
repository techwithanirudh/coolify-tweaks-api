import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  srcDir: 'server',
  compatibilityDate: '2025-07-15',
  imports: {
    autoImport: false,
  },
  experimental: {
    openAPI: true,
  },
  openAPI: {
    meta: {
      title: 'Coolify Tweaks API',
      description: 'Proxies GitHub release assets for Coolify Tweaks',
      version: '1.0',
    },
    ui: {
      scalar: {
        theme: 'purple',
      },
    },
  },
});
