import { columnFieldPath, parseDate, resolveNestedPath } from '../core/utils';
import { GridType } from '../grids/common/grid.interface';




export interface IMergeByResult {
    rowSpan: number;
    root?: any;
}

/**
 * Merge strategy interface.
 */
export interface IGridMergeStrategy {
    /* blazorSuppress */
    /**
     * Function that processes merging of the whole data per merged field.
     * Returns collection where object has reference to the original record and map of the cell merge metadata per field.
     */
    merge: (
        /* The original data to merge. */
        data: any[],
        /* The field in the data to merge. */
        field: string,
        /* Custom comparer function to use for field. */
        comparer: (prevRecord: any, currentRecord: any, field: string) => boolean,
        /* Existing merge result to which to add the field specific metadata for merging. */
        result: any[],
        /* The active row indexes, where merging should break the sequence. */
        activeRowIndexes: number[],
        /* (Optional) Indicates if the field is of type Date. */
        isDate?: boolean,
        /* (Optional) Indicates if the field is of type Time. */
        isTime?: boolean,
        /* (Optional) Reference to the grid */
        grid?: GridType
    ) => any[];
    /**
     * Function that compares values for merging. Returns true if same, false if different.
     */
    comparer: (prevRecord: any, record: any, field: string) => boolean;
}

export class DefaultMergeStrategy implements IGridMergeStrategy {
    protected static _instance: DefaultMergeStrategy = null;

    public static instance(): DefaultMergeStrategy {
        return this._instance || (this._instance = new this());
    }

    /* blazorSuppress */
    public merge(
        data: any[],
        field: string,
        comparer: (prevRecord: any, record: any, field: string, isDate?: boolean, isTime?: boolean) => boolean = this.comparer,
        result: any[],
        activeRowIndexes: number[],
        isDate = false,
        isTime = false,
        grid?: GridType
    ) {
        let prev = null;
        let index = 0;
        for (const rec of data) {

            const recData = result[index];
            // if this is active row or some special record type - add and skip merging
            if (activeRowIndexes.indexOf(index) != -1 || (grid && grid.isDetailRecord(rec) || grid.isGroupByRecord(rec) || grid.isChildGridRecord(rec))) {
                if (!recData) {
                    result.push(rec);
                }
                prev = null;
                index++;
                continue;
            }
            let recToUpdateData = recData ?? { recordRef: grid.isGhostRecord(rec) ? rec.recordRef : rec, cellMergeMeta: new Map<string, IMergeByResult>(), ghostRecord: rec.ghostRecord };
            recToUpdateData.cellMergeMeta.set(field, { rowSpan: 1 });
            if (prev && comparer.call(this, prev.recordRef, recToUpdateData.recordRef, field, isDate, isTime) && prev.ghostRecord === recToUpdateData.ghostRecord) {
                const root = prev.cellMergeMeta.get(field)?.root ?? prev;
                root.cellMergeMeta.get(field).rowSpan += 1;
                recToUpdateData.cellMergeMeta.get(field).root = root;
            }
            prev = recToUpdateData;
            if (!recData) {
                result.push(recToUpdateData);
            }
            index++;
        }
        return result;
    }

    /* blazorSuppress */
    public comparer(prevRecord: any, record: any, field: string, isDate = false, isTime = false): boolean {
        const a = this.getFieldValue(prevRecord,field, isDate, isTime);
        const b = this.getFieldValue(record,field, isDate, isTime);
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return true;
            }
            return false;
        } else if (bn) {
            return false;
        }
        return a === b;
    }

    /**
     * Retrieves the value of the specified field from the given object, considering date and time data types.
     * `key`: The key of the field to retrieve.
     * `isDate`: (Optional) Indicates if the field is of type Date.
     * `isTime`: (Optional) Indicates if the field is of type Time.
     * Returns the value of the specified field in the data object.
     * @internal
     */
    protected getFieldValue<T>(obj: T, key: string, isDate = false, isTime = false) {
        let resolvedValue = resolveNestedPath(obj, columnFieldPath(key));
        if (isDate || isTime) {
            resolvedValue = this.getDateValue(resolvedValue, isDate, isTime);
        }
        return resolvedValue;
    }

    /**
   * @internal
   */
    protected getDateValue<T>(obj: T, isDate = false, isTime = false) {
        let date = obj instanceof Date ? obj : parseDate(obj);
        let resolvedValue;
        if (isDate && isTime) {
            // date + time
            resolvedValue = date.getTime();
        } else if (date && isDate && !isTime) {
            // date, but no time
            resolvedValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
        } else if (date && isTime && !isDate) {
            // just time
            resolvedValue = new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        }
        return resolvedValue;
    }
}


export class DefaultTreeGridMergeStrategy extends DefaultMergeStrategy {
    /* blazorSuppress */
    public override comparer(prevRecord: any, record: any, field: string, isDate = false, isTime = false): boolean {
        const a = this.getFieldValue( prevRecord.data, field, isDate, isTime);
        const b = this.getFieldValue(record.data,field, isDate, isTime);
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return true;
            }
            return false;
        } else if (bn) {
            return false;
        }
        return a === b;
    }
}

export class ByLevelTreeGridMergeStrategy extends DefaultMergeStrategy {
    /* blazorSuppress */
    public override comparer(prevRecord: any, record: any, field: string, isDate = false, isTime = false): boolean {
        const a = this.getFieldValue( prevRecord.data, field, isDate, isTime);
        const b = this.getFieldValue(record.data,field, isDate, isTime);
        const levelA = prevRecord.level;
        const levelB = record.level;
        const an = (a === null || a === undefined);
        const bn = (b === null || b === undefined);
        if (an) {
            if (bn) {
                return true;
            }
            return false;
        } else if (bn) {
            return false;
        }
        return a === b && levelA === levelB;
    }
}
