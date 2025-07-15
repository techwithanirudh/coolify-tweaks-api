import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  srcDir: 'server',
  compatibilityDate: '2025-07-15',
  imports: {
    autoImport: false,
  },
  openAPI: {
    route: '/_docs/openapi.json',
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
