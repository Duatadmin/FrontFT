import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL for your application under test
    baseUrl: 'http://localhost:5173', // Assuming Vite's default, adjust if needed
    // Glob pattern to discover e2e test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Path to the support file
    supportFile: 'cypress/support/e2e.ts',
    // Setup Node event listeners here if needed (e.g., for plugins)
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  // Component testing configuration (optional, can be added later if needed)
  // component: {
  //   devServer: {
  //     framework: 'react',
  //     bundler: 'vite',
  //   },
  //   specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  // },
});
