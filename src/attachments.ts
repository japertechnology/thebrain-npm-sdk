import { AxiosInstance } from "axios";
import { AttachmentDto } from "./model";

export class AttachmentsApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    async getAttachmentDetails(brainId: string, attachmentId: string): Promise<AttachmentDto> {
        const response = await this.axiosInstance.get(`/attachments/${brainId}/${attachmentId}/metadata`);
        return response.data;
    }

    async getAttachmentContent(brainId: string, attachmentId: string): Promise<Blob> {
        const response = await this.axiosInstance.get(`/attachments/${brainId}/${attachmentId}/file-content`, {
            responseType: 'blob'
        });
        return response.data;
    }

    async deleteAttachment(brainId: string, attachmentId: string): Promise<void> {
        await this.axiosInstance.delete(`/attachments/${brainId}/${attachmentId}`);
    }

    async addFileAttachment(brainId: string, thoughtId: string, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        await this.axiosInstance.post(`/attachments/${brainId}/${thoughtId}/file`, formData);
    }

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