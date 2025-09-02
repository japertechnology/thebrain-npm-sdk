/** Tests for attachments.integration.test. */
import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { AttachmentsApi } from '../../attachments';
import http from 'http';

// Integration test to ensure automatic boundary for file uploads

describe('addFileAttachment integration', () => {
    it('should upload file with boundary automatically set', async () => {
        let capturedHeaders: http.IncomingHttpHeaders | undefined;
        let body = '';

        const server = http.createServer((req, res) => {
            capturedHeaders = req.headers;
            req.setEncoding('utf8');
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                res.writeHead(200);
                res.end('OK');
            });
        });

        await new Promise<void>(resolve => server.listen(0, resolve));
        const port = (server.address() as any).port;

        const axiosInstance = axios.create({ baseURL: `http://localhost:${port}` });
        const api = new AttachmentsApi(axiosInstance);
        const testFile = new File(['test file content'], 'test.txt', { type: 'text/plain' });

        await api.addFileAttachment('brain', 'thought', testFile);

        expect(capturedHeaders?.['content-type']).toMatch(/multipart\/form-data; boundary=/);
        expect(body).toContain('test.txt');
        expect(body).toContain('test file content');

        server.close();
    });
});
