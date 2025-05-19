import { describe, it, expect, beforeEach } from 'vitest';
import { NotesImagesApi } from '../../notes-images';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('NotesImagesApi', () => {
    let mock: MockAdapter;
    let api: NotesImagesApi;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new NotesImagesApi(axios);
    });

    describe('getNoteImage', () => {
        it('should get note image as ArrayBuffer', async () => {
            const brainId = '123e4567-e89b-12d3-a456-426614174000';
            const token = 'test-token';
            const filename = 'test-image.jpg';
            const mockImageData = new ArrayBuffer(8);

            mock.onGet(`/notes-images/${brainId}/${token}/${filename}`)
                .reply(200, mockImageData, {
                    'content-type': 'image/jpeg'
                });

            const result = await api.getNoteImage(brainId, token, filename);
            expect(result).toBeInstanceOf(ArrayBuffer);
            expect(result).toEqual(mockImageData);
        });

        it('should throw error on invalid parameters', async () => {
            const brainId = 'invalid-uuid';
            const token = 'test-token';
            const filename = 'test-image.jpg';

            await expect(api.getNoteImage(brainId, token, filename))
                .rejects
                .toThrow();
        });
    });

    describe('getNoteImageAsDataUrl', () => {
        it('should convert image to base64 data URL', async () => {
            const brainId = '123e4567-e89b-12d3-a456-426614174000';
            const token = 'test-token';
            const filename = 'test-image.jpg';
            const mimeType = 'image/jpeg';
            const mockImageData = new ArrayBuffer(8);
            const mockImageArray = new Uint8Array(mockImageData);
            mockImageArray.fill(1); // Fill with some test data

            mock.onGet(`/notes-images/${brainId}/${token}/${filename}`)
                .reply(200, mockImageData, {
                    'content-type': mimeType
                });

            const result = await api.getNoteImageAsDataUrl(brainId, token, filename, mimeType);
            expect(result).toBe(`data:${mimeType};base64,${Buffer.from(mockImageData).toString('base64')}`);
        });

        it('should throw error on invalid parameters', async () => {
            const brainId = 'invalid-uuid';
            const token = 'test-token';
            const filename = 'test-image.jpg';
            const mimeType = 'image/jpeg';

            await expect(api.getNoteImageAsDataUrl(brainId, token, filename, mimeType))
                .rejects
                .toThrow();
        });
    });
}); 