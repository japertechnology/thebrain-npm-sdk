import { defineConfig } from 'vitest/config';

/** Vitest configuration for running unit and integration tests. */
export default defineConfig({
  test: {
    testTimeout: 10000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/types.ts',
      ],
    },
  },
});

