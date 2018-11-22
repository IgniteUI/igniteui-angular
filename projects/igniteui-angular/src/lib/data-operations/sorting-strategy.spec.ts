import { DataGenerator } from './test-util/data-generator';
import { IgxSorting, DefaultSortingStrategy } from './sorting-strategy';
import { SortingDirection } from './sorting-expression.interface';
import { IGroupByRecord } from './groupby-record.interface';

describe('Unit testing SortingStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: object[];
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

});
