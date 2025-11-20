import { IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';
import { IGroupingExpression } from './grouping-expression.interface';
import { DefaultSortingStrategy } from './sorting-strategy';

export const isHierarchyMatch = (h1: Array<IGroupByKey>, h2: Array<IGroupByKey>, expressions: IGroupingExpression[]): boolean => {
    if (h1.length !== h2.length) {
        return false;
    }
    return h1.every((level, index): boolean => {
        const expr = expressions.find(e => e.fieldName === level.fieldName);
        const comparer = expr.groupingComparer || DefaultSortingStrategy.instance().compareValues;
        return level.fieldName === h2[index].fieldName && comparer(level.value, h2[index].value) === 0;
    });
};

export const getHierarchy = (gRow: IGroupByRecord): Array<IGroupByKey> => {
    const hierarchy: Array<IGroupByKey> = [];
    if (gRow !== undefined && gRow.expression) {
        hierarchy.push({ fieldName: gRow.expression.fieldName, value: gRow.value });
        while (gRow.groupParent) {
            gRow = gRow.groupParent;
            hierarchy.unshift({ fieldName: gRow.expression.fieldName, value: gRow.value });
        }
    }
    return hierarchy;
};
