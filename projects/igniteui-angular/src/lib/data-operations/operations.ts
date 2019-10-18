import { IGroupByKey } from './groupby-expand-state.interface';
import { IGroupByRecord } from './groupby-record.interface';

export function isHierarchyMatch(h1: Array<IGroupByKey>, h2: Array<IGroupByKey>): boolean {
    if (h1.length !== h2.length) {
        return false;
    }
    return h1.every((level, index): boolean => {
        return level.fieldName === h2[index].fieldName && level.value === h2[index].value;
    });
}

export function getHierarchy(gRow: IGroupByRecord): Array<IGroupByKey> {
    const hierarchy: Array<IGroupByKey> = [];
    if (gRow !== undefined && gRow.expression) {
        hierarchy.push({ fieldName: gRow.expression.fieldName, value: gRow.value });
        while (gRow.groupParent) {
            gRow = gRow.groupParent;
            hierarchy.unshift({ fieldName: gRow.expression.fieldName, value: gRow.value });
        }
    }
    return hierarchy;
}
