/** Tests for links.test. */
import { describe, it, expect, beforeEach } from 'vitest';
import { LinksApi } from '../../links';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { LinkDto, LinkCreateModel, LinkDtoJsonPatchDocument, OperationType } from '../../model';

describe('LinksApi', () => {
    let mock: MockAdapter;
    let api: LinksApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockLinkId = '987fcdeb-51a2-43d7-9012-345678901234';
    const mockThoughtIdA = '11111111-1111-1111-1111-111111111111';
    const mockThoughtIdB = '22222222-2222-2222-2222-222222222222';

    const mockLink: LinkDto = {
        id: mockLinkId,
        brainId: mockBrainId,
        creationDateTime: '2024-03-20T10:00:00Z',
        modificationDateTime: '2024-03-20T10:00:00Z',
        name: 'Test Link',
        cleanedUpName: 'test-link',
        typeId: null,
        kind: 1,
        color: '#ff0000',
        thickness: 2,
        thoughtIdA: mockThoughtIdA,
        thoughtIdB: mockThoughtIdB,
        relation: 1,
        direction: 1,
        meaning: 1,
        label: null,
        position: null
    };

    beforeEach(() => {
        mock = new MockAdapter(axios);
        api = new LinksApi(axios);
    });

    describe('getLinks', () => {
        it('should get all links for a brain', async () => {
            mock.onGet(`/links/${mockBrainId}`)
                .reply(200, [mockLink]);

            const result = await api.getLinks(mockBrainId);
            expect(result).toEqual([mockLink]);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';

            await expect(api.getLinks(invalidBrainId))
                .rejects
                .toThrow();
        });
    });

    describe('getLink', () => {
        it('should get a specific link', async () => {
            mock.onGet(`/links/${mockBrainId}/${mockLinkId}`)
                .reply(200, mockLink);

            const result = await api.getLink(mockBrainId, mockLinkId);
            expect(result).toEqual(mockLink);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidLinkId = 'invalid-uuid';

            await expect(api.getLink(invalidBrainId, invalidLinkId))
                .rejects
                .toThrow();
        });
    });

    describe('createLink', () => {
        it('should create a new link', async () => {
            const createModel: LinkCreateModel = {
                id: 'new-link-id',
                brainId: mockBrainId,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                name: 'New Link',
                cleanedUpName: 'new-link',
                thoughtIdA: mockThoughtIdA,
                thoughtIdB: mockThoughtIdB,
                relation: 1,
                typeId: null,
                label: null,
                position: null
            };

            const mockResponse = {
                id: 'new-link-id'
            };

            mock.onPost(`/links/${mockBrainId}`)
                .reply(200, mockResponse);

            const result = await api.createLink(mockBrainId, createModel);
            expect(result).toEqual(mockResponse);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const createModel: LinkCreateModel = {
                id: 'new-link-id',
                brainId: mockBrainId,
                creationDateTime: '2024-03-20T10:00:00Z',
                modificationDateTime: '2024-03-20T10:00:00Z',
                name: 'New Link',
                cleanedUpName: 'new-link',
                thoughtIdA: mockThoughtIdA,
                thoughtIdB: mockThoughtIdB,
                relation: 1,
                typeId: null,
                label: null,
                position: null
            };

            await expect(api.createLink(invalidBrainId, createModel))
                .rejects
                .toThrow();
        });
    });

    describe('updateLink', () => {
        it('should update a link', async () => {
            const updateOperations: LinkDtoJsonPatchDocument = {
                operations: [{
                    value: 'Updated Name',
                    operationType: OperationType.Replace,
                    path: '/name',
                    op: 'replace',
                    from: null
                }],
                contractResolver: null
            };

            mock.onPatch(`/links/${mockBrainId}/${mockLinkId}`)
                .reply(200);

            await expect(api.updateLink(mockBrainId, mockLinkId, updateOperations))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error when operations are undefined', async () => {
            await expect(api.updateLink(mockBrainId, mockLinkId, undefined as any))
                .rejects
                .toThrow('Operations array is required and cannot be empty');
        });

        it('should throw error when operations array is empty', async () => {
            await expect(api.updateLink(mockBrainId, mockLinkId, [] as any))
                .rejects
                .toThrow('Operations array is required and cannot be empty');
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidLinkId = 'invalid-uuid';
            const updateOperations: LinkDtoJsonPatchDocument = {
                operations: [{
                    value: 'Updated Name',
                    operationType: OperationType.Replace,
                    path: '/name',
                    op: 'replace',
                    from: null
                }],
                contractResolver: null
            };

            await expect(api.updateLink(invalidBrainId, invalidLinkId, updateOperations))
                .rejects
                .toThrow();
        });
    });

    describe('deleteLink', () => {
        it('should delete a link', async () => {
            mock.onDelete(`/links/${mockBrainId}/${mockLinkId}`)
                .reply(200);

            await expect(api.deleteLink(mockBrainId, mockLinkId))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidLinkId = 'invalid-uuid';

            await expect(api.deleteLink(invalidBrainId, invalidLinkId))
                .rejects
                .toThrow();
        });
    });

    describe('getLinkAttachments', () => {
        it('should get link attachments', async () => {
            const mockAttachments = [{
                id: 'attachment-id',
                brainId: mockBrainId,
                sourceId: mockLinkId,
                sourceType: 3,
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

            mock.onGet(`/links/${mockBrainId}/${mockLinkId}/attachments`)
                .reply(200, mockAttachments);

            const result = await api.getLinkAttachments(mockBrainId, mockLinkId);
            expect(result).toEqual(mockAttachments);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidLinkId = 'invalid-uuid';

            await expect(api.getLinkAttachments(invalidBrainId, invalidLinkId))
                .rejects
                .toThrow();
        });
    });
}); 