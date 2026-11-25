import { ByLevelTreeGridMergeStrategy, DefaultMergeStrategy, DefaultTreeGridMergeStrategy } from './merge-strategy';
import { describe, it, expect } from 'vitest';

describe('Unit testing MergeStrategy', () => {
    // `merge` asks the grid to classify every record before it considers it for merging.
    const gridStub = {
        isDetailRecord: () => false,
        isGroupByRecord: () => false,
        isChildGridRecord: () => false,
        isSummaryRow: () => false,
        isGhostRecord: () => false
    } as any;

    it('tests the default `comparer`', () => {
        const strategy = DefaultMergeStrategy.instance();

        expect(strategy, 'the strategy is a singleton').toBe(DefaultMergeStrategy.instance());

        expect(strategy.comparer({ name: 'a' }, { name: 'a' }, 'name'), 'equal values')
            .toBeTruthy();
        expect(strategy.comparer({ name: 'a' }, { name: 'b' }, 'name'), 'different values')
            .toBeFalsy();
        // Two missing values are considered the same, a missing one next to a present one is not.
        expect(strategy.comparer({ name: null }, { name: undefined }, 'name'), 'both nullish')
            .toBeTruthy();
        expect(strategy.comparer({ name: null }, { name: 'a' }, 'name'), 'only the previous value nullish')
            .toBeFalsy();
        expect(strategy.comparer({ name: 'a' }, { name: null }, 'name'), 'only the current value nullish')
            .toBeFalsy();
    });

    it('tests the date and time flags of the default `comparer`', () => {
        const strategy = DefaultMergeStrategy.instance();
        const morning = { date: new Date(2024, 4, 17, 8, 30) };
        const sameMoment = { date: new Date(2024, 4, 17, 8, 30) };
        const evening = { date: new Date(2024, 4, 17, 20, 45) };
        const nextDaySameTime = { date: new Date(2024, 4, 18, 8, 30) };

        // Date and time - the whole timestamp has to match.
        expect(strategy.comparer(morning, sameMoment, 'date', true, true), 'date + time, same moment')
            .toBeTruthy();
        expect(strategy.comparer(morning, evening, 'date', true, true), 'date + time, different time')
            .toBeFalsy();

        // Date only - the time part is dropped, so the same day merges regardless of the hour.
        expect(strategy.comparer(morning, evening, 'date', true, false), 'date only, same day')
            .toBeTruthy();
        expect(strategy.comparer(morning, nextDaySameTime, 'date', true, false), 'date only, different day')
            .toBeFalsy();

        // Time only - the date part is dropped, so the same hour merges across days.
        expect(strategy.comparer(morning, nextDaySameTime, 'date', false, true), 'time only, same time')
            .toBeTruthy();
        expect(strategy.comparer(morning, evening, 'date', false, true), 'time only, different time')
            .toBeFalsy();

        // Values that are not `Date` instances yet are parsed first.
        expect(strategy.comparer({ date: '2024-05-17T08:30:00' }, { date: '2024-05-17T20:45:00' }, 'date', true, false), 'parsed date only, same day')
            .toBeTruthy();
        expect(strategy.comparer({ date: '2024-05-17T08:30:00' }, { date: '2024-05-18T08:30:00' }, 'date', true, false), 'parsed date only, different day')
            .toBeFalsy();
    });

    it('tests `merge`', () => {
        const strategy = DefaultMergeStrategy.instance();
        const data = [{ name: 'a' }, { name: 'a' }, { name: 'b' }, { name: 'b' }, { name: 'b' }];

        // The optional arguments are left out on purpose - `merge` has to fall back to its own comparer.
        const result = strategy.merge(data, 'name', undefined, [], [], undefined, undefined, gridStub);

        expect(result.length).toBe(5);
        expect(result[0].cellMergeMeta.get('name').rowSpan, 'the first group spans two rows').toBe(2);
        expect(result[1].cellMergeMeta.get('name').root, 'the second record points at the group root').toBe(result[0]);
        expect(result[2].cellMergeMeta.get('name').rowSpan, 'the second group spans three rows').toBe(3);
        expect(result[0].cellMergeMeta.get('name').childRecords).toEqual([result[1]]);
    });

    it('tests `merge` with an active row breaking the sequence', () => {
        const strategy = DefaultMergeStrategy.instance();
        const data = [{ name: 'a' }, { name: 'a' }, { name: 'b' }, { name: 'b' }, { name: 'b' }];

        const result = strategy.merge(data, 'name', undefined, [], [1], undefined, undefined, gridStub);

        // The active row is added untouched and resets the merging sequence around it.
        expect(result[1], 'the active row is kept as-is').toBe(data[1]);
        expect(result[0].cellMergeMeta.get('name').rowSpan, 'the row before the active one no longer merges').toBe(1);
        expect(result[2].cellMergeMeta.get('name').rowSpan, 'the group after it is unaffected').toBe(3);
    });

    it('tests the tree grid `comparer`', () => {
        const strategy = new DefaultTreeGridMergeStrategy();
        const record = (name: any, level = 0) => ({ data: { name }, level });

        expect(strategy.comparer(record('a'), record('a'), 'name'), 'equal values')
            .toBeTruthy();
        expect(strategy.comparer(record('a'), record('b'), 'name'), 'different values')
            .toBeFalsy();
        // The tree grid strategy reads the values off `data`, but treats missing ones the same way.
        expect(strategy.comparer(record(null), record(undefined), 'name'), 'both nullish')
            .toBeTruthy();
        expect(strategy.comparer(record(null), record('a'), 'name'), 'only the previous value nullish')
            .toBeFalsy();
        expect(strategy.comparer(record('a'), record(null), 'name'), 'only the current value nullish')
            .toBeFalsy();
        // The level is irrelevant here - only the value decides.
        expect(strategy.comparer(record('a', 1), record('a', 2), 'name'), 'equal values on different levels')
            .toBeTruthy();
    });

    it('tests the by-level tree grid `comparer`', () => {
        const strategy = new ByLevelTreeGridMergeStrategy();
        const record = (name: any, level = 0) => ({ data: { name }, level });

        expect(strategy.comparer(record('a', 1), record('a', 1), 'name'), 'equal values on the same level')
            .toBeTruthy();
        // Unlike the plain tree grid strategy, records on different levels never merge.
        expect(strategy.comparer(record('a', 1), record('a', 2), 'name'), 'equal values on different levels')
            .toBeFalsy();
        expect(strategy.comparer(record('a', 1), record('b', 1), 'name'), 'different values')
            .toBeFalsy();
        expect(strategy.comparer(record(null, 1), record(undefined, 2), 'name'), 'both nullish')
            .toBeTruthy();
        expect(strategy.comparer(record(null, 1), record('a', 1), 'name'), 'only the previous value nullish')
            .toBeFalsy();
        expect(strategy.comparer(record('a', 1), record(null, 1), 'name'), 'only the current value nullish')
            .toBeFalsy();
    });
});
