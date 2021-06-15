import { EventEmitter } from '@angular/core';
import { cloneArray, cloneValue, IBaseEventArgs, resolveNestedPath, yieldingLoop } from '../../core/utils';
import { GridColumnDataType, DataUtil } from '../../data-operations/data-util';
import { ExportUtilities } from './export-utilities';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { ITreeGridRecord } from '../../grids/tree-grid/tree-grid.interfaces';
import { TreeGridFilteringStrategy } from '../../grids/tree-grid/tree-grid.filtering.strategy';
import { IGroupingState } from '../../data-operations/groupby-state.interface';
import { getHierarchy, isHierarchyMatch } from '../../data-operations/operations';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { IgxColumnComponent, IgxGridBaseDirective } from '../../grids/public_api';
import { IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { IgxGridComponent } from '../../grids/grid/public_api';
import { DatePipe } from '@angular/common';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxHierarchicalGridComponent } from '../../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from '../../grids/hierarchical-grid/row-island.component';
import { IPathSegment } from './../../grids/hierarchical-grid/hierarchical-grid-base.directive';
import { IgxColumnGroupComponent } from './../../grids/columns/column-group.component';

export enum ExportRecordType {
    GroupedRecord = 1,
    TreeGridRecord = 2,
    DataRecord = 3,
    HierarchicalGridRecord = 4,
    HeaderRecord = 5,
}

export enum HeaderType {
    ColumnHeader = 1,
    MultiColumnHeader = 2
}

export interface IExportRecord {
    data: any;
    level: number;
    type: ExportRecordType;
    owner?: string | IgxGridBaseDirective;
    hidden?: boolean;
}

export interface IColumnList {
    columns: IColumnInfo[];
    columnWidths: number[];
    indexOfLastPinnedColumn: number;
    maxLevel?: number;
}

export interface IColumnInfo {
    header: string;
    field: string;
    skip: boolean;
    dataType?: GridColumnDataType;
    skipFormatter?: boolean;
    formatter?: any;
    headerType?: HeaderType;
    startIndex?: number;
    columnSpan?: number;
    level?: number;
    exportIndex?: number;
    pinnedIndex?: number;
}
/**
 * rowExporting event arguments
 * this.exporterService.rowExporting.subscribe((args: IRowExportingEventArgs) => {
 * // set args properties here
 * })
 */
export interface IRowExportingEventArgs extends IBaseEventArgs {
    /**
     * Contains the exporting row data
     */
    rowData: any;

    /**
     * Contains the exporting row index
     */
    rowIndex: number;

    /**
     * Skip the exporting row when set to true
     */
    cancel: boolean;
}

/**
 * columnExporting event arguments
 * ```typescript
 * this.exporterService.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
 * // set args properties here
 * });
 * ```
 */
export interface IColumnExportingEventArgs extends IBaseEventArgs {
    /**
     * Contains the exporting column header
     */
    header: string;

    /**
     * Contains the exporting column field name
     */
    field: string;

    /**
     * Contains the exporting column index
     */
    columnIndex: number;

    /**
     * Skip the exporting column when set to true
     */
    cancel: boolean;

    /**
     * Export the column's data without applying its formatter, when set to true
     */
    skipFormatter: boolean;

    /**
     * A reference to the grid owner.
     */
    grid?: IgxGridBaseDirective;
}

/**hidden
 * A helper class used to identify whether the user has set a specific columnIndex
 * during columnExporting, so we can honor it at the exported file.
*/
class IgxColumnExportingEventArgs implements IColumnExportingEventArgs {
    public header: string;
    public field: string;
    public cancel: boolean;
    public skipFormatter: boolean;
    public grid?: IgxGridBaseDirective;
    public owner?: any;
    public userSetIndex? = false;

    private _columnIndex?: number;

    public get columnIndex(): number {
        return this._columnIndex;
    }

    public set columnIndex(value: number) {
        this._columnIndex = value;
        this.userSetIndex = true;
    }

    constructor(original: IColumnExportingEventArgs) {
        this.header = original.header;
        this.field = original.field;
        this.cancel = original.cancel;
        this.skipFormatter = original.skipFormatter;
        this.grid = original.grid;
        this.owner = original.owner;
        this._columnIndex = original.columnIndex;
    }
}

