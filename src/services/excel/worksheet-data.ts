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

	public get columnCount(): number{
		return this._columnCount;
	}

	public get rowCount(): number{
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
		return !this.cachedValues || this.cachedValues.length === 0
	}

	public get cachedValues() {
		return this._values;
	}

	public get dataDictionary() {
		return this._dataDictionary;
	}

	private prepareData() {
		if(!this._data || this._data.length === 0) {
			return;
		}

		var dataEntry = this._data[0];

		if(typeof dataEntry === "string") {
			this.prepareStringData();
			return;
		}

		var keys = Object.keys(dataEntry);
		if(keys.length === 0) {
			return;
		}

		this._columnCount = keys.length;
		this._rowCount = this._data.length + 1;

		this._values = new Array<number>(this._columnCount * this._rowCount);

		this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);

		for(let i = 0; i < keys.length; i++) {
			this._values[i] = this._dataDictionary.saveValue(keys[i], i);
		}

		for (let i = 0; i < this._data.length; i++) {
			const element = this._data[i];

			for(let j = 0; j < keys.length; j++) {
				const key = keys[j];
				const value = String(element[key]);
				const index = ((i + 1) * this._columnCount) + j;
				this._values[index] = this._dataDictionary.saveValue(value, j);
			}
		}
	}

	// TODO Try to find a way to not have two paths.
	private prepareStringData(): void {
		this._columnCount = 1;
		this._rowCount = this._data.length + 1;

		this._values = new Array<number>(this._rowCount);
		this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.options.columnWidth);

		// Add default header
		this._values[0] = this._dataDictionary.saveValue("Column1", 0);

		for (let i = 0; i < this._data.length; i++) {
			this._values[i + 1] = this._dataDictionary.saveValue(this._data[i], 0);
		}
	}
}