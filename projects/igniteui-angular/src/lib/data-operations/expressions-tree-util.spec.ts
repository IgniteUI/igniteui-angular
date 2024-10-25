import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { recreateTree } from './expressions-tree-util';
import { EntityType } from '../grids/common/grid.interface';
import { IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from './filtering-condition';

function serialize(value: unknown, pretty = false) {
    return pretty ? JSON.stringify(value, undefined, ' ') : JSON.stringify(value)
}

describe('Unit testing FilteringUtil', () => {
    it('Expressions should resolve correctly when rehydrating with fields', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const currDate = new Date();

        const fields = [
            { field: 'Id', dataType: 'number' },
            { field: 'Name', dataType: 'string' },
            { field: 'Validated', dataType: 'boolean' },
            { field: 'Date created', dataType: 'date' },
            { field: 'Time created', dataType: 'time' },
            { field: 'DateTime created', dataType: 'dateTime' }
        ];

        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: fields as any,
        }];

        // number
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: 100
        });

        // boolean
        tree.filteringOperands.push({
            fieldName: 'Validated',
            conditionName: 'false'
        });

        // string
        tree.filteringOperands.push({
            fieldName: 'Name',
            conditionName: 'equals',
            searchVal: 'test'
        });

        // DateTime
        tree.filteringOperands.push({
            fieldName: 'DateTime created',
            conditionName: 'equals',
            searchVal: currDate
        });

        // Date
        tree.filteringOperands.push({
            fieldName: 'Date created',
            conditionName: 'equals',
            searchVal: currDate
        });

        // Time
        tree.filteringOperands.push({
            fieldName: 'Time created',
            conditionName: 'at',
            searchVal: currDate
        });

        // misc
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'in'
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'notIn'
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'null'
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'notNull'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);

        for (let index = 0; index < tree.filteringOperands.length; index++) {
            const op = tree.filteringOperands[index] as IFilteringExpression;
            const reconstructedOp = deserializedTree.filteringOperands[index] as IFilteringExpression;

            expect(reconstructedOp.condition.logic).not.toBeNull();
            expect(reconstructedOp.condition.name).toBe(op.conditionName);
            expect(reconstructedOp.conditionName).toBe(op.conditionName);
        }
    });

    it('Sub-queries should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, undefined, 'myEntity', ['*']);
        const innerTree = new FilteringExpressionsTree(FilteringLogic.And, undefined, 'otherEntity', ['*']);
        const entities: EntityType[] = [
            {
                name: 'myEntity',
                fields: [
                    { field: 'Bool', dataType: 'boolean' }
                ] as any[],
            },
            {
                name: 'otherEntity',
                fields: [
                    { field: 'Bool', dataType: 'boolean' }
                ] as any[],
            }
        ];

        innerTree.filteringOperands.push({
            fieldName: 'Bool',
            conditionName: 'true',
            searchVal: true
        });

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'in',
            searchTree: innerTree
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;
        const nestedOperand = firstOperand.searchTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.conditionName).toBe('in');
        expect(nestedOperand.condition.logic(true, nestedOperand.searchVal)).toBe(true);
        expect(nestedOperand.conditionName).toBe('true');
    });

    it('Number search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'number' }
            ] as any,
        }];

        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: 100
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition).toBe(IgxNumberFilteringOperand.instance().condition('equals'));
    });

    it('Boolean search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'boolean' }
            ] as any,
        }];
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'false',
            searchVal: false
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(100, firstOperand.searchVal)).toBe(true);
        expect(firstOperand.condition).toBe(IgxBooleanFilteringOperand.instance().condition('false'));
    });

    it('String search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'string' }
            ] as any,
        }];
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: 'potato'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic('potato', firstOperand.searchVal)).toBe(true);
        expect(firstOperand.condition).toBe(IgxStringFilteringOperand.instance().condition('equals'));
    });

    it('Date search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'date' }
            ] as any,
        }];
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: new Date(2022, 2, 3).toISOString()
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(new Date(2022, 2, 3), firstOperand.searchVal)).toBe(true);
        expect(firstOperand.condition).toBe(IgxDateFilteringOperand.instance().condition('equals'));
    });

    it('DateTime search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'dateTime' }
            ] as any,
        }];
        const currDate = new Date();
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'equals',
            searchVal: currDate.toISOString()
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(currDate, firstOperand.searchVal)).toBe(true);
        expect(firstOperand.condition).toBe(IgxDateTimeFilteringOperand.instance().condition('equals'));
    });

    it('Time search values should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const entities: EntityType[] = [{
            name: 'myEntity',
            fields: [
                { field: 'Id', dataType: 'time' }
            ] as any,
        }];
        tree.filteringOperands.push({
            fieldName: 'Id',
            conditionName: 'at',
            searchVal: '18:30:00'
        });

        const serializedTree = serialize(tree, true);
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.logic(new Date(2020, 9, 2, 18, 30, 0, 0), firstOperand.searchVal)).toBe(true);
        expect(firstOperand.condition).toBe(IgxTimeFilteringOperand.instance().condition('at'));
    });

    it('Nested tree should deserialize correctly', () => {
        const tree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField', 'myEntity', ['*']);
        const subTree = new FilteringExpressionsTree(FilteringLogic.Or, 'myField2', 'myEntity2', ['*']);
        const currDate = new Date();
        const entities: EntityType[] = [
            {
                name: 'myEntity',
                fields: [
                    { field: 'date', dataType: 'date' }
                ] as any[],
            },
            {
                name: 'myEntity2',
                fields: [
                    { field: 'id', dataType: 'number' }
                ] as any[],
            }
        ];

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
        const deserializedTree = recreateTree(JSON.parse(serializedTree), entities);
        const firstOperand = deserializedTree.filteringOperands[0] as IFilteringExpression;
        const nestedCondition = (deserializedTree.filteringOperands[1] as IFilteringExpressionsTree).filteringOperands[0] as IFilteringExpression;

        expect(firstOperand.condition.name).toBe('equals');
        expect(firstOperand.condition.logic(currDate, firstOperand.searchVal)).toBe(true);

        expect(nestedCondition.condition.name).toBe('greaterThan');
        expect(nestedCondition.condition.logic(200, nestedCondition.searchVal)).toBe(true);
    });
});
