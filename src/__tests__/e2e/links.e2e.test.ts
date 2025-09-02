/** Tests for links.e2e.test. */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { ThoughtKind, ThoughtCreateModel, LinkCreateModel, OperationType } from '../../model';

let testBrainId: string;
let sourceThoughtId: string;
let targetThoughtId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Links API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain Links E2E');
        testBrainId = brain.id;

        // Create source thought
        const sourceThought = await api.thoughts.createThought(testBrainId, {
            name: 'Source Thought',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel);
        sourceThoughtId = sourceThought.id!;

        // Create target thought
        const targetThought = await api.thoughts.createThought(testBrainId, {
            name: 'Target Thought',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel);
        targetThoughtId = targetThought.id!;
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('Link Operations', () => {
        let createdLinkId: string;

        it('should create a link between thoughts', async () => {
            const link = await api.links.createLink(testBrainId, {
                thoughtIdA: sourceThoughtId,
                thoughtIdB: targetThoughtId,
                relation: 1, // Child = 1
                name: 'Test Link'
            } as LinkCreateModel);
            
            expect(link).not.toBeNull();
            expect(link.id).toBeDefined();
            createdLinkId = link.id!;
        });

        it('should get link details', async () => {
            const link = await api.links.getLink(testBrainId, createdLinkId);

            expect(link).not.toBeNull();
            expect(link.id).toBe(createdLinkId);
            expect(link.thoughtIdA).toBe(sourceThoughtId);
            expect(link.thoughtIdB).toBe(targetThoughtId);
        });

        it('should get link between thoughts', async () => {
            const link = await api.links.getLink(testBrainId, createdLinkId);

            expect(link).not.toBeNull();
            expect(link.id).toBe(createdLinkId);
            expect(link.thoughtIdA).toBe(sourceThoughtId);
            expect(link.thoughtIdB).toBe(targetThoughtId);
        });

        it('should update link properties', async () => {
            await api.links.updateLink(testBrainId, createdLinkId, {
                operations: [
                    {
                        path: '/name',
                        operationType: OperationType.Replace,
                        op: 'replace',
                        value: 'Updated Link Name'
                    }
                ]
            });

            // Wait for update to propagate
            await new Promise(res => setTimeout(res, 2000));

            // Retry loop for eventual consistency
            let updatedLink = null;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts) {
                // Verify the update
                updatedLink = await api.links.getLink(testBrainId, createdLinkId);
                
                if (updatedLink.name === 'Updated Link Name') {
                    break;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(res => setTimeout(res, 1000));
                }
            }

            expect(updatedLink!.name).toBe('Updated Link Name');
            expect(updatedLink!.relation).toBe(1); // Child = 1
        }, 30000);

        it('should get link attachments', async () => {
            const attachments = await api.links.getLinkAttachments(testBrainId, createdLinkId);

            expect(Array.isArray(attachments)).toBe(true);
            // Initially there should be no attachments
            expect(attachments.length).toBe(0);
        });

        it('should handle invalid brain ID', async () => {
            const invalidBrainId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.links.getLink(invalidBrainId, createdLinkId);
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

        it('should handle invalid link ID', async () => {
            const invalidLinkId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.links.getLink(testBrainId, invalidLinkId);
                errorMsg = 'Expected error for invalid link ID';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBeGreaterThanOrEqual(400);
                } else {
                    expect(err.message).toMatch(/invalid|error|uuid/i);
                }
            }
            expect(errorMsg).toBe('');
        });

        it('should handle non-existent link', async () => {
            const nonExistentLinkId = '00000000-0000-0000-0000-000000000000';
            let errorMsg = '';
            try {
                await api.links.getLink(testBrainId, nonExistentLinkId);
                errorMsg = 'Expected error for non-existent link';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBe(404);
                } else {
                    expect(err.message).toMatch(/not found|404/i);
                }
            }
            expect(errorMsg).toBe('');
        });

        it('should delete the link', async () => {
            await api.links.deleteLink(testBrainId, createdLinkId);
            
            // Wait for deletion to propagate
            await new Promise(res => setTimeout(res, 2000));
            
            // Retry logic with eventual consistency
            let attempts = 0;
            const maxAttempts = 10;
            let deletionConfirmed = false;
            
            while (attempts < maxAttempts) {
                try {
                    await api.links.getLink(testBrainId, createdLinkId);
                } catch (err: any) {
                    deletionConfirmed = true;
                    if (err.response) {
                        expect(err.response.status).toBeGreaterThanOrEqual(400);
                    } else {
                        expect(err.message).toMatch(/not found|error|invalid/i);
                    }
                    break;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
            
            expect(deletionConfirmed).toBe(true);
        }, 30000);
    });
}); 