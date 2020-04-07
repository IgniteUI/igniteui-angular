import { ExportUtilities } from '../exporter-common/export-utilities';
import { IgxExcelExporterOptions } from './excel-exporter-options';
import { WorksheetDataDictionary } from './worksheet-data-dictionary';

/** @hidden */
export class WorksheetData {
    private _columnCount: number;
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _keys: string[];
    private _isSpecialData: boolean;

    constructor(private _data: any[], public options: IgxExcelExporterOptions, public indexOfLastPinnedColumn,
                public sort: any, public isTreeGridData = false) {
        this.initializeData();
    }

    public get data() {
        return this._data;
    }

    public get columnCount(): number {
        return this._columnCount;
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get isEmpty() {
        return !this.rowCount || !this._columnCount;
    }

    public get keys(): string[] {
        return this._keys;
    }

    public get isSpecialData(): boolean {
        return this._isSpecialData;
    }

    public get dataDictionary() {
        return this._dataDictionary;
    }

    private initializeData() {
        if (!this._data || this._data.length === 0) {
            return;
        }

        const actualData = this._data.map((item) => item.rowData);

        this._keys = ExportUtilities.getKeysFromData(actualData);
        if (this._keys.length === 0) {
            return;
        }

        this._isSpecialData = ExportUtilities.isSpecialData(actualData);

        this._columnCount = this._keys.length;
        this._rowCount = this._data.length + 1;

        this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);
    }
}
