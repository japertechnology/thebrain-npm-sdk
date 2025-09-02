/** Tests for setup. */
import { vi } from 'vitest';

// Mock console.error to avoid noise in test output
vi.spyOn(console, 'error').mockImplementation(() => {});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    // Log the reason and stack for debugging
    // eslint-disable-next-line no-console
    console.error('UNHANDLED PROMISE REJECTION:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    // Log the error and stack for debugging
    // eslint-disable-next-line no-console
    console.error('UNCAUGHT EXCEPTION:', err);
}); 