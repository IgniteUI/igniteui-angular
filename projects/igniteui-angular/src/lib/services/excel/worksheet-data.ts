import { HeaderType, ExportRecordType, IColumnList, IExportRecord } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _isSpecialData: boolean;

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
        return !this.rowCount || !this.columnCount || this.owner.columns.every(c => c.skip);
    }

    public get isSpecialData(): boolean {
        return this._isSpecialData;
    }

    public get dataDictionary(): WorksheetDataDictionary {
        return this._dataDictionary;
    }

    private initializeData() {
        if (!this._data || this._data.length === 0) {
            return;
        }

        const isMultiColumnHeader = this.owner.columns.some(col => !col.skip && col.headerType === HeaderType.MultiColumnHeader);
        const hasHierarchicalGridRecord = this._data[0].type === ExportRecordType.HierarchicalGridRecord;

        if (hasHierarchicalGridRecord || (isMultiColumnHeader && !this.options.ignoreMultiColumnHeaders)) {
            this.options.exportAsTable = false;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(this._data[0].data);
        this._rowCount = this._data.length + 1;
        this._dataDictionary = new WorksheetDataDictionary(this.columnCount, this.options.columnWidth, this.columnWidths);
    }
}
