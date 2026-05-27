import { defineConfig } from 'cypress';
export default defineConfig({
  reporter: 'mocha-junit-reporter',
  reporterOptions: {
    mochaFile: 'test-results/test-results-[hash].xml',
    toConsole: true,
  },

  allowCypressEnv: false,

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
      options: {
        projectConfig: {
          root: './',
          sourceRoot: 'src',
          buildOptions: {
            outputPath: 'dist/browser',
          },
        },
      },
    },
    specPattern: '**/*.cy.ts',
  },

  e2e: {
    baseUrl: 'http://localhost:8100',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
