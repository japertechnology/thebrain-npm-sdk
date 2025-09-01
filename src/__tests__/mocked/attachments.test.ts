import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AttachmentsApi } from '../../attachments';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AttachmentDto, EntityType } from '../../model';

describe('AttachmentsApi', () => {
    let mock: MockAdapter;
    let api: AttachmentsApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockThoughtId = '987fcdeb-51a2-43d7-9012-345678901234';
    const mockAttachmentId = '456789ab-cdef-0123-4567-89abcdef0123';

    const mockAttachment: AttachmentDto = {
        id: mockAttachmentId,
        brainId: mockBrainId,
        sourceId: mockThoughtId,
        sourceType: EntityType.Thought,
        creationDateTime: '2024-03-20T10:00:00Z',
        modificationDateTime: '2024-03-20T10:00:00Z',
        name: 'test-attachment.pdf',
        position: 0,
        fileModificationDateTime: '2024-03-20T10:00:00Z',
        type: 1,
        isNotes: false,
        dataLength: 1024,
        location: '/path/to/file',
        typeId: null,
        label: null
    };

    beforeEach(() => {
        const instance = axios.create();
        mock = new MockAdapter(instance);
        api = new AttachmentsApi(instance);
    });

    afterEach(() => {
        mock.reset();
        mock.restore();
    });

    describe('getAttachmentDetails', () => {
        it('should get attachment details', async () => {
            mock.onGet(`/attachments/${mockBrainId}/${mockAttachmentId}/metadata`)
                .reply(200, mockAttachment);

            const result = await api.getAttachmentDetails(mockBrainId, mockAttachmentId);
            expect(result).toEqual(mockAttachment);
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidAttachmentId = 'invalid-uuid';

            await expect(api.getAttachmentDetails(invalidBrainId, mockAttachmentId))
                .rejects
                .toThrow();

            await expect(api.getAttachmentDetails(mockBrainId, invalidAttachmentId))
                .rejects
                .toThrow();
        });
    });

    describe('getAttachmentContent', () => {
        it('should get attachment content as blob', async () => {
            const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
            mock.onGet(`/attachments/${mockBrainId}/${mockAttachmentId}/file-content`)
                .reply(200, mockBlob, {
                    'content-type': 'application/pdf'
                });

            const result = await api.getAttachmentContent(mockBrainId, mockAttachmentId);
            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('application/pdf');
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidAttachmentId = 'invalid-uuid';

            await expect(api.getAttachmentContent(invalidBrainId, mockAttachmentId))
                .rejects
                .toThrow();

            await expect(api.getAttachmentContent(mockBrainId, invalidAttachmentId))
                .rejects
                .toThrow();
        });
    });

    describe('deleteAttachment', () => {
        it('should delete attachment', async () => {
            mock.onDelete(`/attachments/${mockBrainId}/${mockAttachmentId}`)
                .reply(200);

            await expect(api.deleteAttachment(mockBrainId, mockAttachmentId))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidAttachmentId = 'invalid-uuid';

            await expect(api.deleteAttachment(invalidBrainId, mockAttachmentId))
                .rejects
                .toThrow();

            await expect(api.deleteAttachment(mockBrainId, invalidAttachmentId))
                .rejects
                .toThrow();
        });
    });

    describe('addFileAttachment', () => {
        it('should add file attachment', async () => {
            const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
            mock.onPost(`/attachments/${mockBrainId}/${mockThoughtId}/file`)
                .reply(200);

            await expect(api.addFileAttachment(mockBrainId, mockThoughtId, mockFile))
                .resolves
                .not
                .toThrow();
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';
            const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

            await expect(api.addFileAttachment(invalidBrainId, mockThoughtId, mockFile))
                .rejects
                .toThrow();

            await expect(api.addFileAttachment(mockBrainId, invalidThoughtId, mockFile))
                .rejects
                .toThrow();
        });
    });

    describe('addUrlAttachment', () => {
        it('should add URL attachment without name', async () => {
            const url = 'https://example.com/test.pdf';
            let receivedParams: any;
            mock.onPost(`/attachments/${mockBrainId}/${mockThoughtId}/url`).reply((config) => {
                receivedParams = config.params;
                return [200];
            });

            await api.addUrlAttachment(mockBrainId, mockThoughtId, url);
            expect(receivedParams).toEqual({ url });
        });

        it('should add URL attachment with name', async () => {
            const url = 'https://example.com/test.pdf';
            const name = 'Custom Name';
            let receivedParams: any;
            mock.onPost(`/attachments/${mockBrainId}/${mockThoughtId}/url`).reply((config) => {
                receivedParams = config.params;
                return [200];
            });

            await api.addUrlAttachment(mockBrainId, mockThoughtId, url, name);
            expect(receivedParams).toEqual({ url, name });
        });

        it('should throw error on invalid parameters', async () => {
            const invalidBrainId = 'invalid-uuid';
            const invalidThoughtId = 'invalid-uuid';
            const url = 'https://example.com/test.pdf';

            await expect(api.addUrlAttachment(invalidBrainId, mockThoughtId, url))
                .rejects
                .toThrow();

            await expect(api.addUrlAttachment(mockBrainId, invalidThoughtId, url))
                .rejects
                .toThrow();
        });
    });
}); 