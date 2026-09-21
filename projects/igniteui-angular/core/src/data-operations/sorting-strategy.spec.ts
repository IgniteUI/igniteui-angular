import { DataGenerator } from './test-util/data-generator';
import { DefaultSortingStrategy, FormattedValuesSortingStrategy, GroupMemberCountSortingStrategy,
    SortingDirection } from './sorting-strategy';
import { IgxSorting } from './grid-sorting-strategy';

describe('Unit testing SortingStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: any[];
    const sorting = new IgxSorting();
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
    });
    it('tests `sort`', () => {
        const res = sorting.sort(data, [
            {
                dir: SortingDirection.Asc,
                fieldName: 'boolean',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            }, {
                dir: SortingDirection.Desc,
                fieldName: 'number',
                ignoreCase: false,
                strategy: DefaultSortingStrategy.instance()
            }]);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
            .toEqual([4, 2, 0, 3, 1]);
    });
    it('tests `compareObjects`', () => {
        const strategy = DefaultSortingStrategy.instance();
        expect(strategy.compareValues(1, 0) === 1 &&
            strategy.compareValues(true, false) === 1 &&
            strategy.compareValues('bc', 'adfc') === 1)
            .toBeTruthy('compare first argument greater than second');
        expect(strategy.compareValues(1, 2) === -1 &&
            strategy.compareValues('a', 'b') === -1 &&
            strategy.compareValues(false, true) === -1)
            .toBeTruthy('compare 0, 1');
        expect(strategy.compareValues(0, 0) === 0 &&
            strategy.compareValues(true, true) === 0 &&
            strategy.compareValues('test', 'test') === 0
        )
            .toBeTruthy('Comare equal variables');
    });
    it('tests default settings', () => {
        (data[4] as { string: string }).string = 'ROW';
        const res = sorting.sort(data, [{
            dir: SortingDirection.Asc,
            fieldName: 'string',
            ignoreCase: true,
            strategy: DefaultSortingStrategy.instance()
        }]);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
            .toEqual([4, 0, 1, 2, 3]);
    });

    it('should not sort when sorting direction is None', () => {
        const unsortedData = [{ number: 3 }, { number: 1 }, { number: 4 }, { number: 0 }, { number: 2 }];
        const res = sorting.sort(unsortedData, [{
            dir: SortingDirection.None,
            fieldName: 'number',
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        }]);
        expect(res.map(d => d.number))
            .toEqual([3, 1, 4, 0, 2]);
    });

    it('tests `compareObjects` of the default strategy', () => {
        const strategy = new TestSortingStrategy();
        const resolver = (obj: any, key: string) => obj[key];

        // 'ROW' sorts before 'row' while the case matters, and equals it once it does not.
        expect(strategy.compare({ string: 'ROW' }, { string: 'row' }, 'string', 1, false, resolver)).toBe(-1);
        expect(strategy.compare({ string: 'ROW' }, { string: 'row' }, 'string', 1, true, resolver)).toBe(0);
        // Values without `toLowerCase` are passed through untouched even when the case is ignored.
        expect(strategy.compare({ number: 2 }, { number: 1 }, 'number', 1, true, resolver)).toBe(1);
        // A reversed comparison flips the result.
        expect(strategy.compare({ number: 2 }, { number: 1 }, 'number', -1, false, resolver)).toBe(-1);
    });

    it('tests `GroupMemberCountSortingStrategy`', () => {
        const strategy = GroupMemberCountSortingStrategy.instance();
        const records = [
            { brand: 'Ford' }, { brand: 'BMW' }, { brand: 'Ford' },
            { brand: 'Audi' }, { brand: 'BMW' }, { brand: 'Ford' }
        ];

        expect(strategy).toBe(GroupMemberCountSortingStrategy.instance(), 'the strategy is a singleton');

        const grouped = strategy.groupBy(records, 'brand');
        expect(Object.keys(grouped).sort()).toEqual(['Audi', 'BMW', 'Ford']);
        expect(grouped.Ford.length === 3 && grouped.BMW.length === 2 && grouped.Audi.length === 1)
            .toBeTruthy('every record ends up in the group of its field value');

        // Ascending orders the groups from the smallest to the largest member count,
        // with the members of equally sized groups kept in alphabetical order.
        expect(strategy.sort([...records], 'brand', SortingDirection.Asc).map(r => r.brand))
            .toEqual(['Audi', 'BMW', 'BMW', 'Ford', 'Ford', 'Ford']);
        expect(strategy.sort([...records], 'brand', SortingDirection.Desc).map(r => r.brand))
            .toEqual(['Ford', 'Ford', 'Ford', 'BMW', 'BMW', 'Audi']);
    });

    it('tests `FormattedValuesSortingStrategy`', () => {
        const strategy = FormattedValuesSortingStrategy.instance();
        const records = [{ status: 1 }, { status: 3 }, { status: 2 }];
        const resolver = (obj: any, key: string) => obj[key];
        const labels = { 1: 'cancelled', 2: 'Delivered', 3: 'ON HOLD' };
        const gridWithFormatter = {
            getColumnByName: () => ({ formatter: (value: number) => labels[value] })
        } as any;

        expect(strategy).toBe(FormattedValuesSortingStrategy.instance(), 'the strategy is a singleton');

        // Without a grid there is nothing to format, so the raw values decide the order.
        expect(strategy.sort([...records], 'status', SortingDirection.Asc, false, resolver).map(r => r.status))
            .toEqual([1, 2, 3]);

        // With a grid the formatted values decide it: 'Delivered' < 'ON HOLD' < 'cancelled'.
        expect(strategy.sort([...records], 'status', SortingDirection.Asc, false, resolver, false, false, gridWithFormatter)
            .map(r => r.status)).toEqual([2, 3, 1]);
        // Ignoring the case reorders them again: 'cancelled' < 'delivered' < 'on hold'.
        expect(strategy.sort([...records], 'status', SortingDirection.Asc, true, resolver, false, false, gridWithFormatter)
            .map(r => r.status)).toEqual([1, 2, 3]);
        expect(strategy.sort([...records], 'status', SortingDirection.Desc, false, resolver, false, false, gridWithFormatter)
            .map(r => r.status)).toEqual([1, 3, 2]);

        // A column without a formatter, or no column at all, falls back to the raw values.
        const gridWithoutFormatter = { getColumnByName: () => ({}) } as any;
        const gridWithoutColumn = { getColumnByName: () => null } as any;
        expect(strategy.sort([...records], 'status', SortingDirection.Asc, false, resolver, false, false, gridWithoutFormatter)
            .map(r => r.status)).toEqual([1, 2, 3]);
        expect(strategy.sort([...records], 'status', SortingDirection.Asc, false, resolver, false, false, gridWithoutColumn)
            .map(r => r.status)).toEqual([1, 2, 3]);
    });

});

/**
 * Exposes the protected `compareObjects` of the default strategy so that it can be tested directly -
 * the public `sort` no longer routes through it since it prepares the sort values up front.
 */
class TestSortingStrategy extends DefaultSortingStrategy {
    constructor() {
        super();
    }

    public compare(
        obj1: any,
        obj2: any,
        key: string,
        reverse: number,
        ignoreCase: boolean,
        valueResolver: (obj: any, key: string) => any
    ): number {
        return this.compareObjects(obj1, obj2, key, reverse, ignoreCase, valueResolver, false, false);
    }
}
