/** Tests for config-validation.test. */
import { describe, it, expect } from 'vitest';
import { TheBrainApi } from '../index';

describe('TheBrainApi configuration validation', () => {
    it.each([0, -1])('rejects non-positive requestLimit (%i)', (value) => {
        expect(() => new TheBrainApi({ apiKey: 'key', requestLimit: value } as any)).toThrow();
    });

    it.each([0, -100])('rejects non-positive rateLimitWindows (%i)', (value) => {
        expect(() => new TheBrainApi({ apiKey: 'key', rateLimitWindows: value } as any)).toThrow();
    });
});