export const DEFAULT_OWNER = 'default';
const DEFAULT_COLUMN_WIDTH = 8.43;

export abstract class IgxBaseExporter {

    public exportEnded = new EventEmitter<IBaseEventArgs>();

    /**
     * This event is emitted when a row is exported.
     * ```typescript
     * this.exporterService.rowExporting.subscribe((args: IRowExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public rowExporting = new EventEmitter<IRowExportingEventArgs>();

    /**
     * This event is emitted when a column is exported.
     * ```typescript
     * this.exporterService.columnExporting.subscribe((args: IColumnExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public columnExporting = new EventEmitter<IColumnExportingEventArgs>();

    protected _sort = null;
    protected _ownersMap: Map<any, IColumnList> = new Map<any, IColumnList>();

    private flatRecords: IExportRecord[] = [];
    private options: IgxExporterOptionsBase;

    /**
     * Method for exporting IgxGrid component's data.
     * ```typescript
     * this.exporterService.export(this.igxGridForExport, this.exportOptions);
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public export(grid: any, options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        this.options = options;
        //this.options.ignoreMultiColumnHeaders = true;
        let columns = grid.columnList.toArray();

        if (this.options.ignoreMultiColumnHeaders) {
            columns = columns.filter(col => col.children === undefined);
        }

        const columnList = this.getColumns(columns);

        const tagName = grid.nativeElement.tagName.toLowerCase();

        if (tagName === 'igx-hierarchical-grid') {
            this._ownersMap.set(grid, columnList);

            const childLayoutList = (grid as IgxHierarchicalGridComponent).childLayoutList;

            for (const island of childLayoutList) {
                this.mapHierarchicalGridColumns(island);
            }
        } else {
            this._ownersMap.set(DEFAULT_OWNER, columnList);
        }

        this.prepareData(grid);
        this.exportGridRecordsData(this.flatRecords, grid);
    }

    /**
     * Method for exporting any kind of array data.
     * ```typescript
     * this.exporterService.exportData(this.arrayForExport, this.exportOptions);
     * ```
     *
     * @memberof IgxBaseExporter
     */
    public exportData(data: any[], options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        this.options = options;

        const records = data.map(d => {
            const record: IExportRecord = {
                data: d,
                type: ExportRecordType.DataRecord,
                level: 0
            };

            return record;
        });

        this.exportGridRecordsData(records);
    }

    private exportGridRecordsData(records: IExportRecord[], grid?: IgxGridBaseDirective) {
        if (this._ownersMap.size === 0) {
            const recordsData = records.map(r => r.data);
            const keys = ExportUtilities.getKeysFromData(recordsData);
            const columns = keys.map((k) => ({ header: k, field: k, skip: false }));
            const columnWidths = new Array<number>(keys.length).fill(DEFAULT_COLUMN_WIDTH);

            const mapRecord: IColumnList = {
                columns,
                columnWidths,
                indexOfLastPinnedColumn: -1
            };

            this._ownersMap.set(DEFAULT_OWNER, mapRecord);
        }

        let shouldReorderColumns = false;
        for (const [key, mapRecord] of this._ownersMap) {
            let skippedPinnedColumnsCount = 0;
            let columnsWithoutHeaderCount = 1;
            let indexOfLastPinnedColumn = mapRecord.indexOfLastPinnedColumn;

            mapRecord.columns.forEach((column, index) => {
                if (!column.skip) {
                    const columnExportArgs: IColumnExportingEventArgs = {
                        header: !ExportUtilities.isNullOrWhitespaces(column.header) ?
                            column.header :
                            'Column' + columnsWithoutHeaderCount++,
                        field: column.field,
                        columnIndex: index,
                        cancel: false,
                        skipFormatter: false,
                        grid: key === DEFAULT_OWNER ? grid : key
                    };

                    const newColumnExportArgs = new IgxColumnExportingEventArgs(columnExportArgs);
                    this.columnExporting.emit(newColumnExportArgs);

                    column.header = newColumnExportArgs.header;
                    column.skip = newColumnExportArgs.cancel;
                    column.skipFormatter = newColumnExportArgs.skipFormatter;

                    if (newColumnExportArgs.userSetIndex) {
                        column.exportIndex = newColumnExportArgs.columnIndex;
                        shouldReorderColumns = true;
                    }

                    if (column.skip && index <= indexOfLastPinnedColumn) {
                        skippedPinnedColumnsCount++;
                    }

                    if (this._sort && this._sort.fieldName === column.field) {
                        if (column.skip) {
                            this._sort = null;
                        } else {
                            this._sort.fieldName = column.header;
                        }
                    }
                }
            });

            indexOfLastPinnedColumn -= skippedPinnedColumnsCount;

            // Reorder columns only if a column has been assigned a specific columnIndex during columnExporting event
            if (shouldReorderColumns) {
                mapRecord.columns = this.reorderColumns(mapRecord.columns);
            }
        }


        const dataToExport = new Array<IExportRecord>();
        const actualData = records[0]?.data;
        const isSpecialData = ExportUtilities.isSpecialData(actualData);

        yieldingLoop(records.length, 100, (i) => {
            const row = records[i];
            this.exportRow(dataToExport, row, i, isSpecialData);
        }, () => {
            this.exportDataImplementation(dataToExport, this.options);
            this.resetDefaults();
        });
    }

