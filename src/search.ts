import { AxiosInstance } from "axios";
import { SearchResultDto } from "./model";

export interface SearchOptions {
    maxResults?: number;
    onlySearchThoughtNames?: boolean;
    excludeBrainIds?: string[];
}

export class SearchApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    /**
     * Search within a specific brain
     */
    async searchInBrain(brainId: string, queryText: string, options: SearchOptions = {}): Promise<SearchResultDto[]> {
        const { maxResults = 30, onlySearchThoughtNames = false } = options;
        const response = await this.axiosInstance.get<SearchResultDto[]>(`/search/${brainId}`, {
            params: {
                queryText,
                maxResults,
                onlySearchThoughtNames
            }
        });
        return response.data;
    }

    /**
     * Search across all public brains
     */
    async searchPublic(queryText: string, options: SearchOptions = {}): Promise<SearchResultDto[]> {
        const { maxResults = 30, onlySearchThoughtNames = false, excludeBrainIds = [] } = options;
        const response = await this.axiosInstance.get<SearchResultDto[]>(`/search/public`, {
            params: {
                queryText,
                maxResults,
                onlySearchThoughtNames,
                excludeBrainIds
            }
        });
        return response.data;
    }

    /**
     * Search across all brains with user access
     */
    async searchAccessible(queryText: string, options: SearchOptions = {}): Promise<SearchResultDto[]> {
        const { maxResults = 30, onlySearchThoughtNames = false } = options;
        const response = await this.axiosInstance.get<SearchResultDto[]>(`/search/accessible`, {
            params: {
                queryText,
                maxResults,
                onlySearchThoughtNames
            }
        });
        return response.data;
    }
} 