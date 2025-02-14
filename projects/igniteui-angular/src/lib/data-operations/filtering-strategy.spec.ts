import { DataGenerator } from './test-util/data-generator';
import { FilteringStrategy } from './filtering-strategy';
import { FilteringExpressionsTree } from './filtering-expressions-tree';
import { FilteringLogic } from './filtering-expression.interface';
import { IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxBooleanFilteringOperand } from './filtering-condition';


describe('Unit testing FilteringStrategy', () => {
    let dataGenerator: DataGenerator;
    let data: any[];
    let fs: FilteringStrategy;
    beforeEach(() => {
        dataGenerator = new DataGenerator();
        data = dataGenerator.data;
        fs = new FilteringStrategy();
    });
    it ('tests `filter`', () => {
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.And);
        expressionTree.filteringOperands = [
            {
                condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
                conditionName: 'greaterThan',
                fieldName: 'number',
                searchVal: 1
            }
        ];
        const res = fs.filter(data, expressionTree, null, null);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([2, 3, 4]);
    });
    it ('tests `matchRecordByExpressions`', () => {
        const rec = data[0];
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.Or);
        expressionTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                fieldName: 'string',
                ignoreCase: false,
                searchVal: 'ROW'
            },
            {
                condition: IgxNumberFilteringOperand.instance().condition('lessThan'),
                conditionName: 'lessThan',
                fieldName: 'number',
                searchVal: 1
            }
        ];
        const res = fs.matchRecord(rec, expressionTree);
        expect(res).toBeTruthy();
    });
    it ('tests `findMatch`', () => {
        const rec = data[0];
        const res = fs.findMatchByExpression(rec, {
            condition: IgxBooleanFilteringOperand.instance().condition('false'),
            conditionName: 'false',
            fieldName: 'boolean'
        });
        expect(res).toBeTruthy();
    });
    it ('tests default settings', () => {
        (data[0] as { string: string }).string = 'ROW';
        const filterstr = new FilteringStrategy();
        const expressionTree = new FilteringExpressionsTree(FilteringLogic.And);
        expressionTree.filteringOperands = [
            {
                condition: IgxStringFilteringOperand.instance().condition('contains'),
                conditionName: 'contains',
                fieldName: 'string',
                searchVal: 'ROW'
            }
        ];
        const res = filterstr.filter(data, expressionTree, null, null);
        expect(dataGenerator.getValuesForColumn(res, 'number'))
                    .toEqual([0]);
    });
});
