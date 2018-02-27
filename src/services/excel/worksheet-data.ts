import { WorksheetDataDictionary } from "./worksheet-data-dictionary";

export class WorksheetData {
	private _columnCount: number;
	private _rowCount: number;
	private _data: any[];
	private _values: number[];
	private _dataDictionary: WorksheetDataDictionary;

	public calculateSizeMetrics = false;

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

	private get calculateSizeMetricsResolved(): boolean {
		return this.calculateSizeMetrics;
	}

	private prepareData() {
		if(!this._data || this._data.length === 0) {
			return;
		}

		var keys = Object.keys(this._data[0]);
		if(keys.length === 0) {
			return;
		}

		this._columnCount = keys.length;
		this._rowCount = this._data.length + 1;

		this._values = new Array<number>(this._columnCount * this._rowCount);

		this._dataDictionary = new WorksheetDataDictionary(this._columnCount, this.calculateSizeMetricsResolved);

		for(let i = 0; i < keys.length; i++) {
			this._dataDictionary.saveValue(keys[i], i);
			this._values[i] = this._dataDictionary.getValue(keys[i]);
		}

		for (let i = 0; i < this._data.length; i++) {
			const element = this._data[i];

			for(let j = 0; j < keys.length; j++) {
				const key = keys[j];
				const value = String(element[key]);
				const index = ((i + 1) * this._columnCount) + j;
				this._dataDictionary.saveValue(value, j);
				this._values[index] = this._dataDictionary.getValue(value);
			}
		}
	}
}