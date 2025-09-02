/** Tests for BrainDto schema validation. */
import { describe, it, expect } from 'vitest';
import { BrainDto as BrainDtoSchema } from '../model';

const validBrain = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    brainId: '123e4567-e89b-12d3-a456-426614174000',
    creationDateTime: '2024-01-01T00:00:00Z',
    modificationDateTime: '2024-01-01T00:00:00Z',
    homeThoughtId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'My Brain'
};

describe('BrainDto', () => {
    it('allows optional name', () => {
        const { name, ...withoutName } = validBrain;
        expect(() => BrainDtoSchema.parse(withoutName)).not.toThrow();
    });

    it('throws when id is missing', () => {
        const { id, ...withoutId } = validBrain;
        expect(() => BrainDtoSchema.parse(withoutId)).toThrow();
    });

    it('throws when homeThoughtId is missing', () => {
        const { homeThoughtId, ...withoutHome } = validBrain;
        expect(() => BrainDtoSchema.parse(withoutHome)).toThrow();
    });
});
