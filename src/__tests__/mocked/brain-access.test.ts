import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrainAccessApi, BrainAccessor, SetBrainAccess } from '../../brain-access';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AccessType } from '../../model';

describe('BrainAccessApi', () => {
    let mock: MockAdapter;
    let api: BrainAccessApi;

    const mockBrainId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserId = '987fcdeb-51a2-43d7-9012-345678901234';
    
    const mockAccessors: BrainAccessor[] = [
        {
            accessorId: mockUserId,
            name: 'John Doe',
            isOrganizationUser: false,
            isPending: false,
            accessType: AccessType.Admin
        },
        {
            accessorId: '654321ab-cdef-0123-4567-89abcdef0123',
            name: 'Jane Smith',
            isOrganizationUser: true,
            isPending: false,
            accessType: AccessType.Writer
        }
    ];

    beforeEach(() => {
        const instance = axios.create();
        mock = new MockAdapter(instance);
        api = new BrainAccessApi(instance);
    });

    afterEach(() => {
        mock.reset();
        mock.restore();
    });

    describe('getBrainAccessors', () => {
        it('should get brain accessors', async () => {
            mock.onGet(`/brain-access/${mockBrainId}`)
                .reply(200, mockAccessors);

            const result = await api.getBrainAccessors(mockBrainId);
            expect(result).toEqual(mockAccessors);
        });

        it('should handle empty array response', async () => {
            mock.onGet(`/brain-access/${mockBrainId}`)
                .reply(200, []);

            const result = await api.getBrainAccessors(mockBrainId);
            expect(result).toEqual([]);
        });

        it('should handle server error', async () => {
            mock.onGet(`/brain-access/${mockBrainId}`)
                .reply(500);

            await expect(api.getBrainAccessors(mockBrainId))
                .rejects
                .toThrow();
        });

        it('should handle network error', async () => {
            mock.onGet(`/brain-access/${mockBrainId}`)
                .networkError();

            await expect(api.getBrainAccessors(mockBrainId))
                .rejects
                .toThrow();
        });
    });

    describe('setBrainAccessLevel', () => {
        it('should set brain access level using email address', async () => {
            const access: SetBrainAccess = {
                emailAddress: 'test@example.com',
                accessType: AccessType.Reader
            };

            mock.onPost(`/brain-access/${mockBrainId}`).reply(function(config) {
                // Verify we have the right URL parameters
                if (config.params && config.params.emailAddress === access.emailAddress && 
                    config.params.accessType === access.accessType) {
                    return [200, {}];
                }
                return [400, { error: 'Invalid request' }];
            });

            await api.setBrainAccessLevel(mockBrainId, access);
            expect(mock.history.post.length).toBe(1);
        });

        it('should set brain access level using userId', async () => {
            const access: SetBrainAccess = {
                userId: mockUserId,
                accessType: AccessType.Writer
            };

            mock.onPost(`/brain-access/${mockBrainId}`).reply(function(config) {
                // Verify we have the right URL parameters
                if (config.params && config.params.userId === access.userId && 
                    config.params.accessType === access.accessType) {
                    return [200, {}];
                }
                return [400, { error: 'Invalid request' }];
            });

            await api.setBrainAccessLevel(mockBrainId, access);
            expect(mock.history.post.length).toBe(1);
        });

        it('should reject invalid access type', async () => {
            const invalidAccess = {
                emailAddress: 'test@example.com',
                accessType: 100 // Invalid access type
            };

            await expect(api.setBrainAccessLevel(mockBrainId, invalidAccess as any))
                .rejects
                .toThrow();
        });

        it('should reject missing both email and userId', async () => {
            const invalidAccess = {
                accessType: AccessType.Writer
            };

            await expect(api.setBrainAccessLevel(mockBrainId, invalidAccess as any))
                .rejects
                .toThrow();
        });

        it('should reject having both email and userId', async () => {
            const invalidAccess = {
                emailAddress: 'test@example.com',
                userId: mockUserId,
                accessType: AccessType.Writer
            };

            await expect(api.setBrainAccessLevel(mockBrainId, invalidAccess as any))
                .rejects
                .toThrow(/Provide either emailAddress or userId, but not both/);
        });
    });

    describe('removeBrainAccess', () => {
        it('should remove brain access by email address', async () => {
            const email = 'test@example.com';
            
            mock.onDelete(`/brain-access/${mockBrainId}`).reply(function(config) {
                if (config.params && config.params.emailAddress === email) {
                    return [200, {}];
                }
                return [400, { error: 'Invalid request' }];
            });

            await api.removeBrainAccess(mockBrainId, { emailAddress: email });
            expect(mock.history.delete.length).toBe(1);
        });

        it('should remove brain access by userId', async () => {
            mock.onDelete(`/brain-access/${mockBrainId}`).reply(function(config) {
                if (config.params && config.params.userId === mockUserId) {
                    return [200, {}];
                }
                return [400, { error: 'Invalid request' }];
            });

            await api.removeBrainAccess(mockBrainId, { userId: mockUserId });
            expect(mock.history.delete.length).toBe(1);
        });

        it('should reject missing both email and userId', async () => {
            await expect(api.removeBrainAccess(mockBrainId, {}))
                .rejects
                .toThrow(/Either emailAddress or userId must be provided/);
        });

        it('should reject having both email and userId', async () => {
            await expect(api.removeBrainAccess(mockBrainId, {
                emailAddress: 'test@example.com',
                userId: mockUserId
            }))
                .rejects
                .toThrow(/Provide either emailAddress or userId, but not both/);
        });
    });
});