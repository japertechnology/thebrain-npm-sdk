import { AxiosInstance } from "axios";
import type {
  BrainDto,
  StatisticsDto,
  ModificationLogDto,
} from "./model";

/**
 * API client for Brain-level operations such as creation and statistics.
 */
export class BrainsApi {
    constructor(private readonly axios: AxiosInstance) {}

    /** Retrieve a list of brains accessible to the user. */
    async getBrains(): Promise<BrainDto[]> {
        const { data } = await this.axios.get<BrainDto[]>('/brains');
        return data;
    }

    /** Fetch details for a single brain by its identifier. */
    async getBrain(id: string): Promise<BrainDto> {
        const { data } = await this.axios.get<BrainDto>(`/brains/${id}`);
        return data;
    }

    /**
     * Create a new brain owned by the authenticated user.
     *
     * @param brainName Human-friendly name for the brain.
     */
    async createBrain(brainName: string): Promise<BrainDto[]> {
        const formData = new FormData();
        formData.append('brainName', brainName);
        const { data } = await this.axios.post<BrainDto[]>('/brains', formData);
        return data;
    }

    /** Delete a brain permanently. */
    async deleteBrain(id: string): Promise<void> {
        await this.axios.delete(`/brains/${id}`);
    }

    /** Retrieve usage statistics for a brain. */
    async getBrainStats(brainId: string): Promise<StatisticsDto> {
        const { data } = await this.axios.get<StatisticsDto>(`/brains/${brainId}/statistics`);
        return data;
    }

    /**
     * Get modification logs for a brain within an optional time window.
     */
    async getBrainModifications(
        brainId: string,
        maxLogs: number = 100,
        startTime?: string,
        endTime?: string
    ): Promise<ModificationLogDto[]> {
        const params: Record<string, string> = {
            maxLogs: maxLogs.toString(),
        };

        if (startTime) params.startTime = startTime;
        if (endTime) params.endTime = endTime;

        const { data } = await this.axios.get<ModificationLogDto[]>(
            `/brains/${brainId}/modifications`,
            { params }
        );
        return data;
    }
}

