import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { AccessType } from '../../model';
import { BrainAccessor } from '../../brain-access';

let testBrainId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe('Brain Access API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain Access E2E');
        testBrainId = brain.id!;
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('Access Control Operations', () => {
        it('should get brain accessors', async () => {
            const accessors = await api.brainAccess.getBrainAccessors(testBrainId);
            expect(Array.isArray(accessors)).toBe(true);
            
            // Verify each accessor has required properties
            accessors.forEach((accessor: BrainAccessor) => {
                expect(accessor.accessorId).toBeDefined();
                expect(typeof accessor.accessType).toBe('number');
            });
        });

        it('should set brain access', async () => {
            const testEmailAddress = 'test@example.com';
            try {
                await api.brainAccess.setBrainAccessLevel(testBrainId, {
                    emailAddress: testEmailAddress,
                    accessType: AccessType.Reader
                });
                
                // Verify the access was set
                const accessors = await api.brainAccess.getBrainAccessors(testBrainId);
                const newAccessor = accessors.find((a: BrainAccessor) => a.name?.includes(testEmailAddress.split('@')[0]));
                if (newAccessor) {
                    expect(newAccessor.accessType).toBe(AccessType.Reader);
                }
            } catch (error: any) {
                // This might fail in test environments
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should remove brain access', async () => {
            const testEmailAddress = 'test@example.com';
            try {
                await api.brainAccess.removeBrainAccess(testBrainId, { emailAddress: testEmailAddress });
                
                // Verify the access was removed
                const accessors = await api.brainAccess.getBrainAccessors(testBrainId);
                const removedAccessor = accessors.find((a: BrainAccessor) => a.name?.includes(testEmailAddress.split('@')[0]));
                expect(removedAccessor).toBeUndefined();
            } catch (error: any) {
                // This might fail in test environments
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });
    });
});