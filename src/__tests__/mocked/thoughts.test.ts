import { describe, it, expect, beforeEach } from 'vitest';
import { ThoughtsApi } from '../../thoughts';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ThoughtDto, ThoughtCreateModel, ThoughtDtoJsonPatchDocument, ThoughtKind, OperationType } from '../../model';

describe('ThoughtsApi', () => {
    let mock: MockAdapter;
    let api: ThoughtsApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockThoughtId = '987fcdeb-51a2-43d7-9012-345678901234';

    const mockThought: ThoughtDto = {
        id: mockThoughtId,
        brainId: mockBrainId,
        creationDateTime: '2024-03-20T10:00:00Z',
        modificationDateTime: '2024-03-20T10:00:00Z',
        name: 'Test Thought',
        cleanedUpName: 'test-thought',
        typeId: null,
        displayModificationDateTime: null,
        forgottenDateTime: null,
        linksModificationDateTime: null,
        acType: 0,
        kind: ThoughtKind.Normal,
        label: 'Test Label',
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        sourceThoughtId: null,
        relation: null,
        position: null
    };

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new ThoughtsApi(axios);
    });

    describe('getThought', () => {
        it('should get thought details', async () => {
            mock.onGet(`/thoughts/${mockBrainId}/${mockThoughtId}`)
                .reply(200, mockThought);

            const result = await api.getThought(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockThought);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getThought(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('updateThought', () => {
        it('should update thought', async () => {
            const updateOperations: ThoughtDtoJsonPatchDocument = {
                operations: [{
                    value: 'Updated Name',
                    operationType: OperationType.Replace,
                    path: '/name',
                    op: 'replace',
                    from: null
                }],
                contractResolver: null
            };

            mock.onPatch(`/thoughts/${mockBrainId}/${mockThoughtId}`)
                .reply(200);

            await expect(api.updateThought(mockBrainId, mockThoughtId, updateOperations))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';
            const updateOperations: ThoughtDtoJsonPatchDocument = {
                operations: [{
                    value: 'Updated Name',
                    operationType: OperationType.Replace,
                    path: '/name',
                    op: 'replace',
                    from: null
                }],
                contractResolver: null
            };

            await expect(api.updateThought(invalidBrainId, invalidThoughtId, updateOperations))
                .rejects
                .toThrow();
        });
    });

    describe('deleteThought', () => {
        it('should delete thought', async () => {
            mock.onDelete(`/thoughts/${mockBrainId}/${mockThoughtId}`)
                .reply(200);

            await expect(api.deleteThought(mockBrainId, mockThoughtId))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.deleteThought(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getThoughtGraph', () => {
        it('should get thought graph', async () => {
            const mockGraph = {
                activeThought: mockThought,
                parents: [],
                children: [],
                jumps: [],
                siblings: [],
                tags: [],
                type: null,
                links: [],
                attachments: []
            };

            mock.onGet(`/thoughts/${mockBrainId}/${mockThoughtId}/graph`)
                .reply(200, mockGraph);

            const result = await api.getThoughtGraph(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockGraph);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getThoughtGraph(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getThoughtAttachments', () => {
        it('should get thought attachments', async () => {
            const mockAttachments = [{
                id: 'attachment-id',
                brainId: mockBrainId,
                sourceId: mockThoughtId,
                sourceType: 2,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                name: 'Test Attachment',
                position: 0,
                fileModificationDateTime: null,
                type: 1,
                isNotes: false,
                dataLength: 1000,
                location: null
            }];

            mock.onGet(`/thoughts/${mockBrainId}/${mockThoughtId}/attachments`)
                .reply(200, mockAttachments);

            const result = await api.getThoughtAttachments(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockAttachments);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getThoughtAttachments(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('createThought', () => {
        it('should create thought', async () => {
            const createModel: ThoughtCreateModel = {
                id: 'new-thought-id',
                brainId: mockBrainId,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                name: 'New Thought',
                cleanedUpName: 'new-thought',
                kind: ThoughtKind.Normal,
                label: 'New Label',
                sourceThoughtId: mockThoughtId,
                relation: 1,
                acType: 0,
                typeId: null,
                position: null
            };

            const mockResponse = {
                id: 'new-thought-id'
            };

            mock.onPost(`/thoughts/${mockBrainId}`)
                .reply(200, mockResponse);

            const result = await api.createThought(mockBrainId, createModel);
            expect(result).toEqual(mockResponse);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const createModel: ThoughtCreateModel = {
                id: 'new-thought-id',
                brainId: mockBrainId,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                name: 'New Thought',
                cleanedUpName: 'new-thought',
                kind: ThoughtKind.Normal,
                label: 'New Label',
                sourceThoughtId: mockThoughtId,
                relation: 1,
                acType: 0,
                typeId: null,
                position: null
            };

            await expect(api.createThought(invalidBrainId, createModel))
                .rejects
                .toThrow();
        });
    });

    describe('pinThought', () => {
        it('should pin thought', async () => {
            mock.onPost(`/thoughts/${mockBrainId}/${mockThoughtId}/pin`)
                .reply(200);

            await expect(api.pinThought(mockBrainId, mockThoughtId))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.pinThought(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('unpinThought', () => {
        it('should unpin thought', async () => {
            mock.onDelete(`/thoughts/${mockBrainId}/${mockThoughtId}/pin`)
                .reply(200);

            await expect(api.unpinThought(mockBrainId, mockThoughtId))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.unpinThought(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getPinnedThoughts', () => {
        it('should get pinned thoughts', async () => {
            const mockPinnedThoughts = [mockThought];

            mock.onGet(`/thoughts/${mockBrainId}/pins`)
                .reply(200, mockPinnedThoughts);

            const result = await api.getPinnedThoughts(mockBrainId);
            expect(result).toEqual(mockPinnedThoughts);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';

            await expect(api.getPinnedThoughts(invalidBrainId))
                .rejects
                .toThrow();
        });
    });

    describe('getThoughtModifications', () => {
        it('should get thought modifications', async () => {
            const mockModifications = [{
                sourceId: mockThoughtId,
                sourceType: 2,
                extraAId: null,
                extraAType: -1,
                extraBId: null,
                extraBType: -1,
                modType: 101,
                oldValue: null,
                newValue: null,
                userId: 'user-id',
                brainId: mockBrainId,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                syncUpdateDateTime: null
            }];

            mock.onGet(`/thoughts/${mockBrainId}/${mockThoughtId}/modifications`)
                .reply(200, mockModifications);

            const result = await api.getThoughtModifications(mockBrainId, mockThoughtId);
            expect(result).toEqual(mockModifications);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';

            await expect(api.getThoughtModifications(invalidBrainId, invalidThoughtId))
                .rejects
                .toThrow();
        });
    });

    describe('getTypes', () => {
        it('should get types', async () => {
            const mockTypes = [mockThought];

            mock.onGet(`/thoughts/${mockBrainId}/types`)
                .reply(200, mockTypes);

            const result = await api.getTypes(mockBrainId);
            expect(result).toEqual(mockTypes);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';

            await expect(api.getTypes(invalidBrainId))
                .rejects
                .toThrow();
        });
    });

    describe('getTags', () => {
        it('should get tags', async () => {
            const mockTags = [mockThought];

            mock.onGet(`/thoughts/${mockBrainId}/tags`)
                .reply(200, mockTags);

            const result = await api.getTags(mockBrainId);
            expect(result).toEqual(mockTags);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';

            await expect(api.getTags(invalidBrainId))
                .rejects
                .toThrow();
        });
    });
}); 