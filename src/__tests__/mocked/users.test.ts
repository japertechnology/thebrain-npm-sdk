/** Tests for users.test. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UsersApi } from '../../users';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserDto } from '../../model';

describe('UsersApi', () => {
    let mock: MockAdapter;
    let api: UsersApi;

    const mockUsers: UserDto[] = [
        {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'johndoe',
            lastName: 'Doe',
            firstName: 'John',
            emailAddress: 'john.doe@example.com',
            servicesExpiry: '2024-12-31T23:59:59Z',
            accountType: 'premium'
        }
    ];

    beforeEach(() => {
        const instance = axios.create();
        mock = new MockAdapter(instance);
        api = new UsersApi(instance);
    });

    afterEach(() => {
        mock.reset();
        mock.restore();
    });

    describe('getOrganizationMembers', () => {
        it('should get organization members', async () => {
            mock.onGet('/users/organization').reply(200, mockUsers);

            const result = await api.getOrganizationMembers();
            expect(result).toEqual(mockUsers);
        });

        it('should handle empty response', async () => {
            mock.onGet('/users/organization').reply(200, []);

            const result = await api.getOrganizationMembers();
            expect(result).toEqual([]);
        });

        it('should handle server error', async () => {
            mock.onGet('/users/organization')
                .reply(500);

            await expect(api.getOrganizationMembers())
                .rejects
                .toThrow();
        });

        it('should handle network error', async () => {
            mock.onGet('/users/organization')
                .networkError();

            await expect(api.getOrganizationMembers())
                .rejects
                .toThrow();
        });
    });
}); 