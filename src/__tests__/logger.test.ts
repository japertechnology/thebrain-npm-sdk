import { describe, it, expect } from 'vitest';
import logger from '../logger';

describe('sanitizeHeaders', () => {
    it('redacts sensitive headers regardless of case', () => {
        const headers = {
            AuThOrIzAtIoN: 'secret',
            cOoKiE: 'session',
            'SeT-CooKiE': 'cookie',
            'X-Custom': 'value',
        } as Record<string, any>;

        const serialized = logger.serializers.req({ headers } as any);

        expect(serialized.headers.AuThOrIzAtIoN).toBe('[REDACTED]');
        expect(serialized.headers.cOoKiE).toBe('[REDACTED]');
        expect(serialized.headers['SeT-CooKiE']).toBe('[REDACTED]');
        expect(serialized.headers['X-Custom']).toBe('value');
    });
});

