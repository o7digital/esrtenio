import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  redirects: {
    '/pension/': { status: 301, destination: '/gestor-de-pensiones/' },
  },
});
