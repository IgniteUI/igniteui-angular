import { IgxTypeAhead, findTypeAheadMatch } from 'igniteui-angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface City {
    name: string;
    disabled?: boolean;
}

const cities: City[] = [
    { name: 'Berlin' },
    { name: 'London' },
    { name: 'Lisbon' },
    { name: 'Paris' },
    { name: 'Lyon' },
    { name: 'Palermo' }
];

const label = (city: City) => city.name;

describe('findTypeAheadMatch', () => {
    it('should find the first item whose label starts with the term, without regard to case', () => {
        expect(findTypeAheadMatch(cities, 'l', { label })).toBe(cities[1]);
        expect(findTypeAheadMatch(cities, 'PA', { label })).toBe(cities[3]);
    });

    it('should search after the current item and wrap around', () => {
        expect(findTypeAheadMatch(cities, 'l', { label, current: cities[1] })).toBe(cities[2]);
        expect(findTypeAheadMatch(cities, 'l', { label, current: cities[4] })).toBe(cities[1]);
    });

    it('should not return the current item', () => {
        expect(findTypeAheadMatch(cities, 'b', { label, current: cities[0] })).toBeUndefined();
    });

    it('should move on with the first letter when the term repeats it', () => {
        expect(findTypeAheadMatch(cities, 'll', { label, current: cities[1] })).toBe(cities[2]);
    });

    it('should return undefined without a match', () => {
        expect(findTypeAheadMatch(cities, 'w', { label })).toBeUndefined();
        expect(findTypeAheadMatch([], 'l', { label })).toBeUndefined();
    });

    it('should pass over the skipped items, which keep their place in the order', () => {
        const items = [{ name: 'Lisbon' }, { name: 'London', disabled: true }, { name: 'Lyon' }];
        const skip = (city: City) => !!city.disabled;

        expect(findTypeAheadMatch(items, 'l', { label, skip, current: items[0] })).toBe(items[2]);
        // A skipped current item still marks where the search starts.
        expect(findTypeAheadMatch(items, 'l', { label, skip, current: items[1] })).toBe(items[2]);
    });
});

describe('IgxTypeAhead', () => {
    let typeAhead: IgxTypeAhead<City>;

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        typeAhead = new IgxTypeAhead({ label });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('search', () => {
        it('should add the keys pressed within the timeout to the term', () => {
            expect(typeAhead.search('p', cities)).toBe(cities[3]);
            expect(typeAhead.search('a', cities, cities[3])).toBe(cities[3]);
            expect(typeAhead.search('l', cities, cities[3])).toBe(cities[5]);
        });

        it('should start a new term after a pause of the timeout', () => {
            typeAhead.search('p', cities);
            vi.advanceTimersByTime(499);
            expect(typeAhead.search('a', cities, cities[3])).toBe(cities[3]);

            vi.advanceTimersByTime(500);
            expect(typeAhead.search('l', cities, cities[3])).toBe(cities[4]);
        });

        it('should keep the current item while it matches a longer term', () => {
            typeAhead.search('l', cities);

            expect(typeAhead.search('o', cities, cities[1])).toBe(cities[1]);
        });

        it('should cycle through the items with the same first letter on a repeated key', () => {
            expect(typeAhead.search('l', cities)).toBe(cities[1]);
            expect(typeAhead.search('l', cities, cities[1])).toBe(cities[2]);
            expect(typeAhead.search('l', cities, cities[2])).toBe(cities[4]);
            expect(typeAhead.search('l', cities, cities[4])).toBe(cities[1]);
        });

        it('should honor a custom timeout', () => {
            typeAhead = new IgxTypeAhead({ label, timeout: 1000 });

            typeAhead.search('p', cities);
            vi.advanceTimersByTime(999);
            expect(typeAhead.search('a', cities, cities[3])).toBe(cities[3]);
        });

        it('should pass the skip predicate to the match', () => {
            const items = [{ name: 'London', disabled: true }, { name: 'Lyon' }];
            typeAhead = new IgxTypeAhead({ label, skip: (city) => !!city.disabled });

            expect(typeAhead.search('l', items)).toBe(items[1]);
        });
    });

    describe('searching', () => {
        it('should be true from the first key until a pause of the timeout', () => {
            expect(typeAhead.searching).toBe(false);

            typeAhead.search('p', cities);
            expect(typeAhead.searching).toBe(true);

            vi.advanceTimersByTime(500);
            expect(typeAhead.searching).toBe(false);
        });

        it('should be false after reset', () => {
            typeAhead.search('p', cities);
            typeAhead.reset();

            expect(typeAhead.searching).toBe(false);
            expect(typeAhead.search('l', cities)).toBe(cities[1]);
        });
    });

    describe('isSearchKey', () => {
        const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

        it('should accept a printable character, also outside the Basic Multilingual Plane', () => {
            expect(typeAhead.isSearchKey(key({ key: 'a' }))).toBe(true);
            expect(typeAhead.isSearchKey(key({ key: 'Ü' }))).toBe(true);
            expect(typeAhead.isSearchKey(key({ key: '😀' }))).toBe(true);
        });

        it('should reject named keys, shortcuts and IME composition keys', () => {
            expect(typeAhead.isSearchKey(key({ key: 'Enter' }))).toBe(false);
            expect(typeAhead.isSearchKey(key({ key: 'ArrowDown' }))).toBe(false);
            expect(typeAhead.isSearchKey(key({ key: 'a', ctrlKey: true }))).toBe(false);
            expect(typeAhead.isSearchKey(key({ key: 'a', metaKey: true }))).toBe(false);
            expect(typeAhead.isSearchKey(key({ key: 'a', altKey: true }))).toBe(false);
            expect(typeAhead.isSearchKey(key({ key: 'a', isComposing: true }))).toBe(false);
        });

        it('should accept a Shift character', () => {
            expect(typeAhead.isSearchKey(key({ key: 'A', shiftKey: true }))).toBe(true);
        });

        it('should accept Space only while a search is active', () => {
            expect(typeAhead.isSearchKey(key({ key: ' ' }))).toBe(false);

            typeAhead.search('p', cities);
            expect(typeAhead.isSearchKey(key({ key: ' ' }))).toBe(true);

            vi.advanceTimersByTime(500);
            expect(typeAhead.isSearchKey(key({ key: ' ' }))).toBe(false);
        });
    });
});
