const config = require('@agoric/synpress/synpress.config');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  ...config,
  trashAssetsBeforeRuns: false,
  e2e: {
    ...config.e2e,
    baseUrl: 'http://localhost:5173',
  },
});
