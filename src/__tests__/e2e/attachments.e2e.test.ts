import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { AttachmentDto, EntityType, ThoughtKind, ThoughtCreateModel } from '../../model';
import axios from 'axios';

let testBrainId: string;
let testThoughtId: string;
let testAttachmentId: string;

// Store serializable config for use in each test
let helper: TestHelper;
let api: TheBrainApi;

describe('Attachments API E2E', () => {
    beforeAll(async () => {

        helper = new TestHelper();
        api = helper.api;
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain E2E');
        testBrainId = brain.id!;
        // Create a test thought
        const thought = await api.thoughts.createThought(testBrainId, {
            name: 'Test Thought for Attachments',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel);
        testThoughtId = thought.id!;
        
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('File Attachments', () => {
        it('should add and retrieve a file attachment', async () => {
            const fileContent = 'Test file content';
            const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
            const attachment = await api.attachments.addFileAttachment(testBrainId, testThoughtId, file);
            expect(attachment).toBeDefined();
            expect(attachment.id).toBeDefined();
            testAttachmentId = attachment.id;
            
            const attachmentDetails = await api.attachments.getAttachmentDetails(testBrainId, testAttachmentId);
            expect(attachmentDetails).toBeDefined();
            expect(attachmentDetails.name).toBe('test.txt');
            expect(attachmentDetails.type).toBe(1); // File type
            
            const content = await api.attachments.getAttachmentContent(testBrainId, testAttachmentId);
            expect(content).toBeInstanceOf(Blob);
            expect(content.type).toBe('text/plain');
        });

        it('should delete a file attachment', async () => {
            expect(testAttachmentId).toBeDefined();
            await api.attachments.deleteAttachment(testBrainId, testAttachmentId);
            let errorMsg = '';
            try {
                await api.attachments.getAttachmentDetails(testBrainId, testAttachmentId);
                errorMsg = 'Expected error for deleted attachment';
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

    describe('URL Attachments', () => {
        it('should add and retrieve a URL attachment', async () => {
            const url = 'https://example.com/test.pdf';
            const name = 'Test PDF';
            const attachment = await api.attachments.addUrlAttachment(testBrainId, testThoughtId, url, name);
            expect(attachment).toBeDefined();
            expect(attachment.id).toBeDefined();
            testAttachmentId = attachment.id;
            
            const attachmentDetails = await api.attachments.getAttachmentDetails(testBrainId, testAttachmentId);
            expect(attachmentDetails).toBeDefined();
            expect(attachmentDetails.name).toBe(name);
            expect(attachmentDetails.type).toBe(2); // URL type
        });

        it('should delete a URL attachment', async () => {
            expect(testAttachmentId).toBeDefined();
            await api.attachments.deleteAttachment(testBrainId, testAttachmentId);
            let errorMsg = '';
            try {
                await api.attachments.getAttachmentDetails(testBrainId, testAttachmentId);
                errorMsg = 'Expected error for deleted attachment';
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
                await api.attachments.getAttachmentDetails(invalidBrainId, testThoughtId);
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
                await api.attachments.getAttachmentDetails(testBrainId, invalidThoughtId);
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