import { AxiosInstance } from "axios";
import { z } from "zod";

// Schema for note image request parameters
// Validate token and filename to prevent path traversal
const safePathSegment = z.string().min(1).refine(
    (value) => !value.includes("../") && !value.includes("..\\") && !value.includes("/") && !value.includes("\\"),
    { message: "Invalid path segment" }
);

const NoteImageRequestSchema = z.object({
    brainId: z.string().uuid(),
    token: safePathSegment,
    filename: safePathSegment
});

export class NotesImagesApi {
    constructor(private readonly axiosInstance: AxiosInstance) {}

    /**
     * Get an image from a note
     * This method uses a token that expires to validate the request instead of requiring authorization
     * @param brainId The ID of the brain
     * @param token The token generated when retrieving notes
     * @param filename The filename of the image
     * @returns The binary data of the image
     */
    async getNoteImage(brainId: string, token: string, filename: string): Promise<ArrayBuffer> {
        const params = NoteImageRequestSchema.parse({ brainId, token, filename });
        
        const response = await this.axiosInstance.get(
            `/notes-images/${encodeURIComponent(params.brainId)}/${encodeURIComponent(params.token)}/${encodeURIComponent(params.filename)}`,
            {
                responseType: 'arraybuffer'
            }
        );
        
        return response.data;
    }

    /**
     * Get an image from a note and convert it to a base64 data URL
     * @param brainId The ID of the brain
     * @param token The token generated when retrieving notes
     * @param filename The filename of the image
     * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg')
     * @returns A base64 data URL that can be used in an img tag's src attribute
     */
    async getNoteImageAsDataUrl(
        brainId: string, 
        token: string, 
        filename: string,
        mimeType: string
    ): Promise<string> {
        const imageData = await this.getNoteImage(brainId, token, filename);
        const base64 = Buffer.from(imageData).toString('base64');
        return `data:${mimeType};base64,${base64}`;
    }
}
