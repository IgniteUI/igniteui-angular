import { EventEmitter } from '@angular/core';

import { cloneArray, cloneValue, IBaseEventArgs, resolveNestedPath, yieldingLoop } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';

import { ExportUtilities } from './export-utilities';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { ITreeGridRecord } from '../../grids/tree-grid/tree-grid.interfaces';
import { TreeGridFilteringStrategy } from '../../grids/tree-grid/tree-grid.filtering.pipe';
import { IGroupingState } from '../../data-operations/groupby-state.interface';
import { getHierarchy, isHierarchyMatch } from '../../data-operations/operations';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IFilteringState } from '../../data-operations/filtering-state.interface';

export interface IGridExportRecord {
    data: any;
    level?: number;
    hidden?: boolean;
}

/**
 * onRowExport event arguments
 * this.exporterService.onRowExport.subscribe((args: IRowExportingEventArgs) => {
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
 * onColumnExport event arguments
 * ```typescript
 * this.exporterService.onColumnExport.subscribe((args: IColumnExportingEventArgs) => {
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

const DEFAULT_COLUMN_WIDTH = 8.43;

export abstract class IgxBaseExporter {
    private _columnList: any[];
    private flatRecords: IGridExportRecord[] = [];
    private _columnWidthList: number[];

    //protected _isTreeGrid = false;
    //protected _isGroupedGrid = false;
    protected _indexOfLastPinnedColumn = -1;
    protected _sort = null;

    public onExportEnded = new EventEmitter<IBaseEventArgs>();

    /**
     * This event is emitted when a row is exported.
     * ```typescript
     * this.exporterService.onRowExport.subscribe((args: IRowExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxBaseExporter
     */
    public onRowExport = new EventEmitter<IRowExportingEventArgs>();

    /**
     * This event is emitted when a column is exported.
     * ```typescript
     * this.exporterService.onColumnExport.subscribe((args: IColumnExportingEventArgs) => {
     * // put event handler code here
     * });
     * ```
     * @memberof IgxBaseExporter
     */
    public onColumnExport = new EventEmitter<IColumnExportingEventArgs>();

    public get columnWidthList() {
        return this._columnWidthList;
    }

    /**
     * Method for exporting IgxGrid component's data.
     * ```typescript
     * this.exporterService.export(this.igxGridForExport, this.exportOptions);
     * ```
     * @memberof IgxBaseExporter
     */
    public export(grid: any, options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        const columns = grid.columnList.toArray();
        this._columnList = new Array<any>(columns.length);
        this._columnWidthList = new Array<any>(columns.filter(c => !c.hidden).length);

        const hiddenColumns = [];
        let lastVisibleColumnIndex = -1;

        columns.forEach((column) => {
            const columnHeader = column.header !== '' ? column.header : column.field;
            const exportColumn = !column.hidden || options.ignoreColumnsVisibility;
            const index = options.ignoreColumnsOrder ? column.index : column.visibleIndex;
            const columnWidth = Number(column.width.slice(0, -2));

            const columnInfo = {
                header: columnHeader,
                dataType: column.dataType,
                field: column.field,
                skip: !exportColumn,
                formatter: column.formatter,
                skipFormatter: false
            };

            if (index !== -1) {
                this._columnList[index] = columnInfo;
                this._columnWidthList[index] = columnWidth;
                lastVisibleColumnIndex = Math.max(lastVisibleColumnIndex, index);
            } else {
                hiddenColumns.push(columnInfo);
            }

            if (column.pinned && exportColumn) {
                this._indexOfLastPinnedColumn++;
            }
        });

        // Append the hidden columns to the end of the list
        hiddenColumns.forEach((hiddenColumn) => {
            this._columnList[++lastVisibleColumnIndex] = hiddenColumn;
        });

        const data: IGridExportRecord[] = this.prepareData(grid, options);
        this.exportGridRecordsData(data, options);
    }

    /**
     * Method for exporting any kind of array data.
     * ```typescript
     * this.exporterService.exportData(this.arrayForExport, this.exportOptions);
     * ```
     * @memberof IgxBaseExporter
     */
    public exportData(data: any[], options: IgxExporterOptionsBase): void {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        const records = data.map(d => {
            const record: IGridExportRecord = {
                data: d
            };

            return record;
        });

        this.exportGridRecordsData(records, options);
    }

    private exportGridRecordsData(records: IGridExportRecord[], options: IgxExporterOptionsBase) {
        if (options === undefined || options === null) {
            throw Error('No options provided!');
        }

        if (!this._columnList || this._columnList.length === 0) {
            const keys = ExportUtilities.getKeysFromData(records);
            this._columnList = keys.map((k) => ({ header: k, field: k, skip: false }));
            this._columnWidthList = new Array<number>(keys.length).fill(DEFAULT_COLUMN_WIDTH);
        }

        let skippedPinnedColumnsCount = 0;
        let columnsWithoutHeaderCount = 1;
        this._columnList.forEach((column, index) => {
            if (!column.skip) {
                const columnExportArgs = {
                    header: ExportUtilities.isNullOrWhitespaces(column.header) ?
                        'Column' + columnsWithoutHeaderCount++ : column.header,
                    field: column.field,
                    columnIndex: index,
                    cancel: false,
                    skipFormatter: false
                };
                this.onColumnExport.emit(columnExportArgs);

                column.header = columnExportArgs.header;
                column.skip = columnExportArgs.cancel;
                column.skipFormatter = columnExportArgs.skipFormatter;

                if (column.skip && index <= this._indexOfLastPinnedColumn) {
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

        this._indexOfLastPinnedColumn -= skippedPinnedColumnsCount;

        const dataToExport = new Array<IGridExportRecord>();
        const isSpecialData = ExportUtilities.isSpecialData(records);

        yieldingLoop(records.length, 100, (i) => {
            const row = records[i];
            this.exportRow(dataToExport, row, i, isSpecialData);
        }, () => {
            this.exportDataImplementation(dataToExport, options);
            this.resetDefaults();
        });
    }

    protected abstract exportDataImplementation(data: IGridExportRecord[], options: IgxExporterOptionsBase): void;

    private exportRow(data: IGridExportRecord[], record: IGridExportRecord, index: number, isSpecialData: boolean) {
        if (!isSpecialData) {
            record.data = this._columnList.reduce((a, e) => {
                if (!e.skip && e.field in record.data) {
                    let rawValue = resolveNestedPath(record.data, e.field);

                    const shouldApplyFormatter = e.formatter && !e.skipFormatter;

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

        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push(record);
        }
    }

    private prepareData(grid: any, options: IgxExporterOptionsBase): any[] {
        this.flatRecords = [];
        const rootRecords = grid.rootRecords;
        const isTreeGrid = rootRecords !== undefined;
        const isGroupedGrid = grid.groupsRecords && grid.groupsRecords.length !== 0;
        const groupedGridGroupingState: IGroupingState = {
            expressions: grid.groupingExpressions,
            expansion: grid.groupingExpansionState,
            defaultExpanded: grid.groupsExpanded,
        };

        const skipOperations = !options.ignoreFiltering && !options.ignoreSorting && !options.ignoreGrouping;

        if (skipOperations) {
            if (isTreeGrid) {
                this.prepareTreeGridData(grid.processedRootRecords);
            } else if (isGroupedGrid) {
                this.prepareGroupedData(grid.groupsRecords, groupedGridGroupingState);
            } else {
                this.prepareFlatData(grid.filteredSortedData);
            }
        } else {
            const filter = ((grid.filteringExpressionsTree && grid.filteringExpressionsTree.filteringOperands.length > 0) ||
                (grid.advancedFilteringExpressionsTree && grid.advancedFilteringExpressionsTree.filteringOperands.length > 0)) &&
                !options.ignoreFiltering;

            const sort = grid.sortingExpressions &&
                (isGroupedGrid ? grid.sortingExpressions.length > 1 : grid.sortingExpressions.length > 0) &&
                !options.ignoreSorting;

            const group = isGroupedGrid && grid.groupingExpressions &&
                grid.groupingExpressions.length > 0 &&
                !options.ignoreGrouping;

            let gridData = isTreeGrid ? rootRecords : grid.data;

            if (filter) {
                const filteringState: IFilteringState = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                };

                if (isTreeGrid) {
                    filteringState.strategy = (grid.filterStrategy) ? grid.filterStrategy : new TreeGridFilteringStrategy();

                    gridData = filteringState.strategy
                        .filter(gridData, filteringState.expressionsTree, filteringState.advancedExpressionsTree);
                } else {
                    filteringState.strategy = grid.filterStrategy;
                    gridData = DataUtil.filter(gridData, filteringState, grid);
                }
            }

            if (sort) {
                this._sort = !isGroupedGrid ?
                    cloneValue(grid.sortingExpressions[0]) :
                    grid.sortingExpressions.length > 1 ?
                        cloneValue(grid.sortingExpressions[1]) :
                        cloneValue(grid.sortingExpressions[0]);

                if (isTreeGrid) {
                    gridData = DataUtil.treeGridSort(gridData, grid.sortingExpressions, grid.sortStrategy);
                } else {
                    gridData = DataUtil.sort(gridData, grid.sortingExpressions, grid.sortStrategy, grid);
                }
            }

            if (group) {
                const groupResult = DataUtil.group(cloneArray(gridData), groupedGridGroupingState, grid, grid.groupsRecords);
                gridData = this.resolveGroupedData(groupResult);
            }

            if (isTreeGrid) {
                this.prepareTreeGridData(gridData);
            } else if (isGroupedGrid && !options.ignoreGrouping) {
                this.prepareGroupedData(gridData, groupedGridGroupingState);
            } else {
                this.prepareFlatData(gridData);
            }
        }

        return this.flatRecords;
    }

    private resolveGroupedData(groupResult: any) {
        const result = [];

        const targetIndexes = groupResult.metadata.reduce((arr, currVal, currIndex) => {
            if (currVal === null) {
                arr.push(currIndex);
            }

            return arr;
        }, []);

        for (let i = 0; i < targetIndexes.length; i++) {
            result.push(groupResult.data[targetIndexes[i]]);
        }

        return result;
    }

    private prepareTreeGridData(records: ITreeGridRecord[], parentExpanded: boolean = true) {
        if (!records) {
            return;
        }
        for (let i = 0; i < records.length; i++) {
            const hierarchicalRecord: IGridExportRecord = {
                data: records[i].data,
                level: records[i].level,
                hidden: !parentExpanded,
            };

            this.flatRecords.push(hierarchicalRecord);
            this.prepareTreeGridData(records[i].children, parentExpanded && records[i].expanded);
        }
    }

    private prepareFlatData(records: any) {
        if (!records) {
            return;
        }
        for (let i = 0; i < records.length; i++) {
            const record: IGridExportRecord = {
                data: records[i]
            };

            this.flatRecords.push(record);
        }
    }

    private prepareGroupedData(records: any, groupingState: IGroupingState, parentExpanded: boolean = true) {
        if (!records) {
            return;
        }

        const firstCol = this._columnList[0].header;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            const hierarchy = getHierarchy(record);
            const expandState: IGroupByExpandState = groupingState.expansion.find((s) =>
                isHierarchyMatch(s.hierarchy || [{ fieldName: record.expression.fieldName, value: record.value }], hierarchy));
            const expanded = expandState ? expandState.expanded : groupingState.defaultExpanded;

            const groupExpression: IGridExportRecord = {
                data: { [firstCol]: `${record.expression.fieldName} - ${record.value}` },
                level: record.level,
                hidden: !parentExpanded
            };

            this.flatRecords.push(groupExpression);

            if (record.groups.length > 0) {
                this.prepareGroupedData(record.groups, groupingState, expanded && parentExpanded);
            } else {
                const rowRecords = record.records;

                for (let j = 0; j < rowRecords.length; j++) {
                    const currentRecord: IGridExportRecord = {
                        data: rowRecords[j],
                        level: record.level + 1,
                        hidden: !(expanded && parentExpanded)
                    };

                    this.flatRecords.push(currentRecord);
                }
            }
        }
    }

    private resetDefaults() {
        this._columnList = [];
        this._indexOfLastPinnedColumn = -1;
        this._sort = null;
        this.flatRecords = [];
    }
}
