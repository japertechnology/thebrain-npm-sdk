import { describe, it, beforeAll, expect } from 'vitest';
import { TheBrainApi } from '../../index';
import { loadConfig } from './config';

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Get Brains API E2E Test', () => {
    let api: TheBrainApi;

    beforeAll(async () => {
        const config = loadConfig();
        api = new TheBrainApi(config);
    });

    it('should get all brains', async () => {
        const brains = await api.brains.getBrains();
        expect(Array.isArray(brains)).toBe(true);
        expect(brains.length).toBeGreaterThan(0);
        
        // Verify each brain has required properties
        brains.forEach(brain => {
            expect(brain.id).toBeDefined();
            expect(typeof brain.name).toBe('string');
        });
    });
}); 