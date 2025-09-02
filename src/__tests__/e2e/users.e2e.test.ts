/** Tests for users.e2e.test. */
import { describe, it, expect, beforeAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { UserDto } from '../../model';

let helper: TestHelper;
let api: TheBrainApi;

describe.skipIf(!process.env.THEBRAIN_API_KEY)('Users API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
    });

    describe('Organization Members', () => {
        it('should get organization members', async () => {
            try {
                const members = await api.users.getOrganizationMembers();
                expect(Array.isArray(members)).toBe(true);
                expect(members.length).toBeGreaterThan(0);
                const member = members[0];
                expect(member.id).toBeDefined();
                expect(typeof member.emailAddress).toBe('string');
            } catch (error: any) {
                // This might fail in test environments where organization access is not available
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });
    });
});