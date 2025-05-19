import { describe, it, expect, beforeEach } from 'vitest';
import { BrainsApi } from '../../brains';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('BrainsApi', () => {
    let mock: MockAdapter;
    let api: BrainsApi;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new BrainsApi(axios);
    });

    describe('getBrains', () => {
        it('should return an array of brains', async () => {
            const mockBrains = [
                {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Test Brain',
                    homeThoughtId: '123e4567-e89b-12d3-a456-426614174001'
                }
            ];

            mock.onGet('/brains').reply(200, mockBrains);

            const result = await api.getBrains();
            expect(result).toEqual(mockBrains);
        });

        it('should handle empty response', async () => {
            mock.onGet('/brains').reply(200, []);

            const result = await api.getBrains();
            expect(result).toEqual([]);
        });

        it('should handle errors', async () => {
            mock.onGet('/brains').reply(500);

            await expect(api.getBrains()).rejects.toThrow();
        });
    });

    describe('getBrain', () => {
        it('should return a single brain', async () => {
            const mockBrain = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Brain',
                homeThoughtId: '123e4567-e89b-12d3-a456-426614174001'
            };

            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000').reply(200, mockBrain);

            const result = await api.getBrain('123e4567-e89b-12d3-a456-426614174000');
            expect(result).toEqual(mockBrain);
        });

        it('should handle not found', async () => {
            mock.onGet('/brains/non-existent-id').reply(404);

            await expect(api.getBrain('non-existent-id')).rejects.toThrow();
        });
    });

    describe('createBrain', () => {
        it('should create a new brain', async () => {
            const mockResponse = [{
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'New Brain',
                homeThoughtId: '123e4567-e89b-12d3-a456-426614174001'
            }];

            mock.onPost('/brains').reply(200, mockResponse);

            const result = await api.createBrain('New Brain');
            expect(result).toEqual(mockResponse);
        });

        it('should handle creation error', async () => {
            mock.onPost('/brains').reply(400);

            await expect(api.createBrain('')).rejects.toThrow();
        });
    });

    describe('deleteBrain', () => {
        it('should delete a brain successfully', async () => {
            mock.onDelete('/brains/123e4567-e89b-12d3-a456-426614174000').reply(200);

            await expect(api.deleteBrain('123e4567-e89b-12d3-a456-426614174000')).resolves.not.toThrow();
        });

        it('should handle deletion error', async () => {
            mock.onDelete('/brains/123e4567-e89b-12d3-a456-426614174000').reply(403);

            await expect(api.deleteBrain('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow();
        });
    });

    describe('getBrainStats', () => {
        it('should return brain statistics', async () => {
            const mockStats = {
                brainName: 'Test Brain',
                dateGenerated: '2024-03-20T12:00:00Z',
                brainId: '123e4567-e89b-12d3-a456-426614174000',
                thoughts: 100,
                forgottenThoughts: 10,
                links: 200,
                linksPerThought: 2,
                thoughtTypes: 5,
                linkTypes: 3,
                tags: 15,
                notes: 50,
                internalFiles: 20,
                internalFolders: 5,
                externalFiles: 10,
                externalFolders: 2,
                webLinks: 30,
                assignedIcons: 25,
                internalFilesSize: 1024,
                iconsFilesSize: 512
            };

            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000/statistics').reply(200, mockStats);

            const result = await api.getBrainStats('123e4567-e89b-12d3-a456-426614174000');
            expect(result).toEqual(mockStats);
        });

        it('should handle statistics error', async () => {
            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000/statistics').reply(400);

            await expect(api.getBrainStats('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow();
        });
    });

    describe('getBrainModifications', () => {
        it('should return brain modifications with default parameters', async () => {
            const mockModifications = [
                {
                    sourceId: '123e4567-e89b-12d3-a456-426614174000',
                    sourceType: 1,
                    modType: 101,
                    userId: '123e4567-e89b-12d3-a456-426614174002',
                    brainId: '123e4567-e89b-12d3-a456-426614174000',
                    creationDateTime: '2024-03-20T12:00:00Z',
                    modificationDateTime: '2024-03-20T12:00:00Z'
                }
            ];

            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000/modifications', {
                params: { maxLogs: '100' }
            }).reply(200, mockModifications);

            const result = await api.getBrainModifications('123e4567-e89b-12d3-a456-426614174000');
            expect(result).toEqual(mockModifications);
        });

        it('should return brain modifications with custom parameters', async () => {
            const mockModifications = [
                {
                    sourceId: '123e4567-e89b-12d3-a456-426614174000',
                    sourceType: 1,
                    modType: 101,
                    userId: '123e4567-e89b-12d3-a456-426614174002',
                    brainId: '123e4567-e89b-12d3-a456-426614174000',
                    creationDateTime: '2024-03-20T12:00:00Z',
                    modificationDateTime: '2024-03-20T12:00:00Z'
                }
            ];

            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000/modifications', {
                params: { 
                    maxLogs: '50',
                    startTime: '2024-03-19T00:00:00Z',
                    endTime: '2024-03-20T00:00:00Z'
                }
            }).reply(200, mockModifications);

            const result = await api.getBrainModifications(
                '123e4567-e89b-12d3-a456-426614174000',
                50,
                '2024-03-19T00:00:00Z',
                '2024-03-20T00:00:00Z'
            );
            expect(result).toEqual(mockModifications);
        });

        it('should handle modifications error', async () => {
            mock.onGet('/brains/123e4567-e89b-12d3-a456-426614174000/modifications').reply(400);

            await expect(api.getBrainModifications('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow();
        });
    });
});
