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
        const res = grouping.sort(data, expr);
        const gres = grouping.groupBy(res, expr);
        expect(dataGenerator.getValuesForColumn(gres.data, 'boolean'))
                    .toEqual([false, false, false, true, true]);
        const group1: IGroupByRecord = gres.metadata[0];
        const group2: IGroupByRecord = gres.metadata[3];
        expect(gres.metadata[1]).toEqual(group1);
        expect(gres.metadata[2]).toEqual(group1);
        expect(gres.metadata[4]).toEqual(group2);
        expect(group1.level).toEqual(0);
        expect(group2.level).toEqual(0);
        expect(group1.records).toEqual(gres.data.slice(0, 3));
        expect(group2.records).toEqual(gres.data.slice(3, 5));
        expect(group1.value).toEqual(false);
        expect(group2.value).toEqual(true);
    });
});
