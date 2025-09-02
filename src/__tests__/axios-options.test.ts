/** Tests for axios-options.test. */
import { describe, it, expect, vi } from 'vitest';
import axios, { AxiosInstance } from 'axios';
import { TheBrainApi } from '../index';

describe('TheBrainApi Axios options', () => {
    it('preserves extra axios configuration like headers and timeout', () => {
        const createSpy = vi.spyOn(axios, 'create');

        const fakeInstance = {
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        } as unknown as AxiosInstance;

        createSpy.mockReturnValue(fakeInstance);

        new TheBrainApi({
            apiKey: 'key',
            headers: { 'X-Test': 'value' },
            timeout: 1234,
        });

        expect(createSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                timeout: 1234,
                headers: expect.objectContaining({
                    'X-Test': 'value',
                    Authorization: 'Bearer key',
                }),
            })
        );

        createSpy.mockRestore();
    });
});

