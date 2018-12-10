import { Pipe, PipeTransform } from '@angular/core';
import { cloneArray, cloneHierarchicalArray } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { GridBaseAPIService } from '../api.service';
import { IgxTreeGridComponent } from './tree-grid.component';
import { ISortingExpression } from '../../../public_api';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IgxGridBaseComponent, IgxSummaryResult } from '../grid';

/**
 *@hidden
 */
@Pipe({
    name: 'treeGridHierarchizing',
    pure: true
})
export class IgxTreeGridHierarchizingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: any[], primaryKey: string, foreignKey: string, childDataKey: string,
        id: string, pipeTrigger: number): ITreeGridRecord[] {
        const grid = this.gridAPI.get(id);
        let hierarchicalRecords: ITreeGridRecord[] = [];
        const treeGridRecordsMap = new Map<any, ITreeGridRecord>();

        if (primaryKey && foreignKey) {
            hierarchicalRecords = this.hierarchizeFlatData(id, collection, primaryKey, foreignKey, treeGridRecordsMap);
            grid.flatData = grid.data;
        } else if (childDataKey) {
            const flatData: any[] = [];
            hierarchicalRecords = this.hierarchizeRecursive(id, collection, primaryKey, childDataKey, undefined,
                flatData, 0, treeGridRecordsMap);
            grid.flatData = flatData;
        }

        grid.records = treeGridRecordsMap;
        grid.rootRecords = hierarchicalRecords;
        return hierarchicalRecords;
    }

    private getRowID(primaryKey: any, rowData: any) {
        return primaryKey ? rowData[primaryKey] : rowData;
    }

    private hierarchizeFlatData(id: string, collection: any[], primaryKey: string, foreignKey: string, map: Map<any, ITreeGridRecord>):
        ITreeGridRecord[] {
        const result: ITreeGridRecord[] = [];
        const missingParentRecords: ITreeGridRecord[] = [];
        collection.forEach(row => {
            const record: ITreeGridRecord = {
                rowID: this.getRowID(primaryKey, row),
                data: row,
                children: []
            };
            const parent = map.get(row[foreignKey]);
            if (parent) {
                record.parent = parent;
                parent.children.push(record);
            } else {
                missingParentRecords.push(record);
            }

            map.set(row[primaryKey], record);
        });

        missingParentRecords.forEach(record => {
            const parent = map.get(record.data[foreignKey]);
            if (parent) {
                record.parent = parent;
                parent.children.push(record);
            } else {
                result.push(record);
            }
        });

        this.setIndentationLevels(id, result, 0);

        return result;
    }

    private setIndentationLevels(id: string, collection: ITreeGridRecord[], indentationLevel: number) {
        for (let i = 0; i < collection.length; i++) {
            const record = collection[i];
            record.level = indentationLevel;
            record.expanded = this.gridAPI.get_row_expansion_state(id, record.rowID, record.level);

            if (record.children && record.children.length > 0) {
                this.setIndentationLevels(id, record.children, indentationLevel + 1);
            }
        }
    }

    private hierarchizeRecursive(id: string, collection: any[], primaryKey: string, childDataKey: string,
        parent: ITreeGridRecord, flatData: any[], indentationLevel: number, map: Map<any, ITreeGridRecord>): ITreeGridRecord[] {
        const result: ITreeGridRecord[] = [];

        for (let i = 0; i < collection.length; i++) {
            const item = collection[i];
            const record: ITreeGridRecord = {
                rowID: this.getRowID(primaryKey, item),
                data: item,
                parent: parent,
                level: indentationLevel
            };
            record.expanded = this.gridAPI.get_row_expansion_state(id, record.rowID, record.level);
            flatData.push(item);
            map.set(record.rowID, record);
            record.children = item[childDataKey] ?
                this.hierarchizeRecursive(id, item[childDataKey], primaryKey, childDataKey, record, flatData, indentationLevel + 1, map) :
                undefined;
            result.push(record);
        }

        return result;
    }
}

/**
 *@hidden
 */
