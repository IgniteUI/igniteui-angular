import { ExportUtilities } from "../exporter-common/export-utilities";
import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { WorksheetDataDictionary } from "./worksheet-data-dictionary";

export class WorksheetData {
    private _columnCount: number;
    private _rowCount: number;
    private _dataDictionary: WorksheetDataDictionary;
    private _keys: string[];
    private _isStringData: boolean;

    constructor(private _data: any[], public options: IgxExcelExporterOptions) {
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
        return !this.data || this.data.length === 0;
    }

    public get keys(): string[] {
        return this._keys;
    }

    public get isStringData(): boolean {
        return this._isStringData;
    }

    public get dataDictionary() {
        return this._dataDictionary;
    }

    private initializeData() {
        if (!this._data || this._data.length === 0) {
            return;
        }

        const dataEntry = this._data[0];
        this._isStringData = typeof dataEntry === "string";

        this._keys = ExportUtilities.getKeysFromData(this._data);

        if (this._keys.length === 0) {
            return;
        }

        this._columnCount = this._keys.length;
        this._rowCount = this._data.length + 1;

        this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);
    }
}
