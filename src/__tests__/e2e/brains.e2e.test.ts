import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';

describe('Brains API E2E Tests', () => {
    let api: TheBrainApi;
    let helper: TestHelper;
    let testBrainId: string;

    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        // Create a test brain
        // Create a test thought
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    it('should create a new brain', async () => {
        const brain = await helper.createTestBrain('Test Brain E2E');
        expect(brain).toBeDefined();
        expect(brain.name).toBe('Test Brain E2E');
        expect(brain.id).toBeDefined();
        testBrainId = brain.id!;
    });

    it('should get all brains', async () => {
        const brains = await api.brains.getBrains();
        expect(Array.isArray(brains)).toBe(true);
        expect(brains.length).toBeGreaterThan(0);
        
        // Log all brain IDs for debugging
        console.log('Available brain IDs:', brains.map(b => b.id).join(', '));
        console.log('Looking for test brain ID:', testBrainId);
        
        const foundBrain = brains.find(b => b.id === testBrainId);
        expect(foundBrain).toBeDefined();
        expect(foundBrain?.id).toBe(testBrainId);
    });

    it('should get a specific brain', async () => {
        const brain = await api.brains.getBrain(testBrainId);
        expect(brain).toBeDefined();
        expect(brain.id).toBe(testBrainId);
        expect(brain.name).toBe('Test Brain E2E');
    });

    it('should get brain statistics', async () => {
        const stats = await api.brains.getBrainStats(testBrainId);
        expect(stats).toBeDefined();
        expect(stats.brainId).toBe(testBrainId);
        expect(stats.brainName).toBe('Test Brain E2E');
        expect(typeof stats.thoughts).toBe('number');
        expect(typeof stats.links).toBe('number');
    });

    it('should get brain modifications', async () => {
        const modifications = await api.brains.getBrainModifications(testBrainId);
        expect(Array.isArray(modifications)).toBe(true);
        // Since we just created the brain, we should have at least one modification
        expect(modifications.length).toBeGreaterThan(0);
        expect(modifications[0].brainId).toBe(testBrainId);
    });

    it('should delete the test brain', async () => {
        await api.brains.deleteBrain(testBrainId);
        // Verify the brain is deleted by trying to get it (should throw)
        await expect(api.brains.getBrain(testBrainId)).rejects.toThrow();
    });
}); 