/** Tests for config-validation.test. */
import { describe, it, expect } from 'vitest';
import { TheBrainApi } from '../index';

describe('TheBrainApi configuration validation', () => {
    it('rejects non-positive requestLimit', () => {
        expect(() => new TheBrainApi({ apiKey: 'key', requestLimit: 0 } as any)).toThrow();
        expect(() => new TheBrainApi({ apiKey: 'key', requestLimit: -1 } as any)).toThrow();
    });

    it('rejects non-positive rateLimitWindows', () => {
        expect(() => new TheBrainApi({ apiKey: 'key', rateLimitWindows: 0 } as any)).toThrow();
        expect(() => new TheBrainApi({ apiKey: 'key', rateLimitWindows: -100 } as any)).toThrow();
    });
});