@Pipe({
    name: 'treeGridFlattening',
    pure: true
})
export class IgxTreeGridFlatteningPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: ITreeGridRecord[], id: string,
        expandedLevels: number, expandedStates: Map<any, boolean>, pipeTrigger: number): any[] {

        const grid: IgxTreeGridComponent = this.gridAPI.get(id);
        const data: any[] = [];

        grid.processedRootRecords = collection;
        grid.processedRecords = new Map<any, ITreeGridRecord>();

        this.getFlatDataRecursive(collection, data, expandedLevels, expandedStates, id, true);

        return data;
    }

    private getFlatDataRecursive(collection: ITreeGridRecord[], data: any[],
        expandedLevels: number, expandedStates: Map<any, boolean>, gridID: string,
        parentExpanded: boolean) {
        if (!collection || !collection.length) {
            return;
        }
        const grid: IgxTreeGridComponent = this.gridAPI.get(gridID);

        for (let i = 0; i < collection.length; i++) {
            const hierarchicalRecord = collection[i];

            if (parentExpanded) {
                data.push(hierarchicalRecord);
            }

            hierarchicalRecord.expanded = this.gridAPI.get_row_expansion_state(gridID,
                hierarchicalRecord.rowID, hierarchicalRecord.level);

            this.updateNonProcessedRecordExpansion(grid, hierarchicalRecord);

            grid.processedRecords.set(hierarchicalRecord.rowID, hierarchicalRecord);

            this.getFlatDataRecursive(hierarchicalRecord.children, data, expandedLevels,
                expandedStates, gridID, parentExpanded && hierarchicalRecord.expanded);
        }
    }

    private updateNonProcessedRecordExpansion(grid: IgxTreeGridComponent, record: ITreeGridRecord) {
        const rec = grid.records.get(record.rowID);
        rec.expanded = record.expanded;
    }
}

/** @hidden */
@Pipe({
    name: 'treeGridSorting',
    pure: true
})
export class IgxTreeGridSortingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(
        hierarchicalData: ITreeGridRecord[],
        expressions: ISortingExpression[],
        id: string,
        pipeTrigger: number): ITreeGridRecord[] {
        const grid = this.gridAPI.get(id);

        let result: ITreeGridRecord[];
        if (!expressions.length) {
            result = hierarchicalData;
        } else {
            result = DataUtil.treeGridSort(hierarchicalData, expressions);
        }

        return result;
    }
}

/** @hidden */
@Pipe({
    name: 'treeGridPaging',
    pure: true
})
export class IgxTreeGridPagingPipe implements PipeTransform {
    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    public transform(collection: ITreeGridRecord[], page = 0, perPage = 15, id: string, pipeTrigger: number): ITreeGridRecord[] {
        const grid = this.gridAPI.get(id);
        if (!grid.paging) {
            return collection;
        }

        const len = collection.length;
        const totalPages = Math.ceil(len / perPage);

        const state = {
            index: (totalPages > 0 && page >= totalPages) ? totalPages - 1 : page,
            recordsPerPage: perPage
        };

        const result: ITreeGridRecord[] = DataUtil.page(cloneArray(collection), state);
        grid.pagingState = state;
        (grid as any)._page = state.index;

        return result;
    }
}
/** @hidden */
@Pipe({
    name: 'treeGridTransaction',
    pure: true
})
export class IgxTreeGridTransactionPipe implements PipeTransform {

    private gridAPI: IgxTreeGridAPIService;

    constructor(gridAPI: GridBaseAPIService<IgxGridBaseComponent>) {
        this.gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    transform(collection: any[], id: string, pipeTrigger: number): any[] {
        const grid: IgxTreeGridComponent = this.gridAPI.get(id);
        if (collection && grid.transactions.enabled) {
            const aggregatedChanges = grid.transactions.getAggregatedChanges(true);
            if (aggregatedChanges.length > 0) {
                const primaryKey = grid.primaryKey;
                if (!primaryKey) {
                    return collection;
                }

                const foreignKey = grid.foreignKey;
                const childDataKey = grid.childDataKey;

                if (foreignKey) {
                    const flatDataClone = cloneArray(collection);
                    return DataUtil.mergeTransactions(
                        flatDataClone,
                        aggregatedChanges,
                        grid.primaryKey);
                } else if (childDataKey) {
                    const hierarchicalDataClone = cloneHierarchicalArray(collection, childDataKey);
                    return DataUtil.mergeHierarchicalTransactions(
                        hierarchicalDataClone,
                        aggregatedChanges,
                        childDataKey,
                        grid.primaryKey);
                }
            }
        }

        return collection;
    }
}
