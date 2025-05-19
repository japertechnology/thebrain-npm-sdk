import { AxiosInstance } from "axios";
import { z } from "zod";

// Schemas
export const BrainDto = z
  .object({
    id: z.string().uuid(),
    name: z.string().nullable(),
    homeThoughtId: z.string().uuid(),
  })
  .partial();

export const StatisticsDto = z.object({
  brainName: z.string().nullable(),
  dateGenerated: z.string().datetime(),
  brainId: z.string().uuid(),
  thoughts: z.number(),
  forgottenThoughts: z.number(),
  links: z.number(),
  linksPerThought: z.number(),
  thoughtTypes: z.number(),
  linkTypes: z.number(),
  tags: z.number(),
  notes: z.number(),
  internalFiles: z.number(),
  internalFolders: z.number(),
  externalFiles: z.number(),
  externalFolders: z.number(),
  webLinks: z.number(),
  assignedIcons: z.number(),
  internalFilesSize: z.number(),
  iconsFilesSize: z.number(),
});

export const ModificationLogDto = z.object({
  sourceId: z.string().uuid(),
  sourceType: z.number(),
  extraAId: z.string().uuid().optional(),
  extraAType: z.number().optional(),
  extraBId: z.string().uuid().optional(),
  extraBType: z.number().optional(),
  modType: z.number(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  userId: z.string().uuid(),
  brainId: z.string().uuid(),
  creationDateTime: z.string().datetime(),
  modificationDateTime: z.string().datetime(),
  syncUpdateDateTime: z.string().datetime().nullable(),
});

export type BrainDto = z.infer<typeof BrainDto>;
export type StatisticsDto = z.infer<typeof StatisticsDto>;
export type ModificationLogDto = z.infer<typeof ModificationLogDto>;

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
        const { data } = await this.axios.post<BrainDto[]>('/brains', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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