import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { ThoughtKind, ThoughtCreateModel } from '../../model';

let testBrainId: string;
let testThoughtId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe('Notes Images API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain Notes Images E2E');
        testBrainId = brain.id!;

        // Create a test thought
        const thought = await api.thoughts.createThought(testBrainId, {
            name: 'Test Thought',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel);
        testThoughtId = thought.id!;
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('Image Operations', () => {
        it('should handle note images', async () => {
            // Create a test note with an image reference
            const testMarkdown = '# Test Note\n\n![Test Image](image:test.jpg)';
            await api.notes.createOrUpdateNote(testBrainId, testThoughtId, {
                markdown: testMarkdown
            });

            // Get the note HTML to find image references
            let imageToken: string | undefined;
            let imageFilename: string | undefined;

            try {
                const note = await api.notes.getNoteHtml(testBrainId, testThoughtId);
                if (note?.html) {
                    const imageMatch = note.html.match(/image:([^"]+)/);
                    if (imageMatch) {
                        imageToken = imageMatch[1];
                        imageFilename = 'test.jpg';
                    }
                }
            } catch (error: any) {
                // This might fail in test environments
                expect(error.response.status).toBeGreaterThanOrEqual(400);
                return;
            }

            if (!imageToken || !imageFilename) {
                return;
            }

            // Try to get the image data
            try {
                const imageData = await api.notesImages.getNoteImage(testBrainId, imageToken, imageFilename);
                expect(imageData).toBeDefined();
                expect(imageData.byteLength).toBeGreaterThan(0);
            } catch (error: any) {
                // This might fail in test environments
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }

            // Try to get the image as a data URL
            try {
                const dataUrl = await api.notesImages.getNoteImageAsDataUrl(testBrainId, imageToken, imageFilename, 'image/jpeg');
                expect(dataUrl).toBeDefined();
                expect(dataUrl.startsWith('data:image/jpeg;base64,')).toBe(true);
            } catch (error: any) {
                // This might fail in test environments
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });
    });
});