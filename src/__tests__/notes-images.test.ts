/** Tests for notes-images.test. */
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { AxiosInstance } from 'axios';
import { NotesImagesApi } from '../notes-images';

describe('NotesImagesApi.getNoteImageAsDataUrl', () => {
    const text = 'test data';
    const arrayBuffer = new TextEncoder().encode(text).buffer;
    const expected = `data:image/png;base64,${Buffer.from(text).toString('base64')}`;

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('encodes using Buffer in Node environment', async () => {
        const bufferSpy = vi.spyOn(Buffer, 'from');
        vi.spyOn(NotesImagesApi.prototype, 'getNoteImage').mockResolvedValue(arrayBuffer);

        const api = new NotesImagesApi({} as AxiosInstance);
        const result = await api.getNoteImageAsDataUrl('b', 't', 'f', 'image/png');

        expect(result).toBe(expected);
        expect(bufferSpy).toHaveBeenCalled();
    });

    it('encodes using btoa in browser environment', async () => {
        const bufferSpy = vi.spyOn(Buffer, 'from');
        const btoaSpy = vi.fn((str: string) => Buffer.from(str, 'binary').toString('base64'));
        (globalThis as any).window = {};
        (globalThis as any).btoa = btoaSpy;
        vi.spyOn(NotesImagesApi.prototype, 'getNoteImage').mockResolvedValue(arrayBuffer);

        const api = new NotesImagesApi({} as AxiosInstance);
        const result = await api.getNoteImageAsDataUrl('b', 't', 'f', 'image/png');

        expect(result).toBe(expected);
        expect(btoaSpy).toHaveBeenCalled();
        // Should only call Buffer.from via our btoa implementation
        expect(bufferSpy).toHaveBeenCalledTimes(1);

        delete (globalThis as any).window;
        delete (globalThis as any).btoa;
    });
});

