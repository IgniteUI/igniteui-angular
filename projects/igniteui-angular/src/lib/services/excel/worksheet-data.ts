import { HeaderType, ExportRecordType, IColumnList, IExportRecord } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _isSpecialData: boolean;
    private _hasMultiColumnHeader: boolean;
    private _isHierarchical: boolean;

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

    public get isHierarchical(): boolean {
        return this._isHierarchical;
    }

    private initializeData() {
        this._dataDictionary = new WorksheetDataDictionary(this.columnCount, this.options.columnWidth, this.columnWidths);

        this._hasMultiColumnHeader = Array.from(this.owners.values())
            .some(o => o.columns.some(col => !col.skip && col.headerType === HeaderType.MultiColumnHeader));

        this._isHierarchical = this.data[0]?.type === ExportRecordType.HierarchicalGridRecord
            || !(typeof(Array.from(this.owners.keys())[0]) === 'string');

        if (this._isHierarchical || (this._hasMultiColumnHeader && !this.options.ignoreMultiColumnHeaders)) {
            this.options.exportAsTable = false;
        }

        if (!this._data || this._data.length === 0) {
            if (!this._isHierarchical) {
                this._rowCount = this.owner.maxLevel + 1;
            }

            return;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data[0].data);
        this._rowCount = this._data.length + 1;
    }
}
