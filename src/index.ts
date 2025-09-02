/**
 * Entry point for TheBrain API SDK.  This file exports the {@link TheBrainApi}
 * class which provides access to all API groups and sets up shared Axios
 * configuration such as authentication, rate limiting and logging.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import { AttachmentsApi } from "./attachments";
import { BrainAccessApi } from "./brain-access";
import { BrainsApi } from "./brains";
import { LinksApi } from "./links";
import { NotesApi } from "./notes";
import { NotesImagesApi } from "./notes-images";
import { SearchApi } from "./search";
import { UsersApi } from "./users";
import { ThoughtsApi } from "./thoughts";
import logger from "./logger";
import bunyan from "bunyan";

const ConfigSchema = z
    .object({
        apiKey: z.string().min(1, "API key is required"),
        requestLimit: z.number().int().positive().default(10),
        rateLimitWindows: z.number().int().positive().default(1000),
        baseURL: z.string().default("https://api.bra.in"),
        logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
    })
    .passthrough();

export type BrainAPIConfig = AxiosRequestConfig & {
    apiKey: string;
    requestLimit?: number;
    rateLimitWindows?: number;
    baseURL?: string;
    logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
};

/**
 * Facade class exposing strongly typed access to TheBrain REST API.
 */
export class TheBrainApi {
    private readonly axios: AxiosInstance;
    public readonly brains: BrainsApi;
    public readonly links: LinksApi;
    public readonly attachments: AttachmentsApi;
    public readonly notes: NotesApi;
    public readonly notesImages: NotesImagesApi;
    public readonly search: SearchApi;
    public readonly users: UsersApi;
    public readonly brainAccess: BrainAccessApi;
    public readonly thoughts: ThoughtsApi;

    /**
     * Create a new API client.
     *
     * @param config Configuration for authentication and request handling.
     * @param axiosInstance Optional custom {@link AxiosInstance} to use.
     */
    constructor(config: BrainAPIConfig, axiosInstance?: AxiosInstance) {
        const { apiKey, requestLimit, rateLimitWindows, baseURL, logLevel, ...rest } = ConfigSchema.parse(config) as BrainAPIConfig;

        // Set log level if provided
        if (logLevel) {
            logger.level(logLevel);
        }

        let headers = rest.headers || {};
        
        // Use provided Axios instance or create a new one
        this.axios = axiosInstance || axios.create({
            ...rest,
            baseURL,
            headers: {
                ...headers,
                'Authorization': `Bearer ${apiKey}`,
            }
        });

        // Setup interceptors for rate limiting and logging
        this.setupRateLimitInterceptors(requestLimit, rateLimitWindows);
        this.setupLoggingInterceptors();
        
        // Initialize API groups
        this.brains = new BrainsApi(this.axios);
        this.links = new LinksApi(this.axios);
        this.attachments = new AttachmentsApi(this.axios);
        this.notes = new NotesApi(this.axios);
        this.notesImages = new NotesImagesApi(this.axios);
        this.search = new SearchApi(this.axios);
        this.users = new UsersApi(this.axios);
        this.brainAccess = new BrainAccessApi(this.axios);
        this.thoughts = new ThoughtsApi(this.axios);
    }

    /**
     * Install a basic in-memory rate limiter to avoid hitting server limits.
     *
     * @param limit Maximum number of requests allowed per window.
     * @param windowMs Duration of the rate limiting window in milliseconds.
     */
    private setupRateLimitInterceptors(limit: number, windowMs: number) {
        let requests = 0;
        let windowStart = Date.now();

        this.axios.interceptors.request.use(async (config) => {
            const now = Date.now();
            if (now - windowStart >= windowMs) {
                requests = 0;
                windowStart = now;
            }
            
            if (requests >= limit) {
                const waitTime = windowMs - (now - windowStart);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                requests = 0;
                windowStart = Date.now();
            }
            
            requests++;
            return config;
        });
    }

    /**
     * Configure request/response logging using Bunyan serializers.  This makes
     * it easier for library consumers to diagnose API interactions.
     */
    private setupLoggingInterceptors() {
        // Request interceptor
        this.axios.interceptors.request.use(
            config => {
                logger.debug({
                    req: config,
                    message: `Making ${config.method?.toUpperCase()} request to ${config.url}`
                }, 'Outgoing request');
                return config;
            },
            error => {
                logger.error({
                    err: error,
                    message: `Failed to make request: ${error.message}`
                }, 'Request error');
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.axios.interceptors.response.use(
            response => {
                logger.debug({
                    res: response,
                    message: `Received ${response.status} response from ${response.config.url}`
                }, 'Incoming response');
                return response;
            },
            error => {
                logger.error({
                    err: error,
                    message: `Request failed with status ${error.response?.status || 'unknown'}: ${error.message}`
                }, 'Response error');
                return Promise.reject(error);
            }
        );
    }

    /**
     * Set the logging level
     */
    public setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): void {
        logger.level(level);
    }

    /**
     * Get the current logging level
     */
    public getLogLevel(): string {
        const level = logger.level();
        if (typeof level === 'number') {
            return bunyan.nameFromLevel[level] ?? level.toString();
        }
        return level;
    }
}
