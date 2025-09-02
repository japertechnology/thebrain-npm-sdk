import { AxiosInstance } from "axios";
import {
    ThoughtDto,
    ThoughtKind,
    ThoughtCreateModel,
    ThoughtDtoOperation,
    ThoughtDtoJsonPatchDocument,
    CreateThoughtResponseModel,
    AttachmentDto,
    ModificationLogDto,
    ThoughtGraphDto as ThoughtGraphDtoSchema,
    type ThoughtGraphDto,
} from "./model";

/** API client for CRUD operations on thoughts within a brain. */
export class ThoughtsApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    async getThoughts(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(`/thoughts/${brainId}`);
        return ThoughtDto.array().parse(data);
    }

    async getThought(brainId: string, thoughtId: string): Promise<ThoughtDto> {
        const { data } = await this.axiosInstance.get<unknown>(`/thoughts/${brainId}/${thoughtId}`);
        return ThoughtDto.parse(data);
    }

    async createThought(brainId: string, thought: ThoughtCreateModel): Promise<CreateThoughtResponseModel> {
        const { data } = await this.axiosInstance.post<unknown>(`/thoughts/${brainId}`, thought);
        return CreateThoughtResponseModel.parse(data);
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

    async getThoughtGraph(
        brainId: string,
        thoughtId: string,
        includeSiblings: boolean = false
    ): Promise<ThoughtGraphDto> {
        const { data } = await this.axiosInstance.get<unknown>(
            `/thoughts/${brainId}/${thoughtId}/graph`,
            { params: { includeSiblings } }
        );
        return ThoughtGraphDtoSchema.parse(data);
    }

    async getThoughtAttachments(brainId: string, thoughtId: string): Promise<AttachmentDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(
            `/thoughts/${brainId}/${thoughtId}/attachments`
        );
        return AttachmentDto.array().parse(data);
    }

    async getTypes(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(`/thoughts/${brainId}/types`);
        return ThoughtDto.array().parse(data);
    }

    async getTags(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(`/thoughts/${brainId}/tags`);
        return ThoughtDto.array().parse(data);
    }

    async getPinnedThoughts(brainId: string): Promise<ThoughtDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(`/thoughts/${brainId}/pins`);
        return ThoughtDto.array().parse(data);
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
    ): Promise<ModificationLogDto[]> {
        const { data } = await this.axiosInstance.get<unknown>(
            `/thoughts/${brainId}/${thoughtId}/modifications`,
            { params: { maxLogs, includeRelatedLogs } }
        );
        return ModificationLogDto.array().parse(data);
    }
} 
