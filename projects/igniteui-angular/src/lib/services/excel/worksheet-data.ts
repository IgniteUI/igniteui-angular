import { ExportRecordType, IExportRecord, IMapRecord } from '../exporter-common/base-export-service';
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
                public maxColumnSize: number) {
            this.initializeData();
    }

    public get data(): IExportRecord[] {
        return this._data;
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get isEmpty(): boolean {
        return !this.rowCount || !this.columnCount;
    }

    public get keys(): string[] {
        return this.rootKeys;
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
        debugger
        const actualData = this._data.filter(item => item.type !== ExportRecordType.HeaderRecord).map(item => item.data);

        if (this._data[0].type === ExportRecordType.HierarchicalGridRecord) {
            this.options.exportAsTable = false;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(actualData);
        this._rowCount = this._data.length + 1;
        this._dataDictionary = new WorksheetDataDictionary(this.columnCount, this.options.columnWidth, this.columnWidths);
    }
}
