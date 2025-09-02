/** Tests for notes.e2e.test. */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { ThoughtKind, ThoughtCreateModel } from '../../model';

let testBrainId: string;
let testThoughtId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Notes API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain Notes E2E');
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

    describe('Note Operations', () => {
        it('should create and update a note', async () => {
            const testMarkdown = '# Test Note\n\nThis is a test note.';
            
            // Create/update the note
            await api.notes.createOrUpdateNote(testBrainId, testThoughtId, {
                markdown: testMarkdown
            });

            // Wait for note creation to complete and verify
            let note = null;
            let attempts = 0;
            const maxAttempts = 10;
            const delayMs = 2000; // Reduced delay between attempts
            
            while (attempts < maxAttempts) {
                try {
                    note = await api.notes.getNoteMarkdown(testBrainId, testThoughtId);
                    if (note?.markdown === testMarkdown) {
                        break;
                    }
                } catch (err) {
                    // Log error but continue retrying
                    console.error(`Attempt ${attempts + 1} failed:`, err);
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(res => setTimeout(res, delayMs));
                }
            }

            expect(note).toBeDefined();
            expect((note?.markdown ?? '').replace(/\r\n/g, '\n')).toBe(testMarkdown);
        }, 60000);

        it('should append content to a note', async () => {
            const initialContent = '# Test Note\n\nThis is a test note.';
            const additionalContent = '\n\nThis is additional content.';
            const expectedContent = initialContent + additionalContent;

            // First create the initial note
            await api.notes.createOrUpdateNote(testBrainId, testThoughtId, {
                markdown: initialContent
            });

            // Wait for initial note to be created
            await new Promise(res => setTimeout(res, 2000));

            // Append content
            await api.notes.appendToNote(testBrainId, testThoughtId, additionalContent);

            // Verify the final content
            let note = null;
            let attempts = 0;
            const maxAttempts = 10;
            const delayMs = 2000; // Reduced delay between attempts
            
            while (attempts < maxAttempts) {
                try {
                    note = await api.notes.getNoteMarkdown(testBrainId, testThoughtId);
                    if (note?.markdown === expectedContent) {
                        break;
                    }
                } catch (err) {
                    // Log error but continue retrying
                    console.error(`Attempt ${attempts + 1} failed:`, err);
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(res => setTimeout(res, delayMs));
                }
            }

            expect(note).toBeDefined();
            expect((note?.markdown ?? '').replace(/\r\n/g, '\n')).toBe(expectedContent);
        }, 60000);
    });
}); 