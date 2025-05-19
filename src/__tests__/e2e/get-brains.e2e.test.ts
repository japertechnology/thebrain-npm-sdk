import { describe, it, beforeAll, expect } from 'vitest';
import { TheBrainApi } from '../../index';
import { loadConfig } from './config';

describe('Get Brains API E2E Test', () => {
    let api: TheBrainApi;

    beforeAll(async () => {
        const config = loadConfig();
        api = new TheBrainApi(config);
    });

    it('should get all brains', async () => {
        const brains = await api.brains.getBrains();
        expect(Array.isArray(brains)).toBe(true);
        expect(brains.length).toBeGreaterThan(0);
        
        // Print brain names
        console.log('\nFound brains:');
        brains.forEach((brain, index) => {
            console.log(`${index + 1}. ${brain.name || 'Unnamed Brain'} (ID: ${brain.id})`);
        });
        
        // Verify each brain has the expected structure
        brains.forEach(brain => {
            expect(brain).toHaveProperty('id');
            expect(brain).toHaveProperty('name');
            expect(brain).toHaveProperty('homeThoughtId');
        });
    });
}); 