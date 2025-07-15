import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  srcDir: 'server',
  compatibilityDate: '2025-07-15',
  imports: {
    autoImport: false,
  },
});
