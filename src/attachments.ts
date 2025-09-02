import { AxiosInstance } from "axios";
import { AttachmentDto } from "./model";

/**
 * API client for managing attachments linked to thoughts within a brain.
 */
export class AttachmentsApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    /**
     * Retrieve metadata about a specific attachment.
     *
     * @param brainId Brain identifier containing the attachment.
     * @param attachmentId Identifier of the attachment to fetch.
     */
    async getAttachmentDetails(brainId: string, attachmentId: string): Promise<AttachmentDto> {
        const response = await this.axiosInstance.get(`/attachments/${brainId}/${attachmentId}/metadata`);
        return response.data;
    }

    /**
     * Download the binary content for an attachment.
     *
     * @param brainId Brain identifier containing the attachment.
     * @param attachmentId Identifier of the attachment to fetch.
     */
    async getAttachmentContent(brainId: string, attachmentId: string): Promise<ArrayBuffer | Blob> {
        const response = await this.axiosInstance.get<ArrayBuffer>(`/attachments/${brainId}/${attachmentId}/file-content`, {
            responseType: 'arraybuffer'
        });
        return response.data as ArrayBuffer | Blob;
    }

    /**
     * Remove an attachment from a thought.
     */
    async deleteAttachment(brainId: string, attachmentId: string): Promise<void> {
        await this.axiosInstance.delete(`/attachments/${brainId}/${attachmentId}`);
    }

    /**
     * Upload a file attachment to a thought.
     */
    async addFileAttachment(brainId: string, thoughtId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        await this.axiosInstance.post(`/attachments/${brainId}/${thoughtId}/file`, formData);
    }

    /**
     * Attach a URL resource to a thought.  Name is optional and defaults to the
     * URL value when omitted.
     */
    async addUrlAttachment(brainId: string, thoughtId: string, url: string, name?: string): Promise<void> {
        const params: { url?: string; name?: string } = {};
        if (url !== undefined) {
            params.url = url;
        }
        if (name !== undefined) {
            params.name = name;
        }

        await this.axiosInstance.post(`/attachments/${brainId}/${thoughtId}/url`, null, {
            params
        });
    }
}