    private exportRow(data: IExportRecord[], record: IExportRecord, index: number, isSpecialData: boolean) {
        if (!isSpecialData && record.type !== ExportRecordType.HeaderRecord) {
            const columns = record.owner === undefined ?
                this._ownersMap.get(DEFAULT_OWNER).columns
                    .filter(c => c.headerType !== HeaderType.MultiColumnHeader)
                    .sort((a, b) => a.startIndex - b.startIndex)
                    .sort((a, b) => a.pinnedIndex - b.pinnedIndex) :
                this._ownersMap.get(record.owner).columns;

            record.data = columns.reduce((a, e) => {
                if (!e.skip) {
                    let rawValue = resolveNestedPath(record.data, e.field);

                    const shouldApplyFormatter = e.formatter && !e.skipFormatter && record.type !== ExportRecordType.GroupedRecord;

                    if (e.dataType === 'date' &&
                        !(rawValue instanceof Date) &&
                        !shouldApplyFormatter &&
                        rawValue !== undefined &&
                        rawValue !== null) {
                        rawValue = new Date(rawValue);
                    } else if (e.dataType === 'string' && rawValue instanceof Date) {
                        rawValue = rawValue.toString();
                    }

                    a[e.header] = shouldApplyFormatter ? e.formatter(rawValue) : rawValue;
                }
                return a;
            }, {});
        }

        const rowArgs = {
            rowData: record.data,
            rowIndex: index,
            cancel: false
        };

        this.rowExporting.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(record);
        }
    }

    private reorderColumns(columns: IColumnInfo[]): IColumnInfo[] {
        const filteredColumns = columns.filter(c => !c.skip);
        const length = filteredColumns.length;
        const specificIndicesColumns = filteredColumns.filter((col) => !isNaN(col.exportIndex))
                                                      .sort((a,b) => a.exportIndex - b.exportIndex);
        const indices = specificIndicesColumns.map(col => col.exportIndex);

        specificIndicesColumns.forEach(col => {
            filteredColumns.splice(filteredColumns.indexOf(col), 1);
        });

        const reorderedColumns = new Array(length);

        if (specificIndicesColumns.length > Math.max(...indices)) {
            return specificIndicesColumns.concat(filteredColumns);
        } else {
            indices.forEach((i, index) => {
                if (i < 0 || i >= length) {
                    filteredColumns.push(specificIndicesColumns[index]);
                } else {
                    let k = i;
                    while (k < length && reorderedColumns[k] !== undefined) {
                        ++k;
                    }
                    reorderedColumns[k] = specificIndicesColumns[index];
                }
            });

            for (let i = 0; i < length; i++) {
                if (reorderedColumns[i] === undefined) {
                    reorderedColumns[i] = filteredColumns.splice(0, 1)[0];
                }
            }

        }
        return reorderedColumns;
    }

    private prepareData(grid: IgxGridBaseDirective) {
        this.flatRecords = [];
        const tagName = grid.nativeElement.tagName.toLowerCase();

        const hasFiltering = (grid.filteringExpressionsTree && grid.filteringExpressionsTree.filteringOperands.length > 0) ||
            (grid.advancedFilteringExpressionsTree && grid.advancedFilteringExpressionsTree.filteringOperands.length > 0);

        const hasSorting = grid.sortingExpressions &&
            grid.sortingExpressions.length > 0;

        switch (tagName) {
            case 'igx-hierarchical-grid': {
                this.prepareHierarchicalGridData(grid as IgxHierarchicalGridComponent, hasFiltering, hasSorting);
                break;
            }
            case 'igx-tree-grid': {
                this.prepareTreeGridData(grid as IgxTreeGridComponent, hasFiltering, hasSorting);
                break;
            }
            default: {
                this.prepareGridData(grid as IgxGridComponent, hasFiltering, hasSorting);
                break;
            }
        }
    }

    private prepareHierarchicalGridData(grid: IgxHierarchicalGridComponent, hasFiltering: boolean, hasSorting: boolean) {

        const skipOperations =
            (!hasFiltering || !this.options.ignoreFiltering) &&
            (!hasSorting || !this.options.ignoreSorting);

        if (skipOperations) {
            const data = grid.filteredSortedData;
            this.addHierarchicalGridData(grid, data);
        } else {
            let data = grid.data;

            if (hasFiltering && !this.options.ignoreFiltering) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                    strategy: grid.filterStrategy
                };

                data = DataUtil.filter(data, filteringState, grid);
            }

            if (hasSorting && !this.options.ignoreSorting) {
                this._sort = cloneValue(grid.sortingExpressions[0]);

                data = DataUtil.sort(data, grid.sortingExpressions, grid.sortStrategy, grid);
            }

            this.addHierarchicalGridData(grid, data);
        }
    }

    private addHierarchicalGridData(grid: IgxHierarchicalGridComponent, records: any[]) {
        const childLayoutList = grid.childLayoutList;
        const columnFields = this._ownersMap.get(grid).columns.map(col => col.field);

        for (const entry of records) {
            const expansionStateVal = grid.expansionStates.has(entry) ? grid.expansionStates.get(entry) : false;

            const dataWithoutChildren = Object.keys(entry)
                .filter(k => columnFields.includes(k))
                .reduce((obj, key) => {
                    obj[key] = entry[key];
                    return obj;
                }, {});

            const hierarchicalGridRecord: IExportRecord = {
                data: dataWithoutChildren,
                level: 0,
                type: ExportRecordType.HierarchicalGridRecord,
                owner: grid,
            };

            this.flatRecords.push(hierarchicalGridRecord);

            for (const island of childLayoutList) {
                const path: IPathSegment = {
                    rowID: island.primaryKey ? entry[island.primaryKey] : entry,
                    rowIslandKey: island.key
                };

                const islandGrid = grid?.hgridAPI.getChildGrid([path]);
                const keyRecordData = this.prepareIslandData(island, islandGrid, entry[island.key]) || [];

                this.getAllChildColumnsAndData(island, keyRecordData, expansionStateVal, islandGrid);
            }
        }
    }

    private prepareIslandData(island: IgxRowIslandComponent, islandGrid: IgxHierarchicalGridComponent, data: any[]): any[] {
        if (islandGrid !== undefined) {
            const hasFiltering = (islandGrid.filteringExpressionsTree &&
                islandGrid.filteringExpressionsTree.filteringOperands.length > 0) ||
                (islandGrid.advancedFilteringExpressionsTree &&
                    islandGrid.advancedFilteringExpressionsTree.filteringOperands.length > 0);

            const hasSorting = islandGrid.sortingExpressions &&
                islandGrid.sortingExpressions.length > 0;

            const skipOperations =
                (!hasFiltering || !this.options.ignoreFiltering) &&
                (!hasSorting || !this.options.ignoreSorting);

            if (skipOperations) {
                data = islandGrid.filteredSortedData;
            } else {
                if (hasFiltering && !this.options.ignoreFiltering) {
                    const filteringState: IFilteringState = {
                        expressionsTree: islandGrid.filteringExpressionsTree,
                        advancedExpressionsTree: islandGrid.advancedFilteringExpressionsTree,
                        strategy: islandGrid.filterStrategy
                    };

                    data = DataUtil.filter(data, filteringState, islandGrid);
                }

                if (hasSorting && !this.options.ignoreSorting) {
                    this._sort = cloneValue(islandGrid.sortingExpressions[0]);

                    data = DataUtil.sort(data, islandGrid.sortingExpressions, islandGrid.sortStrategy, islandGrid);
                }
            }
        } else {
            const hasFiltering = (island.filteringExpressionsTree &&
                island.filteringExpressionsTree.filteringOperands.length > 0) ||
                (island.advancedFilteringExpressionsTree &&
                    island.advancedFilteringExpressionsTree.filteringOperands.length > 0);

            const hasSorting = island.sortingExpressions &&
                island.sortingExpressions.length > 0;

            const skipOperations =
                (!hasFiltering || this.options.ignoreFiltering) &&
                (!hasSorting || this.options.ignoreSorting);

            if (!skipOperations) {
                if (hasFiltering && !this.options.ignoreFiltering) {
                    const filteringState: IFilteringState = {
                        expressionsTree: island.filteringExpressionsTree,
                        advancedExpressionsTree: island.advancedFilteringExpressionsTree,
                        strategy: island.filterStrategy
                    };

                    data = DataUtil.filter(data, filteringState, island);
                }

                if (hasSorting && !this.options.ignoreSorting) {
                    this._sort = cloneValue(island.sortingExpressions[0]);

                    data = DataUtil.sort(data, island.sortingExpressions, island.sortStrategy, island);
                }
            }
        }

        return data;
    }

    private getAllChildColumnsAndData(island: IgxRowIslandComponent,
        childData: any[], expansionStateVal: boolean, grid: IgxHierarchicalGridComponent) {
        const islandColumnList = island.childColumns.toArray();
        const columnList = this.getColumns(islandColumnList);
        const columnHeader = columnList.columns.map(col => col.header ? col.header : col.field);

        const headerRecord: IExportRecord = {
            data: columnHeader,
            level: island.level,
            type: ExportRecordType.HeaderRecord,
            owner: island,
            hidden: !expansionStateVal
        };

        if (childData && childData.length > 0) {
            this.flatRecords.push(headerRecord);

            for (const rec of childData) {
                const exportRecord: IExportRecord = {
                    data: rec,
                    level: island.level,
                    type: ExportRecordType.HierarchicalGridRecord,
                    owner: island,
                    hidden: !expansionStateVal
                };

                this.flatRecords.push(exportRecord);

                if (island.children.length > 0) {
                    const islandExpansionStateVal = grid === undefined ?
                        false :
                        grid.expansionStates.has(rec) ?
                            grid.expansionStates.get(rec) :
                            false;

                    for (const childIsland of island.children) {
                        const path: IPathSegment = {
                            rowID: childIsland.primaryKey ? rec[childIsland.primaryKey] : rec,
                            rowIslandKey: childIsland.key
                        };

                        const childIslandGrid = grid?.hgridAPI.getChildGrid([path]);
                        const keyRecordData = this.prepareIslandData(island, childIslandGrid, rec[childIsland.key]) || [];

                        this.getAllChildColumnsAndData(childIsland, keyRecordData, islandExpansionStateVal, childIslandGrid);
                    }
                }
            }
        }
    }

    private prepareGridData(grid: IgxGridComponent, hasFiltering: boolean, hasSorting: boolean) {
        const groupedGridGroupingState: IGroupingState = {
            expressions: grid.groupingExpressions,
            expansion: grid.groupingExpansionState,
            defaultExpanded: grid.groupsExpanded,
        };

        const hasGrouping = grid.groupingExpressions &&
            grid.groupingExpressions.length > 0;

        const skipOperations =
            (!hasFiltering || !this.options.ignoreFiltering) &&
            (!hasSorting || !this.options.ignoreSorting) &&
            (!hasGrouping || !this.options.ignoreGrouping);

        if (skipOperations) {
            if (hasGrouping) {
                this.addGroupedData(grid, grid.groupsRecords, groupedGridGroupingState);
            } else {
                this.addFlatData(grid.filteredSortedData);
            }
        } else {
            let gridData = grid.data;

            if (hasFiltering && !this.options.ignoreFiltering) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                    strategy: grid.filterStrategy
                };

                gridData = DataUtil.filter(gridData, filteringState, grid);
            }

            if (hasSorting && !this.options.ignoreSorting) {
                // TODO: We should drop support for this since in a grouped grid it doesn't make sense
                // this._sort = !isGroupedGrid ?
                //     cloneValue(grid.sortingExpressions[0]) :
                //     grid.sortingExpressions.length > 1 ?
                //         cloneValue(grid.sortingExpressions[1]) :
                //         cloneValue(grid.sortingExpressions[0]);

                gridData = DataUtil.sort(gridData, grid.sortingExpressions, grid.sortStrategy, grid);
            }

            if (hasGrouping && !this.options.ignoreGrouping) {
                const groupsRecords = [];
                DataUtil.group(cloneArray(gridData), groupedGridGroupingState, grid, groupsRecords);
                gridData = groupsRecords;
            }

            if (hasGrouping && !this.options.ignoreGrouping) {
                this.addGroupedData(grid, gridData, groupedGridGroupingState);
            } else {
                this.addFlatData(gridData);
            }
        }
    }

    private prepareTreeGridData(grid: IgxTreeGridComponent, hasFiltering: boolean, hasSorting: boolean) {
        const skipOperations =
            (!hasFiltering || !this.options.ignoreFiltering) &&
            (!hasSorting || !this.options.ignoreSorting);

        if (skipOperations) {
            this.addTreeGridData(grid.processedRootRecords);
        } else {
            let gridData = grid.rootRecords;

            if (hasFiltering && !this.options.ignoreFiltering) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                    strategy: (grid.filterStrategy) ? grid.filterStrategy : new TreeGridFilteringStrategy()
                };

                gridData = filteringState.strategy
                    .filter(gridData, filteringState.expressionsTree, filteringState.advancedExpressionsTree);
            }

            if (hasSorting && !this.options.ignoreSorting) {
                this._sort = cloneValue(grid.sortingExpressions[0]);

                gridData = DataUtil.treeGridSort(gridData, grid.sortingExpressions, grid.sortStrategy);
            }

            this.addTreeGridData(gridData);
        }
    }

    private addTreeGridData(records: ITreeGridRecord[], parentExpanded: boolean = true) {
        if (!records) {
            return;
        }

        for (const record of records) {
            const hierarchicalRecord: IExportRecord = {
                data: record.data,
                level: record.level,
                hidden: !parentExpanded,
                type: ExportRecordType.TreeGridRecord
            };
            this.flatRecords.push(hierarchicalRecord);
            this.addTreeGridData(record.children, parentExpanded && record.expanded);
        }
    }

    private addFlatData(records: any) {
        if (!records) {
            return;
        }
        for (const record of records) {
            const data: IExportRecord = {
                data: record,
                type: ExportRecordType.DataRecord,
                level: 0
            };

            this.flatRecords.push(data);
        }
    }

    private addGroupedData(grid: IgxGridComponent, records: IGroupByRecord[],
        groupingState: IGroupingState, parentExpanded: boolean = true) {
        if (!records) {
            return;
        }

        const firstCol = this._ownersMap.get(DEFAULT_OWNER).columns[0].field;

        for (const record of records) {
            let recordVal = record.value;

            const hierarchy = getHierarchy(record);
            const expandState: IGroupByExpandState = groupingState.expansion.find((s) =>
                isHierarchyMatch(s.hierarchy || [{ fieldName: record.expression.fieldName, value: recordVal }], hierarchy));
            const expanded = expandState ? expandState.expanded : groupingState.defaultExpanded;

            const isDate = recordVal instanceof Date;

            if (isDate) {
                const timeZoneOffset = recordVal.getTimezoneOffset() * 60000;
                const isoString = (new Date(recordVal - timeZoneOffset)).toISOString();
                const pipe = new DatePipe(grid.locale);
                recordVal = pipe.transform(isoString);
            }

            const groupExpressionName = record.column && record.column.header ?
                record.column.header :
                record.expression.fieldName;

            recordVal = recordVal !== null ? recordVal : '';

            const groupExpression: IExportRecord = {
                data: { [firstCol]: `${groupExpressionName}: ${recordVal} (${record.records.length})` },
                level: record.level,
                hidden: !parentExpanded,
                type: ExportRecordType.GroupedRecord,
            };

            this.flatRecords.push(groupExpression);

            if (record.groups.length > 0) {
                this.addGroupedData(grid, record.groups, groupingState, expanded && parentExpanded);
            } else {
                const rowRecords = record.records;

                for (const rowRecord of rowRecords) {
                    const currentRecord: IExportRecord = {
                        data: rowRecord,
                        level: record.level + 1,
                        hidden: !(expanded && parentExpanded),
                        type: ExportRecordType.DataRecord,
                    };

                    this.flatRecords.push(currentRecord);
                }
            }
        }
    }

    private getColumns(columns: any[]): IColumnList {
        const colList = [];
        const colWidthList = [];
        const hiddenColumns = [];
        let indexOfLastPinnedColumn = -1;
        let lastVisibleColumnIndex = -1;
        let maxLevel = 0;


        columns.forEach((column) => {
            const columnHeader = !ExportUtilities.isNullOrWhitespaces(column.header) ? column.header : column.field;
            const exportColumn = !column.hidden || this.options.ignoreColumnsVisibility;
            const index = this.options.ignoreColumnsOrder || this.options.ignoreColumnsVisibility ? column.index : column.visibleIndex;
            const columnWidth = Number(column.width?.slice(0, -2)) || DEFAULT_COLUMN_WIDTH;
            const columnLevel = !this.options.ignoreMultiColumnHeaders ? column.level : 0;

            const isMultiColHeader = column instanceof IgxColumnGroupComponent;
            const colSpan = isMultiColHeader ?
                column.allChildren
                    .filter(ch => !(ch instanceof IgxColumnGroupComponent) && (!this.options.ignoreColumnsVisibility ? !ch.hidden : true))
                    .length :
                1;

            const columnInfo: IColumnInfo = {
                header: columnHeader,
                dataType: column.dataType,
                field: column.field,
                skip: !exportColumn,
                formatter: column.formatter,
                skipFormatter: false,

                headerType: isMultiColHeader ? HeaderType.MultiColumnHeader : HeaderType.ColumnHeader,
                columnSpan: colSpan,
                level: columnLevel,
                startIndex: index,
                pinnedIndex: !column.pinned ? Number.MAX_VALUE : !column.hidden ? column.grid.pinnedColumns.indexOf(column) : NaN
            };

            if (column.level > maxLevel && !this.options.ignoreMultiColumnHeaders) {
                maxLevel = column.level;
            }

            if (index !== -1) {
                colList.push(columnInfo);
                colWidthList.push(columnWidth);
                lastVisibleColumnIndex = Math.max(lastVisibleColumnIndex, colList.indexOf(columnInfo));
            } else {
                hiddenColumns.push(columnInfo);
            }

            if (column.pinned && exportColumn && columnInfo.headerType === HeaderType.ColumnHeader) {
                indexOfLastPinnedColumn++;
            }

        });

        //Append the hidden columns to the end of the list
        hiddenColumns.forEach((hiddenColumn) => {
            colList[++lastVisibleColumnIndex] = hiddenColumn;
        });

        const result: IColumnList = {
            columns: colList,
            columnWidths: colWidthList,
            indexOfLastPinnedColumn,
            maxLevel
        };

        return result;
    }

    private mapHierarchicalGridColumns(island: IgxRowIslandComponent) {
        const islandColumnList = island.childColumns.toArray();
        const columnList = this.getColumns(islandColumnList);

        this._ownersMap.set(island, columnList);

        if (island.children.length > 0) {
            for (const childIsland of island.children) {
                this.mapHierarchicalGridColumns(childIsland);
            }
        }
    }

    private resetDefaults() {
        this._sort = null;
        this.flatRecords = [];
        this.options = {} as IgxExporterOptionsBase;
        this._ownersMap.clear();
    }

    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;
}
