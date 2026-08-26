import { ByLevelTreeGridMergeStrategy, DefaultMergeStrategy, DefaultTreeGridMergeStrategy } from './merge-strategy';

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

        expect(strategy).toBe(DefaultMergeStrategy.instance(), 'the strategy is a singleton');

        expect(strategy.comparer({ name: 'a' }, { name: 'a' }, 'name'))
            .toBeTruthy('equal values');
        expect(strategy.comparer({ name: 'a' }, { name: 'b' }, 'name'))
            .toBeFalsy('different values');
        // Two missing values are considered the same, a missing one next to a present one is not.
        expect(strategy.comparer({ name: null }, { name: undefined }, 'name'))
            .toBeTruthy('both nullish');
        expect(strategy.comparer({ name: null }, { name: 'a' }, 'name'))
            .toBeFalsy('only the previous value nullish');
        expect(strategy.comparer({ name: 'a' }, { name: null }, 'name'))
            .toBeFalsy('only the current value nullish');
    });

    it('tests the date and time flags of the default `comparer`', () => {
        const strategy = DefaultMergeStrategy.instance();
        const morning = { date: new Date(2024, 4, 17, 8, 30) };
        const sameMoment = { date: new Date(2024, 4, 17, 8, 30) };
        const evening = { date: new Date(2024, 4, 17, 20, 45) };
        const nextDaySameTime = { date: new Date(2024, 4, 18, 8, 30) };

        // Date and time - the whole timestamp has to match.
        expect(strategy.comparer(morning, sameMoment, 'date', true, true))
            .toBeTruthy('date + time, same moment');
        expect(strategy.comparer(morning, evening, 'date', true, true))
            .toBeFalsy('date + time, different time');

        // Date only - the time part is dropped, so the same day merges regardless of the hour.
        expect(strategy.comparer(morning, evening, 'date', true, false))
            .toBeTruthy('date only, same day');
        expect(strategy.comparer(morning, nextDaySameTime, 'date', true, false))
            .toBeFalsy('date only, different day');

        // Time only - the date part is dropped, so the same hour merges across days.
        expect(strategy.comparer(morning, nextDaySameTime, 'date', false, true))
            .toBeTruthy('time only, same time');
        expect(strategy.comparer(morning, evening, 'date', false, true))
            .toBeFalsy('time only, different time');

        // Values that are not `Date` instances yet are parsed first.
        expect(strategy.comparer({ date: '2024-05-17T08:30:00' }, { date: '2024-05-17T20:45:00' }, 'date', true, false))
            .toBeTruthy('parsed date only, same day');
        expect(strategy.comparer({ date: '2024-05-17T08:30:00' }, { date: '2024-05-18T08:30:00' }, 'date', true, false))
            .toBeFalsy('parsed date only, different day');
    });

    it('tests `merge`', () => {
        const strategy = DefaultMergeStrategy.instance();
        const data = [{ name: 'a' }, { name: 'a' }, { name: 'b' }, { name: 'b' }, { name: 'b' }];

        // The optional arguments are left out on purpose - `merge` has to fall back to its own comparer.
        const result = strategy.merge(data, 'name', undefined, [], [], undefined, undefined, gridStub);

        expect(result.length).toBe(5);
        expect(result[0].cellMergeMeta.get('name').rowSpan).toBe(2, 'the first group spans two rows');
        expect(result[1].cellMergeMeta.get('name').root).toBe(result[0], 'the second record points at the group root');
        expect(result[2].cellMergeMeta.get('name').rowSpan).toBe(3, 'the second group spans three rows');
        expect(result[0].cellMergeMeta.get('name').childRecords).toEqual([result[1]]);
    });

    it('tests `merge` with an active row breaking the sequence', () => {
        const strategy = DefaultMergeStrategy.instance();
        const data = [{ name: 'a' }, { name: 'a' }, { name: 'b' }, { name: 'b' }, { name: 'b' }];

        const result = strategy.merge(data, 'name', undefined, [], [1], undefined, undefined, gridStub);

        // The active row is added untouched and resets the merging sequence around it.
        expect(result[1]).toBe(data[1], 'the active row is kept as-is');
        expect(result[0].cellMergeMeta.get('name').rowSpan).toBe(1, 'the row before the active one no longer merges');
        expect(result[2].cellMergeMeta.get('name').rowSpan).toBe(3, 'the group after it is unaffected');
    });

    it('tests the tree grid `comparer`', () => {
        const strategy = new DefaultTreeGridMergeStrategy();
        const record = (name: any, level = 0) => ({ data: { name }, level });

        expect(strategy.comparer(record('a'), record('a'), 'name'))
            .toBeTruthy('equal values');
        expect(strategy.comparer(record('a'), record('b'), 'name'))
            .toBeFalsy('different values');
        // The tree grid strategy reads the values off `data`, but treats missing ones the same way.
        expect(strategy.comparer(record(null), record(undefined), 'name'))
            .toBeTruthy('both nullish');
        expect(strategy.comparer(record(null), record('a'), 'name'))
            .toBeFalsy('only the previous value nullish');
        expect(strategy.comparer(record('a'), record(null), 'name'))
            .toBeFalsy('only the current value nullish');
        // The level is irrelevant here - only the value decides.
        expect(strategy.comparer(record('a', 1), record('a', 2), 'name'))
            .toBeTruthy('equal values on different levels');
    });

    it('tests the by-level tree grid `comparer`', () => {
        const strategy = new ByLevelTreeGridMergeStrategy();
        const record = (name: any, level = 0) => ({ data: { name }, level });

        expect(strategy.comparer(record('a', 1), record('a', 1), 'name'))
            .toBeTruthy('equal values on the same level');
        // Unlike the plain tree grid strategy, records on different levels never merge.
        expect(strategy.comparer(record('a', 1), record('a', 2), 'name'))
            .toBeFalsy('equal values on different levels');
        expect(strategy.comparer(record('a', 1), record('b', 1), 'name'))
            .toBeFalsy('different values');
        expect(strategy.comparer(record(null, 1), record(undefined, 2), 'name'))
            .toBeTruthy('both nullish');
        expect(strategy.comparer(record(null, 1), record('a', 1), 'name'))
            .toBeFalsy('only the previous value nullish');
        expect(strategy.comparer(record('a', 1), record(null, 1), 'name'))
            .toBeFalsy('only the current value nullish');
    });
});
