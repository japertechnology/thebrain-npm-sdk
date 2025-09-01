import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { loadConfig } from './config';
import { TestHelper } from './helpers';
import { ThoughtKind, ThoughtCreateModel, OperationType, ThoughtDto, BrainDto } from '../../model';
import axios from 'axios';

let testBrainId: string;
let testThoughtId: string;
let helper: TestHelper;
let api: TheBrainApi;
let brain: BrainDto;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Thoughts API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain E2E');
        testBrainId = brain.id!;

        const thought = await api.thoughts.createThought(testBrainId, {
            name: 'Test Thought',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel) as ThoughtDto;
        testThoughtId = thought.id!;
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('CRUD Thoughts', () => {
        it('should create a new thought', async () => {
            const response = await api.thoughts.createThought(testBrainId, {
                name: 'New Test Thought',
                kind: ThoughtKind.Normal
            } as ThoughtCreateModel);
            expect(response).toBeDefined();
            expect(response.id).toBeDefined();
            
            // Verify the thought was created by retrieving it
            const thought = await api.thoughts.getThought(testBrainId, response.id!);
            expect(thought).toBeDefined();
            expect(thought.id).toBe(response.id);
            expect(thought.name).toBe('New Test Thought');
        });

        it('should retrieve a thought by ID', async () => {
            const thought = await api.thoughts.getThought(testBrainId, testThoughtId);
            expect(thought).toBeDefined();
            expect(thought.id).toBe(testThoughtId);
            expect(thought.name).toBe('Test Thought');
        });
        it('should update a thought', async () => {
            await api.thoughts.updateThought(testBrainId, testThoughtId, {
                operations: [
                    {
                        path: '/name',
                        operationType: OperationType.Replace,
                        op: 'replace',
                        from: 'Test Thought',
                        value: 'Updated Test Thought'
                    }
                ]
            });
            
            const updatedThought = await api.thoughts.getThought(testBrainId, testThoughtId);
            expect(updatedThought).toBeDefined();
            expect(updatedThought.id).toBe(testThoughtId);
            expect(updatedThought.name).toBe('Updated Test Thought');
        });

        it('should delete a thought', async () => {
            await api.thoughts.deleteThought(testBrainId, testThoughtId);
            let errorMsg = '';
            try {
                await api.thoughts.getThought(testBrainId, testThoughtId);
                errorMsg = 'Expected error for deleted thought';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBeGreaterThanOrEqual(400);
                } else {
                    expect(err.message).toMatch(/not found|error|invalid/i);
                }
            }
            expect(errorMsg).toBe('');
        });
    });


    describe('Error Handling', () => {
        it('should handle invalid brain ID', async () => {
            const invalidBrainId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.thoughts.getThought(invalidBrainId, testThoughtId);
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

        it('should handle invalid thought ID', async () => {
            const invalidThoughtId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.thoughts.getThought(testBrainId, invalidThoughtId);
                errorMsg = 'Expected error for invalid thought ID';
            } catch (err: any) {
                if (err.response) {
                    expect(err.response.status).toBeGreaterThanOrEqual(400);
                } else {
                    expect(err.message).toMatch(/invalid|error|uuid/i);
                }
            }
            expect(errorMsg).toBe('');
        });
    });
}); 