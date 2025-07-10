import { GridCellMergeMode, IMergeByResult } from 'igniteui-angular';
import type { KeyOfOrString } from '../core/types';
import { IBaseEventArgs } from '../core/utils';
import { ColumnType, GridType } from '../grids/common/grid.interface';


export interface IGridMergeStrategy {
    /* blazorSuppress */
    merge: (
        data: any[],
        field: string,
        comparer: (prevRecord: any, currentRecord: any, field: string) => boolean,
        result: any[]
    ) => any[];
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
        result: any[]
    ) {
        let prev = null;
        let index = 0;
        for (const rec of data) {

            const recData = result[index];
            // if this is some special record type - add and skip merging
            if (rec.ghostRecord) {
                if(!recData) {
                    result.push(rec);
                }
                prev = null;
                index++;
                continue;
            }
            let recToUpdateData = recData ?? { recordRef: rec, cellMergeMeta: new Map<string, IMergeByResult>() };
            recToUpdateData.cellMergeMeta.set(field, { rowSpan: 1 });
            if (prev && comparer(prev.recordRef, recToUpdateData.recordRef, field)) {
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
