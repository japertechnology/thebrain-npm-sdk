import { AxiosInstance } from "axios";
import { 
    ThoughtDto, 
    ThoughtKind, 
    ThoughtCreateModel, 
    ThoughtDtoOperation, 
    ThoughtDtoJsonPatchDocument, 
    CreateThoughtResponseModel
} from "./model";

export class ThoughtsApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    async getThoughts(brainId: string): Promise<ThoughtDto[]> {
        const response = await this.axiosInstance.get(`/thoughts/${brainId}`);
        return response.data;
    }

    async getThought(brainId: string, thoughtId: string): Promise<ThoughtDto> {
        const response = await this.axiosInstance.get(`/thoughts/${brainId}/${thoughtId}`);
        return response.data;
    }

    async createThought(brainId: string, thought: ThoughtCreateModel): Promise<CreateThoughtResponseModel> {
        const response = await this.axiosInstance.post(`/thoughts/${brainId}`, thought);
        return response.data;
    }

    async updateThought(brainId: string, thoughtId: string, operations: ThoughtDtoJsonPatchDocument): Promise<void> {
        const operationsArray = Array.isArray(operations) ? operations : operations?.operations;
        if (!Array.isArray(operationsArray) || operationsArray.length === 0) {
            throw new Error('Operations array is required and cannot be empty');
        }

        await this.axiosInstance.patch(`/thoughts/${brainId}/${thoughtId}`, operationsArray, {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        });
    }

    async deleteThought(brainId: string, thoughtId: string): Promise<void> {
        await this.axiosInstance.delete(`/thoughts/${brainId}/${thoughtId}`);
    }

    async getThoughtGraph(brainId: string, thoughtId: string, includeSiblings: boolean = false): Promise<any> {
        const { data } = await this.axiosInstance.get<any>(`/thoughts/${brainId}/${thoughtId}/graph`, {
            params: { includeSiblings }
        });
        return data;
    }

    async getThoughtAttachments(brainId: string, thoughtId: string): Promise<any[]> {
        const { data } = await this.axiosInstance.get<any[]>(`/thoughts/${brainId}/${thoughtId}/attachments`);
        return data;
    }

    async getTypes(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<ThoughtDto[]>(`/thoughts/${brainId}/types`);
        return data;
    }

    async getTags(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<ThoughtDto[]>(`/thoughts/${brainId}/tags`);
        return data;
    }

    async getPinnedThoughts(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<ThoughtDto[]>(`/thoughts/${brainId}/pins`);
        return data;
    }

    async pinThought(brainId: string, thoughtId: string): Promise<void> {
        await this.axiosInstance.post(`/thoughts/${brainId}/${thoughtId}/pin`);
    }

    async unpinThought(brainId: string, thoughtId: string): Promise<void> {
        await this.axiosInstance.delete(`/thoughts/${brainId}/${thoughtId}/pin`);
    }

    async getThoughtModifications(
        brainId: string,
        thoughtId: string,
        maxLogs: number = 100,
        includeRelatedLogs: boolean = true
    ): Promise<any[]> {
        const { data } = await this.axiosInstance.get<any[]>(`/thoughts/${brainId}/${thoughtId}/modifications`, {
            params: { maxLogs, includeRelatedLogs }
        });
        return data;
    }
} 