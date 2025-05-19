import bunyan from 'bunyan';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create the logger instance
const logger = bunyan.createLogger({
    name: 'thebrain-api',
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
        req: (req: AxiosRequestConfig) => ({
            method: req.method?.toUpperCase(),
            url: req.url,
            baseURL: req.baseURL,
            params: req.params,
            headers: sanitizeHeaders(req.headers),
            data: req.data,
            timeout: req.timeout,
            validateStatus: req.validateStatus,
        }),
        res: (res: AxiosResponse) => ({
            status: res.status,
            statusText: res.statusText,
            headers: sanitizeHeaders(res.headers),
            data: res.data,
            config: {
                method: res.config.method?.toUpperCase(),
                url: res.config.url,
                baseURL: res.config.baseURL,
            }
        }),
        err: (err: AxiosError) => ({
            message: err.message,
            code: err.code,
            status: err.response?.status,
            statusText: err.response?.statusText,
            headers: err.response ? sanitizeHeaders(err.response.headers) : undefined,
            data: err.response?.data,
            config: err.config ? {
                method: err.config.method?.toUpperCase(),
                url: err.config.url,
                baseURL: err.config.baseURL,
            } : undefined
        }),
    },
});

// Helper function to sanitize sensitive headers
function sanitizeHeaders(headers: Record<string, any> = {}) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
    
    sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]';
        }
    });
    
    return sanitized;
}

// Export the logger instance
export default logger; 