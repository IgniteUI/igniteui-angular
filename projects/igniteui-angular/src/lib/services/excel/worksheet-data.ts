import { ExportHeaderType, ExportRecordType, IColumnList, IExportRecord } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _isSpecialData: boolean;
    private _hasMultiColumnHeader: boolean;
    private _hasMultiRowHeader: boolean;
    private _isHierarchical: boolean;
    private _hasSummaries: boolean;
    private _isPivotGrid: boolean;
    private _isTreeGrid: boolean;
    private _isGroupedGrid: boolean;

    constructor(private _data: IExportRecord[],
                public options: IgxExcelExporterOptions,
                public sort: any,
                public columnCount: number,
                public rootKeys: string[],
                public indexOfLastPinnedColumn: number,
                public columnWidths: number[],
                public owner: IColumnList,
                public owners: Map<any, IColumnList>) {
            this.initializeData();
    }

    public get data(): IExportRecord[] {
        return this._data;
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get isEmpty(): boolean {
        return !this.rowCount
            || this.rowCount === this.owner.maxLevel + 1
            || !this.columnCount
            || this.owner.columns.every(c => c.skip);
    }

    public get isSpecialData(): boolean {
        return this._isSpecialData;
    }

    public get dataDictionary(): WorksheetDataDictionary {
        return this._dataDictionary;
    }

    public get hasMultiColumnHeader(): boolean {
        return this._hasMultiColumnHeader;
    }

    public get hasSummaries(): boolean {
        return this._hasSummaries;
    }

    public get hasMultiRowHeader(): boolean {
        return this._hasMultiRowHeader;
    }

    public get isHierarchical(): boolean {
        return this._isHierarchical;
    }

    public get isTreeGrid(): boolean {
        return this._isTreeGrid;
    }

    public get isPivotGrid(): boolean {
        return this._isPivotGrid;
    }

    public get isGroupedGrid(): boolean {
        return this._data.some(d => d.type === ExportRecordType.GroupedRecord);
    }

    public get maxLevel(): number {
        return [...new Set(this._data.map(item => item.level))].sort((a,b) => (a > b ? -1 : 1))[0];
    }

    public get multiColumnHeaderRows(): number {
        return !this.options.ignoreMultiColumnHeaders ? Array.from(this.owners.values()).map(c => c.maxLevel).reduce((a,b) => a + b) : 0;
    }

    private initializeData() {
        this._dataDictionary = new WorksheetDataDictionary(this.columnCount, this.options.columnWidth, this.columnWidths);

        this._hasMultiColumnHeader = Array.from(this.owners.values())
            .some(o => o.columns.some(col => !col.skip && col.headerType === ExportHeaderType.MultiColumnHeader));

        this._hasMultiRowHeader = Array.from(this.owners.values())
            .some(o => o.columns.some(col => !col.skip && col.headerType === ExportHeaderType.MultiRowHeader));

        this._isHierarchical = this.data[0]?.type === ExportRecordType.HierarchicalGridRecord
            || !(typeof(Array.from(this.owners.keys())[0]) === 'string');

        this._hasSummaries = this._data.filter(d => d.type === ExportRecordType.SummaryRecord).length > 0;

        this._isTreeGrid = this._data.filter(d => d.type === ExportRecordType.TreeGridRecord).length > 0;

        this._isPivotGrid = this.data[0]?.type === ExportRecordType.PivotGridRecord;

        const exportMultiColumnHeaders = this._hasMultiColumnHeader && !this.options.ignoreMultiColumnHeaders;

        if (this._isHierarchical || exportMultiColumnHeaders || this._isPivotGrid) {
            this.options.exportAsTable = false;
        }

        if (!this._data || this._data.length === 0) {
            if (!this._isHierarchical) {
                this._rowCount = this.owner.maxLevel + 1;
            }

            return;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data[0].data);
        this._rowCount = this._data.length + this.multiColumnHeaderRows + 1;
    }
}
