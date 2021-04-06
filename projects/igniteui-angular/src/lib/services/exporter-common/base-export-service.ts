import { EventEmitter } from '@angular/core';
import { cloneArray, cloneValue, IBaseEventArgs, resolveNestedPath, yieldingLoop } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { ExportUtilities } from './export-utilities';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { ITreeGridRecord } from '../../grids/tree-grid/tree-grid.interfaces';
import { TreeGridFilteringStrategy } from '../../grids/tree-grid/tree-grid.filtering.strategy';
import { IGroupingState } from '../../data-operations/groupby-state.interface';
import { getHierarchy, isHierarchyMatch } from '../../data-operations/operations';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IFilteringState } from '../../data-operations/filtering-state.interface';
import { IgxGridBaseDirective } from '../../grids/public_api';
import { IgxTreeGridComponent } from '../../grids/tree-grid/public_api';
import { IgxGridComponent } from '../../grids/grid/public_api';
import { DatePipe } from '@angular/common';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxHierarchicalGridComponent } from '../../grids/hierarchical-grid/hierarchical-grid.component';
import { IgxRowIslandComponent } from './../../../../../../dist/igniteui-angular/esm2015/lib/grids/hierarchical-grid/row-island.component';

export enum ExportRecordType {
    GroupedRecord = 1,
    TreeGridRecord = 2,
    DataRecord = 3,
    HierarchicalGridRecord = 4,
    HeaderRecord = 5,
}

export interface IExportRecord {
    data: any;
    level: number;
    type: ExportRecordType;
    owner?: any;
    hidden?: boolean;
}

export interface IMapRecord {
    indexOfLastPinnedColumn: number;
    columnWidths: number[];
    columns: any;
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
}

