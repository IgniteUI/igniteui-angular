import { IgxExcelExporterOptions } from "./excel-exporter-options";
import { WorksheetDataDictionary } from "./worksheet-data-dictionary";

export class WorksheetData {
    private _columnCount: number;
    private _rowCount: number;
    private _values: number[];
    private _dataDictionary: WorksheetDataDictionary;

    constructor(private _data: any[], public options: IgxExcelExporterOptions) {
        this.prepareData();
    }

    public get columnCount(): number {
        return this._columnCount;
    }

    public get rowCount(): number {
        return this._rowCount;
    }

    public get data() {
        return this._data;
    }
    public set data(value: any[]) {
        this._data = value;

        this.prepareData();
    }

    public get isEmpty() {
        return !this.cachedValues || this.cachedValues.length === 0;
    }

    public get cachedValues() {
        return this._values;
    }

    public get dataDictionary() {
        return this._dataDictionary;
    }

    private prepareData() {
        if (!this._data || this._data.length === 0) {
            return;
        }

        const dataEntry = this._data[0];
        const exportStringData = typeof dataEntry === "string";

        const keys = exportStringData ? ["Column 1"] : Object.keys(dataEntry);

        if (keys.length === 0) {
            return;
        }

        this._columnCount = exportStringData ? 1 : keys.length;
        this._rowCount = this._data.length + 1;

        this._values = new Array<number>(this._columnCount * this._rowCount);

        this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);

        for (let i = 0; i < this._columnCount; i++) {
            this._values[i] = this._dataDictionary.saveValue(keys[i], i);
        }

        for (let i = 0; i < this._data.length ; i++) {
            const element = this._data[i];

            for (let j = 0; j < this._columnCount; j++) {
                const key = keys[j];

                let value = "";
                if (exportStringData) {
                    value = element;
                } else if (element[key] !== undefined && element[key] !== null) {
                    value = String(element[key]);
                }

                const index = ((i + 1) * this._columnCount) + j;
                this._values[index] = this._dataDictionary.saveValue(value, j);
            }
        }
    }
}
