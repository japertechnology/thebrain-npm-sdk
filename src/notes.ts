import { AxiosInstance } from "axios";
import { NotesDto, NotesUpdateModel } from "./model";

/** API client for reading and modifying thought notes. */
export class NotesApi {
    constructor(private readonly axios: AxiosInstance) {}

    /**
     * Get a thought's note content as Markdown
     */
    async getNoteMarkdown(brainId: string, thoughtId: string): Promise<NotesDto> {
        const response = await this.axios.get<NotesDto>(`/notes/${brainId}/${thoughtId}`);
        return response.data;
    }

    /**
     * Get a thought's note content as HTML
     */
    async getNoteHtml(brainId: string, thoughtId: string): Promise<NotesDto> {
        const response = await this.axios.get<NotesDto>(`/notes/${brainId}/${thoughtId}/html`);
        return response.data;
    }

    /**
     * Get a thought's note content as plain text
     */
    async getNoteText(brainId: string, thoughtId: string): Promise<NotesDto> {
        const response = await this.axios.get<NotesDto>(`/notes/${brainId}/${thoughtId}/text`);
        return response.data;
    }

    /**
     * Create or update a thought's note
     */
    async createOrUpdateNote(brainId: string, thoughtId: string, note: NotesUpdateModel): Promise<NotesDto> {
        const response = await this.axios.post<NotesDto>(`/notes/${brainId}/${thoughtId}/update`, note);
        return response.data;
    }

    /**
     * Append content to a thought's note
     */
    async appendToNote(brainId: string, thoughtId: string, content: string): Promise<NotesDto> {
        const updateModel: NotesUpdateModel = { markdown: content };
        const response = await this.axios.post<NotesDto>(`/notes/${brainId}/${thoughtId}/append`, updateModel);
        return response.data;
    }
} 
