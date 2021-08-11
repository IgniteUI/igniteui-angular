import { IColumnList, IExportRecord } from '../exporter-common/base-export-service';
import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _keys: string[];
    private _isSpecialData: boolean;

    constructor(private _data: IExportRecord[],
                public options: IgxExcelExporterOptions,
                public sort: any,
                public columnCount: number,
                public indexOfLastPinnedColumn: number,
                public columnWidths: number[],
                public owner: IColumnList) {
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
        return this._keys;
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

        const actualData = this._data.map(item => item.data);

        this._keys = ExportUtilities.getKeysFromData(actualData);
        if (this._keys.length === 0) {
            return;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(actualData);

        this._rowCount = this._data.length + 1;

        this._dataDictionary = new WorksheetDataDictionary(this.columnCount, this.options.columnWidth, this.columnWidths);
    }
}
