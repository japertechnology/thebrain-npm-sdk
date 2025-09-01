import { AxiosInstance } from "axios";
import { LinkDto, LinkCreateModel, LinkDtoOperation, LinkDtoJsonPatchDocument, CreateLinkResponseModel } from "./model";

export class LinksApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    async getLinks(brainId: string): Promise<LinkDto[]> {
        const response = await this.axiosInstance.get(`/links/${brainId}`);
        return response.data;
    }

    async getLink(brainId: string, linkId: string): Promise<LinkDto> {
        const response = await this.axiosInstance.get(`/links/${brainId}/${linkId}`);
        return response.data;
    }

    async createLink(brainId: string, link: LinkCreateModel): Promise<CreateLinkResponseModel> {
        const response = await this.axiosInstance.post(`/links/${brainId}`, link);
        return response.data;
    }

    async updateLink(brainId: string, linkId: string, operations: LinkDtoJsonPatchDocument): Promise<void> {
        const operationsArray = Array.isArray(operations) ? operations : operations?.operations;
        if (!Array.isArray(operationsArray) || operationsArray.length === 0) {
            throw new Error('Operations array is required and cannot be empty');
        }

        await this.axiosInstance.patch(`/links/${brainId}/${linkId}`, operationsArray, {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        });
    }

    async deleteLink(brainId: string, linkId: string): Promise<void> {
        await this.axiosInstance.delete(`/links/${brainId}/${linkId}`);
    }

    async getLinkAttachments(brainId: string, linkId: string): Promise<any[]> {
        const { data } = await this.axiosInstance.get<any[]>(`/links/${brainId}/${linkId}/attachments`);
        return data;
    }
} 