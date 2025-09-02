/** Tests for brains.e2e.test. */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';

let testBrainId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Brains API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain E2E');
        testBrainId = brain.id;
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('Brain Operations', () => {
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

        it('should get brain details', async () => {
            const brain = await api.brains.getBrain(testBrainId);
            expect(brain).toBeDefined();
            expect(brain.id).toBe(testBrainId);
            expect(brain.name).toBe('Test Brain E2E');
        });

        it('should handle invalid brain ID', async () => {
            const invalidBrainId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.brains.getBrain(invalidBrainId);
                errorMsg = 'Expected error for invalid brain ID';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBeGreaterThanOrEqual(400);
                } else {
                    expect(err.message).toMatch(/invalid|error|uuid/i);
                }
            }
            expect(errorMsg).toBe('');
        });

        it('should handle non-existent brain', async () => {
            const nonExistentBrainId = '00000000-0000-0000-0000-000000000000';
            let errorMsg = '';
            try {
                await api.brains.getBrain(nonExistentBrainId);
                errorMsg = 'Expected error for non-existent brain';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBe(401);
                } else {
                    expect(err.message).toMatch(/unauthorized|401/i);
                }
            }
            expect(errorMsg).toBe('');
        });
    });
}); 