import { DataGenerator } from './test-util/data-generator';
import { DefaultSortingStrategy } from './sorting-strategy';
import { SortingDirection } from './sorting-expression.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IgxGrouping } from './grouping-strategy';

describe('Unit testing GroupingStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: object[];
    const grouping = new IgxGrouping();
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
    });

    it('should group by a field', () => {
        const expr = [{
            dir: SortingDirection.Asc,
            fieldName: 'boolean',
            ignoreCase: false,
            strategy: DefaultSortingStrategy.instance()
        }];
        const result = grouping.sort(data, expr);
        const groupResult = grouping.groupBy(result, {
            expressions: expr,
            expansion: [],
            defaultExpanded: true
        });
        expect(dataGenerator.getValuesForColumn(groupResult.data, 'boolean'))
                    .toEqual([undefined, false, false, false, undefined, true, true]);
        const group1: IGroupByRecord = groupResult.metadata[1];
        const group2: IGroupByRecord = groupResult.metadata[5];
        expect(groupResult.metadata[2]).toEqual(group1);
        expect(groupResult.metadata[3]).toEqual(group1);
        expect(groupResult.metadata[6]).toEqual(group2);
        expect(group1.level).toEqual(0);
        expect(group2.level).toEqual(0);
        expect(group1.records).toEqual(result.slice(0, 3));
        expect(group2.records).toEqual(result.slice(3, 5));
        expect(group1.value).toEqual(false);
        expect(group2.value).toEqual(true);
    });
});
