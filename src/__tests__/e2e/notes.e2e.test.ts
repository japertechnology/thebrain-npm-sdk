import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { loadConfig } from './config';
import { TestHelper } from './helpers';
import { ThoughtKind, ThoughtCreateModel } from '../../model';

let testBrainId: string;
let testThoughtId: string;
let helper: TestHelper;
let api: TheBrainApi;

describe('Notes API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
        
        // Create a test brain
        const brain = await helper.createTestBrain('Test Brain Notes E2E');
        testBrainId = brain.id!;
        console.log('Created test brain:', testBrainId);

        // Create a test thought
        const thought = await api.thoughts.createThought(testBrainId, {
            name: 'Test Thought with Notes',
            kind: ThoughtKind.Normal
        } as ThoughtCreateModel);
        testThoughtId = thought.id!;
        console.log('Created test thought:', testThoughtId);
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    describe('Note Content Operations', () => {
        const testMarkdown = '# Test Note\n\nThis is a test note with **bold** and *italic* text.';
        const expectedHtml = '<h1>Test Note</h1>\n<p>This is a test note with <strong>bold</strong> and <em>italic</em> text.</p>';
        const expectedText = 'Test Note\n\nThis is a test note with bold and italic text.';

        it('should create and update a note', async () => {
            // Create initial note
            console.log('Creating note with markdown:', testMarkdown);
            const res = await api.notes.createOrUpdateNote(testBrainId, testThoughtId, {
                markdown: testMarkdown
            });
            console.log('createOrUpdateNote response:', res);

            // Wait for note creation to complete
            console.log('Waiting 5 seconds for note creation to complete...');
            await new Promise(res => setTimeout(res, 5000));

            // Retry loop for eventual consistency
            let note = null;
            let attempts = 0;
            const maxAttempts = 15;
            let lastError;
            while (attempts < maxAttempts) {
                try {
                    console.log(`Attempt ${attempts + 1}/${maxAttempts} to get note markdown`);
                    note = await api.notes.getNoteMarkdown(testBrainId, testThoughtId);
                    console.log('Retrieved note:', note);
                    // Normalize line endings for comparison
                    const normalizedReceived = note?.markdown?.replace(/\r\n/g, '\n') ?? '';
                    const normalizedExpected = testMarkdown.replace(/\r\n/g, '\n');
                    if (normalizedReceived === normalizedExpected) {
                        console.log('Successfully retrieved matching markdown content');
                        break;
                    } else {
                        console.log('Retrieved markdown does not match expected content');
                    }
                } catch (err) {
                    lastError = err;
                    console.log('getNoteMarkdown error:', err);
                }
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`Waiting 5000ms before next attempt...`);
                    await new Promise(res => setTimeout(res, 5000));
                }
            }
            if (lastError) {
                console.log('Last error after all attempts:', lastError);
            }
            expect(note).not.toBeNull();
            // Normalize line endings for comparison
            expect(note?.markdown?.replace(/\r\n/g, '\n') ?? '').toBe(testMarkdown.replace(/\r\n/g, '\n'));
        }, 90000);

        it('should append content to a note', async () => {
            const additionalContent = '\n\n## New Section\n\nThis is appended content.';
            const expectedMarkdown = testMarkdown + additionalContent;

            console.log('Appending content:', additionalContent);
            const appendRes = await api.notes.appendToNote(testBrainId, testThoughtId, additionalContent);
            console.log('appendToNote response:', appendRes);

            // Wait for append to complete
            console.log('Waiting 5 seconds for append to complete...');
            await new Promise(res => setTimeout(res, 5000));

            // Retry loop for eventual consistency
            let note = null;
            let attempts = 0;
            const maxAttempts = 15;
            let lastError;
            while (attempts < maxAttempts) {
                try {
                    console.log(`Attempt ${attempts + 1}/${maxAttempts} to get note markdown after append`);
                    note = await api.notes.getNoteMarkdown(testBrainId, testThoughtId);
                    console.log('Retrieved note after append:', note);
                    // Normalize line endings for comparison
                    const normalizedReceived = note?.markdown?.replace(/\r\n/g, '\n') ?? '';
                    const normalizedExpected = expectedMarkdown.replace(/\r\n/g, '\n');
                    if (normalizedReceived === normalizedExpected) {
                        console.log('Successfully retrieved matching markdown content after append');
                        break;
                    } else {
                        console.log('Retrieved markdown does not match expected content after append');
                    }
                } catch (err) {
                    lastError = err;
                    console.log('getNoteMarkdown error after append:', err);
                }
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`Waiting 5000ms before next attempt...`);
                    await new Promise(res => setTimeout(res, 5000));
                }
            }
            if (lastError) {
                console.log('Last error after all attempts:', lastError);
            }
            expect(note).not.toBeNull();
            // Normalize line endings for comparison
            expect(note?.markdown?.replace(/\r\n/g, '\n') ?? '').toBe(expectedMarkdown.replace(/\r\n/g, '\n'));
        }, 90000); // Increase timeout to 90 seconds

        it('should handle empty notes', async () => {
            // Create a new thought without a note
            const emptyThought = await api.thoughts.createThought(testBrainId, {
                name: 'Empty Note Thought',
                kind: ThoughtKind.Normal
            } as ThoughtCreateModel);

            // Getting note content should return empty note
            const note = await api.notes.getNoteMarkdown(testBrainId, emptyThought.id!);
            expect(note).not.toBeNull();
            expect(note.markdown).toBe('');
        });

        it('should handle invalid brain ID', async () => {
            const invalidBrainId = 'invalid-uuid';
            let errorMsg = '';
            try {
                await api.notes.getNoteMarkdown(invalidBrainId, testThoughtId);
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
                await api.notes.getNoteMarkdown(testBrainId, invalidThoughtId);
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

        it('should handle non-existent notes', async () => {
            // Create a new thought without a note
            const newThought = await api.thoughts.createThought(testBrainId, {
                name: 'No Note Thought',
                kind: ThoughtKind.Normal
            } as ThoughtCreateModel);

            // Getting note content should return empty note
            const note = await api.notes.getNoteMarkdown(testBrainId, newThought.id!);
            expect(note).not.toBeNull();
            expect(note.markdown).toBe('');
        });
    });
}); 