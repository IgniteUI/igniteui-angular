import { GridType } from '../grids/common/grid.interface';




export interface IMergeByResult {
    rowSpan: number;
    root?: any;
    prev?: any;
}

export interface IGridMergeStrategy {
    /* blazorSuppress */
    merge: (
        data: any[],
        field: string,
        comparer: (prevRecord: any, currentRecord: any, field: string) => boolean,
        result: any[],
        activeRowIndex? : number,
        grid?: GridType
    ) => any[];
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
        comparer: (prevRecord: any, record: any, field: string) => boolean = this.comparer,
        result: any[],
        activeRowIndex?: number,
        grid?: GridType
    ) {
        let prev = null;
        let index = 0;
        for (const rec of data) {

            const recData = result[index];
            // if this is active row or some special record type - add and skip merging
            if (activeRowIndex === index || (grid && grid.isDetailRecord(rec) || grid.isGroupByRecord(rec) || grid.isChildGridRecord(rec))) {
                if(!recData) {
                    result.push(rec);
                }
                prev = null;
                index++;
                continue;
            }
            let recToUpdateData = recData ?? { recordRef: grid.isGhostRecord(rec) ? rec.recordRef : rec, cellMergeMeta: new Map<string, IMergeByResult>(), ghostRecord: rec.ghostRecord };
            recToUpdateData.cellMergeMeta.set(field, { rowSpan: 1 });
            if (prev && comparer(prev.recordRef, recToUpdateData.recordRef, field) && prev.ghostRecord === recToUpdateData.ghostRecord) {
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
    public comparer(prevRecord: any, record: any, field: string): boolean {
        const a = prevRecord[field];
        const b = record[field];
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


export class DefaultTreeGridMergeStrategy extends DefaultMergeStrategy {
    /* blazorSuppress */
    public override comparer(prevRecord: any, record: any, field: string): boolean {
        const a = prevRecord.data[field];
        const b = record.data[field];
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
    public override comparer(prevRecord: any, record: any, field: string): boolean {
        const a = prevRecord.data[field];
        const b = record.data[field];
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
