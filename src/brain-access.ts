import { AxiosInstance } from "axios";
import { z } from "zod";

/**
 * Schema describing a user who has access to a brain.
 */
const BrainAccessorSchema = z.object({
    accessorId: z.string().uuid(),
    name: z.string().nullable(),
    isOrganizationUser: z.boolean(),
    isPending: z.boolean(),
    accessType: z.number().int().min(0).max(4) // 0: None, 1: Reader, 2: Writer, 3: Admin, 4: PublicReader
});

export type BrainAccessor = z.infer<typeof BrainAccessorSchema>;

/**
 * Schema used for updating access levels for a brain.
 */
const SetBrainAccessSchema = z.object({
    emailAddress: z.string().email().optional(),
    userId: z.string().uuid().optional(),
    accessType: z.number().int().min(1).max(4) // 1: Reader, 2: Writer, 3: Admin, 4: PublicReader
}).refine(data => !(data.emailAddress && data.userId), {
    message: "Provide either emailAddress or userId, but not both",
}).refine(data => data.emailAddress || data.userId, {
    message: "Either emailAddress or userId must be provided",
});

export type SetBrainAccess = z.infer<typeof SetBrainAccessSchema>;

/**
 * Schema used for removing access for a brain.
 */
const RemoveBrainAccessSchema = z.object({
    emailAddress: z.string().email().optional(),
    userId: z.string().uuid().optional()
}).refine(data => !(data.emailAddress && data.userId), {
    message: "Provide either emailAddress or userId, but not both",
}).refine(data => data.emailAddress || data.userId, {
    message: "Either emailAddress or userId must be provided",
});

export type RemoveBrainAccess = z.infer<typeof RemoveBrainAccessSchema>;

/**
 * API client for administering user access to a brain.
 */
export class BrainAccessApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    /**
     * Get all brain accessors for a specific brain
     * @param brainId The ID of the brain
     * @returns List of brain accessors with their access levels
     */
    async getBrainAccessors(brainId: string): Promise<BrainAccessor[]> {
        const response = await this.axiosInstance.get(`/brain-access/${brainId}`);
        return response.data;
    }

    /**
     * Set or update a user's access level for a brain
     * @param brainId The ID of the brain
     * @param access The access configuration (email or userId and access type)
     */
    async setBrainAccessLevel(brainId: string, access: SetBrainAccess): Promise<void> {
        const validatedAccess = SetBrainAccessSchema.parse(access);
        await this.axiosInstance.post(`/brain-access/${brainId}`, null, {
            params: validatedAccess
        });
    }

    /**
     * Remove a user's access to a brain
     * @param brainId The ID of the brain
     * @param options Either email address or userId of the user to remove
     */
    async removeBrainAccess(
        brainId: string,
        options: RemoveBrainAccess
    ): Promise<void> {
        const { emailAddress, userId } = options;
        if (!emailAddress && !userId) {
            throw new Error("Either emailAddress or userId must be provided");
        }
        if (emailAddress && userId) {
            throw new Error("Provide either emailAddress or userId, but not both");
        }
        const params = emailAddress ? { emailAddress } : { userId: userId! };

        await this.axiosInstance.delete(`/brain-access/${brainId}`, { params });
    }
}
