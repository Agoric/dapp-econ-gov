import { mergeConfig } from 'vite';
import { defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      deps: {
        inline: ['@agoric/rpc'],
      },
      setupFiles: ['src/installSesLockdown.ts'],
      exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    },
  }),
);
