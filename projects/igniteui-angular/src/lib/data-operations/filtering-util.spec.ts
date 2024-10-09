import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from 'igniteui-angular';
import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { FilteringUtil } from './filtering-util';

function serialize(value: unknown, pretty = false) {
    return pretty ? JSON.stringify(value, undefined, ' ') : JSON.stringify(value)
}

describe('Unit testing FilteringUtil', () => {
    it('Basic tree should deserialize correctly', () => {
        const serialized = '{"operator":0,"returnFields":["*"],"filteringOperands":[]}';
        const tree = FilteringUtil.recreateTree(JSON.parse(serialized));

        expect(tree).toBeInstanceOf(FilteringExpressionsTree);
        expect(tree.filteringOperands.length).toBe(0);
        expect(tree.operator).toEqual(FilteringLogic.And);
    });

    it('Expression type hints should resolve correctly when deserializing', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        const currDate = new Date();

        // number
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxNumberFilteringOperand.instance().condition('equals'),
            conditionName: 'equals',
            searchVal: 100
        });

        // boolean
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxBooleanFilteringOperand.instance().condition('false'),
            conditionName: 'false',
            searchVal: false
        });

        // string
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxStringFilteringOperand.instance().condition('equals'),
            conditionName: 'equals',
            searchVal: 'test'
        });

        // DateTime
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxDateTimeFilteringOperand.instance().condition('equals'),
            conditionName: 'equals',
            searchVal: currDate
        });

        // Date
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxDateFilteringOperand.instance().condition('equals'),
            conditionName: 'equals',
            searchVal: currDate
        });

        // Time
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxTimeFilteringOperand.instance().condition('at'),
            conditionName: 'at',
            searchVal: currDate
        });

        // misc
        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxFilteringOperand.instance().condition('in'),
            conditionName: 'in',
            searchVal: null
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxFilteringOperand.instance().condition('notIn'),
            conditionName: 'notIn',
            searchVal: null
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxFilteringOperand.instance().condition('null'),
            conditionName: 'null',
            searchVal: null
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxFilteringOperand.instance().condition('notNull'),
            conditionName: 'notNull',
            searchVal: null
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);

        for (let index = 0; index < tree.filteringOperands.length; index++) {
            const op = tree.filteringOperands[index] as IFilteringExpression;
            const reconstructedOp = deserializedTree.filteringOperands[index] as IFilteringExpression;

            expect(reconstructedOp.condition.logic.toString()).toBe(op.condition.logic.toString());
            expect(reconstructedOp.condition.name).toBe(op.condition.name);
            expect(reconstructedOp.conditionName).toBe(op.conditionName);
        }
    });

    it('Sub-queries should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, undefined, 'myEntity', ['Id']);
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'otherEntity', ['*']);
        innerTree.filteringOperands.push({
            fieldName: 'Id',
            condition: IgxBooleanFilteringOperand.instance().condition('true'),
            conditionName: 'true',
            searchVal: true
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'in',
            condition: IgxFilteringOperand.instance().condition('in'),
            searchTree: innerTree
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;
        const nestedOperand = firstOperand.searchTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.conditionName).toBe('in');
        expect(nestedOperand.condition.logic(true, nestedOperand.searchVal)).toBe(true);
        expect(nestedOperand.conditionName).toBe('true');
    });

    it('Number search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: 100
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(100, firstOperand.searchVal)).toBe(true);
    });

    it('Boolean search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'false',
            searchVal: false
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(false, firstOperand.searchVal)).toBe(true);
    });

    it('String search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: 'potato'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic('potato', firstOperand.searchVal)).toBe(true);
    });

    it('Date search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: '2022/3/3'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(new Date(2022, 2, 3), firstOperand.searchVal)).toBe(true);
    });

    it('DateTime search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        const currDate = new Date();
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: currDate.toISOString()
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(currDate, firstOperand.searchVal)).toBe(true);
    });

    it('Time search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'at',
            searchVal: '18:30:00'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(new Date(2020, 9, 2, 18, 30, 0, 0), firstOperand.searchVal)).toBe(true);
    });

    it('Nested tree should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['Id']);
        const subTree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField2', 'myEntity2', ['Id']);
        const currDate = new Date();

        tree.filteringOperands.push({
            fieldName: 'date',
            conditionName: 'equals',
            searchVal: currDate.toISOString()
        });
        subTree.filteringOperands.push({
            fieldName: 'id',
            conditionName: 'greaterThan',
            searchVal: 123
        });
        tree.filteringOperands.push(subTree);

        const serializedTree = serialize(tree, true);
        const deserializedTree = FilteringUtil.recreateTreeFromJson(serializedTree);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;
        const nestedCondition = (deserializedTree.filteringOperands[1] as IFilteringExpressionsTree).filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.name).toBe('equals');
        expect(firstOperand.condition.logic(currDate, firstOperand.searchVal)).toBe(true);

        expect(nestedCondition.condition.name).toBe('greaterThan')
        expect(nestedCondition.condition.logic(200, nestedCondition.searchVal)).toBe(true);
    });
});
