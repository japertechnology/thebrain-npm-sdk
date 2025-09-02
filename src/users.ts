import { AxiosInstance } from "axios";
import { UserDto } from "./model";

/** API client for user-related endpoints. */
export class UsersApi {
    constructor(private readonly axios: AxiosInstance) {}

    /**
     * Returns an array of details about the active user's TeamBrain Organization members
     */
    async getOrganizationMembers(): Promise<UserDto[]> {
        const response = await this.axios.get<UserDto[]>("/users/organization");
        return response.data;
    }
}
