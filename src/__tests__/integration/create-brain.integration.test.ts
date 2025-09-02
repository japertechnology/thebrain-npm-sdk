/** Tests for create-brain.integration.test. */
import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { BrainsApi } from '../../brains';
import http from 'http';

describe('createBrain integration', () => {
    it('should upload form data with boundary automatically set', async () => {
        let capturedHeaders: http.IncomingHttpHeaders | undefined;
        let body = '';

        const server = http.createServer((req, res) => {
            capturedHeaders = req.headers;
            req.setEncoding('utf8');
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify([
                        { id: '1', name: 'Integration Brain', homeThoughtId: '2' },
                    ])
                );
            });
        });

        await new Promise<void>(resolve => server.listen(0, resolve));
        const port = (server.address() as any).port;

        const axiosInstance = axios.create({ baseURL: `http://localhost:${port}` });
        const api = new BrainsApi(axiosInstance);
        const response = await api.createBrain('Integration Brain');

        expect(response).toEqual([
            { id: '1', name: 'Integration Brain', homeThoughtId: '2' },
        ]);
        expect(capturedHeaders?.['content-type']).toMatch(/multipart\/form-data; boundary=/);
        expect(body).toContain('Integration Brain');

        server.close();
    });
});
