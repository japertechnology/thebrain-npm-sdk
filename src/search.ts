import { AxiosInstance } from "axios";
import { SearchResultDto } from "./model";

const paramsSerializer = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            for (const v of value) {
                searchParams.append(key, v);
            }
        } else {
            searchParams.append(key, String(value));
        }
    }
    return searchParams.toString();
};

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
            },
            paramsSerializer
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
            },
            paramsSerializer
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
            },
            paramsSerializer
        });
        return response.data;
    }
} 