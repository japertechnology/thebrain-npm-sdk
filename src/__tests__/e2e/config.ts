/** Tests for config. */
import { z } from 'zod';
import { BrainAPIConfig } from '../../index';

export const ConfigSchema = z.object({
    apiKey: z.string().min(1),
    baseURL: z.string().url().default('https://api.bra.in'),
    requestLimit: z.number().int().positive().default(100),
    rateLimitWindows: z.number().int().positive().default(60),
    logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional()
});


export function loadConfig(): BrainAPIConfig {
    const apiKey = process.env.THEBRAIN_API_KEY;
    const logLevel = process.env.THEBRAIN_LOG_LEVEL || 'debug';
    if (!apiKey) {
        throw new Error('THEBRAIN_API_KEY environment variable is required for running end-to-end tests');
    }

    return ConfigSchema.parse({
        apiKey,
        baseURL: 'https://api.bra.in',
        requestLimit: 100,
        rateLimitWindows: 60,
        logLevel: logLevel 
    });
} 