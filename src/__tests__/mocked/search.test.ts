import { describe, it, expect, beforeEach } from 'vitest';
import { SearchApi } from '../../search';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { SearchResultDto, SearchResultType, EntityType } from '../../model';

describe('SearchApi', () => {
    let mock: MockAdapter;
    let api: SearchApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockQueryText = 'test query';

    const mockSearchResult: SearchResultDto = {
        id: '987fcdeb-51a2-43d7-9012-345678901234',
        type: 'thought',
        name: 'Test Thought',
        brainId: mockBrainId,
        brainName: 'Test Brain',
        matchType: 'name',
        matchText: 'test',
        matchPosition: 0,
        matchLength: 4,
        score: 0.8,
        created: '2024-03-20T10:00:00Z',
        modified: '2024-03-20T10:00:00Z',
        url: null,
        contentType: null,
        size: null,
        parentThoughtId: null,
        parentThoughtName: null,
        sourceThought: null,
        sourceLink: null,
        searchResultType: SearchResultType.Thought,
        isFromOtherBrain: false,
        attachmentId: null,
        entityType: EntityType.Thought,
        sourceType: EntityType.Thought
    };

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new SearchApi(axios);
    });

    describe('searchInBrain', () => {
        it('should search within a specific brain with default options', async () => {
            mock.onGet(`/search/${mockBrainId}`, {
                params: {
                    queryText: mockQueryText,
                    maxResults: 30,
                    onlySearchThoughtNames: false
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchInBrain(mockBrainId, mockQueryText);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should search within a specific brain with custom options', async () => {
            const options = {
                maxResults: 50,
                onlySearchThoughtNames: true
            };

            mock.onGet(`/search/${mockBrainId}`, {
                params: {
                    queryText: mockQueryText,
                    maxResults: options.maxResults,
                    onlySearchThoughtNames: options.onlySearchThoughtNames
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchInBrain(mockBrainId, mockQueryText, options);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';

            await expect(api.searchInBrain(invalidBrainId, mockQueryText))
                .rejects
                .toThrow();
        });
    });

    describe('searchPublic', () => {
        it('should search across public brains with default options', async () => {
            mock.onGet('/search/public', {
                params: {
                    queryText: mockQueryText,
                    maxResults: 30,
                    onlySearchThoughtNames: false,
                    excludeBrainIds: []
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchPublic(mockQueryText);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should search across public brains with custom options', async () => {
            const options = {
                maxResults: 50,
                onlySearchThoughtNames: true,
                excludeBrainIds: ['11111111-1111-1111-1111-111111111111']
            };

            mock.onGet('/search/public', {
                params: {
                    queryText: mockQueryText,
                    maxResults: options.maxResults,
                    onlySearchThoughtNames: options.onlySearchThoughtNames,
                    excludeBrainIds: options.excludeBrainIds
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchPublic(mockQueryText, options);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidOptions = {
                excludeBrainIds: ['invalid-uuid']
            };

            await expect(api.searchPublic(mockQueryText, invalidOptions))
                .rejects
                .toThrow();
        });
    });

    describe('searchAccessible', () => {
        it('should search across accessible brains with default options', async () => {
            mock.onGet('/search/accessible', {
                params: {
                    queryText: mockQueryText,
                    maxResults: 30,
                    onlySearchThoughtNames: false
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchAccessible(mockQueryText);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should search across accessible brains with custom options', async () => {
            const options = {
                maxResults: 50,
                onlySearchThoughtNames: true
            };

            mock.onGet('/search/accessible', {
                params: {
                    queryText: mockQueryText,
                    maxResults: options.maxResults,
                    onlySearchThoughtNames: options.onlySearchThoughtNames
                }
            }).reply(200, [mockSearchResult]);

            const result = await api.searchAccessible(mockQueryText, options);
            expect(result).toEqual([mockSearchResult]);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidOptions = {
                maxResults: -1
            };

            await expect(api.searchAccessible(mockQueryText, invalidOptions))
                .rejects
                .toThrow();
        });
    });
}); 