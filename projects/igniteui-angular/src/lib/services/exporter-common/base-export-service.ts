import { EventEmitter } from '@angular/core';

import { cloneValue, IBaseEventArgs, resolveNestedPath, yieldingLoop } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';

import { ExportUtilities } from './export-utilities';
import { IgxExporterOptionsBase } from './exporter-options-base';
import { ITreeGridRecord } from '../../grids/tree-grid/tree-grid.interfaces';
import { TreeGridFilteringStrategy } from '../../grids/tree-grid/tree-grid.filtering.pipe';
import { IGroupingState } from '../../data-operations/groupby-state.interface';

export interface IGridExportRecord {
    data: string | {};
    level?: number;
    expanded?: boolean;
    isExpression?: boolean;
    parent?: ITreeGridRecord;
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

    protected _isTreeGrid = false;
    protected _isGroupedGrid = false;
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

        const data = this.prepareData(grid, options);
        this.exportData(data, options);
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

        if (!this._columnList || this._columnList.length === 0) {
            const keys = ExportUtilities.getKeysFromData(data);
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

        const dataToExport = new Array<any>();
        const isSpecialData = ExportUtilities.isSpecialData(data);

        yieldingLoop(data.length, 100, (i) => {
            const row = data[i];
            this.exportRow(dataToExport, row, i, isSpecialData);
        }, () => {
            this.exportDataImplementation(dataToExport, options);
            this.resetDefaults();
        });
    }

    protected abstract exportDataImplementation(data: any[], options: IgxExporterOptionsBase): void;

    private exportRow(data: any[], rowData: any, index: number, isSpecialData: boolean) {
        let row;

        if (!isSpecialData && !rowData.isExpression) {
            row = this._columnList.reduce((a, e) => {
                if (!e.skip) {
                    let rawValue = resolveNestedPath(rowData.data, e.field);

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
        } else {
            row = rowData.data;
        }

        const rowArgs = {
            rowData: row,
            rowIndex: index,
            cancel: false
        };
        this.onRowExport.emit(rowArgs);

        if (!rowArgs.cancel) {
            data.push({ rowData: rowArgs.rowData, originalRowData: rowData });
        }
    }

    private prepareData(grid: any, options: IgxExporterOptionsBase): any[] {
        this.flatRecords = [];
        let rootRecords = grid.rootRecords;
        let groupedGridGroupingState = {} as IGroupingState;

        this._isTreeGrid = rootRecords !== undefined;
        this._isGroupedGrid = grid.groupsRecords && grid.groupsRecords.length !== 0;

        if (this._isTreeGrid) {
            this.prepareHierarchicalData(rootRecords);
        } else if (this._isGroupedGrid) {
            groupedGridGroupingState = {
                expressions: grid.groupingExpressions,
                expansion: grid.groupingExpansionState,
                defaultExpanded: grid.groupsExpanded,
            };
            debugger
            this.prepareGroupedData(grid.groupsRecords);
        } else {
            this.prepareFlatData(grid.data);
        }

        if (!this._isGroupedGrid) {
            if (((grid.filteringExpressionsTree &&
                grid.filteringExpressionsTree.filteringOperands.length > 0) ||
                (grid.advancedFilteringExpressionsTree &&
                grid.advancedFilteringExpressionsTree.filteringOperands.length > 0)) &&
                !options.ignoreFiltering) {
                const filteringState: any = {
                    expressionsTree: grid.filteringExpressionsTree,
                    advancedExpressionsTree: grid.advancedFilteringExpressionsTree,
                    logic: grid.filteringLogic
                };

                if (this._isTreeGrid) {
                    this.flatRecords = [];
                    filteringState.strategy = (grid.filterStrategy) ? grid.filterStrategy : new TreeGridFilteringStrategy();
                    rootRecords = filteringState.strategy.filter(rootRecords,
                        filteringState.expressionsTree, filteringState.advancedExpressionsTree);
                    this.prepareHierarchicalData(rootRecords);
                } else {
                    filteringState.strategy = grid.filterStrategy;

                    if (this._isGroupedGrid) {
                        grid.groupsRecords = DataUtil.filter(grid.groupsRecords, filteringState, grid);
                        grid.groupsRecords = DataUtil.group(grid.groupsRecords, groupedGridGroupingState);
                        this.prepareGroupedData(grid.groupsRecords);
                    } else {
                        this.flatRecords = DataUtil.filter(this.flatRecords, filteringState, grid);
                    }
                }
            }

            if (grid.sortingExpressions &&
                grid.sortingExpressions.length > 0 &&
                !options.ignoreSorting) {
                this._sort = cloneValue(grid.sortingExpressions[0]);

                if (this._isTreeGrid) {
                    this.flatRecords = [];
                    rootRecords = DataUtil.treeGridSort(rootRecords, grid.sortingExpressions, grid.sortStrategy);
                    this.prepareHierarchicalData(rootRecords);
                } else if (this._isGroupedGrid) {
                    grid.groupsRecords = DataUtil.sort(grid.groupsRecords, grid.sortingExpressions, grid.sortStrategy, grid);
                    grid.groupsRecords = DataUtil.group(grid.groupsRecords, groupedGridGroupingState);
                    this.prepareGroupedData(grid.groupsRecords);
                } else {
                    this.flatRecords = DataUtil.sort(this.flatRecords, grid.sortingExpressions, grid.sortStrategy, grid);
                }
            }

            if (grid.groupingExpressions &&
                grid.groupingExpressions.length > 0 &&
                !grid.ignoreGrouping) {
                grid.groupsRecords = DataUtil.group(grid.groupsRecords, groupedGridGroupingState);
                this.prepareGroupedData(grid.groupsRecords);
            }
        }

        return this.flatRecords;
    }

    private prepareHierarchicalData(records: ITreeGridRecord[]) {
        if (!records) {
            return;
        }
        for (let i = 0; i < records.length; i++) {
            const hierarchicalRecord: IGridExportRecord = {
                data: records[i].data,
                level: records[i].level,
                parent: records[i].parent,
                expanded: records[i].expanded,
            };

            this.flatRecords.push(hierarchicalRecord);
            this.prepareHierarchicalData(records[i].children);
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

    private prepareGroupedData(records: any) {
        if (!records) {
            return;
        }

        const firstCol = this._columnList[0].header;

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            const groupExpression: IGridExportRecord = {
                data: { [firstCol]: `${record.expression.fieldName} - ${record.value}` },
                level: record.level,
                isExpression: true
            };

            this.flatRecords.push(groupExpression);

            if (record.groups.length > 0) {
                this.prepareGroupedData(record.groups);
            } else {
                const rowRecords = record.records;

                for (let j = 0; j < rowRecords.length; j++) {
                    const currentRecord: IGridExportRecord = {
                        data: rowRecords[j],
                        level: record.level + 1,
                        //isExpression: false,
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
