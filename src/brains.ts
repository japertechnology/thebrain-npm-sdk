import { AxiosInstance } from "axios";
import type {
  BrainDto,
  StatisticsDto,
  ModificationLogDto,
} from "./model";

export class BrainsApi {
    constructor(private readonly axios: AxiosInstance) {}

    async getBrains(): Promise<BrainDto[]> {
        const { data } = await this.axios.get<BrainDto[]>('/brains');
        return data;
    }

    async getBrain(id: string): Promise<BrainDto> {
        const { data } = await this.axios.get<BrainDto>(`/brains/${id}`);
        return data;
    }

    async createBrain(brainName: string): Promise<BrainDto[]> {
        const formData = new FormData();
        formData.append('brainName', brainName);
        const { data } = await this.axios.post<BrainDto[]>('/brains', formData);
        return data;
    }

    async deleteBrain(id: string): Promise<void> {
        await this.axios.delete(`/brains/${id}`);
    }

    async getBrainStats(brainId: string): Promise<StatisticsDto> {
        const { data } = await this.axios.get<StatisticsDto>(`/brains/${brainId}/statistics`);
        return data;
    }

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
