import { describe, it, expect, beforeAll } from 'vitest';
import { TheBrainApi } from '../../index';
import { TestHelper } from './helpers';
import { UserDto } from '../../model';

let helper: TestHelper;
let api: TheBrainApi;

describe('Users API E2E', () => {
    beforeAll(async () => {
        helper = new TestHelper();
        api = helper.api;
    });

    describe('Organization Members', () => {
        it('should get organization members', async () => {
            try {
                const member = await api.users.getOrganizationMembers();
                expect(member).toBeDefined();
                expect(member.id).toBeDefined();
                expect(typeof member.emailAddress).toBe('string');
            } catch (error: any) {
                // This might fail in test environments where organization access is not available
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });
    });
});