const DEFAULT_OWNER = 'default';
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
    protected _ownersMap: Map<any, IMapRecord> = new Map<any, IMapRecord>();

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

        const columns = grid.columnList.toArray();
        const colDefinitions = this.getColumns(columns);

        const mapRecord: IMapRecord = {
            columns: colDefinitions.colList,
            columnWidths: colDefinitions.colWidthList,
            indexOfLastPinnedColumn: colDefinitions.indexOfLastPinnedColumn,
        };

        const tagName = grid.nativeElement.tagName.toLowerCase();

        if (tagName === 'igx-hierarchical-grid') {
            this._ownersMap.set(grid, mapRecord);

            const keys = (grid as IgxHierarchicalGridComponent).childLayoutKeys;

            for (const key of keys) {
                const rowIsland = grid.childLayoutList.filter(l => l.key === key)[0];
                this.mapHierarchicalGridColumns(rowIsland);
            }
        } else {
            this._ownersMap.set(DEFAULT_OWNER, mapRecord);
        }

        this.prepareData(grid);
        this.exportGridRecordsData(this.flatRecords);
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

    private exportGridRecordsData(records: IExportRecord[]) {
        if (this._ownersMap.size === 0) {
            const recordsData = records.map(r => r.data);
            const keys = ExportUtilities.getKeysFromData(recordsData);
            const columns = keys.map((k) => ({ header: k, field: k, skip: false }));
            const columnWidths = new Array<number>(keys.length).fill(DEFAULT_COLUMN_WIDTH);

            const mapRecord: IMapRecord = {
                columns,
                columnWidths,
                indexOfLastPinnedColumn: -1
            };

            this._ownersMap.set(DEFAULT_OWNER, mapRecord);
        }

        for (const [key, mapRecord] of this._ownersMap) {
            let skippedPinnedColumnsCount = 0;
            let columnsWithoutHeaderCount = 1;
            let indexOfLastPinnedColumn = mapRecord.indexOfLastPinnedColumn;

            mapRecord.columns.forEach((column, index) => {
                if (!column.skip) {
                    const columnExportArgs = {
                        header: !ExportUtilities.isNullOrWhitespaces(column.header) ?
                            column.header :
                            'Column' + columnsWithoutHeaderCount++,
                        field: column.field,
                        columnIndex: index,
                        cancel: false,
                        skipFormatter: false,
                        owner: key === DEFAULT_OWNER ? undefined : key
                    };
                    this.columnExporting.emit(columnExportArgs);

                    column.header = columnExportArgs.header;
                    column.skip = columnExportArgs.cancel;
                    column.skipFormatter = columnExportArgs.skipFormatter;

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
        }

        const dataToExport = new Array<IExportRecord>();
        const actualData = records.map(r => r.data);
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
                this._ownersMap.get(DEFAULT_OWNER).columns :
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

    private prepareData(grid: IgxGridBaseDirective) {
        this.flatRecords = [];
        const tagName = grid.nativeElement.tagName.toLowerCase();

        const hasFiltering = (grid.filteringExpressionsTree && grid.filteringExpressionsTree.filteringOperands.length > 0) ||
                (grid.advancedFilteringExpressionsTree && grid.advancedFilteringExpressionsTree.filteringOperands.length > 0);

        const hasSorting = grid.sortingExpressions &&
            grid.sortingExpressions.length > 0;

        if (tagName === 'igx-hierarchical-grid') {
            this.prepareHierarchicalGridData(grid as IgxHierarchicalGridComponent, hasFiltering, hasSorting);
        } else {
            if (tagName === 'igx-grid') {
                this.prepareGridData(grid as IgxGridComponent, hasFiltering, hasSorting);
            }

            if (tagName === 'igx-tree-grid') {
                this.prepareTreeGridData(grid as IgxTreeGridComponent, hasFiltering, hasSorting);
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
                };

                filteringState.strategy = grid.filterStrategy;

                data = DataUtil.filter(data, filteringState, grid);
            }

            if (hasSorting && !this.options.ignoreSorting) {
                this._sort = cloneValue(grid.sortingExpressions[0]);

                data = DataUtil.treeGridSort(data, grid.sortingExpressions, grid.sortStrategy);
            }

            this.addHierarchicalGridData(grid, data);
        }
    }

    private addHierarchicalGridData(grid: IgxHierarchicalGridComponent, records: any[]) {
        const childLayoutKeys = grid.childLayoutKeys;
        const childGrids = grid.hgridAPI.getChildGrids(true);
        const columnFields = this._ownersMap.get(grid).columns.map(col => col.field);

        for(const entry of records) {
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

            for (const key of childLayoutKeys) {
                const island = grid.childLayoutList.filter(l => l.key === key)[0];
                const islandGrid = childGrids.filter(g => g.key === island.key && g.data === entry[key])[0];

                const keyRecordData = this.prepareIslandData(islandGrid, entry[key]) || [];

                this.getAllChildColumnsAndData(island, keyRecordData, expansionStateVal, childGrids, grid);
            }
        }
    }

    private prepareIslandData(islandGrid: IgxHierarchicalGridComponent, data: any): any {
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
                        };

                        filteringState.strategy = islandGrid.filterStrategy;

                        data = DataUtil.filter(data, filteringState, islandGrid);
                    }

                    if (hasSorting && !this.options.ignoreSorting) {
                        this._sort = cloneValue(islandGrid.sortingExpressions[0]);

                        data = DataUtil.treeGridSort(data, islandGrid.sortingExpressions, islandGrid.sortStrategy);
                    }
                }
        }

        return data;
    }

    private getAllChildColumnsAndData(island: IgxRowIslandComponent,
        childData: any, expansionStateVal: boolean, childGrids: any, grid: any) {
        const islandColumnList = island.childColumns.toArray();
        const modifiedColumns = this.getColumns(islandColumnList);

        const headerRecord: IExportRecord = {
            data: modifiedColumns.colList,
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
                    const islandGrid = childGrids.filter(g => g.key === island.key && g.data.some(d => d === rec))[0];

                    const islandExpansionStateVal = islandGrid === undefined ?
                        false :
                        islandGrid.expansionStates.has(rec) ?
                            islandGrid.expansionStates.get(rec) :
                            false;

                    for (const childIsland of island.children) {
                        const childIslandGrid = childGrids.filter(g => g.key === childIsland.key && g.data === rec[childIsland.key])[0];
                        const keyRecordData = this.prepareIslandData(childIslandGrid, rec[childIsland.key]) || [];

                        this.getAllChildColumnsAndData(childIsland, keyRecordData, islandExpansionStateVal, childGrids, grid);
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
                };
                filteringState.strategy = grid.filterStrategy;
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
                };

                filteringState.strategy = (grid.filterStrategy) ? grid.filterStrategy : new TreeGridFilteringStrategy();

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

        const firstCol = this._ownersMap.get(grid).columns[0].field;

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
                owner: grid
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
                        owner: grid
                    };

                    this.flatRecords.push(currentRecord);
                }
            }
        }
    }

    private getColumns(columns: any): any {
        const colList = new Array<any>(columns.length);
        const colWidthList = new Array<any>(columns.filter(c => !c.hidden).length);
        const hiddenColumns = [];
        let indexOfLastPinnedColumn = -1;
        let lastVisibleColumnIndex = -1;

        columns.forEach((column, i) => {
            const columnHeader = !ExportUtilities.isNullOrWhitespaces(column.header) ? column.header : column.field;
            const exportColumn = !column.hidden || this.options.ignoreColumnsVisibility;
            const index = this.options.ignoreColumnsOrder || this.options.ignoreColumnsVisibility ? column.index : column.visibleIndex;
            const columnWidth = Number(column.width?.slice(0, -2)) || DEFAULT_COLUMN_WIDTH;

            const columnInfo = {
                header: columnHeader,
                dataType: column.dataType,
                field: column.field,
                skip: !exportColumn,
                formatter: column.formatter,
                skipFormatter: false
            };

            if (index !== -1) {
                colList[index] = columnInfo;
                colWidthList[index] = columnWidth;
                lastVisibleColumnIndex = Math.max(lastVisibleColumnIndex, index);
            } else {
                hiddenColumns.push(columnInfo);
            }

            if (column.pinned && exportColumn) {
                indexOfLastPinnedColumn++;
            }
        });

        // Append the hidden columns to the end of the list
        hiddenColumns.forEach((hiddenColumn) => {
            colList[++lastVisibleColumnIndex] = hiddenColumn;
        });

        const result = {
            colList,
            colWidthList,
            indexOfLastPinnedColumn
        };

        return result;
    }

    private mapHierarchicalGridColumns(island: IgxRowIslandComponent) {
        const islandColumnList = island.childColumns.toArray();
        const colDefinitions = this.getColumns(islandColumnList);

        const mapRecord: IMapRecord = {
            columns: colDefinitions.colList,
            columnWidths: colDefinitions.colWidthList,
            indexOfLastPinnedColumn: colDefinitions.indexOfLastPinnedColumn,
        };

        this._ownersMap.set(island, mapRecord);

        if (island.children.length > 0) {
            for (const childIsland of island.children) {
                this.mapHierarchicalGridColumns(childIsland);
            }
        }
    }

    private resetDefaults() {
        this._sort = null;
        this.flatRecords = [];
        this._ownersMap.clear();
    }

    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;
}
