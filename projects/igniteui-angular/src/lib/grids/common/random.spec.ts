import { getUUID } from './random';

describe('Random (crypto.randomUuid()) fallback unit tests', () => {
    let originalRandomUuid = crypto.randomUUID;

    beforeAll(() => {
        crypto.randomUUID = null; // Mock crypto.randomUUID to simulate a non-secure context
    });

    it('should generate a valid UUID', () => {
        const uuid = getUUID();
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
        const uuids = new Set();
        for (let i = 0; i < 100; i++) {
            uuids.add(getUUID());
        }
        expect(uuids.size).toBe(100); // All UUIDs should be unique
    });

    afterAll(() => {
        crypto.randomUUID = originalRandomUuid; // Restore the original function
    });
});