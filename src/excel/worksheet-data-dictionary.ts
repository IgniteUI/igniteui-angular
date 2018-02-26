export class WorksheetDataDictionary {
	private _dictionary = {};
	private _sortedKeys: string[];
	private _sortedKeysIsValid = false;
	private _index = 0;

	public saveValue(value: string): void {
		const sanitizedValue = this.santizieValue(value);

		if(this._dictionary[sanitizedValue] === undefined) {
			this._dictionary[sanitizedValue] = this._index++;
			this._sortedKeysIsValid = false;
		}
	}

	public getValue(value: string): number{
		var sanitizedValue = this.santizieValue(value);
		return this._dictionary[sanitizedValue];
	}

	public clearValues() {
		this._dictionary = {};
		this._index = 0;
		this._sortedKeysIsValid = false;
	}

	public getSortedValues(): string[] {
		if(!this._sortedKeysIsValid) {
			this._sortedKeys = Object.keys(this._dictionary).sort((a, b) => this._dictionary[a] > this._dictionary[b] ? 1 : -1);
			this._sortedKeysIsValid = true;
		}
		return this._sortedKeys;
	}

	private santizieValue(value: string): string {
		return value.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&apos;");
	}
}