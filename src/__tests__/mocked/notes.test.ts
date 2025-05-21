import { describe, it, expect, beforeEach } from 'vitest';
import { NotesApi } from '../../notes';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { NotesDto, NotesUpdateModel, EntityType } from '../../model';

describe('NotesApi', () => {
    let mock: MockAdapter;
    let api: NotesApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockThoughtId = '987fcdeb-51a2-43d7-9012-345678901234';

    const mockNote: NotesDto = {
        id: 'note-id-123',
        brainId: mockBrainId,
        sourceId: mockThoughtId,
        sourceType: EntityType.Thought,
        creationDateTime: '2024-03-20T10:00:00Z',
        modificationDateTime: '2024-03-20T10:00:00Z',
        markdown: '# Test Note\nThis is a test note.',
        html: '<h1>Test Note</h1><p>This is a test note.</p>',
        text: 'Test Note\nThis is a test note.'
    };

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new NotesApi(axios);
    });

    describe('getNoteMarkdown', () => {
        it('should get note content as markdown', async () => {
            mock.onGet(`/notes/${mockBrainId}/${mockThoughtId}`)
                .reply(200, mockNote);

            const result = await api.getNoteMarkdown(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockNote);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getNoteMarkdown(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getNoteHtml', () => {
        it('should get note content as HTML', async () => {
            mock.onGet(`/notes/${mockBrainId}/${mockThoughtId}/html`)
                .reply(200, mockNote);

            const result = await api.getNoteHtml(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockNote);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getNoteHtml(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getNoteText', () => {
        it('should get note content as plain text', async () => {
            mock.onGet(`/notes/${mockBrainId}/${mockThoughtId}/text`)
                .reply(200, mockNote);

            const result = await api.getNoteText(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockNote);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getNoteText(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('createOrUpdateNote', () => {
        it('should create or update a note', async () => {
            const updateModel: NotesUpdateModel = {
                markdown: '# Updated Note\nThis is an updated note.'
            };

            mock.onPost(`/notes/${mockBrainId}/${mockThoughtId}/update`)
                .reply(200, {
                    ...mockNote,
                    markdown: updateModel.markdown
                });

            const result = await api.createOrUpdateNote(mockBrainId, mockThoughtId, updateModel);
            expect(result.markdown).toBe(updateModel.markdown);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';
            const updateModel: NotesUpdateModel = {
                markdown: '# Updated Note\nThis is an updated note.'
            };

            await expect(api.createOrUpdateNote(invalidBrainId, invalidThoughtId, updateModel))
                .rejects
                .toThrow();
        });
    });

    describe('appendToNote', () => {
        it('should append content to a note', async () => {
            const contentToAppend = '\n\nAppended content.';
            const expectedMarkdown = mockNote.markdown + contentToAppend;
            const updateModel: NotesUpdateModel = { markdown: contentToAppend };

            mock.onPost(`/notes/${mockBrainId}/${mockThoughtId}/append`)
                .reply(200, {
                    ...mockNote,
                    markdown: expectedMarkdown
                });

            const result = await api.appendToNote(mockBrainId, mockThoughtId, contentToAppend);
            expect(result.markdown).toBe(expectedMarkdown);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';
            const contentToAppend = '\n\nAppended content.';

            await expect(api.appendToNote(invalidBrainId, invalidThoughtId, contentToAppend))
                .rejects
                .toThrow();
        });
    });
}); 